import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type CancelledBooking = {
  id: string;
  customer_name: string;
  services: any[];
  cancellation_fee: number;
  cancellation_reason: string;
  cancelled_at: string;
  booking_date: string;
};

export default function CancellationsScreen() {
  const router = useRouter();

  const [data, setData] = useState<CancelledBooking[]>([]);
  const [totalFee, setTotalFee] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCancelledData = async () => {
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;

      if (!email) {
        setLoading(false);
        return;
      }

      // 1. Try staff_cancellations table
      const { data: cancelLogs, error: logError } = await supabase
        .from("staff_cancellations")
        .select("*")
        .eq("staff_email", email)
        .order("cancelled_at", { ascending: false });

      if (!logError && cancelLogs && cancelLogs.length > 0) {
        const list: CancelledBooking[] = cancelLogs.map((item) => ({
          id: item.id,
          customer_name: item.customer_name || "Customer",
          services: [],
          cancellation_fee: Number(item.cancellation_fee || 99),
          cancellation_reason: item.cancellation_reason || "Partner Cancelled",
          cancelled_at: item.cancelled_at,
          booking_date: item.cancelled_at,
        }));

        setData(list);
        const sum = list.reduce((acc, item) => acc + item.cancellation_fee, 0);
        setTotalFee(sum);
        setLoading(false);
        return;
      }

      // 2. Fallback: query bookings table where work_status = CANCELLED
      const { data: cancelledBookings, error: bookError } = await supabase
        .from("bookings")
        .select("id, customer_name, services, work_ended_at, booking_date")
        .eq("assigned_staff_email", email)
        .eq("work_status", "CANCELLED");

      if (bookError) {
        console.log("Error querying cancelled bookings fallback:", bookError);
      }

      const fallbackList: CancelledBooking[] = (cancelledBookings || []).map(
        (item) => ({
          id: item.id,
          customer_name: item.customer_name || "Customer",
          services: item.services || [],
          cancellation_fee: 99,
          cancellation_reason: "Partner Cancelled",
          cancelled_at:
            item.work_ended_at || item.booking_date || new Date().toISOString(),
          booking_date: item.booking_date,
        })
      );

      setData(fallbackList);
      setTotalFee(fallbackList.length * 99);
    } catch (err) {
      console.log("Unexpected error in fetchCancelledData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCancelledData();
    }, [])
  );

  const generatePDF = async () => {
    try {
      const rows = data
        .map(
          (item) => `
        <tr>
          <td>${item.customer_name}</td>
          <td>${item.cancellation_reason}</td>
          <td>₹${item.cancellation_fee}</td>
          <td>${dayjs(item.cancelled_at).format("DD MMM YYYY")}</td>
        </tr>
      `
        )
        .join("");

      const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center; color: #b91c1c;">
            Cancellation Report
          </h1>

          <h2 style="color: #991b1b;">Total Cancellation Fee: ₹${totalFee}</h2>

          <table
            width="100%"
            border="1"
            cellspacing="0"
            cellpadding="8"
            style="border-collapse: collapse; margin-top: 20px;"
          >
            <thead>
              <tr style="background-color:#fee2e2; color: #991b1b;">
                <th>Customer</th>
                <th>Reason</th>
                <th>Fee Charged</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Cancellation Report",
      });
    } catch (error) {
      console.log("PDF ERROR:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/my-role")}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/dashboard")
          }
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* TOTAL CANCELLATION FEE */}
        <Text style={styles.totalText}>Total Cancellation Fee: ₹{totalFee}</Text>

        {/* LIST */}
        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        ) : data.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 40, color: "gray" }}>
            No cancelled services
          </Text>
        ) : (
          data.map((item, i) => (
            <View key={item.id || i} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.customerName}>{item.customer_name}</Text>
                <Text style={styles.feeText}>Fee: ₹{item.cancellation_fee}</Text>
              </View>

              {item.services && item.services.length > 0 && (
                <View style={styles.servicesBox}>
                  {item.services.map((s: any, idx: number) => (
                    <Text key={idx} style={styles.serviceItem}>
                      • {s.title || s.name || s}
                    </Text>
                  ))}
                </View>
              )}

              <Text style={styles.reasonText}>
                <Text style={{ fontWeight: "700" }}>Reason:</Text>{" "}
                {item.cancellation_reason}
              </Text>

              <Text style={styles.dateText}>
                Cancelled on: {dayjs(item.cancelled_at).format("DD MMM YYYY, hh:mm A")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {data.length > 0 && (
        <TouchableOpacity
          style={styles.floatingDownloadBtn}
          onPress={generatePDF}
        >
          <Ionicons name="download-outline" size={26} color="#991b1b" />
          <Text style={styles.floatingDownloadText}>Download Report</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  logo: {
    width: 190,
    height: 64,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#b91c1c",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  customerName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  feeText: {
    fontWeight: "800",
    fontSize: 16,
    color: "#dc2626",
  },
  servicesBox: {
    marginVertical: 4,
  },
  serviceItem: {
    fontSize: 13,
    color: "#4b5563",
  },
  reasonText: {
    fontSize: 14,
    color: "#991b1b",
    marginTop: 6,
  },
  dateText: {
    color: "gray",
    fontSize: 12,
    marginTop: 6,
  },
  floatingDownloadBtn: {
    position: "absolute",
    bottom: 90,
    right: 16,
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 5,
  },
  floatingDownloadText: {
    marginLeft: 6,
    fontWeight: "700",
    color: "#991b1b",
    fontSize: 13,
  },
});
