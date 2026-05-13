create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('Projektový manažér', 'Elektrikár', 'Pomocník')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  investor text not null default '',
  description text not null default '',
  status text not null default 'Plánované' check (status in ('Plánované', 'Rozpracované', 'Čaká sa', 'Dokončené')),
  priority text not null default 'Stredná' check (priority in ('Nízka', 'Stredná', 'Vysoká')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  budget numeric(12,2) not null default 0,
  deadline date not null,
  notes text not null default '',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz
);

create table if not exists project_workers (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  assigned_user_id uuid references users(id) on delete set null,
  priority text not null default 'Stredná' check (priority in ('Nízka', 'Stredná', 'Vysoká')),
  status text not null default 'Na spravenie' check (status in ('Na spravenie', 'Rozpracované', 'Čaká sa', 'Hotové')),
  deadline date not null,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  comments_count int not null default 0,
  pinned boolean not null default false,
  urgent boolean not null default false,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  message text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  content text not null,
  missing_items text not null default '',
  problem text not null default '',
  order_items text not null default '',
  author_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  url text not null,
  file_type text not null default 'image' check (file_type in ('image', 'document')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  type text not null check (type in ('Montáž', 'Obhliadka', 'Stretnutie', 'Termín', 'Revízia')),
  date date not null,
  location text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  action text not null,
  actor_id uuid references users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table users add column if not exists updated_at timestamptz not null default now();

alter table projects add column if not exists investor text not null default '';
alter table projects add column if not exists description text not null default '';
alter table projects add column if not exists priority text not null default 'Stredná';
alter table projects add column if not exists budget numeric(12,2) not null default 0;
alter table projects add column if not exists notes text not null default '';
alter table projects add column if not exists created_by uuid references users(id) on delete set null;
alter table projects add column if not exists created_at timestamptz not null default now();
alter table projects add column if not exists archived_at timestamptz;
alter table projects add column if not exists deleted_at timestamptz;

alter table project_workers add column if not exists created_at timestamptz not null default now();

alter table tasks add column if not exists assigned_user_id uuid references users(id) on delete set null;
alter table tasks add column if not exists pinned boolean not null default false;
alter table tasks add column if not exists urgent boolean not null default false;
alter table tasks add column if not exists created_by uuid references users(id) on delete set null;
alter table tasks add column if not exists updated_at timestamptz not null default now();
alter table tasks add column if not exists deleted_at timestamptz;

alter table task_updates add column if not exists created_by uuid references users(id) on delete set null;

alter table project_notes add column if not exists missing_items text not null default '';
alter table project_notes add column if not exists problem text not null default '';
alter table project_notes add column if not exists order_items text not null default '';
alter table project_notes add column if not exists author_id uuid references users(id) on delete set null;
alter table project_notes add column if not exists updated_at timestamptz not null default now();

alter table project_photos add column if not exists file_type text not null default 'image';
alter table project_photos add column if not exists created_by uuid references users(id) on delete set null;

alter table calendar_events add column if not exists created_by uuid references users(id) on delete set null;
alter table calendar_events add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_projects_status on projects(status) where deleted_at is null;
create index if not exists idx_projects_deadline on projects(deadline) where deleted_at is null;
create index if not exists idx_project_workers_user_id on project_workers(user_id);
create index if not exists idx_tasks_project_id on tasks(project_id) where deleted_at is null;
create index if not exists idx_tasks_assigned_user_id on tasks(assigned_user_id) where deleted_at is null;
create index if not exists idx_tasks_status on tasks(status) where deleted_at is null;
create index if not exists idx_project_notes_project_id on project_notes(project_id);
create index if not exists idx_project_photos_project_id on project_photos(project_id);
create index if not exists idx_calendar_events_date on calendar_events(date);

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_users_updated_at on users;
create trigger touch_users_updated_at before update on users for each row execute function touch_updated_at();

drop trigger if exists touch_projects_updated_at on projects;
create trigger touch_projects_updated_at before update on projects for each row execute function touch_updated_at();

drop trigger if exists touch_tasks_updated_at on tasks;
create trigger touch_tasks_updated_at before update on tasks for each row execute function touch_updated_at();

drop trigger if exists touch_project_notes_updated_at on project_notes;
create trigger touch_project_notes_updated_at before update on project_notes for each row execute function touch_updated_at();

drop trigger if exists touch_calendar_events_updated_at on calendar_events;
create trigger touch_calendar_events_updated_at before update on calendar_events for each row execute function touch_updated_at();

create or replace function is_manager()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from users
    where id = auth.uid()
    and role = 'Projektový manažér'
  );
$$;

create or replace function is_project_worker(project_uuid uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from project_workers
    where project_id = project_uuid
    and user_id = auth.uid()
  );
$$;

alter table users enable row level security;
alter table projects enable row level security;
alter table project_workers enable row level security;
alter table tasks enable row level security;
alter table task_updates enable row level security;
alter table task_comments enable row level security;
alter table project_notes enable row level security;
alter table project_photos enable row level security;
alter table calendar_events enable row level security;
alter table audit_log enable row level security;

drop policy if exists "users can read users" on users;
create policy "users can read users" on users for select to authenticated using (true);

drop policy if exists "users can create own profile" on users;
create policy "users can create own profile" on users for insert to authenticated with check (id = auth.uid() or is_manager());

drop policy if exists "managers update users" on users;
create policy "managers update users" on users for update to authenticated using (id = auth.uid() or is_manager()) with check (id = auth.uid() or is_manager());

drop policy if exists "project read access" on projects;
create policy "project read access" on projects for select to authenticated using (
  deleted_at is null and (is_manager() or is_project_worker(id))
);

drop policy if exists "project manager write access" on projects;
create policy "project manager write access" on projects for all to authenticated using (is_manager()) with check (is_manager());

drop policy if exists "project workers read access" on project_workers;
create policy "project workers read access" on project_workers for select to authenticated using (
  is_manager() or user_id = auth.uid() or is_project_worker(project_id)
);

drop policy if exists "project workers manager write access" on project_workers;
create policy "project workers manager write access" on project_workers for all to authenticated using (is_manager()) with check (is_manager());

drop policy if exists "task read access" on tasks;
create policy "task read access" on tasks for select to authenticated using (
  deleted_at is null and (is_manager() or assigned_user_id = auth.uid() or is_project_worker(project_id))
);

drop policy if exists "task manager insert access" on tasks;
create policy "task manager insert access" on tasks for insert to authenticated with check (is_manager());

drop policy if exists "task update access" on tasks;
create policy "task update access" on tasks for update to authenticated using (
  is_manager() or assigned_user_id = auth.uid() or is_project_worker(project_id)
) with check (
  is_manager() or assigned_user_id = auth.uid() or is_project_worker(project_id)
);

drop policy if exists "task updates read access" on task_updates;
create policy "task updates read access" on task_updates for select to authenticated using (true);

drop policy if exists "task updates write access" on task_updates;
create policy "task updates write access" on task_updates for insert to authenticated with check (true);

drop policy if exists "task comments access" on task_comments;
create policy "task comments access" on task_comments for all to authenticated using (true) with check (true);

drop policy if exists "notes read access" on project_notes;
create policy "notes read access" on project_notes for select to authenticated using (
  is_manager() or is_project_worker(project_id)
);

drop policy if exists "notes write access" on project_notes;
create policy "notes write access" on project_notes for all to authenticated using (
  is_manager() or is_project_worker(project_id)
) with check (
  is_manager() or is_project_worker(project_id)
);

drop policy if exists "files read access" on project_photos;
create policy "files read access" on project_photos for select to authenticated using (
  is_manager() or is_project_worker(project_id)
);

drop policy if exists "files write access" on project_photos;
create policy "files write access" on project_photos for all to authenticated using (
  is_manager() or is_project_worker(project_id)
) with check (
  is_manager() or is_project_worker(project_id)
);

drop policy if exists "events read access" on calendar_events;
create policy "events read access" on calendar_events for select to authenticated using (
  project_id is null or is_manager() or is_project_worker(project_id)
);

drop policy if exists "events write access" on calendar_events;
create policy "events write access" on calendar_events for all to authenticated using (is_manager()) with check (is_manager());

drop policy if exists "audit read access" on audit_log;
create policy "audit read access" on audit_log for select to authenticated using (is_manager());

insert into storage.buckets (id, name, public)
values ('project-photos', 'project-photos', true)
on conflict (id) do nothing;

drop policy if exists "authenticated upload project files" on storage.objects;
create policy "authenticated upload project files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-photos');

drop policy if exists "authenticated update project files" on storage.objects;
create policy "authenticated update project files"
on storage.objects
for update
to authenticated
using (bucket_id = 'project-photos')
with check (bucket_id = 'project-photos');

drop policy if exists "authenticated delete project files" on storage.objects;
create policy "authenticated delete project files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-photos');

drop policy if exists "public view project files" on storage.objects;
create policy "public view project files"
on storage.objects
for select
to public
using (bucket_id = 'project-photos');
