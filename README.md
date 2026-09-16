# Tally

Click counters for anything worth counting — how many times you wore those
pants, cups of coffee, whatever. Add as many tallies as you want, click to
count, edit or delete anytime. Backed by Postgres (Neon) so your counts sync
across devices.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Postgres database. On Vercel: **Storage → Create Database →
   Postgres** (this provisions a Neon database and can inject `DATABASE_URL`
   into your project's env vars automatically).

3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` with your
   connection string (or run `vercel env pull .env.local` if the project is
   already linked to Vercel).

4. Create the `items` table:

   ```bash
   npm run db:migrate
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

```bash
vercel link
vercel env pull .env.local   # if you provisioned the DB in the dashboard
npm run db:migrate           # run once against the production database
vercel deploy --prod
```

Make sure `DATABASE_URL` is set in the Vercel project's environment
variables (Production, Preview, and Development as needed) before deploying.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Neon Postgres via `@neondatabase/serverless`
- Framer Motion for the click/enter/exit animations
