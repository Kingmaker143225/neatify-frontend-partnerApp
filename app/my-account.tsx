// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router, usePathname } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Linking,
//   Modal,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
// import { turnOffDutyAndLogout } from "../lib/logout";

// /* ================= SCREEN ================= */

// export default function MyAccountScreen() {
//   const pathname = usePathname();

//   const [name, setname] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
//   const [gender, setGender] = useState<string | null>(null);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [loadingLogout, setLoadingLogout] = useState(false);

//   /* ================= LOAD PROFILE ================= */
//   useEffect(() => {
//     const loadProfile = async () => {
//       const { data } = await supabase.auth.getUser();
//       if (!data.user) return;

//       const userId = data.user.id;

//       setEmail(data.user.email ?? "");

//       const { data: profile } = await supabase
//         .from("staff_profile")
//         .select("*")
//         .eq("id", userId)
//         .single();

//       if (profile) {
//         setname(profile.name ?? "");
//         setPhone(profile.phone ?? "");
//         setGender(profile.gender ?? null);

//         if (profile.avatar_url) {
//           setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
//         } else {
//           setAvatarUrl(null);
//         }
//       }
//     };

//     loadProfile();
//   }, []);

//   /* ================= LOGOUT ================= */
//   const handleLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogoutAction = async () => {
//     setLoadingLogout(true);
//     try {
//       const { data } = await supabase.auth.getUser();
//       const userId = data.user?.id;

//       await turnOffDutyAndLogout(userId);
//       setShowLogoutModal(false);
//       router.replace("/login");
//     } catch (error) {
//       console.log("Logout error:", error);
//     } finally {
//       setLoadingLogout(false);
//     }
//   };

//   const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);

//   /* ================= CUSTOMER CARE ================= */
//   const handleCustomerCare = () => {
//     setCustomerCareModalVisible(true);
//   };

//   /* ================= DEFAULT AVATAR ICON ================= */
//   const renderDefaultAvatar = () => {
//     if (gender === "male") {
//       return <Ionicons name="man" size={48} color="#777" />;
//     }
//     if (gender === "female") {
//       return <Ionicons name="woman" size={48} color="#777" />;
//     }
//     return <Ionicons name="person" size={48} color="#777" />;
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//       {/* ================= TOP HEADER ================= */}
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

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       >
//         {/* ================= HEADER ================= */}
//         <View style={styles.headerCard}>
//           <View>
//             <Text style={styles.headerTitle}>My Profile</Text>
//           </View>
//         </View>
//         {/* ================= AVATAR ================= */}
//         <View style={styles.avatarWrap}>
//           {avatarUrl ? (
//             <Image source={{ uri: avatarUrl }} style={styles.avatar} />
//           ) : (
//             <View style={styles.avatarPlaceholder}>
//               {renderDefaultAvatar()}
//             </View>
//           )}
//         </View>
//         {/* ================= READ ONLY FIELDS ================= */}
//         <ProfileField label="FULL NAME" value={name} />
//         <ProfileField label="EMAIL" value={email} />
//         <ProfileField label="PHONE NUMBER" value={phone} />
//         {/* ================= CUSTOMER CARE BUTTON ================= */}
//         <View style={styles.customerCareWrap}>
//           <TouchableOpacity
//             style={styles.customerCareBtn}
//             onPress={handleCustomerCare}
//           >
//             <Ionicons name="headset-outline" size={18} color="#000" />
//             <Text style={styles.customerCareText}>Customer Care</Text>
//           </TouchableOpacity>
//         </View>
//         {/* ================= REFER & EARN ================= */}
//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => router.push("./refer-and-earn")}
//         >
//           <Text style={styles.logoutText}>Refer & Earn</Text>
//         </TouchableOpacity>
//         {/* ================= LOGOUT ================= */}
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* ================= CUSTOM LOGOUT MODAL ================= */}
//       <Modal
//         visible={showLogoutModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowLogoutModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.customModalCard}>
//             <View style={styles.iconCircleRed}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>
//             <Text style={styles.modalTitleText}>Confirm Logout</Text>
//             <Text style={styles.modalSubtitleText}>
//               Do you want to logout?
//             </Text>

