-- Phase 21: Roommates Marketplace
-- Creates a lightweight listing system where students can publish roommate needs
-- and browse other active roommate posts.

create table if not exists public.roommate_posts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  university text not null,
  preferred_location text,
  budget_range text,
  contact_phone text,
  about text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roommate_posts_student_unique unique (student_id)
);

create index if not exists roommate_posts_university_idx
  on public.roommate_posts (university);

create index if not exists roommate_posts_active_idx
  on public.roommate_posts (is_active);

alter table public.roommate_posts enable row level security;

-- Everyone can view active roommate posts
drop policy if exists "roommate posts are readable"
  on public.roommate_posts;

create policy "roommate posts are readable"
  on public.roommate_posts
  for select
  using (is_active = true);

-- Only students can publish their own roommate post
drop policy if exists "students can insert own roommate posts"
  on public.roommate_posts;

create policy "students can insert own roommate posts"
  on public.roommate_posts
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'student'
        and u.is_active = true
    )
  );

-- Students can update only their own post
drop policy if exists "students can update own roommate posts"
  on public.roommate_posts;

create policy "students can update own roommate posts"
  on public.roommate_posts
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Students can delete only their own post
drop policy if exists "students can delete own roommate posts"
  on public.roommate_posts;

create policy "students can delete own roommate posts"
  on public.roommate_posts
  for delete
  to authenticated
  using (student_id = auth.uid());

-- Keep updated_at current
create or replace function public.set_roommate_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_roommate_posts_updated_at on public.roommate_posts;
create trigger trg_set_roommate_posts_updated_at
before update on public.roommate_posts
for each row execute function public.set_roommate_posts_updated_at();
