// import { Ionicons } from "@expo/vector-icons";
// import dayjs from "dayjs";
// import { Audio } from "expo-av";
// import { Image } from "expo-image";
// import * as Location from "expo-location";
// import { router, useFocusEffect, usePathname } from "expo-router";
// import * as TaskManager from "expo-task-manager";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   BackHandler,
//   Dimensions,
//   FlatList,
//   Linking,
//   Modal,
//   PanResponder,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   Vibration,
//   View,
// } from "react-native";
// import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
// import { SafeAreaView } from "react-native-safe-area-context";
// import LocationDisclosureModal from "../components/LocationDisclosureModal";
// import { scheduleDailyDutyReminders } from "../lib/dutyReminders";
// import { LOCATION_TASK_NAME } from "../lib/locationTask";
// import { splitAndAddSessionLogs, turnOffDutyAndLogout } from "../lib/logout";
// import { supabase } from "../lib/supabase";
// import { registerForPushNotificationsAsync } from "./notifications";

// const { height, width } = Dimensions.get("window");
// const SLIDER_HEIGHT = height * 0.42;

// export default function MyRoleScreen() {
//   const pathname = usePathname();

//   const [newCount, setNewCount] = useState(0);
//   // const [pendingCount, setPendingCount] = useState(0);
//   const [assignedCount, setAssignedCount] = useState(0);
//   const [completedCount, setCompletedCount] = useState(0);
//   const [cancelledCount, setCancelledCount] = useState(0);
//   const [activeSlide, setActiveSlide] = useState(0);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [slides, setSlides] = useState<string[]>([]);
//   const [isAvailable, setIsAvailable] = useState(false);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [dutyModalVisible, setDutyModalVisible] = useState(false);
//   const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);
//   const [targetDutyValue, setTargetDutyValue] = useState<boolean | null>(null);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [locationDisclosureVisible, setLocationDisclosureVisible] = useState(false);
//   const [outOfBoundsModalVisible, setOutOfBoundsModalVisible] = useState(false);
//   const [todayDutyMinutes, setTodayDutyMinutes] = useState(0);
//   const [weeklyDutyMinutes, setWeeklyDutyMinutes] = useState(0);
//   const [monthlyDutyMinutes, setMonthlyDutyMinutes] = useState(0);
//   const [dutyStartedAt, setDutyStartedAt] = useState<string | null>(null);
//   const [dutyLogsJson, setDutyLogsJson] = useState<Record<string, number>>({});
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [loadingLogout, setLoadingLogout] = useState(false);

//   const dbTodayMinsRef = useRef<number>(0);
//   const dbWeeklyMinsRef = useRef<number>(0);
//   const dbMonthlyMinsRef = useRef<number>(0);

//   /* AUDIO & VIBRATION ALERT FOR OUT OF BOUNDS (PLAY TWICE) */
//   const playAlertSound = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         playsInSilentModeIOS: true,
//         shouldDuckAndroid: true,
//         staysActiveInBackground: false,
//       });

//       const { sound } = await Audio.Sound.createAsync(
//         require("../assets/images/zone_alert.wav")
//       );