//             <View style={styles.modalInfoBoxRed}>
//               <Text style={styles.modalInfoBoxTextRed}>
//                 ⚠️ You will be signed out of your account. You will need to log
//                 in again to access your partner dashboard.
//               </Text>
//             </View>

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalGoBackBtn}
//                 onPress={() => setShowLogoutModal(false)}
//               >
//                 <Text style={styles.modalGoBackBtnText}>No, Go Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalDangerBtn}
//                 disabled={loadingLogout}
//                 onPress={confirmLogoutAction}
//               >
//                 {loadingLogout ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.modalDangerBtnText}>Yes, Logout</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= CUSTOM CUSTOMER CARE MODAL ================= */}
//       <Modal
//         visible={customerCareModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setCustomerCareModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons name="headset" size={30} color="#000" />
//             </View>

//             <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
//             <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalGoBackBtn}
//                 onPress={() => setCustomerCareModalVisible(false)}
//               >
//                 <Text style={styles.modalGoBackBtnText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.customerCareCallBtn}
//                 onPress={() => {
//                   setCustomerCareModalVisible(false);
//                   Linking.openURL("tel:+917617618567");
//                 }}
//               >
//                 <Text style={styles.customerCareCallBtnText}>Call</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

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

// /* ================= FIELD ================= */

// function ProfileField({ label, value, helper }: any) {
//   return (
//     <View style={styles.fieldCard}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <Text style={styles.fieldValue}>{value || "-"}</Text>
//       {helper && <Text style={styles.helperText}>{helper}</Text>}
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   headerCard: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     marginBottom: 14,
//     padding: 18,
//     borderRadius: 20,
//     backgroundColor: "#fff",
//   },

//   headerTitle: { alignSelf: "center", fontSize: 22, fontWeight: "800" },
//   headerSub: { color: "#64748B" },

//   avatarWrap: {
//     alignSelf: "center",
//     marginVertical: 14,
//   },

//   avatar: {
//     width: 105,
//     height: 105,
//     borderRadius: 52.5,
//   },

//   avatarPlaceholder: {
//     width: 105,
//     height: 105,
//     borderRadius: 52.5,
//     backgroundColor: "#E5E7EB",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   fieldCard: {
//     backgroundColor: "#fff",
//     marginHorizontal: 20,
//     marginBottom: 10,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 16,
//   },

//   fieldLabel: {
//     color: "#64748B",
//     fontWeight: "700",
//     fontSize: 12,
//   },

//   fieldValue: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginTop: 6,
//   },

//   helperText: {
//     marginTop: 4,
//     fontSize: 12,
//     color: "#94A3B8",
//   },

//   logoutBtn: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     paddingVertical: 14,
//     borderRadius: 20,
//     alignItems: "center",
//   },

//   logoutText: {
//     color: "#000",
//     fontWeight: "800",
//     fontSize: 16,
//   },

//   customerCareWrap: {
//     alignItems: "flex-end",
//     marginTop: 12,
//     marginRight: 20,
//   },

//   customerCareBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "#000",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 24,
//     backgroundColor: "#fff",
//   },

//   customerCareText: {
//     fontWeight: "700",
//     color: "#000",
//   },

//   footer: {
//     height: 70,
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },

//   footerItem: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   footerText: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: "600",
//     color: "#000",
//   },

//   footerTextActive: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: "800",
//     color: "#000",
//   },

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

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },

//   customModalCard: {
//     width: "90%",
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },

//   iconCircleRed: {
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

//   modalTitleText: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },

//   modalSubtitleText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "center",
//     marginTop: 4,
//     marginBottom: 12,
//   },

//   modalInfoBoxRed: {
//     width: "100%",
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 18,
//   },

//   modalInfoBoxTextRed: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },

//   modalButtonRow: {
//     flexDirection: "row",
//     gap: 12,
//     width: "100%",
//   },

//   modalGoBackBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     borderWidth: 1.5,
//     borderColor: "#d1d5db",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalGoBackBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   modalDangerBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalDangerBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   dutyModalCard: {
//     width: "100%",
//     backgroundColor: "#ffffff",
//     borderColor: "#FFD700",
//     borderWidth: 2,
//     borderRadius: 24,
//     paddingVertical: 24,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//   },
//   dutyIconCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#FFF3B0",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   dutyModalTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },
//   dutyModalMessage: {
//     fontSize: 16,
//     color: "#4B5563",
//     textAlign: "center",
//     marginTop: 8,
//     marginBottom: 20,
//     fontWeight: "700",
//   },
//   customerCareCallBtn: {
//     flex: 1,
//     backgroundColor: "#FFD700",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   customerCareCallBtnText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },
// });
















// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router, usePathname } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Linking,
//   Modal,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
// import { turnOffDutyAndLogout } from "../lib/logout";

// /* ================= SCREEN ================= */

// export default function MyAccountScreen() {
//   const pathname = usePathname();

