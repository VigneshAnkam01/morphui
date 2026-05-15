import { NextRequest, NextResponse } from "next/server";

// In-memory store as fallback (resets on cold start, but works without any DB)
const memStore: Array<{
  id: string; framework: string; tokens: number;
  provider: string; success: boolean; created_at: string;
}> = [];

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url, token });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  try {
    const redis = await getRedis();

    if (redis) {
      // Upstash Redis path
      const keys = await redis.lrange("generations", 0, limit - 1);
      const data = keys.map((k: unknown) =>
        typeof k === "string" ? JSON.parse(k) : k
      );
      const total = await redis.llen("generations");
      return NextResponse.json({ data, total, source: "redis" });
    }

    // Fallback: in-memory
    const data = memStore.slice(0, limit);
    return NextResponse.json({
      data,
      total: memStore.length,
      source: "memory",
      message: memStore.length === 0
        ? "No generations yet (in-memory store — add UPSTASH_REDIS_REST_URL for persistence)"
        : undefined,
    });
  } catch (err) {
    return NextResponse.json({ data: memStore.slice(0, limit), total: memStore.length, source: "memory", error: String(err) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = {
      id: crypto.randomUUID(),
      framework: body.framework ?? "html",
      tokens: body.tokens ?? 0,
      provider: body.provider ?? "gemini",
      success: body.success ?? true,
      created_at: new Date().toISOString(),
    };

    // Save to memory
    memStore.unshift(record);
    if (memStore.length > 500) memStore.pop();

    // Try Redis too
    try {
      const redis = await getRedis();
      if (redis) {
        await redis.lpush("generations", JSON.stringify(record));
        await redis.ltrim("generations", 0, 999);
      }
    } catch {/* ignore */}

    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
