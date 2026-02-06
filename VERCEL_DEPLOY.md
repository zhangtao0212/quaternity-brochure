# Vercel Deployment Guide - Simplified Version

## Architecture

```
User submits email
       │
       ▼
┌─────────────┐
│  Vercel     │  POST /api/subscribe
│  API        │──────────────┐
└─────────────┘              │
                              ▼
                    ┌───────────────┐
                    │   Resend      │
                    │   (Send Mail) │
                    └───────────────┘
                              │
                              ▼
                    contact@qosmos.one  📧
```

## What's Changed

- **No database storage** - emails are sent directly
- **No daily reports** - each subscription sends an email
- **Simpler setup** - only Resend API needed

---

## Deployment Steps

### 1. Configure Resend (https://resend.com)

1. Sign up for free at https://resend.com
2. Verify your email
3. Go to **API Keys** → **Create API Key**
4. Copy your API key (starts with `re_`)

### 2. Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Import your GitHub repository `zhangtao0212/quaternity-brochure`
4. In **Environment Variables**, add:

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | `re_your_api_key_here` |
| `FROM_EMAIL` | `newsletter@qosmos.one` |
| `TO_EMAIL` | `contact@qosmos.one` |

5. Click **Deploy**

### 3. Configure Domain

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add `qosmos.one`
3. Update DNS at your domain registrar:
   - Remove A record pointing to `198.13.57.142`
   - Add CNAME record: `@` → `cname.vercel-dns.com`

---

## How It Works

1. User enters email and clicks "Join"
2. Request sent to `/api/subscribe`
3. Vercel uses Resend API to send email to `contact@qosmos.one`
4. User sees "Thank you!" message

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | ✅ Yes | Get from https://resend.com |
| `FROM_EMAIL` | No | Sender email (default: `newsletter@qosmos.one`) |
| `TO_EMAIL` | No | Recipient email (default: `contact@qosmos.one`) |

---

## Testing

```bash
# Test subscription
curl -X POST https://qosmos.one/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Response:
# {"message":"Thank you! We will be in touch soon."}
```

You should receive an email at `contact@qosmos.one`.

---

## Cost

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | Unlimited | $0 |
| Resend | 100 emails/month | $0 |

**Total: $0**