//   const [name, setname] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
//   const [gender, setGender] = useState<string | null>(null);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [loadingLogout, setLoadingLogout] = useState(false);

//   /* ================= LOAD PROFILE ================= */
//   useEffect(() => {
//     const loadProfile = async () => {
//       const { data } = await supabase.auth.getUser();
//       if (!data.user) return;

//       const userId = data.user.id;

//       setEmail(data.user.email ?? "");

//       const { data: profile } = await supabase
//         .from("staff_profile")
//         .select("*")
//         .eq("id", userId)
//         .single();

//       if (profile) {
//         setname(profile.name ?? "");
//         setPhone(profile.phone ?? "");
//         setGender(profile.gender ?? null);

//         if (profile.avatar_url) {
//           setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
//         } else {
//           setAvatarUrl(null);
//         }
//       }
//     };

//     loadProfile();
//   }, []);

//   /* ================= LOGOUT ================= */
//   const handleLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogoutAction = async () => {
//     setLoadingLogout(true);
//     try {
//       const { data } = await supabase.auth.getUser();
//       const userId = data.user?.id;

//       await turnOffDutyAndLogout(userId);
//       setShowLogoutModal(false);
//       router.replace("/login");
//     } catch (error) {
//       console.log("Logout error:", error);
//     } finally {
//       setLoadingLogout(false);
//     }
//   };

//   const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);

//   /* ================= CUSTOMER CARE ================= */
//   const handleCustomerCare = () => {
//     setCustomerCareModalVisible(true);
//   };

//   /* ================= DEFAULT AVATAR ICON ================= */
//   const renderDefaultAvatar = () => {
//     if (gender === "male") {
//       return <Ionicons name="man" size={48} color="#777" />;
//     }
//     if (gender === "female") {
//       return <Ionicons name="woman" size={48} color="#777" />;
//     }
//     return <Ionicons name="person" size={48} color="#777" />;
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//       {/* ================= TOP HEADER ================= */}
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

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       >
//         {/* ================= HEADER ================= */}
//         <View style={styles.headerCard}>
//           <View>
//             <Text style={styles.headerTitle}>My Profile</Text>
//           </View>
//         </View>
//         {/* ================= AVATAR ================= */}
//         <View style={styles.avatarWrap}>
//           {avatarUrl ? (
//             <Image source={{ uri: avatarUrl }} style={styles.avatar} />
//           ) : (
//             <View style={styles.avatarPlaceholder}>
//               {renderDefaultAvatar()}
//             </View>
//           )}
//         </View>
//         {/* ================= READ ONLY FIELDS ================= */}
//         <ProfileField label="FULL NAME" value={name} />
//         <ProfileField label="EMAIL" value={email} />
//         <ProfileField label="PHONE NUMBER" value={phone} />
//         {/* ================= CUSTOMER CARE BUTTON ================= */}
//         <View style={styles.customerCareWrap}>
//           <TouchableOpacity
//             style={styles.customerCareBtn}
//             onPress={handleCustomerCare}
//           >
//             <Ionicons name="headset-outline" size={18} color="#000" />
//             <Text style={styles.customerCareText}>Customer Care</Text>
//           </TouchableOpacity>
//         </View>
//         {/* ================= REFER & EARN ================= */}
//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => router.push("./refer-and-earn")}
//         >
//           <Text style={styles.logoutText}>Refer & Earn</Text>
//         </TouchableOpacity>
//         {/* ================= LOGOUT ================= */}
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* ================= CUSTOM LOGOUT MODAL ================= */}
//       <Modal
//         visible={showLogoutModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowLogoutModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.customModalCard}>
//             <View style={styles.iconCircleRed}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>
//             <Text style={styles.modalTitleText}>Confirm Logout</Text>
//             <Text style={styles.modalSubtitleText}>
//               Do you want to logout?
//             </Text>

//             <View style={styles.modalInfoBoxRed}>
//               <Text style={styles.modalInfoBoxTextRed}>
//                 ⚠️ You will be signed out of your account. You will need to log
//                 in again to access your partner dashboard.
//               </Text>
//             </View>

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalGoBackBtn}
//                 onPress={() => setShowLogoutModal(false)}
//               >
//                 <Text style={styles.modalGoBackBtnText}>No, Go Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalDangerBtn}
//                 disabled={loadingLogout}
//                 onPress={confirmLogoutAction}
//               >
//                 {loadingLogout ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.modalDangerBtnText}>Yes, Logout</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= CUSTOM CUSTOMER CARE MODAL ================= */}
//       <Modal
//         visible={customerCareModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setCustomerCareModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons name="headset" size={30} color="#000" />
//             </View>

