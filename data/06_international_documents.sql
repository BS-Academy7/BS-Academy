-- ============================================
-- B&S Academy - International documents layer
-- Run after previous migrations.
-- Adds country, language, currency, and editable document template settings.
-- ============================================

alter table public.profiles
  add column if not exists country_code text default 'EG',
  add column if not exists phone_country_code text default 'EG',
  add column if not exists preferred_language text default 'ar',
  add column if not exists preferred_currency text default 'EGP';

alter table public.ondemand_requests
  add column if not exists country_code text default 'EG',
  add column if not exists phone_country_code text default 'EG',
  add column if not exists phone_local text,
  add column if not exists preferred_language text default 'ar',
  add column if not exists preferred_currency text default 'EGP';

create table if not exists public.academy_document_settings (
  id text primary key default 'default',
  default_language text not null default 'ar',
  default_currency text not null default 'EGP',
  allow_dual_language boolean not null default true,
  invoice_template jsonb not null default '{}'::jsonb,
  contract_template jsonb not null default '{}'::jsonb,
  official_footer jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamp with time zone default now()
);

alter table public.academy_document_settings enable row level security;

drop policy if exists "Admins can view document settings" on public.academy_document_settings;
create policy "Admins can view document settings"
  on public.academy_document_settings for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'super_admin', 'drive_manager')
    )
  );

drop policy if exists "Super admins can manage document settings" on public.academy_document_settings;
create policy "Super admins can manage document settings"
  on public.academy_document_settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'super_admin'
    )
  );

insert into public.academy_document_settings (
  id,
  default_language,
  default_currency,
  allow_dual_language,
  invoice_template,
  contract_template,
  official_footer
) values (
  'default',
  'ar',
  'EGP',
  true,
  '{
    "show_logo": true,
    "show_qr": false,
    "qr_position": "footer",
    "layout": "academy_standard",
    "editable_from_dashboard": true
  }'::jsonb,
  '{
    "show_logo": true,
    "show_qr": false,
    "layout": "academy_contract",
    "editable_from_dashboard": true
  }'::jsonb,
  '{
    "owner_name": "Eng/Bahaa Hussein",
    "owner_title": "Academy Owner & General Manager",
    "show_owner_name": true,
    "show_academy_stamp": true,
    "show_owner_signature": true,
    "applies_to": ["invoice", "contract", "certificate", "letter", "internal_document"]
  }'::jsonb
) on conflict (id) do update set
  default_language = excluded.default_language,
  default_currency = excluded.default_currency,
  allow_dual_language = excluded.allow_dual_language,
  invoice_template = public.academy_document_settings.invoice_template || excluded.invoice_template,
  contract_template = public.academy_document_settings.contract_template || excluded.contract_template,
  official_footer = public.academy_document_settings.official_footer || excluded.official_footer,
  updated_at = now();
