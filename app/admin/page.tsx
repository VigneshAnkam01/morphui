"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Layers, RefreshCw, LogOut, Activity, Zap, Database, Shield, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import AIAssistant from "../components/AIAssistant";

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  db: string;
  totalGenerations: number;
  last24h: number;
}

interface HistoryItem {
  id: string;
  framework: string;
  tokens: number;
  created_at: string;
  success: boolean;
}

const S = {
  bg: "#07070f", card: "#0d0d1a", card2: "#111120",
  border: "rgba(255,255,255,0.06)", borderHi: "rgba(139,92,246,0.25)",
  purple: "#8b5cf6", cyan: "#22d3ee", green: "#4ade80",
  red: "#f87171", amber: "#fbbf24",
  text: "#f1f5f9", text2: "#94a3b8", text3: "#475569",
};

function Stat({ icon, label, value, sub, color = S.purple }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: S.text3, letterSpacing: "0.8px", textTransform: "uppercase" }}>{label}</span>
        <span style={{ color, opacity: 0.8 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", color: S.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: S.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%", display: "inline-block",
      background: ok ? S.green : S.red,
      boxShadow: ok ? `0 0 8px ${S.green}` : `0 0 8px ${S.red}`,
    }} />
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [hRes, histRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/history?limit=20"),
      ]);
      if (hRes.ok) setHealth(await hRes.json());
      if (histRes.ok) {
        const d = await histRes.json();
        setHistory(d.data ?? []);
      }
      setLastRefresh(new Date());
    } catch {/* silent */} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const fmtUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleString("en", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });

  const checks = [
    { label: "API Route /api/generate", ok: health?.status === "ok" },
    { label: "API Route /api/health",   ok: !!health },
    { label: "API Route /api/history",  ok: history.length >= 0 },
    { label: "Database (Supabase)",     ok: health?.db === "ok" },
    { label: "Server Running",          ok: !!health },
    { label: "Claude AI Connected",     ok: health?.status === "ok" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "'Inter', sans-serif", color: S.text }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(139,92,246,0.06), transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.02) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,7,15,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(139,92,246,0.5)" }}>
              <Layers size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>morphui</span>
            <span style={{ fontSize: 12, color: S.text3, padding: "2px 8px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 6 }}>Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: S.text3 }}>
              <Clock size={12} />
              {lastRefresh.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchData}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: `1px solid ${S.border}`, background: "rgba(255,255,255,0.03)", color: S.text2, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              id="logout-btn"
              onClick={logout}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.06)", color: S.red, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px", position: "relative", zIndex: 1 }}>
        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "10px 16px", background: S.card, border: `1px solid ${health ? "rgba(74,222,128,0.2)" : S.border}`, borderRadius: 10 }}>
          <StatusDot ok={!!health} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>System {health ? "Operational" : "Checking..."}</span>
          {health && <span style={{ fontSize: 12, color: S.text3, marginLeft: "auto" }}>Uptime: {fmtUptime(health.uptime)}</span>}
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          <Stat icon={<Zap size={18} />}      label="Total Generations" value={health?.totalGenerations ?? "—"} sub="All time"          color={S.purple} />
          <Stat icon={<Activity size={18} />}  label="Last 24 Hours"     value={health?.last24h ?? "—"}         sub="Generations"         color={S.cyan} />
          <Stat icon={<Database size={18} />}  label="Database"          value={health?.db === "ok" ? "OK" : "—"} sub="Supabase free tier" color={S.green} />
          <Stat icon={<Shield size={18} />}    label="Auth"              value="Active"                          sub="Admin session"       color={S.amber} />
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* QA Checks */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.text3, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>System Health Checks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {checks.map(c => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${c.ok ? "rgba(74,222,128,0.12)" : S.border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                  {loading ? (
                    <span style={{ fontSize: 11, color: S.text3 }}>checking...</span>
                  ) : c.ok ? (
                    <CheckCircle size={15} color={S.green} />
                  ) : (
                    <AlertCircle size={15} color={S.amber} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Env / Config */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.text3, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>Configuration</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "ANTHROPIC_API_KEY", val: "sk-ant-••••••••", ok: true },
                { key: "ADMIN_USER",        val: "admin",           ok: true },
                { key: "ADMIN_PASS",        val: "••••••••••",      ok: true },
                { key: "SUPABASE_URL",      val: "Set in .env.local", ok: false },
                { key: "SUPABASE_ANON_KEY", val: "Set in .env.local", ok: false },
                { key: "NODE_ENV",          val: process.env.NODE_ENV ?? "development", ok: true },
              ].map(item => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                  <code style={{ fontSize: 11, color: S.text2, fontFamily: "JetBrains Mono, monospace" }}>{item.key}</code>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <code style={{ fontSize: 11, color: S.text3, fontFamily: "JetBrains Mono, monospace" }}>{item.val}</code>
                    {item.ok ? <CheckCircle size={12} color={S.green} /> : <XCircle size={12} color={S.amber} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generation History */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: S.text3, letterSpacing: "0.8px", textTransform: "uppercase" }}>Recent Generations</span>
            <span style={{ fontSize: 11, color: S.text3 }}>last 20 requests</span>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: S.text3, fontSize: 13 }}>
              {loading ? "Loading history..." : "No generations yet — Supabase not configured or no data yet."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                    {["Time", "Framework", "Tokens", "Status"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: S.text3, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                      <td style={{ padding: "9px 12px", color: S.text2 }}>{fmtTime(item.created_at)}</td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(139,92,246,0.12)", color: S.purple }}>{item.framework?.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: S.text2, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{item.tokens}</td>
                      <td style={{ padding: "9px 12px" }}>
                        {item.success
                          ? <span style={{ display: "flex", alignItems: "center", gap: 5, color: S.green, fontSize: 12 }}><CheckCircle size={12} /> Success</span>
                          : <span style={{ display: "flex", alignItems: "center", gap: 5, color: S.red, fontSize: 12 }}><XCircle size={12} /> Failed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
          {[
            { label: "View Main App",  href: "/",              color: S.purple },
            { label: "Run Cleanup",    href: "/api/cleanup",   color: S.cyan },
            { label: "Health Check",   href: "/api/health",    color: S.green },
            { label: "View History",   href: "/api/history",   color: S.amber },
          ].map(action => (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "12px 16px", borderRadius: 10,
                border: `1px solid ${action.color}33`,
                background: `${action.color}0d`,
                color: action.color, fontWeight: 600, fontSize: 13,
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${action.color}1a`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${action.color}0d`; }}
            >
              {action.label} ↗
            </a>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* AI Assistant — floating, admin only */}
      <AIAssistant />
    </div>
  );
}
