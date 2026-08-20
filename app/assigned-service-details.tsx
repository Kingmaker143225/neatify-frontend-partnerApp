// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system/legacy";
// import { Image } from "expo-image";
// import * as ImageManipulator from "expo-image-manipulator";
// import * as ImagePicker from "expo-image-picker";
// import { router, useLocalSearchParams } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Keyboard,
//   KeyboardAvoidingView,
//   Linking,
//   Modal,
//   Platform,
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

// export default function AssignedServiceDetails() {
//   const params = useLocalSearchParams();
//   const booking = params.booking ? JSON.parse(params.booking as string) : null;
//   const [serviceId, setServiceId] = useState("");

//   const STORAGE_KEY = booking ? `booking_${booking.id}` : "";

//   const [startOtp, setStartOtp] = useState("");
//   const [endOtp, setEndOtp] = useState("");

//   const [startVerified, setStartVerified] = useState(false);
//   const [endVerified, setEndVerified] = useState(false);

//   const [beforeUploads, setBeforeUploads] = useState<Record<string, string>>(
//     {},
//   );

//   const [afterUploads, setAfterUploads] = useState<Record<string, string>>({});

//   const [serviceType, setServiceType] = useState("");

//   const [running, setRunning] = useState(false);
//   const [seconds, setSeconds] = useState(0);
//   const [workStopped, setWorkStopped] = useState(false);

//   const [uploading, setUploading] = useState(false);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

//   const [staffAmount, setStaffAmount] = useState(0);

//   // ================= TIMER CHANGE =================
//   const [workStartedAt, setWorkStartedAt] = useState<string | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const [skipModalVisible, setSkipModalVisible] = useState(false);
//   const [skipType, setSkipType] = useState<"start" | "end" | null>(null);
//   const [selectedReason, setSelectedReason] = useState<string | null>(null);
//   const [startSkipReason, setStartSkipReason] = useState<string | null>(null);
//   const [endSkipReason, setEndSkipReason] = useState<string | null>(null);

//   const [popupVisible, setPopupVisible] = useState(false);
//   const [popupTitle, setPopupTitle] = useState("");
//   const [popupMessage, setPopupMessage] = useState("");
//   const [popupConfirmText, setPopupConfirmText] = useState("OK");
//   const [popupCancelText, setPopupCancelText] = useState<string | null>(null);
//   const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | null>(
//     null,
//   );

//   const bathroomFields = [
//     "bathroom_door",
//     "toilet_bowl",
//     "wall_tiles",
//     "floor_area",
//     "electric_switch_board",
//     "exhaust_fan",
//     "taps_and_fittings",
//   ];

//   const genericFields = [
//     "upload_1",
//     "upload_2",
//     "upload_3",
//     "upload_4",
//     "upload_5",
//     "upload_6",
//   ];

//   const activeFields =
//     serviceType === "BATHROOM" ? bathroomFields : genericFields;

//   const showPopup = ({
//     title,
//     message,
//     confirmText = "OK",
//     cancelText = null,
//     onConfirm,
//   }: {
//     title: string;
//     message: string;
//     confirmText?: string;
//     cancelText?: string | null;
//     onConfirm?: () => void;
//   }) => {
//     setPopupTitle(title);
//     setPopupMessage(message);
//     setPopupConfirmText(confirmText);
//     setPopupCancelText(cancelText);
//     setPopupOnConfirm(() => onConfirm || null);
//     setPopupVisible(true);
//   };
//   // ================= TIMER CHANGE END =================

//   const scrollRef = useRef<ScrollView>(null);
//   const endOtpRef = useRef<View>(null);

//   if (!booking) return null;

//   // 🔊 ADD HERE
//   const playCompletionSound = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         playsInSilentModeIOS: true,
//       });

//       const { sound } = await Audio.Sound.createAsync(
//         require("../assets/images/sounds/success.mp3"), // ✅ fixed path
//       );

//       await sound.playAsync(); // ✅ IMPORTANT
//       console.log("🔊 Sound played");
//     } catch (error) {
//       console.log("❌ Sound error:", error);
//     }
//   };

//   const [startPhotoSkipped, setStartPhotoSkipped] = useState(false);
//   const [endPhotoSkipped, setEndPhotoSkipped] = useState(false);

//   /* ================= RESTORE LOCAL STATE ================= */
//   useEffect(() => {
//     (async () => {
//       const saved = await AsyncStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const d = JSON.parse(saved);
//         setStartOtp(d.startOtp || "");
//         setEndOtp(d.endOtp || "");
//         setStartVerified(d.startVerified || false);
//         setEndVerified(d.endVerified || false);
//         setRunning(d.running || false);
//         setSeconds(d.seconds || 0);
//         setWorkStopped(d.workStopped || false);
//       }

//       // ================= TIMER CHANGE =================
//       const { data: latest } = await supabase
//         .from("bookings")
//         .select(
//           "work_started_at, work_ended_at, start_photo_url, end_photo_url",
//         )
//         .eq("id", booking.id)
//         .single();

//       if (latest?.work_started_at && !latest?.work_ended_at) {
//         setWorkStartedAt(latest.work_started_at);
//         setRunning(true);
//         setWorkStopped(false);

//         setStartVerified(true);
//       } else if (latest?.work_ended_at) {
//         setRunning(false);
//         setWorkStopped(true);
//         setWorkStartedAt(null);

//         setStartVerified(true);
//       }

//       /* ================= ADD HERE ================= */

//       // 🔥 RESTORE START SKIP
//       if (
//         typeof latest?.start_photo_url === "string" &&
//         latest.start_photo_url.startsWith("Skipped:")
//       ) {
//         const reason = latest.start_photo_url.replace("Skipped: ", "");

//         setStartPhotoSkipped(true);
//         setStartSkipReason(reason);
//       }

//       // 🔥 RESTORE END SKIP
//       if (
//         typeof latest?.end_photo_url === "string" &&
//         latest.end_photo_url.startsWith("Skipped:")
//       ) {
//         const reason = latest.end_photo_url.replace("Skipped: ", "");

//         setEndPhotoSkipped(true);
//         setEndSkipReason(reason);
//       }

//       // 🔥 RESTORE START OTP (if work started)
//       if (latest?.work_started_at) {
//         setStartVerified(true);

//         // show masked OTP if not available
//         if (!startOtp) {
//           setStartOtp("******");
//         }

//         const { data: uploadData } = await supabase
//           .from("service_uploads")
//           .select("*")
//           .eq("booking_id", booking.id);

//         if (uploadData) {
//           const beforeObj: Record<string, string> = {};
//           const afterObj: Record<string, string> = {};

//           const { data: uploadData } = await supabase
//             .from("service_uploads")
//             .select("uploads")
//             .eq("booking_id", booking.id)
//             .single();

//           if (uploadData?.uploads) {
//             setBeforeUploads(uploadData.uploads.before || {});
//             setAfterUploads(uploadData.uploads.after || {});
//           }
//         }
//       }
//       // ================= TIMER CHANGE END =================
//     })();
//   }, []);

//   /* ================= SAVE STATE ON EVERY CHANGE ================= */
//   useEffect(() => {
//     AsyncStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({
//         startOtp,
//         endOtp,
//         startVerified,
//         endVerified,
//         beforeUploads,
//         afterUploads,
//         running,
//         seconds,
//         workStopped,
//       }),
//     );
//   }, [
//     startOtp,
//     endOtp,
//     startVerified,
//     endVerified,
//     beforeUploads,
//     afterUploads,
//     running,
//     seconds,
//     workStopped,
//   ]);

//   useEffect(() => {
//     const fetchStaffAmount = async () => {
//       try {
//         // 🔥 GET BOOKING SERVICES FIELD
//         const { data: bookingData, error: bookingError } = await supabase
//           .from("bookings")
//           .select("services")
//           .eq("id", booking.id)
//           .single();

//         if (bookingError || !bookingData) {
//           console.log("Booking fetch error:", bookingError);
//           return;
//         }

//         // 🔥 EXTRACT SERVICE ID
//         const extractedServiceId =
//           bookingData.services?.[0]?.id || bookingData.services?.[0];

//         if (!extractedServiceId) {
//           console.log("No service ID found");
//           return;
//         }

//         setServiceId(extractedServiceId);

//         // 🔥 FETCH SERVICE DETAILS
//         const { data, error } = await supabase
//           .from("services")
//           .select("staff_amount, service_type")
//           .eq("id", extractedServiceId)
//           .single();

//         if (error || !data) {
//           console.log("Service fetch error:", error);
//           return;
//         }

//         const rawAmount = data?.staff_amount ?? 0;

//         const cleanedAmount = Number(String(rawAmount).replace(/[^0-9.]/g, ""));

//         setStaffAmount(cleanedAmount);

//         // 🔥 IMPORTANT
//         setServiceType((data?.service_type || "").toUpperCase());

//         console.log("SERVICE TYPE:", data?.service_type);
//       } catch (err) {
//         console.log("Unexpected error:", err);
//       }
//     };

//     fetchStaffAmount();
//   }, [serviceId]); // ✅ IMPORTANT

//   useEffect(() => {
//     const showSub = Keyboard.addListener("keyboardDidShow", () =>
//       setIsKeyboardVisible(true),
//     );
//     const hideSub = Keyboard.addListener("keyboardDidHide", () =>
//       setIsKeyboardVisible(false),
//     );

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, [serviceId]);
//   useEffect(() => {
//     if (!workStartedAt) return;

//     const updateTimer = () => {
//       const diff = Math.floor(
//         (Date.now() - new Date(workStartedAt).getTime()) / 1000,
//       );
//       setSeconds(diff);
//     };

//     updateTimer();

//     timerRef.current = setInterval(updateTimer, 1000);

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [workStartedAt]);

//   // ================= TIMER CHANGE END =================

//   const formatDuration = (t: number) => {
//     const h = Math.floor(t / 3600);
//     const m = Math.floor((t % 3600) / 60);
//     const s = t % 60;

//     let result = "";

//     if (h > 0) result += `${h} hr `;
//     if (m > 0) result += `${m} min `;
//     if (s > 0) result += `${s} sec`;

//     return result.trim();
//   };

//   const openMaps = (lat: number, lng: number) => {
//     if (!lat || !lng) {
//       showPopup({
//         title: "Location Not Available 📍",
//         message: "Customer location coordinates are missing.",
//       });
//       return;
//     }

//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     Linking.openURL(url);
//   };
//   const openCamera = async () => {
//     const p = await ImagePicker.requestCameraPermissionsAsync();

//     if (!p.granted) {
//       showPopup({
//         title: "Camera Permission Required 📷",
//         message: "Please allow camera access to upload work photos.",
//         confirmText: "Open Settings",
//         cancelText: "Cancel",
//         onConfirm: () => {
//           Linking.openSettings(); // Opens app settings
//         },
//       });

