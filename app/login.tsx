// // import { Ionicons } from "@expo/vector-icons";
// // import { Image } from "expo-image";
// // import * as LocalAuthentication from "expo-local-authentication";
// // import * as Notifications from "expo-notifications";
// // import { router } from "expo-router";
// // import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
// // import React, { useEffect, useState } from "react";
// // import {
// //   ActivityIndicator,
// //   Alert,
// //   BackHandler,
// //   KeyboardAvoidingView,
// //   Modal,
// //   Platform,
// //   ScrollView,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // import { registerForPushNotificationsAsync } from "./notifications";
// // import { scheduleDailyDutyReminders } from "../lib/dutyReminders";

// // import { supabase } from "../lib/supabase";

// // Notifications.setNotificationHandler({
// //   handleNotification: async () => ({
// //     shouldShowAlert: true,
// //     shouldPlaySound: true,
// //     shouldSetBadge: false,

// //     // ✅ ADD THESE (IMPORTANT)
// //     shouldShowBanner: true,
// //     shouldShowList: true,
// //   }),
// // });

// // export default function LoginScreen() {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const [sessionExists, setSessionExists] = useState(false);
// //   const [checkingSession, setCheckingSession] = useState(true);

// //   const [loginMode, setLoginMode] = useState<"email" | "mobile">("email");

// //   const [alertModal, setAlertModal] = useState<{
// //     visible: boolean;
// //     title: string;
// //     message: string;
// //     isBlocked?: boolean;
// //   }>({
// //     visible: false,
// //     title: "",
// //     message: "",
// //     isBlocked: false,
// //   });

// //   const showAlert = (
// //     title: string,
// //     message: string,
// //     isBlocked: boolean = false
// //   ) => {
// //     setAlertModal({
// //       visible: true,
// //       title,
// //       message,
// //       isBlocked,
// //     });
// //   };
// //   // const [mobile, setMobile] = useState("");
// //   // const [otp, setOtp] = useState("");
// //   // const [otpSent, setOtpSent] = useState(false);

// //   // // ✅ NEW STATES FOR TIMER
// //   // const [timer, setTimer] = useState(60);
// //   // const [isResendDisabled, setIsResendDisabled] = useState(false);

// //   useEffect(() => {
// //     checkSession();

// //     const { data: listener } = supabase.auth.onAuthStateChange(
// //       async (event, session) => {
// //         if (session) setSessionExists(true);
// //         else setSessionExists(false);
// //         setCheckingSession(false);
// //       },
// //     );

// //     return () => {
// //       listener.subscription.unsubscribe();
// //     };
// //   }, []);

// //   // ✅ SAFE TIMER EFFECT (NO TYPESCRIPT ERROR)
// //   // useEffect(() => {
// //   //   if (!otpSent) return;

// //   //   setIsResendDisabled(true);
// //   //   setTimer(60);

// //   //   const interval = setInterval(() => {
// //   //     setTimer((prev) => {
// //   //       if (prev <= 1) {
// //   //         clearInterval(interval);
// //   //         setIsResendDisabled(false);
// //   //         return 0;
// //   //       }
// //   //       return prev - 1;
// //   //     });
// //   //   }, 1000);

// //   //   return () => clearInterval(interval);
// //   // }, [otpSent]);

// //   // useEffect(() => {
// //   //   const backAction = () => {
// //   //     if (loginMode === "mobile") {
// //   //       setLoginMode("email");
// //   //       setOtpSent(false);
// //   //       setMobile("");
// //   //       setOtp("");
// //   //       setIsResendDisabled(false);
// //   //       setTimer(60);
// //   //       return true;
// //   //     }
// //   //     return false;
// //   //   };

// //   //   const backHandler = BackHandler.addEventListener(
// //   //     "hardwareBackPress",
// //   //     backAction,
// //   //   );

// //   //   return () => backHandler.remove();
// //   // }, [loginMode]);