//             <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
//             <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalGoBackBtn}
//                 onPress={() => setCustomerCareModalVisible(false)}
//               >
//                 <Text style={styles.modalGoBackBtnText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.customerCareCallBtn}
//                 onPress={() => {
//                   setCustomerCareModalVisible(false);
//                   Linking.openURL("tel:+917617618567");
//                 }}
//               >
//                 <Text style={styles.customerCareCallBtnText}>Call</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

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

// /* ================= FIELD ================= */

// function ProfileField({ label, value, helper }: any) {
//   return (
//     <View style={styles.fieldCard}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <Text style={styles.fieldValue}>{value || "-"}</Text>
//       {helper && <Text style={styles.helperText}>{helper}</Text>}
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   headerCard: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     marginBottom: 14,
//     padding: 18,
//     borderRadius: 20,
//     backgroundColor: "#fff",
//   },

//   headerTitle: { alignSelf: "center", fontSize: 22, fontWeight: "800" },
//   headerSub: { color: "#64748B" },

//   avatarWrap: {
//     alignSelf: "center",
//     marginVertical: 14,
//   },

//   avatar: {
//     width: 105,
//     height: 105,
//     borderRadius: 52.5,
//   },

//   avatarPlaceholder: {
//     width: 105,
//     height: 105,
//     borderRadius: 52.5,
//     backgroundColor: "#E5E7EB",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   fieldCard: {
//     backgroundColor: "#fff",
//     marginHorizontal: 20,
//     marginBottom: 10,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 16,
//   },

//   fieldLabel: {
//     color: "#64748B",
//     fontWeight: "700",
//     fontSize: 12,
//   },

//   fieldValue: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginTop: 6,
//   },

//   helperText: {
//     marginTop: 4,
//     fontSize: 12,
//     color: "#94A3B8",
//   },

//   logoutBtn: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     paddingVertical: 14,
//     borderRadius: 20,
//     alignItems: "center",
//   },

//   logoutText: {
//     color: "#000",
//     fontWeight: "800",
//     fontSize: 16,
//   },

//   customerCareWrap: {
//     alignItems: "flex-end",
//     marginTop: 12,
//     marginRight: 20,
//   },

//   customerCareBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "#000",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 24,
//     backgroundColor: "#fff",
//   },

//   customerCareText: {
//     fontWeight: "700",
//     color: "#000",
//   },

//   footer: {
//     height: 70,
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },

//   footerItem: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   footerText: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: "600",
//     color: "#000",
//   },

//   footerTextActive: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: "800",
//     color: "#000",
//   },

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

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },

//   customModalCard: {
//     width: "90%",
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },

//   iconCircleRed: {
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

//   modalTitleText: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },

//   modalSubtitleText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "center",
//     marginTop: 4,
//     marginBottom: 12,
//   },

//   modalInfoBoxRed: {
//     width: "100%",
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 18,
//   },

//   modalInfoBoxTextRed: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },

//   modalButtonRow: {
//     flexDirection: "row",
//     gap: 12,
//     width: "100%",
//   },

//   modalGoBackBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     borderWidth: 1.5,
//     borderColor: "#d1d5db",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalGoBackBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   modalDangerBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalDangerBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   dutyModalCard: {
//     width: "100%",
//     backgroundColor: "#ffffff",
//     borderColor: "#FFD700",
//     borderWidth: 2,
//     borderRadius: 24,
//     paddingVertical: 24,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//   },
//   dutyIconCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#FFF3B0",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   dutyModalTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },
//   dutyModalMessage: {
//     fontSize: 16,
//     color: "#4B5563",
//     textAlign: "center",
//     marginTop: 8,
//     marginBottom: 20,
//     fontWeight: "700",
//   },
//   customerCareCallBtn: {
//     flex: 1,
//     backgroundColor: "#FFD700",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   customerCareCallBtnText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },
// });
















// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router, usePathname } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Linking,
//   Modal,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import { authApi, partnerApi } from "../lib/api";
// import { turnOffDutyAndLogout } from "../lib/logout";

// /* ================= SCREEN ================= */

// export default function MyAccountScreen() {
//   const pathname = usePathname();

//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
//   const [gender, setGender] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [loadingLogout, setLoadingLogout] = useState(false);
//   const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);

//   /* ================= LOAD PROFILE ================= */
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         console.log("👤 Loading profile...");

//         // Get authenticated user
//         const user = await authApi.me();

//         console.log("✅ Auth user:", JSON.stringify(user, null, 2));

//         if (!user) {
//           console.log("❌ No authenticated user");
//           setLoading(false);
//           return;
//         }

