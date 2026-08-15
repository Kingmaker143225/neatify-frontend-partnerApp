// import { Ionicons } from "@expo/vector-icons";
// import dayjs from "dayjs";
// import isBetween from "dayjs/plugin/isBetween";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import { Image } from "expo-image";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState } from "react";
// import {
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
// dayjs.extend(isSameOrBefore);
// dayjs.extend(isBetween);

// type Booking = {
//   Customer_Name: string;
//   AMOUNT: number;
//   earned_at: string;
// };
// const WeeklyScreen = () => {
//   const router = useRouter();

//   const getCurrentWeek = () => {
//     const today = dayjs();

//     const firstDay = today.startOf("month");

//     const calendarStart = firstDay.day(0);

//     return Math.floor(today.diff(calendarStart, "day") / 7) + 1;
//   };

//   const months = [
//     { label: "Jan", value: "01" },
//     { label: "Feb", value: "02" },
//     { label: "Mar", value: "03" },
//     { label: "Apr", value: "04" },
//     { label: "May", value: "05" },
//     { label: "Jun", value: "06" },
//     { label: "Jul", value: "07" },
//     { label: "Aug", value: "08" },
//     { label: "Sep", value: "09" },
//     { label: "Oct", value: "10" },
//     { label: "Nov", value: "11" },
//     { label: "Dec", value: "12" },
//   ];

//   const getWeeksInMonth = (year: number, month: string) => {
//     const firstDay = dayjs(`${year}-${month}-01`);

//     const lastDay = firstDay.endOf("month");

//     const calendarStart = firstDay.day(0);

//     const calendarEnd =
//       lastDay.day() === 6 ? lastDay : lastDay.add(6 - lastDay.day(), "day");

//     return Math.ceil(calendarEnd.diff(calendarStart, "day") / 7);
//   };

//   const currentYear = dayjs().year();

//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM"));
//   const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

//   const [showYearModal, setShowYearModal] = useState(false);
//   const [showMonthModal, setShowMonthModal] = useState(false);
//   const [showWeekModal, setShowWeekModal] = useState(false);

//   const [dailyData, setDailyData] = useState<
//     { date: string; amount: number }[]
//   >([]);

//   const [earnings, setEarnings] = useState(0);
//   const [data, setData] = useState<Booking[]>([]);

//   const getWeekLabel = () => {
//     const { start, end } = getWeekRange(
//       selectedYear,
//       selectedMonth,
//       selectedWeek,
//     );

//     return `${start.format("DD MMM")} - ${end.format("DD MMM")}`;
//   };

//   const getWeekRange = (year: number, month: string, weekNumber: number) => {
//     const firstDayOfMonth = dayjs(`${year}-${month}-01`);

//     const calendarStart = firstDayOfMonth.startOf("month").day(0);

//     const start = calendarStart.add((weekNumber - 1) * 7, "day").startOf("day");

//     const end = start.add(6, "day").endOf("day");

//     return { start, end };
//   };

//   const getDailyEarnings = (
//     bookings: any[],
//     start: dayjs.Dayjs,
//     end: dayjs.Dayjs,
//   ) => {
//     let result: { date: string; amount: number }[] = [];

//     let current = start.startOf("day");

//     const today = dayjs().endOf("day");

//     while (
//       (current.isSame(end, "day") || current.isBefore(end)) &&
//       current.isSameOrBefore(today, "day") // 🔥 stop future dates
//     ) {
//       let total = 0;

//       bookings.forEach((item) => {
//         if (!item.earned_at) return;

//         const workDate = dayjs(item.earned_at);

//         if (workDate.isSame(current, "day")) {
//           total += Number(item.AMOUNT || 0);
//         }
//       });

//       result.push({
//         date: current.format("YYYY-MM-DD"),
//         amount: total, // 👈 even if 0 → still shown
//       });

//       current = current.add(1, "day");
//     }

//     return result;
//   };

//   const fetchWeeklyData = async () => {
//     const { data: userData } = await supabase.auth.getUser();
//     const email = userData?.user?.email;

//     if (!email) return;

//     const { start, end } = getWeekRange(
//       selectedYear,
//       selectedMonth,
//       selectedWeek,
//     );

