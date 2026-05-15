"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, X, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  tokens?: number;
  time: Date;
}

const QUICK_PROMPTS = [
  "Change the hero title text",
  "Make the upload zone bigger",
  "Add a new color to the palette",
  "How do I add a new API endpoint?",
  "Explain the project structure",
  "How to add Supabase history tracking?",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your morphui AI assistant. Ask me anything about the project — I can help you modify code, add features, fix bugs, or explain how things work.",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const send = async (text?: string) => {
    const prompt = text ?? input.trim();
    if (!prompt || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: prompt, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: "Admin dashboard" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        tokens: data.tokens,
        time: new Date(),
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠ Error: ${e instanceof Error ? e.message : "Something went wrong"}`,
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const S = {
    bg: "#0d0d1a", card: "#111120", border: "rgba(255,255,255,0.07)",
    borderHi: "rgba(139,92,246,0.35)", purple: "#8b5cf6", cyan: "#22d3ee",
    text: "#f1f5f9", text2: "#94a3b8", text3: "#475569",
  };

  if (!open) {
    return (
      <button
        id="ai-assistant-btn"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px rgba(139,92,246,0.5), 0 4px 20px rgba(0,0,0,0.4)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        title="AI Assistant"
      >
        <Sparkles size={22} color="#fff" />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 1000,
      width: minimized ? 280 : 400,
      height: minimized ? 52 : 560,
      background: S.bg,
      border: `1px solid ${S.borderHi}`,
      borderRadius: 18,
      display: "flex", flexDirection: "column",
      boxShadow: "0 0 40px rgba(139,92,246,0.2), 0 20px 60px rgba(0,0,0,0.6)",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: "rgba(139,92,246,0.08)",
        borderBottom: minimized ? "none" : `1px solid ${S.border}`,
        cursor: "pointer",
        flexShrink: 0,
      }} onClick={() => setMinimized(v => !v)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 10px rgba(139,92,246,0.5)",
          }}>
            <Bot size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>AI Assistant</div>
            {!minimized && <div style={{ fontSize: 10, color: S.text3 }}>Admin only · Claude claude-opus-4-5</div>}
          </div>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
            boxShadow: "0 0 6px #4ade80", flexShrink: 0,
            animation: "pulse 2s ease infinite",
          }} />
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setMinimized(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: S.text3, display: "flex", padding: 4 }}>
            <Minimize2 size={13} />
          </button>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: S.text3, display: "flex", padding: 4 }}>
            <X size={13} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: msg.role === "assistant" ? "linear-gradient(135deg,#8b5cf6,#22d3ee)" : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: msg.role === "user" ? `1px solid rgba(255,255,255,0.1)` : "none",
                }}>
                  {msg.role === "assistant" ? <Bot size={12} color="#fff" /> : <User size={12} color={S.text2} />}
                </div>
                <div style={{
                  maxWidth: "78%",
                  padding: "9px 12px",
                  borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                  background: msg.role === "user" ? "rgba(139,92,246,0.15)" : S.card,
                  border: `1px solid ${msg.role === "user" ? "rgba(139,92,246,0.25)" : S.border}`,
                  fontSize: 13, color: S.text, lineHeight: 1.6,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {msg.content}
                  <div style={{ fontSize: 10, color: S.text3, marginTop: 4 }}>
                    {msg.time.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    {msg.tokens && ` · ${msg.tokens} tok`}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={12} color="#fff" />
                </div>
                <div style={{ padding: "9px 14px", borderRadius: "4px 14px 14px 14px", background: S.card, border: `1px solid ${S.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: S.purple, animation: `bounce 1s ease ${j * 0.15}s infinite`, display: "inline-block" }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: "10px 14px 0", display: "flex", flexWrap: "wrap", gap: 5 }}>
              {QUICK_PROMPTS.map(qp => (
                <button key={qp} onClick={() => send(qp)} style={{
                  fontSize: 11, padding: "4px 9px", borderRadius: 99,
                  background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                  color: "#c4b5fd", cursor: "pointer", fontFamily: "'Inter',sans-serif",
                  transition: "all 0.15s",
                }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.15)"; }}
                   onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}>
                  {qp}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 12px 14px", flexShrink: 0 }}>
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              background: S.card, border: `1px solid ${S.border}`,
              borderRadius: 12, padding: "8px 10px",
              transition: "border-color 0.2s",
            }}
              onFocus={() => {}}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = S.borderHi; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = S.border; }}
            >
              <input
                id="assistant-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask anything about morphui..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: S.text, fontSize: 13, fontFamily: "'Inter',sans-serif",
                }}
              />
              <button
                id="send-btn"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: input.trim() && !loading ? "linear-gradient(135deg,#8b5cf6,#6366f1)" : "rgba(255,255,255,0.05)",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", flexShrink: 0,
                }}
              >
                <Send size={13} color={input.trim() && !loading ? "#fff" : "#475569"} />
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