//       let playCount = 0;
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish && !status.isLooping) {
//           playCount += 1;
//           if (playCount < 2) {
//             sound.replayAsync();
//           } else {
//             sound.unloadAsync();
//           }
//         }
//       });

//       await sound.playAsync();
//       Vibration.vibrate([0, 400, 150, 400, 150, 400]);
//     } catch (error) {
//       console.log("❌ Alert sound error:", error);
//     }
//   };

//   const triggerOutOfBoundsPopUp = () => {
//     setOutOfBoundsModalVisible(true);
//     playAlertSound();
//   };

//   const hasAlertedOutOfBoundsRef = useRef(false);

//   /* ZONE MAP & GEOFENCING STATES */
//   const [zoneModalVisible, setZoneModalVisible] = useState(false);
//   const [isOutOfZone, setIsOutOfZone] = useState(false);
//   const [assignedHubName, setAssignedHubName] = useState<string>("Assigned Zone");
//   const [assignedLocationsStr, setAssignedLocationsStr] = useState<string>("");
//   const [assignedHubCoords, setAssignedHubCoords] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [assignedPincodes, setAssignedPincodes] = useState<string[]>([]);
//   const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [currentAreaName, setCurrentAreaName] = useState<string>("");
//   const [selectedPincodeInfo, setSelectedPincodeInfo] = useState<string | null>(null);

//   interface HubSubLocation {
//     location_name: string;
//     pincode: string;
//     latitude?: number;
//     longitude?: number;
//   }

//   const [hubSubLocations, setHubSubLocations] = useState<HubSubLocation[]>([]);
//   const isZoneDataLoadedRef = useRef(false);

//   const SUB_LOCATION_COORDS_MAP: Record<string, { latitude: number; longitude: number }> = {
//     nallagandla: { latitude: 17.4727, longitude: 78.3183 },
//     tellapur: { latitude: 17.4608, longitude: 78.2831 },
//     gopanpally: { latitude: 17.4475, longitude: 78.3072 },
//     "osman nagar": { latitude: 17.4321, longitude: 78.2912 },
//     lingampally: { latitude: 17.4828, longitude: 78.3195 },
//     bhel: { latitude: 17.4932, longitude: 78.2985 },
//     kollur: { latitude: 17.4435, longitude: 78.2256 },
//     serilingampalle: { latitude: 17.4851, longitude: 78.3240 },
//     kondapur: { latitude: 17.4622, longitude: 78.3568 },
//     gachibowli: { latitude: 17.4401, longitude: 78.3489 },
//     miyapur: { latitude: 17.4968, longitude: 78.3614 },
//     kukatpally: { latitude: 17.4849, longitude: 78.4138 },
//     madhapur: { latitude: 17.4483, longitude: 78.3915 },
//     hitech: { latitude: 17.4435, longitude: 78.3772 },
//     chandanagar: { latitude: 17.4921, longitude: 78.3302 },
//   };

//   const HYDERABAD_HUBS: Record<string, { latitude: number; longitude: number }> = {
//     "pragathi nagar": { latitude: 17.5255, longitude: 78.397 },
//     "kukatpally": { latitude: 17.4947, longitude: 78.3996 },
//     "miyapur": { latitude: 17.4968, longitude: 78.3614 },
//     "gachibowli": { latitude: 17.4401, longitude: 78.3489 },
//     "madhapur": { latitude: 17.4483, longitude: 78.3915 },
//     "kondapur": { latitude: 17.4617, longitude: 78.3673 },
//     "uppal": { latitude: 17.4056, longitude: 78.5581 },
//     "mani konda": { latitude: 17.3982, longitude: 78.3844 },
//     "nallagandla": { latitude: 17.4727, longitude: 78.3183 },
//   };

//   /* ================= FETCH ASSIGNED ZONE & HUB ================= */
//   const fetchAssignedHubZone = async () => {
//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData?.user?.email) return;

//     const email = userData.user.email.toLowerCase().trim();

//     try {
//       const { data: hubs } = await supabase
//         .from("hub_category_counts")
//         .select("hub, location, category, assigned_staff");

//       if (hubs && hubs.length > 0) {
//         const match = hubs.find((item) =>
//           item.assigned_staff?.toLowerCase().includes(email)
//         );

//         if (match) {
//           const hubName = match.hub || "Assigned Zone";
//           const locsFromCat = match.location || "";
//           setAssignedHubName(hubName);

//           const { data: hubLocRows } = await supabase
//             .from("hub_locations")
//             .select("location_name, pincode")
//             .eq("hub_name", hubName);
//           let locNames: string[] = [];
//           let pincodesList: string[] = [];
//           let rawSubLocs: Array<{ location_name: string; pincode: string }> = [];

//           if (hubLocRows && hubLocRows.length > 0) {
//             for (const r of hubLocRows) {
//               const locName = (r.location_name || "").trim();
//               const pin = String(r.pincode || "").trim();
//               if (locName) locNames.push(locName);
//               if (pin) pincodesList.push(pin);
//               rawSubLocs.push({ location_name: locName, pincode: pin });
//             }
//           }

//           const subLocs: HubSubLocation[] = await Promise.all(
//             rawSubLocs.map(async (sub) => {
//               let subLat: number | undefined;
//               let subLng: number | undefined;
//               try {
//                 const geo = await Promise.race([
//                   Location.geocodeAsync(`${sub.location_name}, ${sub.pincode || ""}, Telangana, India`),
//                   new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
//                 ]);
//                 if (geo && geo.length > 0 && typeof geo[0].latitude === "number" && Number.isFinite(geo[0].latitude) && typeof geo[0].longitude === "number" && Number.isFinite(geo[0].longitude)) {
//                   subLat = geo[0].latitude;
//                   subLng = geo[0].longitude;
//                 }
//               } catch (e) { }

//               return {
//                 location_name: sub.location_name,
//                 pincode: sub.pincode,
//                 latitude: subLat,
//                 longitude: subLng,
//               };
//             })
//           );

//           if (locNames.length > 0) {
//             const formattedLocsWithPins = subLocs
//               .map((s) => (s.pincode ? `${s.location_name} (${s.pincode})` : s.location_name))
//               .join(" • ");
//             setAssignedLocationsStr(formattedLocsWithPins);
//           } else {
//             setAssignedLocationsStr(locsFromCat);
//           }

//           setAssignedPincodes(pincodesList);
//           setHubSubLocations(subLocs);

//           const validSubCoords = subLocs.filter(
//             (s) => typeof s.latitude === "number" && Number.isFinite(s.latitude) && typeof s.longitude === "number" && Number.isFinite(s.longitude)
//           );

//           if (validSubCoords.length > 0) {
//             const sumLat = validSubCoords.reduce((acc, curr) => acc + (curr.latitude || 0), 0);
//             const sumLng = validSubCoords.reduce((acc, curr) => acc + (curr.longitude || 0), 0);
//             setAssignedHubCoords({
//               latitude: sumLat / validSubCoords.length,
//               longitude: sumLng / validSubCoords.length,
//             });
//           } else {
//             try {
//               const geocoded = await Promise.race([
//                 Location.geocodeAsync(`${hubName}, Telangana, India`),
//                 new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
//               ]);
//               if (geocoded && geocoded.length > 0 && typeof geocoded[0].latitude === "number" && Number.isFinite(geocoded[0].latitude) && typeof geocoded[0].longitude === "number" && Number.isFinite(geocoded[0].longitude)) {
//                 setAssignedHubCoords({
//                   latitude: geocoded[0].latitude,
//                   longitude: geocoded[0].longitude,
//                 });
//               }
//             } catch (e) { }
//           }

//           isZoneDataLoadedRef.current = true;
//           if (currentCoords) {
//             checkZoneBoundary(currentCoords.latitude, currentCoords.longitude);
//           }
//         }
//       }
//     } catch (err) {
//       console.log("Error fetching assigned hub zone:", err);
//     }
//   };

//   /* DRAGGABLE PAN RESPONDER FOR FLOATING BUTTON */
//   const pan = useRef(new Animated.ValueXY()).current;
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => false,
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
//       },
//       onPanResponderGrant: () => {
//         pan.setOffset({
//           x: (pan.x as any)._value || 0,
//           y: (pan.y as any)._value || 0,
//         });
//         pan.setValue({ x: 0, y: 0 });
//       },
//       onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
//         useNativeDriver: false,
//       }),
//       onPanResponderRelease: () => {
//         pan.flattenOffset();
//       },
//     })
//   ).current;

//   /* HAVERSINE MATHEMATICAL DISTANCE IN KM */
//   const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371; // Earth radius in km
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   /* GENERATES CONVEX HULL FOR A SET OF POINTS */
//   const getConvexHullCoordinates = (points: Array<{ latitude: number; longitude: number }>) => {
//     if (!points || points.length < 3) return [];
//     const validPoints = points.filter(
//       (p) => p && typeof p.latitude === "number" && Number.isFinite(p.latitude) && typeof p.longitude === "number" && Number.isFinite(p.longitude)
//     );
//     if (validPoints.length < 3) return [];

//     const sorted = [...validPoints].sort((a, b) =>
//       a.longitude === b.longitude ? a.latitude - b.latitude : a.longitude - b.longitude
//     );

//     const cross = (o: any, a: any, b: any) =>
//       (a.longitude - o.longitude) * (b.latitude - o.latitude) -
//       (a.latitude - o.latitude) * (b.longitude - o.longitude);

//     const lower: any[] = [];
//     for (const p of sorted) {
//       while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
//         lower.pop();
//       }
//       lower.push(p);
//     }

//     const upper: any[] = [];
//     for (let i = sorted.length - 1; i >= 0; i--) {
//       const p = sorted[i];
//       while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
//         upper.pop();
//       }
//       upper.push(p);
//     }

//     lower.pop();
//     upper.pop();
//     return lower.concat(upper);
//   };

//   /* GENERATES REALISTIC ORGANIC BOUNDARY POLYGON FOR A PINCODE */
//   const generatePincodeBoundaryPoints = (lat: number, lng: number, radiusKm: number = 1.3) => {
//     if (typeof lat !== "number" || !Number.isFinite(lat) || typeof lng !== "number" || !Number.isFinite(lng)) return [];
//     const cosLat = Math.cos((lat * Math.PI) / 180);
//     if (Math.abs(cosLat) < 0.0001) return [];

//     const points: Array<{ latitude: number; longitude: number }> = [];
//     const numPoints = 12;
//     const seed = (Math.abs(lat * 1000) + Math.abs(lng * 1000)) % 10;
//     for (let i = 0; i < numPoints; i++) {
//       const angle = (i * 2 * Math.PI) / numPoints;
//       const varRadius = radiusKm * (0.85 + 0.3 * Math.sin(angle * 3 + seed));
//       const latOffset = (varRadius / 111) * Math.cos(angle);
//       const lngOffset = (varRadius / (111 * cosLat)) * Math.sin(angle);
//       const ptLat = lat + latOffset;
//       const ptLng = lng + lngOffset;
//       if (typeof ptLat === "number" && Number.isFinite(ptLat) && typeof ptLng === "number" && Number.isFinite(ptLng)) {
//         points.push({
//           latitude: ptLat,
//           longitude: ptLng,
//         });
//       }
//     }
//     return points;
//   };

//   /* DYNAMIC HUB ENCLOSING BOUNDARY CENTER & RADIUS CALCULATOR */
//   const getDynamicHubBoundary = () => {
//     const validSubs = hubSubLocations.filter(
//       (s) => s.latitude && s.longitude
//     );

//     if (validSubs.length === 0) {
//       return {
//         center: assignedHubCoords || HYDERABAD_HUBS["pragathi nagar"],
//         radius: 6500,
//       };
//     }

//     // 1. Compute Centroid of all sub-location pincodes
//     const avgLat =
//       validSubs.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSubs.length;
//     const avgLng =
//       validSubs.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSubs.length;

//     const center = { latitude: avgLat, longitude: avgLng };

//     // 2. Compute Maximum Distance to ANY sub-location pincode + margin
//     let maxDistKm = 0;
//     validSubs.forEach((s) => {
//       if (s.latitude && s.longitude) {
//         const d = getDistanceFromLatLonInKm(
//           avgLat,
//           avgLng,
//           s.latitude,
//           s.longitude
//         );
//         if (d > maxDistKm) maxDistKm = d;
//       }
//     });

//     // Add 2.5 KM padding so every sub-location pincode is 100% inside the circle!
//     const radiusMeters = Math.max(
//       7500,
//       Math.ceil((maxDistKm + 2.5) * 1000)
//     );

//     return { center, radius: radiusMeters };
//   };

//   /* ================= CHECK ZONE BOUNDARY ================= */
//   const checkZoneBoundary = async (lat: number, lng: number) => {
//     setCurrentCoords({ latitude: lat, longitude: lng });

//     // 0. Safety Gate: Don't evaluate until zone data has finished loading on app launch
//     if (!isZoneDataLoadedRef.current && hubSubLocations.length === 0) {
//       console.log("⏳ Zone data loading in progress. Postponing boundary evaluation.");
//       return false;
//     }

//     let isInside = false;
//     let currentAreaStr = "";

//     // 1. DIRECT HUB CENTER PROXIMITY CHECK (4.5 KM radius)
//     if (assignedHubCoords) {
//       const distToHubKm = getDistanceFromLatLonInKm(
//         lat,
//         lng,
//         assignedHubCoords.latitude,
//         assignedHubCoords.longitude
//       );
//       if (distToHubKm <= 4.5) {
//         isInside = true;
//       }
//     }

//     // 2. DIRECT SUB-LOCATION PROXIMITY CHECK (3.5 KM radius to ANY assigned sub-location)
//     if (!isInside && hubSubLocations && hubSubLocations.length > 0) {
//       for (const sub of hubSubLocations) {
//         if (sub.latitude && sub.longitude) {
//           const distToSubKm = getDistanceFromLatLonInKm(lat, lng, sub.latitude, sub.longitude);
//           if (distToSubKm <= 3.5) {
//             isInside = true;
//             break;
//           }
//         }
//       }
//     }

//     try {
//       const reversed = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
//       if (reversed && reversed.length > 0) {
//         const place = reversed[0];
//         const postalCode = String(place.postalCode || "").trim();
//         const namePart = (place.name || place.street || "").trim();
//         const subregionPart = (place.subregion || place.district || place.city || "").trim();
//         currentAreaStr = `${namePart ? namePart + ", " : ""}${subregionPart}${postalCode ? " (" + postalCode + ")" : ""}`;
//         setCurrentAreaName(currentAreaStr);

//         // 3. EXACT ASSIGNED PINCODE MATCH
//         if (!isInside && postalCode) {
//           const allPincodes = [
//             ...assignedPincodes,
//             ...hubSubLocations.map((s) => s.pincode).filter(Boolean),
//             ...(assignedLocationsStr.match(/\b\d{6}\b/g) || []),
//           ];

//           if (allPincodes.some((pin) => pin && postalCode.includes(pin.trim()))) {
//             isInside = true;
//           }
//         }

//         // 4. ASSIGNED LOCATION KEYWORD MATCH
//         if (!isInside && assignedLocationsStr) {
//           const keywords = assignedLocationsStr
//             .toLowerCase()
//             .split(/[•,\n()]+/)
//             .map((item) => item.trim())
//             .filter((item) => item.length > 2 && !/^\d+$/.test(item));

//           const currentWords = `${namePart} ${subregionPart}`.toLowerCase();
//           const nameMatch = keywords.some((kw) => kw && currentWords.includes(kw));

//           if (nameMatch) {
//             isInside = true;
//           }
//         }
//       }
//     } catch (e) {
//       console.log("Reverse geocode error:", e);
//     }

//     const outOfBounds = !isInside;
//     setIsOutOfZone(outOfBounds);

//     if (!outOfBounds) {
//       hasAlertedOutOfBoundsRef.current = false;
//       setOutOfBoundsModalVisible(false);
//     } else {
//       if (!hasAlertedOutOfBoundsRef.current) {
//         hasAlertedOutOfBoundsRef.current = true;
//         setOutOfBoundsModalVisible(true);
//         triggerZoneBreachAlert(currentAreaStr || "Outside Zone Area");
//         triggerOutOfBoundsPopUp();
//       }
//     }

//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       if (userData?.user) {
//         await supabase
//           .from("staff_profile")
//           .update({
//             is_out_of_zone: outOfBounds,
//             live_location: `${lat}, ${lng}`,
//             live_location_updated_at: new Date().toISOString(),
//           })
//           .eq("id", userData.user.id);
//       }
//     } catch (e) {
//       console.log("DB staff_profile update error:", e);
//     }

//     return outOfBounds;
//   };

//   const triggerZoneBreachAlert = async (currentArea: string) => {
//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData?.user) return;

//     try {
//       await supabase.from("location_alerts").insert([
//         {
//           staff_email: userData.user.email,
//           alert_type: "OUT_OF_ZONE",
//           current_location: currentArea,
//           assigned_hub: assignedHubName,
//           created_at: new Date().toISOString(),
//         },
//       ]);
//     } catch (err) {
//       console.log("Error inserting location alert:", err);
//     }
//   };

//   const handleNavigateToZone = () => {
//     if (assignedHubCoords) {
//       const url = `https://www.google.com/maps/dir/?api=1&destination=${assignedHubCoords.latitude},${assignedHubCoords.longitude}`;
//       Linking.openURL(url);
//     } else {
//       const query = encodeURIComponent(assignedHubName);
//       Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
//     }
//   };

//   const formatMinutesToHours = (totalMinutes: number | string) => {
//     const minsNum = Math.max(0, parseInt(String(totalMinutes || 0), 10) || 0);
//     if (minsNum === 0) return "0 min";
//     const hours = Math.floor(minsNum / 60);
//     const mins = minsNum % 60;

//     if (hours > 0 && mins > 0) {
//       return `${hours}h ${mins} min`;
//     } else if (hours > 0) {
//       return `${hours}h`;
//     } else {
//       return `${mins} min`;
//     }
//   };

//   const calculateDutyTotals = (
//     logs: Record<string, number> = {},
//     active: boolean = false,
//     startedAt: string | null = null,
//   ) => {
//     const todayKey = dayjs().format("YYYY-MM-DD");
//     const currentMonthKey = dayjs().format("YYYY-MM");

//     // Standard Calendar Week: Monday 00:00 to Sunday 23:59
//     const now = dayjs();
//     const dayOfWeek = now.day(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
//     const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//     const startOfWeek = now.subtract(diffToMonday, "day").startOf("day");
//     const endOfWeek = startOfWeek.add(6, "day").endOf("day");

//     let todayBase = Number(logs[todayKey] || 0);
//     let weeklyBase = 0;
//     let monthlyBase = 0;

//     Object.entries(logs).forEach(([dateStr, mins]) => {
//       const minVal = Number(mins) || 0;
//       const d = dayjs(dateStr);

//       if (d.isValid()) {
//         if (
//           (d.isSame(startOfWeek, "day") || d.isAfter(startOfWeek)) &&
//           (d.isSame(endOfWeek, "day") || d.isBefore(endOfWeek))
//         ) {
//           weeklyBase += minVal;
//         }
//         if (dateStr.startsWith(currentMonthKey)) {
//           monthlyBase += minVal;
//         }
//       }
//     });

//     let activeSessionMins = 0;
//     let todayActiveMins = 0;
//     let weeklyActiveMins = 0;
//     let monthlyActiveMins = 0;

//     if (active && startedAt) {
//       const start = dayjs(startedAt);
//       if (start.isValid() && now.isAfter(start)) {
//         activeSessionMins = Math.max(0, now.diff(start, "minute"));

//         // Day starts at 12:00 AM midnight today
//         const startOfToday = now.startOf("day");
//         const effectiveTodayStart = start.isAfter(startOfToday) ? start : startOfToday;
//         todayActiveMins = Math.max(0, now.diff(effectiveTodayStart, "minute"));

//         const effectiveWeeklyStart = start.isAfter(startOfWeek) ? start : startOfWeek;
//         weeklyActiveMins = Math.max(0, now.diff(effectiveWeeklyStart, "minute"));

//         const startOfMonth = now.startOf("month");
//         const effectiveMonthlyStart = start.isAfter(startOfMonth) ? start : startOfMonth;
//         monthlyActiveMins = Math.max(0, now.diff(effectiveMonthlyStart, "minute"));
//       }
//     }

//     const maxTodayMinutes = Math.max(0, now.diff(now.startOf("day"), "minute"));
//     const rawToday = todayBase + todayActiveMins;

//     return {
//       today: Math.min(rawToday, maxTodayMinutes),
//       weekly: weeklyBase + weeklyActiveMins,
//       monthly: monthlyBase + monthlyActiveMins,
//     };
//   };

//   const sliderRef = useRef<FlatList>(null);
//   const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
//   const liveLocationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   /* ================= LIVE LOCATION TRACKING ================= */
//   const startLiveLocationTracking = async (userId: string) => {
//     await stopLiveLocationTracking();

//     // 0. Ensure location permission is granted
//     let { status: fgStatus } = await Location.getForegroundPermissionsAsync();
//     if (fgStatus !== "granted") {
//       const { status: reqStatus } = await Location.requestForegroundPermissionsAsync();
//       fgStatus = reqStatus;
//     }

//     if (fgStatus !== "granted") {
//       console.log("⚠️ Location permission not granted for live tracking.");
//       return;
//     }

//     // 1. Immediate initial location update
//     Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
//       .then(async (pos) => {
//         if (pos?.coords) {
//           const liveLocStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
//           const nowStr = new Date().toISOString();
//           await supabase
//             .from("staff_profile")
//             .update({
//               live_location: liveLocStr,
//               live_location_updated_at: nowStr,
//             })
//             .eq("id", userId);

//           await checkZoneBoundary(pos.coords.latitude, pos.coords.longitude);
//         }
//       })
//       .catch((err) => console.log("Initial live location error:", err));

//     // 2. Real-time Movement Watcher (fires instantly whenever device moves 1m+)
//     try {
//       const sub = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.Balanced,
//           timeInterval: 4000,
//           distanceInterval: 5, // 5 meter movement threshold to prevent GPS jitter flickering
//         },
//         async (pos) => {
//           if (pos?.coords) {
//             const liveLocStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
//             const nowStr = new Date().toISOString();
//             try {
//               await supabase
//                 .from("staff_profile")
//                 .update({
//                   live_location: liveLocStr,
//                   live_location_updated_at: nowStr,
//                 })
//                 .eq("id", userId);

//               // Check zone boundary in real-time
//               checkZoneBoundary(pos.coords.latitude, pos.coords.longitude);
//             } catch (err) {
//               console.log("❌ Watch location update error:", err);
//             }
//           }
//         }
//       );
//       locationSubscriptionRef.current = sub;
//     } catch (err) {
//       console.log("Error starting watchPositionAsync:", err);
//     }

//     // 3. Rapido-style Background Service (for locked screen / minimized app)
//     try {
//       const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
//       if (bgStatus === "granted") {
//         const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
//         if (!isRegistered) {
//           await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 1000,
//             distanceInterval: 1,
//             showsBackgroundLocationIndicator: true,
//             foregroundService: {
//               notificationTitle: "Neatify Partner Active 📍",
//               notificationBody: "Live location tracking active while on-duty.",
//               notificationColor: "#FFD700",
//             },
//           });
//           console.log("✅ Rapido-style background location tracking active");
//         }
//       }
//     } catch (err) {
//       console.log("Notice on background service:", err);
//     }
//   };

//   const stopLiveLocationTracking = async () => {
//     if (liveLocationIntervalRef.current) {
//       clearInterval(liveLocationIntervalRef.current);
//       liveLocationIntervalRef.current = null;
//     }
//     if (locationSubscriptionRef.current) {
//       locationSubscriptionRef.current.remove();
//       locationSubscriptionRef.current = null;
//     }
//     try {
//       const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
//       if (isRegistered) {
//         await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
//         console.log("🛑 Background location task stopped");
//       }
//     } catch (err) {
//       console.log("Error stopping background task:", err);
//     }

//     // Reset is_out_of_zone to null
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       if (userData?.user) {
//         await supabase
//           .from("staff_profile")
//           .update({ is_out_of_zone: null })
//           .eq("id", userData.user.id);
//       }
//     } catch (err) {
//       console.log("Error resetting is_out_of_zone to null:", err);
//     }

//     // Always clear live location fields when tracking is stopped
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       if (userData?.user) {
//         await supabase
//           .from("staff_profile")
//           .update({
//             live_location: null,
//             live_location_updated_at: null,
//             work_start_location: null,
//             is_out_of_zone: false,
//           })
//           .eq("id", userData.user.id);
//       }
//     } catch (e) {
//       console.log("Error clearing live location in stopLiveLocationTracking:", e);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       stopLiveLocationTracking();
//     };
//   }, []);

//   /* ================= BACK HANDLER (FIXED) ================= */
//   useFocusEffect(
//     useCallback(() => {
//       const backAction = () => {
//         if (router.canGoBack()) {
//           router.back();
//           return true;
//         }
//         return false; // allow Android default behavior
//       };

//       const sub = BackHandler.addEventListener("hardwareBackPress", backAction);

//       return () => sub.remove();
//     }, []),
//   );

//   /* ================= Notifications load ================= */

//   const loadNotifications = async () => {
//     const { data: userData } = await supabase.auth.getUser();

//     const email = userData.user?.email;

//     if (!email) return;

//     const { data, error } = await supabase
//       .from("notifications")
//       .select("*")
//       .eq("staff_email", email);

//     if (!error) {
//       setNotifications(data || []);
//     }
//   };

//   /* ================= FETCH SLIDES ================= */
//   const fetchSlides = async () => {
//     const { data, error } = await supabase
//       .from("hero_images")
//       .select("image_path")
//       .eq("is_active", true) // ✅ only active images
//       .order("priority", { ascending: true }); // ✅ order by priority

//     if (error) {
//       console.log("Error fetching slides:", error);
//       return;
//     }

//     if (data) {
//       const imageUrls = data.map((item) => {
//         const { data: publicUrlData } = supabase.storage
//           .from("hero-images-staff")
//           .getPublicUrl(item.image_path);

//         return publicUrlData.publicUrl;
//       });

//       setSlides(imageUrls);
//     }
//   };
//   /* ================= FETCH COUNTS ================= */
//   const fetchCounts = async () => {
//     const { data } = await supabase.auth.getUser();
//     const user = data.user;
//     if (!user) return;

//     const email = user.email;

//     const { count: notif } = await supabase
//       .from("bookings")
//       .select("*", { count: "exact", head: true })
//       .eq("assigned_staff_email", email)
//       .eq("is_viewed", false);

//     // ✅ ASSIGNED (ALL ACTIVE ASSIGNED BOOKINGS)
//     const { count: assigned } = await supabase
//       .from("bookings")
//       .select("*", { count: "exact", head: true })
//       .eq("assigned_staff_email", email)
//       .neq("work_status", "COMPLETED")
//       .neq("work_status", "CANCELLED");

//     const { count: completed } = await supabase
//       .from("bookings")
//       .select("*", { count: "exact", head: true })
//       .eq("assigned_staff_email", email)
//       .eq("work_status", "COMPLETED");

//     // Query staff_cancellations table (matching app/cancellations.tsx)
//     const { count: cancelLogsCount } = await supabase
//       .from("staff_cancellations")
//       .select("*", { count: "exact", head: true })
//       .eq("staff_email", email);

//     let cancelledTotal = cancelLogsCount || 0;
//     if (cancelledTotal === 0) {
//       const { count: cancelledBookingsCount } = await supabase
//         .from("bookings")
//         .select("*", { count: "exact", head: true })
//         .eq("assigned_staff_email", email)
//         .eq("work_status", "CANCELLED");

//       cancelledTotal = cancelledBookingsCount || 0;
//     }

//     const assignedValue = assigned || 0;

//     setNewCount(notif || 0);
//     setAssignedCount(assigned || 0);
//     setCompletedCount(completed || 0);
//     setCancelledCount(cancelledTotal);

//     // 🔥 Sync with staff_profile table
//     await supabase
//       .from("staff_profile")
//       .update({ assigned_count: assignedValue })
//       .eq("id", user.id);
//   };

//   /* ================= FETCH AVAILABILITY ================= */
//   const fetchAvailability = async () => {
//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData.user) return;

//     const { data } = await supabase
//       .from("staff_profile")
//       .select("is_available, duty_started_at, duty_logs_json, duty_sessions_json, is_blocked")
//       .eq("id", userData.user.id)
//       .maybeSingle();

//     if (data?.is_blocked) {
//       await stopLiveLocationTracking();
//       setIsAvailable(false);
//       await turnOffDutyAndLogout(userData.user.id);
//       Alert.alert(
//         "Account Blocked",
//         "Your account has been temporarily blocked. Contact info@thaneatifyteam.in for more details.",
//       );
//       router.replace("./login");
//       return;
//     }

//     const active = data?.is_available ?? false;
//     const startedAt = data?.duty_started_at ?? null;
//     const logs = (data?.duty_logs_json as Record<string, number>) || {};

//     setIsAvailable(active);
//     setDutyStartedAt(startedAt);
//     setDutyLogsJson(logs);

//     const totals = calculateDutyTotals(logs, active, startedAt);
//     setTodayDutyMinutes(totals.today);
//     setWeeklyDutyMinutes(totals.weekly);
//     setMonthlyDutyMinutes(totals.monthly);

//     // Sync exact calculated totals to DB table so staff_profile columns always match exact date-filtered totals
//     try {
//       await supabase
//         .from("staff_profile")
//         .update({
//           today_duty_minutes: String(totals.today),
//           weekly_duty_minutes: String(totals.weekly),
//           monthly_duty_minutes: String(totals.monthly),
//         })
//         .eq("id", userData.user.id);
//     } catch (e) {
//       console.log("Error syncing duty minutes to staff_profile:", e);
//     }

//     if (active) {
//       hasAlertedOutOfBoundsRef.current = false;
//       await fetchAssignedHubZone();
//       if (!locationSubscriptionRef.current) {
//         startLiveLocationTracking(userData.user.id);
//       }
//     } else {
//       hasAlertedOutOfBoundsRef.current = false;
//       setOutOfBoundsModalVisible(false);
//       setIsOutOfZone(false);
//       stopLiveLocationTracking();
//     }
//   };

//   /* LIVE DUTY TIMER TICK */
//   useEffect(() => {
//     if (!isAvailable || !dutyStartedAt) return;

//     const updateTimer = () => {
//       const totals = calculateDutyTotals(dutyLogsJson, true, dutyStartedAt);
//       setTodayDutyMinutes(totals.today);
//       setWeeklyDutyMinutes(totals.weekly);
//       setMonthlyDutyMinutes(totals.monthly);

//       // Periodically update DB staff_profile table columns including duty_logs_json
//       supabase.auth.getUser().then(({ data: userData }) => {
//         if (userData?.user) {
//           const todayKey = dayjs().format("YYYY-MM-DD");
//           const start = dayjs(dutyStartedAt);
//           let todayActiveMins = 0;
//           if (start.isValid()) {
//             const startOfToday = dayjs().startOf("day");
//             const effectiveTodayStart = start.isAfter(startOfToday) ? start : startOfToday;
//             todayActiveMins = Math.max(0, dayjs().diff(effectiveTodayStart, "minute"));
//           }

//           const liveLogs = { ...dutyLogsJson };
//           const baseTodayMins = Number(dutyLogsJson[todayKey] || 0);
//           liveLogs[todayKey] = baseTodayMins + todayActiveMins;

//           supabase
//             .from("staff_profile")
//             .update({
//               duty_logs_json: liveLogs,
//               today_duty_minutes: String(totals.today),
//               weekly_duty_minutes: String(totals.weekly),
//               monthly_duty_minutes: String(totals.monthly),
//             })
//             .eq("id", userData.user.id)
//             .then(() => { });
//         }
//       });
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 15000); // refresh every 15 seconds

//     return () => clearInterval(interval);
//   }, [isAvailable, dutyStartedAt, dutyLogsJson]);

//   useEffect(() => {
//     fetchSlides();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       const initScreen = async () => {
//         await fetchAssignedHubZone();
//         fetchCounts();
//         fetchAvailability();
//         loadNotifications();
//       };
//       initScreen();
//     }, []),
//   );

//   useEffect(() => {
//     const setupNotifications = async () => {
//       try {
//         await scheduleDailyDutyReminders();
//         const token = await registerForPushNotificationsAsync();

//         if (token) {
//           console.log("Push Token:", token);
//           const { data } = await supabase.auth.getUser();
//           const user = data.user;

//           if (user) {
//             await supabase
//               .from("staff_profile")
//               .update({ push_token: token })
//               .eq("id", user.id);

//             console.log("✅ Token saved to DB");
//           }
//         }
//       } catch (error) {
//         console.log("❌ Notification setup error:", error);
//       }
//     };

//     setupNotifications();
//   }, []);

//   /* ================= AUTO SCROLL ================= */
//   useEffect(() => {
//     if (slides.length === 0) return;

//     autoScrollRef.current = setInterval(() => {
//       const next = (activeSlide + 1) % slides.length;
//       sliderRef.current?.scrollToIndex({ index: next, animated: true });
//       setActiveSlide(next);
//     }, 3000);

//     return () => {
//       if (autoScrollRef.current) clearInterval(autoScrollRef.current);
//     };
//   }, [activeSlide, slides.length]);

//   const unreadCount = notifications.filter((item) => !item.is_read).length;

//   /* ================= UPDATE AVAILABILITY ================= */
//   const handleToggleAvailability = (value: boolean) => {
//     setTargetDutyValue(value);
//     setDutyModalVisible(true);
//   };

//   const proceedWithDutyActivation = async (userId: string) => {
//     // 2. Location services / GPS status check
//     const hasGps = await Location.hasServicesEnabledAsync();
//     if (!hasGps) {
//       Alert.alert(
//         "Location Services Disabled 🛰️",
//         "Mobile GPS/Location service is turned OFF. Please turn ON Location in your phone settings to go ON-DUTY.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Open Settings", onPress: () => Linking.openSettings() },
//         ],
//       );
//       return;
//     }

//     // 3. Keep loading while fetching position & checking zone boundary
//     setLocationLoading(true);

//     let initialLocStr = "";
//     let isOut = false;
//     try {
//       const initialPos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
//       initialLocStr = `${initialPos.coords.latitude}, ${initialPos.coords.longitude}`;

//       await fetchAssignedHubZone();
//       isOut = await checkZoneBoundary(initialPos.coords.latitude, initialPos.coords.longitude);
//     } catch (e) {
//       console.log("Error getting initial location:", e);
//     } finally {
//       setLocationLoading(false);
//     }

//     const nowStr = new Date().toISOString();
//     setIsAvailable(true);
//     setDutyStartedAt(nowStr);

//     const totals = calculateDutyTotals(dutyLogsJson, true, nowStr);

//     // Fetch current duty_sessions_json history
//     const { data: profile } = await supabase
//       .from("staff_profile")
//       .select("duty_sessions_json")
//       .eq("id", userId)
//       .maybeSingle();

//     const existingSessions: any[] = (profile?.duty_sessions_json as any[]) || [];
//     const newSession = {
//       id: `sess_${Date.now()}`,
//       date: dayjs().format("YYYY-MM-DD"),
//       on_at: nowStr,
//       off_at: null,
//       location: initialLocStr,
//       duration_minutes: null,
//     };

//     const updatedSessions = [...existingSessions, newSession];

//     await supabase
//       .from("staff_profile")
//       .update({
//         is_available: true,
//         is_out_of_zone: isOut,
//         duty_started_at: nowStr,
//         work_start_location: initialLocStr,
//         live_location: initialLocStr,
//         live_location_updated_at: nowStr,
//         duty_sessions_json: updatedSessions,
//       })
//       .eq("id", userId);

//     // Start live location updates every second
//     startLiveLocationTracking(userId);

//     setTodayDutyMinutes(totals.today);
//     setWeeklyDutyMinutes(totals.weekly);
//     setMonthlyDutyMinutes(totals.monthly);

//     // 🔥 Show Custom Pale Yellow Out of Bounds Pop-up Modal UI & Play Audio Alert
//     if (isOut) {
//       triggerOutOfBoundsPopUp();
//     }
//   };

//   const handleLocationDisclosureContinue = async () => {
//     setLocationDisclosureVisible(false);

//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData?.user) return;
//     const userId = userData.user.id;

//     // 1. Request Foreground Location Permission
//     const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
//     if (fgStatus !== "granted") {
//       Alert.alert(
//         "Location Permission Required 📍",
//         "Permission to access location was denied. Please grant location access in your device settings to go ON-DUTY.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Open Settings", onPress: () => Linking.openSettings() },
//         ]
//       );
//       return;
//     }

//     // 2. Request Background Location Permission (Mandatory for Google Play compliance)
//     const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
//     if (bgStatus !== "granted") {
//       Alert.alert(
//         "Background Location Permission Required 📍",
//         "Background location permission is required so Neatify can assign jobs and track duty status while on duty.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Open Settings", onPress: () => Linking.openSettings() },
//         ]
//       );
//       return;
//     }

//     await proceedWithDutyActivation(userId);
//   };

//   const handleLocationDisclosureCancel = () => {
//     setLocationDisclosureVisible(false);
//     setTargetDutyValue(null);
//   };

//   const confirmDutyChange = async () => {
//     if (targetDutyValue === null) return;
//     const value = targetDutyValue;
//     setDutyModalVisible(false);

//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData?.user) return;

//     const userId = userData.user.id;

//     if (value === true) {
//       // Check foreground & background location permissions before asking system dialog
//       const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
//       const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();

//       if (fgStatus !== "granted" || bgStatus !== "granted") {
//         // Prominent disclosure modal MUST be displayed prior to calling system permission APIs (Google Play Policy)
//         setLocationDisclosureVisible(true);
//         return;
//       }

//       await proceedWithDutyActivation(userId);
//     } else {
//       // Toggling OFF-DUTY
//       stopLiveLocationTracking();
//       setIsAvailable(false);
//       setIsOutOfZone(false);
//       setOutOfBoundsModalVisible(false);

//       const { data: profile } = await supabase
//         .from("staff_profile")
//         .select("duty_started_at, duty_logs_json, duty_sessions_json, today_duty_minutes, weekly_duty_minutes, monthly_duty_minutes")
//         .eq("id", userId)
//         .maybeSingle();

//       const activeStartedAt = profile?.duty_started_at || dutyStartedAt;
//       const nowStr = new Date().toISOString();
//       const existingLogs: Record<string, number> =
//         (profile?.duty_logs_json as Record<string, number>) || dutyLogsJson || {};

//       let updatedLogs = existingLogs;
//       let sessionMinutes = 0;
//       if (activeStartedAt) {
//         const start = dayjs(activeStartedAt);
//         const now = dayjs();
//         sessionMinutes = Math.max(0, now.diff(start, "minute"));
//         updatedLogs = splitAndAddSessionLogs(existingLogs, activeStartedAt, nowStr);
//       }

//       const existingSessions: any[] = (profile?.duty_sessions_json as any[]) || [];
//       let foundActive = false;
//       const updatedSessions = existingSessions.map((sess: any) => {
//         if (!sess.off_at) {
//           foundActive = true;
//           return {
//             ...sess,
//             off_at: nowStr,
//             duration_minutes: sessionMinutes,
//           };
//         }
//         return sess;
//       });

//       if (!foundActive && activeStartedAt) {
//         updatedSessions.push({
//           id: `sess_${Date.now()}`,
//           date: dayjs(activeStartedAt).format("YYYY-MM-DD"),
//           on_at: activeStartedAt,
//           off_at: nowStr,
//           location: null,
//           duration_minutes: sessionMinutes,
//         });
//       }

//       const totals = calculateDutyTotals(updatedLogs, false, null);

//       setDutyStartedAt(null);
//       setDutyLogsJson(updatedLogs);

//       setTodayDutyMinutes(totals.today);
//       setWeeklyDutyMinutes(totals.weekly);
//       setMonthlyDutyMinutes(totals.monthly);

//       await supabase
//         .from("staff_profile")
//         .update({
//           is_available: false,
//           is_out_of_zone: false,
//           work_start_location: null,
//           live_location: null,
//           live_location_updated_at: null,
//           duty_logs_json: updatedLogs,
//           duty_sessions_json: updatedSessions,
//           today_duty_minutes: String(totals.today),
//           weekly_duty_minutes: String(totals.weekly),
//           monthly_duty_minutes: String(totals.monthly),
//         })
//         .eq("id", userId);
//     }
//   };

//   const handleLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogoutAction = async () => {
//     setLoadingLogout(true);
//     try {
//       setIsAvailable(false);
//       await stopLiveLocationTracking();
//       const { data: userData } = await supabase.auth.getUser();
//       await turnOffDutyAndLogout(userData?.user?.id);
//       setShowLogoutModal(false);
//       router.replace("/login");
//     } catch (err) {
//       console.log("Logout error:", err);
//     } finally {
//       setLoadingLogout(false);
//     }
//   };

//   const handleCustomerCare = () => {
//     setCustomerCareModalVisible(true);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Image
//           source={require("../assets/images/logo.png")}
//           style={styles.logo}
//           contentFit="contain"
//         />

//         <View style={styles.headerRight}>
//           {/* CUSTOMER CARE CALL BUTTON */}
//           <TouchableOpacity onPress={handleCustomerCare} style={{ padding: 2 }}>
//             <Ionicons name="call" size={26} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.bellIcon}
//             onPress={() => router.push("/new-services")}
//           >
//             <Ionicons name="notifications" size={26} color="#000" />
//             {unreadCount > 0 && (
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{unreadCount}</Text>
//               </View>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setShowMenu(true)}>
//             <Ionicons name="person-circle-outline" size={34} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {/* DROPDOWN */}
//       {showMenu && (
//         <Pressable style={styles.overlay} onPress={() => setShowMenu(false)} />
//       )}
//       {showMenu && (
//         <View style={styles.menu}>
//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setShowMenu(false);
//               router.push("/my-account");
//             }}
//           >
//             <Text style={styles.menuText}>My Account</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setShowMenu(false);
//               handleLogout();
//             }}
//           >
//             <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={[{ key: "main" }]}
//         contentContainerStyle={{ paddingBottom: 120 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchCounts} />
//         }
//         renderItem={() => (
//           <View style={styles.container}>
//             <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//             {/* SLIDER */}
//             <View style={styles.sliderWrapper}>
//               <FlatList
//                 ref={sliderRef}
//                 data={slides}
//                 horizontal
//                 pagingEnabled
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={(_, i) => i.toString()}
//                 onMomentumScrollEnd={(e) =>
//                   setActiveSlide(
//                     Math.round(e.nativeEvent.contentOffset.x / width),
//                   )
//                 }
//                 renderItem={({ item }) => (
//                   <Image
//                     source={{ uri: item }}
//                     style={styles.slideImage}
//                     contentFit="cover"
//                     cachePolicy="disk" // 🔥 Enables disk caching
//                     transition={300} // Smooth fade effect
//                   />
//                 )}
//               />

//               <View style={styles.dots}>
//                 {slides.map((_, i) => (
//                   <View
//                     key={i}
//                     style={[styles.dot, activeSlide === i && styles.activeDot]}
//                   />
//                 ))}
//               </View>
//             </View>

//             {/* OUT OF BOUNDS WARNING BANNER ON HOME SCREEN */}
//             {isOutOfZone && (
//               <TouchableOpacity
//                 style={styles.outOfZoneBanner}
//                 onPress={() => {
//                   fetchAssignedHubZone();
//                   setZoneModalVisible(true);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="warning" size={24} color="#fff" />
//                 <View style={{ flex: 1, marginLeft: 10 }}>
//                   <Text style={styles.outOfZoneBannerTitle}>OUT OF BOUNDS ALERT! 🚨</Text>
//                   <Text style={styles.outOfZoneBannerSub}>
//                     Outside assigned zone ({assignedHubName}). Tap to view zone & navigate.
//                   </Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={20} color="#fff" />
//               </TouchableOpacity>
//             )}

//             {/*   TOGGLE */}
//             <View style={styles.availabilityWrapper}>
//               <Text style={styles.availabilityText}>GO ON-DUTY</Text>
//               <Switch
//                 value={isAvailable}
//                 onValueChange={handleToggleAvailability}
//                 trackColor={{ false: "#ede4e4", true: "#0fd357" }}
//               />
//             </View>

//             {/* WORKING HOURS SECTION HEADER */}
//             <View style={styles.sectionHeaderWrapper}>
//               <Text style={styles.sectionHeaderText}>Working Hours</Text>
//             </View>

//             {/* DUTY HOURS SUMMARY BOXES */}
//             <View style={styles.dutyHoursRow}>
//               {/* TODAY */}
//               <View style={styles.dutyHoursBox}>
//                 <Text style={styles.dutyHoursTitle}>Today</Text>
//                 <Text style={styles.dutyHoursValue}>
//                   {formatMinutesToHours(todayDutyMinutes)}
//                 </Text>
//               </View>

//               {/* WEEKLY */}
//               <View style={styles.dutyHoursBox}>
//                 <Text style={styles.dutyHoursTitle}>Weekly</Text>
//                 <Text style={styles.dutyHoursValue}>
//                   {formatMinutesToHours(weeklyDutyMinutes)}
//                 </Text>
//               </View>

//               {/* MONTHLY */}
//               <View style={styles.dutyHoursBox}>
//                 <Text style={styles.dutyHoursTitle}>Monthly</Text>
//                 <Text style={styles.dutyHoursValue}>
//                   {formatMinutesToHours(monthlyDutyMinutes)}
//                 </Text>
//               </View>
//             </View>

//             {/* ACTION BUTTONS */}
//             <View style={styles.actionWrapper}>
//               {/* Calendar FIRST (COMMENTED OUT)
//               <TouchableOpacity
//                 style={[styles.primaryBtn, styles.actionBtnRow]}
//                 onPress={() => router.push("./availability-calendar")}
//               >
//                 <Ionicons name="calendar-outline" size={18} color="#000" />
//                 <Text style={styles.primaryBtnText}>
//                   My Availability Calendar
//                 </Text>
//               </TouchableOpacity>
//               */}

//               {/* Assigned Services SECOND (COMMENTED OUT)
//               <TouchableOpacity
//                 style={styles.primaryBtn}
//                 onPress={() => router.push("/assigned-services")}
//               >
//                 <Text style={styles.primaryBtnText}>My Assigned Services</Text>
//               </TouchableOpacity>
//               */}
//             </View>

//             {/* SERVICE SUMMARY SECTION HEADER */}
//             <View style={styles.sectionHeaderWithSubRow}>
//               <Text style={styles.sectionHeaderText}>Service Summary</Text>
//               <Text style={styles.sectionSubHeaderText}>Tap box to view</Text>
//             </View>

//             {/* SUMMARY */}
//             <View style={styles.summaryRow}>
//               {/* PENDING (COMMENTED OUT)
//               <TouchableOpacity
//                 style={[styles.summaryBox, { borderColor: "#facc15" }]}
//                 onPress={() => router.push("/pending-services")}
//               >
//                 <Text style={styles.summaryTitle}>Pending</Text>
//                 <Text style={[styles.summaryCount, { color: "#facc15" }]}>
//                   {pendingCount}
//                 </Text>
//               </TouchableOpacity>
//               */}

//               {/* ASSIGNED */}
//               <TouchableOpacity
//                 style={[styles.summaryBox, styles.assignedBox]}
//                 onPress={() => router.push("/assigned-services")}
//               >
//                 <Text style={styles.summaryTitle}>Assigned</Text>
//                 <Text style={[styles.summaryCount, { color: "#f97316" }]}>
//                   {assignedCount}
//                 </Text>
//               </TouchableOpacity>

//               {/* COMPLETED */}
//               <TouchableOpacity
//                 style={[styles.summaryBox, styles.completedBox]}
//                 onPress={() => router.push("/dashboard")}
//               >
//                 <Text style={styles.summaryTitle}>Completed</Text>
//                 <Text style={[styles.summaryCount, { color: "#16a34a" }]}>
//                   {completedCount}
//                 </Text>
//               </TouchableOpacity>

//               {/* CANCELLED */}
//               <TouchableOpacity
//                 style={[styles.summaryBox, styles.cancelledBox]}
//                 onPress={() => router.push("/cancellations")}
//               >
//                 <Text style={styles.summaryTitle}>Cancelled</Text>
//                 <Text style={[styles.summaryCount, { color: "#ef4444" }]}>
//                   {cancelledCount}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//       {/* FOOTER (FIXED)
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.push("/my-role")}
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
//           onPress={() => router.push("/dashboard")}
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
//           onPress={() => router.push("/my-account")}
//         >
//           <Ionicons
//             name={pathname === "/my-account" ? "person" : "person-outline"}
//             size={22}
//             color="#000"
//           />
//           <Text
//             style={
//               pathname === "/my-account"
//               <TouchableOpacity
//                 style={styles.footerItem}
//                 onPress={() => router.push("/my-account")}
//               >
//                 <Ionicons
//                   name={pathname === "/my-account" ? "person" : "person-outline"}
//                   size={22}
//                   color="#000"
//                 />
//                 <Text
//                   style={
//                     pathname === "/my-account"
//                       ? styles.footerTextActive
//                       : styles.footerText
//                   }
//                 >
//                   Profile
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />

//       {/* CUSTOM DUTY MODAL */}
//       <Modal visible={dutyModalVisible} transparent animationType="fade">
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons
//                 name={targetDutyValue ? "power" : "power-outline"}
//                 size={30}
//                 color={targetDutyValue ? "#16a34a" : "#dc2626"}
//               />
//             </View>

//             <Text style={styles.dutyModalTitle}>
//               {targetDutyValue ? "Go ON-DUTY?" : "Go OFF-DUTY?"}
//             </Text>
//             <Text style={styles.dutyModalMessage}>
//               {targetDutyValue
//                 ? "Are you sure you want to go ON-DUTY?"
//                 : "Are you sure you want to go OFF-DUTY?"}
//             </Text>

//             <View style={styles.dutyButtonRow}>
//               <TouchableOpacity
//                 style={styles.dutyCancelBtn}
//                 onPress={() => setDutyModalVisible(false)}
//               >
//                 <Text style={styles.dutyCancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dutyConfirmBtn}
//                 onPress={confirmDutyChange}
//               >
//                 <Text style={styles.dutyConfirmText}>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* CUSTOM CUSTOMER CARE MODAL */}
//       <Modal visible={customerCareModalVisible} transparent animationType="fade">
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons name="headset" size={30} color="#000" />
//             </View>

//             <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
//             <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

//             <View style={styles.dutyButtonRow}>
//               <TouchableOpacity
//                 style={styles.dutyCancelBtn}
//                 onPress={() => setCustomerCareModalVisible(false)}
//               >
//                 <Text style={styles.dutyCancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dutyConfirmBtn}
//                 onPress={() => {
//                   setCustomerCareModalVisible(false);
//                   Linking.openURL("tel:+917617618567");
//                 }}
//               >
//                 <Text style={styles.dutyConfirmText}>Call</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* LOCATION LOADING MODAL OVERLAY */}
//       <Modal visible={locationLoading} transparent animationType="fade">
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <ActivityIndicator size="large" color="#FFD700" style={{ marginBottom: 16 }} />
//             <Text style={styles.dutyModalTitle}>Fetching Location... 📍</Text>
//             <Text style={styles.dutyModalMessage}>
//               Getting your live GPS location and verifying your assigned zone boundary...
//             </Text>
//           </View>
//         </View>
//       </Modal>

//       {/* CUSTOM PALE-YELLOW ROUNDED OUT OF BOUNDS POPUP MODAL */}
//       <Modal
//         visible={outOfBoundsModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setOutOfBoundsModalVisible(false)}
//       >
//         <View style={styles.boundsModalOverlay}>
//           <View style={styles.boundsModalCard}>
//             <View style={styles.boundsIconCircle}>
//               <Ionicons name="warning" size={32} color="#D97706" />
//             </View>

//             <Text style={styles.boundsModalTitle}>Out of Bounds Alert! 🚨</Text>
//             <Text style={styles.boundsModalMessage}>
//               You are currently outside your assigned zone ({assignedHubName || "Assigned Zone"}).
//               Please move inside your zone to receive and complete customer bookings.
//             </Text>

//             <View style={styles.boundsButtonColumn}>
//               <TouchableOpacity
//                 style={styles.boundsPrimaryBtn}
//                 onPress={() => {
//                   setOutOfBoundsModalVisible(false);
//                   router.push("/zone-map" as any);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="map-outline" size={20} color="#000" />
//                 <Text style={styles.boundsPrimaryBtnText}>View Zone Map 📍</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.boundsDismissBtn}
//                 onPress={() => setOutOfBoundsModalVisible(false)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.boundsDismissText}>Dismiss</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* PROMINENT LOCATION DISCLOSURE MODAL FOR GOOGLE PLAY COMPLIANCE */}
//       <LocationDisclosureModal
//         visible={locationDisclosureVisible}
//         onContinue={handleLocationDisclosureContinue}
//         onCancel={handleLocationDisclosureCancel}
//       />

//       {/* DRAGGABLE FLOATING ROUND CIRCULAR ZONE MAP BUTTON */}
//       <Animated.View
//         style={[
//           styles.draggableContainer,
//           {
//             transform: [{ translateX: pan.x }, { translateY: pan.y }],
//           },
//         ]}
//         {...panResponder.panHandlers}
//       >
//         <TouchableOpacity
//           style={[
//             styles.floatingZoneBtn,
//             { backgroundColor: isOutOfZone ? "#ef4444" : "#16a34a" },
//           ]}
//           onPress={() => {
//             router.push("/zone-map" as any);
//           }}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="map" size={24} color="#ffffff" />
//           <Text style={styles.floatingBtnText}>
//             {isOutOfZone ? "OUT OF BOUNDS" : "IN ZONE"}
//           </Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* ZONE MAP OVERLAY MODAL */}
//       <Modal visible={zoneModalVisible} animationType="slide" transparent={false}>
//         <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//           {/* HEADER */}
//           <View style={styles.zoneModalHeader}>
//             <TouchableOpacity
//               style={styles.zoneBackBtn}
//               onPress={() => setZoneModalVisible(false)}
//             >
//               <Ionicons name="arrow-back" size={24} color="#000" />
//             </TouchableOpacity>
//             <View style={{ flex: 1, marginLeft: 12 }}>
//               <Text style={styles.zoneModalHeaderTitle}>
//                 My Zone: {assignedHubName}
//               </Text>
//               <Text style={styles.zoneModalHeaderSub} numberOfLines={1}>
//                 {assignedLocationsStr || "Fetching assigned hub..."}
//               </Text>
//             </View>
//             <View
//               style={[
//                 styles.zoneHeaderStatusPill,
//                 { backgroundColor: isOutOfZone ? "#fee2e2" : "#dcfce7" },
//               ]}
//             >
//               <Text
//                 style={{
//                   color: isOutOfZone ? "#dc2626" : "#16a34a",
//                   fontWeight: "800",
//                   fontSize: 12,
//                 }}
//               >
//                 {isOutOfZone ? "🔴 OUT OF ZONE" : "🟢 IN ZONE"}
//               </Text>
//             </View>
//           </View>

//           {/* MAP VIEW */}
//           <View style={{ flex: 1 }}>
//             <MapView
//               style={{ flex: 1 }}
//               initialRegion={{
//                 latitude: (currentCoords && typeof currentCoords.latitude === "number" && Number.isFinite(currentCoords.latitude)) ? currentCoords.latitude : (assignedHubCoords && typeof assignedHubCoords.latitude === "number" && Number.isFinite(assignedHubCoords.latitude)) ? assignedHubCoords.latitude : 17.4851,
//                 longitude: (currentCoords && typeof currentCoords.longitude === "number" && Number.isFinite(currentCoords.longitude)) ? currentCoords.longitude : (assignedHubCoords && typeof assignedHubCoords.longitude === "number" && Number.isFinite(assignedHubCoords.longitude)) ? assignedHubCoords.longitude : 78.3240,
//                 latitudeDelta: 0.05,
//                 longitudeDelta: 0.05,
//               }}
//             >
//               {/* BLUE DOTTED LINE CONNECTING OUT-OF-ZONE STAFF TO WORK ZONE */}
//               {isOutOfZone && currentCoords && typeof currentCoords.latitude === "number" && Number.isFinite(currentCoords.latitude) && typeof currentCoords.longitude === "number" && Number.isFinite(currentCoords.longitude) && assignedHubCoords && typeof assignedHubCoords.latitude === "number" && Number.isFinite(assignedHubCoords.latitude) && typeof assignedHubCoords.longitude === "number" && Number.isFinite(assignedHubCoords.longitude) && (
//                 <Polyline
//                   coordinates={[
//                     { latitude: currentCoords.latitude, longitude: currentCoords.longitude },
//                     { latitude: assignedHubCoords.latitude, longitude: assignedHubCoords.longitude },
//                   ]}
//                   strokeColor="#0284c7"
//                   strokeWidth={4}
//                   lineDashPattern={[8, 8]}
//                 />
//               )}

//               {/* LIVE LOCATION MARKER */}
//               {currentCoords && typeof currentCoords.latitude === "number" && Number.isFinite(currentCoords.latitude) && typeof currentCoords.longitude === "number" && Number.isFinite(currentCoords.longitude) && (
//                 <Marker
//                   coordinate={{
//                     latitude: currentCoords.latitude,
//                     longitude: currentCoords.longitude,
//                   }}
//                   title="My Live Location"
//                   description={currentAreaName || "Your current position"}
//                 />
//               )}

//               {/* INDIVIDUAL PINCODE BOUNDARY POLYGONS (CLEAN, NO CLUTTERED ICONS) */}
//               {(() => {
//                 let allPincodeBoundaryPoints: Array<{ latitude: number; longitude: number }> = [];

//                 const pincodeElements = hubSubLocations.map((sub, idx) => {
//                   if (!sub.latitude || !sub.longitude || !Number.isFinite(sub.latitude) || !Number.isFinite(sub.longitude)) return null;

//                   const pincodePolyCoords = generatePincodeBoundaryPoints(
//                     sub.latitude,
//                     sub.longitude,
//                     1.2
//                   );

//                   const validPolyCoords = pincodePolyCoords.filter(
//                     (pt) => pt && typeof pt.latitude === "number" && Number.isFinite(pt.latitude) && typeof pt.longitude === "number" && Number.isFinite(pt.longitude)
//                   );

//                   if (validPolyCoords.length < 3) return null;

//                   allPincodeBoundaryPoints = allPincodeBoundaryPoints.concat(validPolyCoords);

//                   return (
//                     <Polygon
//                       key={`sub-poly-${idx}`}
//                       coordinates={validPolyCoords}
//                       strokeColor="#0284c7"
//                       strokeWidth={2}
//                       fillColor="rgba(2, 132, 199, 0.22)"
//                       tappable={true}
//                       onPress={() => {
//                         setSelectedPincodeInfo(
//                           `${sub.location_name}${sub.pincode ? " (" + sub.pincode + ")" : ""}`
//                         );
//                       }}
//                     />
//                   );
//                 });

//                 // Compute Master Outer Hub Boundary Polygon connecting ONLY existing pincodes
//                 const masterHubHullCoords = getConvexHullCoordinates(allPincodeBoundaryPoints);
//                 const validHullCoords = masterHubHullCoords.filter(
//                   (pt) => pt && typeof pt.latitude === "number" && Number.isFinite(pt.latitude) && typeof pt.longitude === "number" && Number.isFinite(pt.longitude)
//                 );

//                 return (
//                   <>
//                     {/* MASTER HUB OUTER BOUNDARY POLYGON */}
//                     {validHullCoords.length >= 3 && (
//                       <Polygon
//                         coordinates={validHullCoords}
//                         strokeColor="#FFD700"
//                         strokeWidth={4}
//                         fillColor="rgba(255, 215, 0, 0.16)"
//                         tappable={true}
//                         onPress={() => {
//                           setSelectedPincodeInfo(`Hub Zone: ${assignedHubName}`);
//                         }}
//                       />
//                     )}

//                     {/* INDIVIDUAL PINCODE POLYGONS */}
//                     {pincodeElements}
//                   </>
//                 );
//               })()}
//             </MapView>

//             {/* FLOATING INTERACTIVE PINCODE / LOCATION CALLOUT BANNER */}
//             {selectedPincodeInfo && (
//               <View style={styles.pincodeInfoCallout}>
//                 <Ionicons name="location-sharp" size={18} color="#0284c7" />
//                 <Text style={styles.pincodeInfoCalloutText}>
//                   {selectedPincodeInfo}
//                 </Text>
//                 <TouchableOpacity onPress={() => setSelectedPincodeInfo(null)} style={{ marginLeft: 6 }}>
//                   <Ionicons name="close-circle" size={20} color="#64748b" />
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* OUT OF ZONE ALERT BANNER */}
//             {isOutOfZone && (
//               <View style={styles.zoneAlertBanner}>
//                 <Ionicons name="warning" size={24} color="#dc2626" />
//                 <View style={{ flex: 1, marginLeft: 8 }}>
//                   <Text style={styles.zoneAlertBannerTitle}>
//                     Zone Boundary Crossed!
//                   </Text>
//                   <Text style={styles.zoneAlertBannerMessage}>
//                     You are outside your assigned hub zone ({assignedHubName}).
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {/* RAPIDO-STYLE BOTTOM CARD */}
//             <View style={styles.zoneBottomCard}>
//               <View style={{ marginBottom: 8 }}>
//                 <Text style={styles.zoneCardLabel}>ASSIGNED SERVICE ZONE & PINCODES</Text>
//                 <Text style={styles.zoneCardHubName}>{assignedHubName}</Text>
//                 <ScrollView
//                   style={styles.pincodesScrollView}
//                   nestedScrollEnabled={true}
//                   showsVerticalScrollIndicator={true}
//                 >
//                   <Text style={styles.zoneCardLocations}>
//                     {hubSubLocations.length > 0
//                       ? hubSubLocations
//                         .map(
//                           (item) =>
//                             `${item.location_name}${item.pincode ? " (" + item.pincode + ")" : ""
//                             }`
//                         )
//                         .join(" • ")
//                       : assignedLocationsStr || "Hub Area: " + assignedHubName}
//                   </Text>
//                 </ScrollView>
//               </View>

