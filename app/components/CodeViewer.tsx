"use client";
import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  code: string;
  framework: string;
  activeTab: "code" | "preview";
  onTabChange: (t: "code" | "preview") => void;
  usage?: { input_tokens: number; output_tokens: number };
}

const LANG_MAP: Record<string, string> = { html: "html", tailwind: "html", react: "tsx" };

function getReactPreview(code: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head><body><div id="root"></div>
<script type="text/babel">
${code.replace(/^(import|export default)/gm, "// $1")}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(GeneratedUI));
</script></body></html>`;
}

export default function CodeViewer({ code, framework, activeTab, onTabChange, usage }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const ext = framework === "react" ? "tsx" : "html";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: `morphui-output.${ext}` }).click();
    URL.revokeObjectURL(url);
  };

  const lines = code.split("\n").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <div style={{ display:"flex", gap:4 }}>
          {(["code","preview"] as const).map(tab => (
            <button key={tab} id={`tab-${tab}`} onClick={() => onTabChange(tab)} className={`tab${activeTab === tab ? " active" : ""}`}>
              {tab === "code" ? (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Code</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Preview</>
              )}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {usage && <span className="tag tag-cyan">{usage.output_tokens} tok</span>}
          <span className="tag tag-purple">{lines}L</span>
          <button onClick={copy} className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:12 }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <button onClick={download} className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:12 }}>
            <Download size={12} /> .{framework === "react" ? "tsx" : "html"}
          </button>
        </div>
      </div>

      {/* Code view */}
      {activeTab === "code" && (
        <div className="code-block" style={{ flex:1, overflow:"auto", borderRadius:12, border:"1px solid var(--border)" }}>
          <SyntaxHighlighter
            language={LANG_MAP[framework] ?? "html"}
            style={oneDark}
            showLineNumbers
            customStyle={{ margin:0, padding:20, background:"#0a0a14", fontSize:"12.5px", lineHeight:"1.75", minHeight:"100%" }}
            lineNumberStyle={{ color:"#2d3452", minWidth:"2.2em" }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Preview view */}
      {activeTab === "preview" && (
        <div style={{ flex:1, borderRadius:12, overflow:"hidden", border:"1px solid var(--border)", background:"#fff" }}>
          <iframe
            id="preview-iframe"
            srcDoc={framework === "react" ? getReactPreview(code) : code}
            style={{ width:"100%", height:"100%", border:"none" }}
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        </div>
      )}
    </div>
  );
}
