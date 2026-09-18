# Tally

Click counters for anything worth counting — how many times you wore those
pants, cups of coffee, whatever. Backed by Postgres (Neon) so your counts
sync across devices, and installable as a PWA.

## Features

- **Boards** — the home page lists your boards; create as many as you want,
  each with its own isolated set of tallies at `/<board-slug>`. Boards can be
  renamed, deleted, or dragged to reorder.
- **Tallies** — click to count by a configurable step, edit name/color/step
  anytime, delete, or drag to reorder within a board.
- **Auto-tally** — mark a tally to auto-add its step once per day on its own.
  Since there's no always-on server, this catches up lazily: opening the app
  (or hitting the API) backfills however many days were missed.
- **CSV export** — download a board's tallies from its export button.
- **PWA** — installable to your home screen/dock, with a service worker for
  offline fallback and cached static assets.
- Light/dark theme, following system preference or manually toggled.

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

4. Create the schema (tables, columns, and indexes — safe to re-run any
   time, including after pulling schema changes):

   ```bash
   npm run db:migrate
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

This repo is deployed by pushing to GitHub and letting Vercel's GitHub
integration build and deploy automatically — no `vercel` CLI needed:

1. In the Vercel dashboard: **New Project → Import** this GitHub repo.
2. Add `DATABASE_URL` under **Settings → Environment Variables** (Production,
   and Preview/Development if you want those to hit the same or a separate
   database).
3. Run `npm run db:migrate` once against that database — locally with
   `DATABASE_URL` in `.env.local` pointed at it, since the migration script
   isn't run automatically as part of the build.
4. Push to `main`; Vercel redeploys on every push.

After changing `db/schema.sql`, re-run `npm run db:migrate` against
production before or after the deploy — it's idempotent, so re-running it
is always safe.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Postgres (Neon in production) via `pg`
- Framer Motion for animations and drag-to-reorder
