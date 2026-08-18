-- =============================================================================
-- HOTFIX: public.users neexistuje / current_employee_id() zlyháva
-- Spustiť v Supabase SQL Editore (celý súbor naraz)
-- =============================================================================

-- 1) Vytvor public.users ak chýba (profil nad auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role user_role not null default 'Technik',
  employee_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Vytvor employees ak chýba
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  photo_url text,
  email text not null,
  phone text not null default '',
  position text not null,
  department text not null default '',
  employment_type text not null default 'Trvalý pracovný pomer',
  start_date date not null default current_date,
  current_site_id uuid,
  current_project_id uuid,
  supervisor_id uuid,
  is_online boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) FK medzi users ↔ employees (ak ešte nie je)
alter table public.users
  drop constraint if exists users_employee_id_fkey;
alter table public.users
  add constraint users_employee_id_fkey
  foreign key (employee_id) references public.employees(id) on delete set null;

-- 4) Oprav role funkcie (musia čítať z public.users, NIE auth.users)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'Administrátor'
  );
$$;

create or replace function public.is_manager_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('Administrátor', 'Projektový manažér', 'Vedúci montáže')
  );
$$;

-- 5) Oprav current_employee_id()
create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.employee_id from public.users u where u.id = auth.uid()),
    (select e.id from public.employees e where e.user_id = auth.uid() limit 1)
  );
$$;

-- 6) Backfill profilov pre existujúcich auth používateľov
insert into public.users (id, email, full_name, role)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  coalesce(
    (au.raw_user_meta_data->>'role')::user_role,
    'Technik'::user_role
  )
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
  and au.email is not null;

-- 7) RLS na public.users (ak ešte nie je zapnuté)
alter table public.users enable row level security;

drop policy if exists "users_select_authenticated" on public.users;
create policy "users_select_authenticated" on public.users
  for select to authenticated using (true);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update to authenticated using (id = auth.uid());

drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all" on public.users
  for all to authenticated using (public.is_admin());
