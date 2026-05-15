# morphui — Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Included with Node |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/morphui.git
cd morphui
npm install
```

---

## Step 2 — Get a Free API Key

### Option A: Google Gemini (Recommended — Free)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the key (starts with `AIza...`)

### Option B: Anthropic Claude

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account → API Keys → Create Key
3. Copy the key (starts with `sk-ant-...`)

---

## Step 3 — Configure Environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
# ── AI Provider (choose one or both) ──────────────
GOOGLE_API_KEY=AIzaSy...          # Free tier: 1500 requests/day
ANTHROPIC_API_KEY=sk-ant-api03-...  # Optional fallback

# ── Admin Credentials ──────────────────────────────
ADMIN_USER=admin
ADMIN_PASS=morphui@2026            # Change this to something secure!

# ── Database (optional but recommended) ───────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Step 4 — Set Up Supabase (Optional)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run:

```sql
CREATE TABLE generations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  framework   TEXT NOT NULL,
  tokens      INTEGER DEFAULT 0,
  provider    TEXT DEFAULT 'gemini',
  success     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generations_created_at ON generations(created_at);
```

4. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 5 — Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Step 6 — Run Tests

```bash
# With dev server running in another terminal:
node tests/run-tests.mjs
```

Expected: **31/31 passed**

---

## Common Issues

### "No API key configured" error
→ Make sure `.env.local` exists and has `GOOGLE_API_KEY` or `ANTHROPIC_API_KEY`

### Build fails with TypeScript errors
→ Run `npm run build` to see errors. Common fix: `npm install` to ensure all deps installed

### Admin login doesn't work
→ Check `ADMIN_USER` and `ADMIN_PASS` in `.env.local`. Defaults are `admin` / `morphui@2026`

### Supabase not connecting
→ Check both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
→ Verify the `generations` table exists in Supabase

### Port 3000 already in use
→ Kill other processes: `npx kill-port 3000` or use `npm run dev -- -p 3001`