//         // Email comes from auth
//         setEmail(user.email ?? "");

//         // Get partner profile from FastAPI
//         const profileResponse = await partnerApi.profile();

//         console.log("✅ Partner profile:", JSON.stringify(profileResponse, null, 2));

//         // Handle either direct profile response or { profile: {...} } or { data: {...} }
//         const profile = profileResponse?.profile ?? profileResponse?.data ?? profileResponse;

//         if (!profile) {
//           console.log("❌ No profile returned");
//           setLoading(false);
//           return;
//         }

//         setName(
//           profile.name ??
//           profile.full_name ??
//           profile.fullName ??
//           ""
//         );

//         setPhone(
//           profile.phone ??
//           profile.phone_number ??
//           profile.mobile ??
//           profile.mobile_number ??
//           ""
//         );

//         setGender(
//           profile.gender ??
//           profile.gender_preference ??
//           null
//         );

//         if (profile.avatar_url) {
//           setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
//         } else {
//           setAvatarUrl(null);
//         }

//         console.log("✅ Profile loaded successfully:", { name, phone, email, gender });

//       } catch (error) {
//         console.error("❌ Failed to load profile:", error);
//         Alert.alert(
//           "Profile Error",
//           error instanceof Error ? error.message : "Unable to load your profile."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   /* ================= LOGOUT ================= */
//   const handleLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogoutAction = async () => {
//     setLoadingLogout(true);
//     try {
//       await turnOffDutyAndLogout();
//       setShowLogoutModal(false);
//       router.replace("/login");
//     } catch (error) {
//       console.log("Logout error:", error);
//       Alert.alert(
//         "Logout Error",
//         error instanceof Error ? error.message : "Unable to logout."
//       );
//     } finally {
//       setLoadingLogout(false);
//     }
//   };

//   /* ================= CUSTOMER CARE ================= */
//   const handleCustomerCare = () => {
//     setCustomerCareModalVisible(true);
//   };

//   /* ================= DEFAULT AVATAR ICON ================= */
//   const renderDefaultAvatar = () => {
//     if (gender === "male") {
//       return <Ionicons name="man" size={48} color="#777" />;
//     }
//     if (gender === "female") {
//       return <Ionicons name="woman" size={48} color="#777" />;
//     }
//     return <Ionicons name="person" size={48} color="#777" />;
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#FFD700" />
//         <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading profile...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//       {/* ================= TOP HEADER ================= */}
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

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       >
//         {/* ================= HEADER ================= */}
//         <View style={styles.headerCard}>
//           <View>
//             <Text style={styles.headerTitle}>My Profile</Text>
//           </View>
//         </View>

//         {/* ================= AVATAR ================= */}
//         <View style={styles.avatarWrap}>
//           {avatarUrl ? (
//             <Image source={{ uri: avatarUrl }} style={styles.avatar} />
//           ) : (
//             <View style={styles.avatarPlaceholder}>
//               {renderDefaultAvatar()}
//             </View>
//           )}
//         </View>

//         {/* ================= READ ONLY FIELDS ================= */}
//         <ProfileField label="FULL NAME" value={name} />
//         <ProfileField label="EMAIL" value={email} />
//         <ProfileField label="PHONE NUMBER" value={phone} />

//         {/* ================= CUSTOMER CARE BUTTON ================= */}
//         <View style={styles.customerCareWrap}>
//           <TouchableOpacity
//             style={styles.customerCareBtn}
//             onPress={handleCustomerCare}
//           >
//             <Ionicons name="headset-outline" size={18} color="#000" />
//             <Text style={styles.customerCareText}>Customer Care</Text>
//           </TouchableOpacity>
//         </View>

//         {/* ================= REFER & EARN ================= */}
//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={() => router.push("./refer-and-earn")}
//         >
//           <Text style={styles.logoutText}>Refer & Earn</Text>
//         </TouchableOpacity>

//         {/* ================= LOGOUT ================= */}
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* ================= CUSTOM LOGOUT MODAL ================= */}
//       <Modal
//         visible={showLogoutModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowLogoutModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.customModalCard}>
//             <View style={styles.iconCircleRed}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>
//             <Text style={styles.modalTitleText}>Confirm Logout</Text>
//             <Text style={styles.modalSubtitleText}>
//               Do you want to logout?
//             </Text>

