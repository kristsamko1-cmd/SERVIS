-- Oprava current_employee_id() – používa public.users + public.employees
-- (nahradí supabase/migrations/fix_current_employee_id.sql)

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
