// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router, useFocusEffect } from "expo-router";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Easing,
//   Linking,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import * as Notifications from "expo-notifications";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";

// const CANCELLATION_REASONS = [
//   "Medical Emergency",
//   "Personal Emergency",
//   "Vehicle Issue",
//   "Traffic Delay",
//   "Location Too Far",
//   "Safety Concern",
//   "Mobile Issue",
//   "Other (specify)",
// ];

// export default function AssignedServices() {
//   const [services, setServices] = useState<any[]>([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const scaleAnim = useRef(new Animated.Value(0)).current;

//   const [showApproveModal, setShowApproveModal] = useState(false);

//   /* 🔥 CANCELLATION STATES */
//   const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showCancelledSuccessModal, setShowCancelledSuccessModal] = useState(false);
//   const [cancelledSuccessFee, setCancelledSuccessFee] = useState(99);
//   const [selectedCancelBooking, setSelectedCancelBooking] = useState<any | null>(null);
//   const [cancelReason, setCancelReason] = useState("");
//   const [customReason, setCustomReason] = useState("");
//   const [loadingCancel, setLoadingCancel] = useState(false);

//   /* ================= LOAD SERVICES ================= */
//   const loadServices = async () => {
//     const { data } = await supabase.auth.getUser();
//     const email = data.user?.email;

//     const { data: bookings } = await supabase
//       .from("bookings")
//       .select("*")
//       .eq("assigned_staff_email", email)
//       .neq("work_status", "COMPLETED")
//       .neq("work_status", "CANCELLED");

//     if (!bookings || bookings.length === 0) {
//       setServices([]);
//       return;
//     }

//     const updatedBookings = await Promise.all(
//       bookings.map(async (booking: any) => {
//         let cancelAmount = 99; // fallback default

//         // Extract service id(s) from booking.services
//         let serviceIds: string[] = [];
//         if (Array.isArray(booking.services)) {
//           serviceIds = booking.services
//             .map((s: any) => (typeof s === "object" ? s?.id : s))
//             .filter(Boolean);
//         } else if (booking.services && typeof booking.services === "object") {
//           if (booking.services.id) serviceIds.push(booking.services.id);
//         }

//         if (serviceIds.length > 0) {
//           try {
//             const { data: serviceRows } = await supabase
//               .from("services")
//               .select("partner_cancellation_amount")
//               .in("id", serviceIds);

//             if (serviceRows && serviceRows.length > 0) {
//               const validAmounts = serviceRows
//                 .map((r: any) => Number(r?.partner_cancellation_amount))
//                 .filter((amt: number) => !isNaN(amt) && amt > 0);

//               if (validAmounts.length > 0) {
//                 cancelAmount = validAmounts[0];
//               }
//             }
//           } catch (err) {
//             console.log("Error fetching partner_cancellation_amount:", err);
//           }
//         }

//         return {
//           ...booking,
//           partner_cancellation_amount: cancelAmount,
//         };
//       })
//     );

//     setServices(updatedBookings);
//   };

//   const handleProceedCancel = () => {
//     const finalReason =
//       cancelReason === "Other (specify)" ? customReason.trim() : cancelReason;

//     if (!finalReason) {
//       Alert.alert("Reason Required", "Please select or specify a reason.");
//       return;
//     }

//     setShowCancelModal(false);
//     setShowConfirmModal(true);
//   };

//   const handleConfirmCancelSubmit = async () => {
//     const finalReason =
//       cancelReason === "Other (specify)" ? customReason.trim() : cancelReason;

//     if (!selectedCancelBooking) return;
//     setLoadingCancel(true);

//     const cancelFee = Number(
//       selectedCancelBooking?.partner_cancellation_amount ?? 99
//     );

//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const email = authData?.user?.email;

//       // 1. Update booking work_status to CANCELLED in bookings table
//       const { error: bookingError } = await supabase
//         .from("bookings")
//         .update({
//           work_status: "CANCELLED",
//         })
//         .eq("id", selectedCancelBooking.id);

//       if (bookingError) {
//         console.log("Error updating bookings table:", bookingError);
//         Alert.alert("Cancellation Failed", bookingError.message || "Failed to update booking.");
//         return;
//       }

//       // 2. Insert permanent log record into staff_cancellations table
//       if (email) {
//         const { error: insertErr } = await supabase
//           .from("staff_cancellations")
//           .insert({
//             booking_id: selectedCancelBooking.id,
//             staff_email: email,
//             customer_name: selectedCancelBooking.customer_name || "Customer",
//             cancellation_reason: finalReason,
//             cancellation_fee: cancelFee,
//             cancelled_at: new Date().toISOString(),
//           });

//         if (insertErr) {
//           console.log("staff_cancellations insert error:", insertErr);
//         }

//         // 2b. Insert cancellation notification with fare/fee details for staff member
//         try {
//           await supabase.from("notifications").insert({
//             staff_email: email,
//             title: "Service Cancelled ❌",
//             body: `Booking for ${selectedCancelBooking.customer_name || "Customer"} was cancelled. Cancellation fee: ₹${cancelFee}/- applied. Reason: ${finalReason}`,
//             type: "service_cancelled",
//             is_read: false,
//             created_at: new Date().toISOString(),
//           });

//           await Notifications.scheduleNotificationAsync({
//             content: {
//               title: "Service Cancelled ❌",
//               body: `Booking for ${selectedCancelBooking.customer_name || "Customer"} was cancelled. Fee: ₹${cancelFee}/- applied.`,
//               sound: "default",
//               data: { screen: "new-services" },
//             },
//             trigger: null,
//           });
//         } catch (notifErr) {
//           console.log("Notification insert error:", notifErr);
//         }
//       }

//       // 3. Sync total_cancellation_fee to staff_profile
//       if (email) {
//         try {
//           const { data: cancelLogs } = await supabase
//             .from("staff_cancellations")
//             .select("cancellation_fee")
//             .eq("staff_email", email);

//           let newTotalFee = 0;
//           if (cancelLogs && cancelLogs.length > 0) {
//             newTotalFee = cancelLogs.reduce(
//               (sum, item) => sum + Number(item.cancellation_fee || 0),
//               0
//             );
//           } else {
//             const { count } = await supabase
//               .from("bookings")
//               .select("*", { count: "exact", head: true })
//               .eq("assigned_staff_email", email)
//               .eq("work_status", "CANCELLED");

//             newTotalFee = (count || 0) * cancelFee;
//           }

//           await supabase
//             .from("staff_profile")
//             .update({ total_cancellation_fee: newTotalFee })
//             .eq("email", email);
//         } catch (e) {
//           console.log("Error updating staff_profile cancellation fee:", e);
//         }
//       }

//       setShowConfirmModal(false);
//       setCancelReason("");
//       setCustomReason("");
//       setSelectedCancelBooking(null);
//       setCancelledSuccessFee(cancelFee);
//       setShowCancelledSuccessModal(true);
//       await loadServices();
//     } catch (err: any) {
//       console.log("Cancellation error:", err);
//       Alert.alert("Error", err?.message || "An unexpected error occurred.");
//     } finally {
//       setLoadingCancel(false);
//     }
//   };

//   /* FIRST LOAD & REALTIME LISTENERS */
//   useEffect(() => {
//     loadServices();

//     const channel = supabase
//       .channel("assigned-bookings-realtime")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "bookings" },
//         async (payload: any) => {
//           if (payload?.eventType === "UPDATE" && payload?.new) {
//             const newBooking = payload.new;
//             const { data: authData } = await supabase.auth.getUser();
//             const userEmail = authData?.user?.email?.toLowerCase();

