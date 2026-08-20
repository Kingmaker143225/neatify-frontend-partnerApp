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














import "../lib/locationTask";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../components/Footer";
import {
  registerForPushNotificationsAsync,
  useNotificationListener,
} from "./notifications";

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const hideFooter = pathname === "/login" || keyboardVisible;

  useNotificationListener(router);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );

    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
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