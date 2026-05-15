"use client";
import { Layers } from "lucide-react";

export default function Header() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(8,8,16,0.9)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 20px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(139,92,246,0.5)",
            flexShrink: 0,
          }}>
            <Layers size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px" }} className="gradient-text">
            morphui
          </span>
        </div>

        {/* Status only */}
        <span className="tag tag-green" style={{ gap: 5, fontSize: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          online
        </span>
      </div>
    </header>
  );
}
