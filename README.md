# Output

A tool for tracking your actual output and building a deep work habit. You run timed work blocks, log what you got done, and review the shape of your week.

Live at [useoutput.app](https://useoutput.app) (or wherever you've deployed it).

## Status

**Maintenance paused.** I built this for myself and had a lot of fun with it, but I've moved on to [favorite](https://myfavoriteapp.com/). The code is here for anyone who wants to learn from it, fork it, or pick it up. PRs and issues may go unanswered — fork freely.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- React 19
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — Postgres + Auth + RLS
- Deployed on [Vercel](https://vercel.com)

## Running it locally

### 1. Prerequisites

- Node 20+ (or [Bun](https://bun.sh))
- A free Supabase project — create one at [supabase.com](https://supabase.com)

### 2. Install

```bash
git clone https://github.com/abdulmirr/output.git
cd output
npm install    # or: bun install
```

### 3. Set up the database

In your Supabase project, open the SQL Editor and run [`supabase-schema.sql`](./supabase-schema.sql). This creates every table, policy, and function the app needs.

If you later pull updates that change the schema, apply [`supabase-migrations.sql`](./supabase-migrations.sql) incrementally.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project (Dashboard → Project Settings → API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The anon key is safe to expose on the client — Row-Level Security is what actually protects data.

### 5. Run

```bash
npm run dev    # or: bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

Push the repo to Vercel and set the same three env vars under Project Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to your production URL so OAuth and password-reset redirects land in the right place.

## Project layout

```
src/
  app/             # Next.js App Router routes
    (app)/         # Authenticated app shell
    (auth)/        # Login / signup / password reset
  components/      # UI components
  lib/
    supabase/      # Supabase browser + server clients
supabase-schema.sql       # Full schema — run this first
supabase-migrations.sql   # Incremental migrations
```

## License

[MIT](./LICENSE) — do what you want, no warranty. If you ship something cool with this, I'd love to see it.
