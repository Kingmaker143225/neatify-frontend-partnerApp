// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useNavigation } from "@react-navigation/native";
// import dayjs from "dayjs";
// import isoWeek from "dayjs/plugin/isoWeek";
// import { Image } from "expo-image";
// import { router, usePathname } from "expo-router"; // ✅ added usePathname
// import { useEffect, useState } from "react";
// import {
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
// dayjs.extend(isoWeek);

// export default function Dashboard() {
//   const pathname = usePathname();

//   const [data, setData] = useState<any[]>([]);
//   const [filterDate, setFilterDate] = useState("");
//   const [sortBy, setSortBy] = useState<"recent" | "date" | "name">("recent");
//   const [showSortOptions, setShowSortOptions] = useState(false);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<any>(null);
//   const [showModal, setShowModal] = useState(false);

//   const [totalEarnings, setTotalEarnings] = useState(0);
//   const [weeklyEarnings, setWeeklyEarnings] = useState(0);
//   const [monthlyEarnings, setMonthlyEarnings] = useState(0);
//   const [cancellationFee, setCancellationFee] = useState(0);

//   const pendingEarnings = data
//     .filter((item) => item.payment_status?.toLowerCase() !== "paid")
//     .reduce((sum, item) => sum + Number(item.staff_earned_amount || 0), 0);

//   const [filter, setFilter] = useState("ALL");
//   const [refreshing, setRefreshing] = useState(false);

//   const navigation = useNavigation();

//   useEffect(() => {
//     loadCompleted();
//   }, []);

//   useEffect(() => {
//     loadCompleted(filterDate || undefined);
//   }, [sortBy]);

//   const updateStaffProfile = async () => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();

//       if (!userData?.user?.email) return;

//       const { error } = await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings: totalEarnings,
//           weekly_earnings: weeklyEarnings,
//         })
//         .eq("email", userData.user.email);

//       if (error) {
//         console.log("Update error:", error);
//       } else {
//         console.log("✅ Staff profile updated");
//       }
//     } catch (err) {
//       console.log("Unexpected error:", err);
//     }
//   };

//   const updateMonthlyJSON = async (bookings: any[]) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;
//       if (!email) return;

//       const newMonthlyJSON: any = {};

//       bookings.forEach((item) => {
//         const key = dayjs(item.work_ended_at).format("YYYY-MM");
//         const amount = Number(item.staff_earned_amount || 0);

//         if (!newMonthlyJSON[key]) {
//           newMonthlyJSON[key] = 0;
//         }

//         newMonthlyJSON[key] += amount;
//       });

//       await supabase
//         .from("staff_profile")
//         .update({
//           monthly_earnings_json: newMonthlyJSON,
//         })
//         .eq("email", email);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const updateWeeklyJSON = async (bookings: any[]) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;
//       if (!email) return;

//       const newWeeklyJSON: any = {};

//       bookings.forEach((item) => {
//         const d = dayjs(item.work_ended_at);
//         const yearMonth = d.format("YYYY-MM");
//         const day = d.date();
//         const dateStr = d.format("YYYY-MM-DD");
//         const amount = Number(item.staff_earned_amount || 0);

//         if (!newWeeklyJSON[yearMonth]) {
//           newWeeklyJSON[yearMonth] = {
//             week1: {},
//             week2: {},
//             week3: {},
//             week4: {},
//           };
//         }

//         let weekKey = "week4";
//         if (day <= 7) weekKey = "week1";
//         else if (day <= 14) weekKey = "week2";
//         else if (day <= 21) weekKey = "week3";

//         if (!newWeeklyJSON[yearMonth][weekKey][dateStr]) {
//           newWeeklyJSON[yearMonth][weekKey][dateStr] = 0;
//         }

//         newWeeklyJSON[yearMonth][weekKey][dateStr] += amount;
//       });

//       await supabase
//         .from("staff_profile")
//         .update({
//           weekly_earnings_json: newWeeklyJSON,
//         })
//         .eq("email", email);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const updateAllEarnings = async () => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;

//       if (!email) return;

//       const { data: bookings } = await supabase
//         .from("bookings")
//         .select("staff_earned_amount, work_ended_at")
//         .eq("assigned_staff_email", email)
//         .eq("work_status", "COMPLETED");

//       const now = new Date();

//       let total = 0;
//       let weekly = 0;
//       let monthly = 0;
//       let weeklyJSON: any = {};

//       bookings?.forEach((item: any) => {
//         const amount = Number(item.AMOUNT || 0);
//         const date = new Date(item.earned_at);
//         total += amount;

//         const d = dayjs(date);
//         const yearMonth = d.format("YYYY-MM");
//         const day = d.date();

//         // ✅ Weekly (last 7 days - for dashboard card)
//         const oneWeekAgo = new Date();
//         oneWeekAgo.setDate(new Date().getDate() - 7);

//         // ✅ Monthly
//         if (
//           date.getMonth() === new Date().getMonth() &&
//           date.getFullYear() === new Date().getFullYear()
//         ) {
//           monthly += amount;
//         }

//         // 🔥 WEEKLY JSON (MAIN PART)
//         if (!weeklyJSON[yearMonth]) {
//           weeklyJSON[yearMonth] = {
//             week1: 0,
//             week2: 0,
//             week3: 0,
//             week4: 0,
//           };
//         }

//         if (day <= 7) weeklyJSON[yearMonth].week1 += amount;
//         else if (day <= 14) weeklyJSON[yearMonth].week2 += amount;
//         else if (day <= 21) weeklyJSON[yearMonth].week3 += amount;
//         else weeklyJSON[yearMonth].week4 += amount;
//       });

//       // 🔥 UPDATE EVERYTHING IN ONE CALL
//       const { error } = await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings: total,
//           weekly_earnings: weekly,
//           monthly_earnings: monthly,
//           weekly_earnings_json: weeklyJSON, // ✅ ADD THIS
//         })
//         .eq("email", email);

//       if (error) console.log("Update error:", error);
//       else console.log("✅ All earnings updated");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const updateTotalJSON = async (bookings: any[]) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;
//       if (!email) return;

//       const newTotalJSON: any = {};

//       bookings.forEach((item) => {
//         const date = dayjs(item.work_ended_at).format("YYYY-MM-DD");
//         const amount = Number(item.staff_earned_amount || 0);

//         if (!newTotalJSON[date]) {
//           newTotalJSON[date] = 0;
//         }

//         newTotalJSON[date] += amount;
//       });

//       await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings_json: newTotalJSON,
//         })
//         .eq("email", email);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchCancellationFee = async () => {
//     try {
//       const { data: user } = await supabase.auth.getUser();
//       const email = user.user?.email;
//       if (!email) return;

//       // Primary: query staff_cancellations table
//       const { data: cancelLogs } = await supabase
//         .from("staff_cancellations")
//         .select("cancellation_fee")
//         .eq("staff_email", email);

//       if (cancelLogs && cancelLogs.length > 0) {
//         const totalFee = cancelLogs.reduce(
//           (sum, item) => sum + Number(item.cancellation_fee || 0),
//           0
//         );
//         setCancellationFee(totalFee);
//         return;
//       }

//       // Fallback: query bookings table for work_status = CANCELLED
//       const { count } = await supabase
//         .from("bookings")
//         .select("*", { count: "exact", head: true })
//         .eq("assigned_staff_email", email)
//         .eq("work_status", "CANCELLED");

//       setCancellationFee((count || 0) * 99);
//     } catch (err) {
//       console.log("Error fetching cancellation fee:", err);
//     }
//   };

//   useEffect(() => {
//     fetchEarnings();
//     fetchCancellationFee();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);

//     try {
//       await loadCompleted(); // your existing function
//       await fetchEarnings(); // earnings function we created
//       await fetchCancellationFee();
//     } catch (err) {
//       console.log("Refresh error:", err);
//     }

//     setRefreshing(false);
//   };
//   /* ================= LOAD COMPLETED ================= */
//   const loadCompleted = async (date?: string) => {
//     const { data: user } = await supabase.auth.getUser();
//     const email = user.user?.email;