//             <View style={styles.modalInfoBoxRed}>
//               <Text style={styles.modalInfoBoxTextRed}>
//                 ⚠️ You will be signed out of your account. You will need to log
//                 in again to access your partner dashboard.
//               </Text>
//             </View>

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalGoBackBtn}
//                 onPress={() => setShowLogoutModal(false)}
//               >
//                 <Text style={styles.modalGoBackBtnText}>No, Go Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalDangerBtn}
//                 disabled={loadingLogout}
//                 onPress={confirmLogoutAction}
//               >
//                 {loadingLogout ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.modalDangerBtnText}>Yes, Logout</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ================= CUSTOM CUSTOMER CARE MODAL ================= */}
//       <Modal
//         visible={customerCareModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setCustomerCareModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons name="headset" size={30} color="#000" />
//             </View>

//             <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
//             <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalGoBackBtn}
//                 onPress={() => setCustomerCareModalVisible(false)}
//               >
//                 <Text style={styles.modalGoBackBtnText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.customerCareCallBtn}
//                 onPress={() => {
//                   setCustomerCareModalVisible(false);
//                   Linking.openURL("tel:+917617618567");
//                 }}
//               >
//                 <Text style={styles.customerCareCallBtnText}>Call</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// /* ================= FIELD ================= */

// function ProfileField({ label, value, helper }: any) {
//   return (
//     <View style={styles.fieldCard}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <Text style={styles.fieldValue}>{value || "-"}</Text>
//       {helper && <Text style={styles.helperText}>{helper}</Text>}
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   headerCard: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     marginBottom: 14,
//     padding: 18,
//     borderRadius: 20,
//     backgroundColor: "#fff",
//   },

//   headerTitle: { alignSelf: "center", fontSize: 22, fontWeight: "800" },
//   headerSub: { color: "#64748B" },

//   avatarWrap: {
//     alignSelf: "center",
//     marginVertical: 14,
//   },

//   avatar: {
//     width: 105,
//     height: 105,
//     borderRadius: 52.5,
//   },

//   avatarPlaceholder: {
//     width: 105,
//     height: 105,
//     borderRadius: 52.5,
//     backgroundColor: "#E5E7EB",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   fieldCard: {
//     backgroundColor: "#fff",
//     marginHorizontal: 20,
//     marginBottom: 10,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 16,
//   },

//   fieldLabel: {
//     color: "#64748B",
//     fontWeight: "700",
//     fontSize: 12,
//   },

//   fieldValue: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginTop: 6,
//   },

//   helperText: {
//     marginTop: 4,
//     fontSize: 12,
//     color: "#94A3B8",
//   },

//   logoutBtn: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     paddingVertical: 14,
//     borderRadius: 20,
//     alignItems: "center",
//   },

//   logoutText: {
//     color: "#000",
//     fontWeight: "800",
//     fontSize: 16,
//   },

//   customerCareWrap: {
//     alignItems: "flex-end",
//     marginTop: 12,
//     marginRight: 20,
//   },

//   customerCareBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "#000",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 24,
//     backgroundColor: "#fff",
//   },

//   customerCareText: {
//     fontWeight: "700",
//     color: "#000",
//   },

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

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },

//   customModalCard: {
//     width: "90%",
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },

//   iconCircleRed: {
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

//   modalTitleText: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },

//   modalSubtitleText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "center",
//     marginTop: 4,
//     marginBottom: 12,
//   },

//   modalInfoBoxRed: {
//     width: "100%",
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 18,
//   },

//   modalInfoBoxTextRed: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },

//   modalButtonRow: {
//     flexDirection: "row",
//     gap: 12,
//     width: "100%",
//   },

//   modalGoBackBtn: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//     borderWidth: 1.5,
//     borderColor: "#d1d5db",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalGoBackBtnText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   modalDangerBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   modalDangerBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   dutyModalCard: {
//     width: "100%",
//     backgroundColor: "#ffffff",
//     borderColor: "#FFD700",
//     borderWidth: 2,
//     borderRadius: 24,
//     paddingVertical: 24,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//   },
//   dutyIconCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#FFF3B0",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   dutyModalTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//     textAlign: "center",
//   },
//   dutyModalMessage: {
//     fontSize: 16,
//     color: "#4B5563",
//     textAlign: "center",
//     marginTop: 8,
//     marginBottom: 20,
//     fontWeight: "700",
//   },
//   customerCareCallBtn: {
//     flex: 1,
//     backgroundColor: "#FFD700",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   customerCareCallBtnText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },
// });















import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi, partnerApi, PartnerProfile, ProfileResponse } from "../lib/api";
import { turnOffDutyAndLogout } from "../lib/logout";

/* ================= SCREEN ================= */

