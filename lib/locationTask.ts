// import * as TaskManager from "expo-task-manager";
// import { supabase } from "./supabase";

// export const LOCATION_TASK_NAME = "BACKGROUND_LIVE_LOCATION_TASK";

// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
//   if (error) {
//     console.log("❌ Background location error:", error);
//     return;
//   }
//   if (data) {
//     const { locations } = data;
//     if (locations && locations.length > 0) {
//       const location = locations[locations.length - 1];
//       const liveLocStr = `${location.coords.latitude}, ${location.coords.longitude}`;
//       const nowStr = new Date().toISOString();
//       try {
//         const { data: userData } = await supabase.auth.getUser();
//         if (userData?.user) {
//           const { data: profile } = await supabase
//             .from("staff_profile")
//             .select("is_available")
//             .eq("id", userData.user.id)
//             .maybeSingle();

//           if (profile?.is_available) {
//             await supabase
//               .from("staff_profile")
//               .update({
//                 live_location: liveLocStr,
//                 live_location_updated_at: nowStr,
//               })
//               .eq("id", userData.user.id);
//           }
//         }
//       } catch (e) {
//         console.log("Background DB update error:", e);
//       }
//     }
//   }
// });



















import * as TaskManager from "expo-task-manager";
import { getAccessToken } from "./api";

export const LOCATION_TASK_NAME =
  "BACKGROUND_LIVE_LOCATION_TASK";

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: any) => {
    if (error) {
      console.log(
        "❌ Background location error:",
        error,
      );
      return;
    }

    if (!data) {
      return;
    }

    const { locations } = data;

    if (!locations || locations.length === 0) {
      return;
    }

    const location =
      locations[locations.length - 1];

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    try {
      // Get stored authentication token
      const token = await getAccessToken();

      if (!token) {
        console.log(
          "❌ No access token available for background location",
        );
        return;
      }

      const API_URL = (
        process.env.EXPO_PUBLIC_API_URL || ""
      ).replace(/\/$/, "");

      if (!API_URL) {
        console.log(
          "❌ EXPO_PUBLIC_API_URL is not configured",
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/v1/partner/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        },
      );

      let responseData: any = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        console.log(
          "❌ Background location API failed:",
          response.status,
          responseData,
        );
        return;
      }

      console.log(
        "✅ Background location updated:",
        latitude,
        longitude,
      );
    } catch (e) {
      console.log(
        "❌ Background location update error:",
        e,
      );
    }
  },
);