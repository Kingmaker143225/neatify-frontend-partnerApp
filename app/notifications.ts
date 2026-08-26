// import Constants from "expo-constants";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
// import { useEffect } from "react";
// import { Platform } from "react-native";

// /**
//  * 🔥 HANDLER (FOR FOREGROUND + BACKGROUND NOTIFICATIONS)
//  */
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// // Immediately initialize Android high-priority channel
// if (Platform.OS === "android") {
//   Notifications.setNotificationChannelAsync("default", {
//     name: "default",
//     importance: Notifications.AndroidImportance.MAX,
//     vibrationPattern: [0, 250, 250, 250],
//     lightColor: "#FF231F7C",
//     sound: "default",
//     enableVibrate: true,
//     showBadge: true,
//   });
// }

// /**
//  * 🔥 REGISTER DEVICE FOR PUSH NOTIFICATIONS
//  */
// export async function registerForPushNotificationsAsync() {
//   try {
//     if (!Device.isDevice) {
//       console.log("Must use physical device for Push Notifications");
//       return;
//     }

//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();

//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       console.log("Notification permission not granted!");
//       return;
//     }

//     const projectId = Constants.expoConfig?.extra?.eas?.projectId;

//     const token = (
//       await Notifications.getExpoPushTokenAsync(
//         projectId ? { projectId } : undefined
//       )
//     ).data;

//     console.log("✅ EXPO TOKEN:", token);

//     if (Platform.OS === "android") {
//       await Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//         sound: "default",
//         enableVibrate: true,
//         showBadge: true,
//       });
//     }

//     return token;
//   } catch (error) {
//     console.log("Error registering push notifications:", error);
//     return null;
//   }
// }

// /**
//  * 🔥 LISTENER (RECEIVE + CLICK + NAVIGATION)
//  */
// export const useNotificationListener = (router: any) => {
//   useEffect(() => {
//     // 🔔 Foreground receive
//     const notificationSub =
//       Notifications.addNotificationReceivedListener((notification) => {
//         console.log("🔔 Notification Received:", notification);
//       });

//     // 👉 Click (background / foreground)
//     const responseSub =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         const data = response.notification.request.content.data;

//         console.log("👉 Notification Clicked:", data);

//         // 🔥 Navigate based on data
//         if (
//           data?.screen === "pending-services" ||
//           data?.screen === "assigned-services"
//         ) {
//           router.push("/assigned-services");
//         }

//         if (data?.screen === "new-services") {
//           router.push("/new-services");
//         }
//       });

//     // 🚀 Cold start (app killed)
//     Notifications.getLastNotificationResponseAsync().then((response) => {
//       if (response) {
//         const data = response.notification.request.content.data;

//         console.log("🚀 Opened from notification:", data);

//         if (
//           data?.screen === "pending-services" ||
//           data?.screen === "assigned-services"
//         ) {
//           router.push("/assigned-services");
//         }

//         if (data?.screen === "new-services") {
//           router.push("/new-services");
//         }
//       }
//     });

//     return () => {
//       notificationSub.remove();
//       responseSub.remove();
//     };
//   }, []);
// };



























// import Constants from "expo-constants";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
// import { useEffect } from "react";
// import { Platform } from "react-native";

// /**
//  * =========================================================
//  * NOTIFICATION HANDLER
//  * =========================================================
//  *
//  * Controls how notifications are presented while the app
//  * is in the foreground.
//  */
// Notifications.setNotificationHandler({
//   handleNotification: async (notification) => {
//     console.log("🔥🔥🔥 FOREGROUND HANDLER CALLED 🔥🔥🔥");

//     console.log(
//       "📌 Notification content:",
//       notification.request.content
//     );

//     return {
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: true,
//       shouldShowBanner: true,
//       shouldShowList: true,
//     };
//   },
// });

// /**
//  * =========================================================
//  * ANDROID NOTIFICATION CHANNEL
//  * =========================================================
//  */

// if (Platform.OS === "android") {
//   Notifications.setNotificationChannelAsync("default", {
//     name: "default",
//     importance: Notifications.AndroidImportance.MAX,
//     vibrationPattern: [0, 250, 250, 250],
//     lightColor: "#FF231F7C",
//     sound: "default",
//     enableVibrate: true,
//     showBadge: true,
//   }).catch((error) => {
//     console.log("❌ Error creating notification channel:", error);
//   });
// }

// /**
//  * =========================================================
//  * REGISTER DEVICE FOR PUSH NOTIFICATIONS
//  * =========================================================
//  */

// export async function registerForPushNotificationsAsync() {
//   try {
//     console.log("🔔 Starting push notification registration...");

//     if (!Device.isDevice) {
//       console.log("❌ Must use a physical device for push notifications");
//       return null;
//     }

//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();

//     console.log("📌 Existing notification permission:", existingStatus);

//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } =
//         await Notifications.requestPermissionsAsync();

