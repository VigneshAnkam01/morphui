# morphui

> **Turn any wireframe or sketch into production-ready UI code instantly.**
> Powered by Google Gemini Vision AI (free tier) · Built with Next.js 15

![morphui](https://img.shields.io/badge/morphui-v1.0-8b5cf6?style=for-the-badge&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

## What is morphui?

morphui is an AI-powered web application that converts hand-drawn sketches, wireframes, napkin drawings, or any UI mockup image into production-ready code — in seconds.

Upload an image → select your framework → get clean, usable code.

---

## Features

- **AI Vision Analysis** — Google Gemini 1.5 Flash (free) or Claude claude-opus-4-5 reads your sketch
- **3 Output Frameworks** — Plain HTML/CSS · Tailwind CSS · React + Tailwind
- **Live Preview** — Rendered iframe preview of generated code
- **Syntax Highlighting** — Copy or download the output
- **Admin Dashboard** — Password-protected panel at `/admin`
- **AI Admin Assistant** — Chat with Claude to modify the codebase
- **Generation History** — Supabase database logs every generation
- **Auto DB Cleanup** — Vercel cron deletes records older than 30 days
- **Health Monitoring** — `/api/health` endpoint for uptime tracking
- **Interactive Background** — Canvas particle system with mouse interaction
- **Fully Responsive** — Works on PC, tablet, and mobile
- **Hidden Admin Access** — Triple-click the dot in footer to reveal admin link

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/morphui.git
cd morphui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Option A — Google Gemini (FREE at aistudio.google.com)
GOOGLE_API_KEY=AIzaSy...

# Option B — Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# Admin credentials
ADMIN_USER=admin
ADMIN_PASS=morphui@2026

# Supabase (optional — for generation history)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Admin Dashboard

Access at `/admin/login`

| Field    | Value          |
|----------|----------------|
| Username | `admin`        |
| Password | `morphui@2026` |

**Hidden access:** Triple-click the small dot at the bottom of the main page footer.

The admin panel includes:
- System health checks
- Generation history table
- Configuration viewer
- **AI Assistant** — Ask Claude anything about the codebase to modify it live

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | System health + uptime |
| `GET` | `/api/history` | Generation history from DB |
| `POST` | `/api/generate` | Convert image → code |
| `POST` | `/api/admin/auth` | Admin login |
| `DELETE` | `/api/admin/auth` | Admin logout |
| `POST` | `/api/admin/assistant` | AI assistant (admin only) |

---

## Deploy to Vercel (Free — 24/7)

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and set the env vars in the dashboard.

The app runs **serverlessly on Vercel** — it keeps working even when your PC is off.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| AI (primary) | Google Gemini 1.5 Flash (free) |
| AI (fallback) | Anthropic Claude claude-opus-4-5 |
| Database | Supabase (PostgreSQL, free tier) |
| Hosting | Vercel (free tier) |
| Auth | HTTP-only cookie sessions |
| Canvas | HTML5 Canvas API |

---

## Project Structure

```
morphui/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx      # Admin login
│   │   └── page.tsx            # Admin dashboard
│   ├── api/
│   │   ├── admin/
│   │   │   ├── assistant/      # AI assistant (admin only)
│   │   │   └── auth/           # Login / logout
│   │   ├── generate/           # Core AI vision route
│   │   ├── health/             # Health check
│   │   └── history/            # DB history
│   ├── components/
│   │   ├── AIAssistant.tsx     # Floating admin chat
│   │   ├── Background.tsx      # Particle canvas
│   │   ├── CodeViewer.tsx      # Syntax highlighted output
│   │   ├── Examples.tsx        # Example sketches
│   │   ├── Header.tsx          # Navigation
│   │   └── UploadZone.tsx      # Drag & drop
│   ├── globals.css             # Design system
│   ├── layout.tsx              # Root layout + SEO
│   └── page.tsx                # Main page
├── tests/
│   └── run-tests.mjs           # 33-test suite (31 passing)
├── middleware.ts               # Admin route protection
├── vercel.json                 # Cron + deployment config
└── docs/                       # Full documentation
```

---

## Running Tests

```bash
# Start dev server first
npm run dev

# In another terminal
node tests/run-tests.mjs
```

Expected output: **31/31 passed**, 2 skipped (require API key)

---

## License

MIT — built by [Myth](https://github.com/YOUR_USERNAME)
