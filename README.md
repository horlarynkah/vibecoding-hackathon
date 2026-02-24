## Creator Deal Tracker (MVP)

Production-ready MVP SaaS for creators to:
- Track brand deals + payment status
- Enforce **FREE vs PRO** (FREE max 3 deals)
- Upgrade via **Stripe subscriptions**
- PRO-only **email reminders** (Resend)
- PRO-only **PDF invoices** (pdf-lib)

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Configure env

Copy `.env.example` to `.env` and fill:
- `DATABASE_URL` (Supabase Postgres)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_URL`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`

### 3) Run migrations (first time)

After `DATABASE_URL` is set:

```bash
npx prisma migrate dev --name init
```

### 4) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Stripe setup

- Create a **Product** + **recurring Price** in Stripe.
- Put the price id into `STRIPE_PRICE_ID`.
- Add webhook endpoint: `/api/stripe/webhook` and subscribe to:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Deploy to Vercel

This workspace contains the app in the `creator-deal-tracker/` folder.

- In Vercel, set **Root Directory** to `creator-deal-tracker`.
- Add the same env vars in Vercel Project Settings.
- Set `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to your Vercel domain (e.g. `https://your-app.vercel.app`).
- Update your Stripe webhook endpoint URL to the Vercel URL.
- After you have a `prisma/migrations/` folder committed, production deploys should use:

```bash
npx prisma migrate deploy
```


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