//       return null;
//     }

//     const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });

//     return r.canceled ? null : r.assets[0].uri;
//   };

//   /* ================= IMAGE UPLOAD (NETWORK SAFE) ================= */
//   const uploadImage = async (
//     localUri: string,
//     stage: "before" | "after",
//     category: string,
//   ) => {
//     try {
//       setUploading(true);

//       const { data } = await supabase.auth.getUser();
//       const email = data.user?.email;

//       if (!email) return;

//       // ================= COMPRESS IMAGE =================
//       const compressedImage = await ImageManipulator.manipulateAsync(
//         localUri,
//         [{ resize: { width: 800 } }],
//         {
//           compress: 0.4,
//           format: ImageManipulator.SaveFormat.JPEG,
//         },
//       );

//       const compressedUri = compressedImage.uri;

//       const base64 = await FileSystem.readAsStringAsync(compressedUri, {
//         encoding: "base64",
//       });

//       const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

//       // ================= FILE PATH =================
//       const safeCustomerName = booking.customer_name
//         .replace(/\s+/g, "_")
//         .replace(/[^\w]/g, "");

//       const folderName = `${safeCustomerName}_(${booking.id})`;

//       const filePath = `${email}/${folderName}/${stage}/${category}.jpg`;

//       // ================= UPLOAD =================
//       const { error } = await supabase.storage
//         .from("work_uploads")
//         .upload(filePath, byteArray, {
//           contentType: "image/jpeg",
//           upsert: true,
//         });

//       if (error) throw error;

//       // ================= PUBLIC URL =================
//       const { data: publicData } = supabase.storage
//         .from("work_uploads")
//         .getPublicUrl(filePath);

//       const imageUrl = publicData.publicUrl;

//       // ================= SAVE LOCAL STATE =================
//       if (stage === "before") {
//         setBeforeUploads((prev) => ({
//           ...prev,
//           [category]: localUri,
//         }));
//       } else {
//         setAfterUploads((prev) => ({
//           ...prev,
//           [category]: localUri,
//         }));
//       }

//       // ================= INSERT DATABASE =================
//       // ================= GET EXISTING JSON =================
//       const { data: existingData } = await supabase
//         .from("service_uploads")
//         .select("uploads")
//         .eq("booking_id", booking.id)
//         .single();

//       const existingUploads = existingData?.uploads || {
//         before: {},
//         after: {},
//       };

//       // ================= UPDATE JSON =================
//       existingUploads[stage][category] = imageUrl;

//       // ================= UPSERT =================
//       const { error: dbError } = await supabase.from("service_uploads").upsert(
//         {
//           booking_id: booking.id,
//           customer_name: booking.customer_name,
//           staff_email: email,
//           service_type: serviceType,
//           uploads: existingUploads,
//           updated_at: new Date().toISOString(),
//         },
//         {
//           onConflict: "booking_id",
//         },
//       );

//       if (dbError) throw dbError;

//       if (dbError) throw dbError;
//     } catch (err) {
//       console.log(err);

//       showPopup({
//         title: "Upload Failed ⚠️",
//         message: "Please check your internet connection and try again.",
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const verifyStartOtp = () => {
//     if (startOtp !== booking.startotp) {
//       showPopup({
//         title: "Invalid OTP ❌",
//         message:
//           "The entered Start OTP is incorrect. Please check and try again.",
//       });
//       return;
//     }

//     setStartVerified(true);

//     showPopup({
//       title: "OTP Verified ✅",
//       message: "Start OTP has been successfully verified.",
//     });
//   };

//   const verifyEndOtp = () => {
//     if (endOtp !== booking.endotp) {
//       showPopup({
//         title: "Invalid OTP ❌",
//         message: "The entered End OTP is incorrect.",
//       });
//       return;
//     }

//     setEndVerified(true);

//     showPopup({
//       title: "OTP Verified ✅",
//       message: "End OTP verified successfully.",
//     });
//   };

//   const removeImage = (category: string, stage: "before" | "after") => {
//     if (stage === "before") {
//       setBeforeUploads((prev) => {
//         const updated = { ...prev };
//         delete updated[category];
//         return updated;
//       });
//     } else {
//       setAfterUploads((prev) => {
//         const updated = { ...prev };
//         delete updated[category];
//         return updated;
//       });
//     }
//   };

//   const openSkipModal = (type: "start" | "end") => {
//     setSkipType(type);
//     setSelectedReason(null);
//     setSkipModalVisible(true);
//   };

//   const confirmSkip = async () => {
//     if (!selectedReason || !skipType) return;

//     const reasonText = `Skipped: ${selectedReason}`;

//     if (skipType === "start") {
//       setStartPhotoSkipped(true);
//       setStartSkipReason(selectedReason);

//       await supabase
//         .from("bookings")
//         .update({
//           start_photo_url: reasonText,
//         })
//         .eq("id", booking.id);
//     } else {
//       setEndPhotoSkipped(true);
//       setEndSkipReason(selectedReason);

//       await supabase
//         .from("bookings")
//         .update({
//           end_photo_url: reasonText,
//         })
//         .eq("id", booking.id);
//     }

//     setSkipModalVisible(false);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//       {uploading && (
//         <View style={styles.loaderOverlay}>
//           <ActivityIndicator size="large" color="#FFD700" />
//           <Text style={styles.loaderText}>Uploading image...</Text>
//         </View>
//       )}

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
//             router.canGoBack() ? router.back() : router.replace("/assigned-services")
//           }
//         >
//           <Ionicons name="arrow-back" size={24} />
//         </TouchableOpacity>
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <ScrollView
//           ref={scrollRef}
//           contentContainerStyle={[styles.body, { paddingBottom: 80 }]}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.card}>
//             <Text style={styles.title}>{booking.customer_name}</Text>
//             <Text>Date: {booking.booking_date}</Text>
//             <Text>Time: {booking.booking_time}</Text>
//             <Text>Address: {booking.full_address}</Text>

//             <TouchableOpacity
//               style={styles.callBtn}
//               onPress={() => {
//                 if (!booking.phone_number) {
//                   showPopup({
//                     title: "Number Not Available 📞",
//                     message:
//                       "Customer phone number is not available for this booking.",
//                   });
//                   return;
//                 }

//                 Linking.openURL(`tel:${booking.phone_number}`);
//               }}
//             >
//               <Ionicons name="call" size={18} color="#ffffff" />
//               <Text style={styles.callText}>Call Customer</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.mapBtn}
//               onPress={() => openMaps(booking.latitude, booking.longitude)}
//             >
//               <Text>Location</Text>
//             </TouchableOpacity>

//             <Text style={styles.label}>Start OTP</Text>
//             <TextInput
//               style={[
//                 styles.otpInput,
//                 startVerified && { backgroundColor: "#eee" },
//               ]}
//               value={startOtp}
//               onChangeText={setStartOtp}
//               keyboardType="number-pad"
//               maxLength={6}
//               editable={!startVerified}
//               onFocus={() => {
//                 if (!endVerified) {
//                   setTimeout(() => {
//                     scrollRef.current?.scrollToEnd({
//                       animated: true,
//                     });
//                   }, 300);
//                 }
//               }}
//             />

//             {startVerified && (
//               <View style={styles.verifiedRow}>
//                 <Ionicons name="checkmark-circle" size={16} color="green" />
//                 <Text style={styles.verifiedText}>Verified</Text>
//               </View>
//             )}

//             {!startVerified && (
//               <TouchableOpacity style={styles.btn} onPress={verifyStartOtp}>
//                 <Text style={styles.btnText}>Verify Start OTP</Text>
//               </TouchableOpacity>
//             )}

//             {startVerified && (
//               <>
//                 {activeFields.map((field) => (
//                   <View key={field} style={{ marginTop: 12 }}>
//                     <Text
//                       style={{
//                         fontWeight: "700",
//                         marginBottom: 6,
//                         textTransform: "capitalize",
//                       }}
//                     >
//                       {field.replace(/_/g, " ")}
//                     </Text>

//                     {beforeUploads[field] ? (
//                       <View style={styles.imageWrapper}>
//                         <Image
//                           source={{ uri: beforeUploads[field] }}
//                           style={styles.preview}
//                         />

//                         <TouchableOpacity
//                           style={styles.removeBtn}
//                           onPress={() => removeImage(field, "before")}
//                         >
//                           <Ionicons name="close-circle" size={18} color="red" />
//                         </TouchableOpacity>
//                       </View>
//                     ) : (
//                       <TouchableOpacity
//                         style={styles.uploadBtn}
//                         onPress={async () => {
//                           const uri = await openCamera();

//                           if (uri) {
//                             uploadImage(uri, "before", field);
//                           }
//                         }}
//                       >
//                         <Text>Upload {field.replace(/_/g, " ")}</Text>

//                         <Ionicons name="camera" size={18} />
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 ))}

//                 <TouchableOpacity
//                   onPress={() => openSkipModal("start")}
//                   style={{
//                     marginTop: 8,
//                     paddingVertical: 8,
//                     paddingHorizontal: 12,
//                     borderWidth: 1,
//                     borderColor: "#FFD700",
//                     borderRadius: 6,
//                     alignSelf: "flex-end",
//                     backgroundColor: "#FFD700",
//                   }}
//                 >
//                   <Text style={{ color: "#0e0e0e", fontWeight: "bold" }}>
//                     Skip Photo
//                   </Text>
//                 </TouchableOpacity>
//                 {startSkipReason && (
//                   <Text style={{ color: "red", marginTop: 6 }}>
//                     Skipped: {startSkipReason}
//                   </Text>
//                 )}
//               </>
//             )}

//             {(Object.keys(beforeUploads).length === activeFields.length ||
//               startPhotoSkipped) &&
//               !running &&
//               !workStopped && (
//                 <TouchableOpacity
//                   style={styles.startBtn}
//                   onPress={() => {
//                     showPopup({
//                       title: "You Are Ready To Go 🚀",
//                       message: "Click On START to start work.",
//                       confirmText: "START",
//                       cancelText: "Cancel",
//                       onConfirm: async () => {
//                         const startTime = new Date().toISOString();

//                         await supabase
//                           .from("bookings")
//                           .update({
//                             work_started_at: startTime,
//                           })
//                           .eq("id", booking.id);

//                         // ================= TIMER CHANGE =================
//                         setWorkStartedAt(startTime);
//                         setRunning(true);
//                         // ================= TIMER CHANGE END =================
//                       },
//                     });
//                   }}
//                 >
//                   <Text style={styles.btnText}>Start Work</Text>
//                 </TouchableOpacity>
//               )}

