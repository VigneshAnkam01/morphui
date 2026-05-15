"use client";

const EXAMPLES = [
  { label:"Landing Page", emoji:"↗", type:"landing" },
  { label:"Dashboard",    emoji:"▤",  type:"dashboard" },
  { label:"Login",        emoji:"⬡", type:"login" },
  { label:"E-Commerce",   emoji:"◈", type:"shop" },
];

function drawSketch(type: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 640; canvas.height = 420;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 640, 420);
  ctx.strokeStyle = "#1e293b"; ctx.fillStyle = "#1e293b";
  ctx.lineWidth = 1.5; ctx.font = "13px Arial";

  if (type === "landing") {
    // Nav
    ctx.strokeRect(20, 16, 600, 42); ctx.fillText("LOGO", 36, 42); ctx.fillText("Home  About  Pricing  [Get Started]", 360, 42);
    // Hero
    ctx.strokeRect(20, 72, 600, 150);
    ctx.font = "bold 20px Arial"; ctx.fillText("Hero Headline — Big Bold Text", 160, 140);
    ctx.font = "13px Arial"; ctx.fillText("Subtext describing the value proposition goes here", 175, 165);
    ctx.strokeRect(205, 185, 100, 30); ctx.fillText("[Primary CTA]", 213, 204);
    ctx.strokeRect(315, 185, 90, 30); ctx.fillText("[Secondary]", 320, 204);
    // Features
    for (let i = 0; i < 3; i++) { ctx.strokeRect(20 + i*205, 240, 190, 90); ctx.fillText(`Feature ${i+1}`, 80 + i*205, 290); }
    // Footer
    ctx.strokeRect(20, 350, 600, 40); ctx.fillText("Footer — Links   Social   © 2025", 215, 375);
  } else if (type === "dashboard") {
    // Sidebar
    ctx.strokeRect(20, 20, 130, 380); ctx.fillText("Sidebar", 55, 210);
    // KPIs
    for (let i = 0; i < 3; i++) { ctx.strokeRect(165 + i*160, 20, 145, 65); ctx.fillText(`KPI ${i+1}: 1,234`, 185 + i*160, 57); }
    // Chart
    ctx.strokeRect(165, 100, 310, 160); ctx.fillText("Line Chart", 290, 185);
    // Pie
    ctx.strokeRect(490, 100, 120, 160); ctx.fillText("Pie", 540, 185);
    // Table
    ctx.strokeRect(165, 275, 445, 125); ctx.fillText("Data Table", 350, 340);
  } else if (type === "login") {
    ctx.strokeRect(180, 40, 280, 340);
    ctx.font = "bold 16px Arial"; ctx.fillText("Sign In", 295, 78);
    ctx.font = "13px Arial";
    ctx.strokeRect(200, 95, 240, 36); ctx.fillText("Email address", 300, 118);
    ctx.strokeRect(200, 145, 240, 36); ctx.fillText("Password", 305, 168);
    ctx.fillRect(200, 198, 240, 36); ctx.fillStyle = "#fff"; ctx.fillText("Sign In", 300, 220); ctx.fillStyle = "#1e293b";
    ctx.strokeRect(200, 248, 240, 36); ctx.fillText("Continue with Google", 248, 270);
    ctx.fillText("No account? Sign up →", 255, 355);
  } else {
    ctx.strokeRect(20, 20, 600, 48); ctx.fillText("🔍 Search products...", 40, 49);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      ctx.strokeRect(20 + c*150, 85 + r*155, 138, 140);
      ctx.fillRect(20 + c*150, 85 + r*155, 138, 80); ctx.fillStyle="#e2e8f0"; ctx.fillRect(21+c*150,86+r*155,136,78); ctx.fillStyle="#1e293b";
      ctx.fillText(`Item ${r*4+c+1}`, 60+c*150, 195+r*155);
      ctx.fillText("$29  [Add]", 50+c*150, 213+r*155);
    }
  }

  return canvas.toDataURL("image/png");
}

interface Props {
  onSelect: (b64: string, mime: string) => void;
}

export default function Examples({ onSelect }: Props) {
  const pick = (type: string) => {
    const dataUrl = drawSketch(type);
    const b64 = dataUrl.split(",")[1];
    onSelect(b64, "image/png");
  };

  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex.type}
            onClick={() => pick(ex.type)}
            className="btn btn-ghost"
            style={{ fontSize:12, padding:"6px 12px", gap:6 }}
          >
            <span style={{ fontFamily:"monospace" }}>{ex.emoji}</span>
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