//     const { data: bookings } = await supabase
//       .from("staff_earnings")
//       .select(
//         `
//     id,
//     Customer_Name,
//     AMOUNT,
//     earned_at
//   `,
//       )
//       .eq("staff_email", email)
//       .eq("payment_status", "paid");

//     const filtered = (bookings || []).filter((item) => {
//       const earnedDate = dayjs(item.earned_at);

//       return earnedDate.isBetween(start, end, null, "[]");
//     });

//     setData(filtered);

//     const today = dayjs();

//     if (start.isAfter(today, "day")) {
//       setDailyData([]);
//       setEarnings(0);
//       return;
//     }

//     // ✅ NEW
//     const daily = getDailyEarnings(filtered, start, end);
//     setDailyData(daily);

//     const total = daily.reduce((sum, item) => sum + item.amount, 0);

//     setEarnings(total);
//   };

//   useEffect(() => {
//     fetchWeeklyData();
//   }, [selectedWeek, selectedMonth, selectedYear]);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
//       <StatusBar style="dark" />

//       {/* ================= HEADER ================= */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.replace("/my-role")}>
//           <Image
//             source={require("../assets/images/logo.png")}
//             style={styles.logo}
//             contentFit="contain"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() =>
//             router.canGoBack() ? router.back() : router.replace("/dashboard")
//           }
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>

//       {/* ================= BODY ================= */}
//       <View style={{ flex: 1, backgroundColor: "#fff" }}>
//         <ScrollView
//           style={{ flex: 1 }} // 🔥 IMPORTANT
//           contentContainerStyle={{ padding: 16, paddingBottom: 100 }} // 👈 more space
//           showsVerticalScrollIndicator={true}
//         >
//           {/* YEAR SELECT */}
//           <Text style={{ marginBottom: 6, fontWeight: "600" }}>
//             Select Year
//           </Text>
//           <TouchableOpacity
//             style={styles.dropdownContainer}
//             onPress={() => setShowYearModal(true)}
//           >
//             <Text style={{ fontSize: 16, color: "#111", fontWeight: "600" }}>
//               {selectedYear}
//             </Text>
//           </TouchableOpacity>
//           {/* MONTH SELECT */}
//           <Text style={{ marginBottom: 6, fontWeight: "600" }}>
//             Select Month
//           </Text>

//           <TouchableOpacity
//             style={styles.dropdownContainer}
//             onPress={() => setShowMonthModal(true)}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ fontSize: 16, fontWeight: "600", color: "#111" }}>
//                 {months.find((m) => m.value === selectedMonth)?.label}
//               </Text>

//               <Ionicons name="chevron-down" size={18} color="#000" />
//             </View>
//           </TouchableOpacity>

//           {/* WEEK SELECT */}
//           <Text style={{ marginBottom: 6, fontWeight: "600" }}>
//             Select Week
//           </Text>

//           <TouchableOpacity
//             style={styles.dropdownContainer}
//             onPress={() => setShowWeekModal(true)}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ fontSize: 16, fontWeight: "600", color: "#111" }}>
//                 {getWeekLabel()}
//               </Text>

//               <Ionicons name="chevron-down" size={18} color="#000" />
//             </View>
//           </TouchableOpacity>

//           {/* EARNINGS */}
//           <Text
//             style={{
//               fontSize: 20,
//               fontWeight: "bold",
//               marginTop: 20,
//             }}
//           >
//             Earnings: ₹{earnings}
//           </Text>
//           {/* CARDS */}
//           {/* 🔥 WEEK HEADER */}
//           <Text
//             style={{
//               fontSize: 16,
//               fontWeight: "800",
//               marginTop: 20,
//               marginBottom: 10,
//             }}
//           >
//             {getWeekLabel()}
//           </Text>
//           {/* TABLE HEADER */}
//           <View style={styles.tableHeader}>
//             <Text style={styles.tableHeaderText}>Date</Text>
//             <Text style={styles.tableHeaderText}>Earnings</Text>
//           </View>
//           {/* TABLE ROWS */}
//           {dailyData.map((item) => (
//             <View key={item.date} style={styles.tableRow}>
//               <Text style={styles.tableDate}>
//                 {dayjs(item.date).format("DD-MM-YYYY")}
//               </Text>

