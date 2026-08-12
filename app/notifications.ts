import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * 🔥 HANDLER (FOR FOREGROUND + BACKGROUND NOTIFICATIONS)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Immediately initialize Android high-priority channel
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });
}

/**
 * 🔥 REGISTER DEVICE FOR PUSH NOTIFICATIONS
 */
export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission not granted!");
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const token = (
      await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      )
    ).data;

    console.log("✅ EXPO TOKEN:", token);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
    }

    return token;
  } catch (error) {
    console.log("Error registering push notifications:", error);
    return null;
  }
}

/**
 * 🔥 LISTENER (RECEIVE + CLICK + NAVIGATION)
 */
export const useNotificationListener = (router: any) => {
  useEffect(() => {
    // 🔔 Foreground receive
    const notificationSub =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received:", notification);
      });

    // 👉 Click (background / foreground)
    const responseSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        console.log("👉 Notification Clicked:", data);

        // 🔥 Navigate based on data
        if (
          data?.screen === "pending-services" ||
          data?.screen === "assigned-services"
        ) {
          router.push("/assigned-services");
        }

        if (data?.screen === "new-services") {
          router.push("/new-services");
        }
      });

    // 🚀 Cold start (app killed)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;

        console.log("🚀 Opened from notification:", data);

        if (
          data?.screen === "pending-services" ||
          data?.screen === "assigned-services"
        ) {
          router.push("/assigned-services");
        }

        if (data?.screen === "new-services") {
          router.push("/new-services");
        }
      }
    });

    return () => {
      notificationSub.remove();
      responseSub.remove();
    };
  }, []);
};