alter table public.applicant_notes
add column if not exists created_by_user_id uuid,
add column if not exists created_by_name text,
add column if not exists created_by_email text;

alter table public.communication_logs
add column if not exists created_by_user_id uuid,
add column if not exists created_by_name text,
add column if not exists created_by_email text;
