-- ============================================
-- B&S Academy - Unified Identity & Onboarding
-- Run this after the main schema and file catalog migrations.
-- ============================================

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists account_type text default 'student',
  add column if not exists onboarding_status text default 'needs_profile',
  add column if not exists desired_position text,
  add column if not exists specialty text,
  add column if not exists profile_completed_at timestamp with time zone,
  add column if not exists approved_at timestamp with time zone,
  add column if not exists approved_by uuid references public.profiles(id);

update public.profiles
set account_type = coalesce(account_type, case when role = 'admin' then 'staff' else 'student' end),
    onboarding_status = coalesce(onboarding_status, 'needs_profile');

create or replace function public.bs_is_admin(check_roles text[] default array['admin','super_admin','drive_manager'])
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = any(check_roles)
  );
$$ language sql security definer set search_path = public;

create table if not exists public.onboarding_stage_templates (
  id uuid default gen_random_uuid() primary key,
  account_type text not null,
  stage_key text not null,
  title_ar text not null,
  title_en text,
  stage_order int not null default 1,
  is_required boolean not null default true,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  unique(account_type, stage_key)
);

create table if not exists public.onboarding_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  account_type text not null default 'student',
  desired_position text,
  specialty text,
  current_stage_key text not null default 'complete_profile',
  status text not null default 'needs_profile',
  admin_notes text,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id),
  unique(user_id)
);

alter table public.onboarding_stage_templates enable row level security;
alter table public.onboarding_applications enable row level security;

insert into public.onboarding_stage_templates (account_type, stage_key, title_ar, title_en, stage_order, is_required)
values
  ('student', 'complete_profile', 'استكمال بيانات الطالب', 'Complete student profile', 1, true),
  ('student', 'active_student', 'تفعيل حساب الطالب', 'Activate student account', 2, true),
  ('instructor', 'complete_profile', 'استكمال بيانات المحاضر', 'Complete instructor profile', 1, true),
  ('instructor', 'documents', 'رفع السيرة الذاتية والشهادات', 'Upload CV and certificates', 2, true),
  ('instructor', 'technical_test', 'اختبار فني', 'Technical test', 3, false),
  ('instructor', 'interview', 'مقابلة', 'Interview', 4, false),
  ('instructor', 'final_review', 'مراجعة الإدارة العليا', 'Executive review', 5, true),
  ('instructor', 'approved', 'قبول المحاضر', 'Approve instructor', 6, true),
  ('staff', 'complete_profile', 'استكمال بيانات البوزيشن', 'Complete staff profile', 1, true),
  ('staff', 'permission_review', 'مراجعة الدور والصلاحيات', 'Role and permission review', 2, true),
  ('staff', 'approved', 'قبول وتفعيل الصلاحيات', 'Approve and activate permissions', 3, true)
on conflict (account_type, stage_key) do update
set title_ar = excluded.title_ar,
    title_en = excluded.title_en,
    stage_order = excluded.stage_order,
    is_required = excluded.is_required,
    is_active = true;

create or replace function public.handle_profile_onboarding()
returns trigger as $$
begin
  insert into public.onboarding_applications (
    user_id,
    account_type,
    desired_position,
    specialty,
    current_stage_key,
    status
  )
  values (
    new.id,
    coalesce(new.account_type, 'student'),
    new.desired_position,
    new.specialty,
    'complete_profile',
    coalesce(new.onboarding_status, 'needs_profile')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_created_init_onboarding on public.profiles;
create trigger on_profile_created_init_onboarding
  after insert on public.profiles
  for each row execute procedure public.handle_profile_onboarding();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    whatsapp,
    account_type,
    onboarding_status,
    desired_position,
    specialty,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.raw_user_meta_data->>'whatsapp',
    coalesce(new.raw_user_meta_data->>'account_type', 'student'),
    'needs_profile',
    new.raw_user_meta_data->>'desired_position',
    new.raw_user_meta_data->>'specialty',
    'student'
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      whatsapp = excluded.whatsapp,
      account_type = excluded.account_type,
      desired_position = excluded.desired_position,
      specialty = excluded.specialty;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop policy if exists "Admins can view profiles" on public.profiles;
create policy "Admins can view profiles"
  on public.profiles for select
  using (public.bs_is_admin(array['admin','super_admin','drive_manager']));

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.bs_is_admin(array['admin','super_admin']))
  with check (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Users can view onboarding templates" on public.onboarding_stage_templates;
create policy "Users can view onboarding templates"
  on public.onboarding_stage_templates for select
  using (auth.uid() is not null and is_active = true);

drop policy if exists "Super admins can manage onboarding templates" on public.onboarding_stage_templates;
create policy "Super admins can manage onboarding templates"
  on public.onboarding_stage_templates for all
  using (public.bs_is_admin(array['super_admin']))
  with check (public.bs_is_admin(array['super_admin']));

drop policy if exists "Users can view own onboarding application" on public.onboarding_applications;
create policy "Users can view own onboarding application"
  on public.onboarding_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own onboarding application" on public.onboarding_applications;
create policy "Users can insert own onboarding application"
  on public.onboarding_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view onboarding applications" on public.onboarding_applications;
create policy "Admins can view onboarding applications"
  on public.onboarding_applications for select
  using (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Admins can update onboarding applications" on public.onboarding_applications;
create policy "Admins can update onboarding applications"
  on public.onboarding_applications for update
  using (public.bs_is_admin(array['admin','super_admin']))
  with check (public.bs_is_admin(array['admin','super_admin']));
