# Bay Area Budding Artists 🎨🌱

A public digital art gallery for an elementary-school workshop blending **environmental biology** and **visual arts**. Kids draw native Bay Area plants and animals; their artwork is uploaded and displayed here for everyone to browse.

Built with **Next.js (App Router) + React + TypeScript + Tailwind CSS + Supabase**, deployable on **Vercel** — the same stack as the `emotifind` project.

## Features

- **No accounts, ever.** Anyone can upload art without signing up.
- **Anonymous option.** At upload, choose to tag a name or stay anonymous with an
  auto-generated nickname (random adjective + Bay Area animal, e.g. _"Curious Otter"_).
- **General gallery** (`/`) — every piece, newest first.
- **Browse** (`/browse`) — filter by **species** and **session**.
- **Upload** (`/upload`) — photo picker, title, artist name/anonymous, species, session.
- Click any piece to open it full-size in a lightbox.
- **Admin** (`/admin`) — password-gated page to manage the **Sessions** and
  **Species** lists. Only what you add here appears in the upload form and
  gallery filters, so no one can upload to a session/species you haven't run.
  Hide an item to keep its past art but stop new uploads to it.

Public for now (no access restrictions) — this can be locked down later.

## Setup

### 1. Create a new Supabase project

Go to [supabase.com](https://supabase.com/dashboard) → **New project**. Once it's ready:

- **SQL Editor → New query** → paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
  This creates the `submissions` table + a public `artwork` Storage bucket with the
  right no-login read/insert policies.
- Then run [`supabase/admin.sql`](./supabase/admin.sql) the same way. This creates
  the `categories` table that powers the editable Sessions & Species lists. It
  starts empty — add items from `/admin`.
- Confirm under **Storage** that a **public** bucket named `artwork` exists.

### 2. Add environment variables

Copy `.env.local.example` to `.env.local` and fill in values from
**Supabase → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
ADMIN_PASSWORD=pick-a-strong-password
```

> `NEXT_PUBLIC_SUPABASE_URL` must be the **bare** project URL (no `/rest/v1/`).
> `ADMIN_PASSWORD` is server-only — do **not** prefix it with `NEXT_PUBLIC`.
> Add all three in Vercel too, for production.

### 3. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Import the repo in Vercel, add the same two `NEXT_PUBLIC_SUPABASE_*` environment
variables in the project settings, and deploy. `vercel.json` is already configured.

## Customizing categories

Species and sessions live in [`lib/categories.ts`](./lib/categories.ts) — edit those
lists as the program evolves. Anonymous nickname words live in
[`lib/nicknames.ts`](./lib/nicknames.ts).

## Not included yet (planned)

- Biology lessons & drawing guides
- Private/restricted access
- Moderation tools
