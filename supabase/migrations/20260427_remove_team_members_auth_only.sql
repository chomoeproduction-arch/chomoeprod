begin;

-- Remove foreign key constraints that may still point to team_members.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select tc.constraint_name
    from information_schema.table_constraints tc
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name = 'applicants'
  loop
    execute format('alter table public.applicants drop constraint if exists %I', constraint_name);
  end loop;

  for constraint_name in
    select tc.constraint_name
    from information_schema.table_constraints tc
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name = 'applicant_notes'
  loop
    execute format('alter table public.applicant_notes drop constraint if exists %I', constraint_name);
  end loop;

  for constraint_name in
    select tc.constraint_name
    from information_schema.table_constraints tc
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name = 'communication_logs'
  loop
    execute format('alter table public.communication_logs drop constraint if exists %I', constraint_name);
  end loop;

  for constraint_name in
    select tc.constraint_name
    from information_schema.table_constraints tc
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name = 'technical_evaluations'
  loop
    execute format('alter table public.technical_evaluations drop constraint if exists %I', constraint_name);
  end loop;
end $$;

-- Remove legacy columns tied to team_members.
alter table if exists public.applicants
  drop column if exists assignee_id;

alter table if exists public.applicant_notes
  drop column if exists author_member_id;

alter table if exists public.communication_logs
  drop column if exists team_member_id;

alter table if exists public.technical_evaluations
  drop column if exists evaluator_member_id;

-- Remove RLS policies on team_members before dropping the table.
drop policy if exists "public read team_members" on public.team_members;

-- Drop the legacy table now that auth is the single source of truth.
drop table if exists public.team_members;

commit;
