import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Image } from "expo-image";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
import { partnerApi } from "../lib/api";
dayjs.extend(utc);

type Booking = {
  Customer_Name: string;
  AMOUNT: number;
  earned_at: string;
  payment_status: string;
};

const MonthlyScreen = () => {
  const router = useRouter();

  const currentYear = dayjs().year();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM"));

  const [showYearModal, setShowYearModal] = useState(false);

  const [earnings, setEarnings] = useState(0);
  const [data, setData] = useState<Booking[]>([]);

  const months = [
    { label: "Jan", value: "01" },
    { label: "Feb", value: "02" },
    { label: "Mar", value: "03" },
    { label: "Apr", value: "04" },
    { label: "May", value: "05" },
    { label: "Jun", value: "06" },
    { label: "Jul", value: "07" },
    { label: "Aug", value: "08" },
    { label: "Sep", value: "09" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
  ];

  const selectedYearMonth = `${selectedYear}-${selectedMonth}`;
  const fetchMonthlyData = async () => {
    try {
      const response = await partnerApi.monthlyEarnings(
        selectedYear,
        selectedMonth
      );

      console.log(
        "MONTHLY EARNINGS RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      setData(
        response.bookings.map((item: any) => ({
          Customer_Name: item.customer_name,
          AMOUNT: Number(item.amount || 0),
          earned_at: item.earned_at,
          payment_status: item.payment_status || "pending",
        }))
      );

      setEarnings(Number(response.earnings || 0));
    } catch (error) {
      console.error("Failed to fetch monthly earnings:", error);

      setData([]);
      setEarnings(0);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth, selectedYear]);

  const generateMonthlyPDF = async () => {
    try {
      const selectedMonthName =
        months.find((m) => m.value === selectedMonth)?.label || "";

      const rows = data
        .map(
          (item) => `
        <tr>
<td>${item.Customer_Name}</td>
<td>₹${item.AMOUNT}</td>
<td>
  ${dayjs(item.earned_at).format("DD MMM YYYY")}
</td>
        </tr>
      `,
        )
        .join("");

      const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center;">
            ${selectedMonthName} ${selectedYear} Earnings Report
          </h1>

          <h2>
            Total Earnings: ₹${earnings}
          </h2>

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

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `${selectedMonthName} Earnings Report`,
      });
    } catch (error) {
      console.log("MONTHLY PDF ERROR:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="dark" />

      {/* ================= HEADER ================= */}
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

      {/* ================= BODY ================= */}
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ marginBottom: 6, fontWeight: "600" }}>
            Select Year
          </Text>

          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowYearModal(true)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#111" }}>
                {selectedYear}
              </Text>

              <Ionicons name="chevron-down" size={18} color="#000" />
            </View>
          </TouchableOpacity>

          {/* 🔥 Month Selector */}
          <View style={styles.monthGrid}>
            {months.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setSelectedMonth(m.value)}
                style={[
                  styles.monthBox,
                  selectedMonth === m.value && styles.monthBoxActive,
                ]}
              >
                <Text style={styles.monthText}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔥 Earnings */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            Earnings: ₹{earnings}
          </Text>

          {/* 🔥 Cards */}
          {data.length === 0 ? (
            <Text style={{ marginTop: 20, color: "gray" }}>
              No services for this month
            </Text>
          ) : (
            data.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardRow}>
                  {/* LEFT SIDE */}
                  <View>
                    <Text style={styles.customerName}>
                      {item.Customer_Name}
                    </Text>

                    <Text style={styles.dateText}>
                      {dayjs(item.earned_at).format("DD MMM YYYY")}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: "700",
                        color:
                          item.payment_status === "paid"
                            ? "#16a34a"
                            : "#f97316",
                      }}
                    >
                      {item.payment_status === "paid"
                        ? "Paid"
                        : "Pending"}
                    </Text>
                  </View>

                  {/* RIGHT SIDE */}
                  <Text
                    style={[
                      styles.amount,
                      {
                        color:
                          item.payment_status === "paid"
                            ? "#16a34a"
                            : "#f97316",
                      },
                    ]}
                  >
                    ₹{item.AMOUNT}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.floatingDownloadBtn}
        onPress={generateMonthlyPDF}
      >
        <Ionicons name="download-outline" size={24} color="#000" />

        <Text style={styles.floatingDownloadText}>Download Report</Text>
      </TouchableOpacity>

      <Modal visible={showYearModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>

              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Ionicons name="close" size={22} color="#000" />
              </TouchableOpacity>
            </View>

            {/* LIST */}
            <ScrollView>
              {Array.from({ length: 10 }, (_, i) => {
                const year = currentYear - i;

                return (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.modalItem,
                      selectedYear === year && styles.modalItemActive,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.modalText,
                        selectedYear === year && styles.modalTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* SELECT BUTTON */}
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowYearModal(false)}
            >
              <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 190,
    height: 64,
  },
  yearContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },

  yearBox: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },

  yearBoxActive: {
    backgroundColor: "#FFD700",
  },

  yearText: {
    fontWeight: "600",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  monthBox: {
    width: "30%",
    margin: "1.5%",
    padding: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
  },

  monthBoxActive: {
    backgroundColor: "#FFD700",
  },

  monthText: {
    fontWeight: "600",
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  picker: {
    height: 50,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,

    borderWidth: 1.5,
    borderColor: "#FFE066", // 🔥 light yellow

    elevation: 2, // subtle shadow
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  customerName: {
    fontWeight: "700",
    fontSize: 15,
    flex: 1, // prevents overflow
  },

  amount: {
    fontWeight: "800",
    fontSize: 16,
    color: "#16a34a",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalItemActive: {
    backgroundColor: "#dcfce7",
  },

  modalText: {
    fontSize: 15,
  },

  modalTextActive: {
    color: "#16a34a",
    fontWeight: "800",
  },

  selectButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },

  selectButtonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 15,
  },

  dateText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },

  floatingDownloadBtn: {
    position: "absolute",
    bottom: 90,
    right: 16,

    backgroundColor: "#FFE066",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 35,

    elevation: 5,
  },

  floatingDownloadText: {
    marginLeft: 8,
    fontWeight: "700",
    color: "#000",
    fontSize: 14,
  },
});
export default MonthlyScreen;