// //   useEffect(() => {
// //     const subscription = BackHandler.addEventListener(
// //       "hardwareBackPress",
// //       () => {
// //         BackHandler.exitApp(); // closes the app
// //         return true; // prevent default behavior
// //       },
// //     );

// //     return () => subscription.remove();
// //   }, []);

// //   const checkSession = async () => {
// //     const {
// //       data: { session },
// //     } = await supabase.auth.getSession();

// //     if (session) {
// //       const { data: staffData } = await supabase
// //         .from("staff_profile")
// //         .select("id, is_blocked")
// //         .eq("id", session.user.id)
// //         .maybeSingle();

// //       if (!staffData) {
// //         await supabase.auth.signOut();
// //         setSessionExists(false);
// //       } else if (staffData.is_blocked) {
// //         await supabase.auth.signOut();
// //         setSessionExists(false);
// //         showAlert(
// //           "Account Blocked",
// //           "Your account has been temporarily blocked. Contact info@thaneatifyteam.in for more details.",
// //           true
// //         );
// //       } else {
// //         setSessionExists(true);
// //       }
// //     } else {
// //       setSessionExists(false);
// //     }
// //     setCheckingSession(false);
// //   };

// //   const isAuthenticatingRef = React.useRef(false);

// //   const verifyDeviceSecurity = async () => {
// //     if (isAuthenticatingRef.current) return true;
// //     isAuthenticatingRef.current = true;
// //     try {
// //       const hasHardware = await LocalAuthentication.hasHardwareAsync();
// //       const isEnrolled = await LocalAuthentication.isEnrolledAsync();
// //       if (!hasHardware || !isEnrolled) return true;

// //       const result = await LocalAuthentication.authenticateAsync({
// //         promptMessage: "Unlock Neatify Staff",
// //       });

// //       return result.success;
// //     } catch {
// //       return true;
// //     } finally {
// //       isAuthenticatingRef.current = false;
// //     }
// //   };

// //   const handleLogin = async () => {
// //     if (!email || !password) {
// //       showAlert("Error", "Email and password required");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       // Step 1: Login with Supabase Auth
// //       const { data, error } = await supabase.auth.signInWithPassword({
// //         email,
// //         password,
// //       });

// //       if (error) throw error;

// //       const userId = data.user.id;

// //       // Step 2: Check if this user exists in staff_profile and if blocked
// //       const { data: staffData } = await supabase
// //         .from("staff_profile")
// //         .select("id, is_blocked")
// //         .eq("id", userId)
// //         .maybeSingle();

// //       if (!staffData) {
// //         // If not staff → block login
// //         await supabase.auth.signOut();
// //         showAlert(
// //           "Access Denied",
// //           "This account is not authorized to access the Staff App."
// //         );
// //         return;
// //       }

// //       if (staffData.is_blocked) {
// //         await supabase.auth.signOut();
// //         showAlert(
// //           "Account Blocked",
// //           "Your account has been temporarily blocked. Contact info@thaneatifyteam.in for more details.",
// //           true
// //         );
// //         return;
// //       }

// //       // Step 3: Biometric verification (prompts ONCE)
// //       const verified = await verifyDeviceSecurity();

// //       if (!verified) {
// //         await supabase.auth.signOut();
// //         showAlert("Verification Failed", "Device authentication failed.");
// //         return;
// //       }

// //       // Step 4: Allow staff to enter app
// //       const token = await registerForPushNotificationsAsync();

// //       console.log("Push Token:", token);

// //       if (token) {
// //         await supabase
// //           .from("staff_profile")
// //           .update({ push_token: null })
// //           .eq("push_token", token);

// //         await supabase
// //           .from("staff_profile")
// //           .update({ push_token: token })
// //           .eq("id", userId);
// //       }

// //       // Schedule Daily Duty Reminders (7:30 AM & 8:00 AM)
// //       await scheduleDailyDutyReminders();

// //       // Navigate to main app
// //       router.replace("./my-role");
// //     } catch (err: any) {
// //       showAlert("Login Failed", err.message || "An error occurred during login.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //   // const getCleanMobile = () => mobile.replace(/\D/g, "");