//             {running && (
//               <Text style={styles.timer}>{formatDuration(seconds)}</Text>
//             )}

//             {running && (
//               <TouchableOpacity
//                 style={styles.completeBtn}
//                 onPress={() => {
//                   if (timerRef.current) {
//                     clearInterval(timerRef.current);
//                     timerRef.current = null;
//                   }

//                   const endTime = new Date().toISOString();

//                   showPopup({
//                     title: "Work Completed 🎉",
//                     message: `You have successfully completed the work in ${formatDuration(
//                       seconds,
//                     )}.\n\nTo finalize the service, please upload the end photo and verify with OTP.`,
//                     confirmText: "Proceed",
//                     onConfirm: async () => {
//                       // 🔥 SAVE TO DB
//                       await supabase
//                         .from("bookings")
//                         .update({
//                           work_ended_at: endTime,
//                         })
//                         .eq("id", booking.id);

//                       setRunning(false);
//                       setWorkStopped(true);
//                       setWorkStartedAt(null);
//                     },
//                   });
//                 }}
//               >
//                 <Text>Work Complete</Text>
//               </TouchableOpacity>
//             )}

//             {workStopped && (
//               <Text style={styles.timer}>
//                 Worked Time: {formatDuration(seconds)}
//               </Text>
//             )}

//             {workStopped && (
//               <>
//                 {activeFields.map((field) => (
//                   <View key={field} style={{ marginTop: 12 }}>
//                     <Text
//                       style={{
//                         fontWeight: "700",
//                         marginBottom: 6,
//                         textTransform: "capitalize",
//                       }}
//                     >
//                       {field.replace(/_/g, " ")}
//                     </Text>

//                     {afterUploads[field] ? (
//                       <View style={styles.imageWrapper}>
//                         <Image
//                           source={{ uri: afterUploads[field] }}
//                           style={styles.preview}
//                         />

//                         <TouchableOpacity
//                           style={styles.removeBtn}
//                           onPress={() => removeImage(field, "after")}
//                         >
//                           <Ionicons name="close-circle" size={18} color="red" />
//                         </TouchableOpacity>
//                       </View>
//                     ) : (
//                       <TouchableOpacity
//                         style={styles.uploadBtn}
//                         onPress={async () => {
//                           const uri = await openCamera();

//                           if (uri) {
//                             uploadImage(uri, "after", field);
//                           }
//                         }}
//                       >
//                         <Text>Upload {field.replace(/_/g, " ")}</Text>

//                         <Ionicons name="camera" size={18} />
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 ))}

//                 {/* ✅ ADD SKIP BUTTON RIGHT HERE */}
//                 <TouchableOpacity
//                   onPress={() => openSkipModal("end")}
//                   style={{
//                     marginTop: 8,
//                     paddingVertical: 8,
//                     paddingHorizontal: 12,
//                     borderWidth: 1,
//                     borderColor: "#FFD700",
//                     borderRadius: 6,
//                     alignSelf: "flex-end",
//                     backgroundColor: "#FFD700",
//                   }}
//                 >
//                   <Text style={{ color: "black", fontWeight: "bold" }}>
//                     Skip Photo
//                   </Text>
//                 </TouchableOpacity>
//                 {endSkipReason && (
//                   <Text style={{ color: "red", marginTop: 6 }}>
//                     Skipped: {endSkipReason}
//                   </Text>
//                 )}

//                 {(Object.keys(afterUploads).length === activeFields.length ||
//                   endPhotoSkipped) && (
//                   <>
//                     <View ref={endOtpRef}>
//                       <Text style={styles.label}>End OTP</Text>

//                       <TextInput
//                         style={[
//                           styles.otpInput,
//                           endVerified && {
//                             backgroundColor: "#e5e5e5",
//                             color: "#777",
//                           },
//                         ]}
//                         value={endOtp}
//                         onChangeText={setEndOtp}
//                         keyboardType="number-pad"
//                         maxLength={6}
//                         editable={!endVerified}
//                         onFocus={() => {
//                           if (!endVerified) {
//                             setTimeout(() => {
//                               endOtpRef.current?.measureLayout(
//                                 scrollRef.current as any,
//                                 (x, y) => {
//                                   scrollRef.current?.scrollTo({
//                                     y: y - 120,
//                                     animated: true,
//                                   });
//                                 },
//                                 () => {},
//                               );
//                             }, 250);
//                           }
//                         }}
//                       />
//                     </View>
//                     {endVerified && (
//                       <View style={styles.verifiedRow}>
//                         <Ionicons
//                           name="checkmark-circle"
//                           size={16}
//                           color="green"
//                         />
//                         <Text style={styles.verifiedText}>Verified</Text>
//                       </View>
//                     )}

//                     {!endVerified && (
//                       <TouchableOpacity
//                         style={styles.btn}
//                         onPress={verifyEndOtp}
//                       >
//                         <Text style={styles.btnText}>Verify End OTP</Text>
//                       </TouchableOpacity>
//                     )}
//                   </>
//                 )}
//               </>
//             )}

//             {endVerified &&
//               (Object.keys(afterUploads).length === activeFields.length ||
//                 endPhotoSkipped) && (
//                 <TouchableOpacity
//                   style={styles.serviceDone}
//                   onPress={async () => {
//                     try {
//                       let amount = staffAmount;

//                       // ✅ SAME OLD WORKING UPDATE (DO NOT CHANGE FLOW)
//                       const { error } = await supabase
//                         .from("bookings")
//                         .update({
//                           work_status: "COMPLETED",
//                           worked_duration: formatDuration(seconds),
//                           staff_earned_amount: amount,
//                           work_ended_at: new Date().toISOString(),
//                         })
//                         .eq("id", booking.id);

//                       if (error) {
//                         console.log("❌ SUPABASE ERROR:", error); // 👈 ADD THIS
//                         showPopup({
//                           title: "Error ❌",
//                           message:
//                             error.message || "Failed to complete service",
//                         });
//                         return;
//                       }
//                       const { error: earningsError } = await supabase
//                         .from("staff_earnings")
//                         .insert({
//                           booking_id: booking.id,
//                           staff_email: booking.assigned_staff_email,
//                           Customer_Name: booking.customer_name,
//                           AMOUNT: amount,
//                         });

//                       const { count: completedCount } = await supabase
//                         .from("bookings")
//                         .select("*", { count: "exact", head: true })
//                         .eq(
//                           "assigned_staff_email",
//                           booking.assigned_staff_email,
//                         )
//                         .eq("work_status", "COMPLETED");

//                       await supabase
//                         .from("staff_profile")
//                         .update({
//                           total_completed: completedCount || 0,
//                         })
//                         .eq("email", booking.assigned_staff_email);

//                       if (earningsError) {
//                         console.log("STAFF EARNINGS ERROR:", earningsError);
//                       }
//                       // ✅ NEW POPUP (ONLY CHANGE YOU WANTED)

//                       await playCompletionSound();

