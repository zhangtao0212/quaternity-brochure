# Qosmos - On-Chain Bank for the Unbanked

A modern, responsive website showcasing Qosmos' Web3 financial infrastructure services for the unbanked population globally.

## Features

- **Modern Design**: Sleek, dark-themed UI with gradient accents
- **Mobile Optimized**: Fully responsive layout for all screen sizes
- **Performance**: Static export optimized for fast loading
- **Email Collection**: Built-in email subscription form

## Sections

1. **Hero**: Main value proposition with key stats
2. **Core Value Proposition**: Four main value propositions
3. **Services**: Six detailed service offerings
4. **Target Markets**: Focus regions (Southeast Asia, Africa, Latin America)
5. **Why Now**: Market timing and trends
6. **Join**: Email collection form
7. **Footer**: Contact information

## Getting Started

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

### Static Export

```bash
npm run build
# Output will be in ./out directory
```

## Project Structure

```
quaternity-brochure/
├── app/
│   ├── api/subscribe/     # Email subscription API
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── out/                    # Static build output
├── package.json
├── tsconfig.json
└── next.config.js
```

## Email Integration

The current implementation logs subscriber emails to the console. To integrate with a real email service:

1. Edit `app/api/subscribe/route.ts`
2. Add your email service integration (Mailchimp, SendGrid, ConvertKit, Airtable, etc.)

## Deployment

The project is configured for static export. Deploy the `out/` folder to:

- Vercel (automatic)
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting service

## Contact

- Email: contact@quaternity.xyz
- Website: https://quaternity.xyz