//     let query = supabase
//       .from("bookings")
//       .select(
//         `
// id,
// customer_name,
// email,
// services,
// work_ended_at,
// worked_duration,
// staff_earned_amount,
// payment_status
// `,
//       )
//       .eq("assigned_staff_email", email)
//       .eq("work_status", "COMPLETED");
//     if (sortBy === "recent") {
//       query = query.order("work_ended_at", { ascending: false });
//     } else if (sortBy === "date") {
//       query = query.order("work_ended_at", { ascending: true });
//     } else if (sortBy === "name") {
//       query = query.order("customer_name", { ascending: true });
//     }

//     if (date) {
//       query = query
//         .gte("work_ended_at", `${date}T00:00:00`)
//         .lte("work_ended_at", `${date}T23:59:59`);
//     }

//     const { data } = await query;
//     if (!data?.length) {
//       setData([]);
//       return;
//     }

//     const bookingIds = data.map((item) => item.id);

//     const { data: earningsData } = await supabase
//       .from("staff_earnings")
//       .select("booking_id,payment_status")
//       .in("booking_id", bookingIds);

//     const paymentMap: any = {};

//     earningsData?.forEach((row) => {
//       paymentMap[row.booking_id] = row.payment_status;
//     });

//     const mergedData = data.map((item) => ({
//       ...item,
//       payment_status: paymentMap[item.id] || "pending",
//     }));

//     setData(mergedData);
//   };

//   const filteredData = data.filter((item) => {
//     const date = new Date(item.work_ended_at);
//     const now = new Date();

//     if (filter === "WEEKLY") {
//       const oneWeekAgo = new Date();
//       oneWeekAgo.setDate(now.getDate() - 7);
//       return date >= oneWeekAgo;
//     }

//     if (filter === "MONTHLY") {
//       return (
//         date.getMonth() === now.getMonth() &&
//         date.getFullYear() === now.getFullYear()
//       );
//     }

//     return true; // ALL
//   });

//   const saveEarningsToProfile = async (
//     total: number,
//     weekly: number,
//     monthly: number,
//   ) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;

//       if (!email) return;

//       const { error } = await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings: total,
//           weekly_earnings: weekly,
//           monthly_earnings: monthly,
//         })
//         .eq("email", email);

//       if (error) {
//         console.log("Save error:", error);
//       } else {
//         console.log("✅ Earnings saved to Supabase");
//       }
//     } catch (err) {
//       console.log("Unexpected error:", err);
//     }
//   };

//   /* ================= Fetch Earnings ================= */

//   const fetchEarnings = async () => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;

//       if (!email) return;

//       const { data, error } = await supabase
//         .from("staff_earnings")
//         .select(
//           `
//     AMOUNT,
//     earned_at,
//     payment_status
//   `,
//         )
//         .eq("staff_email", email)
//         .eq("payment_status", "paid");
//       if (error) {
//         console.log("Error fetching earnings:", error);
//         return;
//       }

//       if (data) {
//         const paidBookings =
//           data?.filter(
//             (item) => item.payment_status?.toLowerCase() === "paid",
//           ) || [];

//         updateMonthlyJSON(paidBookings);
//         updateWeeklyJSON(paidBookings);
//         updateTotalJSON(paidBookings);
//       }

//       const now = new Date();

//       let total = 0;
//       let weekly = 0;
//       let monthly = 0;

//       const oneWeekAgo = new Date();
//       oneWeekAgo.setDate(now.getDate() - 7);

//       data?.forEach((item) => {
//         const amount = Number(item.AMOUNT || 0);
//         const date = new Date(item.earned_at);
//         total += amount;

//         const d = dayjs(date);

//         // ✅ WEEKLY FIX HERE
//         const currentWeekStart = dayjs().startOf("week");
//         const currentWeekEnd = dayjs().endOf("week");

//         if (d.isBetween(currentWeekStart, currentWeekEnd, null, "[]")) {
//           weekly += amount;
//         }

//         // ✅ Monthly
//         if (
//           date.getMonth() === now.getMonth() &&
//           date.getFullYear() === now.getFullYear()
//         ) {
//           monthly += amount;
//         }
//       });

//       setTotalEarnings(total);
//       setWeeklyEarnings(weekly);
//       setMonthlyEarnings(monthly);

//       saveEarningsToProfile(total, weekly, monthly);
//     } catch (err) {
//       console.log("Unexpected error:", err);
//     }
//   };

//   /* ================= FORMAT DATE ================= */
//   const formatDateTime = (value: string) => {
//     const d = new Date(value);
//     return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     })}`;
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />
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
//             router.canGoBack() ? router.back() : router.replace("/my-role")
//           }
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>
//       {/* ================= TOTAL COUNT ================= */}
//       <View style={styles.summaryContainer}>
//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => setFilter("ALL")}
//         >
//           <Text style={styles.gridTitle}>Total Completed</Text>
//           <Text style={styles.gridValue}>{data.length}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => router.push("./total-earnings")} // ✅ ADD THIS
//         >
//           <Text style={styles.gridTitle}>Paid Earnings</Text>
//           <Text style={styles.gridValue}>₹{totalEarnings}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => router.push("/weekly-screen")}
//         >
//           <Text style={styles.gridTitle}>Weekly</Text>
//           <Text style={styles.gridValue}>₹{weeklyEarnings}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => router.push("/monthly-screen")}
//         >
//           <Text style={styles.gridTitle}>Monthly</Text>
//           <Text style={styles.gridValue}>₹{monthlyEarnings}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.gridBox, styles.pendingGridBox]}
//           onPress={() => router.push("./pending-payments")}
//         >
//           <Text style={[styles.gridTitle, styles.pendingGridTitle]}>
//             Pending Payments
//           </Text>
//           <Text style={[styles.gridValue, styles.pendingGridValue]}>
//             ₹{pendingEarnings}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.gridBox, styles.cancellationGridBox]}
//           onPress={() => router.push("./cancellations")}
//         >
//           <Text style={[styles.gridTitle, styles.cancellationGridTitle]}>
//             Cancellation
//           </Text>
//           <Text style={[styles.gridValue, styles.cancellationGridValue]}>
//             ₹{cancellationFee}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* ================= FILTER ================= */}
//       <View style={styles.filterRow}>
//         <View style={styles.filterBox}>
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
//             onPress={() => setShowCalendar(true)}
//           >
//             <Ionicons
//               name="calendar-outline"
//               size={20}
//               color="#000"
//               style={{ marginRight: 8 }}
//             />

//             <TextInput
//               placeholder="YYYY-MM-DD"
//               placeholderTextColor="#000"
//               value={filterDate}
//               keyboardType="number-pad"
//               maxLength={10}
//               onChangeText={(v) => {
//                 const digits = v.replace(/[^0-9]/g, "");

//                 let formatted = digits;

//                 if (digits.length > 4) {
//                   formatted = digits.slice(0, 4) + "-" + digits.slice(4);
//                 }
//                 if (digits.length > 6) {
//                   formatted =
//                     digits.slice(0, 4) +
//                     "-" +
//                     digits.slice(4, 6) +
//                     "-" +
//                     digits.slice(6, 8);
//                 }

//                 setFilterDate(formatted);

//                 if (formatted.length === 10) loadCompleted(formatted);
//                 if (formatted.length === 0) loadCompleted();
//               }}
//               style={styles.filterInput}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={{ marginLeft: 10 }}>
//           <TouchableOpacity
//             style={styles.sortBtn}
//             onPress={() => setShowSortOptions(!showSortOptions)}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Text style={styles.sortText}>
//                 {sortBy === "recent"
//                   ? "Recent"
//                   : sortBy === "date"
//                     ? "Oldest"
//                     : "Name"}
//               </Text>
//               <Ionicons
//                 name={showSortOptions ? "chevron-up" : "chevron-down"}
//                 size={18}
//                 color="#000"
//                 style={{ marginLeft: 5 }}
//               />
//             </View>
//           </TouchableOpacity>

