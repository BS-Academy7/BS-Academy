-- ============================================
-- B&S Academy - Dashboard management layer
-- Users, permissions, document templates, and generated documents.
-- Run after 06_international_documents.sql.
-- ============================================

alter table public.profiles
  add column if not exists profile_status text not null default 'active',
  add column if not exists disabled_at timestamp with time zone,
  add column if not exists disabled_by uuid references public.profiles(id),
  add column if not exists admin_notes text;

create table if not exists public.admin_user_actions (
  id uuid default gen_random_uuid() primary key,
  action_type text not null, -- create_user / delete_auth_user / reset_password / role_change
  target_user_id uuid references public.profiles(id) on delete set null,
  target_email text,
  requested_role text,
  requested_account_type text,
  requested_password_note text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  requested_by uuid references public.profiles(id),
  processed_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  processed_at timestamp with time zone,
  admin_notes text
);

create table if not exists public.academy_document_templates (
  id uuid default gen_random_uuid() primary key,
  template_type text not null, -- invoice / contract / certificate / letter
  name_ar text not null,
  name_en text,
  language_mode text not null default 'ar',
  default_currency text not null default 'EGP',
  header_fields jsonb not null default '{}'::jsonb,
  body_fields jsonb not null default '{}'::jsonb,
  footer_fields jsonb not null default '{}'::jsonb,
  banking_details jsonb not null default '{}'::jsonb,
  terms_ar text,
  terms_en text,
  template_file_id uuid references public.academy_files(id) on delete set null,
  template_file_url text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.academy_generated_documents (
  id uuid default gen_random_uuid() primary key,
  document_type text not null, -- invoice / contract / certificate / letter
  template_id uuid references public.academy_document_templates(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  recipient_user_id uuid references public.profiles(id) on delete set null,
  recipient_name text,
  recipient_email text,
  language_mode text not null default 'ar',
  currency text not null default 'EGP',
  amount numeric(12,2),
  status text not null default 'draft',
  document_data jsonb not null default '{}'::jsonb,
  output_file_id uuid references public.academy_files(id) on delete set null,
  output_file_url text,
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  approved_at timestamp with time zone
);

alter table public.admin_user_actions enable row level security;
alter table public.academy_document_templates enable row level security;
alter table public.academy_generated_documents enable row level security;

drop policy if exists "Super admins can manage admin user actions" on public.admin_user_actions;
create policy "Super admins can manage admin user actions"
  on public.admin_user_actions for all
  using (public.bs_is_admin(array['super_admin']))
  with check (public.bs_is_admin(array['super_admin']));

drop policy if exists "Admins can view document templates" on public.academy_document_templates;
create policy "Admins can view document templates"
  on public.academy_document_templates for select
  using (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Super admins can manage document templates" on public.academy_document_templates;
create policy "Super admins can manage document templates"
  on public.academy_document_templates for all
  using (public.bs_is_admin(array['super_admin']))
  with check (public.bs_is_admin(array['super_admin']));

drop policy if exists "Admins can view generated documents" on public.academy_generated_documents;
create policy "Admins can view generated documents"
  on public.academy_generated_documents for select
  using (public.bs_is_admin(array['admin','super_admin']));

drop policy if exists "Admins can manage generated documents" on public.academy_generated_documents;
create policy "Admins can manage generated documents"
  on public.academy_generated_documents for all
  using (public.bs_is_admin(array['admin','super_admin']))
  with check (public.bs_is_admin(array['admin','super_admin']));

insert into public.academy_document_templates (
  template_type,
  name_ar,
  name_en,
  language_mode,
  default_currency,
  header_fields,
  body_fields,
  footer_fields,
  banking_details,
  terms_ar,
  terms_en,
  is_default,
  is_active
) values (
  'invoice',
  'تمبلت فاتورة B&S الرسمي',
  'Official B&S Invoice Template',
  'dual',
  'EGP',
  '{"show_logo": true, "show_invoice_number": true, "show_issue_date": true, "show_due_date": true, "show_student_data": true}'::jsonb,
  '{"show_items": true, "show_discount": true, "show_tax": false, "show_total_text": true, "show_notes": true}'::jsonb,
  '{"show_owner_name": true, "owner_name": "Eng/Bahaa Hussein", "show_academy_stamp": true, "show_owner_signature": true, "stamp_position": "bottom", "signature_overlay": true}'::jsonb,
  '{"enabled": true, "bank_name": "", "account_name": "B&S Academy", "iban": "", "swift": "", "wallets": []}'::jsonb,
  'تعتبر هذه الفاتورة رسمية بعد اعتماد الإدارة وختم الأكاديمية.',
  'This invoice is official after management approval and academy stamp.',
  true,
  true
) on conflict do nothing;

insert into public.academy_document_templates (
  template_type,
  name_ar,
  name_en,
  language_mode,
  default_currency,
  header_fields,
  body_fields,
  footer_fields,
  terms_ar,
  terms_en,
  is_default,
  is_active
) values (
  'contract',
  'تمبلت عقد B&S الرسمي',
  'Official B&S Contract Template',
  'dual',
  'EGP',
  '{"show_logo": true, "show_contract_number": true, "show_parties": true, "show_issue_date": true}'::jsonb,
  '{"show_scope": true, "show_payment_terms": true, "show_delivery_terms": true, "show_attachments": true}'::jsonb,
  '{"show_owner_name": true, "owner_name": "Eng/Bahaa Hussein", "show_academy_stamp": true, "show_owner_signature": true, "stamp_position": "bottom", "signature_overlay": true}'::jsonb,
  'يخضع العقد لاعتماد الإدارة العليا وختم الأكاديمية.',
  'This contract is subject to executive approval and academy stamp.',
  true,
  true
) on conflict do nothing;
