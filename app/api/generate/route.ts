import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  morphui — /api/generate
//  Supports two AI providers:
//    1. Google Gemini  (GOOGLE_API_KEY)  — FREE tier available
//    2. Anthropic Claude (ANTHROPIC_API_KEY) — fallback
//  Client can also pass their own key in the request body.
// ─────────────────────────────────────────────────────────────

const FRAMEWORK_PROMPTS: Record<string, string> = {
  html: `You are an expert frontend developer. Convert this wireframe/sketch into clean, production-ready HTML + CSS.
Requirements:
- Single self-contained HTML file with embedded <style>
- Modern responsive design, dark or light as fits the sketch
- Clean semantic HTML5
- Smooth hover effects and transitions
- No placeholder images — use CSS shapes/gradients instead
- Return ONLY the HTML code, no explanation, no markdown fences`,

  tailwind: `You are an expert frontend developer. Convert this wireframe/sketch into production-ready HTML using Tailwind CSS.
Requirements:
- Single HTML file with Tailwind CDN included
- Faithful to the sketch layout and structure
- Responsive (mobile-first)
- Dark mode friendly
- Return ONLY the HTML code, no explanation, no markdown fences`,

  react: `You are an expert React developer. Convert this wireframe/sketch into a production-ready React component.
Requirements:
- Functional component named GeneratedUI
- Use Tailwind CSS for styling
- Responsive and accessible
- Include all sub-components inline in the same file
- No external dependencies except React and Tailwind
- Return ONLY the JSX/TSX code, no explanation, no markdown fences`,
};

async function generateWithGemini(
  imageBase64: string,
  mediaType: string,
  framework: string,
  apiKey: string
): Promise<{ code: string; usage: { input_tokens: number; output_tokens: number } }> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = FRAMEWORK_PROMPTS[framework] ?? FRAMEWORK_PROMPTS.html;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: mediaType as "image/png" | "image/jpeg" | "image/webp",
        data: imageBase64,
      },
    },
  ]);

  const response = result.response;
  const text = response.text();

  // Strip markdown fences if model included them
  const code = text
    .replace(/^```(?:html|jsx|tsx|react)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  return {
    code,
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}

async function generateWithAnthropic(
  imageBase64: string,
  mediaType: string,
  framework: string,
  apiKey: string
): Promise<{ code: string; usage: { input_tokens: number; output_tokens: number } }> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const prompt = FRAMEWORK_PROMPTS[framework] ?? FRAMEWORK_PROMPTS.html;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const content = message.content[0];
  const rawCode = content.type === "text" ? content.text : "";
  const code = rawCode
    .replace(/^```(?:html|jsx|tsx|react)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  return {
    code,
    usage: {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, framework, apiKey: clientKey } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
    }

    if (!mediaType) {
      return NextResponse.json({ error: "mediaType is required" }, { status: 400 });
    }

    const fw = ["html", "tailwind", "react"].includes(framework) ? framework : "html";

    // ── Key resolution: client key → env Gemini → env Anthropic
    const googleKey = clientKey?.startsWith("AIza")
      ? clientKey
      : process.env.GOOGLE_API_KEY;

    const anthropicKey = clientKey && !clientKey.startsWith("AIza")
      ? clientKey
      : process.env.ANTHROPIC_API_KEY;

    // ── Choose provider
    if (googleKey) {
      const result = await generateWithGemini(imageBase64, mediaType, fw, googleKey);
      // Record to history (fire and forget)
      fetch(new URL("/api/history", req.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework: fw, tokens: result.usage.output_tokens, provider: "gemini", success: true }),
      }).catch(() => {/* ignore */});
      return NextResponse.json({ ...result, framework: fw, provider: "gemini" });
    }

    if (anthropicKey) {
      const result = await generateWithAnthropic(imageBase64, mediaType, fw, anthropicKey);
      fetch(new URL("/api/history", req.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework: fw, tokens: result.usage.output_tokens, provider: "anthropic", success: true }),
      }).catch(() => {/* ignore */});
      return NextResponse.json({ ...result, framework: fw, provider: "anthropic" });
    }

    return NextResponse.json(
      {
        error:
          "No API key configured. Set GOOGLE_API_KEY (free at aistudio.google.com) or ANTHROPIC_API_KEY in your .env.local file, or enter one in the app.",
      },
      { status: 500 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
