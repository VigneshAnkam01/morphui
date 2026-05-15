# morphui — System Architecture

## Overview

morphui follows a **serverless Next.js architecture** deployed on Vercel with a Supabase PostgreSQL backend. The system is designed to be stateless, scalable, and zero-maintenance.

---

## Architecture Diagram

```
                          ┌─────────────────────────────────┐
                          │         USER BROWSER            │
                          │  (PC / Phone / Tablet)          │
                          └──────────────┬──────────────────┘
                                         │ HTTPS
                          ┌──────────────▼──────────────────┐
                          │         VERCEL EDGE              │
                          │    (Global CDN + Serverless)     │
                          └──┬──────────────────────────┬───┘
                             │                          │
               ┌─────────────▼──────────┐   ┌──────────▼──────────┐
               │   Next.js App Router   │   │  Static Assets      │
               │   (Server Components)  │   │  (CSS, JS, Images)  │
               └─────────────┬──────────┘   └─────────────────────┘
                             │
          ┌──────────────────┼────────────────────┐
          │                  │                    │
┌─────────▼──────┐  ┌────────▼────────┐  ┌────────▼──────────┐
│ /api/generate  │  │  /api/health    │  │  /api/admin/*     │
│                │  │  /api/history   │  │  (protected)      │
│ ┌────────────┐ │  │  /api/cleanup   │  │                   │
│ │ Gemini AI  │ │  └────────┬────────┘  └────────┬──────────┘
│ │ (primary)  │ │           │                    │
│ └────────────┘ │  ┌────────▼────────────────────▼──────────┐
│ ┌────────────┐ │  │              SUPABASE                   │
│ │ Claude AI  │ │  │         (PostgreSQL Database)           │
│ │ (fallback) │ │  │         generations table               │
│ └────────────┘ │  └─────────────────────────────────────────┘
└────────────────┘
```

---

## Request Flow: Code Generation

```
1. User uploads image → browser converts to base64
2. POST /api/generate { imageBase64, mediaType, framework, apiKey? }
3. Server checks: GOOGLE_API_KEY → ANTHROPIC_API_KEY → client key
4. AI model receives: system prompt + base64 image
5. AI returns: raw code string
6. Server strips markdown fences from response
7. (If Supabase configured) logs generation to DB
8. Returns: { code, framework, provider, usage: { input_tokens, output_tokens } }
9. Client renders in SyntaxHighlighter + iframe preview
```

---

## Admin Auth Flow

```
1. POST /api/admin/auth { username, password }
2. Server compares against ADMIN_USER / ADMIN_PASS env vars
3. On success: sets httpOnly cookie "morphui_admin_session=authenticated"
4. middleware.ts intercepts every /admin/* request
5. If cookie missing/wrong → 307 redirect to /admin/login
6. If cookie valid → request proceeds to admin page
7. DELETE /api/admin/auth clears cookie (Max-Age=0)
```

---

## Component Tree

```
app/
├── layout.tsx
│   └── <html> with Inter font + SEO meta
│
└── page.tsx (Home)
    ├── <Background />      ← Canvas particle system (fixed)
    ├── <Header />          ← Sticky nav, logo, status badge
    ├── <main>
    │   ├── Hero h1
    │   ├── API key pill
    │   └── .workspace-grid
    │       ├── <UploadZone />    ← Dropzone + framework pills + generate btn
    │       ├── <Examples />      ← 4 canvas-drawn sketch examples
    │       └── <CodeViewer />    ← Tabs: Code | Preview
    └── <footer>
        └── <AdminAccess />       ← Triple-click hidden admin link
```

---

## Database Schema (Supabase)

```sql
CREATE TABLE generations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  framework   TEXT NOT NULL,
  tokens      INTEGER DEFAULT 0,
  provider    TEXT DEFAULT 'gemini',
  success     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast cleanup queries
CREATE INDEX idx_generations_created_at ON generations(created_at);

-- Auto-cleanup: delete records older than 30 days
-- (triggered by Vercel cron via /api/cleanup)
```

---

## Cron Jobs (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Runs daily at 2:00 AM UTC. Deletes all `generations` rows older than 30 days.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | ⭐ Recommended | Gemini free API key |
| `ANTHROPIC_API_KEY` | Optional | Claude fallback |
| `ADMIN_USER` | Optional | Default: `admin` |
| `ADMIN_PASS` | Optional | Default: `morphui@2026` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |

---

## Security Architecture

- **No client-side API keys** — all AI calls happen server-side
- **httpOnly cookie auth** — session can't be stolen via XSS
- **Input validation** — all API inputs validated before processing
- **Rate limiting** — Vercel's built-in DDoS protection
- **CORS** — Next.js default same-origin policy
- **Hidden admin** — no public link to admin login page
