-- ============================================
-- B&S Academy - Dynamic QR Lifecycle
-- Run this file in Supabase SQL Editor.
-- ============================================

create table if not exists public.qr_routing_settings (
  id text primary key default 'main',
  transition_mode boolean not null default false,
  current_platform_url text not null default 'https://bs-academy7.github.io/BS-Academy/',
  new_platform_url text not null default 'https://bs-academy7.github.io/BS-Academy/',
  expiration_timestamp timestamptz not null default (now() + interval '30 days'),
  new_qr_media_url text,
  support_contact_url text not null default 'https://wa.me/201550755928',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint qr_routing_settings_singleton check (id = 'main')
);

alter table public.qr_routing_settings enable row level security;

drop policy if exists "QR settings are public readable" on public.qr_routing_settings;
create policy "QR settings are public readable"
on public.qr_routing_settings
for select
using (id = 'main');

drop policy if exists "Admins manage QR settings" on public.qr_routing_settings;
create policy "Admins manage QR settings"
on public.qr_routing_settings
for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  id = 'main'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
);

create or replace function public.set_qr_routing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists qr_routing_settings_set_updated_at on public.qr_routing_settings;
create trigger qr_routing_settings_set_updated_at
before update on public.qr_routing_settings
for each row
execute function public.set_qr_routing_updated_at();

create or replace function public.get_qr_routing_settings(cache_bust text default null)
returns table (
  transition_mode boolean,
  current_platform_url text,
  new_platform_url text,
  expiration_timestamp timestamptz,
  new_qr_media_url text,
  support_contact_url text
)
language sql
stable
as $$
  select
    q.transition_mode,
    q.current_platform_url,
    q.new_platform_url,
    q.expiration_timestamp,
    q.new_qr_media_url,
    q.support_contact_url
  from public.qr_routing_settings q
  where q.id = 'main'
  limit 1;
$$;

grant execute on function public.get_qr_routing_settings(text) to anon, authenticated;

insert into public.qr_routing_settings (
  id,
  transition_mode,
  current_platform_url,
  new_platform_url,
  expiration_timestamp,
  new_qr_media_url,
  support_contact_url
)
values (
  'main',
  false,
  'https://bs-academy7.github.io/BS-Academy/',
  'https://bs-academy7.github.io/BS-Academy/',
  now() + interval '30 days',
  null,
  'https://wa.me/201550755928'
)
on conflict (id) do nothing;