//           {showSortOptions && (
//             <View style={styles.dropdown}>
//               <TouchableOpacity
//                 style={styles.dropdownItem}
//                 onPress={() => {
//                   setSortBy("recent");
//                   setShowSortOptions(false);
//                 }}
//               >
//                 <Text>Recent</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dropdownItem}
//                 onPress={() => {
//                   setSortBy("date");
//                   setShowSortOptions(false);
//                 }}
//               >
//                 <Text>Oldest</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dropdownItem}
//                 onPress={() => {
//                   setSortBy("name");
//                   setShowSortOptions(false);
//                 }}
//               >
//                 <Text>Name</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//       {showCalendar && (
//         <DateTimePicker
//           value={new Date()}
//           mode="date"
//           display="default"
//           onChange={(event, selectedDate) => {
//             setShowCalendar(false);
//             if (selectedDate) {
//               const year = selectedDate.getFullYear();
//               const month = String(selectedDate.getMonth() + 1).padStart(
//                 2,
//                 "0",
//               );
//               const day = String(selectedDate.getDate()).padStart(2, "0");

//               const formatted = `${year}-${month}-${day}`;
//               setFilterDate(formatted);
//               loadCompleted(formatted);
//             }
//           }}
//         />
//       )}
//       {/* ================= BODY ================= */}
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{
//           padding: 16,
//           paddingBottom: 120,
//           flexGrow: 1, // ✅ IMPORTANT
//         }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         alwaysBounceVertical={true}
//       >
//         {data.length === 0 ? (
//           <Text style={styles.empty}>No completed services</Text>
//         ) : null}

//         {filteredData.map((item, i) => (
//           <View key={i} style={styles.card}>
//             {/* TOP ROW */}
//             <View style={styles.cardTop}>
//               <Text style={styles.name}>{item.customer_name}</Text>

//               <View style={styles.rightContainer}>
//                 <Text
//                   style={[
//                     styles.completedBadge,
//                     item.payment_status?.toLowerCase() === "paid"
//                       ? styles.paidBadge
//                       : styles.pendingBadge,
//                   ]}
//                 >
//                   COMPLETED
//                 </Text>
//                 <Text
//                   style={[
//                     styles.amountText,
//                     {
//                       color:
//                         item.payment_status?.toLowerCase() === "paid"
//                           ? "#16a34a"
//                           : "#f97316",
//                     },
//                   ]}
//                 >
//                   + ₹{Number(item.staff_earned_amount || 0)}
//                 </Text>
//               </View>
//             </View>

//             {/* BUTTON */}
//             <TouchableOpacity
//               style={styles.viewBtn}
//               onPress={() => {
//                 setSelectedItem(item);
//                 setShowModal(true);
//               }}
//             >
//               <Text style={styles.viewText}>View Details</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </ScrollView>
//       {showModal && selectedItem && (
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Service Details</Text>

//             <Text style={styles.modalText}>
//               Name: {selectedItem.customer_name}
//             </Text>

//             <Text style={styles.modalText}>Email: {selectedItem.email}</Text>

//             <Text style={styles.modalText}>Services:</Text>

//             {selectedItem.services?.map((s: any, i: number) => (
//               <View key={i} style={{ marginLeft: 10, marginTop: 5 }}>
//                 <Text>• {s.title}</Text>
//                 <Text style={{ color: "#252424" }}>Duration: {s.duration}</Text>
//               </View>
//             ))}

//             <Text style={styles.modalText}>
//               Completed: {formatDateTime(selectedItem.work_ended_at)}
//             </Text>

//             {selectedItem.worked_duration && (
//               <Text style={styles.modalText}>
//                 Worked Time: {selectedItem.worked_duration}
//               </Text>
//             )}

//             {selectedItem.staff_earned_amount > 0 && (
//               <Text style={styles.modalText}>
//                 Amount Earned: ₹{selectedItem.staff_earned_amount}
//               </Text>
//             )}

//             <TouchableOpacity
//               style={styles.closeBtn}
//               onPress={() => setShowModal(false)}
//             >
//               <Text style={{ color: "#000000", fontWeight: "700" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//       {/* ================= UPDATED FOOTER ONLY =================
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.replace("/my-role")}
//         >
//           <Ionicons
//             name={pathname === "/my-role" ? "home" : "home-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/my-role"
//                 ? styles.footerTextActive
//                 : styles.footerText
//             }
//           >
//             Home
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.replace("/dashboard")}
//         >
//           <Ionicons
//             name={pathname === "/dashboard" ? "calendar" : "calendar-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/dashboard"
//                 ? styles.footerTextActive
//                 : styles.footerText
//             }
//           >
//             Dashboard
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.replace("/my-account")}
//         >
//           <Ionicons
//             name={pathname === "/my-account" ? "person" : "person-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/my-account"
//                 ? styles.footerTextActive
//                 : styles.footerText
//             }
//           >
//             Profile
//           </Text>
//         </TouchableOpacity>
//       </View> */}
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */

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

//   countBox: {
//     marginHorizontal: 20,
//     marginTop: 10,
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: "#ecfdf5",
//     borderWidth: 1,
//     borderColor: "#cad84b",
//   },

//   countText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#065f46",
//   },

//   countNumber: {
//     fontSize: 18,
//     fontWeight: "800",
//   },

//   filterBox: {
//     flex: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderRadius: 12,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   filterInput: {
//     flex: 1,
//   },

//   body: {
//     padding: 20,
//     paddingBottom: 20,
//   },

//   empty: {
//     textAlign: "center",
//     marginTop: 40,
//     color: "#666",
//     fontWeight: "600",
//   },

//   card: {
//     borderWidth: 1.5,
//     borderColor: "#b5ca42",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     backgroundColor: "#fff", // ✅ makes it cleaner
//   },

