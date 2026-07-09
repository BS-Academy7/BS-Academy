-- ============================================
-- B&S Academy - Editable Site Contacts
-- Run after 03_identity_onboarding.sql.
-- ============================================

create extension if not exists pgcrypto;

create table if not exists public.site_contacts (
  id uuid default gen_random_uuid() primary key,
  contact_type text not null default 'custom',
  label_ar text not null,
  label_en text,
  href text not null,
  icon_key text not null default 'custom',
  sort_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_site_contacts_active_order
  on public.site_contacts (is_active, sort_order, created_at);

alter table public.site_contacts enable row level security;

drop policy if exists "Public can view active site contacts" on public.site_contacts;
create policy "Public can view active site contacts"
  on public.site_contacts for select
  using (is_active = true);

drop policy if exists "Admins can view all site contacts" on public.site_contacts;
create policy "Admins can view all site contacts"
  on public.site_contacts for select
  using (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Admins can insert site contacts" on public.site_contacts;
create policy "Admins can insert site contacts"
  on public.site_contacts for insert
  with check (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Admins can update site contacts" on public.site_contacts;
create policy "Admins can update site contacts"
  on public.site_contacts for update
  using (public.bs_is_admin(array['admin','super_admin']))
  with check (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Admins can delete site contacts" on public.site_contacts;
create policy "Admins can delete site contacts"
  on public.site_contacts for delete
  using (public.bs_is_admin(array['admin','super_admin']));
