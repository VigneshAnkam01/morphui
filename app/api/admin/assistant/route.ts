import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple admin session check
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

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are an AI assistant for the morphui project — a Next.js web app that converts sketches to UI code using Claude AI.

The project structure:
- app/page.tsx — Main page (hero, upload, output panels)
- app/layout.tsx — Root layout with metadata
- app/globals.css — CSS design system (dark theme, purple/cyan palette)
- app/components/Header.tsx — Sticky nav
- app/components/UploadZone.tsx — Drag & drop upload
- app/components/CodeViewer.tsx — Syntax highlighted code output
- app/components/Examples.tsx — Example sketch buttons
- app/components/Background.tsx — Interactive particle canvas
- app/admin/page.tsx — This admin dashboard
- app/api/generate/route.ts — Claude vision API
- app/api/health/route.ts — Health check
- app/api/history/route.ts — Generation history

Design system: dark bg (#07070f), purple (#8b5cf6), cyan (#22d3ee), cards (#0d0d1a)

${context ? `Current page context: ${context}` : ""}

Admin request: ${prompt}

Provide a clear, actionable response. If code changes are needed, show the exact file path and the specific code change. Be concise and direct.`,
        },
      ],
    });

    const response = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ response, tokens: message.usage.output_tokens });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
