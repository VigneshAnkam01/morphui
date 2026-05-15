"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#07070f", fontFamily: "'Inter', sans-serif", padding: 20,
    }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,92,246,0.08), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div style={{
        position: "relative", zIndex: 1,
        background: "#0d0d1a", border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 380,
        boxShadow: "0 0 60px rgba(139,92,246,0.1)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(139,92,246,0.5)", marginBottom: 12,
          }}>
            <Layers size={20} color="#fff" />
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>morphui</h1>
          <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Admin Dashboard</p>
        </div>

        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Username */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: "100%", padding: "10px 14px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: "100%", padding: "10px 40px 10px 14px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#475569",
                  display: "flex", alignItems: "center",
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12 }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="login-btn"
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
              border: "none", borderRadius: 10, color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(139,92,246,0.4)"; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
          >
            {loading ? (
              <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite", display: "inline-block" }} /> Signing in...</>
            ) : "Sign In →"}
          </button>
        </form>

        <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 20 }}>
          Admin access only · morphui v1.0
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