//               <Text style={styles.tableAmount}>₹{item.amount}</Text>
//             </View>
//           ))}
//           {/* EMPTY STATE (ONLY MESSAGE, NOT BLOCK UI) */}
//           {dailyData.length === 0 && (
//             <Text style={{ marginTop: 20, color: "gray" }}>
//               No data for this week
//             </Text>
//           )}
//         </ScrollView>
//       </View>

//       <Modal visible={showYearModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             {/* 🔥 HEADER */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Year</Text>
//               <TouchableOpacity onPress={() => setShowYearModal(false)}>
//                 <Ionicons name="close" size={22} color="#000" />
//               </TouchableOpacity>
//             </View>

//             {/* 🔥 LIST */}
//             <ScrollView>
//               {Array.from({ length: 10 }, (_, i) => {
//                 const year = currentYear - i;
//                 return (
//                   <TouchableOpacity
//                     key={year}
//                     style={[
//                       styles.modalItem,
//                       selectedYear === year && styles.modalItemActive,
//                     ]}
//                     onPress={() => setSelectedYear(year)}
//                   >
//                     <Text
//                       style={[
//                         styles.modalText,
//                         selectedYear === year && styles.modalTextActive,
//                       ]}
//                     >
//                       {year}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>

//             {/* 🔥 SELECT BUTTON */}
//             <TouchableOpacity
//               style={styles.selectButton}
//               onPress={() => setShowYearModal(false)}
//             >
//               <Text style={styles.selectButtonText}>Select</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={showMonthModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             {/* 🔥 HEADER */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Month</Text>
//               <TouchableOpacity onPress={() => setShowMonthModal(false)}>
//                 <Ionicons name="close" size={22} color="#000" />
//               </TouchableOpacity>
//             </View>

//             {/* 🔥 LIST */}
//             <ScrollView>
//               {months.map((m) => (
//                 <TouchableOpacity
//                   key={m.value}
//                   style={[
//                     styles.modalItem,
//                     selectedMonth === m.value && styles.modalItemActive,
//                   ]}
//                   onPress={() => setSelectedMonth(m.value)}
//                 >
//                   <Text
//                     style={[
//                       styles.modalText,
//                       selectedMonth === m.value && styles.modalTextActive,
//                     ]}
//                   >
//                     {m.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>

//             {/* 🔥 SELECT BUTTON */}
//             <TouchableOpacity
//               style={styles.selectButton}
//               onPress={() => setShowMonthModal(false)}
//             >
//               <Text style={styles.selectButtonText}>Select</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={showWeekModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             {/* 🔥 HEADER */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Week</Text>
//               <TouchableOpacity onPress={() => setShowWeekModal(false)}>
//                 <Ionicons name="close" size={22} color="#000" />
//               </TouchableOpacity>
//             </View>

//             {/* 🔥 LIST */}
//             <ScrollView>
//               {Array.from(
//                 {
//                   length: getWeeksInMonth(selectedYear, selectedMonth),
//                 },
//                 (_, i) => i + 1,
//               ).map((w) => (
//                 <TouchableOpacity
//                   key={w}
//                   style={[
//                     styles.modalItem,
//                     selectedWeek === w && styles.modalItemActive,
//                   ]}
//                   onPress={() => setSelectedWeek(w)}
//                 >
//                   <Text
//                     style={[
//                       styles.modalText,
//                       selectedWeek === w && styles.modalTextActive,
//                     ]}
//                   >
//                     {(() => {
//                       const { start, end } = getWeekRange(
//                         selectedYear,
//                         selectedMonth,
//                         w,
//                       );

//                       return `${start.format("DD MMM")} - ${end.format("DD MMM")}`;
//                     })()}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>

