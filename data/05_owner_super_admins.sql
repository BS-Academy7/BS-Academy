-- ============================================
-- B&S Academy - Owner / Super Admin Accounts
-- Keeps academy owner emails at absolute super_admin level.
-- ============================================

create extension if not exists pgcrypto;

create table if not exists public.owner_admin_accounts (
  email text primary key,
  display_name text not null,
  display_title text not null default 'Academy Owner',
  signature_code text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles
  add column if not exists display_title text,
  add column if not exists signature_code text;

insert into public.owner_admin_accounts (
  email,
  display_name,
  display_title,
  signature_code,
  is_active
)
values
  ('bs.academy.com@gmail.com', 'Eng/Bahaa', 'Academy Owner & General Manager', 'Pb7', true),
  ('bahaahussein.com@gmail.com', 'Eng/Bahaa', 'Academy Owner & General Manager', 'Pb7', true)
on conflict (email) do update
set display_name = excluded.display_name,
    display_title = excluded.display_title,
    signature_code = excluded.signature_code,
    is_active = excluded.is_active,
    updated_at = now();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  owner_account public.owner_admin_accounts%rowtype;
  target_account_type text;
  target_status text;
  target_role text;
begin
  select *
  into owner_account
  from public.owner_admin_accounts
  where lower(email) = lower(new.email)
    and is_active = true;

  target_role := case when owner_account.email is not null then 'super_admin' else 'student' end;
  target_account_type := case
    when owner_account.email is not null then 'staff'
    else coalesce(new.raw_user_meta_data->>'account_type', 'student')
  end;
  target_status := case when owner_account.email is not null then 'approved' else 'needs_profile' end;

  insert into public.profiles (
    id,
    full_name,
    whatsapp,
    account_type,
    onboarding_status,
    desired_position,
    specialty,
    role,
    display_title,
    signature_code,
    approved_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', owner_account.display_name, 'New User'),
    new.raw_user_meta_data->>'whatsapp',
    target_account_type,
    target_status,
    new.raw_user_meta_data->>'desired_position',
    new.raw_user_meta_data->>'specialty',
    target_role,
    owner_account.display_title,
    owner_account.signature_code,
    case when owner_account.email is not null then now() else null end
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, public.profiles.full_name),
      whatsapp = excluded.whatsapp,
      account_type = excluded.account_type,
      desired_position = excluded.desired_position,
      specialty = excluded.specialty,
      role = excluded.role,
      onboarding_status = excluded.onboarding_status,
      display_title = excluded.display_title,
      signature_code = excluded.signature_code,
      approved_at = coalesce(public.profiles.approved_at, excluded.approved_at);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

update public.profiles p
set role = 'super_admin',
    account_type = 'staff',
    onboarding_status = 'approved',
    full_name = oa.display_name,
    display_title = oa.display_title,
    signature_code = oa.signature_code,
    approved_at = coalesce(p.approved_at, now())
from auth.users u
join public.owner_admin_accounts oa
  on lower(oa.email) = lower(u.email)
where p.id = u.id
  and oa.is_active = true;

update public.onboarding_applications app
set account_type = 'staff',
    current_stage_key = 'approved',
    status = 'approved',
    reviewed_at = coalesce(app.reviewed_at, now())
from auth.users u
join public.owner_admin_accounts oa
  on lower(oa.email) = lower(u.email)
where app.user_id = u.id
  and oa.is_active = true;

alter table public.owner_admin_accounts enable row level security;

drop policy if exists "Super admins can view owner admin accounts" on public.owner_admin_accounts;
create policy "Super admins can view owner admin accounts"
  on public.owner_admin_accounts for select
  using (public.bs_is_admin(array['super_admin']));

drop policy if exists "Super admins can manage owner admin accounts" on public.owner_admin_accounts;
create policy "Super admins can manage owner admin accounts"
  on public.owner_admin_accounts for all
  using (public.bs_is_admin(array['super_admin']))
  with check (public.bs_is_admin(array['super_admin']));