//       finalStatus = status;

//       console.log(
//         "📌 Notification permission after request:",
//         finalStatus
//       );
//     }

//     if (finalStatus !== "granted") {
//       console.log("❌ Notification permission not granted!");
//       return null;
//     }

//     const projectId =
//       Constants.expoConfig?.extra?.eas?.projectId;

//     console.log("📌 Expo project ID:", projectId);

//     const token = (
//       await Notifications.getExpoPushTokenAsync(
//         projectId ? { projectId } : undefined
//       )
//     ).data;

//     console.log("✅ EXPO PUSH TOKEN:", token);

//     if (Platform.OS === "android") {
//       await Notifications.setNotificationChannelAsync(
//         "default",
//         {
//           name: "default",
//           importance: Notifications.AndroidImportance.MAX,
//           vibrationPattern: [0, 250, 250, 250],
//           lightColor: "#FF231F7C",
//           sound: "default",
//           enableVibrate: true,
//           showBadge: true,
//         }
//       );

//       console.log("✅ Android notification channel ready");
//     }

//     return token;
//   } catch (error) {
//     console.log(
//       "❌ Error registering push notifications:",
//       error
//     );

//     return null;
//   }
// }

// /**
//  * =========================================================
//  * NOTIFICATION LISTENER
//  * =========================================================
//  */

// export const useNotificationListener = (router: any) => {
//   useEffect(() => {
//     console.log("🔥🔥🔥 NOTIFICATION LISTENER REGISTERING 🔥🔥🔥");

//     /**
//      * -----------------------------------------------------
//      * FOREGROUND NOTIFICATION
//      * -----------------------------------------------------
//      */
//     const notificationSub =
//       Notifications.addNotificationReceivedListener(
//         (notification) => {
//           console.log(
//             "🔥🔥🔥 FOREGROUND NOTIFICATION RECEIVED 🔥🔥🔥"
//           );

//           console.log(
//             "📌 TITLE:",
//             notification.request.content.title
//           );

//           console.log(
//             "📌 BODY:",
//             notification.request.content.body
//           );

//           console.log(
//             "📌 DATA:",
//             notification.request.content.data
//           );

//           console.log(
//             "📌 FULL NOTIFICATION:",
//             notification
//           );
//         }
//       );

//     /**
//      * -----------------------------------------------------
//      * NOTIFICATION CLICK
//      * -----------------------------------------------------
//      */
//     const responseSub =
//       Notifications.addNotificationResponseReceivedListener(
//         (response) => {
//           const data =
//             response.notification.request.content.data;

//           console.log(
//             "👉 NOTIFICATION CLICKED:",
//             data
//           );

//           if (
//             data?.screen === "pending-services" ||
//             data?.screen === "assigned-services"
//           ) {
//             router.push("/assigned-services");
//           }

//           if (data?.screen === "new-services") {
//             router.push("/new-services");
//           }
//         }
//       );

//     /**
//      * -----------------------------------------------------
//      * COLD START
//      * -----------------------------------------------------
//      */
//     Notifications.getLastNotificationResponseAsync()
//       .then((response) => {
//         if (!response) {
//           return;
//         }

//         const data =
//           response.notification.request.content.data;

//         console.log(
//           "🚀 OPENED FROM NOTIFICATION:",
//           data
//         );

//         if (
//           data?.screen === "pending-services" ||
//           data?.screen === "assigned-services"
//         ) {
//           router.push("/assigned-services");
//         }

//         if (data?.screen === "new-services") {
//           router.push("/new-services");
//         }
//       })
//       .catch((error) => {
//         console.log(
//           "❌ Error checking last notification response:",
//           error
//         );
//       });

//     /**
//      * -----------------------------------------------------
//      * CLEANUP
//      * -----------------------------------------------------
//      */
//     return () => {
//       console.log(
//         "🧹 Removing notification listeners"
//       );

//       notificationSub.remove();
//       responseSub.remove();
//     };
//   }, [router]);
// };






















import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * ============================================================
 * 🔔 NOTIFICATION HANDLER
 * ============================================================
 *
 * This controls how notifications are presented while the
 * application is in the foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("🔥🔥🔥 HANDLER CALLED 🔥🔥🔥");
    console.log(
      "🔥 HANDLER TITLE:",
      notification.request.content.title
    );
    console.log(
      "🔥 HANDLER BODY:",
      notification.request.content.body
    );
    console.log(
      "🔥 HANDLER DATA:",
      notification.request.content.data
    );

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

/**
 * ============================================================
 * 📢 ANDROID NOTIFICATION CHANNEL
 * ============================================================
 */
async function setupNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    console.log("🔔 Setting up Android notification channel...");

    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    console.log("✅ Android notification channel ready");
  } catch (error) {
    console.log(
      "❌ Error setting Android notification channel:",
      error
    );
  }
}

