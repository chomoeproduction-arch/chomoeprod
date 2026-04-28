create table if not exists public.team_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text not null,
  email text,
  role_title text,
  department text,
  phone text,
  bio text,
  avatar_url text,
  avatar_path text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_team_profiles on public.team_profiles;
create trigger set_updated_at_team_profiles
before update on public.team_profiles
for each row
execute function public.set_updated_at();

alter table public.team_profiles enable row level security;

drop policy if exists "authenticated read team_profiles" on public.team_profiles;
create policy "authenticated read team_profiles" on public.team_profiles
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated insert team_profiles" on public.team_profiles;
create policy "authenticated insert team_profiles" on public.team_profiles
for insert with check (auth.role() = 'authenticated');

drop policy if exists "authenticated update team_profiles" on public.team_profiles;
create policy "authenticated update team_profiles" on public.team_profiles
for update using (auth.role() = 'authenticated');