//                       showPopup({
//                         title: "Congratulations 🎉",
//                         message: `You have earned ₹${amount}`,
//                         confirmText: "Go to Dashboard",
//                         onConfirm: () => {
//                           router.replace("/dashboard");
//                         },
//                       });
//                     } catch (err) {
//                       showPopup({
//                         title: "Error ⚠️",
//                         message: "Something went wrong. Please try again.",
//                       });
//                     }
//                   }}
//                 >
//                   <Text style={styles.serviceDoneText}>Service Completed</Text>
//                 </TouchableOpacity>
//               )}
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {skipModalVisible && (
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//               Why are you skipping?
//             </Text>

//             {[
//               "Camera not working",
//               "Customer denied permission",
//               "Low light issue",
//             ].map((reason) => (
//               <TouchableOpacity
//                 key={reason}
//                 onPress={() => setSelectedReason(reason)}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingVertical: 8,
//                 }}
//               >
//                 <Ionicons
//                   name={
//                     selectedReason === reason
//                       ? "radio-button-on"
//                       : "radio-button-off"
//                   }
//                   size={18}
//                   color="#000"
//                 />
//                 <Text style={{ marginLeft: 8 }}>{reason}</Text>
//               </TouchableOpacity>
//             ))}

//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginTop: 15,
//               }}
//             >
//               <TouchableOpacity onPress={() => setSkipModalVisible(false)}>
//                 <Text style={{ color: "red" }}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 disabled={!selectedReason}
//                 onPress={confirmSkip}
//               >
//                 <Text
//                   style={{
//                     color: selectedReason ? "green" : "gray",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Confirm
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}

//       <Modal visible={popupVisible} transparent animationType="fade">
//         <View style={styles.popupOverlay}>
//           <View style={styles.popupCard}>
//             <View style={styles.iconCircle}>
//               <Ionicons name="checkmark" size={28} color="#000" />
//             </View>

//             <Text style={styles.popupTitle}>{popupTitle}</Text>
//             <Text style={styles.popupMessage}>{popupMessage}</Text>

//             <View style={styles.buttonRow}>
//               {popupCancelText && (
//                 <TouchableOpacity
//                   style={styles.cancelBtn}
//                   onPress={() => setPopupVisible(false)}
//                 >
//                   <Text style={styles.cancelText}>{popupCancelText}</Text>
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity
//                 style={styles.confirmBtn}
//                 onPress={() => {
//                   setPopupVisible(false);
//                   if (popupOnConfirm) popupOnConfirm();
//                 }}
//               >
//                 <Text style={styles.confirmText}>{popupConfirmText}</Text>
//               </TouchableOpacity>
//             </View>
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
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   logo: { width: 190, height: 64 },
//   body: { padding: 20 },
//   card: { borderWidth: 2, borderRadius: 16, padding: 16 },
//   title: { fontSize: 18, fontWeight: "800" },
//   label: { marginTop: 16, fontWeight: "700" },
//   otpInput: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 },
//   verifiedRow: { flexDirection: "row", gap: 6, marginTop: 6 },
//   verifiedText: { color: "green", fontWeight: "700" },
//   btn: {
//     marginTop: 10,
//     backgroundColor: "#FFD700",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   btnText: { color: "#000000", fontWeight: "700" },
//   imageRow: { flexDirection: "row", gap: 10, marginTop: 10 },
//   preview: { width: 60, height: 60, borderRadius: 8 },
//   uploadBtn: {
//     marginTop: 10,
//     backgroundColor: "#e5e7eb",
//     padding: 12,
//     borderRadius: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   startBtn: {
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   completeBtn: {
//     marginTop: 10,
//     backgroundColor: "#FFD700",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   timer: {
//     marginTop: 14,
//     fontWeight: "900",
//     textAlign: "center",
//     fontSize: 32,
//     color: "#000",
//   },

//   mapBtn: {
//     backgroundColor: "#FFD700",
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   callBtn: {
//     marginTop: 10,
//     backgroundColor: "#000000",
//     padding: 10,
//     borderRadius: 10,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 6,
//   },
//   callText: { fontWeight: "700", color: "#ffffff" },
//   serviceDone: {
//     marginTop: 24,
//     backgroundColor: "#16a34a",
//     padding: 14,
//     borderRadius: 18,
//     alignItems: "center",
//   },
//   serviceDoneText: { color: "#fff", fontWeight: "800" },
//   imageWrapper: { position: "relative" },
//   removeBtn: {
//     position: "absolute",
//     top: -6,
//     right: -6,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//   },
//   loaderOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 100,
//   },
//   loaderText: { marginTop: 10, fontWeight: "700" },

//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   modalContainer: {
//     backgroundColor: "#fff",
//     width: "85%",
//     padding: 20,
//     borderRadius: 12,
//   },

//   popupBox: {
//     width: "85%",
//     backgroundColor: "#FFD700",
//     padding: 25,
//     borderRadius: 25,
//     alignItems: "center",
//     elevation: 20,
//   },

//   popupCancel: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     marginRight: 10,
//   },

//   popupConfirm: {
//     backgroundColor: "#000",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },

//   popupOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   popupCard: {
//     width: "85%",
//     backgroundColor: "#ded8b9",
//     borderRadius: 18,
//     paddingVertical: 25,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     elevation: 10,
//   },

//   iconCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },

//   popupTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#000",
//     textAlign: "center",
//   },

//   popupMessage: {
//     fontSize: 14,
//     color: "#333",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 20,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 20,
//   },

//   cancelBtn: {
//     marginRight: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },

//   cancelText: {
//     color: "#000",
//     fontWeight: "600",
//   },

//   confirmBtn: {
//     backgroundColor: "#000",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },

//   confirmText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });























// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system/legacy";
// import { Image } from "expo-image";
// import * as ImageManipulator from "expo-image-manipulator";
// import * as ImagePicker from "expo-image-picker";
// import { router, useLocalSearchParams } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Keyboard,
//   KeyboardAvoidingView,
//   Linking,
//   Modal,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { partnerApi } from "../lib/api";

// export default function AssignedServiceDetails() {
//   const params = useLocalSearchParams();
//   const booking = params.booking ? JSON.parse(params.booking as string) : null;
//   const [serviceId, setServiceId] = useState("");

//   const STORAGE_KEY = booking ? `booking_${booking.id}` : "";

//   const [startOtp, setStartOtp] = useState("");
//   const [endOtp, setEndOtp] = useState("");

//   const [startVerified, setStartVerified] = useState(false);
//   const [endVerified, setEndVerified] = useState(false);

//   const [beforeUploads, setBeforeUploads] = useState<Record<string, string>>(
//     {},
//   );

//   const [afterUploads, setAfterUploads] = useState<Record<string, string>>({});

//   const [serviceType, setServiceType] = useState("");

//   const [running, setRunning] = useState(false);
//   const [seconds, setSeconds] = useState(0);
//   const [workStopped, setWorkStopped] = useState(false);

//   const [uploading, setUploading] = useState(false);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

//   const [staffAmount, setStaffAmount] = useState(0);

//   // ================= TIMER CHANGE =================
//   const [workStartedAt, setWorkStartedAt] = useState<string | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const [skipModalVisible, setSkipModalVisible] = useState(false);
//   const [skipType, setSkipType] = useState<"start" | "end" | null>(null);
//   const [selectedReason, setSelectedReason] = useState<string | null>(null);
//   const [startSkipReason, setStartSkipReason] = useState<string | null>(null);
//   const [endSkipReason, setEndSkipReason] = useState<string | null>(null);

//   const [popupVisible, setPopupVisible] = useState(false);
//   const [popupTitle, setPopupTitle] = useState("");
//   const [popupMessage, setPopupMessage] = useState("");
//   const [popupConfirmText, setPopupConfirmText] = useState("OK");
//   const [popupCancelText, setPopupCancelText] = useState<string | null>(null);
//   const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | null>(
//     null,
//   );

//   const bathroomFields = [
//     "bathroom_door",
//     "toilet_bowl",
//     "wall_tiles",
//     "floor_area",
//     "electric_switch_board",
//     "exhaust_fan",
//     "taps_and_fittings",
//   ];

//   const genericFields = [
//     "upload_1",
//     "upload_2",
//     "upload_3",
//     "upload_4",
//     "upload_5",
//     "upload_6",
//   ];

//   const activeFields =
//     serviceType === "BATHROOM" ? bathroomFields : genericFields;

//   const showPopup = ({
//     title,
//     message,
//     confirmText = "OK",
//     cancelText = null,
//     onConfirm,
//   }: {
//     title: string;
//     message: string;
//     confirmText?: string;
//     cancelText?: string | null;
//     onConfirm?: () => void;
//   }) => {
//     setPopupTitle(title);
//     setPopupMessage(message);
//     setPopupConfirmText(confirmText);
//     setPopupCancelText(cancelText);
//     setPopupOnConfirm(() => onConfirm || null);
//     setPopupVisible(true);
//   };
//   // ================= TIMER CHANGE END =================

//   const scrollRef = useRef<ScrollView>(null);
//   const endOtpRef = useRef<View>(null);

//   if (!booking) return null;

//   // 🔊 ADD HERE
//   const playCompletionSound = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         playsInSilentModeIOS: true,
//       });

//       const { sound } = await Audio.Sound.createAsync(
//         require("../assets/images/sounds/success.mp3"),
//       );

//       await sound.playAsync();
//       console.log("🔊 Sound played");
//     } catch (error) {
//       console.log("❌ Sound error:", error);
//     }
//   };

//   const [startPhotoSkipped, setStartPhotoSkipped] = useState(false);
//   const [endPhotoSkipped, setEndPhotoSkipped] = useState(false);

//   /* ================= RESTORE LOCAL STATE ================= */
//   useEffect(() => {
//     (async () => {
//       const saved = await AsyncStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const d = JSON.parse(saved);
//         setStartOtp(d.startOtp || "");
//         setEndOtp(d.endOtp || "");
//         setStartVerified(d.startVerified || false);
//         setEndVerified(d.endVerified || false);
//         setRunning(d.running || false);
//         setSeconds(d.seconds || 0);
//         setWorkStopped(d.workStopped || false);
//       }

//       try {
//         // Get booking details from FastAPI
//         const response = await partnerApi.getBookingDetails(booking.id);
//         const latest = response?.data;

//         if (!latest) {
//           console.log("Booking details not found");
//           return;
//         }

//         if (latest?.work_started_at && !latest?.work_ended_at) {
//           setWorkStartedAt(latest.work_started_at);
//           setRunning(true);
//           setWorkStopped(false);
//           setStartVerified(true);
//         } else if (latest?.work_ended_at) {
//           setRunning(false);
//           setWorkStopped(true);
//           setWorkStartedAt(null);
//           setStartVerified(true);
//         }

//         // RESTORE START SKIP
//         if (
//           typeof latest?.start_photo_url === "string" &&
//           latest.start_photo_url.startsWith("Skipped:")
//         ) {
//           const reason = latest.start_photo_url.replace("Skipped: ", "");
//           setStartPhotoSkipped(true);
//           setStartSkipReason(reason);
//         }

//         // RESTORE END SKIP
//         if (
//           typeof latest?.end_photo_url === "string" &&
//           latest.end_photo_url.startsWith("Skipped:")
//         ) {
//           const reason = latest.end_photo_url.replace("Skipped: ", "");
//           setEndPhotoSkipped(true);
//           setEndSkipReason(reason);
//         }

//         // RESTORE START OTP (if work started)
//         if (latest?.work_started_at) {
//           setStartVerified(true);

//           if (!startOtp) {
//             setStartOtp("******");
//           }

//           // Get service uploads from FastAPI response
//           const uploads = latest?.service_uploads;

//           if (uploads) {
//             setBeforeUploads(uploads.before || {});
//             setAfterUploads(uploads.after || {});
//           }
//         }
//       } catch (error) {
//         console.log("Failed to load booking details:", error);
//       }
//     })();
//   }, []);

//   /* ================= SAVE STATE ON EVERY CHANGE ================= */
//   useEffect(() => {
//     AsyncStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({
//         startOtp,
//         endOtp,
//         startVerified,
//         endVerified,
//         beforeUploads,
//         afterUploads,
//         running,
//         seconds,
//         workStopped,
//       }),
//     );
//   }, [
//     startOtp,
//     endOtp,
//     startVerified,
//     endVerified,
//     beforeUploads,
//     afterUploads,
//     running,
//     seconds,
//     workStopped,
//   ]);

//   /* ================= LOAD BOOKING DETAILS ================= */
//   useEffect(() => {
//     const loadBookingDetails = async () => {
//       try {
//         const response = await partnerApi.getBookingDetails(booking.id);
//         const data = response?.data;

//         if (!data) {
//           console.log("Booking details not found");
//           return;
//         }

//         const service = Array.isArray(data.services)
//           ? data.services[0]
//           : null;

//         if (!service) {
//           console.log("No service found");
//           return;
//         }

//         const extractedServiceId = service.id;

//         if (extractedServiceId) {
//           setServiceId(extractedServiceId);
//         }

//         const rawAmount = service.staff_amount ?? 0;

//         const cleanedAmount = Number(
//           String(rawAmount).replace(/[^0-9.]/g, ""),
//         );

//         setStaffAmount(cleanedAmount);

//         setServiceType(
//           String(service.service_type || "").toUpperCase(),
//         );

//         console.log("SERVICE TYPE:", service.service_type);
//         console.log("STAFF AMOUNT:", cleanedAmount);
//       } catch (error) {
//         console.log("Failed to load booking details:", error);
//       }
//     };

//     loadBookingDetails();
//   }, [booking.id]);

//   useEffect(() => {
//     const showSub = Keyboard.addListener("keyboardDidShow", () =>
//       setIsKeyboardVisible(true),
//     );
//     const hideSub = Keyboard.addListener("keyboardDidHide", () =>
//       setIsKeyboardVisible(false),
//     );

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, [serviceId]);

//   useEffect(() => {
//     if (!workStartedAt) return;

//     const updateTimer = () => {
//       const diff = Math.floor(
//         (Date.now() - new Date(workStartedAt).getTime()) / 1000,
//       );
//       setSeconds(diff);
//     };

//     updateTimer();

//     timerRef.current = setInterval(updateTimer, 1000);

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [workStartedAt]);

//   // ================= TIMER CHANGE END =================

//   const formatDuration = (t: number) => {
//     const h = Math.floor(t / 3600);
//     const m = Math.floor((t % 3600) / 60);
//     const s = t % 60;

//     let result = "";

//     if (h > 0) result += `${h} hr `;
//     if (m > 0) result += `${m} min `;
//     if (s > 0) result += `${s} sec`;

//     return result.trim();
//   };

//   const openMaps = (lat: number, lng: number) => {
//     if (!lat || !lng) {
//       showPopup({
//         title: "Location Not Available 📍",
//         message: "Customer location coordinates are missing.",
//       });
//       return;
//     }

//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     Linking.openURL(url);
//   };

//   const openCamera = async () => {
//     const p = await ImagePicker.requestCameraPermissionsAsync();

//     if (!p.granted) {
//       showPopup({
//         title: "Camera Permission Required 📷",
//         message: "Please allow camera access to upload work photos.",
//         confirmText: "Open Settings",
//         cancelText: "Cancel",
//         onConfirm: () => {
//           Linking.openSettings();
//         },
//       });

//       return null;
//     }

//     const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });

//     return r.canceled ? null : r.assets[0].uri;
//   };

//   /* ================= IMAGE UPLOAD (VIA FASTAPI) ================= */
//   const uploadImage = async (
//     localUri: string,
//     stage: "before" | "after",
//     category: string,
//   ) => {
//     try {
//       setUploading(true);

//       // ==========================================
//       // COMPRESS IMAGE
//       // ==========================================

//       const compressedImage = await ImageManipulator.manipulateAsync(
//         localUri,
//         [{ resize: { width: 800 } }],
//         {
//           compress: 0.4,
//           format: ImageManipulator.SaveFormat.JPEG,
//         },
//       );

//       // ==========================================
//       // CONVERT TO FORM DATA
//       // ==========================================

//       const formData = new FormData();

//       formData.append("stage", stage);
//       formData.append("category", category);

//       formData.append(
//         "file",
//         {
//           uri: compressedImage.uri,
//           name: `${category}.jpg`,
//           type: "image/jpeg",
//         } as any,
//       );

//       // ==========================================
//       // SEND TO FASTAPI
//       // ==========================================

//       const response = await partnerApi.uploadBookingPhoto(
//         booking.id,
//         formData,
//       );

//       if (!response?.success) {
//         throw new Error(
//           response?.message || "Photo upload failed.",
//         );
//       }

//       // ==========================================
//       // LOCAL UI STATE
//       // ==========================================

//       if (stage === "before") {
//         setBeforeUploads((prev) => ({
//           ...prev,
//           [category]: localUri,
//         }));
//       } else {
//         setAfterUploads((prev) => ({
//           ...prev,
//           [category]: localUri,
//         }));
//       }

//       console.log("Photo uploaded successfully:", stage, category);
//     } catch (error: any) {
//       console.log("Photo upload error:", error);

//       showPopup({
//         title: "Upload Failed ⚠️",
//         message:
//           error?.message ||
//           "Please check your internet connection and try again.",
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   /* ================= VERIFY START OTP ================= */
//   const verifyStartOtp = () => {
//     if (!startOtp || startOtp.length !== 6) {
//       showPopup({
//         title: "Invalid OTP ❌",
//         message: "Please enter the 6-digit Start OTP.",
//       });
//       return;
//     }

//     setStartVerified(true);

//     showPopup({
//       title: "OTP Entered ✅",
//       message: "Start OTP is ready. You can continue to the photo and work steps.",
//     });
//   };

//   /* ================= VERIFY END OTP ================= */
//   const verifyEndOtp = () => {
//     if (!endOtp || endOtp.length !== 6) {
//       showPopup({
//         title: "Invalid OTP ❌",
//         message: "Please enter the 6-digit End OTP.",
//       });
//       return;
//     }

//     setEndVerified(true);

//     showPopup({
//       title: "OTP Entered ✅",
//       message: "End OTP is ready. You can complete the service.",
//     });
//   };

//   const removeImage = (category: string, stage: "before" | "after") => {
//     if (stage === "before") {
//       setBeforeUploads((prev) => {
//         const updated = { ...prev };
//         delete updated[category];
//         return updated;
//       });
//     } else {
//       setAfterUploads((prev) => {
//         const updated = { ...prev };
//         delete updated[category];
//         return updated;
//       });
//     }
//   };

//   const openSkipModal = (type: "start" | "end") => {
//     setSkipType(type);
//     setSelectedReason(null);
//     setSkipModalVisible(true);
//   };

//   /* ================= CONFIRM SKIP ================= */
//   const confirmSkip = async () => {
//     if (!selectedReason || !skipType) {
//       return;
//     }

//     try {
//       const stage = skipType === "start" ? "before" : "after";

//       const response = await partnerApi.skipPhoto(
//         booking.id,
//         stage,
//         selectedReason,
//       );

//       if (!response?.success) {
//         throw new Error(
//           response?.message || "Failed to save skip reason.",
//         );
//       }

//       if (skipType === "start") {
//         setStartPhotoSkipped(true);
//         setStartSkipReason(selectedReason);
//       } else {
//         setEndPhotoSkipped(true);
//         setEndSkipReason(selectedReason);
//       }

//       setSkipModalVisible(false);
//     } catch (error: any) {
//       showPopup({
//         title: "Unable to Skip Photo ❌",
//         message:
//           error?.message ||
//           "Failed to save skip reason.",
//       });
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//       {uploading && (
//         <View style={styles.loaderOverlay}>
//           <ActivityIndicator size="large" color="#FFD700" />
//           <Text style={styles.loaderText}>Uploading image...</Text>
//         </View>
//       )}

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
//             router.canGoBack() ? router.back() : router.replace("/assigned-services")
//           }
//         >
//           <Ionicons name="arrow-back" size={24} />
//         </TouchableOpacity>
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <ScrollView
//           ref={scrollRef}
//           contentContainerStyle={[styles.body, { paddingBottom: 80 }]}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.card}>
//             <Text style={styles.title}>{booking.customer_name}</Text>
//             <Text>Date: {booking.booking_date}</Text>
//             <Text>Time: {booking.booking_time}</Text>
//             <Text>Address: {booking.full_address}</Text>

//             <TouchableOpacity
//               style={styles.callBtn}
//               onPress={() => {
//                 if (!booking.phone_number) {
//                   showPopup({
//                     title: "Number Not Available 📞",
//                     message:
//                       "Customer phone number is not available for this booking.",
//                   });
//                   return;
//                 }

//                 Linking.openURL(`tel:${booking.phone_number}`);
//               }}
//             >
//               <Ionicons name="call" size={18} color="#ffffff" />
//               <Text style={styles.callText}>Call Customer</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.mapBtn}
//               onPress={() => openMaps(booking.latitude, booking.longitude)}
//             >
//               <Text>Location</Text>
//             </TouchableOpacity>

//             <Text style={styles.label}>Start OTP</Text>
//             <TextInput
//               style={[
//                 styles.otpInput,
//                 startVerified && { backgroundColor: "#eee" },
//               ]}
//               value={startOtp}
//               onChangeText={setStartOtp}
//               keyboardType="number-pad"
//               maxLength={6}
//               editable={!startVerified}
//               onFocus={() => {
//                 if (!endVerified) {
//                   setTimeout(() => {
//                     scrollRef.current?.scrollToEnd({
//                       animated: true,
//                     });
//                   }, 300);
//                 }
//               }}
//             />

//             {startVerified && (
//               <View style={styles.verifiedRow}>
//                 <Ionicons name="checkmark-circle" size={16} color="green" />
//                 <Text style={styles.verifiedText}>Verified</Text>
//               </View>
//             )}

//             {!startVerified && (
//               <TouchableOpacity style={styles.btn} onPress={verifyStartOtp}>
//                 <Text style={styles.btnText}>Verify Start OTP</Text>
//               </TouchableOpacity>
//             )}

//             {startVerified && (
//               <>
//                 {activeFields.map((field) => (
//                   <View key={field} style={{ marginTop: 12 }}>
//                     <Text
//                       style={{
//                         fontWeight: "700",
//                         marginBottom: 6,
//                         textTransform: "capitalize",
//                       }}
//                     >
//                       {field.replace(/_/g, " ")}
//                     </Text>

//                     {beforeUploads[field] ? (
//                       <View style={styles.imageWrapper}>
//                         <Image
//                           source={{ uri: beforeUploads[field] }}
//                           style={styles.preview}
//                         />

//                         <TouchableOpacity
//                           style={styles.removeBtn}
//                           onPress={() => removeImage(field, "before")}
//                         >
//                           <Ionicons name="close-circle" size={18} color="red" />
//                         </TouchableOpacity>
//                       </View>
//                     ) : (
//                       <TouchableOpacity
//                         style={styles.uploadBtn}
//                         onPress={async () => {
//                           const uri = await openCamera();

//                           if (uri) {
//                             uploadImage(uri, "before", field);
//                           }
//                         }}
//                       >
//                         <Text>Upload {field.replace(/_/g, " ")}</Text>

//                         <Ionicons name="camera" size={18} />
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 ))}

