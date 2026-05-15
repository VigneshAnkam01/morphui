"use client";
import { useState } from "react";
import { RefreshCw, Maximize2, Monitor, Tablet, Smartphone } from "lucide-react";

interface ExampleSketch {
  label: string;
  emoji: string;
  desc: string;
  prompt: string;
}

const EXAMPLES: ExampleSketch[] = [
  { label: "Landing Page", emoji: "🏠", desc: "Hero + features + CTA", prompt: "landing" },
  { label: "Dashboard", emoji: "📊", desc: "Charts + KPI cards", prompt: "dashboard" },
  { label: "Login Form", emoji: "🔐", desc: "Auth with social login", prompt: "login" },
  { label: "E-Commerce", emoji: "🛍️", desc: "Product grid + cart", prompt: "ecommerce" },
];

interface ExamplesProps {
  onExampleSelect: (base64: string, mediaType: string, preview: string) => void;
}

export function ExamplesStrip({ onExampleSelect }: ExamplesProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const generatePlaceholderSketch = async (type: string) => {
    setLoading(type);

    // Create a canvas-based placeholder sketch
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 400);

    ctx.strokeStyle = "#333";
    ctx.fillStyle = "#333";
    ctx.lineWidth = 2;
    ctx.font = "14px Arial";

    if (type === "landing") {
      // Nav
      ctx.strokeRect(20, 20, 560, 40);
      ctx.fillText("LOGO", 35, 45);
      ctx.fillText("Nav Links  [CTA Button]", 350, 45);
      // Hero
      ctx.strokeRect(20, 75, 560, 140);
      ctx.font = "bold 18px Arial";
      ctx.fillText("HERO SECTION", 220, 140);
      ctx.font = "12px Arial";
      ctx.fillText("Headline text here - big and bold", 170, 165);
      ctx.fillText("[Get Started]  [Learn More]", 200, 190);
      // Features
      ctx.strokeRect(20, 230, 175, 80);
      ctx.fillText("Feature 1", 85, 275);
      ctx.strokeRect(210, 230, 175, 80);
      ctx.fillText("Feature 2", 275, 275);
      ctx.strokeRect(400, 230, 175, 80);
      ctx.fillText("Feature 3", 465, 275);
      // Footer
      ctx.strokeRect(20, 325, 560, 40);
      ctx.fillText("Footer - links and copyright", 200, 350);
    } else if (type === "dashboard") {
      ctx.strokeRect(20, 20, 140, 360);
      ctx.fillText("Sidebar", 60, 200);
      ctx.strokeRect(175, 20, 130, 70);
      ctx.fillText("KPI: $12,450", 195, 60);
      ctx.strokeRect(315, 20, 130, 70);
      ctx.fillText("Users: 1,234", 330, 60);
      ctx.strokeRect(455, 20, 125, 70);
      ctx.fillText("Orders: 89", 475, 60);
      ctx.strokeRect(175, 105, 280, 160);
      ctx.fillText("Line Chart", 290, 190);
      ctx.strokeRect(465, 105, 115, 160);
      ctx.fillText("Pie", 510, 190);
      ctx.strokeRect(175, 280, 405, 100);
      ctx.fillText("Data Table", 350, 335);
    } else if (type === "login") {
      ctx.strokeRect(175, 40, 250, 320);
      ctx.fillText("Sign In", 275, 75);
      ctx.strokeRect(195, 95, 210, 35);
      ctx.fillText("Email", 285, 118);
      ctx.strokeRect(195, 145, 210, 35);
      ctx.fillText("Password", 270, 168);
      ctx.fillRect(195, 195, 210, 35);
      ctx.fillStyle = "#fff";
      ctx.fillText("Login Button", 265, 218);
      ctx.fillStyle = "#333";
      ctx.strokeRect(195, 245, 210, 35);
      ctx.fillText("Continue with Google", 220, 268);
      ctx.fillText("Don't have account? Sign up", 205, 340);
    } else {
      ctx.strokeRect(20, 20, 560, 50);
      ctx.fillText("Search products...", 200, 50);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.strokeRect(20 + i * 190, 90 + j * 155, 170, 140);
          ctx.fillText(`Product ${i + j * 3 + 1}`, 65 + i * 190, 170 + j * 155);
          ctx.fillText("$29.99  [Add]", 50 + i * 190, 215 + j * 155);
        }
      }
    }

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    setLoading(null);
    onExampleSelect(base64, "image/png", dataUrl);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
        Try an Example Sketch
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.prompt}
            onClick={() => generatePlaceholderSketch(ex.prompt)}
            disabled={loading === ex.prompt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <span>{loading === ex.prompt ? "⏳" : ex.emoji}</span>
            <span>{ex.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ResponsiveBarProps {
  viewport: string;
  onChange: (v: string) => void;
}

export function ResponsiveBar({ viewport, onChange }: ResponsiveBarProps) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[
        { id: "desktop", icon: <Monitor size={14} /> },
        { id: "tablet", icon: <Tablet size={14} /> },
        { id: "mobile", icon: <Smartphone size={14} /> },
      ].map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          style={{
            padding: "5px 10px",
            borderRadius: 8,
            border: `1px solid ${viewport === v.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
            background: viewport === v.id ? "rgba(139,92,246,0.12)" : "transparent",
            color: viewport === v.id ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );
}