//               {/* RAPIDO-STYLE JOIN WORK ZONE & NAVIGATE BUTTON */}
//               <TouchableOpacity
//                 style={styles.navigateBtn}
//                 onPress={handleNavigateToZone}
//               >
//                 <Ionicons name="navigate-sharp" size={20} color="#000000" />
//                 <Text style={styles.navigateBtnText}>
//                   Join Work Zone & Navigate
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* ================= CUSTOM LOGOUT MODAL ================= */}
//       <Modal
//         visible={showLogoutModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowLogoutModal(false)}
//       >
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.iconCircleRedCenter}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>
//             <Text style={styles.dutyModalTitle}>Confirm Logout</Text>
//             <Text style={styles.dutyModalMessage}>
//               Do you want to logout?
//             </Text>

//             <View style={styles.modalInfoBoxRed}>
//               <Text style={styles.modalInfoBoxTextRed}>
//                 ⚠️ You will be signed out of your account. You will need to log
//                 in again to access your partner dashboard.
//               </Text>
//             </View>

//             <View style={styles.dutyButtonRow}>
//               <TouchableOpacity
//                 style={styles.dutyCancelBtn}
//                 onPress={() => setShowLogoutModal(false)}
//               >
//                 <Text style={styles.dutyCancelText}>No, Go Back</Text>
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
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff" },
//   header: {
//     height: 72,
//     paddingHorizontal: 20,
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
//   logo: { width: 190, height: 64 },
//   bellIcon: { position: "relative" },
//   badge: {
//     position: "absolute",
//     top: -6,
//     right: -10,
//     backgroundColor: "#000",
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badgeText: { color: "#FFD700", fontWeight: "800", fontSize: 12 },

//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 10,
//   },

//   menu: {
//     position: "absolute",
//     top: 72,
//     right: 20,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     elevation: 6,
//     width: 150,
//     zIndex: 20,
//   },

//   menuItem: { padding: 14 },

//   menuText: { fontSize: 15, fontWeight: "600" },

//   sliderWrapper: {
//     height: SLIDER_HEIGHT,
//     marginHorizontal: 16,
//     marginTop: 10,
//     marginBottom: 8,
//     borderRadius: 18,
//     overflow: "hidden",
//   },
//   slideImage: { width: width - 32, height: SLIDER_HEIGHT },

//   summaryRow: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     gap: 8,
//     marginTop: 6,
//   },
//   summaryBox: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 6, // 🔽 reduce a bit
//     alignItems: "center",
//     backgroundColor: "#f9fafb",
//     borderWidth: 1,
//   },
//   pendingBox: {
//     borderColor: "#facc15",
//   },
//   assignedBox: { borderColor: "#f97316" },
//   completedBox: { borderColor: "#16a34a" },
//   cancelledBox: { borderColor: "#ef4444" },
//   summaryTitle: { fontWeight: "600", marginBottom: 6, fontSize: 13 },
//   summaryCount: { fontSize: 18, fontWeight: "800" },

//   availabilityWrapper: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 4,
//     marginBottom: 4,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 14,
//     backgroundColor: "#f9fafb",
//     borderWidth: 1,
//     borderColor: "#dae90b",
//   },

//   availabilityText: { fontSize: 16, fontWeight: "700" },

//   customerCareWrapper: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//   },

//   customerCareBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center", // center it nicely
//     gap: 8,
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#000",
//     backgroundColor: "#fff",
//   },

//   customerCareText: { fontSize: 14, fontWeight: "800" },

//   fixedButtonWrapper: {
//     paddingHorizontal: 40,
//     paddingBottom: 10,
//     backgroundColor: "#fff",
//   },
//   primaryBtn: {
//     backgroundColor: "#FFD700",
//     paddingVertical: 14,
//     borderRadius: 18,
//     alignItems: "center",
//   },
//   primaryBtnText: { fontWeight: "800", fontSize: 16 },

//   // footer: {
//   //   height: 70,
//   //   backgroundColor: "#ffffff",
//   //   flexDirection: "row",
//   //   justifyContent: "space-around",
//   //   alignItems: "center",
//   // },
//   // footerItem: { alignItems: "center" },
//   // footerText: { fontSize: 12, marginTop: 4, fontWeight: "600" },
//   // footerTextActive: { fontSize: 12, marginTop: 4, fontWeight: "800" },

//   dots: {
//     position: "absolute",
//     bottom: 10,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "center",
//   },

//   dot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: "#ccc",
//     marginHorizontal: 4,
//   },

//   actionWrapper: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     gap: 10,
//   },

//   actionBtnRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },

//   activeDot: {
//     backgroundColor: "#000",
//   },

//   dutyModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dutyModalCard: {
//     width: "85%",
//     backgroundColor: "#FFFBEB",
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
//     fontSize: 15,
//     color: "#4B5563",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 22,
//     fontWeight: "500",
//   },
//   dutyButtonRow: {
//     flexDirection: "row",
//     marginTop: 22,
//     gap: 12,
//     width: "100%",
//   },
//   dutyCancelBtn: {
//     flex: 1,
//     backgroundColor: "#E5E7EB",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   dutyCancelText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   dutyConfirmBtn: {
//     flex: 1,
//     backgroundColor: "#FFD700",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   dutyConfirmText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   sectionHeaderWrapper: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   sectionHeaderWithSubRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 14,
//     marginBottom: 4,
//   },
//   sectionHeaderText: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   sectionSubHeaderText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#6b7280",
//   },
//   dutyHoursRow: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     gap: 8,
//     marginTop: 4,
//     marginBottom: 6,
//   },
//   dutyHoursBox: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 6,
//     alignItems: "center",
//     backgroundColor: "#FFFBEB",
//     borderWidth: 1.5,
//     borderColor: "#FFD700",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dutyHoursTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#4b5563",
//     marginBottom: 4,
//   },
//   dutyHoursValue: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#111827",
//   },

//   /* DRAGGABLE & FLOATING ZONE BUTTON STYLES */
//   draggableContainer: {
//     position: "absolute",
//     bottom: 24,
//     right: 20,
//     zIndex: 999,
//     elevation: 10,
//   },
//   floatingZoneBtn: {
//     width: 66,
//     height: 66,
//     borderRadius: 33,
//     borderWidth: 2,
//     borderColor: "#ffffff",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 4,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//   },
//   floatingBtnText: {
//     color: "#ffffff",
//     fontSize: 9,
//     fontWeight: "900",
//     textAlign: "center",
//     marginTop: 2,
//   },
//   zoneStatusBadge: {
//     position: "absolute",
//     top: 2,
//     right: 2,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: "#ffffff",
//   },
//   zoneModalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   zoneBackBtn: {
//     padding: 6,
//     borderRadius: 20,
//     backgroundColor: "#f3f4f6",
//   },
//   zoneModalHeaderTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   zoneModalHeaderSub: {
//     fontSize: 12,
//     color: "#6b7280",
//     fontWeight: "500",
//     marginTop: 1,
//   },
//   zoneHeaderStatusPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   zoneAlertBanner: {
//     position: "absolute",
//     top: 10,
//     left: 16,
//     right: 16,
//     backgroundColor: "#fef2f2",
//     borderWidth: 1.5,
//     borderColor: "#ef4444",
//     borderRadius: 14,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//   },
//   zoneAlertBannerTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: "#991b1b",
//   },
//   zoneAlertBannerMessage: {
//     fontSize: 12,
//     color: "#7f1d1d",
//     marginTop: 2,
//     fontWeight: "500",
//   },
//   zoneBottomCard: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#ffffff",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 28,
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//   },
//   zoneCardLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#6b7280",
//     letterSpacing: 0.5,
//   },
//   zoneCardHubName: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#111827",
//     marginTop: 2,
//   },
//   pincodesScrollView: {
//     maxHeight: 56,
//     marginVertical: 4,
//   },
//   zoneCardLocations: {
//     fontSize: 13,
//     color: "#4b5563",
//     lineHeight: 18,
//   },
//   navigateBtn: {
//     backgroundColor: "#FFD700",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 14,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: "#000000",
//   },
//   navigateBtnText: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#000000",
//   },

//   pincodeInfoCallout: {
//     position: "absolute",
//     top: 14,
//     alignSelf: "center",
//     backgroundColor: "#ffffff",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     borderWidth: 1.5,
//     borderColor: "#0284c7",
//     zIndex: 999,
//   },
//   pincodeInfoCalloutText: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: "#0f172a",
//   },