//   name: {
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   email: {
//     color: "#555",
//   },

//   date: {
//     marginTop: 4,
//     fontSize: 12,
//     color: "#374151",
//   },

//   completed: {
//     color: "#16a34a",
//     fontWeight: "800",
//   },

//   // footer: {
//   //   height: 70,
//   //   backgroundColor: "#ffffff",
//   //   flexDirection: "row",
//   //   justifyContent: "space-around",
//   //   alignItems: "center",
//   // },

//   // footerItem: {
//   //   alignItems: "center",
//   //   justifyContent: "center",
//   // },

//   // footerText: {
//   //   fontSize: 12,
//   //   marginTop: 4,
//   //   fontWeight: "600",
//   //   color: "#000",
//   // },

//   // footerTextActive: {
//   //   fontSize: 12,
//   //   marginTop: 4,
//   //   fontWeight: "800",
//   //   color: "#000",
//   // },

//   worked: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#16a34a",
//   },

//   dropdown: {
//     position: "absolute",
//     top: 55,
//     right: 0,
//     width: 120,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     elevation: 5,
//     zIndex: 999,
//   },

//   dropdownItem: {
//     padding: 10,
//     borderBottomWidth: 0.5,
//     borderColor: "#eee",
//   },

//   filterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 10,
//     zIndex: 1000,
//   },

//   sortBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderRadius: 12,
//     borderColor: "#000",
//     marginLeft: 10,
//   },

//   sortText: {
//     fontWeight: "700",
//   },

//   completedBtn: {
//     marginTop: 10,
//     backgroundColor: "#dcfce7",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     alignSelf: "flex-start",
//   },

//   completedText: {
//     color: "#16a34a",
//     fontWeight: "800",
//   },

//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 2000,
//   },

//   modalBox: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     marginBottom: 10,
//   },

//   modalText: {
//     marginBottom: 6,
//     color: "#333",
//   },

//   closeBtn: {
//     marginTop: 15,
//     backgroundColor: "#FFD700",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   cardTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   completedBadge: {
//     color: "#16a34a",
//     fontWeight: "800",
//     backgroundColor: "#dcfce7",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     fontSize: 12,
//   },

//   viewBtn: {
//     marginTop: 12,
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 15,
//     alignSelf: "center",

//     borderWidth: 1.5, // ✅ add border
//     borderColor: "#000", // ✅ match your theme color
//   },

//   viewText: {
//     color: "#000",
//     fontWeight: "700",
//     fontSize: 13,
//   },

//   amountRow: {
//     alignItems: "flex-end", // 👈 pushes to right
//     marginTop: 6,
//   },

//   rightContainer: {
//     alignItems: "center", // 👈 centers amount under badge
//   },

//   amountText: {
//     marginTop: 6, // 👈 spacing between COMPLETED & amount
//     color: "#16a34a",
//     fontWeight: "800",
//     fontSize: 16,
//   },

//   summaryContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginTop: 10,
//   },

//   gridBox: {
//     width: "48%", // 🔥 THIS CREATES 2 COLUMNS
//     backgroundColor: "#E6F4EA",
//     borderRadius: 16,
//     paddingVertical: 16,
//     paddingHorizontal: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#A3D9A5",

//     // 🔥 premium look
//     elevation: 3,
//   },

//   gridTitle: {
//     fontSize: 13,
//     color: "#2E7D32",
//     marginBottom: 6,
//   },

//   gridValue: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1B5E20",
//   },

//   summaryBox: {
//     backgroundColor: "#E6F4EA",
//     borderRadius: 16,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#A3D9A5",
//     elevation: 2,
//   },

//   summaryText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1B5E20",
//   },

//   paidBadge: {
//     backgroundColor: "#dcfce7",
//     color: "#16a34a",
//   },

//   pendingBadge: {
//     backgroundColor: "#ffedd5",
//     color: "#f97316",
//   },

//   pendingGridBox: {
//     backgroundColor: "#fff7ed",
//     borderColor: "#fed7aa",
//     borderWidth: 1.5,
//   },

//   pendingGridTitle: {
//     color: "#c2410c",
//   },

//   pendingGridValue: {
//     color: "#f97316",
//   },

//   cancellationGridBox: {
//     backgroundColor: "#fef2f2",
//     borderColor: "#fca5a5",
//     borderWidth: 1.5,
//   },

//   cancellationGridTitle: {
//     color: "#b91c1c",
//   },

//   cancellationGridValue: {
//     color: "#dc2626",
//   },
// });



















// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useNavigation } from "@react-navigation/native";
// import dayjs from "dayjs";
// import isoWeek from "dayjs/plugin/isoWeek";
// import { Image } from "expo-image";
// import { router, usePathname } from "expo-router"; // ✅ added usePathname
// import { useEffect, useState } from "react";
// import {
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";

// import { partnerApi } from "../lib/api";
// dayjs.extend(isoWeek);

// export default function Dashboard() {
//   const pathname = usePathname();

//   const [data, setData] = useState<any[]>([]);
//   const [filterDate, setFilterDate] = useState("");
//   const [sortBy, setSortBy] = useState<"recent" | "date" | "name">("recent");
//   const [showSortOptions, setShowSortOptions] = useState(false);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<any>(null);
//   const [showModal, setShowModal] = useState(false);

//   const [totalEarnings, setTotalEarnings] = useState(0);
//   const [weeklyEarnings, setWeeklyEarnings] = useState(0);
//   const [monthlyEarnings, setMonthlyEarnings] = useState(0);
//   const [cancellationFee, setCancellationFee] = useState(0);

//   const pendingEarnings = data
//     .filter((item) => item.payment_status?.toLowerCase() !== "paid")
//     .reduce((sum, item) => sum + Number(item.staff_earned_amount || 0), 0);

//   const [filter, setFilter] = useState("ALL");
//   const [refreshing, setRefreshing] = useState(false);

//   const navigation = useNavigation();

//   useEffect(() => {
//     loadCompleted();
//   }, []);

//   useEffect(() => {
//     loadCompleted(filterDate || undefined);
//   }, [sortBy]);

//   const updateStaffProfile = async () => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();

//       if (!userData?.user?.email) return;

//       const { error } = await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings: totalEarnings,
//           weekly_earnings: weeklyEarnings,
//         })
//         .eq("email", userData.user.email);

//       if (error) {
//         console.log("Update error:", error);
//       } else {
//         console.log("✅ Staff profile updated");
//       }
//     } catch (err) {
//       console.log("Unexpected error:", err);
//     }
//   };

//   const updateMonthlyJSON = async (bookings: any[]) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;
//       if (!email) return;

//       const newMonthlyJSON: any = {};

//       bookings.forEach((item) => {
//         const key = dayjs(item.work_ended_at).format("YYYY-MM");
//         const amount = Number(item.staff_earned_amount || 0);

//         if (!newMonthlyJSON[key]) {
//           newMonthlyJSON[key] = 0;
//         }

//         newMonthlyJSON[key] += amount;
//       });

//       await supabase
//         .from("staff_profile")
//         .update({
//           monthly_earnings_json: newMonthlyJSON,
//         })
//         .eq("email", email);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const updateWeeklyJSON = async (bookings: any[]) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;
//       if (!email) return;

//       const newWeeklyJSON: any = {};

//       bookings.forEach((item) => {
//         const d = dayjs(item.work_ended_at);
//         const yearMonth = d.format("YYYY-MM");
//         const day = d.date();
//         const dateStr = d.format("YYYY-MM-DD");
//         const amount = Number(item.staff_earned_amount || 0);

//         if (!newWeeklyJSON[yearMonth]) {
//           newWeeklyJSON[yearMonth] = {
//             week1: {},
//             week2: {},
//             week3: {},
//             week4: {},
//           };
//         }

//         let weekKey = "week4";
//         if (day <= 7) weekKey = "week1";
//         else if (day <= 14) weekKey = "week2";
//         else if (day <= 21) weekKey = "week3";

//         if (!newWeeklyJSON[yearMonth][weekKey][dateStr]) {
//           newWeeklyJSON[yearMonth][weekKey][dateStr] = 0;
//         }

//         newWeeklyJSON[yearMonth][weekKey][dateStr] += amount;
//       });

//       await supabase
//         .from("staff_profile")
//         .update({
//           weekly_earnings_json: newWeeklyJSON,
//         })
//         .eq("email", email);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const updateAllEarnings = async () => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;

//       if (!email) return;

//       const { data: bookings } = await supabase
//         .from("bookings")
//         .select("staff_earned_amount, work_ended_at")
//         .eq("assigned_staff_email", email)
//         .eq("work_status", "COMPLETED");

//       const now = new Date();

//       let total = 0;
//       let weekly = 0;
//       let monthly = 0;
//       let weeklyJSON: any = {};

//       bookings?.forEach((item: any) => {
//         const amount = Number(item.AMOUNT || 0);
//         const date = new Date(item.earned_at);
//         total += amount;

//         const d = dayjs(date);
//         const yearMonth = d.format("YYYY-MM");
//         const day = d.date();

//         // ✅ Weekly (last 7 days - for dashboard card)
//         const oneWeekAgo = new Date();
//         oneWeekAgo.setDate(new Date().getDate() - 7);

//         // ✅ Monthly
//         if (
//           date.getMonth() === new Date().getMonth() &&
//           date.getFullYear() === new Date().getFullYear()
//         ) {
//           monthly += amount;
//         }

//         // 🔥 WEEKLY JSON (MAIN PART)
//         if (!weeklyJSON[yearMonth]) {
//           weeklyJSON[yearMonth] = {
//             week1: 0,
//             week2: 0,
//             week3: 0,
//             week4: 0,
//           };
//         }

//         if (day <= 7) weeklyJSON[yearMonth].week1 += amount;
//         else if (day <= 14) weeklyJSON[yearMonth].week2 += amount;
//         else if (day <= 21) weeklyJSON[yearMonth].week3 += amount;
//         else weeklyJSON[yearMonth].week4 += amount;
//       });

//       // 🔥 UPDATE EVERYTHING IN ONE CALL
//       const { error } = await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings: total,
//           weekly_earnings: weekly,
//           monthly_earnings: monthly,
//           weekly_earnings_json: weeklyJSON, // ✅ ADD THIS
//         })
//         .eq("email", email);

//       if (error) console.log("Update error:", error);
//       else console.log("✅ All earnings updated");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const updateTotalJSON = async (bookings: any[]) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;
//       if (!email) return;

//       const newTotalJSON: any = {};

//       bookings.forEach((item) => {
//         const date = dayjs(item.work_ended_at).format("YYYY-MM-DD");
//         const amount = Number(item.staff_earned_amount || 0);

//         if (!newTotalJSON[date]) {
//           newTotalJSON[date] = 0;
//         }

//         newTotalJSON[date] += amount;
//       });

//       await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings_json: newTotalJSON,
//         })
//         .eq("email", email);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchCancellationFee = async () => {
//     try {
//       const { data: user } = await supabase.auth.getUser();
//       const email = user.user?.email;
//       if (!email) return;

//       // Primary: query staff_cancellations table
//       const { data: cancelLogs } = await supabase
//         .from("staff_cancellations")
//         .select("cancellation_fee")
//         .eq("staff_email", email);

//       if (cancelLogs && cancelLogs.length > 0) {
//         const totalFee = cancelLogs.reduce(
//           (sum, item) => sum + Number(item.cancellation_fee || 0),
//           0
//         );
//         setCancellationFee(totalFee);
//         return;
//       }

//       // Fallback: query bookings table for work_status = CANCELLED
//       const { count } = await supabase
//         .from("bookings")
//         .select("*", { count: "exact", head: true })
//         .eq("assigned_staff_email", email)
//         .eq("work_status", "CANCELLED");

//       setCancellationFee((count || 0) * 99);
//     } catch (err) {
//       console.log("Error fetching cancellation fee:", err);
//     }
//   };

//   useEffect(() => {
//     fetchEarnings();
//     fetchCancellationFee();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);

//     try {
//       await loadCompleted(); // your existing function
//       await fetchEarnings(); // earnings function we created
//       await fetchCancellationFee();
//     } catch (err) {
//       console.log("Refresh error:", err);
//     }

//     setRefreshing(false);
//   };
//   /* ================= LOAD COMPLETED ================= */
//   const loadCompleted = async (date?: string) => {
//   try {
//     console.log("📡 Loading completed services from FastAPI...");

//     const response: any =
//       await partnerApi.bookings("completed");

//     console.log(
//       "✅ Completed services response:",
//       response
//     );

//     let bookings = response?.data || [];

//     if (!Array.isArray(bookings)) {
//       bookings = [];
//     }

//     // =====================================================
//     // DATE FILTER
//     // =====================================================

//     if (date) {
//       bookings = bookings.filter((item: any) => {
//         if (!item.work_ended_at) {
//           return false;
//         }

//         const itemDate = dayjs(
//           item.work_ended_at
//         ).format("YYYY-MM-DD");

//         return itemDate === date;
//       });
//     }

//     // =====================================================
//     // SORT
//     // =====================================================

//     if (sortBy === "recent") {
//       bookings.sort(
//         (a: any, b: any) =>
//           new Date(
//             b.work_ended_at || 0
//           ).getTime() -
//           new Date(
//             a.work_ended_at || 0
//           ).getTime()
//       );
//     }

//     if (sortBy === "date") {
//       bookings.sort(
//         (a: any, b: any) =>
//           new Date(
//             a.work_ended_at || 0
//           ).getTime() -
//           new Date(
//             b.work_ended_at || 0
//           ).getTime()
//       );
//     }

//     if (sortBy === "name") {
//       bookings.sort(
//         (a: any, b: any) =>
//           String(
//             a.customer_name || ""
//           ).localeCompare(
//             String(
//               b.customer_name || ""
//             )
//           )
//       );
//     }

//     setData(bookings);

//   } catch (error: any) {

//     console.error(
//       "❌ Failed to load completed services:",
//       error?.message || error
//     );

//     setData([]);

//   }
// };

//   const filteredData = data.filter((item) => {
//     const date = new Date(item.work_ended_at);
//     const now = new Date();

//     if (filter === "WEEKLY") {
//       const oneWeekAgo = new Date();
//       oneWeekAgo.setDate(now.getDate() - 7);
//       return date >= oneWeekAgo;
//     }

//     if (filter === "MONTHLY") {
//       return (
//         date.getMonth() === now.getMonth() &&
//         date.getFullYear() === now.getFullYear()
//       );
//     }

//     return true; // ALL
//   });

//   const saveEarningsToProfile = async (
//     total: number,
//     weekly: number,
//     monthly: number,
//   ) => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;

//       if (!email) return;

//       const { error } = await supabase
//         .from("staff_profile")
//         .update({
//           total_earnings: total,
//           weekly_earnings: weekly,
//           monthly_earnings: monthly,
//         })
//         .eq("email", email);

//       if (error) {
//         console.log("Save error:", error);
//       } else {
//         console.log("✅ Earnings saved to Supabase");
//       }
//     } catch (err) {
//       console.log("Unexpected error:", err);
//     }
//   };

//   /* ================= Fetch Earnings ================= */

//   const fetchEarnings = async () => {
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       const email = userData?.user?.email;

//       if (!email) return;

//       const { data, error } = await supabase
//         .from("staff_earnings")
//         .select(
//           `
//     AMOUNT,
//     earned_at,
//     payment_status
//   `,
//         )
//         .eq("staff_email", email)
//         .eq("payment_status", "paid");
//       if (error) {
//         console.log("Error fetching earnings:", error);
//         return;
//       }

//       if (data) {
//         const paidBookings =
//           data?.filter(
//             (item) => item.payment_status?.toLowerCase() === "paid",
//           ) || [];

//         updateMonthlyJSON(paidBookings);
//         updateWeeklyJSON(paidBookings);
//         updateTotalJSON(paidBookings);
//       }

//       const now = new Date();

//       let total = 0;
//       let weekly = 0;
//       let monthly = 0;

//       const oneWeekAgo = new Date();
//       oneWeekAgo.setDate(now.getDate() - 7);

//       data?.forEach((item) => {
//         const amount = Number(item.AMOUNT || 0);
//         const date = new Date(item.earned_at);
//         total += amount;

//         const d = dayjs(date);

//         // ✅ WEEKLY FIX HERE
//         const currentWeekStart = dayjs().startOf("week");
//         const currentWeekEnd = dayjs().endOf("week");

//         if (d.isBetween(currentWeekStart, currentWeekEnd, null, "[]")) {
//           weekly += amount;
//         }

//         // ✅ Monthly
//         if (
//           date.getMonth() === now.getMonth() &&
//           date.getFullYear() === now.getFullYear()
//         ) {
//           monthly += amount;
//         }
//       });

//       setTotalEarnings(total);
//       setWeeklyEarnings(weekly);
//       setMonthlyEarnings(monthly);

//       saveEarningsToProfile(total, weekly, monthly);
//     } catch (err) {
//       console.log("Unexpected error:", err);
//     }
//   };

//   /* ================= FORMAT DATE ================= */
//   const formatDateTime = (value: string) => {
//     const d = new Date(value);
//     return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     })}`;
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />
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
//             router.canGoBack() ? router.back() : router.replace("/my-role")
//           }
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>
//       {/* ================= TOTAL COUNT ================= */}
//       <View style={styles.summaryContainer}>
//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => setFilter("ALL")}
//         >
//           <Text style={styles.gridTitle}>Total Completed</Text>
//           <Text style={styles.gridValue}>{data.length}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => router.push("./total-earnings")} // ✅ ADD THIS
//         >
//           <Text style={styles.gridTitle}>Paid Earnings</Text>
//           <Text style={styles.gridValue}>₹{totalEarnings}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => router.push("/weekly-screen")}
//         >
//           <Text style={styles.gridTitle}>Weekly</Text>
//           <Text style={styles.gridValue}>₹{weeklyEarnings}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.gridBox}
//           onPress={() => router.push("/monthly-screen")}
//         >
//           <Text style={styles.gridTitle}>Monthly</Text>
//           <Text style={styles.gridValue}>₹{monthlyEarnings}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.gridBox, styles.pendingGridBox]}
//           onPress={() => router.push("./pending-payments")}
//         >
//           <Text style={[styles.gridTitle, styles.pendingGridTitle]}>
//             Pending Payments
//           </Text>
//           <Text style={[styles.gridValue, styles.pendingGridValue]}>
//             ₹{pendingEarnings}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.gridBox, styles.cancellationGridBox]}
//           onPress={() => router.push("./cancellations")}
//         >
//           <Text style={[styles.gridTitle, styles.cancellationGridTitle]}>
//             Cancellation
//           </Text>
//           <Text style={[styles.gridValue, styles.cancellationGridValue]}>
//             ₹{cancellationFee}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* ================= FILTER ================= */}
//       <View style={styles.filterRow}>
//         <View style={styles.filterBox}>
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
//             onPress={() => setShowCalendar(true)}
//           >
//             <Ionicons
//               name="calendar-outline"
//               size={20}
//               color="#000"
//               style={{ marginRight: 8 }}
//             />

//             <TextInput
//               placeholder="YYYY-MM-DD"
//               placeholderTextColor="#000"
//               value={filterDate}
//               keyboardType="number-pad"
//               maxLength={10}
//               onChangeText={(v) => {
//                 const digits = v.replace(/[^0-9]/g, "");

//                 let formatted = digits;

//                 if (digits.length > 4) {
//                   formatted = digits.slice(0, 4) + "-" + digits.slice(4);
//                 }
//                 if (digits.length > 6) {
//                   formatted =
//                     digits.slice(0, 4) +
//                     "-" +
//                     digits.slice(4, 6) +
//                     "-" +
//                     digits.slice(6, 8);
//                 }

//                 setFilterDate(formatted);

//                 if (formatted.length === 10) loadCompleted(formatted);
//                 if (formatted.length === 0) loadCompleted();
//               }}
//               style={styles.filterInput}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={{ marginLeft: 10 }}>
//           <TouchableOpacity
//             style={styles.sortBtn}
//             onPress={() => setShowSortOptions(!showSortOptions)}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Text style={styles.sortText}>
//                 {sortBy === "recent"
//                   ? "Recent"
//                   : sortBy === "date"
//                     ? "Oldest"
//                     : "Name"}
//               </Text>
//               <Ionicons
//                 name={showSortOptions ? "chevron-up" : "chevron-down"}
//                 size={18}
//                 color="#000"
//                 style={{ marginLeft: 5 }}
//               />
//             </View>
//           </TouchableOpacity>

//           {showSortOptions && (
//             <View style={styles.dropdown}>
//               <TouchableOpacity
//                 style={styles.dropdownItem}
//                 onPress={() => {
//                   setSortBy("recent");
//                   setShowSortOptions(false);
//                 }}
//               >
//                 <Text>Recent</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dropdownItem}
//                 onPress={() => {
//                   setSortBy("date");
//                   setShowSortOptions(false);
//                 }}
//               >
//                 <Text>Oldest</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dropdownItem}
//                 onPress={() => {
//                   setSortBy("name");
//                   setShowSortOptions(false);
//                 }}
//               >
//                 <Text>Name</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//       {showCalendar && (
//         <DateTimePicker
//           value={new Date()}
//           mode="date"
//           display="default"
//           onChange={(event, selectedDate) => {
//             setShowCalendar(false);
//             if (selectedDate) {
//               const year = selectedDate.getFullYear();
//               const month = String(selectedDate.getMonth() + 1).padStart(
//                 2,
//                 "0",
//               );
//               const day = String(selectedDate.getDate()).padStart(2, "0");

//               const formatted = `${year}-${month}-${day}`;
//               setFilterDate(formatted);
//               loadCompleted(formatted);
//             }
//           }}
//         />
//       )}
//       {/* ================= BODY ================= */}
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{
//           padding: 16,
//           paddingBottom: 120,
//           flexGrow: 1, // ✅ IMPORTANT
//         }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         alwaysBounceVertical={true}
//       >
//         {data.length === 0 ? (
//           <Text style={styles.empty}>No completed services</Text>
//         ) : null}

//         {filteredData.map((item, i) => (
//           <View key={i} style={styles.card}>
//             {/* TOP ROW */}
//             <View style={styles.cardTop}>
//               <Text style={styles.name}>{item.customer_name}</Text>

//               <View style={styles.rightContainer}>
//                 <Text
//                   style={[
//                     styles.completedBadge,
//                     item.payment_status?.toLowerCase() === "paid"
//                       ? styles.paidBadge
//                       : styles.pendingBadge,
//                   ]}
//                 >
//                   COMPLETED
//                 </Text>
//                 <Text
//                   style={[
//                     styles.amountText,
//                     {
//                       color:
//                         item.payment_status?.toLowerCase() === "paid"
//                           ? "#16a34a"
//                           : "#f97316",
//                     },
//                   ]}
//                 >
//                   + ₹{Number(item.staff_earned_amount || 0)}
//                 </Text>
//               </View>
//             </View>

//             {/* BUTTON */}
//             <TouchableOpacity
//               style={styles.viewBtn}
//               onPress={() => {
//                 setSelectedItem(item);
//                 setShowModal(true);
//               }}
//             >
//               <Text style={styles.viewText}>View Details</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </ScrollView>
//       {showModal && selectedItem && (
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Service Details</Text>

//             <Text style={styles.modalText}>
//               Name: {selectedItem.customer_name}
//             </Text>

//             <Text style={styles.modalText}>Email: {selectedItem.email}</Text>

//             <Text style={styles.modalText}>Services:</Text>

//             {selectedItem.services?.map((s: any, i: number) => (
//               <View key={i} style={{ marginLeft: 10, marginTop: 5 }}>
//                 <Text>• {s.title}</Text>
//                 <Text style={{ color: "#252424" }}>Duration: {s.duration}</Text>
//               </View>
//             ))}

//             <Text style={styles.modalText}>
//               Completed: {formatDateTime(selectedItem.work_ended_at)}
//             </Text>

//             {selectedItem.worked_duration && (
//               <Text style={styles.modalText}>
//                 Worked Time: {selectedItem.worked_duration}
//               </Text>
//             )}

//             {selectedItem.staff_earned_amount > 0 && (
//               <Text style={styles.modalText}>
//                 Amount Earned: ₹{selectedItem.staff_earned_amount}
//               </Text>
//             )}

//             <TouchableOpacity
//               style={styles.closeBtn}
//               onPress={() => setShowModal(false)}
//             >
//               <Text style={{ color: "#000000", fontWeight: "700" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//       {/* ================= UPDATED FOOTER ONLY =================
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.replace("/my-role")}
//         >
//           <Ionicons
//             name={pathname === "/my-role" ? "home" : "home-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/my-role"
//                 ? styles.footerTextActive
//                 : styles.footerText
//             }
//           >
//             Home
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.replace("/dashboard")}
//         >
//           <Ionicons
//             name={pathname === "/dashboard" ? "calendar" : "calendar-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/dashboard"
//                 ? styles.footerTextActive
//                 : styles.footerText
//             }
//           >
//             Dashboard
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.replace("/my-account")}
//         >
//           <Ionicons
//             name={pathname === "/my-account" ? "person" : "person-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/my-account"
//                 ? styles.footerTextActive
//                 : styles.footerText
//             }
//           >
//             Profile
//           </Text>
//         </TouchableOpacity>
//       </View> */}
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */

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

