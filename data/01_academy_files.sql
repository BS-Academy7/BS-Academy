-- ============================================
-- Phase 1 & 2: Academy Files & Dashboard
-- Run this in Supabase SQL Editor
-- Safe to run more than once.
-- ============================================

create extension if not exists pgcrypto;

create table if not exists public.academy_files (
  id uuid default gen_random_uuid() primary key,
  drive_file_id text not null,
  drive_folder_id text,
  drive_url text,
  file_name text not null,
  mime_type text,
  file_size bigint,
  file_extension text,
  provider text default 'google-drive',

  owner_type text,
  owner_id text,

  entity_type text,
  entity_id text,
  entity_key text,

  category text,
  folder_path text,
  visibility_scope text default 'restricted',

  uploaded_by uuid references auth.users(id),
  uploaded_by_name text,

  archived boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.drive_access_requests (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users(id),
  requester_name text,
  requester_role text,
  requested_scope text,
  requested_drive_id text,
  reason text,
  status text default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.academy_files enable row level security;
alter table public.drive_access_requests enable row level security;

drop policy if exists "Super Admin can view all academy files" on public.academy_files;
drop policy if exists "Super Admin can manage all academy files" on public.academy_files;
drop policy if exists "Anyone can insert academy files" on public.academy_files;
drop policy if exists "Admins and drive managers can view academy files" on public.academy_files;
drop policy if exists "Super admins and drive managers can update academy files" on public.academy_files;
drop policy if exists "Super admins and drive managers can delete academy files" on public.academy_files;

create policy "Admins and drive managers can view academy files"
  on public.academy_files for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('admin', 'super_admin', 'drive_manager')
    )
  );

create policy "Super admins and drive managers can update academy files"
  on public.academy_files for update
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'drive_manager')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'drive_manager')
    )
  );

create policy "Super admins and drive managers can delete academy files"
  on public.academy_files for delete
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'drive_manager')
    )
  );

-- Public on-demand requests are anonymous, so file index insertion must remain open.
-- Select/update/delete remain protected by the policies above.
create policy "Anyone can insert academy files"
  on public.academy_files for insert
  with check (true);

drop policy if exists "Super Admin can view and manage access requests" on public.drive_access_requests;
drop policy if exists "Authenticated users can insert their own requests" on public.drive_access_requests;
drop policy if exists "Admins can view drive access requests" on public.drive_access_requests;
drop policy if exists "Super admins can manage drive access requests" on public.drive_access_requests;

create policy "Admins can view drive access requests"
  on public.drive_access_requests for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('admin', 'super_admin', 'drive_manager')
    )
  );

create policy "Super admins can manage drive access requests"
  on public.drive_access_requests for update
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'super_admin'
    )
  );

create policy "Authenticated users can insert their own requests"
  on public.drive_access_requests for insert
  with check (auth.uid() = requester_id);
