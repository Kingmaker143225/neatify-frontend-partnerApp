/// <reference path="./deno.d.ts" />

Deno.serve(async (req: Request) => {
  try {
    const { staff_id, title, body, data } = await req.json();

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") ||
      "https://gdhtydiycsgxcxestwin.supabase.co";
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY") ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHR5ZGl5Y3NneGN4ZXN0d2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTQyMDUsImV4cCI6MjA4ODM3MDIwNX0.nbMCxiA4z35d3Mf7jjQ2PygmRZdIfDuweC3inm0sRC0";

    // 🔹 Get staff push token
    const res = await fetch(
      `${supabaseUrl}/rest/v1/staff_profile?id=eq.${staff_id}&select=push_token`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const dataRes = await res.json();
    const push_token = dataRes?.[0]?.push_token;

    if (!push_token) {
      return new Response(JSON.stringify({ error: "No push token found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🔹 Send notification with channelId, priority, sound for Android heads-up popup
    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: push_token,
        title,
        body,
        sound: "default",
        priority: "high",
        channelId: "default",
        badge: 1,
        data: data || {},
      }),
    });

    const result = await expoRes.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});