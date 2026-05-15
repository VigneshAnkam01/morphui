import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return runCleanup(req);
}

export async function GET(req: NextRequest) {
  return runCleanup(req);
}

async function runCleanup(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let deleted = 0;
    let dbStatus = "skipped";

    if (SUPABASE_URL && SUPABASE_ANON) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

      // Delete records older than 30 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const { error, count } = await supabase
        .from("generations")
        .delete({ count: "exact" })
        .lt("created_at", cutoff.toISOString());

      if (error) {
        dbStatus = `error: ${error.message}`;
      } else {
        deleted = count ?? 0;
        dbStatus = "ok";
      }
    } else {
      dbStatus = "supabase_not_configured";
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup complete. ${deleted} old record(s) deleted.`,
      deleted,
      db: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