//   /* RAPIDO-STYLE BADGE STYLES */
//   rapidoPillBadge: {
//     backgroundColor: "#0f172a",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   rapidoPillText: {
//     color: "#ffffff",
//     fontSize: 11,
//     fontWeight: "800",
//   },
//   masterHubPillBadge: {
//     backgroundColor: "#FFD700",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: "#000000",
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   masterHubPillText: {
//     color: "#000000",
//     fontSize: 12,
//     fontWeight: "900",
//   },
//   outOfZoneBanner: {
//     backgroundColor: "#ef4444",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 4,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   outOfZoneBannerTitle: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },
//   outOfZoneBannerSub: {
//     color: "#ffffff",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   /* CUSTOM PALE-YELLOW ROUNDED OUT OF BOUNDS MODAL STYLES */
//   boundsModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.55)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   boundsModalCard: {
//     width: "100%",
//     backgroundColor: "#FFFBEB", // Pale Yellow background
//     borderRadius: 24, // Rounded corner radius
//     borderWidth: 1.5,
//     borderColor: "#FCD34D", // Soft gold border
//     padding: 24,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   boundsIconCircle: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#FEF3C7", // Pale yellow icon background
//     borderWidth: 2,
//     borderColor: "#F59E0B",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   boundsModalTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#78350F",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   boundsModalMessage: {
//     fontSize: 14,
//     color: "#92400E",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//     paddingHorizontal: 8,
//   },
//   boundsButtonColumn: {
//     width: "100%",
//     gap: 10,
//   },
//   boundsPrimaryBtn: {
//     backgroundColor: "#FFD700", // Filled clickable gold button
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 14,
//     gap: 8,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   boundsPrimaryBtnText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },
//   boundsSecondaryBtn: {
//     backgroundColor: "#1E293B", // Filled clickable slate button
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 14,
//     gap: 8,
//     elevation: 3,
//   },
//   boundsSecondaryBtnText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   boundsDismissBtn: {
//     paddingVertical: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 2,
//   },
//   boundsDismissText: {
//     color: "#78350F",
//     fontWeight: "600",
//     fontSize: 14,
//     textDecorationLine: "underline",
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
//   modalInfoBoxRed: {
//     width: "100%",
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 14,
//     padding: 14,
//     marginTop: 14,
//   },
//   modalInfoBoxTextRed: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },
//   modalDangerBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalDangerBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 15,
//   },
// });























// import { Ionicons } from "@expo/vector-icons";
// import dayjs from "dayjs";
// import { Audio } from "expo-av";
// import { Image } from "expo-image";
// import * as Location from "expo-location";
// import { router, useFocusEffect, usePathname } from "expo-router";
// import * as TaskManager from "expo-task-manager";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   BackHandler,
//   Dimensions,
//   FlatList,
//   Linking,
//   Modal,
//   PanResponder,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   Vibration,
//   View,
// } from "react-native";
// import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
// import { SafeAreaView } from "react-native-safe-area-context";
// import LocationDisclosureModal from "../components/LocationDisclosureModal";
// import { scheduleDailyDutyReminders } from "../lib/dutyReminders";
// import { LOCATION_TASK_NAME } from "../lib/locationTask";
// import { turnOffDutyAndLogout } from "../lib/logout";
// import { supabase } from "../lib/supabase";
// import { authApi, partnerApi } from "../lib/api";
// import { registerForPushNotificationsAsync } from "./notifications";

// const { height, width } = Dimensions.get("window");
// const SLIDER_HEIGHT = height * 0.42;

// export default function MyRoleScreen() {
//   const pathname = usePathname();

//   const [newCount, setNewCount] = useState(0);
//   // const [pendingCount, setPendingCount] = useState(0);
//   const [assignedCount, setAssignedCount] = useState(0);
//   const [completedCount, setCompletedCount] = useState(0);
//   const [cancelledCount, setCancelledCount] = useState(0);
//   const [activeSlide, setActiveSlide] = useState(0);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [slides, setSlides] = useState<string[]>([]);
//   const [isAvailable, setIsAvailable] = useState(false);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [dutyModalVisible, setDutyModalVisible] = useState(false);
//   const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);
//   const [targetDutyValue, setTargetDutyValue] = useState<boolean | null>(null);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [locationDisclosureVisible, setLocationDisclosureVisible] = useState(false);
//   const [outOfBoundsModalVisible, setOutOfBoundsModalVisible] = useState(false);
//   const [todayDutyMinutes, setTodayDutyMinutes] = useState(0);
//   const [weeklyDutyMinutes, setWeeklyDutyMinutes] = useState(0);
//   const [monthlyDutyMinutes, setMonthlyDutyMinutes] = useState(0);
//   const [dutyStartedAt, setDutyStartedAt] = useState<string | null>(null);
//   const [dutyLogsJson, setDutyLogsJson] = useState<Record<string, number>>({});
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [loadingLogout, setLoadingLogout] = useState(false);

//   const dbTodayMinsRef = useRef<number>(0);
//   const dbWeeklyMinsRef = useRef<number>(0);
//   const dbMonthlyMinsRef = useRef<number>(0);

//   /* AUDIO & VIBRATION ALERT FOR OUT OF BOUNDS (PLAY TWICE) */
//   const playAlertSound = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         playsInSilentModeIOS: true,
//         shouldDuckAndroid: true,
//         staysActiveInBackground: false,
//       });

//       const { sound } = await Audio.Sound.createAsync(
//         require("../assets/images/zone_alert.wav")
//       );

//       let playCount = 0;
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish && !status.isLooping) {
//           playCount += 1;
//           if (playCount < 2) {
//             sound.replayAsync();
//           } else {
//             sound.unloadAsync();
//           }
//         }
//       });

//       await sound.playAsync();
//       Vibration.vibrate([0, 400, 150, 400, 150, 400]);
//     } catch (error) {
//       console.log("❌ Alert sound error:", error);
//     }
//   };

//   const triggerOutOfBoundsPopUp = () => {
//     setOutOfBoundsModalVisible(true);
//     playAlertSound();
//   };

//   const hasAlertedOutOfBoundsRef = useRef(false);

//   /* ZONE MAP & GEOFENCING STATES */
//   const [zoneModalVisible, setZoneModalVisible] = useState(false);
//   const [isOutOfZone, setIsOutOfZone] = useState(false);
//   const [assignedHubName, setAssignedHubName] = useState<string>("Assigned Zone");
//   const [assignedLocationsStr, setAssignedLocationsStr] = useState<string>("");
//   const [assignedHubCoords, setAssignedHubCoords] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [assignedPincodes, setAssignedPincodes] = useState<string[]>([]);
//   const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [currentAreaName, setCurrentAreaName] = useState<string>("");
//   const [selectedPincodeInfo, setSelectedPincodeInfo] = useState<string | null>(null);

//   interface HubSubLocation {
//     location_name: string;
//     pincode: string;
//     latitude?: number;
//     longitude?: number;
//   }

//   const [hubSubLocations, setHubSubLocations] = useState<HubSubLocation[]>([]);
//   const isZoneDataLoadedRef = useRef(false);

//   const SUB_LOCATION_COORDS_MAP: Record<string, { latitude: number; longitude: number }> = {
//     nallagandla: { latitude: 17.4727, longitude: 78.3183 },
//     tellapur: { latitude: 17.4608, longitude: 78.2831 },
//     gopanpally: { latitude: 17.4475, longitude: 78.3072 },
//     "osman nagar": { latitude: 17.4321, longitude: 78.2912 },
//     lingampally: { latitude: 17.4828, longitude: 78.3195 },
//     bhel: { latitude: 17.4932, longitude: 78.2985 },
//     kollur: { latitude: 17.4435, longitude: 78.2256 },
//     serilingampalle: { latitude: 17.4851, longitude: 78.3240 },
//     kondapur: { latitude: 17.4622, longitude: 78.3568 },
//     gachibowli: { latitude: 17.4401, longitude: 78.3489 },
//     miyapur: { latitude: 17.4968, longitude: 78.3614 },
//     kukatpally: { latitude: 17.4849, longitude: 78.4138 },
//     madhapur: { latitude: 17.4483, longitude: 78.3915 },
//     hitech: { latitude: 17.4435, longitude: 78.3772 },
//     chandanagar: { latitude: 17.4921, longitude: 78.3302 },
//   };

//   const HYDERABAD_HUBS: Record<string, { latitude: number; longitude: number }> = {
//     "pragathi nagar": { latitude: 17.5255, longitude: 78.397 },
//     "kukatpally": { latitude: 17.4947, longitude: 78.3996 },
//     "miyapur": { latitude: 17.4968, longitude: 78.3614 },
//     "gachibowli": { latitude: 17.4401, longitude: 78.3489 },
//     "madhapur": { latitude: 17.4483, longitude: 78.3915 },
//     "kondapur": { latitude: 17.4617, longitude: 78.3673 },
//     "uppal": { latitude: 17.4056, longitude: 78.5581 },
//     "mani konda": { latitude: 17.3982, longitude: 78.3844 },
//     "nallagandla": { latitude: 17.4727, longitude: 78.3183 },
//   };

//   /* ================= FETCH ASSIGNED ZONE & HUB ================= */
//   const fetchAssignedHubZone = async () => {
//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData?.user?.email) return;

//     const email = userData.user.email.toLowerCase().trim();

//     try {
//       const { data: hubs } = await supabase
//         .from("hub_category_counts")
//         .select("hub, location, category, assigned_staff");

//       if (hubs && hubs.length > 0) {
//         const match = hubs.find((item) =>
//           item.assigned_staff?.toLowerCase().includes(email)
//         );

//         if (match) {
//           const hubName = match.hub || "Assigned Zone";
//           const locsFromCat = match.location || "";
//           setAssignedHubName(hubName);

//           const { data: hubLocRows } = await supabase
//             .from("hub_locations")
//             .select("location_name, pincode")
//             .eq("hub_name", hubName);
//           let locNames: string[] = [];
//           let pincodesList: string[] = [];
//           let rawSubLocs: Array<{ location_name: string; pincode: string }> = [];

//           if (hubLocRows && hubLocRows.length > 0) {
//             for (const r of hubLocRows) {
//               const locName = (r.location_name || "").trim();
//               const pin = String(r.pincode || "").trim();
//               if (locName) locNames.push(locName);
//               if (pin) pincodesList.push(pin);
//               rawSubLocs.push({ location_name: locName, pincode: pin });
//             }
//           }

//           const subLocs: HubSubLocation[] = await Promise.all(
//             rawSubLocs.map(async (sub) => {
//               let subLat: number | undefined;
//               let subLng: number | undefined;
//               try {
//                 const geo = await Promise.race([
//                   Location.geocodeAsync(`${sub.location_name}, ${sub.pincode || ""}, Telangana, India`),
//                   new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
//                 ]);
//                 if (geo && geo.length > 0 && typeof geo[0].latitude === "number" && Number.isFinite(geo[0].latitude) && typeof geo[0].longitude === "number" && Number.isFinite(geo[0].longitude)) {
//                   subLat = geo[0].latitude;
//                   subLng = geo[0].longitude;
//                 }
//               } catch (e) { }

//               return {
//                 location_name: sub.location_name,
//                 pincode: sub.pincode,
//                 latitude: subLat,
//                 longitude: subLng,
//               };
//             })
//           );

//           if (locNames.length > 0) {
//             const formattedLocsWithPins = subLocs
//               .map((s) => (s.pincode ? `${s.location_name} (${s.pincode})` : s.location_name))
//               .join(" • ");
//             setAssignedLocationsStr(formattedLocsWithPins);
//           } else {
//             setAssignedLocationsStr(locsFromCat);
//           }

//           setAssignedPincodes(pincodesList);
//           setHubSubLocations(subLocs);

//           const validSubCoords = subLocs.filter(
//             (s) => typeof s.latitude === "number" && Number.isFinite(s.latitude) && typeof s.longitude === "number" && Number.isFinite(s.longitude)
//           );

//           if (validSubCoords.length > 0) {
//             const sumLat = validSubCoords.reduce((acc, curr) => acc + (curr.latitude || 0), 0);
//             const sumLng = validSubCoords.reduce((acc, curr) => acc + (curr.longitude || 0), 0);
//             setAssignedHubCoords({
//               latitude: sumLat / validSubCoords.length,
//               longitude: sumLng / validSubCoords.length,
//             });
//           } else {
//             try {
//               const geocoded = await Promise.race([
//                 Location.geocodeAsync(`${hubName}, Telangana, India`),
//                 new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
//               ]);
//               if (geocoded && geocoded.length > 0 && typeof geocoded[0].latitude === "number" && Number.isFinite(geocoded[0].latitude) && typeof geocoded[0].longitude === "number" && Number.isFinite(geocoded[0].longitude)) {
//                 setAssignedHubCoords({
//                   latitude: geocoded[0].latitude,
//                   longitude: geocoded[0].longitude,
//                 });
//               }
//             } catch (e) { }
//           }

//           isZoneDataLoadedRef.current = true;
//           if (currentCoords) {
//             checkZoneBoundary(currentCoords.latitude, currentCoords.longitude);
//           }
//         }
//       }
//     } catch (err) {
//       console.log("Error fetching assigned hub zone:", err);
//     }
//   };

//   /* DRAGGABLE PAN RESPONDER FOR FLOATING BUTTON */
//   const pan = useRef(new Animated.ValueXY()).current;
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => false,
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
//       },
//       onPanResponderGrant: () => {
//         pan.setOffset({
//           x: (pan.x as any)._value || 0,
//           y: (pan.y as any)._value || 0,
//         });
//         pan.setValue({ x: 0, y: 0 });
//       },
//       onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
//         useNativeDriver: false,
//       }),
//       onPanResponderRelease: () => {
//         pan.flattenOffset();
//       },
//     })
//   ).current;

//   /* HAVERSINE MATHEMATICAL DISTANCE IN KM */
//   const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371; // Earth radius in km
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   /* GENERATES CONVEX HULL FOR A SET OF POINTS */
//   const getConvexHullCoordinates = (points: Array<{ latitude: number; longitude: number }>) => {
//     if (!points || points.length < 3) return [];
//     const validPoints = points.filter(
//       (p) => p && typeof p.latitude === "number" && Number.isFinite(p.latitude) && typeof p.longitude === "number" && Number.isFinite(p.longitude)
//     );
//     if (validPoints.length < 3) return [];

//     const sorted = [...validPoints].sort((a, b) =>
//       a.longitude === b.longitude ? a.latitude - b.latitude : a.longitude - b.longitude
//     );

//     const cross = (o: any, a: any, b: any) =>
//       (a.longitude - o.longitude) * (b.latitude - o.latitude) -
//       (a.latitude - o.latitude) * (b.longitude - o.longitude);

//     const lower: any[] = [];
//     for (const p of sorted) {
//       while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
//         lower.pop();
//       }
//       lower.push(p);
//     }

//     const upper: any[] = [];
//     for (let i = sorted.length - 1; i >= 0; i--) {
//       const p = sorted[i];
//       while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
//         upper.pop();
//       }
//       upper.push(p);
//     }

//     lower.pop();
//     upper.pop();
//     return lower.concat(upper);
//   };

//   /* GENERATES REALISTIC ORGANIC BOUNDARY POLYGON FOR A PINCODE */
//   const generatePincodeBoundaryPoints = (lat: number, lng: number, radiusKm: number = 1.3) => {
//     if (typeof lat !== "number" || !Number.isFinite(lat) || typeof lng !== "number" || !Number.isFinite(lng)) return [];
//     const cosLat = Math.cos((lat * Math.PI) / 180);
//     if (Math.abs(cosLat) < 0.0001) return [];

//     const points: Array<{ latitude: number; longitude: number }> = [];
//     const numPoints = 12;
//     const seed = (Math.abs(lat * 1000) + Math.abs(lng * 1000)) % 10;
//     for (let i = 0; i < numPoints; i++) {
//       const angle = (i * 2 * Math.PI) / numPoints;
//       const varRadius = radiusKm * (0.85 + 0.3 * Math.sin(angle * 3 + seed));
//       const latOffset = (varRadius / 111) * Math.cos(angle);
//       const lngOffset = (varRadius / (111 * cosLat)) * Math.sin(angle);
//       const ptLat = lat + latOffset;
//       const ptLng = lng + lngOffset;
//       if (typeof ptLat === "number" && Number.isFinite(ptLat) && typeof ptLng === "number" && Number.isFinite(ptLng)) {
//         points.push({
//           latitude: ptLat,
//           longitude: ptLng,
//         });
//       }
//     }
//     return points;
//   };

//   /* DYNAMIC HUB ENCLOSING BOUNDARY CENTER & RADIUS CALCULATOR */
//   const getDynamicHubBoundary = () => {
//     const validSubs = hubSubLocations.filter(
//       (s) => s.latitude && s.longitude
//     );

//     if (validSubs.length === 0) {
//       return {
//         center: assignedHubCoords || HYDERABAD_HUBS["pragathi nagar"],
//         radius: 6500,
//       };
//     }

//     // 1. Compute Centroid of all sub-location pincodes
//     const avgLat =
//       validSubs.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSubs.length;
//     const avgLng =
//       validSubs.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSubs.length;

//     const center = { latitude: avgLat, longitude: avgLng };

//     // 2. Compute Maximum Distance to ANY sub-location pincode + margin
//     let maxDistKm = 0;
//     validSubs.forEach((s) => {
//       if (s.latitude && s.longitude) {
//         const d = getDistanceFromLatLonInKm(
//           avgLat,
//           avgLng,
//           s.latitude,
//           s.longitude
//         );
//         if (d > maxDistKm) maxDistKm = d;
//       }
//     });

//     // Add 2.5 KM padding so every sub-location pincode is 100% inside the circle!
//     const radiusMeters = Math.max(
//       7500,
//       Math.ceil((maxDistKm + 2.5) * 1000)
//     );

//     return { center, radius: radiusMeters };
//   };

//   /* ================= CHECK ZONE BOUNDARY ================= */
//   const checkZoneBoundary = async (lat: number, lng: number) => {
//     setCurrentCoords({ latitude: lat, longitude: lng });

//     // 0. Safety Gate: Don't evaluate until zone data has finished loading on app launch
//     if (!isZoneDataLoadedRef.current && hubSubLocations.length === 0) {
//       console.log("⏳ Zone data loading in progress. Postponing boundary evaluation.");
//       return false;
//     }

//     let isInside = false;
//     let currentAreaStr = "";

//     // 1. DIRECT HUB CENTER PROXIMITY CHECK (4.5 KM radius)
//     if (assignedHubCoords) {
//       const distToHubKm = getDistanceFromLatLonInKm(
//         lat,
//         lng,
//         assignedHubCoords.latitude,
//         assignedHubCoords.longitude
//       );
//       if (distToHubKm <= 4.5) {
//         isInside = true;
//       }
//     }

//     // 2. DIRECT SUB-LOCATION PROXIMITY CHECK (3.5 KM radius to ANY assigned sub-location)
//     if (!isInside && hubSubLocations && hubSubLocations.length > 0) {
//       for (const sub of hubSubLocations) {
//         if (sub.latitude && sub.longitude) {
//           const distToSubKm = getDistanceFromLatLonInKm(lat, lng, sub.latitude, sub.longitude);
//           if (distToSubKm <= 3.5) {
//             isInside = true;
//             break;
//           }
//         }
//       }
//     }

//     try {
//       const reversed = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
//       if (reversed && reversed.length > 0) {
//         const place = reversed[0];
//         const postalCode = String(place.postalCode || "").trim();
//         const namePart = (place.name || place.street || "").trim();
//         const subregionPart = (place.subregion || place.district || place.city || "").trim();
//         currentAreaStr = `${namePart ? namePart + ", " : ""}${subregionPart}${postalCode ? " (" + postalCode + ")" : ""}`;
//         setCurrentAreaName(currentAreaStr);

//         // 3. EXACT ASSIGNED PINCODE MATCH
//         if (!isInside && postalCode) {
//           const allPincodes = [
//             ...assignedPincodes,
//             ...hubSubLocations.map((s) => s.pincode).filter(Boolean),
//             ...(assignedLocationsStr.match(/\b\d{6}\b/g) || []),
//           ];

//           if (allPincodes.some((pin) => pin && postalCode.includes(pin.trim()))) {
//             isInside = true;
//           }
//         }

//         // 4. ASSIGNED LOCATION KEYWORD MATCH
//         if (!isInside && assignedLocationsStr) {
//           const keywords = assignedLocationsStr
//             .toLowerCase()
//             .split(/[•,\n()]+/)
//             .map((item) => item.trim())
//             .filter((item) => item.length > 2 && !/^\d+$/.test(item));

//           const currentWords = `${namePart} ${subregionPart}`.toLowerCase();
//           const nameMatch = keywords.some((kw) => kw && currentWords.includes(kw));

//           if (nameMatch) {
//             isInside = true;
//           }
//         }
//       }
//     } catch (e) {
//       console.log("Reverse geocode error:", e);
//     }

//     const outOfBounds = !isInside;
//     setIsOutOfZone(outOfBounds);

//     if (!outOfBounds) {
//       hasAlertedOutOfBoundsRef.current = false;
//       setOutOfBoundsModalVisible(false);
//     } else {
//       if (!hasAlertedOutOfBoundsRef.current) {
//         hasAlertedOutOfBoundsRef.current = true;
//         setOutOfBoundsModalVisible(true);
//         triggerZoneBreachAlert(currentAreaStr || "Outside Zone Area");
//         triggerOutOfBoundsPopUp();
//       }
//     }

//     // Update location in Supabase (keep this for now - Phase 2 will move to FastAPI)
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       if (userData?.user) {
//         await supabase
//           .from("staff_profile")
//           .update({
//             is_out_of_zone: outOfBounds,
//             live_location: `${lat}, ${lng}`,
//             live_location_updated_at: new Date().toISOString(),
//           })
//           .eq("id", userData.user.id);
//       }
//     } catch (e) {
//       console.log("DB staff_profile update error:", e);
//     }

//     return outOfBounds;
//   };

//   const triggerZoneBreachAlert = async (currentArea: string) => {
//     const { data: userData } = await supabase.auth.getUser();
//     if (!userData?.user) return;

//     try {
//       await supabase.from("location_alerts").insert([
//         {
//           staff_email: userData.user.email,
//           alert_type: "OUT_OF_ZONE",
//           current_location: currentArea,
//           assigned_hub: assignedHubName,
//           created_at: new Date().toISOString(),
//         },
//       ]);
//     } catch (err) {
//       console.log("Error inserting location alert:", err);
//     }
//   };

//   const handleNavigateToZone = () => {
//     if (assignedHubCoords) {
//       const url = `https://www.google.com/maps/dir/?api=1&destination=${assignedHubCoords.latitude},${assignedHubCoords.longitude}`;
//       Linking.openURL(url);
//     } else {
//       const query = encodeURIComponent(assignedHubName);
//       Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
//     }
//   };

//   const formatMinutesToHours = (totalMinutes: number | string) => {
//     const minsNum = Math.max(0, parseInt(String(totalMinutes || 0), 10) || 0);
//     if (minsNum === 0) return "0 min";
//     const hours = Math.floor(minsNum / 60);
//     const mins = minsNum % 60;

//     if (hours > 0 && mins > 0) {
//       return `${hours}h ${mins} min`;
//     } else if (hours > 0) {
//       return `${hours}h`;
//     } else {
//       return `${mins} min`;
//     }
//   };

//   const calculateDutyTotals = (
//     logs: Record<string, number> = {},
//     active: boolean = false,
//     startedAt: string | null = null,
//   ) => {
//     const todayKey = dayjs().format("YYYY-MM-DD");
//     const currentMonthKey = dayjs().format("YYYY-MM");

//     // Standard Calendar Week: Monday 00:00 to Sunday 23:59
//     const now = dayjs();
//     const dayOfWeek = now.day(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
//     const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//     const startOfWeek = now.subtract(diffToMonday, "day").startOf("day");
//     const endOfWeek = startOfWeek.add(6, "day").endOf("day");

//     let todayBase = Number(logs[todayKey] || 0);
//     let weeklyBase = 0;
//     let monthlyBase = 0;

//     Object.entries(logs).forEach(([dateStr, mins]) => {
//       const minVal = Number(mins) || 0;
//       const d = dayjs(dateStr);

//       if (d.isValid()) {
//         if (
//           (d.isSame(startOfWeek, "day") || d.isAfter(startOfWeek)) &&
//           (d.isSame(endOfWeek, "day") || d.isBefore(endOfWeek))
//         ) {
//           weeklyBase += minVal;
//         }
//         if (dateStr.startsWith(currentMonthKey)) {
//           monthlyBase += minVal;
//         }
//       }
//     });

//     let activeSessionMins = 0;
//     let todayActiveMins = 0;
//     let weeklyActiveMins = 0;
//     let monthlyActiveMins = 0;

//     if (active && startedAt) {
//       const start = dayjs(startedAt);
//       if (start.isValid() && now.isAfter(start)) {
//         activeSessionMins = Math.max(0, now.diff(start, "minute"));

//         // Day starts at 12:00 AM midnight today
//         const startOfToday = now.startOf("day");
//         const effectiveTodayStart = start.isAfter(startOfToday) ? start : startOfToday;
//         todayActiveMins = Math.max(0, now.diff(effectiveTodayStart, "minute"));

//         const effectiveWeeklyStart = start.isAfter(startOfWeek) ? start : startOfWeek;
//         weeklyActiveMins = Math.max(0, now.diff(effectiveWeeklyStart, "minute"));

//         const startOfMonth = now.startOf("month");
//         const effectiveMonthlyStart = start.isAfter(startOfMonth) ? start : startOfMonth;
//         monthlyActiveMins = Math.max(0, now.diff(effectiveMonthlyStart, "minute"));
//       }
//     }

//     const maxTodayMinutes = Math.max(0, now.diff(now.startOf("day"), "minute"));
//     const rawToday = todayBase + todayActiveMins;

//     return {
//       today: Math.min(rawToday, maxTodayMinutes),
//       weekly: weeklyBase + weeklyActiveMins,
//       monthly: monthlyBase + monthlyActiveMins,
//     };
//   };

//   const sliderRef = useRef<FlatList>(null);
//   const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
//   const liveLocationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   /* ================= LIVE LOCATION TRACKING ================= */
//   const startLiveLocationTracking = async (userId: string) => {
//     await stopLiveLocationTracking();

//     // 0. Ensure location permission is granted
//     let { status: fgStatus } = await Location.getForegroundPermissionsAsync();
//     if (fgStatus !== "granted") {
//       const { status: reqStatus } = await Location.requestForegroundPermissionsAsync();
//       fgStatus = reqStatus;
//     }

//     if (fgStatus !== "granted") {
//       console.log("⚠️ Location permission not granted for live tracking.");
//       return;
//     }

//     // 1. Immediate initial location update
//     Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
//       .then(async (pos) => {
//         if (pos?.coords) {
//           const liveLocStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
//           const nowStr = new Date().toISOString();
//           // Keep Supabase for location updates (Phase 2 will move to FastAPI)
//           await supabase
//             .from("staff_profile")
//             .update({
//               live_location: liveLocStr,
//               live_location_updated_at: nowStr,
//             })
//             .eq("id", userId);

//           await checkZoneBoundary(pos.coords.latitude, pos.coords.longitude);
//         }
//       })
//       .catch((err) => console.log("Initial live location error:", err));

//     // 2. Real-time Movement Watcher (fires instantly whenever device moves 1m+)
//     try {
//       const sub = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.Balanced,
//           timeInterval: 4000,
//           distanceInterval: 5, // 5 meter movement threshold to prevent GPS jitter flickering
//         },
//         async (pos) => {
//           if (pos?.coords) {
//             const liveLocStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
//             const nowStr = new Date().toISOString();
//             try {
//               // Keep Supabase for location updates (Phase 2 will move to FastAPI)
//               await supabase
//                 .from("staff_profile")
//                 .update({
//                   live_location: liveLocStr,
//                   live_location_updated_at: nowStr,
//                 })
//                 .eq("id", userId);

//               // Check zone boundary in real-time
//               checkZoneBoundary(pos.coords.latitude, pos.coords.longitude);
//             } catch (err) {
//               console.log("❌ Watch location update error:", err);
//             }
//           }
//         }
//       );
//       locationSubscriptionRef.current = sub;
//     } catch (err) {
//       console.log("Error starting watchPositionAsync:", err);
//     }

//     // 3. Rapido-style Background Service (for locked screen / minimized app)
//     try {
//       const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
//       if (bgStatus === "granted") {
//         const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
//         if (!isRegistered) {
//           await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 1000,
//             distanceInterval: 1,
//             showsBackgroundLocationIndicator: true,
//             foregroundService: {
//               notificationTitle: "Neatify Partner Active 📍",
//               notificationBody: "Live location tracking active while on-duty.",
//               notificationColor: "#FFD700",
//             },
//           });
//           console.log("✅ Rapido-style background location tracking active");
//         }
//       }
//     } catch (err) {
//       console.log("Notice on background service:", err);
//     }
//   };

//   const stopLiveLocationTracking = async () => {
//     if (liveLocationIntervalRef.current) {
//       clearInterval(liveLocationIntervalRef.current);
//       liveLocationIntervalRef.current = null;
//     }
//     if (locationSubscriptionRef.current) {
//       locationSubscriptionRef.current.remove();
//       locationSubscriptionRef.current = null;
//     }
//     try {
//       const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
//       if (isRegistered) {
//         await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
//         console.log("🛑 Background location task stopped");
//       }
//     } catch (err) {
//       console.log("Error stopping background task:", err);
//     }

//     // Reset is_out_of_zone to null
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       if (userData?.user) {
//         await supabase
//           .from("staff_profile")
//           .update({ is_out_of_zone: null })
//           .eq("id", userData.user.id);
//       }
//     } catch (err) {
//       console.log("Error resetting is_out_of_zone to null:", err);
//     }

//     // Always clear live location fields when tracking is stopped
//     try {
//       const { data: userData } = await supabase.auth.getUser();
//       if (userData?.user) {
//         await supabase
//           .from("staff_profile")
//           .update({
//             live_location: null,
//             live_location_updated_at: null,
//             work_start_location: null,
//             is_out_of_zone: false,
//           })
//           .eq("id", userData.user.id);
//       }
//     } catch (e) {
//       console.log("Error clearing live location in stopLiveLocationTracking:", e);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       stopLiveLocationTracking();
//     };
//   }, []);

//   /* ================= BACK HANDLER (FIXED) ================= */
//   useFocusEffect(
//     useCallback(() => {
//       const backAction = () => {
//         if (router.canGoBack()) {
//           router.back();
//           return true;
//         }
//         return false; // allow Android default behavior
//       };

//       const sub = BackHandler.addEventListener("hardwareBackPress", backAction);

//       return () => sub.remove();
//     }, []),
//   );

//   /* ================= Notifications load ================= */

//   const loadNotifications = async () => {
//     const { data: userData } = await supabase.auth.getUser();

//     const email = userData.user?.email;

//     if (!email) return;

//     const { data, error } = await supabase
//       .from("notifications")
//       .select("*")
//       .eq("staff_email", email);

//     if (!error) {
//       setNotifications(data || []);
//     }
//   };

//   /* ================= FETCH SLIDES ================= */
//   const fetchSlides = async () => {
//     const { data, error } = await supabase
//       .from("hero_images")
//       .select("image_path")
//       .eq("is_active", true) // ✅ only active images
//       .order("priority", { ascending: true }); // ✅ order by priority

//     if (error) {
//       console.log("Error fetching slides:", error);
//       return;
//     }

//     if (data) {
//       const imageUrls = data.map((item) => {
//         const { data: publicUrlData } = supabase.storage
//           .from("hero-images-staff")
//           .getPublicUrl(item.image_path);

//         return publicUrlData.publicUrl;
//       });

//       setSlides(imageUrls);
//     }
//   };
  
//   /* ================= FETCH COUNTS ================= */
//   const fetchCounts = async () => {
//     const { data } = await supabase.auth.getUser();
//     const user = data.user;
//     if (!user) return;

//     const email = user.email;

//     const { count: notif } = await supabase
//       .from("bookings")
//       .select("*", { count: "exact", head: true })
//       .eq("assigned_staff_email", email)
//       .eq("is_viewed", false);

//     // ✅ ASSIGNED (ALL ACTIVE ASSIGNED BOOKINGS)
//     const { count: assigned } = await supabase
//       .from("bookings")
//       .select("*", { count: "exact", head: true })
//       .eq("assigned_staff_email", email)
//       .neq("work_status", "COMPLETED")
//       .neq("work_status", "CANCELLED");

//     const { count: completed } = await supabase
//       .from("bookings")
//       .select("*", { count: "exact", head: true })
//       .eq("assigned_staff_email", email)
//       .eq("work_status", "COMPLETED");

//     // Query staff_cancellations table (matching app/cancellations.tsx)
//     const { count: cancelLogsCount } = await supabase
//       .from("staff_cancellations")
//       .select("*", { count: "exact", head: true })
//       .eq("staff_email", email);

//     let cancelledTotal = cancelLogsCount || 0;
//     if (cancelledTotal === 0) {
//       const { count: cancelledBookingsCount } = await supabase
//         .from("bookings")
//         .select("*", { count: "exact", head: true })
//         .eq("assigned_staff_email", email)
//         .eq("work_status", "CANCELLED");

//       cancelledTotal = cancelledBookingsCount || 0;
//     }

//     const assignedValue = assigned || 0;

//     setNewCount(notif || 0);
//     setAssignedCount(assigned || 0);
//     setCompletedCount(completed || 0);
//     setCancelledCount(cancelledTotal);

//     // 🔥 Sync with staff_profile table
//     await supabase
//       .from("staff_profile")
//       .update({ assigned_count: assignedValue })
//       .eq("id", user.id);
//   };

//   /* ================= FETCH AVAILABILITY / DASHBOARD ================= */
//  /* ================= FETCH AVAILABILITY / DASHBOARD ================= */
// const fetchAvailability = async () => {
//   try {
//     console.log("🔄 Fetching partner dashboard from FastAPI...");

//     const dashboard = await partnerApi.dashboard();

//     console.log(
//       "✅ Partner dashboard received:",
//       JSON.stringify(dashboard, null, 2),
//     );

//     if (!dashboard) {
//       console.log("⚠️ Dashboard response is empty.");
//       return;
//     }

//     // =====================================================
//     // DUTY DATA
//     // =====================================================

//     const duty = dashboard.duty;

//     if (duty) {
//       const active = Boolean(duty.is_available);

//       setIsAvailable(active);

//       setTodayDutyMinutes(
//         Number(duty.today_minutes || 0),
//       );

//       setWeeklyDutyMinutes(
//         Number(duty.weekly_minutes || 0),
//       );

//       setMonthlyDutyMinutes(
//         Number(duty.monthly_minutes || 0),
//       );

//       console.log(
//         "🟢 Duty status:",
//         active,
//       );

//       console.log(
//         "⏱️ Duty minutes:",
//         {
//           today: duty.today_minutes,
//           weekly: duty.weekly_minutes,
//           monthly: duty.monthly_minutes,
//         },
//       );
//     }

//     // =====================================================
//     // BOOKINGS
//     // =====================================================

//     const bookings = dashboard.bookings;

//     if (bookings) {
//       setNewCount(
//         Number(bookings.new || 0),
//       );

//       setAssignedCount(
//         Number(bookings.assigned || 0),
//       );

//       setCompletedCount(
//         Number(bookings.completed || 0),
//       );

//       setCancelledCount(
//         Number(bookings.cancelled || 0),
//       );

//       console.log(
//         "📊 Booking counts:",
//         bookings,
//       );
//     }

//     // =====================================================
//     // ACTIVE DUTY
//     // =====================================================

//     if (duty?.is_available) {
//       hasAlertedOutOfBoundsRef.current = false;

//       await fetchAssignedHubZone();

//       if (!locationSubscriptionRef.current) {
//         try {
//           const currentUser = await authApi.me();
//           await startLiveLocationTracking(currentUser.id);
//         } catch (error) {
//           console.error("❌ Failed to start live tracking:", error);
//         }
//       }
//     } else {
//       hasAlertedOutOfBoundsRef.current = false;
//       setOutOfBoundsModalVisible(false);
//       setIsOutOfZone(false);
//       await stopLiveLocationTracking();
//     }
//   } catch (error) {
//     console.error("❌ Failed to fetch partner dashboard:", error);
//     Alert.alert(
//       "Dashboard Error",
//       error instanceof Error ? error.message : "Unable to load partner dashboard.",
//     );
//   }
// };

//   /* ================= PROCEED WITH DUTY ACTIVATION ================= */
//   const proceedWithDutyActivation = async () => {
//     // =====================================================
//     // 1. Check GPS
//     // =====================================================

//     const hasGps = await Location.hasServicesEnabledAsync();

//     if (!hasGps) {
//       Alert.alert(
//         "Location Services Disabled 🛰️",
//         "Mobile GPS/Location service is turned OFF. Please turn ON Location in your phone settings to go ON-DUTY.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel",
//           },
//           {
//             text: "Open Settings",
//             onPress: () => Linking.openSettings(),
//           },
//         ],
//       );
//       return;
//     }

//     // =====================================================
//     // 2. Get current location
//     // =====================================================

//     setLocationLoading(true);

//     let initialLocStr = "";
//     let isOut = false;

//     try {
//       const initialPos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       initialLocStr =
//         `${initialPos.coords.latitude}, ${initialPos.coords.longitude}`;

//       console.log("📍 Initial location:", initialLocStr);

//       // Existing zone logic
//       await fetchAssignedHubZone();

//       isOut = await checkZoneBoundary(
//         initialPos.coords.latitude,
//         initialPos.coords.longitude,
//       );
//     } catch (error) {
//       console.log("❌ Error getting initial location:", error);
//     } finally {
//       setLocationLoading(false);
//     }

//     // =====================================================
//     // 3. CALL FASTAPI DUTY ON
//     // =====================================================

//     try {
//       console.log("🟢 Calling FastAPI duty ON...");

//       const response = await partnerApi.turnOnDuty(initialLocStr);

//       console.log(
//         "✅ FastAPI duty ON successful:",
//         JSON.stringify(response, null, 2),
//       );

//       // ===================================================
//       // 4. Update local UI
//       // ===================================================

//       setIsAvailable(true);

//       setIsOutOfZone(isOut);

//       const nowStr = new Date().toISOString();
//       setDutyStartedAt(nowStr);

//       // ===================================================
//       // 5. Start location tracking
//       // ===================================================

//       try {
//         const currentUser = await authApi.me();
//         await startLiveLocationTracking(currentUser.id);
//       } catch (error) {
//         console.error("❌ Failed to start live tracking:", error);
//       }

//       // ===================================================
//       // 6. Refresh dashboard
//       // ===================================================

//       await fetchAvailability();

//       // ===================================================
//       // 7. Out-of-zone alert
//       // ===================================================

//       if (isOut) {
//         triggerOutOfBoundsPopUp();
//       }
//     } catch (error) {
//       console.error("❌ FastAPI duty ON failed:", error);
//       setIsAvailable(false);
//       Alert.alert(
//         "Unable to Go ON-DUTY",
//         error instanceof Error ? error.message : "FastAPI could not update your duty status.",
//       );
//     }
//   };

//   /* ================= HANDLE LOCATION DISCLOSURE CONTINUE ================= */
//   const handleLocationDisclosureContinue = async () => {
//     setLocationDisclosureVisible(false);

//     // =====================================================
//     // 1. Foreground Location Permission
//     // =====================================================

//     const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();

//     if (fgStatus !== "granted") {
//       Alert.alert(
//         "Location Permission Required 📍",
//         "Permission to access location was denied. Please grant location access in your device settings to go ON-DUTY.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel",
//           },
//           {
//             text: "Open Settings",
//             onPress: () => Linking.openSettings(),
//           },
//         ],
//       );
//       return;
//     }

//     // =====================================================
//     // 2. Background Location Permission
//     // =====================================================

//     const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

//     if (bgStatus !== "granted") {
//       Alert.alert(
//         "Background Location Permission Required 📍",
//         "Background location permission is required so Neatify can assign jobs and track duty status while on duty.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel",
//           },
//           {
//             text: "Open Settings",
//             onPress: () => Linking.openSettings(),
//           },
//         ],
//       );
//       return;
//     }

//     // =====================================================
//     // 3. FastAPI Duty ON
//     // =====================================================

//     await proceedWithDutyActivation();
//   };

//   const handleLocationDisclosureCancel = () => {
//     setLocationDisclosureVisible(false);
//     setTargetDutyValue(null);
//   };

//   /* ================= CONFIRM DUTY CHANGE ================= */
//   const confirmDutyChange = async () => {
//     if (targetDutyValue === null) {
//       return;
//     }

//     const value = targetDutyValue;

//     setDutyModalVisible(false);

//     // =====================================================
//     // DUTY ON
//     // =====================================================

//     if (value === true) {
//       const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
//       const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();

//       if (fgStatus !== "granted" || bgStatus !== "granted") {
//         setLocationDisclosureVisible(true);
//         return;
//       }

//       await proceedWithDutyActivation();
//       return;
//     }

//     // =====================================================
//     // DUTY OFF
//     // =====================================================

//     try {
//       console.log("🔴 Calling FastAPI duty OFF...");

//       // ---------------------------------------------------
//       // Stop device location tracking
//       // ---------------------------------------------------

//       await stopLiveLocationTracking();

//       // ---------------------------------------------------
//       // Call FastAPI
//       // ---------------------------------------------------

//       const response = await partnerApi.turnOffDuty();

//       console.log(
//         "✅ FastAPI duty OFF successful:",
//         JSON.stringify(response, null, 2),
//       );

//       // ---------------------------------------------------
//       // Update local UI
//       // ---------------------------------------------------

//       setIsAvailable(false);
//       setIsOutOfZone(false);
//       setOutOfBoundsModalVisible(false);
//       setDutyStartedAt(null);

//       // ---------------------------------------------------
//       // Reload dashboard from backend
//       // ---------------------------------------------------

//       await fetchAvailability();
//     } catch (error) {
//       console.error("❌ FastAPI duty OFF failed:", error);
//       Alert.alert(
//         "Unable to Go OFF-DUTY",
//         error instanceof Error ? error.message : "FastAPI could not update your duty status.",
//       );
//     }
//   };

//   /* ================= CONFIRM LOGOUT ACTION ================= */
//   const confirmLogoutAction = async () => {
//     setLoadingLogout(true);

//     try {
//       setIsAvailable(false);
//       await stopLiveLocationTracking();
//       await turnOffDutyAndLogout();
//       setShowLogoutModal(false);
//       router.replace("/login");
//     } catch (error) {
//       console.error("❌ Logout error:", error);
//     } finally {
//       setLoadingLogout(false);
//     }
//   };

//   const handleLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const handleCustomerCare = () => {
//     setCustomerCareModalVisible(true);
//   };

//   /* ================= LIVE DUTY TIMER TICK ================= */
//   useEffect(() => {
//     if (!isAvailable || !dutyStartedAt) {
//       return;
//     }

//     const updateTimer = () => {
//       const totals = calculateDutyTotals(
//         dutyLogsJson,
//         true,
//         dutyStartedAt,
//       );

//       setTodayDutyMinutes(totals.today);
//       setWeeklyDutyMinutes(totals.weekly);
//       setMonthlyDutyMinutes(totals.monthly);
//     };

//     updateTimer();

//     const interval = setInterval(updateTimer, 15000);

//     return () => clearInterval(interval);
//   }, [isAvailable, dutyStartedAt, dutyLogsJson]);

//   useEffect(() => {
//     fetchSlides();
//   }, []);

//   /* ================= USE FOCUS EFFECT ================= */
//   useFocusEffect(
//     useCallback(() => {
//       const initScreen = async () => {
//         await fetchAvailability();
//         await fetchAssignedHubZone();
//         await loadNotifications();
//       };

//       initScreen();
//     }, []),
//   );

//   /* ================= NOTIFICATIONS SETUP (UNCHANGED) ================= */
//   useEffect(() => {
//     const setupNotifications = async () => {
//       try {
//         await scheduleDailyDutyReminders();

//         const token = await registerForPushNotificationsAsync();

//         if (token) {
//           console.log("Push Token:", token);

//           const { data } = await supabase.auth.getUser();
//           const user = data.user;

//           if (user) {
//             await supabase
//               .from("staff_profile")
//               .update({
//                 push_token: token,
//               })
//               .eq("id", user.id);

//             console.log("✅ Token saved to DB");
//           }
//         }
//       } catch (error) {
//         console.log("❌ Notification setup error:", error);
//       }
//     };

//     setupNotifications();
//   }, []);

//   /* ================= AUTO SCROLL ================= */
//   useEffect(() => {
//     if (slides.length === 0) return;

//     autoScrollRef.current = setInterval(() => {
//       const next = (activeSlide + 1) % slides.length;
//       sliderRef.current?.scrollToIndex({ index: next, animated: true });
//       setActiveSlide(next);
//     }, 3000);

//     return () => {
//       if (autoScrollRef.current) clearInterval(autoScrollRef.current);
//     };
//   }, [activeSlide, slides.length]);

//   const unreadCount = notifications.filter((item) => !item.is_read).length;

//   /* ================= UPDATE AVAILABILITY ================= */
//   const handleToggleAvailability = (value: boolean) => {
//     setTargetDutyValue(value);
//     setDutyModalVisible(true);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Image
//           source={require("../assets/images/logo.png")}
//           style={styles.logo}
//           contentFit="contain"
//         />

//         <View style={styles.headerRight}>
//           {/* CUSTOMER CARE CALL BUTTON */}
//           <TouchableOpacity onPress={handleCustomerCare} style={{ padding: 2 }}>
//             <Ionicons name="call" size={26} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.bellIcon}
//             onPress={() => router.push("/new-services")}
//           >
//             <Ionicons name="notifications" size={26} color="#000" />
//             {unreadCount > 0 && (
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{unreadCount}</Text>
//               </View>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setShowMenu(true)}>
//             <Ionicons name="person-circle-outline" size={34} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {/* DROPDOWN */}
//       {showMenu && (
//         <Pressable style={styles.overlay} onPress={() => setShowMenu(false)} />
//       )}
//       {showMenu && (
//         <View style={styles.menu}>
//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setShowMenu(false);
//               router.push("/my-account");
//             }}
//           >
//             <Text style={styles.menuText}>My Account</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setShowMenu(false);
//               handleLogout();
//             }}
//           >
//             <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={[{ key: "main" }]}
//         contentContainerStyle={{ paddingBottom: 120 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchCounts} />
//         }
//         renderItem={() => (
//           <View style={styles.container}>
//             <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

//             {/* SLIDER */}
//             <View style={styles.sliderWrapper}>
//               <FlatList
//                 ref={sliderRef}
//                 data={slides}
//                 horizontal
//                 pagingEnabled
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={(_, i) => i.toString()}
//                 onMomentumScrollEnd={(e) =>
//                   setActiveSlide(
//                     Math.round(e.nativeEvent.contentOffset.x / width),
//                   )
//                 }
//                 renderItem={({ item }) => (
//                   <Image
//                     source={{ uri: item }}
//                     style={styles.slideImage}
//                     contentFit="cover"
//                     cachePolicy="disk" // 🔥 Enables disk caching
//                     transition={300} // Smooth fade effect
//                   />
//                 )}
//               />

//               <View style={styles.dots}>
//                 {slides.map((_, i) => (
//                   <View
//                     key={i}
//                     style={[styles.dot, activeSlide === i && styles.activeDot]}
//                   />
//                 ))}
//               </View>
//             </View>

//             {/* OUT OF BOUNDS WARNING BANNER ON HOME SCREEN */}
//             {isOutOfZone && (
//               <TouchableOpacity
//                 style={styles.outOfZoneBanner}
//                 onPress={() => {
//                   fetchAssignedHubZone();
//                   setZoneModalVisible(true);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="warning" size={24} color="#fff" />
//                 <View style={{ flex: 1, marginLeft: 10 }}>
//                   <Text style={styles.outOfZoneBannerTitle}>OUT OF BOUNDS ALERT! 🚨</Text>
//                   <Text style={styles.outOfZoneBannerSub}>
//                     Outside assigned zone ({assignedHubName}). Tap to view zone & navigate.
//                   </Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={20} color="#fff" />
//               </TouchableOpacity>
//             )}

//             {/*   TOGGLE */}
//             <View style={styles.availabilityWrapper}>
//               <Text style={styles.availabilityText}>GO ON-DUTY</Text>
//               <Switch
//                 value={isAvailable}
//                 onValueChange={handleToggleAvailability}
//                 trackColor={{ false: "#ede4e4", true: "#0fd357" }}
//               />
//             </View>

//             {/* WORKING HOURS SECTION HEADER */}
//             <View style={styles.sectionHeaderWrapper}>
//               <Text style={styles.sectionHeaderText}>Working Hours</Text>
//             </View>

//             {/* DUTY HOURS SUMMARY BOXES */}
//             <View style={styles.dutyHoursRow}>
//               {/* TODAY */}
//               <View style={styles.dutyHoursBox}>
//                 <Text style={styles.dutyHoursTitle}>Today</Text>
//                 <Text style={styles.dutyHoursValue}>
//                   {formatMinutesToHours(todayDutyMinutes)}
//                 </Text>
//               </View>

//               {/* WEEKLY */}
//               <View style={styles.dutyHoursBox}>
//                 <Text style={styles.dutyHoursTitle}>Weekly</Text>
//                 <Text style={styles.dutyHoursValue}>
//                   {formatMinutesToHours(weeklyDutyMinutes)}
//                 </Text>
//               </View>

//               {/* MONTHLY */}
//               <View style={styles.dutyHoursBox}>
//                 <Text style={styles.dutyHoursTitle}>Monthly</Text>
//                 <Text style={styles.dutyHoursValue}>
//                   {formatMinutesToHours(monthlyDutyMinutes)}
//                 </Text>
//               </View>
//             </View>

//             {/* ACTION BUTTONS */}
//             <View style={styles.actionWrapper}>
//               {/* Calendar FIRST (COMMENTED OUT)
//               <TouchableOpacity
//                 style={[styles.primaryBtn, styles.actionBtnRow]}
//                 onPress={() => router.push("./availability-calendar")}
//               >
//                 <Ionicons name="calendar-outline" size={18} color="#000" />
//                 <Text style={styles.primaryBtnText}>
//                   My Availability Calendar
//                 </Text>
//               </TouchableOpacity>
//               */}

//               {/* Assigned Services SECOND (COMMENTED OUT)
//               <TouchableOpacity
//                 style={styles.primaryBtn}
//                 onPress={() => router.push("/assigned-services")}
//               >
//                 <Text style={styles.primaryBtnText}>My Assigned Services</Text>
//               </TouchableOpacity>
//               */}
//             </View>

//             {/* SERVICE SUMMARY SECTION HEADER */}
//             <View style={styles.sectionHeaderWithSubRow}>
//               <Text style={styles.sectionHeaderText}>Service Summary</Text>
//               <Text style={styles.sectionSubHeaderText}>Tap box to view</Text>
//             </View>

//             {/* SUMMARY */}
//             <View style={styles.summaryRow}>
//               {/* PENDING (COMMENTED OUT)
//               <TouchableOpacity
//                 style={[styles.summaryBox, { borderColor: "#facc15" }]}
//                 onPress={() => router.push("/pending-services")}
//               >
//                 <Text style={styles.summaryTitle}>Pending</Text>
//                 <Text style={[styles.summaryCount, { color: "#facc15" }]}>
//                   {pendingCount}
//                 </Text>
//               </TouchableOpacity>
//               */}

//               {/* ASSIGNED */}
//               <TouchableOpacity
//                 style={[styles.summaryBox, styles.assignedBox]}
//                 onPress={() => router.push("/assigned-services")}
//               >
//                 <Text style={styles.summaryTitle}>Assigned</Text>
//                 <Text style={[styles.summaryCount, { color: "#f97316" }]}>
//                   {assignedCount}
//                 </Text>
//               </TouchableOpacity>

//               {/* COMPLETED */}
//               <TouchableOpacity
//                 style={[styles.summaryBox, styles.completedBox]}
//                 onPress={() => router.push("/dashboard")}
//               >
//                 <Text style={styles.summaryTitle}>Completed</Text>
//                 <Text style={[styles.summaryCount, { color: "#16a34a" }]}>
//                   {completedCount}
//                 </Text>
//               </TouchableOpacity>

//               {/* CANCELLED */}
//               <TouchableOpacity
//                 style={[styles.summaryBox, styles.cancelledBox]}
//                 onPress={() => router.push("/cancellations")}
//               >
//                 <Text style={styles.summaryTitle}>Cancelled</Text>
//                 <Text style={[styles.summaryCount, { color: "#ef4444" }]}>
//                   {cancelledCount}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//       {/* FOOTER (FIXED) */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.footerItem}
//           onPress={() => router.push("/my-role")}
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
//           onPress={() => router.push("/dashboard")}
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
//           onPress={() => router.push("/my-account")}
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
//       </View>

//       {/* CUSTOM DUTY MODAL */}
//       <Modal visible={dutyModalVisible} transparent animationType="fade">
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons
//                 name={targetDutyValue ? "power" : "power-outline"}
//                 size={30}
//                 color={targetDutyValue ? "#16a34a" : "#dc2626"}
//               />
//             </View>

//             <Text style={styles.dutyModalTitle}>
//               {targetDutyValue ? "Go ON-DUTY?" : "Go OFF-DUTY?"}
//             </Text>
//             <Text style={styles.dutyModalMessage}>
//               {targetDutyValue
//                 ? "Are you sure you want to go ON-DUTY?"
//                 : "Are you sure you want to go OFF-DUTY?"}
//             </Text>

//             <View style={styles.dutyButtonRow}>
//               <TouchableOpacity
//                 style={styles.dutyCancelBtn}
//                 onPress={() => setDutyModalVisible(false)}
//               >
//                 <Text style={styles.dutyCancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dutyConfirmBtn}
//                 onPress={confirmDutyChange}
//               >
//                 <Text style={styles.dutyConfirmText}>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* CUSTOM CUSTOMER CARE MODAL */}
//       <Modal visible={customerCareModalVisible} transparent animationType="fade">
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.dutyIconCircle}>
//               <Ionicons name="headset" size={30} color="#000" />
//             </View>

//             <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
//             <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

//             <View style={styles.dutyButtonRow}>
//               <TouchableOpacity
//                 style={styles.dutyCancelBtn}
//                 onPress={() => setCustomerCareModalVisible(false)}
//               >
//                 <Text style={styles.dutyCancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dutyConfirmBtn}
//                 onPress={() => {
//                   setCustomerCareModalVisible(false);
//                   Linking.openURL("tel:+917617618567");
//                 }}
//               >
//                 <Text style={styles.dutyConfirmText}>Call</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* LOCATION LOADING MODAL OVERLAY */}
//       <Modal visible={locationLoading} transparent animationType="fade">
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <ActivityIndicator size="large" color="#FFD700" style={{ marginBottom: 16 }} />
//             <Text style={styles.dutyModalTitle}>Fetching Location... 📍</Text>
//             <Text style={styles.dutyModalMessage}>
//               Getting your live GPS location and verifying your assigned zone boundary...
//             </Text>
//           </View>
//         </View>
//       </Modal>

//       {/* CUSTOM PALE-YELLOW ROUNDED OUT OF BOUNDS POPUP MODAL */}
//       <Modal
//         visible={outOfBoundsModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setOutOfBoundsModalVisible(false)}
//       >
//         <View style={styles.boundsModalOverlay}>
//           <View style={styles.boundsModalCard}>
//             <View style={styles.boundsIconCircle}>
//               <Ionicons name="warning" size={32} color="#D97706" />
//             </View>

//             <Text style={styles.boundsModalTitle}>Out of Bounds Alert! 🚨</Text>
//             <Text style={styles.boundsModalMessage}>
//               You are currently outside your assigned zone ({assignedHubName || "Assigned Zone"}).
//               Please move inside your zone to receive and complete customer bookings.
//             </Text>

//             <View style={styles.boundsButtonColumn}>
//               <TouchableOpacity
//                 style={styles.boundsPrimaryBtn}
//                 onPress={() => {
//                   setOutOfBoundsModalVisible(false);
//                   router.push("/zone-map" as any);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="map-outline" size={20} color="#000" />
//                 <Text style={styles.boundsPrimaryBtnText}>View Zone Map 📍</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.boundsDismissBtn}
//                 onPress={() => setOutOfBoundsModalVisible(false)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.boundsDismissText}>Dismiss</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* PROMINENT LOCATION DISCLOSURE MODAL FOR GOOGLE PLAY COMPLIANCE */}
//       <LocationDisclosureModal
//         visible={locationDisclosureVisible}
//         onContinue={handleLocationDisclosureContinue}
//         onCancel={handleLocationDisclosureCancel}
//       />

//       {/* DRAGGABLE FLOATING ROUND CIRCULAR ZONE MAP BUTTON */}
//       <Animated.View
//         style={[
//           styles.draggableContainer,
//           {
//             transform: [{ translateX: pan.x }, { translateY: pan.y }],
//           },
//         ]}
//         {...panResponder.panHandlers}
//       >
//         <TouchableOpacity
//           style={[
//             styles.floatingZoneBtn,
//             { backgroundColor: isOutOfZone ? "#ef4444" : "#16a34a" },
//           ]}
//           onPress={() => {
//             router.push("/zone-map" as any);
//           }}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="map" size={24} color="#ffffff" />
//           <Text style={styles.floatingBtnText}>
//             {isOutOfZone ? "OUT OF BOUNDS" : "IN ZONE"}
//           </Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* ZONE MAP OVERLAY MODAL */}
//       <Modal visible={zoneModalVisible} animationType="slide" transparent={false}>
//         <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//           {/* HEADER */}
//           <View style={styles.zoneModalHeader}>
//             <TouchableOpacity
//               style={styles.zoneBackBtn}
//               onPress={() => setZoneModalVisible(false)}
//             >
//               <Ionicons name="arrow-back" size={24} color="#000" />
//             </TouchableOpacity>
//             <View style={{ flex: 1, marginLeft: 12 }}>
//               <Text style={styles.zoneModalHeaderTitle}>
//                 My Zone: {assignedHubName}
//               </Text>
//               <Text style={styles.zoneModalHeaderSub} numberOfLines={1}>
//                 {assignedLocationsStr || "Fetching assigned hub..."}
//               </Text>
//             </View>
//             <View
//               style={[
//                 styles.zoneHeaderStatusPill,
//                 { backgroundColor: isOutOfZone ? "#fee2e2" : "#dcfce7" },
//               ]}
//             >
//               <Text
//                 style={{
//                   color: isOutOfZone ? "#dc2626" : "#16a34a",
//                   fontWeight: "800",
//                   fontSize: 12,
//                 }}
//               >
//                 {isOutOfZone ? "🔴 OUT OF ZONE" : "🟢 IN ZONE"}
//               </Text>
//             </View>
//           </View>

//           {/* MAP VIEW */}
//           <View style={{ flex: 1 }}>
//             <MapView
//               style={{ flex: 1 }}
//               initialRegion={{
//                 latitude: (currentCoords && typeof currentCoords.latitude === "number" && Number.isFinite(currentCoords.latitude)) ? currentCoords.latitude : (assignedHubCoords && typeof assignedHubCoords.latitude === "number" && Number.isFinite(assignedHubCoords.latitude)) ? assignedHubCoords.latitude : 17.4851,
//                 longitude: (currentCoords && typeof currentCoords.longitude === "number" && Number.isFinite(currentCoords.longitude)) ? currentCoords.longitude : (assignedHubCoords && typeof assignedHubCoords.longitude === "number" && Number.isFinite(assignedHubCoords.longitude)) ? assignedHubCoords.longitude : 78.3240,
//                 latitudeDelta: 0.05,
//                 longitudeDelta: 0.05,
//               }}
//             >
//               {/* BLUE DOTTED LINE CONNECTING OUT-OF-ZONE STAFF TO WORK ZONE */}
//               {isOutOfZone && currentCoords && typeof currentCoords.latitude === "number" && Number.isFinite(currentCoords.latitude) && typeof currentCoords.longitude === "number" && Number.isFinite(currentCoords.longitude) && assignedHubCoords && typeof assignedHubCoords.latitude === "number" && Number.isFinite(assignedHubCoords.latitude) && typeof assignedHubCoords.longitude === "number" && Number.isFinite(assignedHubCoords.longitude) && (
//                 <Polyline
//                   coordinates={[
//                     { latitude: currentCoords.latitude, longitude: currentCoords.longitude },
//                     { latitude: assignedHubCoords.latitude, longitude: assignedHubCoords.longitude },
//                   ]}
//                   strokeColor="#0284c7"
//                   strokeWidth={4}
//                   lineDashPattern={[8, 8]}
//                 />
//               )}

//               {/* LIVE LOCATION MARKER */}
//               {currentCoords && typeof currentCoords.latitude === "number" && Number.isFinite(currentCoords.latitude) && typeof currentCoords.longitude === "number" && Number.isFinite(currentCoords.longitude) && (
//                 <Marker
//                   coordinate={{
//                     latitude: currentCoords.latitude,
//                     longitude: currentCoords.longitude,
//                   }}
//                   title="My Live Location"
//                   description={currentAreaName || "Your current position"}
//                 />
//               )}

//               {/* INDIVIDUAL PINCODE BOUNDARY POLYGONS (CLEAN, NO CLUTTERED ICONS) */}
//               {(() => {
//                 let allPincodeBoundaryPoints: Array<{ latitude: number; longitude: number }> = [];

//                 const pincodeElements = hubSubLocations.map((sub, idx) => {
//                   if (!sub.latitude || !sub.longitude || !Number.isFinite(sub.latitude) || !Number.isFinite(sub.longitude)) return null;

//                   const pincodePolyCoords = generatePincodeBoundaryPoints(
//                     sub.latitude,
//                     sub.longitude,
//                     1.2
//                   );

//                   const validPolyCoords = pincodePolyCoords.filter(
//                     (pt) => pt && typeof pt.latitude === "number" && Number.isFinite(pt.latitude) && typeof pt.longitude === "number" && Number.isFinite(pt.longitude)
//                   );

//                   if (validPolyCoords.length < 3) return null;

//                   allPincodeBoundaryPoints = allPincodeBoundaryPoints.concat(validPolyCoords);

//                   return (
//                     <Polygon
//                       key={`sub-poly-${idx}`}
//                       coordinates={validPolyCoords}
//                       strokeColor="#0284c7"
//                       strokeWidth={2}
//                       fillColor="rgba(2, 132, 199, 0.22)"
//                       tappable={true}
//                       onPress={() => {
//                         setSelectedPincodeInfo(
//                           `${sub.location_name}${sub.pincode ? " (" + sub.pincode + ")" : ""}`
//                         );
//                       }}
//                     />
//                   );
//                 });

//                 // Compute Master Outer Hub Boundary Polygon connecting ONLY existing pincodes
//                 const masterHubHullCoords = getConvexHullCoordinates(allPincodeBoundaryPoints);
//                 const validHullCoords = masterHubHullCoords.filter(
//                   (pt) => pt && typeof pt.latitude === "number" && Number.isFinite(pt.latitude) && typeof pt.longitude === "number" && Number.isFinite(pt.longitude)
//                 );

//                 return (
//                   <>
//                     {/* MASTER HUB OUTER BOUNDARY POLYGON */}
//                     {validHullCoords.length >= 3 && (
//                       <Polygon
//                         coordinates={validHullCoords}
//                         strokeColor="#FFD700"
//                         strokeWidth={4}
//                         fillColor="rgba(255, 215, 0, 0.16)"
//                         tappable={true}
//                         onPress={() => {
//                           setSelectedPincodeInfo(`Hub Zone: ${assignedHubName}`);
//                         }}
//                       />
//                     )}

//                     {/* INDIVIDUAL PINCODE POLYGONS */}
//                     {pincodeElements}
//                   </>
//                 );
//               })()}
//             </MapView>

//             {/* FLOATING INTERACTIVE PINCODE / LOCATION CALLOUT BANNER */}
//             {selectedPincodeInfo && (
//               <View style={styles.pincodeInfoCallout}>
//                 <Ionicons name="location-sharp" size={18} color="#0284c7" />
//                 <Text style={styles.pincodeInfoCalloutText}>
//                   {selectedPincodeInfo}
//                 </Text>
//                 <TouchableOpacity onPress={() => setSelectedPincodeInfo(null)} style={{ marginLeft: 6 }}>
//                   <Ionicons name="close-circle" size={20} color="#64748b" />
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* OUT OF ZONE ALERT BANNER */}
//             {isOutOfZone && (
//               <View style={styles.zoneAlertBanner}>
//                 <Ionicons name="warning" size={24} color="#dc2626" />
//                 <View style={{ flex: 1, marginLeft: 8 }}>
//                   <Text style={styles.zoneAlertBannerTitle}>
//                     Zone Boundary Crossed!
//                   </Text>
//                   <Text style={styles.zoneAlertBannerMessage}>
//                     You are outside your assigned hub zone ({assignedHubName}).
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {/* RAPIDO-STYLE BOTTOM CARD */}
//             <View style={styles.zoneBottomCard}>
//               <View style={{ marginBottom: 8 }}>
//                 <Text style={styles.zoneCardLabel}>ASSIGNED SERVICE ZONE & PINCODES</Text>
//                 <Text style={styles.zoneCardHubName}>{assignedHubName}</Text>
//                 <ScrollView
//                   style={styles.pincodesScrollView}
//                   nestedScrollEnabled={true}
//                   showsVerticalScrollIndicator={true}
//                 >
//                   <Text style={styles.zoneCardLocations}>
//                     {hubSubLocations.length > 0
//                       ? hubSubLocations
//                         .map(
//                           (item) =>
//                             `${item.location_name}${item.pincode ? " (" + item.pincode + ")" : ""
//                             }`
//                         )
//                         .join(" • ")
//                       : assignedLocationsStr || "Hub Area: " + assignedHubName}
//                   </Text>
//                 </ScrollView>
//               </View>

//               {/* RAPIDO-STYLE JOIN WORK ZONE & NAVIGATE BUTTON */}
//               <TouchableOpacity
//                 style={styles.navigateBtn}
//                 onPress={handleNavigateToZone}
//               >
//                 <Ionicons name="navigate-sharp" size={20} color="#000000" />
//                 <Text style={styles.navigateBtnText}>
//                   Join Work Zone & Navigate
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* ================= CUSTOM LOGOUT MODAL ================= */}
//       <Modal
//         visible={showLogoutModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowLogoutModal(false)}
//       >
//         <View style={styles.dutyModalOverlay}>
//           <View style={styles.dutyModalCard}>
//             <View style={styles.iconCircleRedCenter}>
//               <Ionicons name="help-circle" size={32} color="#ef4444" />
//             </View>
//             <Text style={styles.dutyModalTitle}>Confirm Logout</Text>
//             <Text style={styles.dutyModalMessage}>
//               Do you want to logout?
//             </Text>