//             if (
//               newBooking.assigned_staff_email?.toLowerCase() === userEmail &&
//               newBooking.work_status === "CANCELLED"
//             ) {
//               try {
//                 await Notifications.scheduleNotificationAsync({
//                   content: {
//                     title: "Service Cancelled ❌",
//                     body: `Booking for ${newBooking.customer_name || "Customer"} was cancelled.`,
//                     sound: "default",
//                     data: { screen: "assigned-services" },
//                   },
//                   trigger: null,
//                 });
//               } catch (err) {}

//               setCancelledSuccessFee(newBooking.partner_cancellation_amount || 99);
//               setShowCancelledSuccessModal(true);
//             }
//           }
//           loadServices();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   /* RELOAD ON FOCUS */
//   useFocusEffect(
//     useCallback(() => {
//       loadServices();
//     }, []),
//   );

//   useEffect(() => {
//     if (showRejectModal || showApproveModal) {
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 250,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     } else {
//       scaleAnim.setValue(0);
//     }
//   }, [showRejectModal, showApproveModal]);
//   /* ================= PULL TO REFRESH ================= */
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadServices();
//     setRefreshing(false);
//   }, []);

//   /* ================= GOOGLE MAPS ================= */
//   const openMaps = (lat: number, lng: number) => {
//     if (!lat || !lng) {
//       Alert.alert("Location coordinates not available");
//       return;
//     }

//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     Linking.openURL(url);
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

//       {/* ================= BODY ================= */}
//       <ScrollView
//         contentContainerStyle={styles.body}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {services.length === 0 ? (
//           <Text style={styles.emptyText}>No Assigned Services</Text>
//         ) : (
//           services.map((item) => {
//             const isActive =
//               item.work_started_at &&
//               (!item.work_ended_at || item.work_ended_at === null);

//             return (
//               <View
//                 key={item.id}
//                 style={[
//                   styles.card,
//                   isActive && styles.activeHighlight,
//                 ]}
//               >
//                 {/* 🔥 HEADER ROW */}
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     position: "relative",
//                     zIndex: menuOpenId === item.id ? 999 : 1,
//                   }}
//                 >
//                   <Text style={styles.cardTitle}>{item.customer_name}</Text>

//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 10,
//                     }}
//                   >
//                     {isActive && (
//                       <View style={styles.activeBadge}>
//                         <Text style={styles.activeBadgeText}>ACTIVE</Text>
//                       </View>
//                     )}

//                     <TouchableOpacity
//                       onPress={() =>
//                         setMenuOpenId(menuOpenId === item.id ? null : item.id)
//                       }
//                       style={{ padding: 4 }}
//                     >
//                       <Ionicons
//                         name="ellipsis-vertical"
//                         size={20}
//                         color="#000"
//                       />
//                     </TouchableOpacity>
//                   </View>

//                   {menuOpenId === item.id && (
//                     <View style={styles.dropdownMenu}>
//                       <TouchableOpacity
//                         style={styles.dropdownItem}
//                         onPress={() => {
//                           setMenuOpenId(null);
//                           setSelectedCancelBooking(item);
//                           setCancelReason("");
//                           setCustomReason("");
//                           setShowCancelModal(true);
//                         }}
//                       >
//                         <Ionicons
//                           name="close-circle-outline"
//                           size={18}
//                           color="#ef4444"
//                         />
//                         <Text style={styles.dropdownItemText}>
//                           Cancel Service
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                 </View>

//                 {/* 🔥 RUNNING STATUS */}
//                 {isActive && (
//                   <Text style={styles.runningText}>⏱ Work in progress</Text>
//                 )}

//                 <Text>
//                   <Text style={styles.label}>Phone:</Text>{" "}
//                   {item.phone_number || "N/A"}
//                 </Text>

//                 <Text>
//                   <Text style={styles.label}>Date:</Text> {item.booking_date}
//                 </Text>

//                 <Text>
//                   <Text style={styles.label}>Time:</Text> {item.booking_time}
//                 </Text>

//                 <Text>
//                   <Text style={styles.label}>Address:</Text> {item.full_address}
//                 </Text>

//                 <View style={styles.section}>
//                   <Text style={styles.label}>Services:</Text>

//                   {item.services?.map((s: any, i: number) => (
//                     <View key={i} style={styles.serviceItem}>
//                       <Text style={styles.serviceName}>• {s.title}</Text>
//                       <Text style={styles.serviceMeta}>
//                         Duration: {s.duration}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>

//                 {/* LOCATION BUTTON */}
//                 <TouchableOpacity
//                   style={styles.mapBtn}
//                   onPress={() => openMaps(item.latitude, item.longitude)}
//                 >
//                   <Text style={styles.mapBtnText}>Location</Text>
//                 </TouchableOpacity>

//                 {/* 🔥 OPEN / RESUME BUTTON */}
//                 <TouchableOpacity
//                   style={styles.openServiceBtn}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/assigned-service-details",
//                       params: { booking: JSON.stringify(item) },
//                     })
//                   }
//                 >
//                   <Text style={styles.openServiceText}>
//                     {isActive ? "Resume Work" : "Open Service"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             );
//           })
//         )}
//       </ScrollView>

//       {/* ================= CANCELLATION MODAL ================= */}
//       <Modal
//         visible={showCancelModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           setShowCancelModal(false);
//           setCancelReason("");
//           setCustomReason("");
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.cancelModalBox}>
//             {/* Modal Header */}
//             <View style={styles.cancelHeaderRow}>
//               <Ionicons name="warning" size={24} color="#ef4444" />
//               <Text style={styles.cancelModalTitle}>Cancel Service</Text>
//             </View>

//             {/* Warning Box */}
//             <View style={styles.warningBanner}>
//               <Text style={styles.warningBannerText}>
//                 ⚠️ If you cancel the service you will be deducted with{" "}
//                 <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
//                   {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs
//                 </Text>{" "}
//                 as cancellation fee.
//               </Text>
//               <Text style={styles.warningSubText}>
//                 This will affect your performance score and{" "}
//                 {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs charge will be applied.
//               </Text>
//             </View>

//             <Text style={styles.reasonSectionTitle}>
//               select reason below:
//             </Text>

//             {/* Reasons List */}
//             <ScrollView
//               style={{ maxHeight: 220 }}
//               showsVerticalScrollIndicator={true}
//             >
//               {CANCELLATION_REASONS.map((reason) => {
//                 const isSelected = cancelReason === reason;
//                 return (
//                   <TouchableOpacity
//                     key={reason}
//                     style={[
//                       styles.reasonOption,
//                       isSelected && styles.selectedReasonOption,
//                     ]}
//                     onPress={() => setCancelReason(reason)}
//                   >
//                     <Ionicons
//                       name={
//                         isSelected ? "radio-button-on" : "radio-button-off"
//                       }
//                       size={20}
//                       color={isSelected ? "#ef4444" : "#6b7280"}
//                     />
//                     <Text
//                       style={[
//                         styles.reasonOptionText,
//                         isSelected && styles.selectedReasonOptionText,
//                       ]}
//                     >
//                       {reason}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {cancelReason === "Other (specify)" && (
//                 <TextInput
//                   placeholder="Specify reason..."
//                   placeholderTextColor="#9ca3af"
//                   value={customReason}
//                   onChangeText={setCustomReason}
//                   style={styles.customReasonInput}
//                   multiline={true}
//                 />
//               )}
//             </ScrollView>

