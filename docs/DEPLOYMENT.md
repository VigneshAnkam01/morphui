# morphui — Deployment Guide

## Deploy to Vercel (Free — Recommended)

Vercel is the easiest way to host morphui for free. Once deployed, the app runs **24/7 globally** — even when your PC is off.

---

### Method 1: GitHub Integration (Best)

1. **Push to GitHub** (done — see repo)

2. **Connect Vercel**
   - Go to [vercel.com](https://vercel.com) → Sign in with GitHub
   - Click **"New Project"**
   - Import your `morphui` repository

3. **Set Environment Variables**
   In Vercel project settings → Environment Variables, add:
   ```
   GOOGLE_API_KEY          = AIzaSy...
   ADMIN_USER              = admin
   ADMIN_PASS              = morphui@2026
   NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
   ```

4. **Deploy**
   - Click **"Deploy"**
   - Done! Your app is live at `https://morphui-xxx.vercel.app`

5. **Auto-deploys**
   - Every `git push` to `main` triggers a new Vercel deploy automatically

---

### Method 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Follow the prompts. Set env vars when asked or in the Vercel dashboard.

---

## Custom Domain (Optional, Free)

1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g. `morphui.xyz`)
3. Update your domain's DNS to point to Vercel
4. Vercel auto-provisions an SSL certificate

---

## UptimeRobot Monitoring (Free — Keep It Alive 24/7)

UptimeRobot pings your health endpoint every 5 minutes:

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. Click **"Add New Monitor"**
3. Settings:
   ```
   Monitor Type: HTTP(s)
   URL: https://your-app.vercel.app/api/health
   Monitoring Interval: 5 minutes
   ```
4. Optional: add email/Telegram alerts if site goes down

---

## Auto Database Cleanup

The `vercel.json` already configures a daily cron:

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

This deletes `generations` records older than 30 days every day at 2 AM UTC.
No action needed — it runs automatically on Vercel.

---

## Environment Variables Reference

| Variable | Where to get it |
|----------|----------------|
| `GOOGLE_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — FREE |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `ADMIN_USER` | Set to whatever username you want |
| `ADMIN_PASS` | Set to a strong password |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |

---

## Production Checklist

- [ ] `GOOGLE_API_KEY` set in Vercel env vars
- [ ] `ADMIN_PASS` changed from default
- [ ] Supabase `generations` table created
- [ ] Supabase env vars set in Vercel
- [ ] UptimeRobot monitor added for `/api/health`
- [ ] Custom domain configured (optional)
- [ ] Test the live URL — upload a sketch and generate code
- [ ] Log in to `/admin` with your credentials
- [ ] Verify generation history appears in admin

---

## Vercel Free Tier Limits

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Function invocations | 100,000/month |
| Build minutes | 100/month |
| Cron jobs | 2/project |
| Team members | 1 (personal) |

morphui will run well within these limits for a portfolio/demo project.
