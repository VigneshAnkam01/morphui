import { NextRequest, NextResponse } from "next/server";

function isAdmin(req: NextRequest) {
  return req.cookies.get("morphui_admin_session")?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, context } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_API_KEY not set on server." }, { status: 500 });
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are an expert AI assistant for the morphui project — a Next.js 15 SaaS app that converts hand-drawn UI sketches into production code using Google Gemini Vision.

Project structure:
- app/page.tsx — Main page (hero, upload zone, output panels)
- app/layout.tsx — Root layout with metadata
- app/globals.css — CSS design system (dark theme, purple #8b5cf6 / cyan #22d3ee)
- app/components/Header.tsx — Sticky header with Sign In + Admin nav
- app/components/UploadZone.tsx — Drag & drop image upload
- app/components/CodeViewer.tsx — Syntax-highlighted code output with copy/preview
- app/components/Examples.tsx — Example wireframe buttons
- app/components/Background.tsx — Animated particle canvas
- app/components/AIAssistant.tsx — This AI chat widget (admin only)
- app/admin/page.tsx — Admin dashboard (stats, health checks, history)
- app/admin/login/page.tsx — Admin login page
- app/api/generate/route.ts — Gemini Vision API (converts sketch → code)
- app/api/health/route.ts — Health check endpoint
- app/api/history/route.ts — Generation history (Vercel KV)
- app/api/cleanup/route.ts — Deletes old records
- app/api/admin/auth/route.ts — Admin login/logout
- app/api/admin/assistant/route.ts — This AI assistant endpoint
- app/login/page.tsx — User OAuth login (GitHub/Google/Email)
- app/dashboard/page.tsx — User dashboard with generation history
- middleware.ts — Auth middleware protecting /admin and /dashboard
- lib/supabase.ts — Supabase browser client
- vercel.json — Deployment config

Tech stack: Next.js 15, TypeScript, Vercel, Google Gemini 2.0 Flash, Vercel KV

${context ? `Current admin context: ${context}` : ""}

Admin question: ${prompt}

Give a clear, actionable response. If code changes are needed, show the exact file path and code. Be concise and helpful.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    const tokens = result.response.usageMetadata?.candidatesTokenCount ?? 0;

    return NextResponse.json({ response, tokens });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
