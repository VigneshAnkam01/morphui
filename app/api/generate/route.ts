import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  morphui — /api/generate
//  Provider priority:
//    1. Groq (llama-3.2-vision) — FREE, no user API key needed
//    2. Google Gemini — FREE fallback
//  Users NEVER need to enter any API key.
// ─────────────────────────────────────────────────────────────

const FRAMEWORK_PROMPTS: Record<string, string> = {
  html: `You are an expert frontend developer. Convert this wireframe/sketch into clean, production-ready HTML + CSS.
Requirements:
- Single self-contained HTML file with embedded <style>
- Modern responsive design matching the sketch layout
- Clean semantic HTML5
- Smooth hover effects and transitions
- No placeholder images — use CSS shapes/gradients instead
- Return ONLY the complete HTML code, nothing else, no markdown fences, no explanation`,

  tailwind: `You are an expert frontend developer. Convert this wireframe/sketch into production-ready HTML using Tailwind CSS.
Requirements:
- Single HTML file with Tailwind CDN included in <head>
- Faithful to the sketch layout and structure
- Responsive (mobile-first)
- Dark mode friendly
- Return ONLY the HTML code, nothing else, no markdown fences`,

  react: `You are an expert React developer. Convert this wireframe/sketch into a production-ready React component.
Requirements:
- Functional component named GeneratedUI
- Use Tailwind CSS for styling (include CDN)
- Responsive and accessible
- Include all sub-components inline in the same file
- No external dependencies except React and Tailwind
- Return ONLY the JSX/TSX code, nothing else, no markdown fences`,
};

function cleanCode(raw: string): string {
  return raw
    .replace(/^```(?:html|jsx|tsx|react|css)?\n?/im, "")
    .replace(/\n?```$/im, "")
    .trim();
}

// ── Provider 1: Groq (Llama 3.2 Vision) ───────────────────────
async function generateWithGroq(
  imageBase64: string,
  mediaType: string,
  framework: string,
  apiKey: string
): Promise<{ code: string; usage: { input_tokens: number; output_tokens: number } }> {
  const prompt = FRAMEWORK_PROMPTS[framework] ?? FRAMEWORK_PROMPTS.html;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  return {
    code: cleanCode(raw),
    usage: {
      input_tokens: data.usage?.prompt_tokens ?? 0,
      output_tokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

// ── Provider 2: Google Gemini ──────────────────────────────────
async function generateWithGemini(
  imageBase64: string,
  mediaType: string,
  framework: string,
  apiKey: string
): Promise<{ code: string; usage: { input_tokens: number; output_tokens: number } }> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  // Try models in order — if quota exhausted on one, try next
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-8b"];
  let lastErr: unknown;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = FRAMEWORK_PROMPTS[framework] ?? FRAMEWORK_PROMPTS.html;
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: mediaType as "image/png" | "image/jpeg" | "image/webp", data: imageBase64 } },
      ]);
      const response = result.response;
      return {
        code: cleanCode(response.text()),
        usage: {
          input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
          output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Only retry on quota/rate errors
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        lastErr = e;
        continue;
      }
      throw e; // Non-quota error — re-throw immediately
    }
  }
  throw lastErr;
}

// Keep old signature compat — unused but satisfies linter
async function _generateWithGeminiOld(
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
  return {
    code: cleanCode(response.text()),
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, framework } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }
    if (!mediaType) {
      return NextResponse.json({ error: "mediaType is required." }, { status: 400 });
    }

    const fw = ["html", "tailwind", "react"].includes(framework) ? framework : "html";

    // ── Try Groq first (always free, no user key needed)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const result = await generateWithGroq(imageBase64, mediaType, fw, groqKey);
        // Log to history (fire and forget)
        fetch(new URL("/api/history", req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ framework: fw, tokens: result.usage.output_tokens, provider: "groq", success: true }),
        }).catch(() => {});
        return NextResponse.json({ ...result, framework: fw, provider: "groq" });
      } catch (groqErr) {
        console.error("[groq failed, trying gemini]", groqErr);
      }
    }

    // ── Fallback: Gemini
    const geminiKey = process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const result = await generateWithGemini(imageBase64, mediaType, fw, geminiKey);
        fetch(new URL("/api/history", req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ framework: fw, tokens: result.usage.output_tokens, provider: "gemini", success: true }),
        }).catch(() => {});
        return NextResponse.json({ ...result, framework: fw, provider: "gemini" });
      } catch (geminiErr) {
        console.error("[gemini failed]", geminiErr);
        const msg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: "AI service is being set up. Please try again in a moment." },
      { status: 503 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
