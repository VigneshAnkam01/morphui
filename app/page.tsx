"use client";
import { useState, useCallback } from "react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import CodeViewer from "./components/CodeViewer";
import Examples from "./components/Examples";
import Background from "./components/Background";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

// Hidden admin access — triple click the dot to reveal
function AdminAccess() {
  const [clicks, setClicks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 3) { setRevealed(true); }
    setTimeout(() => { if (next < 3) setClicks(0); }, 1500);
  };
  return (
    <span style={{ display: "inline-block", marginLeft: 8 }}>
      {revealed ? (
        <Link
          href="/admin/login"
          style={{ fontSize: 10, color: "var(--purple)", textDecoration: "none", opacity: 0.6, fontWeight: 600 }}
        >
          ⬡ admin
        </Link>
      ) : (
        <span
          onClick={handleClick}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text3)", display: "inline-block", cursor: "default", opacity: 0.2, verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}


interface Result {
  code: string;
  framework: string;
  usage?: { input_tokens: number; output_tokens: number };
}

export default function Home() {
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [mime, setMime] = useState("image/png");
  const [framework, setFramework] = useState("html");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);

  const handleImage = useCallback((b64: string, m: string) => {
    setImageB64(b64); setMime(m); setResult(null); setError(null);
  }, []);

  const generate = async () => {
    if (!imageB64) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageB64, mediaType: mime, framework, apiKey: apiKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setActiveTab("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!(result || loading || error);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Background />
      <div className="grid-bg" />

      <Header />

      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "clamp(28px,5vw,52px) 20px 28px" }} className="animate-fade-up">
          <h1 style={{
            fontSize: "clamp(30px,6vw,58px)",
            fontWeight: 900,
            letterSpacing: "clamp(-1.5px,-0.04em,-2.5px)",
            lineHeight: 1.05,
            marginBottom: 10,
          }}>
            <span className="gradient-text-flow">Sketch → Code</span>
          </h1>
          <p style={{ fontSize: "clamp(13px,2vw,15px)", color: "var(--text3)" }}>
            Upload a wireframe. Get production UI instantly.
          </p>
        </div>

        {/* API key pill */}
        {!apiKey && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, padding: "0 20px" }}>
            {!showApiInput ? (
              <button
                onClick={() => setShowApiInput(true)}
                style={{
                  cursor: "pointer", border: "1px solid rgba(251,191,36,0.25)",
                  background: "rgba(251,191,36,0.06)", padding: "6px 16px",
                  borderRadius: 99, fontSize: 12, color: "var(--amber)",
                  fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                }}
              >
                ⚠ Set Anthropic API key
              </button>
            ) : (
              <div style={{
                display: "flex", gap: 8, alignItems: "center",
                background: "var(--card)", border: "1px solid var(--border-hi)",
                borderRadius: 12, padding: "8px 12px",
                width: "100%", maxWidth: 480,
              }}>
                <input
                  id="api-key-input"
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setShowApiInput(false)}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "var(--text)", fontSize: 13, fontFamily: "var(--mono)",
                  }}
                  autoFocus
                />
                <button onClick={() => setShowApiInput(false)} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>
                  {apiKey ? "✓" : "✕"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Workspace */}
        <div
          className={`workspace-grid ${hasResult ? "has-output" : "no-output"}`}
          style={{ maxWidth: 1160, margin: "0 auto", padding: "0 16px clamp(40px,6vw,80px)" }}
        >
          {/* Left panel */}
          <div className="card animate-fade-up" style={{ padding: "clamp(14px,2vw,20px)", animationDelay: "60ms" }}>
            <UploadZone
              onImageReady={handleImage}
              framework={framework}
              onFrameworkChange={setFramework}
              isLoading={loading}
              onGenerate={generate}
              hasImage={!!imageB64}
            />
            <Examples onSelect={handleImage} />
          </div>

          {/* Right panel */}
          {hasResult && (
            <div
              className="card output-panel animate-slide-right"
              style={{ padding: "clamp(14px,2vw,18px)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {result?.framework && <span className="tag tag-purple">{result.framework.toUpperCase()}</span>}
                  {result?.usage && <span className="tag tag-cyan">{result.usage.output_tokens} tok</span>}
                </div>
                {result && (
                  <button onClick={generate} disabled={loading} className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }}>
                    <RotateCcw size={11} /> Retry
                  </button>
                )}
              </div>
              <div className="divider" style={{ marginBottom: 10 }} />

              {loading && !result && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div className="spinner" style={{ width: 26, height: 26, borderWidth: 2.5 }} />
                  <p style={{ fontSize: 13, color: "var(--text3)" }}>Reading sketch...</p>
                </div>
              )}

              {error && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--red)", fontSize: 13 }}>
                  ⚠ {error}
                </div>
              )}

              {result && (
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <CodeViewer
                    code={result.code}
                    framework={result.framework}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    usage={result.usage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "12px 20px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, color: "var(--text3)" }}>morphui · powered by Claude AI</p>
        <AdminAccess />
      </footer>


    </div>
  );
}
