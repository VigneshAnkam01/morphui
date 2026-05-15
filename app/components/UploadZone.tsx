"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, Sparkles } from "lucide-react";

const FRAMEWORKS = [
  { id: "html",     label: "HTML / CSS",        icon: "⬡" },
  { id: "tailwind", label: "Tailwind",           icon: "✦" },
  { id: "react",    label: "React + Tailwind",   icon: "⬡" },
];

interface Props {
  onImageReady: (b64: string, mime: string) => void;
  framework: string;
  onFrameworkChange: (fw: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  hasImage: boolean;
}

export default function UploadZone({ onImageReady, framework, onFrameworkChange, isLoading, onGenerate, hasImage }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [header, b64] = dataUrl.split(",");
      const mime = header.match(/data:(.*);base64/)?.[1] ?? "image/png";
      setPreview(dataUrl);
      onImageReady(b64, mime);
    };
    reader.readAsDataURL(file);
  }, [onImageReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: isLoading,
  });

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setIsDragging(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Framework selector */}
      <div>
  
        <div style={{ display:"flex", gap:6 }}>
          {FRAMEWORKS.map(fw => (
            <button
              key={fw.id}
              onClick={() => onFrameworkChange(fw.id)}
              className={`fw-pill${framework === fw.id ? " selected" : ""}`}
              disabled={isLoading}
            >
              <span style={{ fontSize:14 }}>{fw.icon}</span>
              <span style={{ fontSize:11, display:"block", marginTop:2 }}>{fw.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div>
  
        <div
          {...getRootProps()}
          className={`dropzone${isDragActive || isDragging ? " active" : ""}`}
          style={{
            minHeight: preview ? "auto" : 200,
            padding: preview ? 12 : "40px 24px",
            display:"flex", alignItems:"center", justifyContent:"center",
            textAlign:"center", position:"relative",
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <input {...getInputProps()} id="file-upload" />
          {preview ? (
            <div style={{ position:"relative", width:"100%" }}>
              <img
                src={preview}
                alt="sketch"
                style={{ maxWidth:"100%", maxHeight:260, borderRadius:8, objectFit:"contain", display:"block", margin:"0 auto" }}
              />
              <button
                onClick={clear}
                className="btn-icon"
                style={{ position:"absolute", top:6, right:6 }}
              >
                <X size={13} />
              </button>
              <p style={{ fontSize:11, color:"var(--text3)", marginTop:8 }}>
                <ImageIcon size={11} style={{ display:"inline", marginRight:4 }} />
                Click to replace
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                width:52, height:52, borderRadius:"50%",
                background:"rgba(139,92,246,0.08)",
                border:"1px solid rgba(139,92,246,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 14px",
                transition:"all 0.25s",
                ...(isDragActive ? { background:"rgba(139,92,246,0.18)", borderColor:"var(--purple)", boxShadow:"0 0 24px rgba(139,92,246,0.25)" } : {})
              }}>
                <Upload size={22} color="var(--purple)" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:"var(--text2)", marginBottom:5 }}>
                {isDragActive ? "Drop it" : "Drag & drop your sketch"}
              </p>
              <p style={{ fontSize:12, color:"var(--text3)" }}>PNG · JPG · WebP · or click to browse</p>
              <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:14, flexWrap:"wrap" }}>
                {["napkin", "figma", "whiteboard", "wireframe"].map(t => (
                  <span key={t} className="tag tag-purple">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate button */}
      <button
        id="generate-btn"
        className="btn btn-primary"
        onClick={onGenerate}
        disabled={!hasImage || isLoading}
        style={{ width:"100%", padding:"13px 20px", borderRadius:12, fontSize:14, gap:8 }}
      >
        {isLoading ? (
          <><span className="spinner" /> Generating...</>
        ) : (
          <><Sparkles size={16} /> Generate Code</>
        )}
      </button>


    </div>
  );
}
