# Bay Area Budding Artists — Design Document

_Last updated: 2026-08-23_

## 1. Overview

**Bay Area Budding Artists** is a public digital art gallery for an
elementary-school workshop that blends **environmental biology** and **visual
arts**. In the workshop, kids learn about native Bay Area plants and animals —
their anatomy, their role in local ecosystems, and their impact on human
society — and then create artwork inspired by what they learned. This web app
is where that artwork is collected and displayed.

The current scope is intentionally focused on **the gallery experience**
(uploading and displaying art) plus a lightweight **admin** for the workshop
host. Biology lessons and drawing guides are planned for a later phase.

### Goals
- Let kids' artwork be uploaded quickly, with **no accounts or sign-up**.
- Show all artwork in a friendly, kid-appropriate **public gallery**.
- Let visitors **filter** art by species and workshop session.
- Give the workshop host an **admin area** to control the session/species
  options and to moderate (remove/restore) artwork.

### Non-goals (for now)
- User accounts, logins, or per-child profiles.
- Hosting the biology lessons or drawing guides in the app.
- Private/restricted galleries (the gallery is public for now).
- Hardened, role-based security (see §9).

---

## 2. Users & key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Accounts | **None.** Anyone can upload without signing up. | The host often uploads on kids' behalf; sign-up would add friction. |
| Attribution | Uploader chooses a **name** or **anonymous**. Anonymous auto-generates a fun nickname (adjective + Bay Area animal, e.g. "Curious Otter"). | Fun, privacy-friendly for minors. |
| Visibility | **Public** gallery. | Simplest for now; can be restricted later. |
| Sessions/species | **Editable by the host** via `/admin`; start empty. | Prevents uploads to sessions/species that haven't been run yet. |
| Deletion | **Soft delete** everywhere (recoverable). | Protects against accidental loss of kids' art. |

---

## 3. Tech stack

- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Icons:** lucide-react
- **Backend:** Supabase (Postgres + Storage), accessed from the browser with
  the public **anon** key
- **HEIC conversion:** heic2any (browser-side, lazily loaded)
- **Hosting:** Vercel
- **Repo:** https://github.com/audchoi9/bayareabuddingartists

This mirrors the stack of the companion `emotifind` project.

---

## 4. Architecture

The app is a mostly-static Next.js site. Data access happens **client-side**
directly against Supabase using the anon key. There is one server route
(`/api/admin/login`) so the admin password stays server-only.

```
Browser (React client components)
   │
   ├── Supabase JS client (anon key)
   │      ├── Postgres: submissions, categories   (read + write via RLS)
   │      └── Storage:  artwork bucket            (public read + upload)
   │
   └── POST /api/admin/login  ──►  Next.js server route
          (checks ADMIN_PASSWORD, never shipped to browser)
```

### Design notes
- **Client-side data access** keeps the app simple and cheap to host; there is
  no custom API layer. This is viable because the data is public and the
  security posture is intentionally open (see §9).
- **Label cache** (`lib/categories.ts`): display components need to turn a
  stored value like `sea-otter` into a label like "California Sea Otter"
  synchronously. Categories are fetched once (e.g. by the gallery) and their
  labels cached in a module-level map; `labelForSpecies`/`labelForSession`
  read from it with a `prettify()` fallback.

---

## 5. Data model (Supabase)

### Table: `submissions` (one row per uploaded artwork)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (pk) | default `gen_random_uuid()` |
| `image_url` | text | public URL of the file in Storage |
| `display_name` | text | chosen name or auto nickname |
| `is_anonymous` | boolean | true if using a generated nickname |
| `species` | text (nullable) | category value, e.g. `sea-otter` |
| `session` | text (nullable) | category value, e.g. `session-1` |
| `title` | text (nullable) | optional artwork title |
| `created_at` | timestamptz | default `now()` |
| `deleted_at` | timestamptz (nullable) | soft-delete marker; null = live |

### Table: `categories` (editable sessions & species)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (pk) | |
| `type` | text | `'session'` or `'species'` |
| `value` | text | slug, e.g. `california-poppy` |
| `label` | text | display name |
| `active` | boolean | false = hidden from uploads/filters, art kept |
| `sort` | integer | ordering |
| `created_at` | timestamptz | |
| `deleted_at` | timestamptz (nullable) | soft-delete marker |
| unique | `(type, value)` | prevents duplicates |

### Storage
- Bucket **`artwork`** (public). Files named `<timestamp>-<rand>.<ext>`.

### Row Level Security
All policies are currently **open** (public read + write), matching the
no-login model. Specifically:
- `submissions`: public select, insert, update (update enables soft-delete).
- `categories`: public select, insert, update, delete.
- `storage.objects` (artwork): public read + insert (no delete policy).

SQL lives in `supabase/`:
- `schema.sql` — submissions table, storage bucket, policies.
- `admin.sql` — categories table + policies.
- `soft-delete.sql` — adds `deleted_at` columns + submissions update policy.

---

## 6. Routes & pages

| Route | Type | Purpose |
|---|---|---|
| `/` | Home | Landing page: intro to the program + buttons to Gallery and Add Art. No gallery grid. |
| `/gallery` | Gallery | Grid of all live artwork (photos only) + a **Filter** button. |
| `/browse` | Filter | Species/session dropdowns that narrow the gallery; link back to full gallery. |
| `/upload` | Add Art | No-login upload form (photo, title, name/anonymous, species, session). |
| `/admin` | Admin | Password-gated management of sessions, species, and artwork. |
| `/api/admin/login` | Server route | Verifies `ADMIN_PASSWORD` server-side. |

