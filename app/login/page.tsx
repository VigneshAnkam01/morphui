"use client";
import { useState } from "react";
import { Layers } from "lucide-react";
import { isSupabaseConfigured } from "../../lib/supabase";

const S = {
  bg: "#07070f", card: "#0d0d1a", border: "rgba(255,255,255,0.07)",
  purple: "#8b5cf6", cyan: "#22d3ee", text: "#f1f5f9", text2: "#94a3b8", text3: "#475569",
};

function SocialBtn({ icon, label, color, onClick, disabled }: {
  icon: React.ReactNode; label: string; color: string;
  onClick: () => void; disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "11px 16px",
        background: hover ? `${color}18` : `${color}0d`,
        border: `1px solid ${color}40`,
        borderRadius: 11, cursor: disabled ? "not-allowed" : "pointer",
        color: S.text, fontSize: 14, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "all 0.2s", opacity: disabled ? 0.5 : 1,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {icon} {label}
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"oauth" | "email">("oauth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const supabaseReady = isSupabaseConfigured;

  const signInWith = async (provider: "github" | "google") => {
    if (!supabaseReady) {
      setMsg({ text: "Supabase not configured. See SETUP.md.", type: "error" });
      return;
    }
    setLoading(provider);
    try {
      const { createClient } = await import("../../lib/supabase");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Sign in failed", type: "error" });
      setLoading(null);
    }
  };

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) {
      setMsg({ text: "Supabase not configured. See SETUP.md.", type: "error" });
      return;
    }
    setLoading("email");
    try {
      const { createClient } = await import("../../lib/supabase");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Try sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        setMsg({ text: "Check your email to confirm your account!", type: "success" });
      } else {
        window.location.href = "/dashboard";
      }
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Auth failed", type: "error" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: S.bg, padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(139,92,246,0.09), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, background: S.card, border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 0 60px rgba(139,92,246,0.12)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}>
              <Layers size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>morphui</span>
          </a>
          <p style={{ fontSize: 13, color: S.text3, marginTop: 4 }}>Sign in to save your generations</p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10, marginBottom: 20 }}>
          {(["oauth", "email"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "7px", borderRadius: 7, border: "none", cursor: "pointer",
              background: mode === m ? "rgba(139,92,246,0.15)" : "transparent",
              color: mode === m ? S.text : S.text3,
              fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
            }}>
              {m === "oauth" ? "Social Login" : "Email"}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13, background: msg.type === "error" ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)", border: `1px solid ${msg.type === "error" ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)"}`, color: msg.type === "error" ? "#f87171" : "#4ade80" }}>
            {msg.text}
          </div>
        )}

        {mode === "oauth" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SocialBtn
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>}
              label={loading === "github" ? "Connecting..." : "Continue with GitHub"}
              color="#6e5494"
              onClick={() => signInWith("github")}
              disabled={!!loading || !supabaseReady}
            />
            <SocialBtn
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
              label={loading === "google" ? "Connecting..." : "Continue with Google"}
              color="#4285F4"
              onClick={() => signInWith("google")}
              disabled={!!loading || !supabaseReady}
            />

            {!supabaseReady && (
              <p style={{ fontSize: 11, color: S.text3, textAlign: "center", marginTop: 4 }}>
                ⚠ Configure Supabase in .env.local to enable OAuth
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: S.text3 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            <button onClick={() => setMode("email")} style={{ background: "none", border: "none", color: S.text3, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Use email instead →
            </button>
          </div>
        ) : (
          <form onSubmit={signInEmail} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: S.text, fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
              onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: S.text, fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
              onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
            <button type="submit" disabled={!!loading}
              style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Inter', sans-serif" }}>
              {loading === "email" ? "Signing in..." : "Sign In / Sign Up"}
            </button>
          </form>
        )}

        {/* Admin link */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 24, paddingTop: 14, textAlign: "center" }}>
          <a href="/admin/login" style={{ fontSize: 12, color: "rgba(139,92,246,0.6)", textDecoration: "none", fontWeight: 600 }}>
            ⬡ Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
