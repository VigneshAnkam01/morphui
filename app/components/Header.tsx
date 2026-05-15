"use client";
import { useState, useEffect } from "react";
import { Layers, User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface AuthUser {
  name?: string;
  avatar?: string;
  email?: string;
}

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Check auth
    const checkUser = async () => {
      try {
        const { createClient, isSupabaseConfigured } = await import("../../lib/supabase");
        if (!isSupabaseConfigured) return;
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) {
          setUser({
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0],
            avatar: u.user_metadata?.avatar_url,
            email: u.email,
          });
        }
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
              avatar: session.user.user_metadata?.avatar_url,
              email: session.user.email,
            });
          } else {
            setUser(null);
          }
        });
      } catch {/* Supabase not configured */}
    };

    // Check health
    const checkHealth = async () => {
      try {
        const r = await fetch("/api/health");
        setOnline(r.ok);
      } catch { setOnline(false); }
    };

    checkUser();
    checkHealth();
    const iv = setInterval(checkHealth, 30000);
    return () => clearInterval(iv);
  }, []);

  const signOut = async () => {
    try {
      const { createClient } = await import("../../lib/supabase");
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setMenuOpen(false);
    } catch {/* */}
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8,8,16,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        padding: "0 20px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(139,92,246,0.45)",
          }}>
            <Layers size={14} color="#fff" />
          </div>
          <span style={{
            fontWeight: 900, fontSize: 16, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>morphui</span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Online status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 99,
            background: online ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${online ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
            fontSize: 11, fontWeight: 700,
            color: online ? "#4ade80" : "#f87171",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: online ? "#4ade80" : "#f87171",
              boxShadow: online ? "0 0 6px #4ade80" : "none",
              animation: online ? "pulse-dot 2s ease infinite" : "none",
            }} />
            {online ? "online" : "offline"}
          </div>

          {/* Admin button — visible, styled distinctly */}
          <Link
            href="/admin/login"
            id="admin-nav-btn"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 8,
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa", fontSize: 12, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.15)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.45)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)";
            }}
          >
            <ShieldCheck size={12} />
            Admin
          </Link>

          {/* User section */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 8px 4px 4px", borderRadius: 99,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", transition: "all 0.2s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={11} color="#a78bfa" />
                  </div>
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: 6, minWidth: 180,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  zIndex: 200,
                }}>
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{user.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, color: "#94a3b8",
                    textDecoration: "none", fontSize: 13, transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#f1f5f9"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                    <LayoutDashboard size={13} /> My Dashboard
                  </Link>
                  <button onClick={signOut} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, color: "#f87171",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, fontFamily: "'Inter', sans-serif", transition: "all 0.15s", textAlign: "left",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              id="signin-btn"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 14px", borderRadius: 8,
                background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                color: "#fff", fontSize: 12, fontWeight: 700,
                textDecoration: "none", boxShadow: "0 0 12px rgba(139,92,246,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(139,92,246,0.55)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(139,92,246,0.35)")}
            >
              <User size={12} /> Sign in
            </Link>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}
