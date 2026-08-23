-- Bay Area Budding Artists — Supabase setup
-- Run this in your NEW Supabase project:
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- This creates the `submissions` table and opens up public (no-login)
-- read + insert access, matching the "no accounts" design.
-- You also need a public Storage bucket named `artwork` (see README / bottom note).

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  display_name text not null,
  is_anonymous boolean not null default false,
  species text,
  session text,
  title text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);
create index if not exists submissions_species_idx on public.submissions (species);
create index if not exists submissions_session_idx on public.submissions (session);

-- Row Level Security: allow anonymous public read + insert (no updates/deletes).
alter table public.submissions enable row level security;

drop policy if exists "public read submissions" on public.submissions;
create policy "public read submissions"
  on public.submissions for select
  using (true);

drop policy if exists "public insert submissions" on public.submissions;
create policy "public insert submissions"
  on public.submissions for insert
  with check (true);

-- Needed for admin soft-delete / restore of artwork.
drop policy if exists "public update submissions" on public.submissions;
create policy "public update submissions"
  on public.submissions for update
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- STORAGE BUCKET
-- Easiest: Dashboard -> Storage -> New bucket -> name "artwork" -> Public.
-- Or run the SQL below to create the bucket + public read/insert policies:

insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', true)
on conflict (id) do nothing;

drop policy if exists "public read artwork" on storage.objects;
create policy "public read artwork"
  on storage.objects for select
  using (bucket_id = 'artwork');

drop policy if exists "public upload artwork" on storage.objects;
create policy "public upload artwork"
  on storage.objects for insert
  with check (bucket_id = 'artwork');
