import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

type Booking = {
  id?: string;
  Customer_Name: string;
  AMOUNT: number;
  earned_at: string;
};

export default function PendingPayments() {
  const router = useRouter();

  const [data, setData] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingData = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      setLoading(false);
      return;
    }

    const { data: completedBookings } = await supabase
      .from("bookings")
      .select("id, customer_name, staff_earned_amount, work_ended_at")
      .eq("assigned_staff_email", email)
      .eq("work_status", "COMPLETED")
      .order("work_ended_at", { ascending: false });

    const bookingIds = (completedBookings || []).map((b) => b.id);
    let paymentMap: Record<string, string> = {};

    if (bookingIds.length > 0) {
      const { data: earningsData } = await supabase
        .from("staff_earnings")
        .select("booking_id, payment_status")
        .in("booking_id", bookingIds);

      earningsData?.forEach((e) => {
        if (e.booking_id) paymentMap[e.booking_id] = e.payment_status;
      });
    }

    const pendingList: Booking[] = (completedBookings || [])
      .map((item) => ({
        id: item.id,
        Customer_Name: item.customer_name || "Customer",
        AMOUNT: Number(item.staff_earned_amount || 0),
        earned_at: item.work_ended_at,
        payment_status: paymentMap[item.id] || "pending",
      }))
      .filter((item) => item.payment_status?.toLowerCase() !== "paid");

    setData(pendingList);

    const sum = pendingList.reduce(
      (acc: number, item: Booking) => acc + Number(item.AMOUNT || 0),
      0
    );

    setTotal(sum);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const generatePDF = async () => {
    try {
      const rows = data
        .map(
          (item) => `
        <tr>
          <td>${item.Customer_Name}</td>
          <td>₹${item.AMOUNT}</td>
          <td>${dayjs(item.earned_at).format("DD MMM YYYY")}</td>
        </tr>
      `
        )
        .join("");

      const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center;">
            Pending Payments Report
          </h1>

          <h2>Total Pending: ₹${total}</h2>

          <table
            width="100%"
            border="1"
            cellspacing="0"
            cellpadding="8"
            style="border-collapse: collapse; margin-top: 20px;"
          >
            <thead>
              <tr style="background-color:#f2f2f2;">
                <th>Customer</th>
                <th>Amount</th>
                <th>Completed Date</th>
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
        dialogTitle: "Pending Payments Report",
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
        {/* TOTAL PENDING */}
        <Text style={styles.totalText}>Total Pending: ₹{total}</Text>

        {/* LIST */}
        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        ) : data.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 40, color: "gray" }}>
            No pending payments
          </Text>
        ) : (
          data.map((item, i) => (
            <View
              key={item.id || `${item.Customer_Name}-${item.earned_at}-${i}`}
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <Text style={styles.customerName}>{item.Customer_Name}</Text>
                <Text style={styles.amount}>₹{item.AMOUNT}</Text>
              </View>

              <Text style={styles.date}>
                {dayjs(item.earned_at).format("DD MMM YYYY")}
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
          <Ionicons name="download-outline" size={26} color="#000" />
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
    color: "#c2410c",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#fed7aa",
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerName: {
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
  },
  amount: {
    fontWeight: "800",
    fontSize: 16,
    color: "#f97316",
  },
  date: {
    color: "gray",
    marginTop: 6,
  },
  floatingDownloadBtn: {
    position: "absolute",
    bottom: 90,
    right: 16,
    backgroundColor: "#ffedd5",
    borderWidth: 1,
    borderColor: "#fed7aa",
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
    color: "#c2410c",
    fontSize: 13,
  },
});
