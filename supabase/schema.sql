create extension if not exists pgcrypto;

create table if not exists public.registration_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.registration_categories(id) on delete set null,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  location text,
  portfolio text,
  primary_stack text,
  experience_years text,
  status_note text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applicant_answers (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  section_key text not null,
  question_key text not null,
  question_label text not null,
  answer_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.applicant_notes (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  note_text text not null,
  created_by_user_id uuid,
  created_by_name text,
  created_by_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  channel text not null check (channel in ('Phone', 'WhatsApp', 'Email')),
  result text not null,
  summary text,
  follow_up_at timestamptz,
  created_by_user_id uuid,
  created_by_name text,
  created_by_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.technical_evaluations (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null unique references public.applicants(id) on delete cascade,
  problem_solving smallint not null default 3 check (problem_solving between 1 and 5),
  code_quality smallint not null default 3 check (code_quality between 1 and 5),
  communication smallint not null default 3 check (communication between 1 and 5),
  system_thinking smallint not null default 3 check (system_thinking between 1 and 5),
  ai_usage smallint not null default 3 check (ai_usage between 1 and 5),
  final_decision text not null default 'Undecided' check (final_decision in ('Undecided', 'Strong Yes', 'Yes', 'Maybe', 'No')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_applicants on public.applicants;
create trigger set_updated_at_applicants
before update on public.applicants
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_technical_evaluations on public.technical_evaluations;
create trigger set_updated_at_technical_evaluations
before update on public.technical_evaluations
for each row
execute function public.set_updated_at();

insert into public.registration_categories (slug, name, description)
values
  ('technical', 'Technical Team', 'Developers and technical contributors'),
  ('media', 'Media Team', 'Media and content team'),
  ('volunteers', 'Volunteers', 'Volunteer registrations'),
  ('community', 'Community Members', 'Community registrations'),
  ('events', 'Event Participants', 'Event participation registrations')
on conflict (slug) do nothing;

insert into public.pipeline_stages (slug, name, sort_order)
values
  ('new', 'New', 1),
  ('reviewed', 'Reviewed', 2),
  ('contacted', 'Contacted', 3),
  ('interview', 'Interview', 4),
  ('accepted', 'Accepted', 5),
  ('rejected', 'Rejected', 6)
on conflict (slug) do nothing;

alter table public.registration_categories enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.applicants enable row level security;
alter table public.applicant_answers enable row level security;
alter table public.applicant_notes enable row level security;
alter table public.communication_logs enable row level security;
alter table public.technical_evaluations enable row level security;

drop policy if exists "public read registration_categories" on public.registration_categories;
create policy "public read registration_categories" on public.registration_categories
for select using (true);

drop policy if exists "public read pipeline_stages" on public.pipeline_stages;
create policy "public read pipeline_stages" on public.pipeline_stages
for select using (true);

drop policy if exists "public insert applicants" on public.applicants;
create policy "public insert applicants" on public.applicants
for insert with check (true);

drop policy if exists "authenticated read applicants" on public.applicants;
create policy "authenticated read applicants" on public.applicants
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated update applicants" on public.applicants;
create policy "authenticated update applicants" on public.applicants
for update using (auth.role() = 'authenticated');

drop policy if exists "public insert applicant_answers" on public.applicant_answers;
create policy "public insert applicant_answers" on public.applicant_answers
for insert with check (true);

drop policy if exists "authenticated read applicant_answers" on public.applicant_answers;
create policy "authenticated read applicant_answers" on public.applicant_answers
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated read applicant_notes" on public.applicant_notes;
create policy "authenticated read applicant_notes" on public.applicant_notes
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated insert applicant_notes" on public.applicant_notes;
create policy "authenticated insert applicant_notes" on public.applicant_notes
for insert with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read communication_logs" on public.communication_logs;
create policy "authenticated read communication_logs" on public.communication_logs
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated insert communication_logs" on public.communication_logs;
create policy "authenticated insert communication_logs" on public.communication_logs
for insert with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read technical_evaluations" on public.technical_evaluations;
create policy "authenticated read technical_evaluations" on public.technical_evaluations
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated insert technical_evaluations" on public.technical_evaluations;
create policy "authenticated insert technical_evaluations" on public.technical_evaluations
for insert with check (auth.role() = 'authenticated');

drop policy if exists "authenticated update technical_evaluations" on public.technical_evaluations;
create policy "authenticated update technical_evaluations" on public.technical_evaluations
for update using (auth.role() = 'authenticated');
