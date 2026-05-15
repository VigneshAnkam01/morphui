import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, framework } = await req.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const frameworkInstructions: Record<string, string> = {
      html: `Generate a complete, self-contained HTML file with embedded CSS and JavaScript. 
             Use modern CSS with flexbox/grid. Make it visually stunning with gradients, shadows, and animations.
             Return ONLY the HTML code, no markdown fences.`,
      react: `Generate a complete React functional component using Tailwind CSS classes.
              Include all imports at the top. The component should be named 'GeneratedUI' and exported as default.
              Return ONLY the JSX/TSX code, no markdown fences.`,
      tailwind: `Generate a complete HTML file using Tailwind CSS CDN classes.
                 Include <script src="https://cdn.tailwindcss.com"></script> in the head.
                 Make it fully responsive and beautiful.
                 Return ONLY the HTML code, no markdown fences.`,
    };

    const selectedFramework = framework || "html";
    const instructions =
      frameworkInstructions[selectedFramework] ||
      frameworkInstructions["html"];

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
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are an expert UI/UX developer. Analyze this sketch/wireframe/mockup image carefully and generate production-quality UI code that accurately represents the design.

Instructions:
- Identify all UI elements: navigation, buttons, forms, cards, text areas, images, etc.
- Implement a modern, beautiful design with proper spacing, typography, and colors
- Use a cohesive color scheme (prefer dark or vibrant modern palettes)
- Make it fully responsive
- Add hover effects and micro-animations where appropriate
- ${instructions}

Important: Output ONLY the code. No explanations, no markdown code blocks, just raw code.`,
            },
          ],
        },
      ],
    });

    const generatedCode =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Clean up any accidental markdown fences
    const cleanedCode = generatedCode
      .replace(/^```[\w]*\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    return NextResponse.json({
      code: cleanedCode,
      framework: selectedFramework,
      usage: message.usage,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate code: ${errorMessage}` },
      { status: 500 }
    );
  }
}