//             {/* Modal Action Buttons */}
//             <View style={styles.cancelModalActions}>
//               <TouchableOpacity
//                 style={styles.backBtn}
//                 onPress={() => {
//                   setShowCancelModal(false);
//                   setCancelReason("");
//                   setCustomReason("");
//                 }}
//               >
//                 <Text style={styles.backBtnText}>Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.proceedBtn,
//                   (!cancelReason ||
//                     (cancelReason === "Other (specify)" &&
//                       !customReason.trim())) &&
//                   styles.disabledProceedBtn,
//                 ]}
//                 disabled={
//                   !cancelReason ||
//                   (cancelReason === "Other (specify)" && !customReason.trim()) ||
//                   loadingCancel
//                 }
//                 onPress={handleProceedCancel}
//               >
//                 {loadingCancel ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.proceedBtnText}>Proceed</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= SECOND POP-UP: CONFIRMATION MODAL ================= */}
//       <Modal
//         visible={showConfirmModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowConfirmModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.confirmModalBox}>
//             <View style={styles.iconCircleRedCenter}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>

//             <Text style={styles.confirmModalTitleCenter}>
//               Confirm Cancellation
//             </Text>

//             <Text style={styles.confirmModalQuestionCenter}>
//               Are you sure to cancel the service?
//             </Text>

//             <View style={styles.confirmDetailsBox}>
//               <Text style={styles.confirmWarningText}>
//                 ⚠️ If you cancel this service, a{" "}
//                 <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
//                   {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs
//                 </Text>{" "}
//                 cancellation fee will be deducted and charged to your account.
//               </Text>
//               <Text style={styles.confirmReasonLabel}>
//                 Reason:{" "}
//                 <Text style={{ fontWeight: "700", color: "#111827" }}>
//                   {cancelReason === "Other (specify)" ? customReason : cancelReason}
//                 </Text>
//               </Text>
//             </View>

//             {/* BUTTONS WITH CORNER RADIUS */}
//             <View style={styles.confirmModalActions}>
//               <TouchableOpacity
//                 style={styles.goBackBtn}
//                 onPress={() => {
//                   setShowConfirmModal(false);
//                   setShowCancelModal(true);
//                 }}
//               >
//                 <Text style={styles.goBackBtnText}>No, Go Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.yesCancelBtn}
//                 disabled={loadingCancel}
//                 onPress={handleConfirmCancelSubmit}
//               >
//                 {loadingCancel ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.yesCancelBtnText}>Yes, Cancel Service</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= THIRD POP-UP: CANCELLED SUCCESS/RESULT MODAL ================= */}
//       <Modal
//         visible={showCancelledSuccessModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowCancelledSuccessModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.confirmModalBox}>
//             <View style={styles.iconCircleRedCenter}>
//               <Ionicons name="alert-circle" size={32} color="#ef4444" />
//             </View>

//             <Text style={styles.confirmModalTitleCenter}>Service Cancelled</Text>

//             <Text style={styles.confirmModalQuestionCenter}>
//               The service has been cancelled.
//             </Text>

//             <View style={styles.confirmDetailsBox}>
//               <Text style={styles.confirmWarningText}>
//                 A{" "}
//                 <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
//                   {cancelledSuccessFee}/- rs
//                 </Text>{" "}
//                 cancellation fee has been applied.
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.modalOkBtn}
//               onPress={() => setShowCancelledSuccessModal(false)}
//             >
//               <Text style={styles.modalOkBtnText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
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

//   body: {
//     padding: 20,
//     paddingBottom: 90,
//   },

//   card: {
//     borderWidth: 2,
//     borderColor: "#000",
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 20,
//     backgroundColor: "#FAFAFA",
//   },

//   /* 🔥 ACTIVE CARD HIGHLIGHT */
//   activeHighlight: {
//     borderColor: "#FFD700",
//     backgroundColor: "#fffbea",
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     marginBottom: 6,
//   },

//   activeBadge: {
//     backgroundColor: "#FFD700",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },

//   activeBadgeText: {
//     fontSize: 10,
//     fontWeight: "bold",
//   },

//   runningText: {
//     fontWeight: "700",
//     marginBottom: 6,
//   },

//   label: { fontWeight: "700" },

//   section: { marginVertical: 10 },

//   serviceItem: { marginLeft: 10, marginTop: 6 },

//   serviceName: { fontWeight: "700" },

//   serviceMeta: {
//     marginLeft: 10,
//     color: "#555",
//     fontSize: 13,
//   },

