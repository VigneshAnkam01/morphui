import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  try {
    // Basic health data
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    // Try Supabase if configured
    let dbStatus = "not_configured";
    let totalGenerations = 0;
    let last24h = 0;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { count } = await supabase
          .from("generations")
          .select("*", { count: "exact", head: true });

        const { count: count24h } = await supabase
          .from("generations")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 86400000).toISOString());

        dbStatus = "ok";
        totalGenerations = count ?? 0;
        last24h = count24h ?? 0;
      } catch {
        dbStatus = "error";
      }
    }

    return NextResponse.json({
      status: "ok",
      uptime,
      timestamp: new Date().toISOString(),
      db: dbStatus,
      totalGenerations,
      last24h,
      version: "1.0.0",
      project: "morphui",
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: String(err) },
      { status: 500 }
    );
  }
}
