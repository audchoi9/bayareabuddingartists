-- Bay Area Budding Artists — Soft delete
-- Run this in your Supabase project AFTER schema.sql and admin.sql:
--   SQL Editor -> New query -> paste -> Run
--
-- Adds a `deleted_at` column to submissions and categories so the admin page
-- can hide/recover items without ever destroying data or photos.

alter table public.submissions add column if not exists deleted_at timestamptz;
alter table public.categories  add column if not exists deleted_at timestamptz;

create index if not exists submissions_deleted_at_idx on public.submissions (deleted_at);
create index if not exists categories_deleted_at_idx  on public.categories (deleted_at);

-- Submissions previously had no UPDATE policy; soft-delete/restore need one.
-- (Matches the app's current open model; harden later with a service role.)
drop policy if exists "public update submissions" on public.submissions;
create policy "public update submissions"
  on public.submissions for update using (true) with check (true);