//             <View style={styles.modalInfoBoxRed}>
//               <Text style={styles.modalInfoBoxTextRed}>
//                 ⚠️ You will be signed out of your account. You will need to log
//                 in again to access your partner dashboard.
//               </Text>
//             </View>

//             <View style={styles.dutyButtonRow}>
//               <TouchableOpacity
//                 style={styles.dutyCancelBtn}
//                 onPress={() => setShowLogoutModal(false)}
//               >
//                 <Text style={styles.dutyCancelText}>No, Go Back</Text>
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
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff" },
//   header: {
//     height: 72,
//     paddingHorizontal: 20,
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
//   logo: { width: 190, height: 64 },
//   bellIcon: { position: "relative" },
//   badge: {
//     position: "absolute",
//     top: -6,
//     right: -10,
//     backgroundColor: "#000",
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badgeText: { color: "#FFD700", fontWeight: "800", fontSize: 12 },

//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 10,
//   },

//   menu: {
//     position: "absolute",
//     top: 72,
//     right: 20,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     elevation: 6,
//     width: 150,
//     zIndex: 20,
//   },

//   menuItem: { padding: 14 },

//   menuText: { fontSize: 15, fontWeight: "600" },

//   sliderWrapper: {
//     height: SLIDER_HEIGHT,
//     marginHorizontal: 16,
//     marginTop: 10,
//     marginBottom: 8,
//     borderRadius: 18,
//     overflow: "hidden",
//   },
//   slideImage: { width: width - 32, height: SLIDER_HEIGHT },

