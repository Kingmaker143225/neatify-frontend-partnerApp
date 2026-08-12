import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export const PRE_DUTY_REMINDER_ID = "daily-duty-pre-reminder";
export const START_DUTY_REMINDER_ID = "daily-duty-start-reminder";
export const END_DUTY_REMINDER_ID = "daily-duty-end-reminder";
export const DUTY_CHANNEL_ID = "duty-reminders";

/**
 * Parses time string formatted as "HH:MM" (e.g. "07:30" or "20:00")
 */
function parseTimeString(
  timeStr: string | undefined,
  fallbackHour: number,
  fallbackMinute: number,
) {
  if (!timeStr) return { hour: fallbackHour, minute: fallbackMinute };
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
      return { hour: h, minute: m };
    }
  }
  return { hour: fallbackHour, minute: fallbackMinute };
}

/**
 * Configure high-priority notification channel with custom sound & vibration for Android 8.0+
 */
export async function setupDutyNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(DUTY_CHANNEL_ID, {
      name: "Daily Duty Reminders ⏰",
      description: "Daily reminders to switch ON/OFF duty mode",
      importance: Notifications.AndroidImportance.MAX,
      sound: "duty_reminder", // refers to duty_reminder.mp3 in res/raw or expo config
      vibrationPattern: [0, 400, 150, 400],
      enableVibrate: true,
      enableLights: true,
      lightColor: "#FFD700",
      showBadge: true,
    });
  }
}

/**
 * Schedules daily duty reminders dynamically from Supabase app_settings table.
 * Defaults:
 * - Pre-duty: 7:30 AM
 * - Start-duty: 8:00 AM
 * - End-duty: 8:00 PM (20:00)
 */
export async function scheduleDailyDutyReminders() {
  try {
    // 1. Request notification permissions if not granted
    const settings = await Notifications.getPermissionsAsync();
    let granted =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!granted) {
      const req = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      granted =
        req.granted ||
        req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    }

    if (!granted) {
      console.log(
        "⚠️ Notification permissions not granted for daily duty reminders.",
      );
      return false;
    }

    // 2. Setup notification channel on Android
    await setupDutyNotificationChannel();

    // 3. Cancel existing scheduled reminders to prevent duplicates
    await cancelDailyDutyReminders();

    // 4. Fetch dynamic timings from Supabase app_settings
    let preDutyTime = { hour: 7, minute: 30 };
    let startDutyTime = { hour: 8, minute: 0 };
    let endDutyTime = { hour: 20, minute: 0 };

    try {
      const { data: settingsData } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", [
          "pre_duty_reminder_time",
          "start_duty_reminder_time",
          "end_duty_reminder_time",
        ]);

      if (settingsData && settingsData.length > 0) {
        settingsData.forEach((row) => {
          if (row.key === "pre_duty_reminder_time") {
            preDutyTime = parseTimeString(row.value, 7, 30);
          } else if (row.key === "start_duty_reminder_time") {
            startDutyTime = parseTimeString(row.value, 8, 0);
          } else if (row.key === "end_duty_reminder_time") {
            endDutyTime = parseTimeString(row.value, 20, 0);
          }
        });
      }
    } catch (dbErr) {
      console.log("Using default duty reminder times.", dbErr);
    }

    const morningBodyText =
      "🌞 Good Morning, Partner!\n\nWishing you a great day ahead!\n\nTo receive service requests through The Neatify Team platform, please ensure your availability status is turned ON in the app.\n\nThank you for being a valued service partner. We wish you many successful bookings today! 💛🖤";

    const eveningBodyText =
      "🌟 Great Job Today, Partner!\n\nThank you for your dedicated service and hard work today. Your shift is complete for the day.\n\nPlease ensure you switch Duty Mode OFF and enjoy a well-deserved rest. We look forward to another successful day tomorrow! 💛🖤";

    // 5. Schedule Notification 1 – Pre-Duty Reminder (Morning 7:30 AM)
    await Notifications.scheduleNotificationAsync({
      identifier: PRE_DUTY_REMINDER_ID,
      content: {
        title: "⏰ Your Duty Starts Soon",
        body: morningBodyText,
        sound: Platform.OS === "android" ? "duty_reminder" : "duty_reminder.mp3",
        vibrate: [0, 400, 150, 400],
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: "duty-reminder",
        data: { type: "pre_duty_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: preDutyTime.hour,
        minute: preDutyTime.minute,
        channelId: DUTY_CHANNEL_ID,
      },
    });

    // 6. Schedule Notification 2 – Start Duty Reminder (Morning 8:00 AM)
    await Notifications.scheduleNotificationAsync({
      identifier: START_DUTY_REMINDER_ID,
      content: {
        title: "🟢 Turn On Duty Mode",
        body: morningBodyText,
        sound: Platform.OS === "android" ? "duty_reminder" : "duty_reminder.mp3",
        vibrate: [0, 400, 150, 400],
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: "duty-start-reminder",
        data: { type: "start_duty_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: startDutyTime.hour,
        minute: startDutyTime.minute,
        channelId: DUTY_CHANNEL_ID,
      },
    });

    // 7. Schedule Notification 3 – End of Duty Reminder (Evening 8:00 PM)
    await Notifications.scheduleNotificationAsync({
      identifier: END_DUTY_REMINDER_ID,
      content: {
        title: "🌙 Turn Off Duty Mode",
        body: eveningBodyText,
        sound: Platform.OS === "android" ? "duty_reminder" : "duty_reminder.mp3",
        vibrate: [0, 400, 150, 400],
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: "duty-end-reminder",
        data: { type: "end_duty_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: endDutyTime.hour,
        minute: endDutyTime.minute,
        channelId: DUTY_CHANNEL_ID,
      },
    });

    console.log("✅ Daily morning & evening duty reminders scheduled successfully!");
    return true;
  } catch (error) {
    console.log("❌ Error scheduling daily duty reminders:", error);
    return false;
  }
}

/**
 * Cancels all scheduled daily duty reminders (e.g. on logout).
 */
export async function cancelDailyDutyReminders() {
  try {
    await Notifications.cancelScheduledNotificationAsync(PRE_DUTY_REMINDER_ID);
    await Notifications.cancelScheduledNotificationAsync(START_DUTY_REMINDER_ID);
    await Notifications.cancelScheduledNotificationAsync(END_DUTY_REMINDER_ID);
    console.log("🛑 Daily duty reminders cancelled.");
  } catch (error) {
    console.log("Error cancelling daily duty reminders:", error);
  }
}
