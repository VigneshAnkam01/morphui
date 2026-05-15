"use client";
import { useEffect, useState } from "react";
import { Layers, LogOut, Zap, Clock, Code2, Eye, Download, Copy, Check, User } from "lucide-react";
import Link from "next/link";

interface Generation {
  id: string;
  framework: string;
  tokens: number;
  provider: string;
  success: boolean;
  created_at: string;
  code_preview?: string;
}

interface UserProfile {
  email?: string;
  name?: string;
  avatar?: string;
  provider?: string;
}

const S = {
  bg: "#07070f", card: "#0d0d1a", card2: "#111120",
  border: "rgba(255,255,255,0.06)", borderHi: "rgba(139,92,246,0.25)",
  purple: "#8b5cf6", cyan: "#22d3ee", green: "#4ade80", amber: "#fbbf24",
  text: "#f1f5f9", text2: "#94a3b8", text3: "#475569",
};

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}35` }}>
      {children}
    </span>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gens, setGens] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { createClient } = await import("../../lib/supabase");
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) {
          setUser({
            email: u.email,
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0],
            avatar: u.user_metadata?.avatar_url,
            provider: u.app_metadata?.provider,
          });
          // Fetch user's generations
          const { data } = await supabase
            .from("generations")
            .select("*")
            .eq("user_id", u.id)
            .order("created_at", { ascending: false })
            .limit(50);
          setGens(data ?? []);
        }
      } catch { /* Supabase not configured */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const signOut = async () => {
    const { createClient } = await import("../../lib/supabase");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  const totalTokens = gens.reduce((acc, g) => acc + (g.tokens || 0), 0);
  const successRate = gens.length ? Math.round((gens.filter(g => g.success).length / gens.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: S.purple, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: S.text3, fontSize: 13 }}>Loading your workspace...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "'Inter', sans-serif", color: S.text }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.02) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 40% at 20% 20%, rgba(139,92,246,0.06), transparent 60%)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,7,15,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={13} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>morphui</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${S.borderHi}` }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={13} color={S.purple} />
              </div>
            )}
            <span style={{ fontSize: 13, color: S.text2, fontWeight: 600 }}>{user?.name ?? "User"}</span>
            <Link href="/" style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: S.purple, textDecoration: "none", fontWeight: 600 }}>
              + New
            </Link>
            <button onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px", borderRadius: 8, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px", position: "relative", zIndex: 1 }}>
        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Welcome back, <span style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.name ?? "there"}</span> 👋
          </h1>
          <p style={{ fontSize: 13, color: S.text3, marginTop: 4 }}>{user?.email} · {user?.provider ?? "email"}</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total Generations", value: gens.length, icon: <Zap size={16} />, color: S.purple },
            { label: "Tokens Used", value: totalTokens.toLocaleString(), icon: <Code2 size={16} />, color: S.cyan },
            { label: "Success Rate", value: `${successRate}%`, icon: <Check size={16} />, color: S.green },
            { label: "Last Active", value: gens[0] ? fmtTime(gens[0].created_at) : "—", icon: <Clock size={16} />, color: S.amber },
          ].map(stat => (
            <div key={stat.label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: S.text3, textTransform: "uppercase", letterSpacing: "0.7px" }}>{stat.label}</span>
                <span style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", color: S.text }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Generations list */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Your Generations</span>
            <span style={{ fontSize: 11, color: S.text3 }}>{gens.length} total</span>
          </div>

          {gens.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: S.text2, marginBottom: 6 }}>No generations yet</p>
              <p style={{ fontSize: 13, color: S.text3, marginBottom: 16 }}>Upload your first sketch to get started</p>
              <Link href="/" style={{ padding: "9px 20px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                Start generating →
              </Link>
            </div>
          ) : (
            <div>
              {gens.map((gen, i) => (
                <div key={gen.id} style={{ padding: "14px 20px", borderBottom: i < gens.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: gen.success ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${gen.success ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Code2 size={15} color={gen.success ? S.green : "#f87171"} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <Badge color={S.purple}>{gen.framework?.toUpperCase()}</Badge>
                      <Badge color={gen.provider === "gemini" ? S.cyan : S.amber}>{gen.provider ?? "gemini"}</Badge>
                      {!gen.success && <Badge color="#f87171">failed</Badge>}
                    </div>
                    <p style={{ fontSize: 11, color: S.text3 }}>{fmtTime(gen.created_at)} · {gen.tokens ?? 0} tokens</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {gen.code_preview && (
                      <button
                        onClick={() => setActivePreview(activePreview === gen.id ? null : gen.id)}
                        style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: `1px solid ${S.border}`, color: S.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                      >
                        <Eye size={11} /> View
                      </button>
                    )}
                    {gen.code_preview && (
                      <button
                        onClick={() => copyCode(gen.code_preview!, gen.id)}
                        style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: `1px solid ${S.border}`, color: copied === gen.id ? S.green : S.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                      >
                        {copied === gen.id ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile section */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.text3, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Profile</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${S.borderHi}` }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: `2px solid ${S.borderHi}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={22} color={S.purple} />
              </div>
            )}
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: S.text3, marginTop: 2 }}>{user?.email}</p>
              <p style={{ fontSize: 11, color: S.text3, marginTop: 2 }}>Signed in via {user?.provider ?? "email"}</p>
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