/**
 * Initialize channel immediately.
 */
if (Platform.OS === "android") {
  setupNotificationChannel();
}

/**
 * ============================================================
 * 📱 REGISTER DEVICE FOR PUSH NOTIFICATIONS
 * ============================================================
 */
export async function registerForPushNotificationsAsync() {
  try {
    console.log("=================================");
    console.log("🔔 PUSH NOTIFICATION REGISTRATION START");
    console.log("=================================");

    if (!Device.isDevice) {
      console.log(
        "❌ Must use a physical device for Push Notifications"
      );
      return null;
    }

    /**
     * Check current permission
     */
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    console.log(
      "📌 Existing notification permission:",
      existingStatus
    );

    let finalStatus = existingStatus;

    /**
     * Request permission if necessary
     */
    if (existingStatus !== "granted") {
      console.log("📌 Requesting notification permission...");

      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;

      console.log(
        "📌 Notification permission result:",
        finalStatus
      );
    }

    if (finalStatus !== "granted") {
      console.log(
        "❌ Notification permission not granted!"
      );
      return null;
    }

    console.log("✅ Notification permission granted");

    /**
     * Expo EAS project ID
     */
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId;

    console.log("📌 Expo Project ID:", projectId);

    /**
     * Get Expo Push Token
     */
    const token =
      (
        await Notifications.getExpoPushTokenAsync(
          projectId
            ? { projectId }
            : undefined
        )
      ).data;

    console.log("=================================");
    console.log("✅ EXPO PUSH TOKEN:");
    console.log(token);
    console.log("=================================");

    /**
     * Make sure Android channel exists
     */
    await setupNotificationChannel();

    return token;
  } catch (error) {
    console.log(
      "❌ Error registering push notifications:",
      error
    );

    return null;
  }
}

/**
 * ============================================================
 * 🔔 NOTIFICATION LISTENER
 * ============================================================
 *
 * Handles:
 *
 * 1. Foreground notification
 * 2. Notification click
 * 3. App opened from a notification
 */
export const useNotificationListener = (router: any) => {
  useEffect(() => {
    console.log(
      "🔥🔥🔥 NOTIFICATION LISTENER REGISTERED 🔥🔥🔥"
    );

    /**
     * ========================================================
     * 🔔 FOREGROUND NOTIFICATION
     * ========================================================
     */
    const notificationSub =
      Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log(
            "🔥🔥🔥 FOREGROUND NOTIFICATION RECEIVED 🔥🔥🔥"
          );

          console.log(
            "📌 TITLE:",
            notification.request.content.title
          );

          console.log(
            "📌 BODY:",
            notification.request.content.body
          );

          console.log(
            "📌 DATA:",
            notification.request.content.data
          );

          console.log(
            "📌 FULL NOTIFICATION:",
            notification
          );
        }
      );

    /**
     * ========================================================
     * 👉 NOTIFICATION CLICK / RESPONSE
     * ========================================================
     */
    const responseSub =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data =
            response.notification.request.content.data;

          console.log(
            "👉👉👉 NOTIFICATION CLICKED 👉👉👉"
          );

          console.log(
            "📌 CLICK DATA:",
            data
          );

          /**
           * Assigned / Pending Services
           */
          if (
            data?.screen === "pending-services" ||
            data?.screen === "assigned-services"
          ) {
            console.log(
              "➡️ Navigating to assigned-services"
            );

            router.push("/assigned-services");
          }

          /**
           * New Services
           */
          if (data?.screen === "new-services") {
            console.log(
              "➡️ Navigating to new-services"
            );

            router.push("/new-services");
          }
        }
      );

    /**
     * ========================================================
     * 🚀 COLD START
     * ========================================================
     *
     * Handles the case where the application was completely
     * closed and opened by tapping a notification.
     */
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) {
          console.log(
            "ℹ️ No previous notification response"
          );
          return;
        }

        const data =
          response.notification.request.content.data;

        console.log(
          "🚀🚀🚀 OPENED FROM NOTIFICATION 🚀🚀🚀"
        );

        console.log(
          "📌 COLD START DATA:",
          data
        );

        /**
         * Assigned / Pending Services
         */
        if (
          data?.screen === "pending-services" ||
          data?.screen === "assigned-services"
        ) {
          console.log(
            "➡️ Cold start → assigned-services"
          );

          router.push("/assigned-services");
        }

        /**
         * New Services
         */
        if (data?.screen === "new-services") {
          console.log(
            "➡️ Cold start → new-services"
          );

          router.push("/new-services");
        }
      })
      .catch((error) => {
        console.log(
          "❌ Error checking last notification response:",
          error
        );
      });

    /**
     * ========================================================
     * 🧹 CLEANUP
     * ========================================================
     */
    return () => {
      console.log(
        "🧹 Removing notification listeners..."
      );

      notificationSub.remove();
      responseSub.remove();
    };
  }, [router]);
};