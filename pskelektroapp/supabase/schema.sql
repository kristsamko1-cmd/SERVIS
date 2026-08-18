-- =============================================================================
-- PSK Elektro – Fire Asset & Project Management System
-- Supabase / PostgreSQL schema (fresh install)
--
-- Spustenie: Supabase Dashboard → SQL Editor → vložiť celý súbor → Run
-- Alebo: supabase db push / supabase migration
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Drop stará schéma (odkomentujte pri migrácii zo starého projektu)
-- ---------------------------------------------------------------------------
-- drop table if exists audit_log cascade;
-- drop table if exists calendar_events cascade;
-- drop table if exists project_photos cascade;
-- drop table if exists project_notes cascade;
-- drop table if exists task_comments cascade;
-- drop table if exists task_updates cascade;
-- drop table if exists tasks cascade;
-- drop table if exists project_workers cascade;
-- drop table if exists projects cascade;
-- drop table if exists users cascade;

-- ---------------------------------------------------------------------------
-- ENUM typy
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum (
    'Administrátor',
    'Projektový manažér',
    'Technik',
    'Vedúci montáže'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type project_status as enum (
    'Príprava',
    'Realizácia',
    'Dokončené',
    'Pozastavené'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type site_status as enum (
    'Aktívna',
    'Dokončená',
    'Pozastavená'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type asset_status as enum (
    'Voľné',
    'Rezervované',
    'Na stavbe',
    'V servise',
    'Stratené'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type vehicle_status as enum (
    'Aktívne',
    'Servis',
    'Mimo prevádzky'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type inventory_category as enum (
    'Notebook',
    'Telefón',
    'Monitor',
    'Tablet',
    'Tlačiareň',
    'Licencia',
    'SIM karta',
    'Kancelárske vybavenie'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type inventory_status as enum (
    'Voľné',
    'Priradené',
    'V servise',
    'Vyradené'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type measuring_device_status as enum (
    'Aktívny',
    'Kalibrácia',
    'Vyradený'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type reservation_resource_type as enum (
    'náradie',
    'auto',
    'notebook',
    'merací prístroj'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type reservation_status as enum (
    'Aktívna',
    'Dokončená',
    'Zrušená'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type history_action as enum (
    'Prevzal',
    'Odovzdal',
    'Rezervoval',
    'Priradené',
    'Servis',
    'Naskenované',
    'Pridané',
    'Upravené'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_type as enum (
    'servis',
    'stk',
    'rezervácia',
    'vybavenie',
    'projekt'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type qr_entity_type as enum (
    'asset',
    'inventory',
    'vehicle',
    'measuring_device'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Pomocné funkcie
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- USERS (profily prepojené s auth.users) – musí existovať pred funkciami
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role user_role not null default 'Technik',
  employee_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- EMPLOYEES
-- ---------------------------------------------------------------------------
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
  supervisor_id uuid references public.employees(id) on delete set null,
  is_online boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users
  drop constraint if exists users_employee_id_fkey;
alter table public.users
  add constraint users_employee_id_fkey
  foreign key (employee_id) references public.employees(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Pomocné funkcie (až po vytvorení tabuliek)
-- ---------------------------------------------------------------------------
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

-- Auto-vytvorenie profilu po registrácii
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'Technik'::public.user_role
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CONSTRUCTION SITES
-- ---------------------------------------------------------------------------
create table if not exists public.construction_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  gps_lat double precision,
  gps_lng double precision,
  status site_status not null default 'Aktívna',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employees
  drop constraint if exists employees_current_site_id_fkey;
alter table public.employees
  add constraint employees_current_site_id_fkey
  foreign key (current_site_id) references public.construction_sites(id) on delete set null;

-- ---------------------------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text not null,
  address text not null,
  gps_lat double precision,
  gps_lng double precision,
  manager_id uuid references public.employees(id) on delete set null,
  site_id uuid references public.construction_sites(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status project_status not null default 'Príprava',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employees
  drop constraint if exists employees_current_project_id_fkey;
alter table public.employees
  add constraint employees_current_project_id_fkey
  foreign key (current_project_id) references public.projects(id) on delete set null;

create table if not exists public.project_workers (
  project_id uuid not null references public.projects(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, employee_id)
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  caption text not null default '',
  uploaded_by uuid references public.users(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ASSET CATEGORIES & ASSETS (NÁRADIE)
-- ---------------------------------------------------------------------------
create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references public.asset_categories(id) on delete restrict,
  manufacturer text not null default '',
  model text not null default '',
  serial_number text not null default '',
  internal_number text not null unique,
  photo_url text,
  status asset_status not null default 'Voľné',
  current_user_id uuid references public.employees(id) on delete set null,
  current_site_id uuid references public.construction_sites(id) on delete set null,
  borrowed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_assets (
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (project_id, asset_id)
);

create table if not exists public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  site_id uuid references public.construction_sites(id) on delete set null,
  assigned_at timestamptz not null default now(),
  returned_at timestamptz
);

create table if not exists public.asset_history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  action history_action not null,
  site_id uuid references public.construction_sites(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  note text,
  timestamp timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- QR CODES
-- ---------------------------------------------------------------------------
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  entity_type qr_entity_type not null,
  entity_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_qr_codes_entity on public.qr_codes (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  license_plate text not null unique,
  brand text not null,
  model text not null,
  year int not null check (year >= 1900 and year <= 2100),
  photo_url text,
  driver_id uuid references public.employees(id) on delete set null,
  status vehicle_status not null default 'Aktívne',
  mileage int not null default 0 check (mileage >= 0),
  last_service_date date,
  next_service_date date,
  stk_expiry date,
  insurance_expiry date,
  gps_lat double precision,
  gps_lng double precision,
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_vehicles (
  project_id uuid not null references public.projects(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (project_id, vehicle_id)
);

-- ---------------------------------------------------------------------------
-- INVENTORY
-- ---------------------------------------------------------------------------
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category inventory_category not null,
  serial_number text not null default '',
  photo_url text,
  assigned_user_id uuid references public.employees(id) on delete set null,
  status inventory_status not null default 'Voľné',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_equipment (
  employee_id uuid not null references public.employees(id) on delete cascade,
  inventory_id uuid references public.inventory(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  check (
    (inventory_id is not null)::int +
    (asset_id is not null)::int +
    (vehicle_id is not null)::int = 1
  )
);

-- ---------------------------------------------------------------------------
-- MEASURING DEVICES
-- ---------------------------------------------------------------------------
create table if not exists public.measuring_devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  manufacturer text not null default '',
  model text not null default '',
  serial_number text not null default '',
  calibration_date date,
  next_calibration_date date,
  assigned_user_id uuid references public.employees(id) on delete set null,
  status measuring_device_status not null default 'Aktívny',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- WAREHOUSE (SKLAD)
-- ---------------------------------------------------------------------------
create table if not exists public.warehouse_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  sku text not null unique,
  quantity numeric(12,2) not null default 0 check (quantity >= 0),
  min_quantity numeric(12,2) not null default 0 check (min_quantity >= 0),
  unit text not null default 'ks',
  location text not null default '',
  last_restocked date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RESERVATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  resource_type reservation_resource_type not null,
  resource_id uuid not null,
  employee_id uuid not null references public.employees(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  start_date date not null,
  end_date date not null,
  note text,
  status reservation_status not null default 'Aktívna',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists idx_reservations_resource on public.reservations (resource_type, resource_id);
create index if not exists idx_reservations_dates on public.reservations (start_date, end_date);

-- ---------------------------------------------------------------------------
-- ACTIVITIES (TIMELINE)
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  action history_action not null,
  entity_type text not null,
  entity_name text not null,
  entity_id uuid,
  site_name text,
  timestamp timestamptz not null default now()
);

create index if not exists idx_activities_timestamp on public.activities (timestamp desc);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  entity_id uuid,
  entity_type text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- SITE WORKERS (junction)
-- ---------------------------------------------------------------------------
create table if not exists public.site_workers (
  site_id uuid not null references public.construction_sites(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (site_id, employee_id)
);

-- ---------------------------------------------------------------------------
-- TRIGGERS updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_employees_updated_at on public.employees;
create trigger trg_employees_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

drop trigger if exists trg_construction_sites_updated_at on public.construction_sites;
create trigger trg_construction_sites_updated_at before update on public.construction_sites
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at before update on public.assets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inventory_updated_at on public.inventory;
create trigger trg_inventory_updated_at before update on public.inventory
  for each row execute function public.set_updated_at();

drop trigger if exists trg_measuring_devices_updated_at on public.measuring_devices;
create trigger trg_measuring_devices_updated_at before update on public.measuring_devices
  for each row execute function public.set_updated_at();

drop trigger if exists trg_warehouse_items_updated_at on public.warehouse_items;
create trigger trg_warehouse_items_updated_at before update on public.warehouse_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reservations_updated_at on public.reservations;
create trigger trg_reservations_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- INDEXY
-- ---------------------------------------------------------------------------
create index if not exists idx_employees_department on public.employees (department);
create index if not exists idx_employees_supervisor on public.employees (supervisor_id);
create index if not exists idx_projects_status on public.projects (status);
create index if not exists idx_projects_manager on public.projects (manager_id);
create index if not exists idx_projects_site on public.projects (site_id);
create index if not exists idx_assets_status on public.assets (status);
create index if not exists idx_assets_internal_number on public.assets (internal_number);
create index if not exists idx_assets_current_user on public.assets (current_user_id);
create index if not exists idx_asset_history_asset on public.asset_history (asset_id, timestamp desc);
create index if not exists idx_vehicles_plate on public.vehicles (license_plate);
create index if not exists idx_inventory_category on public.inventory (category);
create index if not exists idx_inventory_assigned on public.inventory (assigned_user_id);

-- Full-text search helper index
create index if not exists idx_assets_search on public.assets using gin (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(manufacturer, '') || ' ' || coalesce(internal_number, ''))
);

-- ---------------------------------------------------------------------------
-- RLS – zapnutie
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.construction_sites enable row level security;
alter table public.projects enable row level security;
alter table public.project_workers enable row level security;
alter table public.project_documents enable row level security;
alter table public.project_photos enable row level security;
alter table public.asset_categories enable row level security;
alter table public.assets enable row level security;
alter table public.project_assets enable row level security;
alter table public.asset_assignments enable row level security;
alter table public.asset_history enable row level security;
alter table public.qr_codes enable row level security;
alter table public.vehicles enable row level security;
alter table public.project_vehicles enable row level security;
alter table public.inventory enable row level security;
alter table public.employee_equipment enable row level security;
alter table public.measuring_devices enable row level security;
alter table public.warehouse_items enable row level security;
alter table public.reservations enable row level security;
alter table public.activities enable row level security;
alter table public.notifications enable row level security;
alter table public.site_workers enable row level security;

-- ---------------------------------------------------------------------------
-- RLS – politiky (autentifikovaní používatelia)
-- ---------------------------------------------------------------------------

-- USERS
drop policy if exists "users_select_authenticated" on public.users;
create policy "users_select_authenticated" on public.users
  for select to authenticated using (true);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update to authenticated using (id = auth.uid());

drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all" on public.users
  for all to authenticated using (public.is_admin());

-- EMPLOYEES
drop policy if exists "employees_select_authenticated" on public.employees;
create policy "employees_select_authenticated" on public.employees
  for select to authenticated using (true);

drop policy if exists "employees_write_managers" on public.employees;
create policy "employees_write_managers" on public.employees
  for all to authenticated using (public.is_manager_or_admin());

-- CONSTRUCTION SITES
drop policy if exists "sites_select_authenticated" on public.construction_sites;
create policy "sites_select_authenticated" on public.construction_sites
  for select to authenticated using (true);

drop policy if exists "sites_write_managers" on public.construction_sites;
create policy "sites_write_managers" on public.construction_sites
  for all to authenticated using (public.is_manager_or_admin());

-- PROJECTS
drop policy if exists "projects_select_authenticated" on public.projects;
create policy "projects_select_authenticated" on public.projects
  for select to authenticated using (true);

drop policy if exists "projects_write_managers" on public.projects;
create policy "projects_write_managers" on public.projects
  for all to authenticated using (public.is_manager_or_admin());

-- PROJECT WORKERS / DOCUMENTS / PHOTOS
drop policy if exists "project_workers_select" on public.project_workers;
create policy "project_workers_select" on public.project_workers
  for select to authenticated using (true);
drop policy if exists "project_workers_write" on public.project_workers;
create policy "project_workers_write" on public.project_workers
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "project_documents_select" on public.project_documents;
create policy "project_documents_select" on public.project_documents
  for select to authenticated using (true);
drop policy if exists "project_documents_write" on public.project_documents;
create policy "project_documents_write" on public.project_documents
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "project_photos_select" on public.project_photos;
create policy "project_photos_select" on public.project_photos
  for select to authenticated using (true);
drop policy if exists "project_photos_write" on public.project_photos;
create policy "project_photos_write" on public.project_photos
  for all to authenticated using (public.is_manager_or_admin());

-- ASSETS
drop policy if exists "asset_categories_select" on public.asset_categories;
create policy "asset_categories_select" on public.asset_categories
  for select to authenticated using (true);
drop policy if exists "asset_categories_write" on public.asset_categories;
create policy "asset_categories_write" on public.asset_categories
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "assets_select_authenticated" on public.assets;
create policy "assets_select_authenticated" on public.assets
  for select to authenticated using (true);

drop policy if exists "assets_insert_managers" on public.assets;
create policy "assets_insert_managers" on public.assets
  for insert to authenticated with check (public.is_manager_or_admin());

drop policy if exists "assets_update_authenticated" on public.assets;
create policy "assets_update_authenticated" on public.assets
  for update to authenticated using (true);

drop policy if exists "assets_delete_managers" on public.assets;
create policy "assets_delete_managers" on public.assets
  for delete to authenticated using (public.is_manager_or_admin());

-- ASSET HISTORY & ASSIGNMENTS (technik môže prevziať/odovzdať)
drop policy if exists "asset_history_select" on public.asset_history;
create policy "asset_history_select" on public.asset_history
  for select to authenticated using (true);
drop policy if exists "asset_history_insert" on public.asset_history;
create policy "asset_history_insert" on public.asset_history
  for insert to authenticated with check (true);

drop policy if exists "asset_assignments_select" on public.asset_assignments;
create policy "asset_assignments_select" on public.asset_assignments
  for select to authenticated using (true);
drop policy if exists "asset_assignments_write" on public.asset_assignments;
create policy "asset_assignments_write" on public.asset_assignments
  for all to authenticated using (true);

drop policy if exists "project_assets_select" on public.project_assets;
create policy "project_assets_select" on public.project_assets
  for select to authenticated using (true);
drop policy if exists "project_assets_write" on public.project_assets;
create policy "project_assets_write" on public.project_assets
  for all to authenticated using (public.is_manager_or_admin());

-- QR CODES
drop policy if exists "qr_codes_select" on public.qr_codes;
create policy "qr_codes_select" on public.qr_codes
  for select to authenticated using (true);
drop policy if exists "qr_codes_write" on public.qr_codes;
create policy "qr_codes_write" on public.qr_codes
  for all to authenticated using (public.is_manager_or_admin());

-- VEHICLES
drop policy if exists "vehicles_select" on public.vehicles;
create policy "vehicles_select" on public.vehicles
  for select to authenticated using (true);
drop policy if exists "vehicles_write" on public.vehicles;
create policy "vehicles_write" on public.vehicles
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "project_vehicles_select" on public.project_vehicles;
create policy "project_vehicles_select" on public.project_vehicles
  for select to authenticated using (true);
drop policy if exists "project_vehicles_write" on public.project_vehicles;
create policy "project_vehicles_write" on public.project_vehicles
  for all to authenticated using (public.is_manager_or_admin());

-- INVENTORY & MEASURING DEVICES & WAREHOUSE
drop policy if exists "inventory_select" on public.inventory;
create policy "inventory_select" on public.inventory
  for select to authenticated using (true);
drop policy if exists "inventory_write" on public.inventory;
create policy "inventory_write" on public.inventory
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "employee_equipment_select" on public.employee_equipment;
create policy "employee_equipment_select" on public.employee_equipment
  for select to authenticated using (true);
drop policy if exists "employee_equipment_write" on public.employee_equipment;
create policy "employee_equipment_write" on public.employee_equipment
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "measuring_devices_select" on public.measuring_devices;
create policy "measuring_devices_select" on public.measuring_devices
  for select to authenticated using (true);
drop policy if exists "measuring_devices_write" on public.measuring_devices;
create policy "measuring_devices_write" on public.measuring_devices
  for all to authenticated using (public.is_manager_or_admin());

drop policy if exists "warehouse_select" on public.warehouse_items;
create policy "warehouse_select" on public.warehouse_items
  for select to authenticated using (true);
drop policy if exists "warehouse_write" on public.warehouse_items;
create policy "warehouse_write" on public.warehouse_items
  for all to authenticated using (public.is_manager_or_admin());

-- RESERVATIONS
drop policy if exists "reservations_select" on public.reservations;
create policy "reservations_select" on public.reservations
  for select to authenticated using (true);
drop policy if exists "reservations_insert" on public.reservations;
create policy "reservations_insert" on public.reservations
  for insert to authenticated with check (true);
drop policy if exists "reservations_update" on public.reservations;
create policy "reservations_update" on public.reservations
  for update to authenticated using (
    employee_id = public.current_employee_id() or public.is_manager_or_admin()
  );

-- ACTIVITIES
drop policy if exists "activities_select" on public.activities;
create policy "activities_select" on public.activities
  for select to authenticated using (true);
drop policy if exists "activities_insert" on public.activities;
create policy "activities_insert" on public.activities
  for insert to authenticated with check (true);

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (user_id = auth.uid() or user_id is null);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (user_id = auth.uid());
drop policy if exists "notifications_insert_system" on public.notifications;
create policy "notifications_insert_system" on public.notifications
  for insert to authenticated with check (public.is_manager_or_admin());

-- SITE WORKERS
drop policy if exists "site_workers_select" on public.site_workers;
create policy "site_workers_select" on public.site_workers
  for select to authenticated using (true);
drop policy if exists "site_workers_write" on public.site_workers;
create policy "site_workers_write" on public.site_workers
  for all to authenticated using (public.is_manager_or_admin());

-- ---------------------------------------------------------------------------
-- REALTIME (voliteľné – pre live dashboard)
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.assets;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.activities;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.reservations;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- STORAGE BUCKETS (spustiť v SQL alebo cez Dashboard → Storage)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('employee-photos', 'employee-photos', false),
  ('asset-photos', 'asset-photos', false),
  ('project-documents', 'project-documents', false),
  ('project-photos', 'project-photos', false),
  ('vehicle-photos', 'vehicle-photos', false)
on conflict (id) do nothing;

-- Storage RLS
drop policy if exists "storage_authenticated_read" on storage.objects;
create policy "storage_authenticated_read" on storage.objects
  for select to authenticated using (bucket_id in (
    'employee-photos', 'asset-photos', 'project-documents', 'project-photos', 'vehicle-photos'
  ));

drop policy if exists "storage_authenticated_upload" on storage.objects;
create policy "storage_authenticated_upload" on storage.objects
  for insert to authenticated with check (bucket_id in (
    'employee-photos', 'asset-photos', 'project-documents', 'project-photos', 'vehicle-photos'
  ));

-- ---------------------------------------------------------------------------
-- SEED – kategórie náradia (voliteľné)
-- ---------------------------------------------------------------------------
insert into public.asset_categories (name, description) values
  ('Vŕtačky a kladivá', 'Elektrické vŕtačky, sekáčky, kladivá'),
  ('Meracie prístroje', 'Multimetre, izolačné testery'),
  ('Rezacie nástroje', 'Píly, rezačky káblov'),
  ('Lešenie a výstupy', 'Rebríky, lešenie, plošiny'),
  ('Káblové a spojovacie', 'Navijaky, lisovačky')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Hotovo
-- ---------------------------------------------------------------------------
-- Po deployi:
-- 1. Nastavte VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY v .env
-- 2. Zaregistrujte prvého admina cez Auth → Users → Add user
-- 3. V tabuľke users nastavte role = 'Administrátor'
-- 4. Vytvorte zamestnancov a prepojte users.employee_id
