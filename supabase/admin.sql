-- Bay Area Budding Artists — Admin categories setup
-- Run this in your Supabase project AFTER schema.sql:
--   SQL Editor -> New query -> paste -> Run
--
-- Creates the `categories` table that powers the editable Sessions & Species
-- lists (managed at /admin). Starts EMPTY on purpose — add sessions/species
-- from the admin page as you actually run them.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('session', 'species')),
  value text not null,
  label text not null,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (type, value)
);

create index if not exists categories_type_idx on public.categories (type);

-- Public read so the upload form, browse filters, and gallery can list them.
-- Writes are open too (matches the app's current no-login model); the /admin
-- page is gated by a password. To lock writes down later, remove the write
-- policies below and route admin edits through a server action using the
-- Supabase service-role key.
alter table public.categories enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select using (true);

drop policy if exists "public insert categories" on public.categories;
create policy "public insert categories"
  on public.categories for insert with check (true);

drop policy if exists "public update categories" on public.categories;
create policy "public update categories"
  on public.categories for update using (true) with check (true);

drop policy if exists "public delete categories" on public.categories;
create policy "public delete categories"
  on public.categories for delete using (true);
