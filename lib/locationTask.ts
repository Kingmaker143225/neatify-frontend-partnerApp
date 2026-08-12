import * as TaskManager from "expo-task-manager";
import { supabase } from "./supabase";

export const LOCATION_TASK_NAME = "BACKGROUND_LIVE_LOCATION_TASK";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.log("❌ Background location error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1];
      const liveLocStr = `${location.coords.latitude}, ${location.coords.longitude}`;
      const nowStr = new Date().toISOString();
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: profile } = await supabase
            .from("staff_profile")
            .select("is_available")
            .eq("id", userData.user.id)
            .maybeSingle();

          if (profile?.is_available) {
            await supabase
              .from("staff_profile")
              .update({
                live_location: liveLocStr,
                live_location_updated_at: nowStr,
              })
              .eq("id", userData.user.id);
          }
        }
      } catch (e) {
        console.log("Background DB update error:", e);
      }
    }
  }
});