//                 <TouchableOpacity
//                   onPress={() => openSkipModal("start")}
//                   style={{
//                     marginTop: 8,
//                     paddingVertical: 8,
//                     paddingHorizontal: 12,
//                     borderWidth: 1,
//                     borderColor: "#FFD700",
//                     borderRadius: 6,
//                     alignSelf: "flex-end",
//                     backgroundColor: "#FFD700",
//                   }}
//                 >
//                   <Text style={{ color: "#0e0e0e", fontWeight: "bold" }}>
//                     Skip Photo
//                   </Text>
//                 </TouchableOpacity>
//                 {startSkipReason && (
//                   <Text style={{ color: "red", marginTop: 6 }}>
//                     Skipped: {startSkipReason}
//                   </Text>
//                 )}
//               </>
//             )}

//             {(Object.keys(beforeUploads).length === activeFields.length ||
//               startPhotoSkipped) &&
//               !running &&
//               !workStopped && (
//                 <TouchableOpacity
//                   style={styles.startBtn}
//                   onPress={() => {
//                     showPopup({
//                       title: "You Are Ready To Go 🚀",
//                       message: "Click On START to start work.",
//                       confirmText: "START",
//                       cancelText: "Cancel",
//                       onConfirm: async () => {
//                         try {
//                           const response = await partnerApi.startWork(
//                             booking.id,
//                             startOtp,
//                           );

//                           if (!response?.success) {
//                             throw new Error(
//                               response?.message || "Failed to start work.",
//                             );
//                           }

//                           const startTime =
//                             response.work_started_at ||
//                             new Date().toISOString();