//   summaryRow: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     gap: 8,
//     marginTop: 6,
//   },
//   summaryBox: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 6,
//     alignItems: "center",
//     backgroundColor: "#f9fafb",
//     borderWidth: 1,
//   },
//   pendingBox: {
//     borderColor: "#facc15",
//   },
//   assignedBox: { borderColor: "#f97316" },
//   completedBox: { borderColor: "#16a34a" },
//   cancelledBox: { borderColor: "#ef4444" },
//   summaryTitle: { fontWeight: "600", marginBottom: 6, fontSize: 13 },
//   summaryCount: { fontSize: 18, fontWeight: "800" },

//   availabilityWrapper: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 4,
//     marginBottom: 4,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 14,
//     backgroundColor: "#f9fafb",
//     borderWidth: 1,
//     borderColor: "#dae90b",
//   },

//   availabilityText: { fontSize: 16, fontWeight: "700" },

//   customerCareWrapper: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//   },

//   customerCareBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#000",
//     backgroundColor: "#fff",
//   },

//   customerCareText: { fontSize: 14, fontWeight: "800" },

//   fixedButtonWrapper: {
//     paddingHorizontal: 40,
//     paddingBottom: 10,
//     backgroundColor: "#fff",
//   },
//   primaryBtn: {
//     backgroundColor: "#FFD700",
//     paddingVertical: 14,
//     borderRadius: 18,
//     alignItems: "center",
//   },
//   primaryBtnText: { fontWeight: "800", fontSize: 16 },

//   footer: {
//     height: 70,
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   footerItem: { alignItems: "center" },
//   footerText: { fontSize: 12, marginTop: 4, fontWeight: "600" },
//   footerTextActive: { fontSize: 12, marginTop: 4, fontWeight: "800" },

//   dots: {
//     position: "absolute",
//     bottom: 10,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "center",
//   },

//   dot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: "#ccc",
//     marginHorizontal: 4,
//   },

//   actionWrapper: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     gap: 10,
//   },

//   actionBtnRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },

//   activeDot: {
//     backgroundColor: "#000",
//   },