//             {/* 🔥 SELECT BUTTON */}
//             <TouchableOpacity
//               style={styles.selectButton}
//               onPress={() => setShowWeekModal(false)}
//             >
//               <Text style={styles.selectButtonText}>Select</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     height: 72,
//     paddingHorizontal: 20,
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   logo: {
//     width: 190,
//     height: 64,
//   },

//   dropdownContainer: {
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 12,
//     marginBottom: 16,
//     padding: 14, // ✅ ADD THIS
//     justifyContent: "center",
//   },

//   picker: {
//     height: 50,
//     color: "#000", // ✅ REQUIRED
//   },

//   card: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 14,
//     marginTop: 12,
//     borderWidth: 1.5,
//     borderColor: "#FFE066",
//     elevation: 2,
//   },

//   cardRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   customerName: {
//     fontWeight: "700",
//     fontSize: 15,
//     flex: 1,
//   },

//   amount: {
//     fontWeight: "800",
//     fontSize: 16,
//     color: "#16a34a",
//   },

//   tableHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     backgroundColor: "#F1F5F9",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//   },

//   tableHeaderText: {
//     fontWeight: "800",
//     fontSize: 14,
//   },

//   tableRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E2E8F0",
//   },

//   tableDate: {
//     fontWeight: "600",
//   },

//   tableAmount: {
//     fontWeight: "800",
//     color: "#16a34a",
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     padding: 20,
//   },

//   modalBox: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     maxHeight: "70%",
//   },

//   modalItem: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },

//   modalItemActive: {
//     backgroundColor: "#dcfce7", // light green
//   },

//   modalText: {
//     fontSize: 15,
//   },

//   modalTextActive: {
//     color: "#16a34a",
//     fontWeight: "800",
//   },

//   selectBtn: {
//     textAlign: "center",
//     marginTop: 10,
//     fontWeight: "700",
//     color: "#16a34a",
//   },

//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   selectButton: {
//     backgroundColor: "#FFD700", // 🔥 yellow
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginTop: 12,
//     alignItems: "center",
//   },

//   selectButtonText: {
//     color: "#000000",
//     fontWeight: "700",
//   },
// });

// export default WeeklyScreen;

















import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { partnerApi } from "../lib/api";

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

type Booking = {
  Customer_Name: string;
  AMOUNT: number;
  earned_at: string;
};

type WeeklyEarningsResponse = {
  year: number;
  month: string;
  week: number;
  start_date: string;
  end_date: string;
  earnings: number;
  daily: {
    date: string;
    amount: number;
  }[];
  bookings: {
    id: string;
    customer_name: string;
    amount: number;
    earned_at: string;
  }[];
};

const WeeklyScreen = () => {
  const router = useRouter();

  // =========================================================
  // WEEK CALCULATION
  // =========================================================

  const getCurrentWeek = () => {
    const today = dayjs();

    const firstDay = today.startOf("month");

    const calendarStart = firstDay.day(0);

    return (
      Math.floor(
        today.diff(calendarStart, "day") / 7
      ) + 1
    );
  };

  // =========================================================
  // MONTHS
  // =========================================================

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

  // =========================================================
  // GET WEEKS IN MONTH
  // =========================================================

  const getWeeksInMonth = (
    year: number,
    month: string
  ) => {
    const firstDay = dayjs(
      `${year}-${month}-01`
    );

    const lastDay =
      firstDay.endOf("month");

    const calendarStart =
      firstDay.day(0);

    const calendarEnd =
      lastDay.day() === 6
        ? lastDay
        : lastDay.add(
            6 - lastDay.day(),
            "day"
          );

    return Math.ceil(
      calendarEnd.diff(
        calendarStart,
        "day"
      ) / 7
    );
  };

  // =========================================================
  // STATE
  // =========================================================

  const currentYear = dayjs().year();

  const [selectedYear, setSelectedYear] =
    useState(currentYear);

  const [selectedMonth, setSelectedMonth] =
    useState(dayjs().format("MM"));

  const [selectedWeek, setSelectedWeek] =
    useState(getCurrentWeek());

  const [showYearModal, setShowYearModal] =
    useState(false);

  const [showMonthModal, setShowMonthModal] =
    useState(false);

  const [showWeekModal, setShowWeekModal] =
    useState(false);

  const [dailyData, setDailyData] =
    useState<
      { date: string; amount: number }[]
    >([]);

  const [earnings, setEarnings] =
    useState(0);

  const [data, setData] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(false);

  // =========================================================
  // WEEK RANGE
  // =========================================================

  const getWeekRange = (
    year: number,
    month: string,
    weekNumber: number
  ) => {
    const firstDayOfMonth =
      dayjs(`${year}-${month}-01`);

    const calendarStart =
      firstDayOfMonth
        .startOf("month")
        .day(0);

    const start =
      calendarStart
        .add(
          (weekNumber - 1) * 7,
          "day"
        )
        .startOf("day");

    const end =
      start
        .add(6, "day")
        .endOf("day");

    return {
      start,
      end,
    };
  };

  // =========================================================
  // WEEK LABEL
  // =========================================================

  const getWeekLabel = () => {
    const { start, end } =
      getWeekRange(
        selectedYear,
        selectedMonth,
        selectedWeek
      );

    return `${start.format(
      "DD MMM"
    )} - ${end.format("DD MMM")}`;
  };

  // =========================================================
  // FETCH WEEKLY DATA FROM BACKEND
  // =========================================================

  const fetchWeeklyData = async () => {
    setLoading(true);

    try {
      const response =
        await partnerApi.weeklyEarnings(
          selectedYear,
          selectedMonth,
          selectedWeek
        );

      /*
       * Backend response:
       *
       * {
       *   year,
       *   month,
       *   week,
       *   start_date,
       *   end_date,
       *   earnings,
       *   daily: [],
       *   bookings: []
       * }
       */

      const typedResponse =
        response as WeeklyEarningsResponse;

      // =====================================================
      // BOOKINGS
      // =====================================================

      const bookingList: Booking[] =
        (
          typedResponse.bookings || []
        ).map((item) => ({
          Customer_Name:
            item.customer_name || "Customer",

          AMOUNT:
            Number(item.amount || 0),

          earned_at:
            item.earned_at,
        }));

      setData(bookingList);

      // =====================================================
      // DAILY EARNINGS
      // =====================================================

      setDailyData(
        (typedResponse.daily || []).map(
          (item) => ({
            date: item.date,
            amount:
              Number(item.amount || 0),
          })
        )
      );

      // =====================================================
      // TOTAL EARNINGS
      // =====================================================

      setEarnings(
        Number(
          typedResponse.earnings || 0
        )
      );
    } catch (error) {
      console.log(
        "❌ Failed to fetch weekly earnings:",
        error
      );

      setData([]);
      setDailyData([]);
      setEarnings(0);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH WHEN YEAR / MONTH / WEEK CHANGES
  // =========================================================

  useEffect(() => {
    fetchWeeklyData();
  }, [
    selectedWeek,
    selectedMonth,
    selectedYear,
  ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
      }}
    >
      <StatusBar style="dark" />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.replace("/my-role")
          }
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace(
                  "/dashboard"
                )
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {/* ================= BODY ================= */}

      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={true}
        >
          {/* ================= YEAR SELECT ================= */}

          <Text
            style={{
              marginBottom: 6,
              fontWeight: "600",
            }}
          >
            Select Year
          </Text>

          <TouchableOpacity
            style={
              styles.dropdownContainer
            }
            onPress={() =>
              setShowYearModal(true)
            }
          >
            <Text
              style={{
                fontSize: 16,
                color: "#111",
                fontWeight: "600",
              }}
            >
              {selectedYear}
            </Text>
          </TouchableOpacity>

          {/* ================= MONTH SELECT ================= */}

          <Text
            style={{
              marginBottom: 6,
              fontWeight: "600",
            }}
          >
            Select Month
          </Text>

          <TouchableOpacity
            style={
              styles.dropdownContainer
            }
            onPress={() =>
              setShowMonthModal(true)
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111",
                }}
              >
                {
                  months.find(
                    (m) =>
                      m.value ===
                      selectedMonth
                  )?.label
                }
              </Text>

              <Ionicons
                name="chevron-down"
                size={18}
                color="#000"
              />
            </View>
          </TouchableOpacity>

          {/* ================= WEEK SELECT ================= */}

          <Text
            style={{
              marginBottom: 6,
              fontWeight: "600",
            }}
          >
            Select Week
          </Text>

          <TouchableOpacity
            style={
              styles.dropdownContainer
            }
            onPress={() =>
              setShowWeekModal(true)
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111",
                }}
              >
                {getWeekLabel()}
              </Text>

              <Ionicons
                name="chevron-down"
                size={18}
                color="#000"
              />
            </View>
          </TouchableOpacity>

          {/* ================= LOADING ================= */}

          {loading && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: "gray",
              }}
            >
              Loading...
            </Text>
          )}

          {/* ================= EARNINGS ================= */}

          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            Earnings: ₹{earnings}
          </Text>

          {/* ================= WEEK HEADER ================= */}

          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            {getWeekLabel()}
          </Text>

          {/* ================= TABLE HEADER ================= */}

          <View style={styles.tableHeader}>
            <Text
              style={
                styles.tableHeaderText
              }
            >
              Date
            </Text>

            <Text
              style={
                styles.tableHeaderText
              }
            >
              Earnings
            </Text>
          </View>

          {/* ================= TABLE ROWS ================= */}

          {dailyData.map((item) => (
            <View
              key={item.date}
              style={styles.tableRow}
            >
              <Text
                style={styles.tableDate}
              >
                {dayjs(item.date).format(
                  "DD-MM-YYYY"
                )}
              </Text>

              <Text
                style={
                  styles.tableAmount
                }
              >
                ₹{item.amount}
              </Text>
            </View>
          ))}

          {/* ================= EMPTY STATE ================= */}

          {!loading &&
            dailyData.length === 0 && (
              <Text
                style={{
                  marginTop: 20,
                  color: "gray",
                }}
              >
                No data for this week
              </Text>
            )}
        </ScrollView>
      </View>

      {/* ================= YEAR MODAL ================= */}

      <Modal
        visible={showYearModal}
        transparent
        animationType="slide"
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalBox}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Select Year
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowYearModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {Array.from(
                { length: 10 },
                (_, i) => {
                  const year =
                    currentYear - i;

                  return (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.modalItem,
                        selectedYear ===
                          year &&
                          styles.modalItemActive,
                      ]}
                      onPress={() =>
                        setSelectedYear(
                          year
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.modalText,
                          selectedYear ===
                            year &&
                            styles.modalTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>

            <TouchableOpacity
              style={
                styles.selectButton
              }
              onPress={() =>
                setShowYearModal(false)
              }
            >
              <Text
                style={
                  styles.selectButtonText
                }
              >
                Select
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MONTH MODAL ================= */}

      <Modal
        visible={showMonthModal}
        transparent
        animationType="slide"
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalBox}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Select Month
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowMonthModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {months.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    styles.modalItem,
                    selectedMonth ===
                      m.value &&
                      styles.modalItemActive,
                  ]}
                  onPress={() =>
                    setSelectedMonth(
                      m.value
                    )
                  }
                >
                  <Text
                    style={[
                      styles.modalText,
                      selectedMonth ===
                        m.value &&
                        styles.modalTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={
                styles.selectButton
              }
              onPress={() =>
                setShowMonthModal(false)
              }
            >
              <Text
                style={
                  styles.selectButtonText
                }
              >
                Select
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= WEEK MODAL ================= */}

      <Modal
        visible={showWeekModal}
        transparent
        animationType="slide"
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalBox}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Select Week
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowWeekModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {Array.from(
                {
                  length:
                    getWeeksInMonth(
                      selectedYear,
                      selectedMonth
                    ),
                },
                (_, i) => i + 1
              ).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.modalItem,
                    selectedWeek === w &&
                      styles.modalItemActive,
                  ]}
                  onPress={() =>
                    setSelectedWeek(w)
                  }
                >
                  <Text
                    style={[
                      styles.modalText,
                      selectedWeek ===
                        w &&
                        styles.modalTextActive,
                    ]}
                  >
                    {(() => {
                      const {
                        start,
                        end,
                      } =
                        getWeekRange(
                          selectedYear,
                          selectedMonth,
                          w
                        );

                      return `${start.format(
                        "DD MMM"
                      )} - ${end.format(
                        "DD MMM"
                      )}`;
                    })()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={
                styles.selectButton
              }
              onPress={() =>
                setShowWeekModal(false)
              }
            >
              <Text
                style={
                  styles.selectButtonText
                }
              >
                Select
              </Text>
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

  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 16,
    padding: 14,
    justifyContent: "center",
  },

  picker: {
    height: 50,
    color: "#000",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#FFE066",
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
    color: "#16a34a",
  },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  tableHeaderText: {
    fontWeight: "800",
    fontSize: 14,
  },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  tableDate: {
    fontWeight: "600",
  },

  tableAmount: {
    fontWeight: "800",
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

  selectBtn: {
    textAlign: "center",
    marginTop: 10,
    fontWeight: "700",
    color: "#16a34a",
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

  selectButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },

  selectButtonText: {
    color: "#000000",
    fontWeight: "700",
  },
});

export default WeeklyScreen;