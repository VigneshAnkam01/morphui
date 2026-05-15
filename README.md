# SketchToCode ⚡

> **Transform any sketch, wireframe, or napkin drawing into production-ready UI code using Claude AI.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Anthropic](https://img.shields.io/badge/Claude-claude--opus--4--5-orange?logo=anthropic)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## ✨ Features

- 🖼️ **Upload any sketch** — drag & drop PNG, JPG, WebP, or photograph a whiteboard
- 🤖 **Claude Vision AI** — claude-opus-4-5 reads and understands your layout
- 💻 **3 output formats** — Pure HTML/CSS, Tailwind HTML, or React + Tailwind JSX
- 👁️ **Live preview** — See the rendered UI in-browser instantly
- 📋 **Copy & Download** — One-click copy or download as `.html`/`.tsx`
- 🎨 **Example sketches** — Built-in canvas-drawn examples to try without uploading

---

## 🚀 Quick Start

### 1. Clone & Install
\`\`\`bash
git clone https://github.com/yourusername/sketch-to-code
cd sketch-to-code
npm install
\`\`\`

### 2. Set Environment Variable
\`\`\`bash
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key
# Get one free at: https://console.anthropic.com
\`\`\`

\`\`\`.env.local
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
\`\`\`

### 3. Run Locally
\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

---

## 🌐 Deploy to Vercel (Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/sketch-to-code)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Click Deploy — done!

---

## 🏗️ Architecture

\`\`\`
sketch-to-code/
├── app/
│   ├── api/generate/route.ts   # Claude API call (server-side)
│   ├── components/
│   │   ├── Header.tsx          # Nav header
│   │   ├── UploadZone.tsx      # Drag & drop image upload
│   │   ├── CodeViewer.tsx      # Syntax-highlighted output + preview
│   │   └── Extras.tsx          # Example sketches + responsive controls
│   ├── globals.css             # Design system
│   ├── layout.tsx              # Root layout + metadata
│   └── page.tsx                # Main page
├── .env.local.example          # Environment template
├── vercel.json                 # Vercel config
└── next.config.ts
\`\`\`

---

## 🔐 API Key Security

Your API key is **never exposed to the browser**. All calls to Anthropic are made server-side via the Next.js API route (`/api/generate`). The image is sent to the server, Claude processes it, and only the generated code is returned to the client.

---

## 📄 License

MIT — free to use, modify, and deploy.