//   dutyModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dutyModalCard: {
//     width: "85%",
//     backgroundColor: "#FFFBEB",
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
//     fontSize: 15,
//     color: "#4B5563",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 22,
//     fontWeight: "500",
//   },
//   dutyButtonRow: {
//     flexDirection: "row",
//     marginTop: 22,
//     gap: 12,
//     width: "100%",
//   },
//   dutyCancelBtn: {
//     flex: 1,
//     backgroundColor: "#E5E7EB",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   dutyCancelText: {
//     color: "#374151",
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   dutyConfirmBtn: {
//     flex: 1,
//     backgroundColor: "#FFD700",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   dutyConfirmText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   sectionHeaderWrapper: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   sectionHeaderWithSubRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginTop: 14,
//     marginBottom: 4,
//   },
//   sectionHeaderText: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   sectionSubHeaderText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#6b7280",
//   },
//   dutyHoursRow: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     gap: 8,
//     marginTop: 4,
//     marginBottom: 6,
//   },
//   dutyHoursBox: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 6,
//     alignItems: "center",
//     backgroundColor: "#FFFBEB",
//     borderWidth: 1.5,
//     borderColor: "#FFD700",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dutyHoursTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#4b5563",
//     marginBottom: 4,
//   },
//   dutyHoursValue: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#111827",
//   },

//   /* DRAGGABLE & FLOATING ZONE BUTTON STYLES */
//   draggableContainer: {
//     position: "absolute",
//     bottom: 24,
//     right: 20,
//     zIndex: 999,
//     elevation: 10,
//   },
//   floatingZoneBtn: {
//     width: 66,
//     height: 66,
//     borderRadius: 33,
//     borderWidth: 2,
//     borderColor: "#ffffff",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 4,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//   },
//   floatingBtnText: {
//     color: "#ffffff",
//     fontSize: 9,
//     fontWeight: "900",
//     textAlign: "center",
//     marginTop: 2,
//   },
//   zoneStatusBadge: {
//     position: "absolute",
//     top: 2,
//     right: 2,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: "#ffffff",
//   },
//   zoneModalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#ffffff",
//   },
//   zoneBackBtn: {
//     padding: 6,
//     borderRadius: 20,
//     backgroundColor: "#f3f4f6",
//   },
//   zoneModalHeaderTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   zoneModalHeaderSub: {
//     fontSize: 12,
//     color: "#6b7280",
//     fontWeight: "500",
//     marginTop: 1,
//   },
//   zoneHeaderStatusPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   zoneAlertBanner: {
//     position: "absolute",
//     top: 10,
//     left: 16,
//     right: 16,
//     backgroundColor: "#fef2f2",
//     borderWidth: 1.5,
//     borderColor: "#ef4444",
//     borderRadius: 14,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//   },
//   zoneAlertBannerTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: "#991b1b",
//   },
//   zoneAlertBannerMessage: {
//     fontSize: 12,
//     color: "#7f1d1d",
//     marginTop: 2,
//     fontWeight: "500",
//   },
//   zoneBottomCard: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#ffffff",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 28,
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//   },
//   zoneCardLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#6b7280",
//     letterSpacing: 0.5,
//   },
//   zoneCardHubName: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#111827",
//     marginTop: 2,
//   },
//   pincodesScrollView: {
//     maxHeight: 56,
//     marginVertical: 4,
//   },
//   zoneCardLocations: {
//     fontSize: 13,
//     color: "#4b5563",
//     lineHeight: 18,
//   },
//   navigateBtn: {
//     backgroundColor: "#FFD700",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 14,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: "#000000",
//   },
//   navigateBtnText: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#000000",
//   },

//   pincodeInfoCallout: {
//     position: "absolute",
//     top: 14,
//     alignSelf: "center",
//     backgroundColor: "#ffffff",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     borderWidth: 1.5,
//     borderColor: "#0284c7",
//     zIndex: 999,
//   },
//   pincodeInfoCalloutText: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: "#0f172a",
//   },

//   /* RAPIDO-STYLE BADGE STYLES */
//   rapidoPillBadge: {
//     backgroundColor: "#0f172a",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   rapidoPillText: {
//     color: "#ffffff",
//     fontSize: 11,
//     fontWeight: "800",
//   },
//   masterHubPillBadge: {
//     backgroundColor: "#FFD700",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: "#000000",
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   masterHubPillText: {
//     color: "#000000",
//     fontSize: 12,
//     fontWeight: "900",
//   },
//   outOfZoneBanner: {
//     backgroundColor: "#ef4444",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 4,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   outOfZoneBannerTitle: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 14,
//   },
//   outOfZoneBannerSub: {
//     color: "#ffffff",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   /* CUSTOM PALE-YELLOW ROUNDED OUT OF BOUNDS MODAL STYLES */
//   boundsModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.55)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   boundsModalCard: {
//     width: "100%",
//     backgroundColor: "#FFFBEB", // Pale Yellow background
//     borderRadius: 24, // Rounded corner radius
//     borderWidth: 1.5,
//     borderColor: "#FCD34D", // Soft gold border
//     padding: 24,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   boundsIconCircle: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#FEF3C7", // Pale yellow icon background
//     borderWidth: 2,
//     borderColor: "#F59E0B",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   boundsModalTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#78350F",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   boundsModalMessage: {
//     fontSize: 14,
//     color: "#92400E",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//     paddingHorizontal: 8,
//   },
//   boundsButtonColumn: {
//     width: "100%",
//     gap: 10,
//   },
//   boundsPrimaryBtn: {
//     backgroundColor: "#FFD700", // Filled clickable gold button
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 14,
//     gap: 8,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   boundsPrimaryBtnText: {
//     color: "#000000",
//     fontWeight: "800",
//     fontSize: 15,
//   },
//   boundsSecondaryBtn: {
//     backgroundColor: "#1E293B", // Filled clickable slate button
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 14,
//     gap: 8,
//     elevation: 3,
//   },
//   boundsSecondaryBtnText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   boundsDismissBtn: {
//     paddingVertical: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 2,
//   },
//   boundsDismissText: {
//     color: "#78350F",
//     fontWeight: "600",
//     fontSize: 14,
//     textDecorationLine: "underline",
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
//   modalInfoBoxRed: {
//     width: "100%",
//     backgroundColor: "#fef2f2",
//     borderWidth: 1,
//     borderColor: "#fca5a5",
//     borderRadius: 14,
//     padding: 14,
//     marginTop: 14,
//   },
//   modalInfoBoxTextRed: {
//     fontSize: 13,
//     color: "#991b1b",
//     lineHeight: 18,
//   },
//   modalDangerBtn: {
//     flex: 1,
//     backgroundColor: "#ef4444",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalDangerBtnText: {
//     color: "#ffffff",
//     fontWeight: "700",
//     fontSize: 15,
//   },
// });


















import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useFocusEffect, usePathname } from "expo-router";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationDisclosureModal from "../components/LocationDisclosureModal";
import { scheduleDailyDutyReminders } from "../lib/dutyReminders";
import { LOCATION_TASK_NAME } from "../lib/locationTask";
import { turnOffDutyAndLogout } from "../lib/logout";
import { authApi, partnerApi } from "../lib/api";
import { registerForPushNotificationsAsync } from "./notifications";

const { height, width } = Dimensions.get("window");
const SLIDER_HEIGHT = height * 0.42;

export default function MyRoleScreen() {
  const pathname = usePathname();

  const [newCount, setNewCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dutyModalVisible, setDutyModalVisible] = useState(false);
  const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);
  const [targetDutyValue, setTargetDutyValue] = useState<boolean | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDisclosureVisible, setLocationDisclosureVisible] = useState(false);
  const [outOfBoundsModalVisible, setOutOfBoundsModalVisible] = useState(false);
  const [todayDutyMinutes, setTodayDutyMinutes] = useState(0);
  const [weeklyDutyMinutes, setWeeklyDutyMinutes] = useState(0);
  const [monthlyDutyMinutes, setMonthlyDutyMinutes] = useState(0);
  const [dutyStartedAt, setDutyStartedAt] = useState<string | null>(null);
  const [dutyLogsJson, setDutyLogsJson] = useState<Record<string, number>>({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const dbTodayMinsRef = useRef<number>(0);
  const dbWeeklyMinsRef = useRef<number>(0);
  const dbMonthlyMinsRef = useRef<number>(0);

  /* AUDIO & VIBRATION ALERT FOR OUT OF BOUNDS (PLAY TWICE) */
  const playAlertSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/images/zone_alert.wav")
      );

      let playCount = 0;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish && !status.isLooping) {
          playCount += 1;
          if (playCount < 2) {
            sound.replayAsync();
          } else {
            sound.unloadAsync();
          }
        }
      });

      await sound.playAsync();
      Vibration.vibrate([0, 400, 150, 400, 150, 400]);
    } catch (error) {
      console.log("❌ Alert sound error:", error);
    }
  };

  const triggerOutOfBoundsPopUp = () => {
    setOutOfBoundsModalVisible(true);
    playAlertSound();
  };

  const hasAlertedOutOfBoundsRef = useRef(false);

  /* ZONE MAP & GEOFENCING STATES */
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [isOutOfZone, setIsOutOfZone] = useState(false);
  const [assignedHubName, setAssignedHubName] = useState<string>("Assigned Zone");
  const [assignedLocationsStr, setAssignedLocationsStr] = useState<string>("");
  const [assignedHubCoords, setAssignedHubCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [assignedPincodes, setAssignedPincodes] = useState<string[]>([]);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentAreaName, setCurrentAreaName] = useState<string>("");
  const [selectedPincodeInfo, setSelectedPincodeInfo] = useState<string | null>(null);

  interface HubSubLocation {
    location_name: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  }

  const [hubSubLocations, setHubSubLocations] = useState<HubSubLocation[]>([]);
  const isZoneDataLoadedRef = useRef(false);

  const SUB_LOCATION_COORDS_MAP: Record<string, { latitude: number; longitude: number }> = {
    nallagandla: { latitude: 17.4727, longitude: 78.3183 },
    tellapur: { latitude: 17.4608, longitude: 78.2831 },
    gopanpally: { latitude: 17.4475, longitude: 78.3072 },
    "osman nagar": { latitude: 17.4321, longitude: 78.2912 },
    lingampally: { latitude: 17.4828, longitude: 78.3195 },
    bhel: { latitude: 17.4932, longitude: 78.2985 },
    kollur: { latitude: 17.4435, longitude: 78.2256 },
    serilingampalle: { latitude: 17.4851, longitude: 78.3240 },
    kondapur: { latitude: 17.4622, longitude: 78.3568 },
    gachibowli: { latitude: 17.4401, longitude: 78.3489 },
    miyapur: { latitude: 17.4968, longitude: 78.3614 },
    kukatpally: { latitude: 17.4849, longitude: 78.4138 },
    madhapur: { latitude: 17.4483, longitude: 78.3915 },
    hitech: { latitude: 17.4435, longitude: 78.3772 },
    chandanagar: { latitude: 17.4921, longitude: 78.3302 },
  };

  const HYDERABAD_HUBS: Record<string, { latitude: number; longitude: number }> = {
    "pragathi nagar": { latitude: 17.5255, longitude: 78.397 },
    "kukatpally": { latitude: 17.4947, longitude: 78.3996 },
    "miyapur": { latitude: 17.4968, longitude: 78.3614 },
    "gachibowli": { latitude: 17.4401, longitude: 78.3489 },
    "madhapur": { latitude: 17.4483, longitude: 78.3915 },
    "kondapur": { latitude: 17.4617, longitude: 78.3673 },
    "uppal": { latitude: 17.4056, longitude: 78.5581 },
    "mani konda": { latitude: 17.3982, longitude: 78.3844 },
    "nallagandla": { latitude: 17.4727, longitude: 78.3183 },
  };

  /* ================= FETCH ASSIGNED ZONE & HUB ================= */
  const fetchAssignedHubZone = async () => {
    try {
      const zoneData = await partnerApi.assignedZone();

      if (!zoneData) {
        return;
      }

      const hubName = zoneData.hub_name || "Assigned Zone";
      setAssignedHubName(hubName);
      setAssignedLocationsStr(zoneData.locations || "");
      setAssignedPincodes(zoneData.pincodes || []);

      const subLocs: HubSubLocation[] = (zoneData.sub_locations || []).map(
        (sub: any) => ({
          location_name: sub.location_name,
          pincode: String(sub.pincode || ""),
          latitude: typeof sub.latitude === "number" ? sub.latitude : undefined,
          longitude: typeof sub.longitude === "number" ? sub.longitude : undefined,
        })
      );

      setHubSubLocations(subLocs);

      const validSubCoords = subLocs.filter(
        (s) =>
          typeof s.latitude === "number" &&
          Number.isFinite(s.latitude) &&
          typeof s.longitude === "number" &&
          Number.isFinite(s.longitude)
      );

      if (validSubCoords.length > 0) {
        const sumLat = validSubCoords.reduce((acc, curr) => acc + (curr.latitude || 0), 0);
        const sumLng = validSubCoords.reduce((acc, curr) => acc + (curr.longitude || 0), 0);
        setAssignedHubCoords({
          latitude: sumLat / validSubCoords.length,
          longitude: sumLng / validSubCoords.length,
        });
      } else if (typeof zoneData.latitude === "number" && typeof zoneData.longitude === "number") {
        setAssignedHubCoords({
          latitude: zoneData.latitude,
          longitude: zoneData.longitude,
        });
      }

      isZoneDataLoadedRef.current = true;

      if (currentCoords) {
        checkZoneBoundary(currentCoords.latitude, currentCoords.longitude);
      }
    } catch (error) {
      console.error("❌ Error fetching assigned hub zone:", error);
    }
  };

  /* DRAGGABLE PAN RESPONDER FOR FLOATING BUTTON */
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  /* HAVERSINE MATHEMATICAL DISTANCE IN KM */
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /* GENERATES CONVEX HULL FOR A SET OF POINTS */
  const getConvexHullCoordinates = (points: Array<{ latitude: number; longitude: number }>) => {
    if (!points || points.length < 3) return [];
    const validPoints = points.filter(
      (p) =>
        p &&
        typeof p.latitude === "number" &&
        Number.isFinite(p.latitude) &&
        typeof p.longitude === "number" &&
        Number.isFinite(p.longitude)
    );
    if (validPoints.length < 3) return [];

    const sorted = [...validPoints].sort((a, b) =>
      a.longitude === b.longitude ? a.latitude - b.latitude : a.longitude - b.longitude
    );

    const cross = (o: any, a: any, b: any) =>
      (a.longitude - o.longitude) * (b.latitude - o.latitude) -
      (a.latitude - o.latitude) * (b.longitude - o.longitude);

    const lower: any[] = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper: any[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
  };

  /* GENERATES REALISTIC ORGANIC BOUNDARY POLYGON FOR A PINCODE */
  const generatePincodeBoundaryPoints = (lat: number, lng: number, radiusKm: number = 1.3) => {
    if (
      typeof lat !== "number" ||
      !Number.isFinite(lat) ||
      typeof lng !== "number" ||
      !Number.isFinite(lng)
    )
      return [];
    const cosLat = Math.cos((lat * Math.PI) / 180);
    if (Math.abs(cosLat) < 0.0001) return [];

    const points: Array<{ latitude: number; longitude: number }> = [];
    const numPoints = 12;
    const seed = (Math.abs(lat * 1000) + Math.abs(lng * 1000)) % 10;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints;
      const varRadius = radiusKm * (0.85 + 0.3 * Math.sin(angle * 3 + seed));
      const latOffset = (varRadius / 111) * Math.cos(angle);
      const lngOffset = (varRadius / (111 * cosLat)) * Math.sin(angle);
      const ptLat = lat + latOffset;
      const ptLng = lng + lngOffset;
      if (
        typeof ptLat === "number" &&
        Number.isFinite(ptLat) &&
        typeof ptLng === "number" &&
        Number.isFinite(ptLng)
      ) {
        points.push({
          latitude: ptLat,
          longitude: ptLng,
        });
      }
    }
    return points;
  };

  /* DYNAMIC HUB ENCLOSING BOUNDARY CENTER & RADIUS CALCULATOR */
  const getDynamicHubBoundary = () => {
    const validSubs = hubSubLocations.filter((s) => s.latitude && s.longitude);

    if (validSubs.length === 0) {
      return {
        center: assignedHubCoords || HYDERABAD_HUBS["pragathi nagar"],
        radius: 6500,
      };
    }

    // 1. Compute Centroid of all sub-location pincodes
    const avgLat = validSubs.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSubs.length;
    const avgLng = validSubs.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSubs.length;

    const center = { latitude: avgLat, longitude: avgLng };

    // 2. Compute Maximum Distance to ANY sub-location pincode + margin
    let maxDistKm = 0;
    validSubs.forEach((s) => {
      if (s.latitude && s.longitude) {
        const d = getDistanceFromLatLonInKm(avgLat, avgLng, s.latitude, s.longitude);
        if (d > maxDistKm) maxDistKm = d;
      }
    });

    // Add 2.5 KM padding so every sub-location pincode is 100% inside the circle!
    const radiusMeters = Math.max(7500, Math.ceil((maxDistKm + 2.5) * 1000));

    return { center, radius: radiusMeters };
  };

  /* ================= CHECK ZONE BOUNDARY ================= */
  const checkZoneBoundary = async (lat: number, lng: number) => {
    setCurrentCoords({ latitude: lat, longitude: lng });

    // 0. Safety Gate: Don't evaluate until zone data has finished loading on app launch
    if (!isZoneDataLoadedRef.current && hubSubLocations.length === 0) {
      console.log("⏳ Zone data loading in progress. Postponing boundary evaluation.");
      return false;
    }

    let isInside = false;
    let currentAreaStr = "";

    // 1. DIRECT HUB CENTER PROXIMITY CHECK (4.5 KM radius)
    if (assignedHubCoords) {
      const distToHubKm = getDistanceFromLatLonInKm(
        lat,
        lng,
        assignedHubCoords.latitude,
        assignedHubCoords.longitude
      );
      if (distToHubKm <= 4.5) {
        isInside = true;
      }
    }

    // 2. DIRECT SUB-LOCATION PROXIMITY CHECK (3.5 KM radius to ANY assigned sub-location)
    if (!isInside && hubSubLocations && hubSubLocations.length > 0) {
      for (const sub of hubSubLocations) {
        if (sub.latitude && sub.longitude) {
          const distToSubKm = getDistanceFromLatLonInKm(lat, lng, sub.latitude, sub.longitude);
          if (distToSubKm <= 3.5) {
            isInside = true;
            break;
          }
        }
      }
    }

    try {
      const reversed = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reversed && reversed.length > 0) {
        const place = reversed[0];
        const postalCode = String(place.postalCode || "").trim();
        const namePart = (place.name || place.street || "").trim();
        const subregionPart = (place.subregion || place.district || place.city || "").trim();
        currentAreaStr = `${namePart ? namePart + ", " : ""}${subregionPart}${
          postalCode ? " (" + postalCode + ")" : ""
        }`;
        setCurrentAreaName(currentAreaStr);

        // 3. EXACT ASSIGNED PINCODE MATCH
        if (!isInside && postalCode) {
          const allPincodes = [
            ...assignedPincodes,
            ...hubSubLocations.map((s) => s.pincode).filter(Boolean),
            ...(assignedLocationsStr.match(/\b\d{6}\b/g) || []),
          ];

          if (allPincodes.some((pin) => pin && postalCode.includes(pin.trim()))) {
            isInside = true;
          }
        }

        // 4. ASSIGNED LOCATION KEYWORD MATCH
        if (!isInside && assignedLocationsStr) {
          const keywords = assignedLocationsStr
            .toLowerCase()
            .split(/[•,\n()]+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 2 && !/^\d+$/.test(item));

          const currentWords = `${namePart} ${subregionPart}`.toLowerCase();
          const nameMatch = keywords.some((kw) => kw && currentWords.includes(kw));

          if (nameMatch) {
            isInside = true;
          }
        }
      }
    } catch (e) {
      console.log("Reverse geocode error:", e);
    }

    const outOfBounds = !isInside;
    setIsOutOfZone(outOfBounds);

    if (!outOfBounds) {
      hasAlertedOutOfBoundsRef.current = false;
      setOutOfBoundsModalVisible(false);
    } else {
      if (!hasAlertedOutOfBoundsRef.current) {
        hasAlertedOutOfBoundsRef.current = true;
        setOutOfBoundsModalVisible(true);
        triggerZoneBreachAlert(currentAreaStr || "Outside Zone Area");
        triggerOutOfBoundsPopUp();
      }
    }

    // Update location in FastAPI
    try {
      await partnerApi.updateLocation(lat, lng, outOfBounds);
    } catch (error) {
      console.log("❌ Backend location update error:", error);
    }

    return outOfBounds;
  };

  const triggerZoneBreachAlert = async (currentArea: string) => {
    try {
      await partnerApi.createLocationAlert({
        alert_type: "OUT_OF_ZONE",
        current_location: currentArea,
        assigned_hub: assignedHubName,
      });
    } catch (error) {
      console.error("❌ Error creating location alert:", error);
    }
  };

  const handleNavigateToZone = () => {
    if (assignedHubCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${assignedHubCoords.latitude},${assignedHubCoords.longitude}`;
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(assignedHubName);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const formatMinutesToHours = (totalMinutes: number | string) => {
    const minsNum = Math.max(0, parseInt(String(totalMinutes || 0), 10) || 0);
    if (minsNum === 0) return "0 min";
    const hours = Math.floor(minsNum / 60);
    const mins = minsNum % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins} min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins} min`;
    }
  };

  const calculateDutyTotals = (
    logs: Record<string, number> = {},
    active: boolean = false,
    startedAt: string | null = null
  ) => {
    const todayKey = dayjs().format("YYYY-MM-DD");
    const currentMonthKey = dayjs().format("YYYY-MM");

    // Standard Calendar Week: Monday 00:00 to Sunday 23:59
    const now = dayjs();
    const dayOfWeek = now.day(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = now.subtract(diffToMonday, "day").startOf("day");
    const endOfWeek = startOfWeek.add(6, "day").endOf("day");

    let todayBase = Number(logs[todayKey] || 0);
    let weeklyBase = 0;
    let monthlyBase = 0;

    Object.entries(logs).forEach(([dateStr, mins]) => {
      const minVal = Number(mins) || 0;
      const d = dayjs(dateStr);

      if (d.isValid()) {
        if (
          (d.isSame(startOfWeek, "day") || d.isAfter(startOfWeek)) &&
          (d.isSame(endOfWeek, "day") || d.isBefore(endOfWeek))
        ) {
          weeklyBase += minVal;
        }
        if (dateStr.startsWith(currentMonthKey)) {
          monthlyBase += minVal;
        }
      }
    });

    let activeSessionMins = 0;
    let todayActiveMins = 0;
    let weeklyActiveMins = 0;
    let monthlyActiveMins = 0;

    if (active && startedAt) {
      const start = dayjs(startedAt);
      if (start.isValid() && now.isAfter(start)) {
        activeSessionMins = Math.max(0, now.diff(start, "minute"));

        // Day starts at 12:00 AM midnight today
        const startOfToday = now.startOf("day");
        const effectiveTodayStart = start.isAfter(startOfToday) ? start : startOfToday;
        todayActiveMins = Math.max(0, now.diff(effectiveTodayStart, "minute"));

        const effectiveWeeklyStart = start.isAfter(startOfWeek) ? start : startOfWeek;
        weeklyActiveMins = Math.max(0, now.diff(effectiveWeeklyStart, "minute"));

        const startOfMonth = now.startOf("month");
        const effectiveMonthlyStart = start.isAfter(startOfMonth) ? start : startOfMonth;
        monthlyActiveMins = Math.max(0, now.diff(effectiveMonthlyStart, "minute"));
      }
    }

    const maxTodayMinutes = Math.max(0, now.diff(now.startOf("day"), "minute"));
    const rawToday = todayBase + todayActiveMins;

    return {
      today: Math.min(rawToday, maxTodayMinutes),
      weekly: weeklyBase + weeklyActiveMins,
      monthly: monthlyBase + monthlyActiveMins,
    };
  };

  const sliderRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const liveLocationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ================= LIVE LOCATION TRACKING ================= */
  const startLiveLocationTracking = async (userId: string) => {
    await stopLiveLocationTracking();

    // 0. Ensure location permission is granted
    let { status: fgStatus } = await Location.getForegroundPermissionsAsync();
    if (fgStatus !== "granted") {
      const { status: reqStatus } = await Location.requestForegroundPermissionsAsync();
      fgStatus = reqStatus;
    }

    if (fgStatus !== "granted") {
      console.log("⚠️ Location permission not granted for live tracking.");
      return;
    }

    // 1. Immediate initial location update
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      .then(async (pos) => {
        if (pos?.coords) {
          try {
            await partnerApi.updateLocation(pos.coords.latitude, pos.coords.longitude);
            await checkZoneBoundary(pos.coords.latitude, pos.coords.longitude);
          } catch (err) {
            console.log("Initial location update error:", err);
          }
        }
      })
      .catch((err) => console.log("Initial live location error:", err));

    // 2. Real-time Movement Watcher (fires instantly whenever device moves 1m+)
    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 4000,
          distanceInterval: 5, // 5 meter movement threshold to prevent GPS jitter flickering
        },
        async (pos) => {
          if (pos?.coords) {
            try {
              await partnerApi.updateLocation(pos.coords.latitude, pos.coords.longitude);
              // Check zone boundary in real-time
              checkZoneBoundary(pos.coords.latitude, pos.coords.longitude);
            } catch (err) {
              console.log("❌ Watch location update error:", err);
            }
          }
        }
      );
      locationSubscriptionRef.current = sub;
    } catch (err) {
      console.log("Error starting watchPositionAsync:", err);
    }

    // 3. Rapido-style Background Service (for locked screen / minimized app)
    try {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus === "granted") {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (!isRegistered) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: "Neatify Partner Active 📍",
              notificationBody: "Live location tracking active while on-duty.",
              notificationColor: "#FFD700",
            },
          });
          console.log("✅ Rapido-style background location tracking active");
        }
      }
    } catch (err) {
      console.log("Notice on background service:", err);
    }
  };

  const stopLiveLocationTracking = async () => {
    if (liveLocationIntervalRef.current) {
      clearInterval(liveLocationIntervalRef.current);
      liveLocationIntervalRef.current = null;
    }
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log("🛑 Background location task stopped");
      }
    } catch (err) {
      console.log("Error stopping background task:", err);
    }

    // Clear location in FastAPI
    try {
      await partnerApi.clearLocation();
    } catch (error) {
      console.log("❌ Error clearing partner location:", error);
    }
  };

  useEffect(() => {
    return () => {
      stopLiveLocationTracking();
    };
  }, []);

  /* ================= BACK HANDLER (FIXED) ================= */
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (router.canGoBack()) {
          router.back();
          return true;
        }
        return false; // allow Android default behavior
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => sub.remove();
    }, [])
  );

  /* ================= Notifications load ================= */