//                           setWorkStartedAt(startTime);
//                           setRunning(true);
//                           setWorkStopped(false);
//                         } catch (error: any) {
//                           showPopup({
//                             title: "Unable to Start Work ❌",
//                             message:
//                               error?.message ||
//                               "Failed to start work.",
//                           });
//                         }
//                       },
//                     });
//                   }}
//                 >
//                   <Text style={styles.btnText}>Start Work</Text>
//                 </TouchableOpacity>
//               )}

//             {running && (
//               <Text style={styles.timer}>{formatDuration(seconds)}</Text>
//             )}

//             {running && (
//               <TouchableOpacity
//                 style={styles.completeBtn}
//                 onPress={() => {
//                   if (timerRef.current) {
//                     clearInterval(timerRef.current);
//                     timerRef.current = null;
//                   }

//                   showPopup({
//                     title: "Work Completed 🎉",
//                     message: `You have successfully completed the work in ${formatDuration(
//                       seconds,
//                     )}.\n\nTo finalize the service, please upload the end photo and verify with OTP.`,
//                     confirmText: "Proceed",
//                     onConfirm: async () => {
//                       setRunning(false);
//                       setWorkStopped(true);
//                       setWorkStartedAt(null);
//                     },
//                   });
//                 }}
//               >
//                 <Text>Work Complete</Text>
//               </TouchableOpacity>
//             )}

//             {workStopped && (
//               <Text style={styles.timer}>
//                 Worked Time: {formatDuration(seconds)}
//               </Text>
//             )}

//             {workStopped && (
//               <>
//                 {activeFields.map((field) => (
//                   <View key={field} style={{ marginTop: 12 }}>
//                     <Text
//                       style={{
//                         fontWeight: "700",
//                         marginBottom: 6,
//                         textTransform: "capitalize",
//                       }}
//                     >
//                       {field.replace(/_/g, " ")}
//                     </Text>

//                     {afterUploads[field] ? (
//                       <View style={styles.imageWrapper}>
//                         <Image
//                           source={{ uri: afterUploads[field] }}
//                           style={styles.preview}
//                         />

//                         <TouchableOpacity
//                           style={styles.removeBtn}
//                           onPress={() => removeImage(field, "after")}
//                         >
//                           <Ionicons name="close-circle" size={18} color="red" />
//                         </TouchableOpacity>
//                       </View>
//                     ) : (
//                       <TouchableOpacity
//                         style={styles.uploadBtn}
//                         onPress={async () => {
//                           const uri = await openCamera();

//                           if (uri) {
//                             uploadImage(uri, "after", field);
//                           }
//                         }}
//                       >
//                         <Text>Upload {field.replace(/_/g, " ")}</Text>

//                         <Ionicons name="camera" size={18} />
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 ))}

//                 <TouchableOpacity
//                   onPress={() => openSkipModal("end")}
//                   style={{
//                     marginTop: 8,
//                     paddingVertical: 8,
//                     paddingHorizontal: 12,
//                     borderWidth: 1,
//                     borderColor: "#FFD700",
//                     borderRadius: 6,
//                     alignSelf: "flex-end",
//                     backgroundColor: "#FFD700",
//                   }}
//                 >
//                   <Text style={{ color: "black", fontWeight: "bold" }}>
//                     Skip Photo
//                   </Text>
//                 </TouchableOpacity>
//                 {endSkipReason && (
//                   <Text style={{ color: "red", marginTop: 6 }}>
//                     Skipped: {endSkipReason}
//                   </Text>
//                 )}

//                 {(Object.keys(afterUploads).length === activeFields.length ||
//                   endPhotoSkipped) && (
//                   <>
//                     <View ref={endOtpRef}>
//                       <Text style={styles.label}>End OTP</Text>

//                       <TextInput
//                         style={[
//                           styles.otpInput,
//                           endVerified && {
//                             backgroundColor: "#e5e5e5",
//                             color: "#777",
//                           },
//                         ]}
//                         value={endOtp}
//                         onChangeText={setEndOtp}
//                         keyboardType="number-pad"
//                         maxLength={6}
//                         editable={!endVerified}
//                         onFocus={() => {
//                           if (!endVerified) {
//                             setTimeout(() => {
//                               endOtpRef.current?.measureLayout(
//                                 scrollRef.current as any,
//                                 (x, y) => {
//                                   scrollRef.current?.scrollTo({
//                                     y: y - 120,
//                                     animated: true,
//                                   });
//                                 },
//                                 () => {},
//                               );
//                             }, 250);
//                           }
//                         }}
//                       />
//                     </View>
//                     {endVerified && (
//                       <View style={styles.verifiedRow}>
//                         <Ionicons
//                           name="checkmark-circle"
//                           size={16}
//                           color="green"
//                         />
//                         <Text style={styles.verifiedText}>Verified</Text>
//                       </View>
//                     )}

//                     {!endVerified && (
//                       <TouchableOpacity
//                         style={styles.btn}
//                         onPress={verifyEndOtp}
//                       >
//                         <Text style={styles.btnText}>Verify End OTP</Text>
//                       </TouchableOpacity>
//                     )}
//                   </>
//                 )}
//               </>
//             )}

//             {endVerified &&
//               (Object.keys(afterUploads).length === activeFields.length ||
//                 endPhotoSkipped) && (
//                 <TouchableOpacity
//                   style={styles.serviceDone}
//                   onPress={async () => {
//                     try {
//                       const amount = staffAmount;

//                       const response = await partnerApi.completeWork(
//                         booking.id,
//                         endOtp,
//                         formatDuration(seconds),
//                         amount,
//                       );

//                       if (!response?.success) {
//                         throw new Error(
//                           response?.message ||
//                             "Failed to complete service.",
//                         );
//                       }

//                       await playCompletionSound();

//                       showPopup({
//                         title: "Congratulations 🎉",
//                         message: `You have earned ₹${amount}`,
//                         confirmText: "Go to Dashboard",
//                         onConfirm: () => {
//                           router.replace("/dashboard");
//                         },
//                       });
//                     } catch (error: any) {
//                       console.log("Complete service error:", error);

