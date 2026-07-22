-- SPM Question Intelligence · Supabase schema
-- Run in Supabase SQL Editor on a new project.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin','teacher','viewer');
create type public.review_status as enum ('pending','verified','rejected');
create type public.source_kind as enum ('official_spm','official_sample','sbp','mrsm','state_trial','school_trial','commercial','other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  form_level smallint check (form_level in (4,5)),
  chapter_no smallint,
  name text not null,
  curriculum text not null default 'KSSM',
  importance smallint not null default 50 check (importance between 0 and 100),
  unique(subject_id, form_level, chapter_no, curriculum)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_kind public.source_kind not null,
  year smallint not null check (year between 2000 and 2100),
  state text,
  paper text,
  curriculum text not null default 'KSSM',
  source_url text,
  copyright_status text not null default 'metadata-only',
  reliability numeric(4,3) not null default 0.500 check (reliability between 0 and 1),
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question_code text unique,
  source_id uuid not null references public.sources(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  chapter_id uuid references public.chapters(id),
  form_level smallint check (form_level in (4,5)),
  section text,
  question_no text,
  topic text not null,
  question_type text not null,
  marks numeric(6,2) not null default 0 check (marks >= 0),
  command_word text,
  cognitive_level text,
  skills text[] not null default '{}',
  duplicate_group text,
  question_summary text,
  teacher_note text,
  high_value boolean not null default false,
  review_status public.review_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  official_weight numeric(4,3) not null default 0.500 check (official_weight between 0 and 1),
  coverage_gap smallint not null default 50 check (coverage_gap between 0 and 100),
  trial_consensus smallint not null default 50 check (trial_consensus between 0 and 100),
  format_fit smallint not null default 50 check (format_fit between 0 and 100),
  skill_recurrence smallint not null default 50 check (skill_recurrence between 0 and 100),
  completeness smallint not null default 0 check (completeness between 0 and 100),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prediction_runs (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id),
  target_year smallint not null,
  model_version text not null,
  filters jsonb not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.prediction_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.prediction_runs(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id),
  priority_score numeric(5,2) not null check (priority_score between 0 and 100),
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  evidence jsonb not null default '[]',
  counter_evidence jsonb not null default '[]',
  recommendation text,
  unique(run_id, chapter_id)
);

create index questions_subject_idx on public.questions(subject_id);
create index questions_chapter_idx on public.questions(chapter_id);
create index questions_review_idx on public.questions(review_status);
create index questions_duplicate_idx on public.questions(duplicate_group) where duplicate_group is not null;
create index sources_year_idx on public.sources(year desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger questions_touch_updated_at before update on public.questions
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name, role)
  values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), 'viewer');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.sources enable row level security;
alter table public.questions enable row level security;
alter table public.prediction_runs enable row level security;
alter table public.prediction_results enable row level security;

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'viewer'::public.app_role);
$$;

grant execute on function public.current_role() to authenticated, anon;

create policy "public read subjects" on public.subjects for select using (true);
create policy "public read chapters" on public.chapters for select using (true);
create policy "public read verified sources" on public.sources for select using (true);
create policy "public read verified questions" on public.questions for select using (review_status = 'verified' or auth.uid() is not null);
create policy "public read prediction runs" on public.prediction_runs for select using (true);
create policy "public read prediction results" on public.prediction_results for select using (true);

create policy "teachers insert sources" on public.sources for insert to authenticated
with check (public.current_role() in ('teacher','admin'));
create policy "teachers update sources" on public.sources for update to authenticated
using (public.current_role() in ('teacher','admin'));

create policy "teachers insert questions" on public.questions for insert to authenticated
with check (public.current_role() in ('teacher','admin'));
create policy "teachers update questions" on public.questions for update to authenticated
using (public.current_role() in ('teacher','admin'));
create policy "admins delete questions" on public.questions for delete to authenticated
using (public.current_role() = 'admin');

create policy "admins manage subjects" on public.subjects for all to authenticated
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admins manage chapters" on public.chapters for all to authenticated
using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admins manage profiles" on public.profiles for update to authenticated
using (public.current_role() = 'admin');
create policy "teachers create prediction runs" on public.prediction_runs for insert to authenticated
with check (public.current_role() in ('teacher','admin'));
create policy "teachers create prediction results" on public.prediction_results for insert to authenticated
with check (public.current_role() in ('teacher','admin'));