const loadNotifications = async () => {
  try {
    const data = await partnerApi.notifications();

    setNotifications(data);
  } catch (error) {
    console.error("❌ Failed to load notifications:", error);
    setNotifications([]);
  }
};

  /* ================= FETCH SLIDES ================= */
  const fetchSlides = async () => {
    try {
      const data = await partnerApi.heroImages();
      const images = Array.isArray(data) ? data : data?.images || [];
      const imageUrls = images.map((item: any) => item.image_url).filter(Boolean);
      setSlides(imageUrls);
    } catch (error) {
      console.error("❌ Failed to fetch hero images:", error);
      setSlides([]);
    }
  };

  /* ================= FETCH AVAILABILITY / DASHBOARD ================= */
  const fetchAvailability = async () => {
    try {
      console.log("🔄 Fetching partner dashboard from FastAPI...");

      const dashboard = await partnerApi.dashboard();

      console.log("✅ Partner dashboard received:", JSON.stringify(dashboard, null, 2));

      if (!dashboard) {
        console.log("⚠️ Dashboard response is empty.");
        return;
      }

      // =====================================================
      // DUTY DATA
      // =====================================================

      const duty = dashboard.duty;

      if (duty) {
        const active = Boolean(duty.is_available);

        setIsAvailable(active);
        setTodayDutyMinutes(Number(duty.today_minutes || 0));
        setWeeklyDutyMinutes(Number(duty.weekly_minutes || 0));
        setMonthlyDutyMinutes(Number(duty.monthly_minutes || 0));

        console.log("🟢 Duty status:", active);
        console.log("⏱️ Duty minutes:", {
          today: duty.today_minutes,
          weekly: duty.weekly_minutes,
          monthly: duty.monthly_minutes,
        });
      }

      // =====================================================
      // BOOKINGS
      // =====================================================

      const bookings = dashboard.bookings;

      if (bookings) {
        setNewCount(Number(bookings.new || 0));
        setAssignedCount(Number(bookings.assigned || 0));
        setCompletedCount(Number(bookings.completed || 0));
        setCancelledCount(Number(bookings.cancelled || 0));

        console.log("📊 Booking counts:", bookings);
      }

      // =====================================================
      // ACTIVE DUTY
      // =====================================================

      if (duty?.is_available) {
        hasAlertedOutOfBoundsRef.current = false;

        await fetchAssignedHubZone();

        if (!locationSubscriptionRef.current) {
          try {
            const currentUser = await authApi.me();
            await startLiveLocationTracking(currentUser.id);
          } catch (error) {
            console.error("❌ Failed to start live tracking:", error);
          }
        }
      } else {
        hasAlertedOutOfBoundsRef.current = false;
        setOutOfBoundsModalVisible(false);
        setIsOutOfZone(false);
        await stopLiveLocationTracking();
      }
    } catch (error) {
      console.error("❌ Failed to fetch partner dashboard:", error);
      Alert.alert(
        "Dashboard Error",
        error instanceof Error ? error.message : "Unable to load partner dashboard."
      );
    }
  };

  /* ================= PROCEED WITH DUTY ACTIVATION ================= */
  const proceedWithDutyActivation = async () => {
    // =====================================================
    // 1. Check GPS
    // =====================================================

    const hasGps = await Location.hasServicesEnabledAsync();

    if (!hasGps) {
      Alert.alert(
        "Location Services Disabled 🛰️",
        "Mobile GPS/Location service is turned OFF. Please turn ON Location in your phone settings to go ON-DUTY.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    // =====================================================
    // 2. Get current location
    // =====================================================

    setLocationLoading(true);

    let initialLocStr = "";
    let isOut = false;

    try {
      const initialPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      initialLocStr = `${initialPos.coords.latitude}, ${initialPos.coords.longitude}`;

      console.log("📍 Initial location:", initialLocStr);

      // Existing zone logic
      await fetchAssignedHubZone();

      isOut = await checkZoneBoundary(initialPos.coords.latitude, initialPos.coords.longitude);
    } catch (error) {
      console.log("❌ Error getting initial location:", error);
    } finally {
      setLocationLoading(false);
    }

    // =====================================================
    // 3. CALL FASTAPI DUTY ON
    // =====================================================

    try {
      console.log("🟢 Calling FastAPI duty ON...");

      const response = await partnerApi.turnOnDuty(initialLocStr);

      console.log("✅ FastAPI duty ON successful:", JSON.stringify(response, null, 2));

      // ===================================================
      // 4. Update local UI
      // ===================================================

      setIsAvailable(true);
      setIsOutOfZone(isOut);

      const nowStr = new Date().toISOString();
      setDutyStartedAt(nowStr);

      // ===================================================
      // 5. Start location tracking
      // ===================================================

      try {
        const currentUser = await authApi.me();
        await startLiveLocationTracking(currentUser.id);
      } catch (error) {
        console.error("❌ Failed to start live tracking:", error);
      }

      // ===================================================
      // 6. Refresh dashboard
      // ===================================================

      await fetchAvailability();

      // ===================================================
      // 7. Out-of-zone alert
      // ===================================================

      if (isOut) {
        triggerOutOfBoundsPopUp();
      }
    } catch (error) {
      console.error("❌ FastAPI duty ON failed:", error);
      setIsAvailable(false);
      Alert.alert(
        "Unable to Go ON-DUTY",
        error instanceof Error ? error.message : "FastAPI could not update your duty status."
      );
    }
  };

  /* ================= HANDLE LOCATION DISCLOSURE CONTINUE ================= */
  const handleLocationDisclosureContinue = async () => {
    setLocationDisclosureVisible(false);

    // =====================================================
    // 1. Foreground Location Permission
    // =====================================================

    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();

    if (fgStatus !== "granted") {
      Alert.alert(
        "Location Permission Required 📍",
        "Permission to access location was denied. Please grant location access in your device settings to go ON-DUTY.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    // =====================================================
    // 2. Background Location Permission
    // =====================================================

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

    if (bgStatus !== "granted") {
      Alert.alert(
        "Background Location Permission Required 📍",
        "Background location permission is required so Neatify can assign jobs and track duty status while on duty.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    // =====================================================
    // 3. FastAPI Duty ON
    // =====================================================

    await proceedWithDutyActivation();
  };

  const handleLocationDisclosureCancel = () => {
    setLocationDisclosureVisible(false);
    setTargetDutyValue(null);
  };

  /* ================= CONFIRM DUTY CHANGE ================= */
  const confirmDutyChange = async () => {
    if (targetDutyValue === null) {
      return;
    }

    const value = targetDutyValue;

    setDutyModalVisible(false);

    // =====================================================
    // DUTY ON
    // =====================================================

    if (value === true) {
      const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();

      if (fgStatus !== "granted" || bgStatus !== "granted") {
        setLocationDisclosureVisible(true);
        return;
      }

      await proceedWithDutyActivation();
      return;
    }

    // =====================================================
    // DUTY OFF
    // =====================================================

    try {
      console.log("🔴 Calling FastAPI duty OFF...");

      // ---------------------------------------------------
      // Stop device location tracking
      // ---------------------------------------------------

      await stopLiveLocationTracking();

      // ---------------------------------------------------
      // Call FastAPI
      // ---------------------------------------------------

      const response = await partnerApi.turnOffDuty();

      console.log("✅ FastAPI duty OFF successful:", JSON.stringify(response, null, 2));

      // ---------------------------------------------------
      // Update local UI
      // ---------------------------------------------------

      setIsAvailable(false);
      setIsOutOfZone(false);
      setOutOfBoundsModalVisible(false);
      setDutyStartedAt(null);

      // ---------------------------------------------------
      // Reload dashboard from backend
      // ---------------------------------------------------

      await fetchAvailability();
    } catch (error) {
      console.error("❌ FastAPI duty OFF failed:", error);
      Alert.alert(
        "Unable to Go OFF-DUTY",
        error instanceof Error ? error.message : "FastAPI could not update your duty status."
      );
    }
  };

  /* ================= CONFIRM LOGOUT ACTION ================= */
  const confirmLogoutAction = async () => {
    setLoadingLogout(true);

    try {
      setIsAvailable(false);
      await stopLiveLocationTracking();
      await turnOffDutyAndLogout();
      setShowLogoutModal(false);
      router.replace("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleCustomerCare = () => {
    setCustomerCareModalVisible(true);
  };

  /* ================= LIVE DUTY TIMER TICK ================= */
  useEffect(() => {
    if (!isAvailable || !dutyStartedAt) {
      return;
    }

    const updateTimer = () => {
      const totals = calculateDutyTotals(dutyLogsJson, true, dutyStartedAt);

      setTodayDutyMinutes(totals.today);
      setWeeklyDutyMinutes(totals.weekly);
      setMonthlyDutyMinutes(totals.monthly);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 15000);

    return () => clearInterval(interval);
  }, [isAvailable, dutyStartedAt, dutyLogsJson]);

  useEffect(() => {
    fetchSlides();
  }, []);

  /* ================= USE FOCUS EFFECT ================= */
  useFocusEffect(
    useCallback(() => {
      const initScreen = async () => {
        await fetchAvailability();
        await fetchAssignedHubZone();
        await loadNotifications();
      };

      initScreen();
    }, [])
  );

  /* ================= NOTIFICATIONS SETUP ================= */
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await scheduleDailyDutyReminders();

        const token = await registerForPushNotificationsAsync();

        if (token) {
          console.log("Push Token:", token);
          await partnerApi.updatePushToken(token);
          console.log("✅ Token saved to backend");
        }
      } catch (error) {
        console.log("❌ Notification setup error:", error);
      }
    };

    setupNotifications();
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (slides.length === 0) return;

    autoScrollRef.current = setInterval(() => {
      const next = (activeSlide + 1) % slides.length;
      sliderRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveSlide(next);
    }, 3000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [activeSlide, slides.length]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  /* ================= UPDATE AVAILABILITY ================= */
  const handleToggleAvailability = (value: boolean) => {
    setTargetDutyValue(value);
    setDutyModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />

        <View style={styles.headerRight}>
          {/* CUSTOMER CARE CALL BUTTON */}
          <TouchableOpacity onPress={handleCustomerCare} style={{ padding: 2 }}>
            <Ionicons name="call" size={26} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellIcon}
            onPress={() => router.push("/new-services")}
          >
            <Ionicons name="notifications" size={26} color="#000" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="person-circle-outline" size={34} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      {/* DROPDOWN */}
      {showMenu && (
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)} />
      )}
      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              router.push("/my-account");
            }}
          >
            <Text style={styles.menuText}>My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              handleLogout();
            }}
          >
            <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={[{ key: "main" }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await fetchAvailability();
                await loadNotifications();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        renderItem={() => (
          <View style={styles.container}>
            <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

            {/* SLIDER */}
            <View style={styles.sliderWrapper}>
              <FlatList
                ref={sliderRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                onMomentumScrollEnd={(e) =>
                  setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / width))
                }
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.slideImage}
                    contentFit="cover"
                    cachePolicy="disk" // 🔥 Enables disk caching
                    transition={300} // Smooth fade effect
                  />
                )}
              />

              <View style={styles.dots}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, activeSlide === i && styles.activeDot]}
                  />
                ))}
              </View>
            </View>

            {/* OUT OF BOUNDS WARNING BANNER ON HOME SCREEN */}
            {isOutOfZone && (
              <TouchableOpacity
                style={styles.outOfZoneBanner}
                onPress={() => {
                  fetchAssignedHubZone();
                  setZoneModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="warning" size={24} color="#fff" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.outOfZoneBannerTitle}>OUT OF BOUNDS ALERT! 🚨</Text>
                  <Text style={styles.outOfZoneBannerSub}>
                    Outside assigned zone ({assignedHubName}). Tap to view zone & navigate.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}

            {/* TOGGLE */}
            <View style={styles.availabilityWrapper}>
              <Text style={styles.availabilityText}>GO ON-DUTY</Text>
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailability}
                trackColor={{ false: "#ede4e4", true: "#0fd357" }}
              />
            </View>

            {/* WORKING HOURS SECTION HEADER */}
            <View style={styles.sectionHeaderWrapper}>
              <Text style={styles.sectionHeaderText}>Working Hours</Text>
            </View>

            {/* DUTY HOURS SUMMARY BOXES */}
            <View style={styles.dutyHoursRow}>
              {/* TODAY */}
              <View style={styles.dutyHoursBox}>
                <Text style={styles.dutyHoursTitle}>Today</Text>
                <Text style={styles.dutyHoursValue}>
                  {formatMinutesToHours(todayDutyMinutes)}
                </Text>
              </View>

              {/* WEEKLY */}
              <View style={styles.dutyHoursBox}>
                <Text style={styles.dutyHoursTitle}>Weekly</Text>
                <Text style={styles.dutyHoursValue}>
                  {formatMinutesToHours(weeklyDutyMinutes)}
                </Text>
              </View>

              {/* MONTHLY */}
              <View style={styles.dutyHoursBox}>
                <Text style={styles.dutyHoursTitle}>Monthly</Text>
                <Text style={styles.dutyHoursValue}>
                  {formatMinutesToHours(monthlyDutyMinutes)}
                </Text>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionWrapper}>
              {/* Calendar FIRST (COMMENTED OUT)
              <TouchableOpacity
                style={[styles.primaryBtn, styles.actionBtnRow]}
                onPress={() => router.push("./availability-calendar")}
              >
                <Ionicons name="calendar-outline" size={18} color="#000" />
                <Text style={styles.primaryBtnText}>
                  My Availability Calendar
                </Text>
              </TouchableOpacity>
              */}

              {/* Assigned Services SECOND (COMMENTED OUT)
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push("/assigned-services")}
              >
                <Text style={styles.primaryBtnText}>My Assigned Services</Text>
              </TouchableOpacity>
              */}
            </View>

            {/* SERVICE SUMMARY SECTION HEADER */}
            <View style={styles.sectionHeaderWithSubRow}>
              <Text style={styles.sectionHeaderText}>Service Summary</Text>
              <Text style={styles.sectionSubHeaderText}>Tap box to view</Text>
            </View>

            {/* SUMMARY */}
            <View style={styles.summaryRow}>
              {/* PENDING (COMMENTED OUT)
              <TouchableOpacity
                style={[styles.summaryBox, { borderColor: "#facc15" }]}
                onPress={() => router.push("/pending-services")}
              >
                <Text style={styles.summaryTitle}>Pending</Text>
                <Text style={[styles.summaryCount, { color: "#facc15" }]}>
                  {pendingCount}
                </Text>
              </TouchableOpacity>
              */}

              {/* ASSIGNED */}
              <TouchableOpacity
                style={[styles.summaryBox, styles.assignedBox]}
                onPress={() => router.push("/assigned-services")}
              >
                <Text style={styles.summaryTitle}>Assigned</Text>
                <Text style={[styles.summaryCount, { color: "#f97316" }]}>
                  {assignedCount}
                </Text>
              </TouchableOpacity>

              {/* COMPLETED */}
              <TouchableOpacity
                style={[styles.summaryBox, styles.completedBox]}
                onPress={() => router.push("/dashboard")}
              >
                <Text style={styles.summaryTitle}>Completed</Text>
                <Text style={[styles.summaryCount, { color: "#16a34a" }]}>
                  {completedCount}
                </Text>
              </TouchableOpacity>

              {/* CANCELLED */}
              <TouchableOpacity
                style={[styles.summaryBox, styles.cancelledBox]}
                onPress={() => router.push("/cancellations")}
              >
                <Text style={styles.summaryTitle}>Cancelled</Text>
                <Text style={[styles.summaryCount, { color: "#ef4444" }]}>
                  {cancelledCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* FOOTER (FIXED) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/my-role")}
        >
          <Ionicons
            name={pathname === "/my-role" ? "home" : "home-outline"}
            size={22}
            color="#000"
          />
          <Text
            style={
              pathname === "/my-role" ? styles.footerTextActive : styles.footerText
            }
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons
            name={pathname === "/dashboard" ? "calendar" : "calendar-outline"}
            size={22}
            color="#000"
          />
          <Text
            style={
              pathname === "/dashboard" ? styles.footerTextActive : styles.footerText
            }
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/my-account")}
        >
          <Ionicons
            name={pathname === "/my-account" ? "person" : "person-outline"}
            size={22}
            color="#000"
          />
          <Text
            style={
              pathname === "/my-account" ? styles.footerTextActive : styles.footerText
            }
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* CUSTOM DUTY MODAL */}
      <Modal visible={dutyModalVisible} transparent animationType="fade">
        <View style={styles.dutyModalOverlay}>
          <View style={styles.dutyModalCard}>
            <View style={styles.dutyIconCircle}>
              <Ionicons
                name={targetDutyValue ? "power" : "power-outline"}
                size={30}
                color={targetDutyValue ? "#16a34a" : "#dc2626"}
              />
            </View>

            <Text style={styles.dutyModalTitle}>
              {targetDutyValue ? "Go ON-DUTY?" : "Go OFF-DUTY?"}
            </Text>
            <Text style={styles.dutyModalMessage}>
              {targetDutyValue
                ? "Are you sure you want to go ON-DUTY?"
                : "Are you sure you want to go OFF-DUTY?"}
            </Text>

            <View style={styles.dutyButtonRow}>
              <TouchableOpacity
                style={styles.dutyCancelBtn}
                onPress={() => setDutyModalVisible(false)}
              >
                <Text style={styles.dutyCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dutyConfirmBtn}
                onPress={confirmDutyChange}
              >
                <Text style={styles.dutyConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CUSTOM CUSTOMER CARE MODAL */}
      <Modal visible={customerCareModalVisible} transparent animationType="fade">
        <View style={styles.dutyModalOverlay}>
          <View style={styles.dutyModalCard}>
            <View style={styles.dutyIconCircle}>
              <Ionicons name="headset" size={30} color="#000" />
            </View>

            <Text style={styles.dutyModalTitle}>Customer Care 🎧</Text>
            <Text style={styles.dutyModalMessage}>+91 7617618567</Text>

            <View style={styles.dutyButtonRow}>
              <TouchableOpacity
                style={styles.dutyCancelBtn}
                onPress={() => setCustomerCareModalVisible(false)}
              >
                <Text style={styles.dutyCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dutyConfirmBtn}
                onPress={() => {
                  setCustomerCareModalVisible(false);
                  Linking.openURL("tel:+917617618567");
                }}
              >
                <Text style={styles.dutyConfirmText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOCATION LOADING MODAL OVERLAY */}
      <Modal visible={locationLoading} transparent animationType="fade">
        <View style={styles.dutyModalOverlay}>
          <View style={styles.dutyModalCard}>
            <ActivityIndicator size="large" color="#FFD700" style={{ marginBottom: 16 }} />
            <Text style={styles.dutyModalTitle}>Fetching Location... 📍</Text>
            <Text style={styles.dutyModalMessage}>
              Getting your live GPS location and verifying your assigned zone boundary...
            </Text>
          </View>
        </View>
      </Modal>

      {/* CUSTOM PALE-YELLOW ROUNDED OUT OF BOUNDS POPUP MODAL */}
      <Modal
        visible={outOfBoundsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOutOfBoundsModalVisible(false)}
      >
        <View style={styles.boundsModalOverlay}>
          <View style={styles.boundsModalCard}>
            <View style={styles.boundsIconCircle}>
              <Ionicons name="warning" size={32} color="#D97706" />
            </View>

            <Text style={styles.boundsModalTitle}>Out of Bounds Alert! 🚨</Text>
            <Text style={styles.boundsModalMessage}>
              You are currently outside your assigned zone ({assignedHubName || "Assigned Zone"}).
              Please move inside your zone to receive and complete customer bookings.
            </Text>

            <View style={styles.boundsButtonColumn}>
              <TouchableOpacity
                style={styles.boundsPrimaryBtn}
                onPress={() => {
                  setOutOfBoundsModalVisible(false);
                  router.push("/zone-map" as any);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="map-outline" size={20} color="#000" />
                <Text style={styles.boundsPrimaryBtnText}>View Zone Map 📍</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.boundsDismissBtn}
                onPress={() => setOutOfBoundsModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.boundsDismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PROMINENT LOCATION DISCLOSURE MODAL FOR GOOGLE PLAY COMPLIANCE */}
      <LocationDisclosureModal
        visible={locationDisclosureVisible}
        onContinue={handleLocationDisclosureContinue}
        onCancel={handleLocationDisclosureCancel}
      />

      {/* DRAGGABLE FLOATING ROUND CIRCULAR ZONE MAP BUTTON */}
      <Animated.View
        style={[
          styles.draggableContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.floatingZoneBtn,
            { backgroundColor: isOutOfZone ? "#ef4444" : "#16a34a" },
          ]}
          onPress={() => {
            router.push("/zone-map" as any);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={24} color="#ffffff" />
          <Text style={styles.floatingBtnText}>
            {isOutOfZone ? "OUT OF BOUNDS" : "IN ZONE"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ZONE MAP OVERLAY MODAL */}
      <Modal visible={zoneModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* HEADER */}
          <View style={styles.zoneModalHeader}>
            <TouchableOpacity
              style={styles.zoneBackBtn}
              onPress={() => setZoneModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.zoneModalHeaderTitle}>
                My Zone: {assignedHubName}
              </Text>
              <Text style={styles.zoneModalHeaderSub} numberOfLines={1}>
                {assignedLocationsStr || "Fetching assigned hub..."}
              </Text>
            </View>
            <View
              style={[
                styles.zoneHeaderStatusPill,
                { backgroundColor: isOutOfZone ? "#fee2e2" : "#dcfce7" },
              ]}
            >
              <Text
                style={{
                  color: isOutOfZone ? "#dc2626" : "#16a34a",
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {isOutOfZone ? "🔴 OUT OF ZONE" : "🟢 IN ZONE"}
              </Text>
            </View>
          </View>

          {/* MAP VIEW */}
          <View style={{ flex: 1 }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude:
                  currentCoords &&
                  typeof currentCoords.latitude === "number" &&
                  Number.isFinite(currentCoords.latitude)
                    ? currentCoords.latitude
                    : assignedHubCoords &&
                      typeof assignedHubCoords.latitude === "number" &&
                      Number.isFinite(assignedHubCoords.latitude)
                    ? assignedHubCoords.latitude
                    : 17.4851,
                longitude:
                  currentCoords &&
                  typeof currentCoords.longitude === "number" &&
                  Number.isFinite(currentCoords.longitude)
                    ? currentCoords.longitude
                    : assignedHubCoords &&
                      typeof assignedHubCoords.longitude === "number" &&
                      Number.isFinite(assignedHubCoords.longitude)
                    ? assignedHubCoords.longitude
                    : 78.3240,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {/* BLUE DOTTED LINE CONNECTING OUT-OF-ZONE STAFF TO WORK ZONE */}
              {isOutOfZone &&
                currentCoords &&
                typeof currentCoords.latitude === "number" &&
                Number.isFinite(currentCoords.latitude) &&
                typeof currentCoords.longitude === "number" &&
                Number.isFinite(currentCoords.longitude) &&
                assignedHubCoords &&
                typeof assignedHubCoords.latitude === "number" &&
                Number.isFinite(assignedHubCoords.latitude) &&
                typeof assignedHubCoords.longitude === "number" &&
                Number.isFinite(assignedHubCoords.longitude) && (
                  <Polyline
                    coordinates={[
                      {
                        latitude: currentCoords.latitude,
                        longitude: currentCoords.longitude,
                      },
                      {
                        latitude: assignedHubCoords.latitude,
                        longitude: assignedHubCoords.longitude,
                      },
                    ]}
                    strokeColor="#0284c7"
                    strokeWidth={4}
                    lineDashPattern={[8, 8]}
                  />
                )}

              {/* LIVE LOCATION MARKER */}
              {currentCoords &&
                typeof currentCoords.latitude === "number" &&
                Number.isFinite(currentCoords.latitude) &&
                typeof currentCoords.longitude === "number" &&
                Number.isFinite(currentCoords.longitude) && (
                  <Marker
                    coordinate={{
                      latitude: currentCoords.latitude,
                      longitude: currentCoords.longitude,
                    }}
                    title="My Live Location"
                    description={currentAreaName || "Your current position"}
                  />
                )}

              {/* INDIVIDUAL PINCODE BOUNDARY POLYGONS (CLEAN, NO CLUTTERED ICONS) */}
              {(() => {
                let allPincodeBoundaryPoints: Array<{
                  latitude: number;
                  longitude: number;
                }> = [];

                const pincodeElements = hubSubLocations.map((sub, idx) => {
                  if (
                    !sub.latitude ||
                    !sub.longitude ||
                    !Number.isFinite(sub.latitude) ||
                    !Number.isFinite(sub.longitude)
                  )
                    return null;

                  const pincodePolyCoords = generatePincodeBoundaryPoints(
                    sub.latitude,
                    sub.longitude,
                    1.2
                  );

                  const validPolyCoords = pincodePolyCoords.filter(
                    (pt) =>
                      pt &&
                      typeof pt.latitude === "number" &&
                      Number.isFinite(pt.latitude) &&
                      typeof pt.longitude === "number" &&
                      Number.isFinite(pt.longitude)
                  );

                  if (validPolyCoords.length < 3) return null;

                  allPincodeBoundaryPoints = allPincodeBoundaryPoints.concat(validPolyCoords);

                  return (
                    <Polygon
                      key={`sub-poly-${idx}`}
                      coordinates={validPolyCoords}
                      strokeColor="#0284c7"
                      strokeWidth={2}
                      fillColor="rgba(2, 132, 199, 0.22)"
                      tappable={true}
                      onPress={() => {
                        setSelectedPincodeInfo(
                          `${sub.location_name}${
                            sub.pincode ? " (" + sub.pincode + ")" : ""
                          }`
                        );
                      }}
                    />
                  );
                });

                // Compute Master Outer Hub Boundary Polygon connecting ONLY existing pincodes
                const masterHubHullCoords = getConvexHullCoordinates(allPincodeBoundaryPoints);
                const validHullCoords = masterHubHullCoords.filter(
                  (pt) =>
                    pt &&
                    typeof pt.latitude === "number" &&
                    Number.isFinite(pt.latitude) &&
                    typeof pt.longitude === "number" &&
                    Number.isFinite(pt.longitude)
                );

                return (
                  <>
                    {/* MASTER HUB OUTER BOUNDARY POLYGON */}
                    {validHullCoords.length >= 3 && (
                      <Polygon
                        coordinates={validHullCoords}
                        strokeColor="#FFD700"
                        strokeWidth={4}
                        fillColor="rgba(255, 215, 0, 0.16)"
                        tappable={true}
                        onPress={() => {
                          setSelectedPincodeInfo(`Hub Zone: ${assignedHubName}`);
                        }}
                      />
                    )}

                    {/* INDIVIDUAL PINCODE POLYGONS */}
                    {pincodeElements}
                  </>
                );
              })()}
            </MapView>

            {/* FLOATING INTERACTIVE PINCODE / LOCATION CALLOUT BANNER */}
            {selectedPincodeInfo && (
              <View style={styles.pincodeInfoCallout}>
                <Ionicons name="location-sharp" size={18} color="#0284c7" />
                <Text style={styles.pincodeInfoCalloutText}>
                  {selectedPincodeInfo}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedPincodeInfo(null)}
                  style={{ marginLeft: 6 }}
                >
                  <Ionicons name="close-circle" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            {/* OUT OF ZONE ALERT BANNER */}
            {isOutOfZone && (
              <View style={styles.zoneAlertBanner}>
                <Ionicons name="warning" size={24} color="#dc2626" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.zoneAlertBannerTitle}>
                    Zone Boundary Crossed!
                  </Text>
                  <Text style={styles.zoneAlertBannerMessage}>
                    You are outside your assigned hub zone ({assignedHubName}).
                  </Text>
                </View>
              </View>
            )}

            {/* RAPIDO-STYLE BOTTOM CARD */}
            <View style={styles.zoneBottomCard}>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.zoneCardLabel}>ASSIGNED SERVICE ZONE & PINCODES</Text>
                <Text style={styles.zoneCardHubName}>{assignedHubName}</Text>
                <ScrollView
                  style={styles.pincodesScrollView}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.zoneCardLocations}>
                    {hubSubLocations.length > 0
                      ? hubSubLocations
                          .map(
                            (item) =>
                              `${item.location_name}${
                                item.pincode ? " (" + item.pincode + ")" : ""
                              }`
                          )
                          .join(" • ")
                      : assignedLocationsStr || "Hub Area: " + assignedHubName}
                  </Text>
                </ScrollView>
              </View>

              {/* RAPIDO-STYLE JOIN WORK ZONE & NAVIGATE BUTTON */}
              <TouchableOpacity
                style={styles.navigateBtn}
                onPress={handleNavigateToZone}
              >
                <Ionicons name="navigate-sharp" size={20} color="#000000" />
                <Text style={styles.navigateBtnText}>
                  Join Work Zone & Navigate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ================= CUSTOM LOGOUT MODAL ================= */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.dutyModalOverlay}>
          <View style={styles.dutyModalCard}>
            <View style={styles.iconCircleRedCenter}>
              <Ionicons name="help-circle" size={32} color="#ef4444" />
            </View>
            <Text style={styles.dutyModalTitle}>Confirm Logout</Text>
            <Text style={styles.dutyModalMessage}>Do you want to logout?</Text>

            <View style={styles.modalInfoBoxRed}>
              <Text style={styles.modalInfoBoxTextRed}>
                ⚠️ You will be signed out of your account. You will need to log in again to
                access your partner dashboard.
              </Text>
            </View>

            <View style={styles.dutyButtonRow}>
              <TouchableOpacity
                style={styles.dutyCancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.dutyCancelText}>No, Go Back</Text>
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
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  header: {
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  logo: { width: 190, height: 64 },
  bellIcon: { position: "relative" },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#000",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFD700", fontWeight: "800", fontSize: 12 },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },

  menu: {
    position: "absolute",
    top: 72,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 6,
    width: 150,
    zIndex: 20,
  },

  menuItem: { padding: 14 },

  menuText: { fontSize: 15, fontWeight: "600" },

  sliderWrapper: {
    height: SLIDER_HEIGHT,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 18,
    overflow: "hidden",
  },
  slideImage: { width: width - 32, height: SLIDER_HEIGHT },

  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 8,
    marginTop: 6,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
  },
  pendingBox: {
    borderColor: "#facc15",
  },
  assignedBox: { borderColor: "#f97316" },
  completedBox: { borderColor: "#16a34a" },
  cancelledBox: { borderColor: "#ef4444" },
  summaryTitle: { fontWeight: "600", marginBottom: 6, fontSize: 13 },
  summaryCount: { fontSize: 18, fontWeight: "800" },

  availabilityWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#dae90b",
  },

  availabilityText: { fontSize: 16, fontWeight: "700" },

  customerCareWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },

  customerCareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
  },

  customerCareText: { fontSize: 14, fontWeight: "800" },

  fixedButtonWrapper: {
    paddingHorizontal: 40,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryBtnText: { fontWeight: "800", fontSize: 16 },

  footer: {
    height: 70,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerItem: { alignItems: "center" },
  footerText: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  footerTextActive: { fontSize: 12, marginTop: 4, fontWeight: "800" },

  dots: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  actionWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },

  actionBtnRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  activeDot: {
    backgroundColor: "#000",
  },

  dutyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dutyModalCard: {
    width: "85%",
    backgroundColor: "#FFFBEB",
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
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    fontWeight: "500",
  },
  dutyButtonRow: {
    flexDirection: "row",
    marginTop: 22,
    gap: 12,
    width: "100%",
  },
  dutyCancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  dutyCancelText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 15,
  },
  dutyConfirmBtn: {
    flex: 1,
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  dutyConfirmText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 15,
  },

  sectionHeaderWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeaderWithSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  dutyHoursRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  dutyHoursBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dutyHoursTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 4,
  },
  dutyHoursValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  /* DRAGGABLE & FLOATING ZONE BUTTON STYLES */
  draggableContainer: {
    position: "absolute",
    bottom: 24,
    right: 20,
    zIndex: 999,
    elevation: 10,
  },
  floatingZoneBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingBtnText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },
  zoneStatusBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  zoneModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  zoneBackBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  zoneModalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  zoneModalHeaderSub: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 1,
  },
  zoneHeaderStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoneAlertBanner: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#ef4444",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  zoneAlertBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#991b1b",
  },
  zoneAlertBannerMessage: {
    fontSize: 12,
    color: "#7f1d1d",
    marginTop: 2,
    fontWeight: "500",
  },
  zoneBottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  zoneCardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  zoneCardHubName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  pincodesScrollView: {
    maxHeight: 56,
    marginVertical: 4,
  },
  zoneCardLocations: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
  navigateBtn: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  navigateBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
  },

  pincodeInfoCallout: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: "#0284c7",
    zIndex: 999,
  },
  pincodeInfoCalloutText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },

  /* RAPIDO-STYLE BADGE STYLES */
  rapidoPillBadge: {
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#38bdf8",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  rapidoPillText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  masterHubPillBadge: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#000000",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  masterHubPillText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "900",
  },
  outOfZoneBanner: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  outOfZoneBannerTitle: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  outOfZoneBannerSub: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 2,
  },
  /* CUSTOM PALE-YELLOW ROUNDED OUT OF BOUNDS MODAL STYLES */
  boundsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  boundsModalCard: {
    width: "100%",
    backgroundColor: "#FFFBEB", // Pale Yellow background
    borderRadius: 24, // Rounded corner radius
    borderWidth: 1.5,
    borderColor: "#FCD34D", // Soft gold border
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  boundsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7", // Pale yellow icon background
    borderWidth: 2,
    borderColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  boundsModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#78350F",
    textAlign: "center",
    marginBottom: 8,
  },
  boundsModalMessage: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  boundsButtonColumn: {
    width: "100%",
    gap: 10,
  },
  boundsPrimaryBtn: {
    backgroundColor: "#FFD700", // Filled clickable gold button
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  boundsPrimaryBtnText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 15,
  },
  boundsSecondaryBtn: {
    backgroundColor: "#1E293B", // Filled clickable slate button
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
  },
  boundsSecondaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  boundsDismissBtn: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boundsDismissText: {
    color: "#78350F",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
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
  modalInfoBoxRed: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  modalInfoBoxTextRed: {
    fontSize: 13,
    color: "#991b1b",
    lineHeight: 18,
  },
  modalDangerBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDangerBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});