// //   // const checkIfMobileRegistered = async () => {
// //   //   const cleanedMobile = getCleanMobile();

// //   //   if (cleanedMobile.length !== 10) {
// //   //     Alert.alert("Error", "Enter valid 10 digit mobile number");
// //   //     return false;
// //   //   }

// //   //   const formattedPhone = `+91${cleanedMobile}`;

// //   //   const { data } = await supabase
// //   //     .from("staff_profile")
// //   //     .select("phone")
// //   //     .eq("phone", formattedPhone)
// //   //     .maybeSingle();

// //   //   if (!data) {
// //   //     Alert.alert("Error", "Number not registered yet");
// //   //     return false;
// //   //   }

// //   //   return true;
// //   // };

// //   // const handleSendOtp = async () => {
// //   //   const exists = await checkIfMobileRegistered();
// //   //   if (!exists) return;

// //   //   const formattedPhone = `+91${getCleanMobile()}`;

// //   //   setLoading(true);

// //   //   const { error } = await supabase.auth.signInWithOtp({
// //   //     phone: formattedPhone,
// //   //   });

// //   //   setLoading(false);

// //   //   if (error) {
// //   //     Alert.alert("Error", error.message);
// //   //   } else {
// //   //     setOtpSent(true); // triggers timer
// //   //     setOtp("");
// //   //     Alert.alert("Success", "OTP sent successfully");
// //   //   }
// //   // };

// //   // const handleVerifyOtp = async () => {
// //   //   if (!otp) {
// //   //     Alert.alert("Error", "Enter OTP");
// //   //     return;
// //   //   }

// //   //   const formattedPhone = `+91${getCleanMobile()}`;

// //   //   setLoading(true);

// //   //   const { error } = await supabase.auth.verifyOtp({
// //   //     phone: formattedPhone,
// //   //     token: otp,
// //   //     type: "sms",
// //   //   });

// //   //   if (error) {
// //   //     setLoading(false);
// //   //     Alert.alert("Error", "Invalid OTP");
// //   //     return;
// //   //   }


// //   const handleUnlock = async () => {
// //     if (loading) return;
// //     setLoading(true);

// //     try {
// //       const {
// //         data: { session },
// //       } = await supabase.auth.getSession();

// //       if (session) {
// //         const { data: staffData } = await supabase
// //           .from("staff_profile")
// //           .select("id, is_blocked")
// //           .eq("id", session.user.id)
// //           .maybeSingle();

// //         if (staffData?.is_blocked) {
// //           await supabase.auth.signOut();
// //           setSessionExists(false);
// //           showAlert(
// //             "Account Blocked",
// //             "Your account has been temporarily blocked. Contact info@thaneatifyteam.in for more details.",
// //             true
// //           );
// //           return;
// //         }
// //       }

// //       const verified = await verifyDeviceSecurity();
// //       if (verified) {
// //         router.replace("./my-role");
// //       } else {
// //         showAlert("Verification Failed", "Device authentication failed.");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (checkingSession) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <ActivityIndicator size="large" color="#FFD700" />
// //       </View>
// //     );
// //   }