export default function MyAccountScreen() {
  const pathname = usePathname();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);

  const [policyStatus, setPolicyStatus] = useState<any>(null);

  const [policyContent, setPolicyContent] = useState("");
  const [termsContent, setTermsContent] = useState("");

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { width } = useWindowDimensions();

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("👤 Loading profile...");

        // Get authenticated user
        const user = await authApi.me();

        console.log("✅ Auth user:", JSON.stringify(user, null, 2));

        if (!user) {
          console.log("❌ No authenticated user");
          setLoading(false);
          return;
        }

        // Email comes from auth
        setEmail(user.email ?? "");

        // Get partner profile from FastAPI
        const profileResponse: ProfileResponse = await partnerApi.profile();

        console.log("✅ Partner profile:", JSON.stringify(profileResponse, null, 2));

        // Handle either direct profile response or { profile: {...} } or { data: {...} }
        const profile: PartnerProfile | undefined =
          profileResponse?.profile ??
          profileResponse?.data ??
          profileResponse as unknown as PartnerProfile;

        if (!profile) {
          console.log("❌ No profile returned");
          setLoading(false);
          return;
        }

        setName(
          profile.name ??
          profile.full_name ??
          profile.fullName ??
          ""
        );

        setPhone(
          profile.phone ??
          profile.phone_number ??
          profile.mobile ??
          profile.mobile_number ??
          ""
        );

        setGender(
          profile.gender ??
          profile.gender_preference ??
          null
        );

        if (profile.avatar_url) {
          setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
        } else {
          setAvatarUrl(null);
        }

        console.log("✅ Profile loaded successfully:", { name, phone, email, gender });

      } catch (error) {
        console.error("❌ Failed to load profile:", error);
        Alert.alert(
          "Profile Error",
          error instanceof Error ? error.message : "Unable to load your profile."
        );
      } finally {
        const status =
          await partnerApi.getPolicyStatus();

        setPolicyStatus(status);

        const policies =
          await partnerApi.getPolicies();

        setPolicyContent(
          policies.user_policies || ""
        );

        setTermsContent(
          policies.terms_and_conditions || ""
        );
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogoutAction = async () => {
    setLoadingLogout(true);
    try {
      await turnOffDutyAndLogout();
      setShowLogoutModal(false);
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert(
        "Logout Error",
        error instanceof Error ? error.message : "Unable to logout."
      );
    } finally {
      setLoadingLogout(false);
    }
  };

  /* ================= CUSTOMER CARE ================= */
  const handleCustomerCare = () => {
    setCustomerCareModalVisible(true);
  };

  /* ================= DEFAULT AVATAR ICON ================= */
  const renderDefaultAvatar = () => {
    if (gender === "male") {
      return <Ionicons name="man" size={48} color="#777" />;
    }
    if (gender === "female") {
      return <Ionicons name="woman" size={48} color="#777" />;
    }
    return <Ionicons name="person" size={48} color="#777" />;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

      {/* ================= TOP HEADER ================= */}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        {/* ================= AVATAR ================= */}
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {renderDefaultAvatar()}
            </View>
          )}
        </View>

        {/* ================= READ ONLY FIELDS ================= */}
        <ProfileField label="FULL NAME" value={name} />
        <ProfileField label="EMAIL" value={email} />
        <ProfileField label="PHONE NUMBER" value={phone} />

        {policyStatus?.terms_accepted &&
          policyStatus?.privacy_policy_accepted && (

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>
                POLICY ACCEPTANCE
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Ionicons
                  name="checkbox"
                  size={18}
                  color="green"
                />

                <Text
                  style={{
                    marginLeft: 8,
                  }}
                >
                  I agree to the{" "}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowPrivacyModal(true)
                  }
                >
                  <Text
                    style={{
                      color: "#2563eb",
                      fontWeight: "700",
                      textDecorationLine: "underline",
                    }}
                  >
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Ionicons
                  name="checkbox"
                  size={18}
                  color="green"
                />

                <Text
                  style={{
                    marginLeft: 8,
                  }}
                >
                  I agree to the{" "}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowTermsModal(true)
                  }
                >
                  <Text
                    style={{
                      color: "#2563eb",
                      fontWeight: "700",
                      textDecorationLine: "underline",
                    }}
                  >
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  color: "green",
                  fontWeight: "700",
                  marginTop: 8,
                }}
              >
                Accepted
              </Text>
            </View>
          )}
        {/* ================= CUSTOMER CARE BUTTON ================= */}
        <View style={styles.customerCareWrap}>
          <TouchableOpacity
            style={styles.customerCareBtn}
            onPress={handleCustomerCare}
          >
            <Ionicons name="headset-outline" size={18} color="#000" />
            <Text style={styles.customerCareText}>Customer Care</Text>
          </TouchableOpacity>
        </View>

        {/* ================= REFER & EARN ================= */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.push("./refer-and-earn")}
        >
          <Text style={styles.logoutText}>Refer & Earn</Text>
        </TouchableOpacity>

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPrivacyModal}
        animationType="slide"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
        >

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              Privacy Policy
            </Text>

            <TouchableOpacity
              onPress={() =>
                setShowPrivacyModal(false)
              }
            >
              <Ionicons
                name="close"
                size={28}
                color="#000"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              paddingHorizontal: 20,
            }}
          >
            <RenderHtml
              contentWidth={width}
              source={{ html: policyContent }}
              tagsStyles={{
                h1: {
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 12,
                },
                h2: {
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 12,
                  marginBottom: 8,
                },
                p: {
                  fontSize: 15,
                  lineHeight: 24,
                  color: "#374151",
                },
                li: {
                  marginBottom: 6,
                },
              }}
            />
          </ScrollView>

        </SafeAreaView>
      </Modal>

      <Modal
        visible={showTermsModal}
        animationType="slide"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
        >

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              Terms & Conditions
            </Text>

            <TouchableOpacity
              onPress={() =>
                setShowTermsModal(false)
              }
            >
              <Ionicons
                name="close"
                size={28}
                color="#000"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              paddingHorizontal: 20,
            }}
          >
            <RenderHtml
              contentWidth={width}
              source={{ html: termsContent }}
              tagsStyles={{
                h1: {
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 12,
                },
                h2: {
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 12,
                  marginBottom: 8,
                },
                p: {
                  fontSize: 15,
                  lineHeight: 24,
                  color: "#374151",
                },
                li: {
                  marginBottom: 6,
                },
              }}
            />
          </ScrollView>

        </SafeAreaView>
      </Modal>

      {/* ================= CUSTOM LOGOUT MODAL ================= */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalCard}>
            <View style={styles.iconCircleRed}>
              <Ionicons name="help-circle" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitleText}>Confirm Logout</Text>
            <Text style={styles.modalSubtitleText}>
              Do you want to logout?
            </Text>

            <View style={styles.modalInfoBoxRed}>
              <Text style={styles.modalInfoBoxTextRed}>
                ⚠️ You will be signed out of your account. You will need to log
                in again to access your partner dashboard.
              </Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalGoBackBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalGoBackBtnText}>No, Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDangerBtn}
                disabled={loadingLogout}
                onPress={confirmLogoutAction}
              >
                {loadingLogout ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalDangerBtnText}>Yes, Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= CUSTOM CUSTOMER CARE MODAL ================= */}
      <Modal
        visible={customerCareModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCustomerCareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dutyModalCard}>
            <View style={styles.dutyIconCircle}>
              <Ionicons name="headset" size={30} color="#000" />
            </View>

            <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
            <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalGoBackBtn}
                onPress={() => setCustomerCareModalVisible(false)}
              >
                <Text style={styles.modalGoBackBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.customerCareCallBtn}
                onPress={() => {
                  setCustomerCareModalVisible(false);
                  Linking.openURL("tel:+917617618567");
                }}
              >
                <Text style={styles.customerCareCallBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= FIELD ================= */

function ProfileField({ label, value, helper }: any) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "-"}</Text>
      {helper && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerCard: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  headerTitle: { alignSelf: "center", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#64748B" },

  avatarWrap: {
    alignSelf: "center",
    marginVertical: 14,
  },

  avatar: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
  },

  avatarPlaceholder: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  fieldCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  fieldLabel: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 12,
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },

  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },

  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },

  logoutText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 16,
  },

  customerCareWrap: {
    alignItems: "flex-end",
    marginTop: 2,
    marginRight: 20,
  },

  customerCareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#fff",
  },

  customerCareText: {
    fontWeight: "700",
    color: "#000",
  },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  customModalCard: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  iconCircleRed: {
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

  modalTitleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  modalSubtitleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },

  modalInfoBoxRed: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  modalInfoBoxTextRed: {
    fontSize: 13,
    color: "#991b1b",
    lineHeight: 18,
  },

  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  modalGoBackBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalGoBackBtnText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 14,
  },

  modalDangerBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalDangerBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },

  dutyModalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderColor: "#FFD700",
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  dutyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF3B0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  dutyModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  dutyModalMessage: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    fontWeight: "700",
  },
  customerCareCallBtn: {
    flex: 1,
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  customerCareCallBtnText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 15,
  },
});