//                       showPopup({
//                         title: "Error ⚠️",
//                         message:
//                           error?.message ||
//                           "Something went wrong. Please try again.",
//                       });
//                     }
//                   }}
//                 >
//                   <Text style={styles.serviceDoneText}>Service Completed</Text>
//                 </TouchableOpacity>
//               )}
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {skipModalVisible && (
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//               Why are you skipping?
//             </Text>

//             {[
//               "Camera not working",
//               "Customer denied permission",
//               "Low light issue",
//             ].map((reason) => (
//               <TouchableOpacity
//                 key={reason}
//                 onPress={() => setSelectedReason(reason)}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingVertical: 8,
//                 }}
//               >
//                 <Ionicons
//                   name={
//                     selectedReason === reason
//                       ? "radio-button-on"
//                       : "radio-button-off"
//                   }
//                   size={18}
//                   color="#000"
//                 />
//                 <Text style={{ marginLeft: 8 }}>{reason}</Text>
//               </TouchableOpacity>
//             ))}

//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginTop: 15,
//               }}
//             >
//               <TouchableOpacity onPress={() => setSkipModalVisible(false)}>
//                 <Text style={{ color: "red" }}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 disabled={!selectedReason}
//                 onPress={confirmSkip}
//               >
//                 <Text
//                   style={{
//                     color: selectedReason ? "green" : "gray",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Confirm
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}

//       <Modal visible={popupVisible} transparent animationType="fade">
//         <View style={styles.popupOverlay}>
//           <View style={styles.popupCard}>
//             <View style={styles.iconCircle}>
//               <Ionicons name="checkmark" size={28} color="#000" />
//             </View>

//             <Text style={styles.popupTitle}>{popupTitle}</Text>
//             <Text style={styles.popupMessage}>{popupMessage}</Text>

//             <View style={styles.buttonRow}>
//               {popupCancelText && (
//                 <TouchableOpacity
//                   style={styles.cancelBtn}
//                   onPress={() => setPopupVisible(false)}
//                 >
//                   <Text style={styles.cancelText}>{popupCancelText}</Text>
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity
//                 style={styles.confirmBtn}
//                 onPress={() => {
//                   setPopupVisible(false);
//                   if (popupOnConfirm) popupOnConfirm();
//                 }}
//               >
//                 <Text style={styles.confirmText}>{popupConfirmText}</Text>
//               </TouchableOpacity>
//             </View>
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
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   logo: { width: 190, height: 64 },
//   body: { padding: 20 },
//   card: { borderWidth: 2, borderRadius: 16, padding: 16 },
//   title: { fontSize: 18, fontWeight: "800" },
//   label: { marginTop: 16, fontWeight: "700" },
//   otpInput: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 },
//   verifiedRow: { flexDirection: "row", gap: 6, marginTop: 6 },
//   verifiedText: { color: "green", fontWeight: "700" },
//   btn: {
//     marginTop: 10,
//     backgroundColor: "#FFD700",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   btnText: { color: "#000000", fontWeight: "700" },
//   imageRow: { flexDirection: "row", gap: 10, marginTop: 10 },
//   preview: { width: 60, height: 60, borderRadius: 8 },
//   uploadBtn: {
//     marginTop: 10,
//     backgroundColor: "#e5e7eb",
//     padding: 12,
//     borderRadius: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   startBtn: {
//     marginTop: 14,
//     backgroundColor: "#FFD700",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   completeBtn: {
//     marginTop: 10,
//     backgroundColor: "#FFD700",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   timer: {
//     marginTop: 14,
//     fontWeight: "900",
//     textAlign: "center",
//     fontSize: 32,
//     color: "#000",
//   },

//   mapBtn: {
//     backgroundColor: "#FFD700",
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   callBtn: {
//     marginTop: 10,
//     backgroundColor: "#000000",
//     padding: 10,
//     borderRadius: 10,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 6,
//   },
//   callText: { fontWeight: "700", color: "#ffffff" },
//   serviceDone: {
//     marginTop: 24,
//     backgroundColor: "#16a34a",
//     padding: 14,
//     borderRadius: 18,
//     alignItems: "center",
//   },
//   serviceDoneText: { color: "#fff", fontWeight: "800" },
//   imageWrapper: { position: "relative" },
//   removeBtn: {
//     position: "absolute",
//     top: -6,
//     right: -6,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//   },
//   loaderOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 100,
//   },
//   loaderText: { marginTop: 10, fontWeight: "700" },

//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   modalContainer: {
//     backgroundColor: "#fff",
//     width: "85%",
//     padding: 20,
//     borderRadius: 12,
//   },

//   popupBox: {
//     width: "85%",
//     backgroundColor: "#FFD700",
//     padding: 25,
//     borderRadius: 25,
//     alignItems: "center",
//     elevation: 20,
//   },

//   popupCancel: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     marginRight: 10,
//   },

//   popupConfirm: {
//     backgroundColor: "#000",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },

//   popupOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   popupCard: {
//     width: "85%",
//     backgroundColor: "#ded8b9",
//     borderRadius: 18,
//     paddingVertical: 25,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     elevation: 10,
//   },

//   iconCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },

//   popupTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#000",
//     textAlign: "center",
//   },

//   popupMessage: {
//     fontSize: 14,
//     color: "#333",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 20,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 20,
//   },

//   cancelBtn: {
//     marginRight: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },

//   cancelText: {
//     color: "#000",
//     fontWeight: "600",
//   },

//   confirmBtn: {
//     backgroundColor: "#000",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },

//   confirmText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });























import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { partnerApi } from "../lib/api";

export default function AssignedServiceDetails() {
  const params = useLocalSearchParams();
  
  // Parse booking from params
  let parsedBooking = null;
  try {
    if (params.booking) {
      parsedBooking = JSON.parse(params.booking as string);
      console.log("✅ Booking parsed successfully:", parsedBooking.id);
    }
  } catch (error) {
    console.error("❌ Failed to parse booking:", error);
  }

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  const [booking, setBooking] = useState<any>(parsedBooking);
  const [loading, setLoading] = useState(!parsedBooking);
  const [serviceId, setServiceId] = useState("");

  const [startOtp, setStartOtp] = useState("");
  const [endOtp, setEndOtp] = useState("");
  const [startVerified, setStartVerified] = useState(false);
  const [endVerified, setEndVerified] = useState(false);
  const [beforeUploads, setBeforeUploads] = useState<Record<string, string>>({});
  const [afterUploads, setAfterUploads] = useState<Record<string, string>>({});
  const [serviceType, setServiceType] = useState("");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [workStopped, setWorkStopped] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [staffAmount, setStaffAmount] = useState(0);
  const [workStartedAt, setWorkStartedAt] = useState<string | null>(null);
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [skipType, setSkipType] = useState<"start" | "end" | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [startSkipReason, setStartSkipReason] = useState<string | null>(null);
  const [endSkipReason, setEndSkipReason] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupConfirmText, setPopupConfirmText] = useState("OK");
  const [popupCancelText, setPopupCancelText] = useState<string | null>(null);
  const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | null>(null);
  const [startPhotoSkipped, setStartPhotoSkipped] = useState(false);
  const [endPhotoSkipped, setEndPhotoSkipped] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const endOtpRef = useRef<View>(null);

  const bathroomFields = [
    "bathroom_door",
    "toilet_bowl",
    "wall_tiles",
    "floor_area",
    "electric_switch_board",
    "exhaust_fan",
    "taps_and_fittings",
  ];

  const genericFields = [
    "upload_1",
    "upload_2",
    "upload_3",
    "upload_4",
    "upload_5",
    "upload_6",
  ];

  const activeFields = serviceType === "BATHROOM" ? bathroomFields : genericFields;

  const STORAGE_KEY = booking ? `booking_${booking.id}` : "";

  // If no booking, show error and return (but hooks are already declared)
  if (!booking) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>No booking data available</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, backgroundColor: "#FFD700", padding: 12, borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ================= FUNCTIONS =================
  const showPopup = ({
    title,
    message,
    confirmText = "OK",
    cancelText = null,
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
    onConfirm?: () => void;
  }) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupConfirmText(confirmText);
    setPopupCancelText(cancelText);
    setPopupOnConfirm(() => onConfirm || null);
    setPopupVisible(true);
  };

  const playCompletionSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/images/sounds/success.mp3"),
      );

      await sound.playAsync();
      console.log("🔊 Sound played");
    } catch (error) {
      console.log("❌ Sound error:", error);
    }
  };

  const formatDuration = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;

    let result = "";
    if (h > 0) result += `${h} hr `;
    if (m > 0) result += `${m} min `;
    if (s > 0) result += `${s} sec`;
    return result.trim();
  };

  const openMaps = (lat: number, lng: number) => {
    if (!lat || !lng) {
      showPopup({
        title: "Location Not Available 📍",
        message: "Customer location coordinates are missing.",
      });
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const openCamera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();

    if (!p.granted) {
      showPopup({
        title: "Camera Permission Required 📷",
        message: "Please allow camera access to upload work photos.",
        confirmText: "Open Settings",
        cancelText: "Cancel",
        onConfirm: () => {
          Linking.openSettings();
        },
      });
      return null;
    }

    const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    return r.canceled ? null : r.assets[0].uri;
  };

  const uploadImage = async (
    localUri: string,
    stage: "before" | "after",
    category: string,
  ) => {
    try {
      setUploading(true);

      const compressedImage = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.4,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const formData = new FormData();
      formData.append("stage", stage);
      formData.append("category", category);
      formData.append(
        "file",
        {
          uri: compressedImage.uri,
          name: `${category}.jpg`,
          type: "image/jpeg",
        } as any,
      );

      const response = await partnerApi.uploadBookingPhoto(booking.id, formData);

      if (!response?.success) {
        throw new Error(response?.message || "Photo upload failed.");
      }

      if (stage === "before") {
        setBeforeUploads((prev) => ({
          ...prev,
          [category]: localUri,
        }));
      } else {
        setAfterUploads((prev) => ({
          ...prev,
          [category]: localUri,
        }));
      }

      console.log("Photo uploaded successfully:", stage, category);
    } catch (error: any) {
      console.log("Photo upload error:", error);
      showPopup({
        title: "Upload Failed ⚠️",
        message: error?.message || "Please check your internet connection and try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const verifyStartOtp = () => {
    if (!startOtp || startOtp.length !== 6) {
      showPopup({
        title: "Invalid OTP ❌",
        message: "Please enter the 6-digit Start OTP.",
      });
      return;
    }
    setStartVerified(true);
    showPopup({
      title: "OTP Entered ✅",
      message: "Start OTP is ready. You can continue to the photo and work steps.",
    });
  };

  const verifyEndOtp = () => {
    if (!endOtp || endOtp.length !== 6) {
      showPopup({
        title: "Invalid OTP ❌",
        message: "Please enter the 6-digit End OTP.",
      });
      return;
    }
    setEndVerified(true);
    showPopup({
      title: "OTP Entered ✅",
      message: "End OTP is ready. You can complete the service.",
    });
  };

  const removeImage = (category: string, stage: "before" | "after") => {
    if (stage === "before") {
      setBeforeUploads((prev) => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
    } else {
      setAfterUploads((prev) => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
    }
  };

  const openSkipModal = (type: "start" | "end") => {
    setSkipType(type);
    setSelectedReason(null);
    setSkipModalVisible(true);
  };

  const confirmSkip = async () => {
    if (!selectedReason || !skipType) {
      return;
    }

    try {
      const stage = skipType === "start" ? "before" : "after";

      const response = await partnerApi.skipPhoto(booking.id, stage, selectedReason);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save skip reason.");
      }

      if (skipType === "start") {
        setStartPhotoSkipped(true);
        setStartSkipReason(selectedReason);
      } else {
        setEndPhotoSkipped(true);
        setEndSkipReason(selectedReason);
      }

      setSkipModalVisible(false);
    } catch (error: any) {
      showPopup({
        title: "Unable to Skip Photo ❌",
        message: error?.message || "Failed to save skip reason.",
      });
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    if (loading && parsedBooking) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!booking) return;
      
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        setStartOtp(d.startOtp || "");
        setEndOtp(d.endOtp || "");
        setStartVerified(d.startVerified || false);
        setEndVerified(d.endVerified || false);
        setRunning(d.running || false);
        setSeconds(d.seconds || 0);
        setWorkStopped(d.workStopped || false);
      }

      try {
        setIsLoadingDetails(true);
        const response = await partnerApi.getBookingDetails(booking.id);
        const latest = response?.data;

        if (!latest) {
          console.log("Booking details not found");
          return;
        }

        if (latest?.work_started_at && !latest?.work_ended_at) {
          setWorkStartedAt(latest.work_started_at);
          setRunning(true);
          setWorkStopped(false);
          setStartVerified(true);
        } else if (latest?.work_ended_at) {
          setRunning(false);
          setWorkStopped(true);
          setWorkStartedAt(null);
          setStartVerified(true);
        }

        if (
          typeof latest?.start_photo_url === "string" &&
          latest.start_photo_url.startsWith("Skipped:")
        ) {
          const reason = latest.start_photo_url.replace("Skipped: ", "");
          setStartPhotoSkipped(true);
          setStartSkipReason(reason);
        }

        if (
          typeof latest?.end_photo_url === "string" &&
          latest.end_photo_url.startsWith("Skipped:")
        ) {
          const reason = latest.end_photo_url.replace("Skipped: ", "");
          setEndPhotoSkipped(true);
          setEndSkipReason(reason);
        }

        if (latest?.work_started_at) {
          setStartVerified(true);
          if (!startOtp) {
            setStartOtp("******");
          }

          const uploads = latest?.service_uploads;
          if (uploads) {
            setBeforeUploads(uploads.before || {});
            setAfterUploads(uploads.after || {});
          }
        }
      } catch (error) {
        console.log("Failed to load booking details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    })();
  }, [booking]);

  useEffect(() => {
    if (!booking || !STORAGE_KEY) return;
    
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        startOtp,
        endOtp,
        startVerified,
        endVerified,
        beforeUploads,
        afterUploads,
        running,
        seconds,
        workStopped,
      }),
    );
  }, [
    startOtp,
    endOtp,
    startVerified,
    endVerified,
    beforeUploads,
    afterUploads,
    running,
    seconds,
    workStopped,
    booking,
    STORAGE_KEY,
  ]);

  useEffect(() => {
    if (!booking) return;
    
    const loadBookingDetails = async () => {
      try {
        const response = await partnerApi.getBookingDetails(booking.id);
        const data = response?.data;

        if (!data) {
          console.log("Booking details not found");
          return;
        }

        const service = Array.isArray(data.services) ? data.services[0] : null;

        if (!service) {
          console.log("No service found");
          return;
        }

        const extractedServiceId = service.id;
        if (extractedServiceId) {
          setServiceId(extractedServiceId);
        }

        const rawAmount = service.staff_amount ?? 0;
        const cleanedAmount = Number(String(rawAmount).replace(/[^0-9.]/g, ""));
        setStaffAmount(cleanedAmount);
        setServiceType(String(service.service_type || "").toUpperCase());

        console.log("SERVICE TYPE:", service.service_type);
        console.log("STAFF AMOUNT:", cleanedAmount);
      } catch (error) {
        console.log("Failed to load booking details:", error);
      }
    };

    loadBookingDetails();
  }, [booking]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [serviceId]);

  useEffect(() => {
    if (!workStartedAt) return;

    const updateTimer = () => {
      const diff = Math.floor(
        (Date.now() - new Date(workStartedAt).getTime()) / 1000,
      );
      setSeconds(diff);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workStartedAt]);

  if (loading || isLoadingDetails) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ marginTop: 10 }}>Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  // ================= RENDER =================
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

      {uploading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loaderText}>Uploading image...</Text>
        </View>
      )}

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
            router.canGoBack() ? router.back() : router.replace("/assigned-services")
          }
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.body, { paddingBottom: 80 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>{booking.customer_name}</Text>
            <Text>Date: {booking.booking_date}</Text>
            <Text>Time: {booking.booking_time}</Text>
            <Text>Address: {booking.full_address}</Text>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => {
                if (!booking.phone_number) {
                  showPopup({
                    title: "Number Not Available 📞",
                    message: "Customer phone number is not available for this booking.",
                  });
                  return;
                }
                Linking.openURL(`tel:${booking.phone_number}`);
              }}
            >
              <Ionicons name="call" size={18} color="#ffffff" />
              <Text style={styles.callText}>Call Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => openMaps(booking.latitude, booking.longitude)}
            >
              <Text>Location</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Start OTP</Text>
            <TextInput
              style={[
                styles.otpInput,
                startVerified && { backgroundColor: "#eee" },
              ]}
              value={startOtp}
              onChangeText={setStartOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!startVerified}
              onFocus={() => {
                if (!endVerified) {
                  setTimeout(() => {
                    scrollRef.current?.scrollToEnd({
                      animated: true,
                    });
                  }, 300);
                }
              }}
            />

            {startVerified && (
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={16} color="green" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}

            {!startVerified && (
              <TouchableOpacity style={styles.btn} onPress={verifyStartOtp}>
                <Text style={styles.btnText}>Verify Start OTP</Text>
              </TouchableOpacity>
            )}

            {startVerified && (
              <>
                {activeFields.map((field) => (
                  <View key={field} style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        marginBottom: 6,
                        textTransform: "capitalize",
                      }}
                    >
                      {field.replace(/_/g, " ")}
                    </Text>

                    {beforeUploads[field] ? (
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: beforeUploads[field] }}
                          style={styles.preview}
                        />
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeImage(field, "before")}
                        >
                          <Ionicons name="close-circle" size={18} color="red" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={async () => {
                          const uri = await openCamera();
                          if (uri) {
                            uploadImage(uri, "before", field);
                          }
                        }}
                      >
                        <Text>Upload {field.replace(/_/g, " ")}</Text>
                        <Ionicons name="camera" size={18} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => openSkipModal("start")}
                  style={{
                    marginTop: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: "#FFD700",
                    borderRadius: 6,
                    alignSelf: "flex-end",
                    backgroundColor: "#FFD700",
                  }}
                >
                  <Text style={{ color: "#0e0e0e", fontWeight: "bold" }}>
                    Skip Photo
                  </Text>
                </TouchableOpacity>
                {startSkipReason && (
                  <Text style={{ color: "red", marginTop: 6 }}>
                    Skipped: {startSkipReason}
                  </Text>
                )}
              </>
            )}

            {(Object.keys(beforeUploads).length === activeFields.length ||
              startPhotoSkipped) &&
              !running &&
              !workStopped && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => {
                    showPopup({
                      title: "You Are Ready To Go 🚀",
                      message: "Click On START to start work.",
                      confirmText: "START",
                      cancelText: "Cancel",
                      onConfirm: async () => {
                        try {
                          const response = await partnerApi.startWork(
                            booking.id,
                            startOtp,
                          );

                          if (!response?.success) {
                            throw new Error(
                              response?.message || "Failed to start work.",
                            );
                          }

                          const startTime =
                            response.work_started_at ||
                            new Date().toISOString();

                          setWorkStartedAt(startTime);
                          setRunning(true);
                          setWorkStopped(false);
                        } catch (error: any) {
                          showPopup({
                            title: "Unable to Start Work ❌",
                            message: error?.message || "Failed to start work.",
                          });
                        }
                      },
                    });
                  }}
                >
                  <Text style={styles.btnText}>Start Work</Text>
                </TouchableOpacity>
              )}

            {running && (
              <Text style={styles.timer}>{formatDuration(seconds)}</Text>
            )}

            {running && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => {
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }

                  showPopup({
                    title: "Work Completed 🎉",
                    message: `You have successfully completed the work in ${formatDuration(
                      seconds,
                    )}.\n\nTo finalize the service, please upload the end photo and verify with OTP.`,
                    confirmText: "Proceed",
                    onConfirm: async () => {
                      setRunning(false);
                      setWorkStopped(true);
                      setWorkStartedAt(null);
                    },
                  });
                }}
              >
                <Text>Work Complete</Text>
              </TouchableOpacity>
            )}

            {workStopped && (
              <Text style={styles.timer}>
                Worked Time: {formatDuration(seconds)}
              </Text>
            )}

            {workStopped && (
              <>
                {activeFields.map((field) => (
                  <View key={field} style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        marginBottom: 6,
                        textTransform: "capitalize",
                      }}
                    >
                      {field.replace(/_/g, " ")}
                    </Text>

                    {afterUploads[field] ? (
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: afterUploads[field] }}
                          style={styles.preview}
                        />
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeImage(field, "after")}
                        >
                          <Ionicons name="close-circle" size={18} color="red" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={async () => {
                          const uri = await openCamera();
                          if (uri) {
                            uploadImage(uri, "after", field);
                          }
                        }}
                      >
                        <Text>Upload {field.replace(/_/g, " ")}</Text>
                        <Ionicons name="camera" size={18} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => openSkipModal("end")}
                  style={{
                    marginTop: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: "#FFD700",
                    borderRadius: 6,
                    alignSelf: "flex-end",
                    backgroundColor: "#FFD700",
                  }}
                >
                  <Text style={{ color: "black", fontWeight: "bold" }}>
                    Skip Photo
                  </Text>
                </TouchableOpacity>
                {endSkipReason && (
                  <Text style={{ color: "red", marginTop: 6 }}>
                    Skipped: {endSkipReason}
                  </Text>
                )}

                {(Object.keys(afterUploads).length === activeFields.length ||
                  endPhotoSkipped) && (
                  <>
                    <View ref={endOtpRef}>
                      <Text style={styles.label}>End OTP</Text>
                      <TextInput
                        style={[
                          styles.otpInput,
                          endVerified && {
                            backgroundColor: "#e5e5e5",
                            color: "#777",
                          },
                        ]}
                        value={endOtp}
                        onChangeText={setEndOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!endVerified}
                        onFocus={() => {
                          if (!endVerified) {
                            setTimeout(() => {
                              endOtpRef.current?.measureLayout(
                                scrollRef.current as any,
                                (x, y) => {
                                  scrollRef.current?.scrollTo({
                                    y: y - 120,
                                    animated: true,
                                  });
                                },
                                () => {},
                              );
                            }, 250);
                          }
                        }}
                      />
                    </View>
                    {endVerified && (
                      <View style={styles.verifiedRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="green"
                        />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}

                    {!endVerified && (
                      <TouchableOpacity
                        style={styles.btn}
                        onPress={verifyEndOtp}
                      >
                        <Text style={styles.btnText}>Verify End OTP</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}

            {endVerified &&
              (Object.keys(afterUploads).length === activeFields.length ||
                endPhotoSkipped) && (
                <TouchableOpacity
                  style={styles.serviceDone}
                  onPress={async () => {
                    try {
                      const amount = staffAmount;

                      const response = await partnerApi.completeWork(
                        booking.id,
                        endOtp,
                        formatDuration(seconds),
                        amount,
                      );

                      if (!response?.success) {
                        throw new Error(
                          response?.message ||
                            "Failed to complete service.",
                        );
                      }

                      await playCompletionSound();

                      showPopup({
                        title: "Congratulations 🎉",
                        message: `You have earned ₹${amount}`,
                        confirmText: "Go to Dashboard",
                        onConfirm: () => {
                          router.replace("/dashboard");
                        },
                      });
                    } catch (error: any) {
                      console.log("Complete service error:", error);
                      showPopup({
                        title: "Error ⚠️",
                        message: error?.message || "Something went wrong. Please try again.",
                      });
                    }
                  }}
                >
                  <Text style={styles.serviceDoneText}>Service Completed</Text>
                </TouchableOpacity>
              )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {skipModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Why are you skipping?
            </Text>

            {[
              "Camera not working",
              "Customer denied permission",
              "Low light issue",
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setSelectedReason(reason)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Ionicons
                  name={
                    selectedReason === reason
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={18}
                  color="#000"
                />
                <Text style={{ marginLeft: 8 }}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15,
              }}
            >
              <TouchableOpacity onPress={() => setSkipModalVisible(false)}>
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!selectedReason}
                onPress={confirmSkip}
              >
                <Text
                  style={{
                    color: selectedReason ? "green" : "gray",
                    fontWeight: "bold",
                  }}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal visible={popupVisible} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={28} color="#000" />
            </View>

            <Text style={styles.popupTitle}>{popupTitle}</Text>
            <Text style={styles.popupMessage}>{popupMessage}</Text>

            <View style={styles.buttonRow}>
              {popupCancelText && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setPopupVisible(false)}
                >
                  <Text style={styles.cancelText}>{popupCancelText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setPopupVisible(false);
                  if (popupOnConfirm) popupOnConfirm();
                }}
              >
                <Text style={styles.confirmText}>{popupConfirmText}</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { width: 190, height: 64 },
  body: { padding: 20 },
  card: { borderWidth: 2, borderRadius: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: "800" },
  label: { marginTop: 16, fontWeight: "700" },
  otpInput: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 },
  verifiedRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  verifiedText: { color: "green", fontWeight: "700" },
  btn: {
    marginTop: 10,
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#000000", fontWeight: "700" },
  imageRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  preview: { width: 60, height: 60, borderRadius: 8 },
  uploadBtn: {
    marginTop: 10,
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startBtn: {
    marginTop: 14,
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  completeBtn: {
    marginTop: 10,
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  timer: {
    marginTop: 14,
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    color: "#000",
  },
  mapBtn: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  callBtn: {
    marginTop: 10,
    backgroundColor: "#000000",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  callText: { fontWeight: "700", color: "#ffffff" },
  serviceDone: {
    marginTop: 24,
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  serviceDoneText: { color: "#fff", fontWeight: "800" },
  imageWrapper: { position: "relative" },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loaderText: { marginTop: 10, fontWeight: "700" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupCard: {
    width: "85%",
    backgroundColor: "#ded8b9",
    borderRadius: 18,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  popupMessage: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  cancelBtn: {
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: "#000",
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});