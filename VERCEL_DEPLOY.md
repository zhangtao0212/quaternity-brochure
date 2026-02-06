# Vercel + Vercel KV Deployment Guide

## Architecture Overview

```
User Request (https://qosmos.one)
           │
           ▼
    ┌──────────────┐
    │   Vercel     │
    │   CDN/Edge   │
    └──────┬───────┘
           │
    ┌──────┴───────┐
    │              │
┌───▼───┐    ┌─────▼─────┐
│ Front │    │  API       │
│ End   │    │  Functions │
└───────┘    └─────┬───────┘
                   │
            ┌──────┴──────┐
            │   Vercel KV  │
            │   (Redis)    │
            └──────────────┘
```

## Prerequisites

1. **Vercel Account**: https://vercel.com (free to sign up)
2. **Domain**: qosmos.one (pointing to your VPS IP temporarily, we'll switch to Vercel)
3. **Email Service**: Resend (https://resend.com) - free tier available

---

## Step 1: Create Vercel KV Database

```bash
# Option A: Via Vercel CLI
npm i -g vercel
vercel login
vercel kv create qosmos-kv

# Option B: Via Vercel Dashboard
# 1. Go to https://vercel.com/storage
# 2. Click "Create Database" -> "KV"
# 3. Name: qosmos-kv
# 4. Select region: IAD1 (Washington D.C.)
# 5. Click "Create"
```

**Important**: Note down the `KV_REST_API_URL` and `KV_REST_API_TOKEN` shown after creation.

---

## Step 2: Configure Environment Variables

### Option A: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (import from GitHub)
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `KV_REST_API_URL` | (from Step 1) | Production, Development |
| `KV_REST_API_TOKEN` | (from Step 1) | Production, Development |
| `DOMAIN` | `qosmos.one` | Production, Development |
| `REPORT_EMAIL` | `contact@qosmos.one` | Production, Development |
| `RESEND_API_KEY` | (from Resend) | Production, Development |

### Option B: Vercel CLI

```bash
vercel env add KV_REST_API_URL production
vercel env add KV_REST_API_TOKEN production
vercel env add DOMAIN production
vercel env add REPORT_EMAIL production
vercel env add RESEND_API_KEY production
```

---

## Step 3: Deploy to Vercel

### Option A: Git Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Qosmos website with Vercel KV"
   git remote add origin https://github.com/yourusername/quaternity-brochure.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Deploy"

### Option B: Vercel CLI

```bash
vercel --prod
```

---

## Step 4: Configure Domain

### In Vercel Dashboard:

1. Go to **Settings** → **Domains**
2. Add `qosmos.one`
3. Add `www.qosmos.one`
4. Vercel will provide DNS records

### Update DNS (at your domain registrar):

Add the CNAME records provided by Vercel:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### Remove VPS Configuration:

Once Vercel DNS propagates (can take up to 24 hours):
- Remove the A record pointing to `198.13.57.142`
- The Nginx/VPS configuration is no longer needed for the main site

---

## Step 5: Configure Email Service (Resend)

1. **Sign up** at https://resend.com (free tier: 100 emails/month)
2. **Get API Key** from Dashboard → API Keys
3. **Add to Vercel**:
   ```bash
   vercel env add RESEND_API_KEY production
   # Enter: re_xxxxxxxxxxxxx
   ```

---

## Step 6: Verify Deployment

### Test the API:

```bash
# Check stats
curl https://qosmos.one/api/stats

# Submit a test email
curl -X POST https://qosmos.one/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check stats again
curl https://qosmos.one/api/stats
```

### View Subscribers in Vercel Dashboard:

1. Go to https://vercel.com/storage
2. Click on your KV database
3. Use the Data Browser to view stored subscribers

---

## Step 7: Configure Cron Job (Daily Reports)

The cron job is already configured in `vercel.json` to run at **9:00 AM daily**.

To verify:
1. Go to **Settings** → **Cron Jobs**
2. You should see `api/cron/report` scheduled for daily execution

---

## Managing Subscribers

### View All Subscribers

```bash
# Using Vercel CLI
vercel kv keys list
vercel kv get subscribers:emails
```

### Export Subscribers

1. Go to **Vercel Dashboard** → **Storage** → **KV**
2. Click on your database
3. Use Data Browser or export to JSON

### Delete a Subscriber

```bash
# Via API (requires authentication)
curl -X DELETE https://qosmos.one/api/subscribe \
  -H "Authorization: Bearer YOUR_SECRET"
```

---

## Monitoring

### View Logs

```bash
# Vercel CLI
vercel logs --prod
```

### Monitor Cron Jobs

1. Go to **Vercel Dashboard** → **Functions** → **Cron Jobs**
2. View execution history and status

---

## Troubleshooting

### "KV_REST_API_URL not found"

1. Check environment variables are set in Vercel Dashboard
2. Redeploy after adding variables: `vercel --prod`

### "Connection refused" errors

1. Verify KV database is in the same region as your deployment
2. Check API route is not timing out (Vercel functions have 10s timeout)

### Cron job not running

1. Verify `vercel.json` has correct cron configuration
2. Check the function is deployed in Production (not Preview)
3. Cron jobs require a paid plan on Vercel (Pro or Enterprise)

---

## Updating the Website

### Via Git Push

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

Vercel will automatically deploy.

### Via Vercel CLI

```bash
vercel --prod
```

---

## Cost Estimation

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel (Hobby) | Unlimited | Static sites + functions |
| Vercel KV | 1 GB | 10K reads/day, 10K writes/day |
| Resend | 100 emails/month | More than enough for daily reports |
| Domain | ~$12/year | .one domain |

**Estimated Monthly Cost**: $0 (within free tiers for most sites)

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel KV: https://vercel.com/docs/storage/vercel-kv
- Resend Docs: https://resend.com/docs