//   mapBtn: {
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   mapBtnText: {
//     color: "#111827",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   openServiceBtn: {
//     marginTop: 8,
//     backgroundColor: "#FFD700",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   openServiceText: {
//     color: "#080700",
//     fontWeight: "bold",
//   },

//   emptyText: {
//     textAlign: "center",
//     fontSize: 16,
//     marginTop: 40,
//     color: "#666",
//   },

//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },

//   approveBtn: {
//     flex: 1,
//     backgroundColor: "#d1fae5",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginRight: 5,
//   },

//   rejectBtn: {
//     flex: 1,
//     backgroundColor: "#fee2e2",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 5,
//   },

//   selectedApprove: {
//     backgroundColor: "#22c55e",
//   },

//   selectedReject: {
//     backgroundColor: "#ef4444",
//   },

//   btnText: {
//     fontWeight: "bold",
//     color: "#000",
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   modalBox: {
//     width: "80%",
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 14,
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   modalText: {
//     fontSize: 14,
//     color: "#444",
//     marginBottom: 20,
//   },

//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   cancelBtn: {
//     flex: 1,
//     padding: 10,
//     marginRight: 5,
//     backgroundColor: "#e5e7eb",
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   confirmRejectBtn: {
//     flex: 1,
//     padding: 10,
//     marginLeft: 5,
//     backgroundColor: "#ef4444",
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   fullApprove: {
//     flex: 1,
//     backgroundColor: "#22c55e",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   fullApproveText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   fullReject: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   fullRejectText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   dropdownMenu: {
//     position: "absolute",
//     top: 32,
//     right: 0,
//     backgroundColor: "#fff",
//     borderWidth: 1.5,
//     borderColor: "#e5e7eb",
//     borderRadius: 10,
//     padding: 4,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     zIndex: 1000,
//   },

//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     gap: 8,
//   },

//   dropdownItemText: {
//     color: "#ef4444",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   cancelModalBox: {
//     width: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     elevation: 10,
//   },

//   cancelHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },

//   cancelModalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#111827",
//   },

//   warningBanner: {
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },

//   warningBannerText: {
//     fontSize: 14,
//     color: "#991b1b",
//     lineHeight: 20,
//     fontWeight: "600",
//   },

//   warningSubText: {
//     fontSize: 12,
//     color: "#b91c1c",
//     marginTop: 4,
//     fontWeight: "500",
//   },

//   reasonSectionTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#374151",
//     marginBottom: 10,
//   },

//   reasonOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     marginBottom: 8,
//     backgroundColor: "#f9fafb",
//     gap: 10,
//   },

//   selectedReasonOption: {
//     borderColor: "#ef4444",
//     backgroundColor: "#fef2f2",
//   },

//   reasonOptionText: {
//     fontSize: 14,
//     color: "#374151",
//     fontWeight: "500",
//   },

//   selectedReasonOptionText: {
//     color: "#991b1b",
//     fontWeight: "700",
//   },

//   customReasonInput: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 10,
//     padding: 10,
//     fontSize: 14,
//     color: "#111827",
//     marginTop: 4,
//     marginBottom: 10,
//     backgroundColor: "#fff",
//     minHeight: 60,
//     textAlignVertical: "top",
//   },

//   cancelModalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//     marginTop: 16,
//   },

//   backBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//   },

//   backBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   proceedBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   disabledProceedBtn: {
//     backgroundColor: "#fca5a5",
//     opacity: 0.6,
//   },

//   proceedBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   confirmModalBox: {
//     width: "88%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },

//   iconCircleRedCenter: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     backgroundColor: "#fee2e2",
//     borderWidth: 1.5,
//     borderColor: "#fca5a5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   confirmModalTitleCenter: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },

//   confirmModalQuestionCenter: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "center",
//     marginTop: 4,
//     marginBottom: 14,
//   },

//   confirmDetailsBox: {
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 18,
//   },

//   confirmWarningText: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },

//   confirmReasonLabel: {
//     fontSize: 13,
//     color: "#4b5563",
//     marginTop: 8,
//   },

//   confirmModalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 10,
//   },

//   goBackBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     borderWidth: 1.5,
//     borderColor: "#d1d5db",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   goBackBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   yesCancelBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   yesCancelBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   modalOkBtn: {
//     width: "100%",
//     backgroundColor: "#ef4444",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalOkBtnText: {
//     color: "#ffffff",
//     fontWeight: "800",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });





















// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router, useFocusEffect } from "expo-router";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Easing,
//   Linking,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import * as Notifications from "expo-notifications";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
// import { partnerApi } from "../lib/api";

// const CANCELLATION_REASONS = [
//   "Medical Emergency",
//   "Personal Emergency",
//   "Vehicle Issue",
//   "Traffic Delay",
//   "Location Too Far",
//   "Safety Concern",
//   "Mobile Issue",
//   "Other (specify)",
// ];

// export default function AssignedServices() {
//   const [services, setServices] = useState<any[]>([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const scaleAnim = useRef(new Animated.Value(0)).current;

//   const [showApproveModal, setShowApproveModal] = useState(false);

//   /* 🔥 CANCELLATION STATES */
//   const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showCancelledSuccessModal, setShowCancelledSuccessModal] = useState(false);
//   const [cancelledSuccessFee, setCancelledSuccessFee] = useState(99);
//   const [selectedCancelBooking, setSelectedCancelBooking] = useState<any | null>(null);
//   const [cancelReason, setCancelReason] = useState("");
//   const [customReason, setCustomReason] = useState("");
//   const [loadingCancel, setLoadingCancel] = useState(false);

//   /* ================= LOAD SERVICES ================= */
//   const loadServices = async () => {
//   try {
//     console.log("📡 Loading assigned services from FastAPI...");

//     const response: any = await partnerApi.bookings("assigned");

//     console.log("✅ Assigned services response:", response);

//     const bookings = response?.data || [];

//     if (!Array.isArray(bookings) || bookings.length === 0) {
//       console.log("ℹ️ No assigned services found.");
//       setServices([]);
//       return;
//     }

//     const updatedBookings = bookings.map((booking: any) => ({
//       ...booking,
//       partner_cancellation_amount:
//         Number(booking.partner_cancellation_amount) || 99,
//     }));

//     setServices(updatedBookings);

//   } catch (error: any) {
//     console.error(
//       "❌ Failed to load assigned services:",
//       error?.message || error
//     );

//     setServices([]);

//     Alert.alert(
//       "Unable to Load Services",
//       error?.message || "Failed to load assigned services."
//     );
//   }
// };

//   const handleProceedCancel = () => {
//     const finalReason =
//       cancelReason === "Other (specify)" ? customReason.trim() : cancelReason;

//     if (!finalReason) {
//       Alert.alert("Reason Required", "Please select or specify a reason.");
//       return;
//     }

//     setShowCancelModal(false);
//     setShowConfirmModal(true);
//   };

//   const handleConfirmCancelSubmit = async () => {
//     const finalReason =
//       cancelReason === "Other (specify)" ? customReason.trim() : cancelReason;

//     if (!selectedCancelBooking) return;
//     setLoadingCancel(true);

//     const cancelFee = Number(
//       selectedCancelBooking?.partner_cancellation_amount ?? 99
//     );

//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const email = authData?.user?.email;

//       // 1. Update booking work_status to CANCELLED in bookings table
//       const { error: bookingError } = await supabase
//         .from("bookings")
//         .update({
//           work_status: "CANCELLED",
//         })
//         .eq("id", selectedCancelBooking.id);

//       if (bookingError) {
//         console.log("Error updating bookings table:", bookingError);
//         Alert.alert("Cancellation Failed", bookingError.message || "Failed to update booking.");
//         return;
//       }

//       // 2. Insert permanent log record into staff_cancellations table
//       if (email) {
//         const { error: insertErr } = await supabase
//           .from("staff_cancellations")
//           .insert({
//             booking_id: selectedCancelBooking.id,
//             staff_email: email,
//             customer_name: selectedCancelBooking.customer_name || "Customer",
//             cancellation_reason: finalReason,
//             cancellation_fee: cancelFee,
//             cancelled_at: new Date().toISOString(),
//           });

//         if (insertErr) {
//           console.log("staff_cancellations insert error:", insertErr);
//         }

//         // 2b. Insert cancellation notification with fare/fee details for staff member
//         try {
//           await supabase.from("notifications").insert({
//             staff_email: email,
//             title: "Service Cancelled ❌",
//             body: `Booking for ${selectedCancelBooking.customer_name || "Customer"} was cancelled. Cancellation fee: ₹${cancelFee}/- applied. Reason: ${finalReason}`,
//             type: "service_cancelled",
//             is_read: false,
//             created_at: new Date().toISOString(),
//           });

//           await Notifications.scheduleNotificationAsync({
//             content: {
//               title: "Service Cancelled ❌",
//               body: `Booking for ${selectedCancelBooking.customer_name || "Customer"} was cancelled. Fee: ₹${cancelFee}/- applied.`,
//               sound: "default",
//               data: { screen: "new-services" },
//             },
//             trigger: null,
//           });
//         } catch (notifErr) {
//           console.log("Notification insert error:", notifErr);
//         }
//       }

//       // 3. Sync total_cancellation_fee to staff_profile
//       if (email) {
//         try {
//           const { data: cancelLogs } = await supabase
//             .from("staff_cancellations")
//             .select("cancellation_fee")
//             .eq("staff_email", email);

//           let newTotalFee = 0;
//           if (cancelLogs && cancelLogs.length > 0) {
//             newTotalFee = cancelLogs.reduce(
//               // (sum, item) => sum + Number(item.cancellation_fee || 0),
//               (sum: number, item: any) => sum + Number(item.cancellation_fee || 0), 0
//             );
//           } else {
//             const { count } = await supabase
//               .from("bookings")
//               .select("*", { count: "exact", head: true })
//               .eq("assigned_staff_email", email)
//               .eq("work_status", "CANCELLED");

//             newTotalFee = (count || 0) * cancelFee;
//           }

//           await supabase
//             .from("staff_profile")
//             .update({ total_cancellation_fee: newTotalFee })
//             .eq("email", email);
//         } catch (e) {
//           console.log("Error updating staff_profile cancellation fee:", e);
//         }
//       }

//       setShowConfirmModal(false);
//       setCancelReason("");
//       setCustomReason("");
//       setSelectedCancelBooking(null);
//       setCancelledSuccessFee(cancelFee);
//       setShowCancelledSuccessModal(true);
//       await loadServices();
//     } catch (err: any) {
//       console.log("Cancellation error:", err);
//       Alert.alert("Error", err?.message || "An unexpected error occurred.");
//     } finally {
//       setLoadingCancel(false);
//     }
//   };

//   /* FIRST LOAD & REALTIME LISTENERS */
//   useEffect(() => {
//     loadServices();

//     const channel = supabase
//       .channel("assigned-bookings-realtime")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "bookings" },
//         async (payload: any) => {
//           if (payload?.eventType === "UPDATE" && payload?.new) {
//             const newBooking = payload.new;
//             const { data: authData } = await supabase.auth.getUser();
//             const userEmail = authData?.user?.email?.toLowerCase();

//             if (
//               newBooking.assigned_staff_email?.toLowerCase() === userEmail &&
//               newBooking.work_status === "CANCELLED"
//             ) {
//               try {
//                 await Notifications.scheduleNotificationAsync({
//                   content: {
//                     title: "Service Cancelled ❌",
//                     body: `Booking for ${newBooking.customer_name || "Customer"} was cancelled.`,
//                     sound: "default",
//                     data: { screen: "assigned-services" },
//                   },
//                   trigger: null,
//                 });
//               } catch (err) {}

//               setCancelledSuccessFee(newBooking.partner_cancellation_amount || 99);
//               setShowCancelledSuccessModal(true);
//             }
//           }
//           loadServices();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   /* RELOAD ON FOCUS */
//   useFocusEffect(
//     useCallback(() => {
//       loadServices();
//     }, []),
//   );

//   useEffect(() => {
//     if (showRejectModal || showApproveModal) {
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 250,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     } else {
//       scaleAnim.setValue(0);
//     }
//   }, [showRejectModal, showApproveModal]);
//   /* ================= PULL TO REFRESH ================= */
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadServices();
//     setRefreshing(false);
//   }, []);

//   /* ================= GOOGLE MAPS ================= */
//   const openMaps = (lat: number, lng: number) => {
//     if (!lat || !lng) {
//       Alert.alert("Location coordinates not available");
//       return;
//     }

//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     Linking.openURL(url);
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

//       {/* ================= BODY ================= */}
//       <ScrollView
//         contentContainerStyle={styles.body}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {services.length === 0 ? (
//           <Text style={styles.emptyText}>No Assigned Services</Text>
//         ) : (
//           services.map((item) => {
//             const isActive =
//               item.work_started_at &&
//               (!item.work_ended_at || item.work_ended_at === null);

//             return (
//               <View
//                 key={item.id}
//                 style={[
//                   styles.card,
//                   isActive && styles.activeHighlight,
//                 ]}
//               >
//                 {/* 🔥 HEADER ROW */}
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     position: "relative",
//                     zIndex: menuOpenId === item.id ? 999 : 1,
//                   }}
//                 >
//                   <Text style={styles.cardTitle}>{item.customer_name}</Text>

//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 10,
//                     }}
//                   >
//                     {isActive && (
//                       <View style={styles.activeBadge}>
//                         <Text style={styles.activeBadgeText}>ACTIVE</Text>
//                       </View>
//                     )}

//                     <TouchableOpacity
//                       onPress={() =>
//                         setMenuOpenId(menuOpenId === item.id ? null : item.id)
//                       }
//                       style={{ padding: 4 }}
//                     >
//                       <Ionicons
//                         name="ellipsis-vertical"
//                         size={20}
//                         color="#000"
//                       />
//                     </TouchableOpacity>
//                   </View>

//                   {menuOpenId === item.id && (
//                     <View style={styles.dropdownMenu}>
//                       <TouchableOpacity
//                         style={styles.dropdownItem}
//                         onPress={() => {
//                           setMenuOpenId(null);
//                           setSelectedCancelBooking(item);
//                           setCancelReason("");
//                           setCustomReason("");
//                           setShowCancelModal(true);
//                         }}
//                       >
//                         <Ionicons
//                           name="close-circle-outline"
//                           size={18}
//                           color="#ef4444"
//                         />
//                         <Text style={styles.dropdownItemText}>
//                           Cancel Service
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                 </View>

//                 {/* 🔥 RUNNING STATUS */}
//                 {isActive && (
//                   <Text style={styles.runningText}>⏱ Work in progress</Text>
//                 )}

//                 <Text>
//                   <Text style={styles.label}>Phone:</Text>{" "}
//                   {item.phone_number || "N/A"}
//                 </Text>

//                 <Text>
//                   <Text style={styles.label}>Date:</Text> {item.booking_date}
//                 </Text>

//                 <Text>
//                   <Text style={styles.label}>Time:</Text> {item.booking_time}
//                 </Text>

//                 <Text>
//                   <Text style={styles.label}>Address:</Text> {item.full_address}
//                 </Text>

//                 <View style={styles.section}>
//                   <Text style={styles.label}>Services:</Text>

//                   {item.services?.map((s: any, i: number) => (
//                     <View key={i} style={styles.serviceItem}>
//                       <Text style={styles.serviceName}>• {s.title}</Text>
//                       <Text style={styles.serviceMeta}>
//                         Duration: {s.duration}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>

//                 {/* LOCATION BUTTON */}
//                 <TouchableOpacity
//                   style={styles.mapBtn}
//                   onPress={() => openMaps(item.latitude, item.longitude)}
//                 >
//                   <Text style={styles.mapBtnText}>Location</Text>
//                 </TouchableOpacity>

//                 {/* 🔥 OPEN / RESUME BUTTON */}
//                 <TouchableOpacity
//                   style={styles.openServiceBtn}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/assigned-service-details",
//                       params: { booking: JSON.stringify(item) },
//                     })
//                   }
//                 >
//                   <Text style={styles.openServiceText}>
//                     {isActive ? "Resume Work" : "Open Service"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             );
//           })
//         )}
//       </ScrollView>

//       {/* ================= CANCELLATION MODAL ================= */}
//       <Modal
//         visible={showCancelModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           setShowCancelModal(false);
//           setCancelReason("");
//           setCustomReason("");
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.cancelModalBox}>
//             {/* Modal Header */}
//             <View style={styles.cancelHeaderRow}>
//               <Ionicons name="warning" size={24} color="#ef4444" />
//               <Text style={styles.cancelModalTitle}>Cancel Service</Text>
//             </View>

//             {/* Warning Box */}
//             <View style={styles.warningBanner}>
//               <Text style={styles.warningBannerText}>
//                 ⚠️ If you cancel the service you will be deducted with{" "}
//                 <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
//                   {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs
//                 </Text>{" "}
//                 as cancellation fee.
//               </Text>
//               <Text style={styles.warningSubText}>
//                 This will affect your performance score and{" "}
//                 {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs charge will be applied.
//               </Text>
//             </View>

//             <Text style={styles.reasonSectionTitle}>
//               select reason below:
//             </Text>

//             {/* Reasons List */}
//             <ScrollView
//               style={{ maxHeight: 220 }}
//               showsVerticalScrollIndicator={true}
//             >
//               {CANCELLATION_REASONS.map((reason) => {
//                 const isSelected = cancelReason === reason;
//                 return (
//                   <TouchableOpacity
//                     key={reason}
//                     style={[
//                       styles.reasonOption,
//                       isSelected && styles.selectedReasonOption,
//                     ]}
//                     onPress={() => setCancelReason(reason)}
//                   >
//                     <Ionicons
//                       name={
//                         isSelected ? "radio-button-on" : "radio-button-off"
//                       }
//                       size={20}
//                       color={isSelected ? "#ef4444" : "#6b7280"}
//                     />
//                     <Text
//                       style={[
//                         styles.reasonOptionText,
//                         isSelected && styles.selectedReasonOptionText,
//                       ]}
//                     >
//                       {reason}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}

//               {cancelReason === "Other (specify)" && (
//                 <TextInput
//                   placeholder="Specify reason..."
//                   placeholderTextColor="#9ca3af"
//                   value={customReason}
//                   onChangeText={setCustomReason}
//                   style={styles.customReasonInput}
//                   multiline={true}
//                 />
//               )}
//             </ScrollView>

//             {/* Modal Action Buttons */}
//             <View style={styles.cancelModalActions}>
//               <TouchableOpacity
//                 style={styles.backBtn}
//                 onPress={() => {
//                   setShowCancelModal(false);
//                   setCancelReason("");
//                   setCustomReason("");
//                 }}
//               >
//                 <Text style={styles.backBtnText}>Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.proceedBtn,
//                   (!cancelReason ||
//                     (cancelReason === "Other (specify)" &&
//                       !customReason.trim())) &&
//                   styles.disabledProceedBtn,
//                 ]}
//                 disabled={
//                   !cancelReason ||
//                   (cancelReason === "Other (specify)" && !customReason.trim()) ||
//                   loadingCancel
//                 }
//                 onPress={handleProceedCancel}
//               >
//                 {loadingCancel ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.proceedBtnText}>Proceed</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= SECOND POP-UP: CONFIRMATION MODAL ================= */}
//       <Modal
//         visible={showConfirmModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowConfirmModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.confirmModalBox}>
//             <View style={styles.iconCircleRedCenter}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>

//             <Text style={styles.confirmModalTitleCenter}>
//               Confirm Cancellation
//             </Text>

//             <Text style={styles.confirmModalQuestionCenter}>
//               Are you sure to cancel the service?
//             </Text>

//             <View style={styles.confirmDetailsBox}>
//               <Text style={styles.confirmWarningText}>
//                 ⚠️ If you cancel this service, a{" "}
//                 <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
//                   {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs
//                 </Text>{" "}
//                 cancellation fee will be deducted and charged to your account.
//               </Text>
//               <Text style={styles.confirmReasonLabel}>
//                 Reason:{" "}
//                 <Text style={{ fontWeight: "700", color: "#111827" }}>
//                   {cancelReason === "Other (specify)" ? customReason : cancelReason}
//                 </Text>
//               </Text>
//             </View>

//             {/* BUTTONS WITH CORNER RADIUS */}
//             <View style={styles.confirmModalActions}>
//               <TouchableOpacity
//                 style={styles.goBackBtn}
//                 onPress={() => {
//                   setShowConfirmModal(false);
//                   setShowCancelModal(true);
//                 }}
//               >
//                 <Text style={styles.goBackBtnText}>No, Go Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.yesCancelBtn}
//                 disabled={loadingCancel}
//                 onPress={handleConfirmCancelSubmit}
//               >
//                 {loadingCancel ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.yesCancelBtnText}>Yes, Cancel Service</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= THIRD POP-UP: CANCELLED SUCCESS/RESULT MODAL ================= */}
//       <Modal
//         visible={showCancelledSuccessModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowCancelledSuccessModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.confirmModalBox}>
//             <View style={styles.iconCircleRedCenter}>
//               <Ionicons name="alert-circle" size={32} color="#ef4444" />
//             </View>

//             <Text style={styles.confirmModalTitleCenter}>Service Cancelled</Text>

//             <Text style={styles.confirmModalQuestionCenter}>
//               The service has been cancelled.
//             </Text>

//             <View style={styles.confirmDetailsBox}>
//               <Text style={styles.confirmWarningText}>
//                 A{" "}
//                 <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
//                   {cancelledSuccessFee}/- rs
//                 </Text>{" "}
//                 cancellation fee has been applied.
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.modalOkBtn}
//               onPress={() => setShowCancelledSuccessModal(false)}
//             >
//               <Text style={styles.modalOkBtnText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
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

//   body: {
//     padding: 20,
//     paddingBottom: 90,
//   },

//   card: {
//     borderWidth: 2,
//     borderColor: "#000",
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 20,
//     backgroundColor: "#FAFAFA",
//   },

//   /* 🔥 ACTIVE CARD HIGHLIGHT */
//   activeHighlight: {
//     borderColor: "#FFD700",
//     backgroundColor: "#fffbea",
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     marginBottom: 6,
//   },

//   activeBadge: {
//     backgroundColor: "#FFD700",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },

//   activeBadgeText: {
//     fontSize: 10,
//     fontWeight: "bold",
//   },

//   runningText: {
//     fontWeight: "700",
//     marginBottom: 6,
//   },

//   label: { fontWeight: "700" },

//   section: { marginVertical: 10 },

//   serviceItem: { marginLeft: 10, marginTop: 6 },

//   serviceName: { fontWeight: "700" },

//   serviceMeta: {
//     marginLeft: 10,
//     color: "#555",
//     fontSize: 13,
//   },

//   mapBtn: {
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   mapBtnText: {
//     color: "#111827",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   openServiceBtn: {
//     marginTop: 8,
//     backgroundColor: "#FFD700",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   openServiceText: {
//     color: "#080700",
//     fontWeight: "bold",
//   },

//   emptyText: {
//     textAlign: "center",
//     fontSize: 16,
//     marginTop: 40,
//     color: "#666",
//   },

//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },

//   approveBtn: {
//     flex: 1,
//     backgroundColor: "#d1fae5",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginRight: 5,
//   },

//   rejectBtn: {
//     flex: 1,
//     backgroundColor: "#fee2e2",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 5,
//   },

//   selectedApprove: {
//     backgroundColor: "#22c55e",
//   },

//   selectedReject: {
//     backgroundColor: "#ef4444",
//   },

//   btnText: {
//     fontWeight: "bold",
//     color: "#000",
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   modalBox: {
//     width: "80%",
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 14,
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   modalText: {
//     fontSize: 14,
//     color: "#444",
//     marginBottom: 20,
//   },

//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   cancelBtn: {
//     flex: 1,
//     padding: 10,
//     marginRight: 5,
//     backgroundColor: "#e5e7eb",
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   confirmRejectBtn: {
//     flex: 1,
//     padding: 10,
//     marginLeft: 5,
//     backgroundColor: "#ef4444",
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   fullApprove: {
//     flex: 1,
//     backgroundColor: "#22c55e",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   fullApproveText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   fullReject: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   fullRejectText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   dropdownMenu: {
//     position: "absolute",
//     top: 32,
//     right: 0,
//     backgroundColor: "#fff",
//     borderWidth: 1.5,
//     borderColor: "#e5e7eb",
//     borderRadius: 10,
//     padding: 4,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     zIndex: 1000,
//   },

//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     gap: 8,
//   },

//   dropdownItemText: {
//     color: "#ef4444",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   cancelModalBox: {
//     width: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     elevation: 10,
//   },

//   cancelHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },

//   cancelModalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#111827",
//   },

//   warningBanner: {
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },

//   warningBannerText: {
//     fontSize: 14,
//     color: "#991b1b",
//     lineHeight: 20,
//     fontWeight: "600",
//   },

//   warningSubText: {
//     fontSize: 12,
//     color: "#b91c1c",
//     marginTop: 4,
//     fontWeight: "500",
//   },

//   reasonSectionTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#374151",
//     marginBottom: 10,
//   },

//   reasonOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     marginBottom: 8,
//     backgroundColor: "#f9fafb",
//     gap: 10,
//   },

//   selectedReasonOption: {
//     borderColor: "#ef4444",
//     backgroundColor: "#fef2f2",
//   },

//   reasonOptionText: {
//     fontSize: 14,
//     color: "#374151",
//     fontWeight: "500",
//   },

//   selectedReasonOptionText: {
//     color: "#991b1b",
//     fontWeight: "700",
//   },

//   customReasonInput: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 10,
//     padding: 10,
//     fontSize: 14,
//     color: "#111827",
//     marginTop: 4,
//     marginBottom: 10,
//     backgroundColor: "#fff",
//     minHeight: 60,
//     textAlignVertical: "top",
//   },

//   cancelModalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//     marginTop: 16,
//   },

//   backBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//   },

//   backBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   proceedBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   disabledProceedBtn: {
//     backgroundColor: "#fca5a5",
//     opacity: 0.6,
//   },

//   proceedBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   confirmModalBox: {
//     width: "88%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },

//   iconCircleRedCenter: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     backgroundColor: "#fee2e2",
//     borderWidth: 1.5,
//     borderColor: "#fca5a5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   confirmModalTitleCenter: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },

//   confirmModalQuestionCenter: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "center",
//     marginTop: 4,
//     marginBottom: 14,
//   },

//   confirmDetailsBox: {
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 18,
//   },

//   confirmWarningText: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },

//   confirmReasonLabel: {
//     fontSize: 13,
//     color: "#4b5563",
//     marginTop: 8,
//   },

//   confirmModalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 10,
//   },

//   goBackBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     borderWidth: 1.5,
//     borderColor: "#d1d5db",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   goBackBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   yesCancelBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   yesCancelBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   modalOkBtn: {
//     width: "100%",
//     backgroundColor: "#ef4444",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalOkBtnText: {
//     color: "#ffffff",
//     fontWeight: "800",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });






















import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
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

const CANCELLATION_REASONS = [
  "Medical Emergency",
  "Personal Emergency",
  "Vehicle Issue",
  "Traffic Delay",
  "Location Too Far",
  "Safety Concern",
  "Mobile Issue",
  "Other (specify)",
];

export default function AssignedServices() {
  const [services, setServices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const [showApproveModal, setShowApproveModal] = useState(false);

  /* 🔥 CANCELLATION STATES */
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelledSuccessModal, setShowCancelledSuccessModal] = useState(false);
  const [cancelledSuccessFee, setCancelledSuccessFee] = useState(99);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loadingCancel, setLoadingCancel] = useState(false);

  /* ================= LOAD SERVICES ================= */
  const loadServices = async () => {
    try {
      console.log("📡 Loading assigned services from FastAPI...");

      const response: any = await partnerApi.bookings("assigned");

      console.log("✅ Assigned services response:", response);

      const bookings = response?.data || [];

      if (!Array.isArray(bookings) || bookings.length === 0) {
        console.log("ℹ️ No assigned services found.");
        setServices([]);
        return;
      }

      const updatedBookings = bookings.map((booking: any) => ({
        ...booking,
        partner_cancellation_amount:
          Number(booking.partner_cancellation_amount) || 99,
      }));

      setServices(updatedBookings);
    } catch (error: any) {
      console.error("❌ Failed to load assigned services:", error?.message || error);
      setServices([]);
      Alert.alert(
        "Unable to Load Services",
        error?.message || "Failed to load assigned services."
      );
    }
  };

  const handleProceedCancel = () => {
    const finalReason =
      cancelReason === "Other (specify)" ? customReason.trim() : cancelReason;

    if (!finalReason) {
      Alert.alert("Reason Required", "Please select or specify a reason.");
      return;
    }

    setShowCancelModal(false);
    setShowConfirmModal(true);
  };

  /* ================= HANDLE CONFIRM CANCEL SUBMIT ================= */
  const handleConfirmCancelSubmit = async () => {
    const finalReason =
      cancelReason === "Other (specify)" ? customReason.trim() : cancelReason;

    if (!selectedCancelBooking) {
      return;
    }

    if (!finalReason) {
      Alert.alert("Reason Required", "Please select or specify a cancellation reason.");
      return;
    }

    setLoadingCancel(true);

    const cancelFee = Number(
      selectedCancelBooking?.partner_cancellation_amount ?? 99
    );

    try {
      console.log("📡 Cancelling booking through FastAPI:", selectedCancelBooking.id);

      const response: any = await partnerApi.cancelBooking(
        selectedCancelBooking.id,
        finalReason
      );

      console.log("✅ Cancellation response:", response);

      setShowConfirmModal(false);
      setCancelReason("");
      setCustomReason("");
      setSelectedCancelBooking(null);

      setCancelledSuccessFee(cancelFee);
      setShowCancelledSuccessModal(true);

      // Reload assigned services
      await loadServices();
    } catch (error: any) {
      console.error("❌ Cancellation failed:", error?.message || error);
      Alert.alert("Cancellation Failed", error?.message || "Unable to cancel this service.");
    } finally {
      setLoadingCancel(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadServices();
  }, []);

  /* ================= RELOAD ON FOCUS ================= */
  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, [])
  );

  /* ================= ANIMATION ================= */
  useEffect(() => {
    if (showRejectModal || showApproveModal) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [showRejectModal, showApproveModal]);

  /* ================= PULL TO REFRESH ================= */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }, []);

  /* ================= GOOGLE MAPS ================= */
  const openMaps = (lat: number, lng: number) => {
    if (!lat || !lng) {
      Alert.alert("Location coordinates not available");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

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

      {/* ================= BODY ================= */}
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {services.length === 0 ? (
          <Text style={styles.emptyText}>No Assigned Services</Text>
        ) : (
          services.map((item) => {
            const isActive =
              item.work_started_at &&
              (!item.work_ended_at || item.work_ended_at === null);

            return (
              <View
                key={item.id}
                style={[styles.card, isActive && styles.activeHighlight]}
              >
                {/* 🔥 HEADER ROW */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: menuOpenId === item.id ? 999 : 1,
                  }}
                >
                  <Text style={styles.cardTitle}>{item.customer_name}</Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() =>
                        setMenuOpenId(menuOpenId === item.id ? null : item.id)
                      }
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>

                  {menuOpenId === item.id && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setMenuOpenId(null);
                          setSelectedCancelBooking(item);
                          setCancelReason("");
                          setCustomReason("");
                          setShowCancelModal(true);
                        }}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                        <Text style={styles.dropdownItemText}>Cancel Service</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* 🔥 RUNNING STATUS */}
                {isActive && <Text style={styles.runningText}>⏱ Work in progress</Text>}

                <Text>
                  <Text style={styles.label}>Phone:</Text> {item.phone_number || "N/A"}
                </Text>

                <Text>
                  <Text style={styles.label}>Date:</Text> {item.booking_date}
                </Text>

                <Text>
                  <Text style={styles.label}>Time:</Text> {item.booking_time}
                </Text>

                <Text>
                  <Text style={styles.label}>Address:</Text> {item.full_address}
                </Text>

                <View style={styles.section}>
                  <Text style={styles.label}>Services:</Text>

                  {item.services?.map((s: any, i: number) => (
                    <View key={i} style={styles.serviceItem}>
                      <Text style={styles.serviceName}>• {s.title}</Text>
                      <Text style={styles.serviceMeta}>Duration: {s.duration}</Text>
                    </View>
                  ))}
                </View>

                {/* LOCATION BUTTON */}
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => openMaps(item.latitude, item.longitude)}
                >
                  <Text style={styles.mapBtnText}>Location</Text>
                </TouchableOpacity>

                {/* 🔥 OPEN / RESUME BUTTON */}
                <TouchableOpacity
                  style={styles.openServiceBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/assigned-service-details",
                      params: { booking: JSON.stringify(item) },
                    })
                  }
                >
                  <Text style={styles.openServiceText}>
                    {isActive ? "Resume Work" : "Open Service"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ================= CANCELLATION MODAL ================= */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
          setCustomReason("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalBox}>
            {/* Modal Header */}
            <View style={styles.cancelHeaderRow}>
              <Ionicons name="warning" size={24} color="#ef4444" />
              <Text style={styles.cancelModalTitle}>Cancel Service</Text>
            </View>

            {/* Warning Box */}
            <View style={styles.warningBanner}>
              <Text style={styles.warningBannerText}>
                ⚠️ If you cancel the service you will be deducted with{" "}
                <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
                  {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs
                </Text>{" "}
                as cancellation fee.
              </Text>
              <Text style={styles.warningSubText}>
                This will affect your performance score and{" "}
                {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs charge will be applied.
              </Text>
            </View>

            <Text style={styles.reasonSectionTitle}>select reason below:</Text>

            {/* Reasons List */}
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={true}>
              {CANCELLATION_REASONS.map((reason) => {
                const isSelected = cancelReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      isSelected && styles.selectedReasonOption,
                    ]}
                    onPress={() => setCancelReason(reason)}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isSelected ? "#ef4444" : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.reasonOptionText,
                        isSelected && styles.selectedReasonOptionText,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {cancelReason === "Other (specify)" && (
                <TextInput
                  placeholder="Specify reason..."
                  placeholderTextColor="#9ca3af"
                  value={customReason}
                  onChangeText={setCustomReason}
                  style={styles.customReasonInput}
                  multiline={true}
                />
              )}
            </ScrollView>

            {/* Modal Action Buttons */}
            <View style={styles.cancelModalActions}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setCustomReason("");
                }}
              >
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.proceedBtn,
                  (!cancelReason ||
                    (cancelReason === "Other (specify)" && !customReason.trim())) &&
                    styles.disabledProceedBtn,
                ]}
                disabled={
                  !cancelReason ||
                  (cancelReason === "Other (specify)" && !customReason.trim()) ||
                  loadingCancel
                }
                onPress={handleProceedCancel}
              >
                {loadingCancel ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.proceedBtnText}>Proceed</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= SECOND POP-UP: CONFIRMATION MODAL ================= */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalBox}>
            <View style={styles.iconCircleRedCenter}>
              <Ionicons name="help-circle" size={32} color="#ef4444" />
            </View>

            <Text style={styles.confirmModalTitleCenter}>Confirm Cancellation</Text>

            <Text style={styles.confirmModalQuestionCenter}>
              Are you sure to cancel the service?
            </Text>

            <View style={styles.confirmDetailsBox}>
              <Text style={styles.confirmWarningText}>
                ⚠️ If you cancel this service, a{" "}
                <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
                  {selectedCancelBooking?.partner_cancellation_amount ?? 99}/- rs
                </Text>{" "}
                cancellation fee will be deducted and charged to your account.
              </Text>
              <Text style={styles.confirmReasonLabel}>
                Reason:{" "}
                <Text style={{ fontWeight: "700", color: "#111827" }}>
                  {cancelReason === "Other (specify)" ? customReason : cancelReason}
                </Text>
              </Text>
            </View>

            {/* BUTTONS WITH CORNER RADIUS */}
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.goBackBtn}
                onPress={() => {
                  setShowConfirmModal(false);
                  setShowCancelModal(true);
                }}
              >
                <Text style={styles.goBackBtnText}>No, Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.yesCancelBtn}
                disabled={loadingCancel}
                onPress={handleConfirmCancelSubmit}
              >
                {loadingCancel ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.yesCancelBtnText}>Yes, Cancel Service</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= THIRD POP-UP: CANCELLED SUCCESS/RESULT MODAL ================= */}
      <Modal
        visible={showCancelledSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelledSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalBox}>
            <View style={styles.iconCircleRedCenter}>
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
            </View>

            <Text style={styles.confirmModalTitleCenter}>Service Cancelled</Text>

            <Text style={styles.confirmModalQuestionCenter}>
              The service has been cancelled.
            </Text>

            <View style={styles.confirmDetailsBox}>
              <Text style={styles.confirmWarningText}>
                A{" "}
                <Text style={{ fontWeight: "800", color: "#b91c1c" }}>
                  {cancelledSuccessFee}/- rs
                </Text>{" "}
                cancellation fee has been applied.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalOkBtn}
              onPress={() => setShowCancelledSuccessModal(false)}
            >
              <Text style={styles.modalOkBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  body: {
    padding: 20,
    paddingBottom: 90,
  },

  card: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },

  /* 🔥 ACTIVE CARD HIGHLIGHT */
  activeHighlight: {
    borderColor: "#FFD700",
    backgroundColor: "#fffbea",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },

  activeBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  activeBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  runningText: {
    fontWeight: "700",
    marginBottom: 6,
  },

  label: { fontWeight: "700" },

  section: { marginVertical: 10 },

  serviceItem: { marginLeft: 10, marginTop: 6 },

  serviceName: { fontWeight: "700" },

  serviceMeta: {
    marginLeft: 10,
    color: "#555",
    fontSize: 13,
  },

  mapBtn: {
    marginTop: 14,
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  mapBtnText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },

  openServiceBtn: {
    marginTop: 8,
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  openServiceText: {
    color: "#080700",
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
    color: "#666",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  approveBtn: {
    flex: 1,
    backgroundColor: "#d1fae5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,
  },

  selectedApprove: {
    backgroundColor: "#22c55e",
  },

  selectedReject: {
    backgroundColor: "#ef4444",
  },

  btnText: {
    fontWeight: "bold",
    color: "#000",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    marginRight: 5,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    alignItems: "center",
  },

  confirmRejectBtn: {
    flex: 1,
    padding: 10,
    marginLeft: 5,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    alignItems: "center",
  },

  fullApprove: {
    flex: 1,
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  fullApproveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  fullReject: {
    flex: 1,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  fullRejectText: {
    color: "#fff",
    fontWeight: "bold",
  },

  dropdownMenu: {
    position: "absolute",
    top: 32,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },

  dropdownItemText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
  },

  cancelModalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },

  cancelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  cancelModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  warningBanner: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  warningBannerText: {
    fontSize: 14,
    color: "#991b1b",
    lineHeight: 20,
    fontWeight: "600",
  },

  warningSubText: {
    fontSize: 12,
    color: "#b91c1c",
    marginTop: 4,
    fontWeight: "500",
  },

  reasonSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },

  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    gap: 10,
  },

  selectedReasonOption: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },

  reasonOptionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  selectedReasonOptionText: {
    color: "#991b1b",
    fontWeight: "700",
  },

  customReasonInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#111827",
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
  },

  cancelModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },

  backBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  backBtnText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 15,
  },

  proceedBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  disabledProceedBtn: {
    backgroundColor: "#fca5a5",
    opacity: 0.6,
  },

  proceedBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  confirmModalBox: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  iconCircleRedCenter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fee2e2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  confirmModalTitleCenter: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  confirmModalQuestionCenter: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  confirmDetailsBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },

  confirmWarningText: {
    fontSize: 13,
    color: "#991b1b",
    lineHeight: 18,
  },

  confirmReasonLabel: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 8,
  },

  confirmModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  goBackBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  goBackBtnText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 14,
  },

  yesCancelBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  yesCancelBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },

  modalOkBtn: {
    width: "100%",
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOkBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
});