### Navigation
Header shows **Home · Gallery · Add Art**. The admin page is reached by URL
(`/admin`) and is not linked in the public nav.

### Components
- `Header` — sticky top nav.
- `Gallery` — fetches artworks (+ warms the label cache), renders the grid,
  handles loading/empty/error states, opens the lightbox.
- `ArtCard` — a single artwork tile (image, name, species/session tags).
- `Lightbox` — full-size modal view of one artwork.

### Library modules
- `lib/supabaseClient.ts` — Supabase client + bucket name.
- `lib/artwork.ts` — artwork types, fetch/create, soft-delete/restore, HEIC→JPEG.
- `lib/categories.ts` — category types, fetch, soft-delete/restore, label cache, slugify.
- `lib/nicknames.ts` — random anonymous nickname generator.

---

## 7. Key features & behaviors

### Uploading (no account)
- Pick a photo, optionally add a title.
- Choose to tag a **name** or go **anonymous** (with a "Shuffle" button to
  reroll the generated nickname).
- Optionally pick a **species** and **session** — but only from the lists the
  host has added in admin. If none exist yet, the dropdowns show
  "No sessions/species added yet".
- Large sticky **"Upload artwork now"** button.
- On success, redirects to the gallery.

### HEIC handling
iPhones save photos as HEIC, which browsers and Vercel's image optimizer can't
display. On upload, HEIC/HEIF files are converted to JPEG in the browser before
being stored, so every image is web-friendly.

### Gallery & filtering
- Gallery shows all **live** artwork, newest first.
- The gallery only loads rows with a valid `http(s)` `image_url` (guards
  `next/image` against malformed rows).
- Filter page narrows by species and/or session (values come from the DB).

### Admin (`/admin`)
- **Password gate** checked by the `/api/admin/login` server route; on success
  a flag is stored in `sessionStorage` for the session.
- **Sessions** and **Species** managers: add (auto-slugged value), **hide/show**
  (`active` toggle — keeps past art, stops new uploads), and **delete**
  (soft). A "Show deleted" list allows **restore**. Re-adding a soft-deleted
  item restores it instead of erroring on the unique constraint.
- **Artwork** manager: thumbnail grid with per-item **remove** (soft delete)
  and a "Show deleted artwork" list to **restore**.

### Soft delete (everywhere)
Deleting a session, species, or artwork sets `deleted_at` rather than removing
the row. Deleted items disappear from public views but can be restored from
admin. **Deleting a session/species never deletes photos** — categories and
submissions are separate records; a submission just keeps its stored value.

---

## 8. Styling

- Tailwind v4 with a CSS-first theme defined in `app/globals.css` via
  `@theme` (v4 does **not** read `tailwind.config.ts`).
- Palette (Bay Area nature theme): cream background, redwood-green primary,
  poppy-orange secondary, bay-blue accent, readable sage for muted text.
- Kid-friendly: rounded cards, big buttons, playful hero gradient.

---

## 9. Security & privacy

Current posture is **intentionally open** ("public for now, harden later"),
consistent with the no-login product decision.

- The gallery and uploads are fully public.
- Admin writes (categories, artwork soft-delete) use the anon key, so the
  `/admin` password gates the **UI** but does not cryptographically restrict
  the underlying database writes — a technical user could call the API
  directly.
- The anon key is public by design (safe to ship to the browser).
- `ADMIN_PASSWORD` is server-only (never prefixed with `NEXT_PUBLIC`).

**Planned hardening (future):** move admin writes to server actions/routes that
use the Supabase **service-role key**, and remove the public write policies so
only the server can modify categories and delete artwork. For minors' privacy,
consider restricting the gallery (e.g. an access code) and limiting names to
first-name/nickname only.

---

## 10. Configuration & deployment

### Environment variables
| Name | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client | **Bare** project URL, no `/rest/v1/`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Public anon key. |
| `ADMIN_PASSWORD` | server | Admin gate; **not** `NEXT_PUBLIC`. |

### Supabase setup (run once, in SQL Editor)
1. `supabase/schema.sql`
2. `supabase/admin.sql`
3. `supabase/soft-delete.sql`

### Vercel
- Import the GitHub repo (auto-detects Next.js; `vercel.json` sets framework).
- Add the three env vars above (all environments), then deploy.
- The build fails with `supabaseUrl is required` if the Supabase env vars are
  missing.

---

## 11. Known issues & follow-ups

- **Upload preview for HEIC**: the pre-upload preview may look broken for HEIC
  on non-Apple browsers (the stored/displayed image is fine). Converting the
  preview too is a possible improvement.
- **Legacy broken row**: one HEIC artwork uploaded before the fix remains
  broken; remove it via admin or the Supabase table editor.
- **Admin security**: see §9 — service-role hardening is the main follow-up.
- **Future features**: biology lessons & drawing guides, artwork
  reordering/editing in admin, richer per-child views, moderation queue.

---

## 12. Change history (high level)

1. Initial gallery app (upload, gallery, browse, lightbox) on Next.js + Supabase.
2. Fixed Tailwind v4 theme (invisible-text bug) and contrast.
3. Restructured into standalone Home, Gallery, and Filter pages.
4. Guarded the gallery against malformed image URLs.
5. Added password-gated `/admin` to manage sessions & species (DB-backed).
6. Added soft-delete + recover for categories and artwork.
7. Added iPhone HEIC → JPEG conversion on upload.
