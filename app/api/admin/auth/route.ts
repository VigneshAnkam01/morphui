import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "morphui@2026";
const SESSION_COOKIE = "morphui_admin_session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("morphui_admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
