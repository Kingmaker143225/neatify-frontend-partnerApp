// import "../lib/locationTask";
// import { Stack, usePathname, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { Keyboard, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Footer from "../components/Footer";
// import { registerForPushNotificationsAsync, useNotificationListener } from "./notifications";

// export default function Layout() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [keyboardVisible, setKeyboardVisible] = useState(false);

//   const hideFooter = pathname === "/login" || keyboardVisible;

//   useNotificationListener(router);

//   useEffect(() => {
//     registerForPushNotificationsAsync();

//     const showSub = Keyboard.addListener("keyboardDidShow", () =>
//       setKeyboardVisible(true),
//     );

//     const hideSub = Keyboard.addListener("keyboardDidHide", () =>
//       setKeyboardVisible(false),
//     );

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       edges={["left", "right", "bottom"]}
//     >
//       <View style={{ flex: 1 }}>
//         <Stack
//           screenOptions={{
//             animation: "none",
//             gestureEnabled: true,
//             gestureDirection: "horizontal",
//             animationDuration: 250,
//             headerShown: false,
//           }}
//         />
//       </View>

//       {!hideFooter && <Footer />}
//     </SafeAreaView>
//   );
// }














// import "../lib/locationTask";
// import { Stack, usePathname, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { Keyboard, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Footer from "../components/Footer";
// import {
//   registerForPushNotificationsAsync,
//   useNotificationListener,
// } from "./notifications";

// export default function Layout() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [keyboardVisible, setKeyboardVisible] = useState(false);

//   const hideFooter = pathname === "/login" || keyboardVisible;

//   useNotificationListener(router);

//   useEffect(() => {
//     registerForPushNotificationsAsync();

//     const showSub = Keyboard.addListener("keyboardDidShow", () =>
//       setKeyboardVisible(true),
//     );

//     const hideSub = Keyboard.addListener("keyboardDidHide", () =>
//       setKeyboardVisible(false),
//     );

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       edges={["left", "right", "bottom"]}
//     >
//       <View style={{ flex: 1 }}>
//         <Stack
//           screenOptions={{
//             animation: "none",
//             gestureEnabled: true,
//             gestureDirection: "horizontal",
//             animationDuration: 250,
//             headerShown: false,
//           }}
//         />
//       </View>

//       {!hideFooter && <Footer />}
//     </SafeAreaView>
//   );
// }











// import "../lib/locationTask";
// import { Stack, usePathname, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { Keyboard, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Footer from "../components/Footer";

// import {
//   registerForPushNotificationsAsync,
//   useNotificationListener,
// } from "./notifications";

// export default function Layout() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [keyboardVisible, setKeyboardVisible] = useState(false);

//   const hideFooter =
//     pathname === "/login" || keyboardVisible;

//   /**
//    * =========================================================
//    * 🔔 NOTIFICATION LISTENER
//    * =========================================================
//    */
//   useNotificationListener(router);

//   /**
//    * =========================================================
//    * 🔔 PUSH REGISTRATION + KEYBOARD LISTENERS
//    * =========================================================
//    */
//   useEffect(() => {
//     console.log("🔥🔥🔥 ROOT LAYOUT MOUNTED 🔥🔥🔥");

//     console.log(
//       "🔔 Starting push notification registration..."
//     );

//     registerForPushNotificationsAsync()
//       .then((token) => {
//         if (token) {
//           console.log(
//             "✅ PUSH REGISTRATION SUCCESS"
//           );
//         } else {
//           console.log(
//             "⚠️ PUSH REGISTRATION RETURNED NULL"
//           );
//         }
//       })
//       .catch((error) => {
//         console.log(
//           "❌ PUSH REGISTRATION ERROR:",
//           error
//         );
//       });

//     /**
//      * Keyboard show
//      */
//     const showSub = Keyboard.addListener(
//       "keyboardDidShow",
//       () => {
//         setKeyboardVisible(true);
//       }
//     );

//     /**
//      * Keyboard hide
//      */
//     const hideSub = Keyboard.addListener(
//       "keyboardDidHide",
//       () => {
//         setKeyboardVisible(false);
//       }
//     );

//     /**
//      * Cleanup
//      */
//     return () => {
//       console.log(
//         "🧹 ROOT LAYOUT UNMOUNTING"
//       );

//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   return (
//     <SafeAreaView
//       style={{
//         flex: 1,
//         backgroundColor: "#fff",
//       }}
//       edges={["left", "right", "bottom"]}
//     >
//       <View style={{ flex: 1 }}>
//         <Stack
//           screenOptions={{
//             animation: "none",
//             gestureEnabled: true,
//             gestureDirection: "horizontal",
//             animationDuration: 250,
//             headerShown: false,
//           }}
//         />
//       </View>

//       {!hideFooter && <Footer />}
//     </SafeAreaView>
//   );
// }
























import "../lib/locationTask";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../components/Footer";

import {
  registerForPushNotificationsAsync,
  testLocalNotification,
  useNotificationListener,
} from "./notifications";

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const hideFooter =
    pathname === "/login" || keyboardVisible;

  /**
   * =========================================================
   * 🔔 NOTIFICATION LISTENER
   * =========================================================
   */
  useNotificationListener(router);

  /**
   * =========================================================
   * 🔔 PUSH REGISTRATION + KEYBOARD LISTENERS
   * =========================================================
   */
  useEffect(() => {
    console.log(
      "🔥🔥🔥 ROOT LAYOUT MOUNTED 🔥🔥🔥"
    );

    console.log(
      "🔔 Starting push notification registration..."
    );

    registerForPushNotificationsAsync()
      .then(async (token) => {
        if (token) {
          console.log(
            "✅ PUSH REGISTRATION SUCCESS"
          );

          console.log(
            "📌 PUSH TOKEN:",
            token
          );

          /**
           * =====================================================
           * 🧪 LOCAL NOTIFICATION TEST
           * =====================================================
           *
           * This is only for testing the Android banner.
           *
           * It does NOT use Firebase.
           * It does NOT use Expo's push server.
           */
          console.log(
            "🧪 Starting local notification test..."
          );

          await testLocalNotification();

          console.log(
            "🧪 Local notification test requested"
          );
        } else {
          console.log(
            "⚠️ PUSH REGISTRATION RETURNED NULL"
          );
        }
      })
      .catch((error) => {
        console.log(
          "❌ PUSH REGISTRATION ERROR:",
          error
        );
      });

    /**
     * =========================================================
     * ⌨️ KEYBOARD SHOW
     * =========================================================
     */
    const showSub = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    /**
     * =========================================================
     * ⌨️ KEYBOARD HIDE
     * =========================================================
     */
    const hideSub = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    /**
     * =========================================================
     * 🧹 CLEANUP
     * =========================================================
     */
    return () => {
      console.log(
        "🧹 ROOT LAYOUT UNMOUNTING"
      );

      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
      edges={["left", "right", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            animation: "none",
            gestureEnabled: true,
            gestureDirection: "horizontal",
            animationDuration: 250,
            headerShown: false,
          }}
        />
      </View>

      {!hideFooter && <Footer />}
    </SafeAreaView>
  );
}