//   countBox: {
//     marginHorizontal: 20,
//     marginTop: 10,
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: "#ecfdf5",
//     borderWidth: 1,
//     borderColor: "#cad84b",
//   },

//   countText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#065f46",
//   },

//   countNumber: {
//     fontSize: 18,
//     fontWeight: "800",
//   },

//   filterBox: {
//     flex: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderRadius: 12,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   filterInput: {
//     flex: 1,
//   },

//   body: {
//     padding: 20,
//     paddingBottom: 20,
//   },

//   empty: {
//     textAlign: "center",
//     marginTop: 40,
//     color: "#666",
//     fontWeight: "600",
//   },

//   card: {
//     borderWidth: 1.5,
//     borderColor: "#b5ca42",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     backgroundColor: "#fff", // ✅ makes it cleaner
//   },

//   name: {
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   email: {
//     color: "#555",
//   },

//   date: {
//     marginTop: 4,
//     fontSize: 12,
//     color: "#374151",
//   },

//   completed: {
//     color: "#16a34a",
//     fontWeight: "800",
//   },

//   // footer: {
//   //   height: 70,
//   //   backgroundColor: "#ffffff",
//   //   flexDirection: "row",
//   //   justifyContent: "space-around",
//   //   alignItems: "center",
//   // },

//   // footerItem: {
//   //   alignItems: "center",
//   //   justifyContent: "center",
//   // },

//   // footerText: {
//   //   fontSize: 12,
//   //   marginTop: 4,
//   //   fontWeight: "600",
//   //   color: "#000",
//   // },

//   // footerTextActive: {
//   //   fontSize: 12,
//   //   marginTop: 4,
//   //   fontWeight: "800",
//   //   color: "#000",
//   // },

//   worked: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#16a34a",
//   },

//   dropdown: {
//     position: "absolute",
//     top: 55,
//     right: 0,
//     width: 120,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     elevation: 5,
//     zIndex: 999,
//   },

//   dropdownItem: {
//     padding: 10,
//     borderBottomWidth: 0.5,
//     borderColor: "#eee",
//   },

//   filterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 10,
//     zIndex: 1000,
//   },

//   sortBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderRadius: 12,
//     borderColor: "#000",
//     marginLeft: 10,
//   },

//   sortText: {
//     fontWeight: "700",
//   },

//   completedBtn: {
//     marginTop: 10,
//     backgroundColor: "#dcfce7",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     alignSelf: "flex-start",
//   },

//   completedText: {
//     color: "#16a34a",
//     fontWeight: "800",
//   },

//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 2000,
//   },

//   modalBox: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     marginBottom: 10,
//   },

//   modalText: {
//     marginBottom: 6,
//     color: "#333",
//   },

//   closeBtn: {
//     marginTop: 15,
//     backgroundColor: "#FFD700",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   cardTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   completedBadge: {
//     color: "#16a34a",
//     fontWeight: "800",
//     backgroundColor: "#dcfce7",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     fontSize: 12,
//   },

//   viewBtn: {
//     marginTop: 12,
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 15,
//     alignSelf: "center",

//     borderWidth: 1.5, // ✅ add border
//     borderColor: "#000", // ✅ match your theme color
//   },

//   viewText: {
//     color: "#000",
//     fontWeight: "700",
//     fontSize: 13,
//   },

//   amountRow: {
//     alignItems: "flex-end", // 👈 pushes to right
//     marginTop: 6,
//   },

//   rightContainer: {
//     alignItems: "center", // 👈 centers amount under badge
//   },

//   amountText: {
//     marginTop: 6, // 👈 spacing between COMPLETED & amount
//     color: "#16a34a",
//     fontWeight: "800",
//     fontSize: 16,
//   },

//   summaryContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginTop: 10,
//   },

//   gridBox: {
//     width: "48%", // 🔥 THIS CREATES 2 COLUMNS
//     backgroundColor: "#E6F4EA",
//     borderRadius: 16,
//     paddingVertical: 16,
//     paddingHorizontal: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#A3D9A5",

//     // 🔥 premium look
//     elevation: 3,
//   },

//   gridTitle: {
//     fontSize: 13,
//     color: "#2E7D32",
//     marginBottom: 6,
//   },

//   gridValue: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1B5E20",
//   },

//   summaryBox: {
//     backgroundColor: "#E6F4EA",
//     borderRadius: 16,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#A3D9A5",
//     elevation: 2,
//   },

//   summaryText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1B5E20",
//   },

//   paidBadge: {
//     backgroundColor: "#dcfce7",
//     color: "#16a34a",
//   },

//   pendingBadge: {
//     backgroundColor: "#ffedd5",
//     color: "#f97316",
//   },

//   pendingGridBox: {
//     backgroundColor: "#fff7ed",
//     borderColor: "#fed7aa",
//     borderWidth: 1.5,
//   },

//   pendingGridTitle: {
//     color: "#c2410c",
//   },

//   pendingGridValue: {
//     color: "#f97316",
//   },

//   cancellationGridBox: {
//     backgroundColor: "#fef2f2",
//     borderColor: "#fca5a5",
//     borderWidth: 1.5,
//   },

//   cancellationGridTitle: {
//     color: "#b91c1c",
//   },

//   cancellationGridValue: {
//     color: "#dc2626",
//   },
// });

















import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { partnerApi } from "../lib/api";

dayjs.extend(isoWeek);

export default function Dashboard() {
  const pathname = usePathname();

  const [data, setData] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "date" | "name">("recent");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [cancellationFee, setCancellationFee] = useState(0);

  const pendingEarnings = data
    .filter((item) => item.payment_status?.toLowerCase() !== "paid")
    .reduce((sum, item) => sum + Number(item.staff_earned_amount || 0), 0);

  const [filter, setFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  /* ================= LOAD COMPLETED ================= */
  const loadCompleted = async (date?: string) => {
    try {
      console.log("📡 Loading completed services from FastAPI...");

      const response: any = await partnerApi.bookings("completed");

      console.log("✅ Completed services response:", response);

      let bookings = response?.data || [];

      if (!Array.isArray(bookings)) {
        bookings = [];
      }

      // =====================================================
      // DATE FILTER
      // =====================================================

      if (date) {
        bookings = bookings.filter((item: any) => {
          if (!item.work_ended_at) {
            return false;
          }

          const itemDate = dayjs(item.work_ended_at).format("YYYY-MM-DD");

          return itemDate === date;
        });
      }

      // =====================================================
      // SORT
      // =====================================================

      if (sortBy === "recent") {
        bookings.sort(
          (a: any, b: any) =>
            new Date(b.work_ended_at || 0).getTime() -
            new Date(a.work_ended_at || 0).getTime()
        );
      }

      if (sortBy === "date") {
        bookings.sort(
          (a: any, b: any) =>
            new Date(a.work_ended_at || 0).getTime() -
            new Date(b.work_ended_at || 0).getTime()
        );
      }

      if (sortBy === "name") {
        bookings.sort(
          (a: any, b: any) =>
            String(a.customer_name || "").localeCompare(
              String(b.customer_name || "")
            )
        );
      }

      setData(bookings);
    } catch (error: any) {
      console.error("❌ Failed to load completed services:", error?.message || error);
      setData([]);
    }
  };

  /* ================= LOAD DASHBOARD SUMMARY ================= */
  const loadDashboardSummary = async () => {
    try {
      console.log("📡 Loading partner dashboard from FastAPI...");

      const response: any = await partnerApi.dashboard();

      console.log("✅ Partner dashboard response:", response);

      const dashboard = response?.data || response;

      if (!dashboard) {
        console.log("⚠️ No dashboard data received");
        return;
      }

      // ============================
      // EARNINGS
      // ============================

      setTotalEarnings(Number(dashboard?.earnings?.total || 0));
      setWeeklyEarnings(Number(dashboard?.earnings?.weekly || 0));
      setMonthlyEarnings(Number(dashboard?.earnings?.monthly || 0));

      // ============================
      // CANCELLATION
      // ============================

      /*
       * The current FastAPI dashboard response
       * does not expose cancellation fee.
       *
       * Therefore do not query Supabase here.
       *
       * Cancellation amount will be supplied by
       * the backend once the cancellation summary
       * field is added.
       */
    } catch (error: any) {
      console.error("❌ Failed to load dashboard summary:", error?.message || error);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadDashboardSummary();
  }, []);

  useEffect(() => {
    loadCompleted(filterDate || undefined);
  }, [sortBy]);

  /* ================= PULL TO REFRESH ================= */
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([loadCompleted(), loadDashboardSummary()]);
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatDateTime = (value: string) => {
    const d = new Date(value);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const filteredData = data.filter((item) => {
    const date = new Date(item.work_ended_at);
    const now = new Date();

    if (filter === "WEEKLY") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo;
    }

    if (filter === "MONTHLY") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true; // ALL
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />
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
            router.canGoBack() ? router.back() : router.replace("/my-role")
          }
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* ================= TOTAL COUNT ================= */}
      <View style={styles.summaryContainer}>
        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => setFilter("ALL")}
        >
          <Text style={styles.gridTitle}>Total Completed</Text>
          <Text style={styles.gridValue}>{data.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => router.push("./total-earnings")}
        >
          <Text style={styles.gridTitle}>Paid Earnings</Text>
          <Text style={styles.gridValue}>₹{totalEarnings}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => router.push("/weekly-screen")}
        >
          <Text style={styles.gridTitle}>Weekly</Text>
          <Text style={styles.gridValue}>₹{weeklyEarnings}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridBox}
          onPress={() => router.push("/monthly-screen")}
        >
          <Text style={styles.gridTitle}>Monthly</Text>
          <Text style={styles.gridValue}>₹{monthlyEarnings}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridBox, styles.pendingGridBox]}
          onPress={() => router.push("./pending-payments")}
        >
          <Text style={[styles.gridTitle, styles.pendingGridTitle]}>
            Pending Payments
          </Text>
          <Text style={[styles.gridValue, styles.pendingGridValue]}>
            ₹{pendingEarnings}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridBox, styles.cancellationGridBox]}
          onPress={() => router.push("./cancellations")}
        >
          <Text style={[styles.gridTitle, styles.cancellationGridTitle]}>
            Cancellation
          </Text>
          <Text style={[styles.gridValue, styles.cancellationGridValue]}>
            ₹{cancellationFee}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= FILTER ================= */}
      <View style={styles.filterRow}>
        <View style={styles.filterBox}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#000"
              style={{ marginRight: 8 }}
            />

            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#000"
              value={filterDate}
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={(v) => {
                const digits = v.replace(/[^0-9]/g, "");

                let formatted = digits;

                if (digits.length > 4) {
                  formatted = digits.slice(0, 4) + "-" + digits.slice(4);
                }
                if (digits.length > 6) {
                  formatted =
                    digits.slice(0, 4) +
                    "-" +
                    digits.slice(4, 6) +
                    "-" +
                    digits.slice(6, 8);
                }

                setFilterDate(formatted);

                if (formatted.length === 10) loadCompleted(formatted);
                if (formatted.length === 0) loadCompleted();
              }}
              style={styles.filterInput}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.sortText}>
                {sortBy === "recent"
                  ? "Recent"
                  : sortBy === "date"
                  ? "Oldest"
                  : "Name"}
              </Text>
              <Ionicons
                name={showSortOptions ? "chevron-up" : "chevron-down"}
                size={18}
                color="#000"
                style={{ marginLeft: 5 }}
              />
            </View>
          </TouchableOpacity>

          {showSortOptions && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSortBy("recent");
                  setShowSortOptions(false);
                }}
              >
                <Text>Recent</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSortBy("date");
                  setShowSortOptions(false);
                }}
              >
                <Text>Oldest</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSortBy("name");
                  setShowSortOptions(false);
                }}
              >
                <Text>Name</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {showCalendar && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowCalendar(false);
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(
                2,
                "0"
              );
              const day = String(selectedDate.getDate()).padStart(2, "0");

              const formatted = `${year}-${month}-${day}`;
              setFilterDate(formatted);
              loadCompleted(formatted);
            }
          }}
        />
      )}
      {/* ================= BODY ================= */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        alwaysBounceVertical={true}
      >
        {data.length === 0 ? (
          <Text style={styles.empty}>No completed services</Text>
        ) : null}

        {filteredData.map((item, i) => (
          <View key={i} style={styles.card}>
            {/* TOP ROW */}
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.customer_name}</Text>

              <View style={styles.rightContainer}>
                <Text
                  style={[
                    styles.completedBadge,
                    item.payment_status?.toLowerCase() === "paid"
                      ? styles.paidBadge
                      : styles.pendingBadge,
                  ]}
                >
                  COMPLETED
                </Text>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color:
                        item.payment_status?.toLowerCase() === "paid"
                          ? "#16a34a"
                          : "#f97316",
                    },
                  ]}
                >
                  + ₹{Number(item.staff_earned_amount || 0)}
                </Text>
              </View>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => {
                setSelectedItem(item);
                setShowModal(true);
              }}
            >
              <Text style={styles.viewText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {showModal && selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Service Details</Text>

            <Text style={styles.modalText}>
              Name: {selectedItem.customer_name}
            </Text>

            <Text style={styles.modalText}>Email: {selectedItem.email}</Text>

            <Text style={styles.modalText}>Services:</Text>

            {selectedItem.services?.map((s: any, i: number) => (
              <View key={i} style={{ marginLeft: 10, marginTop: 5 }}>
                <Text>• {s.title}</Text>
                <Text style={{ color: "#252424" }}>Duration: {s.duration}</Text>
              </View>
            ))}

            <Text style={styles.modalText}>
              Completed: {formatDateTime(selectedItem.work_ended_at)}
            </Text>

            {selectedItem.worked_duration && (
              <Text style={styles.modalText}>
                Worked Time: {selectedItem.worked_duration}
              </Text>
            )}

            {selectedItem.staff_earned_amount > 0 && (
              <Text style={styles.modalText}>
                Amount Earned: ₹{selectedItem.staff_earned_amount}
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: "#000000", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

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

  countBox: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#cad84b",
  },

  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065f46",
  },

  countNumber: {
    fontSize: 18,
    fontWeight: "800",
  },

  filterBox: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  filterInput: {
    flex: 1,
  },

  body: {
    padding: 20,
    paddingBottom: 20,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontWeight: "600",
  },

  card: {
    borderWidth: 1.5,
    borderColor: "#b5ca42",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
  },

  name: {
    fontWeight: "800",
    fontSize: 15,
  },

  email: {
    color: "#555",
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#374151",
  },

  completed: {
    color: "#16a34a",
    fontWeight: "800",
  },

  worked: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
  },

  dropdown: {
    position: "absolute",
    top: 55,
    right: 0,
    width: 120,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    elevation: 5,
    zIndex: 999,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    zIndex: 1000,
  },

  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#000",
    marginLeft: 10,
  },

  sortText: {
    fontWeight: "700",
  },

  completedBtn: {
    marginTop: 10,
    backgroundColor: "#dcfce7",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  completedText: {
    color: "#16a34a",
    fontWeight: "800",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  modalText: {
    marginBottom: 6,
    color: "#333",
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  completedBadge: {
    color: "#16a34a",
    fontWeight: "800",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },

  viewBtn: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignSelf: "center",
    borderWidth: 1.5,
    borderColor: "#000",
  },

  viewText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },

  amountRow: {
    alignItems: "flex-end",
    marginTop: 6,
  },

  rightContainer: {
    alignItems: "center",
  },

  amountText: {
    marginTop: 6,
    color: "#16a34a",
    fontWeight: "800",
    fontSize: 16,
  },

  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },

  gridBox: {
    width: "48%",
    backgroundColor: "#E6F4EA",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A3D9A5",
    elevation: 3,
  },

  gridTitle: {
    fontSize: 13,
    color: "#2E7D32",
    marginBottom: 6,
  },

  gridValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  summaryBox: {
    backgroundColor: "#E6F4EA",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A3D9A5",
    elevation: 2,
  },

  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
  },

  paidBadge: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },

  pendingBadge: {
    backgroundColor: "#ffedd5",
    color: "#f97316",
  },

  pendingGridBox: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderWidth: 1.5,
  },

  pendingGridTitle: {
    color: "#c2410c",
  },

  pendingGridValue: {
    color: "#f97316",
  },

  cancellationGridBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
    borderWidth: 1.5,
  },

  cancellationGridTitle: {
    color: "#b91c1c",
  },

  cancellationGridValue: {
    color: "#dc2626",
  },
});