// //   if (sessionExists && !loading) {
// //     return (
// //       <View style={styles.unlockContainer}>
// //         <StatusBar barStyle="dark-content" />
// //         <Image
// //           source={require("../assets/images/logo.png")}
// //           style={styles.logo}
// //           contentFit="contain"
// //         />
// //         <TouchableOpacity
// //           style={styles.primaryBtn}
// //           onPress={handleUnlock}
// //           disabled={loading}
// //         >
// //           {loading ? (
// //             <ActivityIndicator color="#000" />
// //           ) : (
// //             <Text style={styles.primaryBtnText}>Unlock</Text>
// //           )}
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   return (
// //     <KeyboardAvoidingView
// //       behavior={Platform.OS === "ios" ? "padding" : "height"}
// //       style={{ flex: 1, backgroundColor: "#FFFFFF" }}
// //     >
// //       <StatusBar barStyle="dark-content" />
// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={styles.header}>
// //           <Image
// //             source={require("../assets/images/logo.png")}
// //             style={styles.logo}
// //           />
// //           <Text style={styles.subtitle}>Partner Login</Text>
// //         </View>

// //         {loginMode === "email" && (
// //           <>
// //             <View style={styles.inputContainer}>
// //               <Mail size={20} />
// //               <TextInput
// //                 placeholder="Email Address"
// //                 placeholderTextColor="#666"
// //                 style={styles.input}
// //                 autoCapitalize="none"
// //                 value={email}
// //                 onChangeText={setEmail}
// //                 keyboardAppearance="light"
// //                 selectionColor="#000"
// //               />
// //             </View>

// //             <View style={styles.inputContainer}>
// //               <Lock size={20} />
// //               <TextInput
// //                 placeholder="Password"
// //                 placeholderTextColor="#666"
// //                 style={styles.input}
// //                 secureTextEntry={!showPassword}
// //                 value={password}
// //                 onChangeText={setPassword}
// //                 keyboardAppearance="light"
// //                 selectionColor="#000"
// //               />
// //               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
// //                 {showPassword ? <EyeOff /> : <Eye />}
// //               </TouchableOpacity>
// //             </View>

// //             <TouchableOpacity
// //               style={styles.primaryBtn}
// //               onPress={handleLogin}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#000" />
// //               ) : (
// //                 <Text style={styles.primaryBtnText}>Log In</Text>
// //               )}
// //             </TouchableOpacity>

// //             {/* <Text style={styles.orText}>OR</Text>

// //             <TouchableOpacity
// //               style={styles.primaryBtn}
// //               onPress={() => setLoginMode("mobile")}
// //             >
// //               <Text style={styles.primaryBtnText}>
// //                 Login With Mobile Number
// //               </Text>
// //             </TouchableOpacity> */}
// //           </>
// //         )}

// //         {/* {loginMode === "mobile" && !otpSent && (
// //           <>
// //             <View style={styles.inputContainer}>
// //               <Text style={styles.countryCode}>+91</Text>
// //               <TextInput
// //                 placeholder="Enter 10 digit number"
// //                 keyboardType="phone-pad"
// //                 style={styles.input}
// //                 maxLength={10}
// //                 value={mobile}
// //                 onChangeText={(text) => setMobile(text.replace(/\D/g, ""))}
// //               />
// //             </View>

// //             <TouchableOpacity
// //               style={styles.primaryBtn}
// //               onPress={handleSendOtp}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#000" />
// //               ) : (
// //                 <Text style={styles.primaryBtnText}>Send OTP</Text>
// //               )}
// //             </TouchableOpacity>
// //           </>
// //         )} */}

// //         {/* {loginMode === "mobile" && otpSent && (
// //           <>
// //             <View style={styles.inputContainer}>
// //               <TextInput
// //                 placeholder="Enter OTP"
// //                 keyboardType="number-pad"
// //                 style={styles.input}
// //                 value={otp}
// //                 onChangeText={setOtp}
// //               />
// //             </View>

// //             <TouchableOpacity
// //               style={styles.primaryBtn}
// //               onPress={handleVerifyOtp}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#000" />
// //               ) : (
// //                 <Text style={styles.primaryBtnText}>Verify OTP</Text>
// //               )}
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               onPress={() => {
// //                 if (!isResendDisabled) handleSendOtp();
// //               }}
// //               disabled={isResendDisabled}
// //               style={{ marginTop: 15 }}
// //             >
// //               <Text
// //                 style={{
// //                   textAlign: "center",
// //                   fontWeight: "600",
// //                   color: isResendDisabled ? "#999" : "#000",
// //                 }}
// //               >
// //                 {isResendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
// //               </Text>
// //             </TouchableOpacity>
// //           </>
// //         )} */}

// //         {/* {loginMode === "mobile" && (
// //           <TouchableOpacity
// //             onPress={() => {
// //               setLoginMode("email");
// //               setOtpSent(false);
// //               setMobile("");
// //               setOtp("");
// //             }}
// //             style={styles.backContainer}
// //           >
// //             <Text style={styles.backText}>← Back</Text>
// //           </TouchableOpacity>
// //         )} */}
// //       </ScrollView>

// //       {/* ================= CUSTOM POPUP MODAL ================= */}
// //       <Modal
// //         visible={alertModal.visible}
// //         transparent={true}
// //         animationType="fade"
// //         onRequestClose={() =>
// //           setAlertModal((prev) => ({ ...prev, visible: false }))
// //         }
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.customModalCard}>
// //             <View style={styles.iconCircleRedCenter}>
// //               <Ionicons
// //                 name={alertModal.isBlocked ? "lock-closed" : "alert-circle"}
// //                 size={32}
// //                 color="#ef4444"
// //               />
// //             </View>

// //             <Text style={styles.confirmModalTitleCenter}>
// //               {alertModal.title}
// //             </Text>

// //             <View style={styles.confirmDetailsBox}>
// //               <Text style={styles.confirmWarningText}>
// //                 {alertModal.isBlocked ? "⚠️ " : ""}
// //                 {alertModal.message}
// //               </Text>
// //             </View>

// //             <TouchableOpacity
// //               style={styles.modalDangerBtn}
// //               onPress={() =>
// //                 setAlertModal((prev) => ({ ...prev, visible: false }))
// //               }
// //             >
// //               <Text style={styles.modalDangerBtnText}>OK</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //     </KeyboardAvoidingView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flexGrow: 1,
// //     paddingHorizontal: 25,
// //     justifyContent: "center",
// //   },
// //   unlockContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     backgroundColor: "#FFFFFF",
// //     padding: 25,
// //   },
// //   loaderContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   header: {
// //     alignItems: "center",
// //     marginBottom: 40,
// //   },
// //   logo: {
// //     width: 300,
// //     height: 100,
// //     marginBottom: 10,
// //   },
// //   subtitle: {
// //     fontSize: 15,
// //     color: "#666",
// //   },

// //   inputContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderWidth: 1.5,
// //     borderColor: "#E0E0E0",
// //     borderRadius: 12,
// //     height: 56,
// //     paddingHorizontal: 15,
// //     marginBottom: 15,
// //     gap: 8,
// //     backgroundColor: "#FFFFFF",
// //   },

// //   input: {
// //     flex: 1,
// //     fontSize: 16,
// //     color: "#000000",
// //   },
// //   primaryBtn: {
// //     backgroundColor: "#FFD700",
// //     height: 56,
// //     borderRadius: 12,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     width: "100%",
// //   },
// //   primaryBtnText: {
// //     color: "#000",
// //     fontSize: 17,
// //     fontWeight: "700",
// //   },
// //   orText: {
// //     textAlign: "center",
// //     marginVertical: 15,
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#555",
// //   },
// //   backContainer: {
// //     marginTop: 25,
// //   },
// //   backText: {
// //     fontSize: 16,
// //     fontWeight: "700",
// //     color: "#000",
// //   },
// //   countryCode: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#000",
// //   },

// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     padding: 20,
// //   },

// //   customModalCard: {
// //     width: "88%",
// //     backgroundColor: "#ffffff",
// //     borderRadius: 20,
// //     padding: 20,
// //     alignItems: "center",
// //     elevation: 10,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 8,
// //   },

// //   iconCircleRedCenter: {
// //     width: 54,
// //     height: 54,
// //     borderRadius: 27,
// //     backgroundColor: "#fee2e2",
// //     borderWidth: 1.5,
// //     borderColor: "#fca5a5",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginBottom: 12,
// //   },

// //   confirmModalTitleCenter: {
// //     fontSize: 20,
// //     fontWeight: "800",
// //     color: "#111827",
// //     textAlign: "center",
// //   },

// //   confirmDetailsBox: {
// //     width: "100%",
// //     backgroundColor: "#fef2f2",
// //     borderWidth: 1,
// //     borderColor: "#fca5a5",
// //     borderRadius: 14,
// //     padding: 14,
// //     marginTop: 14,
// //     marginBottom: 18,
// //   },

// //   confirmWarningText: {
// //     fontSize: 13,
// //     color: "#991b1b",
// //     lineHeight: 18,
// //     textAlign: "center",
// //   },

// //   modalDangerBtn: {
// //     width: "100%",
// //     backgroundColor: "#ef4444",
// //     paddingVertical: 12,
// //     borderRadius: 12,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   modalDangerBtnText: {
// //     color: "#ffffff",
// //     fontWeight: "700",
// //     fontSize: 14,
// //   },
// // });















import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerForPushNotificationsAsync } from "./notifications";
import { scheduleDailyDutyReminders } from "../lib/dutyReminders";

// import { supabase } from "../lib/supabase";
import { authApi } from "../lib/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // ✅ ADD THESE (IMPORTANT)
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sessionExists, setSessionExists] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [loginMode, setLoginMode] = useState<"email" | "mobile">("email");

  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    isBlocked?: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    isBlocked: false,
  });

  const showAlert = (
    title: string,
    message: string,
    isBlocked: boolean = false
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      isBlocked,
    });
  };
  // const [mobile, setMobile] = useState("");
  // const [otp, setOtp] = useState("");
  // const [otpSent, setOtpSent] = useState(false);

  // // ✅ NEW STATES FOR TIMER
  // const [timer, setTimer] = useState(60);
  // const [isResendDisabled, setIsResendDisabled] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  // ✅ SAFE TIMER EFFECT (NO TYPESCRIPT ERROR)
  // useEffect(() => {
  //   if (!otpSent) return;

  //   setIsResendDisabled(true);
  //   setTimer(60);

  //   const interval = setInterval(() => {
  //     setTimer((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(interval);
  //         setIsResendDisabled(false);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [otpSent]);

  // useEffect(() => {
  //   const backAction = () => {
  //     if (loginMode === "mobile") {
  //       setLoginMode("email");
  //       setOtpSent(false);
  //       setMobile("");
  //       setOtp("");
  //       setIsResendDisabled(false);
  //       setTimer(60);
  //       return true;
  //     }
  //     return false;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     backAction,
  //   );

  //   return () => backHandler.remove();
  // }, [loginMode]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp(); // closes the app
        return true; // prevent default behavior
      },
    );

    return () => subscription.remove();
  }, []);

  const checkSession = async () => {
  try {
    setCheckingSession(true);

    // -------------------------------------------------------
    // Check whether FastAPI authentication tokens exist
    // -------------------------------------------------------

    const { getAccessToken } = await import("../lib/api");

    const accessToken = await getAccessToken();

    if (!accessToken) {
      setSessionExists(false);
      return;
    }

    // -------------------------------------------------------
    // Validate the token through FastAPI
    // -------------------------------------------------------

    try {
      const currentUser = await authApi.me();

      console.log(
        "✅ Existing backend session:",
        currentUser.id,
        currentUser.email,
      );

      setSessionExists(true);

    } catch (error) {

      console.log(
        "⚠️ Backend session expired or invalid.",
        error,
      );

      // Invalid token → clear local authentication
      const { clearAuthTokens } = await import("../lib/api");

      await clearAuthTokens();

      setSessionExists(false);
    }

  } catch (error) {

    console.error(
      "❌ Session check failed:",
      error,
    );

    setSessionExists(false);

  } finally {

    setCheckingSession(false);
  }
};

  const isAuthenticatingRef = React.useRef(false);

  const verifyDeviceSecurity = async () => {
    if (isAuthenticatingRef.current) return true;
    isAuthenticatingRef.current = true;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return true;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Neatify Staff",
      });

      return result.success;
    } catch {
      return true;
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const handleLogin = async () => {

  if (!email || !password) {
    showAlert(
      "Error",
      "Email and password required",
    );

    return;
  }


  setLoading(true);


  try {

    // =====================================================
    // STEP 1
    // Login THROUGH FastAPI
    // =====================================================

    const authResponse = await authApi.login(
      email,
      password,
    );


    console.log(
      "✅ FastAPI login successful",
    );


    // =====================================================
    // STEP 2
    // Put the tokens into the existing Supabase client
    //
    // This does NOT perform the login again.
    //
    // It allows the existing Partner App code that still
    // depends on supabase.auth.getSession()/getUser() to
    // continue working while we migrate other features
    // to FastAPI.
    // =====================================================

    


    


    // =====================================================
    // STEP 3
    // Get authenticated user
    // =====================================================

    const currentUser =
      await authApi.me();


    console.log(
      "✅ FastAPI current user:",
      currentUser.id,
      currentUser.email,
    );


    // =====================================================
    // STEP 4
    // Biometric verification
    // =====================================================

    const verified =
      await verifyDeviceSecurity();


    if (!verified) {

    try {
      await authApi.logout();
    } catch (error) {
      console.error(
        "❌ Backend logout after biometric failure:",
        error,
      );
    }

    showAlert(
      "Verification Failed",
      "Device authentication failed.",
    );

    return;
  }


    // =====================================================
    // STEP 5
    // Push notification registration
    // =====================================================

    // =====================================================
// PUSH NOTIFICATION REGISTRATION
// =====================================================

const token =
  await registerForPushNotificationsAsync();

console.log(
  "Push Token:",
  token,
);


    // Keep existing push-token functionality for now.
    // =====================================================
// PUSH NOTIFICATION REGISTRATION
// =====================================================




    // =====================================================
    // STEP 6
    // Existing notification scheduling
    // =====================================================

    await scheduleDailyDutyReminders();


    // =====================================================
    // STEP 7
    // Enter Partner App
    // =====================================================

    router.replace("./my-role");


  } catch (err: any) {

    console.error(
      "❌ Backend login error:",
      err,
    );


    showAlert(
      "Login Failed",
      err?.message ||
        "An error occurred during login.",
    );


  } finally {

    setLoading(false);
  }
};
  // const getCleanMobile = () => mobile.replace(/\D/g, "");

  // const checkIfMobileRegistered = async () => {
  //   const cleanedMobile = getCleanMobile();

  //   if (cleanedMobile.length !== 10) {
  //     Alert.alert("Error", "Enter valid 10 digit mobile number");
  //     return false;
  //   }

  //   const formattedPhone = `+91${cleanedMobile}`;

  //   const { data } = await supabase
  //     .from("staff_profile")
  //     .select("phone")
  //     .eq("phone", formattedPhone)
  //     .maybeSingle();

  //   if (!data) {
  //     Alert.alert("Error", "Number not registered yet");
  //     return false;
  //   }

  //   return true;
  // };

  // const handleSendOtp = async () => {
  //   const exists = await checkIfMobileRegistered();
  //   if (!exists) return;

  //   const formattedPhone = `+91${getCleanMobile()}`;

  //   setLoading(true);

  //   const { error } = await supabase.auth.signInWithOtp({
  //     phone: formattedPhone,
  //   });

  //   setLoading(false);

  //   if (error) {
  //     Alert.alert("Error", error.message);
  //   } else {
  //     setOtpSent(true); // triggers timer
  //     setOtp("");
  //     Alert.alert("Success", "OTP sent successfully");
  //   }
  // };

  // const handleVerifyOtp = async () => {
  //   if (!otp) {
  //     Alert.alert("Error", "Enter OTP");
  //     return;
  //   }

  //   const formattedPhone = `+91${getCleanMobile()}`;

  //   setLoading(true);

  //   const { error } = await supabase.auth.verifyOtp({
  //     phone: formattedPhone,
  //     token: otp,
  //     type: "sms",
  //   });

  //   if (error) {
  //     setLoading(false);
  //     Alert.alert("Error", "Invalid OTP");
  //     return;
  //   }


  const handleUnlock = async () => {
  if (loading) return;

  setLoading(true);

  try {

    // -----------------------------------------------------
    // Validate existing backend session
    // -----------------------------------------------------

    const currentUser =
      await authApi.me();

    console.log(
      "✅ Backend session valid:",
      currentUser.id,
      currentUser.email,
    );


    // -----------------------------------------------------
    // Device authentication
    // -----------------------------------------------------

    const verified =
      await verifyDeviceSecurity();


    if (!verified) {

      try {
        await authApi.logout();
      } catch (error) {
        console.error(
          "❌ Backend logout failed:",
          error,
        );
      }

      setSessionExists(false);

      showAlert(
        "Verification Failed",
        "Device authentication failed.",
      );

      return;
    }


    // -----------------------------------------------------
    // Enter Partner App
    // -----------------------------------------------------

    router.replace("./my-role");

  } catch (error) {

    console.error(
      "❌ Backend session validation failed:",
      error,
    );

    const {
      clearAuthTokens,
    } = await import("../lib/api");

    await clearAuthTokens();

    setSessionExists(false);

    showAlert(
      "Session Expired",
      "Please login again.",
    );

  } finally {

    setLoading(false);
  }
};

  if (checkingSession) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (sessionExists && !loading) {
    return (
      <View style={styles.unlockContainer}>
        <StatusBar barStyle="dark-content" />
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleUnlock}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryBtnText}>Unlock</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Partner Login</Text>
        </View>

        {loginMode === "email" && (
          <>
            <View style={styles.inputContainer}>
              <Mail size={20} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#666"
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                keyboardAppearance="light"
                selectionColor="#000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#666"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                keyboardAppearance="light"
                selectionColor="#000"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* <Text style={styles.orText}>OR</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setLoginMode("mobile")}
            >
              <Text style={styles.primaryBtnText}>
                Login With Mobile Number
              </Text>
            </TouchableOpacity> */}
          </>
        )}

        {/* {loginMode === "mobile" && !otpSent && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                placeholder="Enter 10 digit number"
                keyboardType="phone-pad"
                style={styles.input}
                maxLength={10}
                value={mobile}
                onChangeText={(text) => setMobile(text.replace(/\D/g, ""))}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryBtnText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )} */}

        {/* {loginMode === "mobile" && otpSent && (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter OTP"
                keyboardType="number-pad"
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!isResendDisabled) handleSendOtp();
              }}
              disabled={isResendDisabled}
              style={{ marginTop: 15 }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: isResendDisabled ? "#999" : "#000",
                }}
              >
                {isResendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </>
        )} */}

        {/* {loginMode === "mobile" && (
          <TouchableOpacity
            onPress={() => {
              setLoginMode("email");
              setOtpSent(false);
              setMobile("");
              setOtp("");
            }}
            style={styles.backContainer}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )} */}
      </ScrollView>

      {/* ================= CUSTOM POPUP MODAL ================= */}
      <Modal
        visible={alertModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setAlertModal((prev) => ({ ...prev, visible: false }))
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalCard}>
            <View style={styles.iconCircleRedCenter}>
              <Ionicons
                name={alertModal.isBlocked ? "lock-closed" : "alert-circle"}
                size={32}
                color="#ef4444"
              />
            </View>

            <Text style={styles.confirmModalTitleCenter}>
              {alertModal.title}
            </Text>

            <View style={styles.confirmDetailsBox}>
              <Text style={styles.confirmWarningText}>
                {alertModal.isBlocked ? "⚠️ " : ""}
                {alertModal.message}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalDangerBtn}
              onPress={() =>
                setAlertModal((prev) => ({ ...prev, visible: false }))
              }
            >
              <Text style={styles.modalDangerBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  unlockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 25,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 8,
    backgroundColor: "#FFFFFF",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  primaryBtn: {
    backgroundColor: "#FFD700",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  backContainer: {
    marginTop: 25,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  customModalCard: {
    width: "88%",
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

  confirmDetailsBox: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    marginBottom: 18,
  },

  confirmWarningText: {
    fontSize: 13,
    color: "#991b1b",
    lineHeight: 18,
    textAlign: "center",
  },

  modalDangerBtn: {
    width: "100%",
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
});















