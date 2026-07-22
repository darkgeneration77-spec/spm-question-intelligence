-- Sprint 2.1 · PDF import staging
-- Run after schema.sql and analytics.sql.

create type public.import_job_status as enum ('uploaded','queued','processing','needs_review','completed','failed');
create type public.staging_status as enum ('extracted','classified','needs_review','approved','rejected');

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/pdf',
  file_size bigint not null check (file_size >= 0),
  page_count integer,
  status public.import_job_status not null default 'uploaded',
  progress smallint not null default 0 check (progress between 0 and 100),
  processor_version text,
  error_message text,
  metadata jsonb not null default '{}',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_staging (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  page_from integer,
  page_to integer,
  raw_text text,
  question_no text,
  section text,
  marks numeric(6,2),
  subject_id uuid references public.subjects(id),
  chapter_id uuid references public.chapters(id),
  form_level smallint check (form_level in (4,5)),
  topic text,
  question_type text,
  command_word text,
  cognitive_level text,
  skills text[] not null default '{}',
  classification_confidence numeric(5,2) check (classification_confidence between 0 and 100),
  duplicate_candidate_group text,
  duplicate_similarity numeric(5,2) check (duplicate_similarity between 0 and 100),
  status public.staging_status not null default 'extracted',
  review_note text,
  approved_question_id uuid references public.questions(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index import_jobs_status_idx on public.import_jobs(status, created_at desc);
create index question_staging_job_idx on public.question_staging(import_job_id, status);
create index question_staging_chapter_idx on public.question_staging(chapter_id);

create trigger import_jobs_touch_updated_at before update on public.import_jobs
for each row execute function public.touch_updated_at();
create trigger question_staging_touch_updated_at before update on public.question_staging
for each row execute function public.touch_updated_at();

alter table public.import_jobs enable row level security;
alter table public.question_staging enable row level security;

create policy "teachers read import jobs" on public.import_jobs for select to authenticated
using (public.current_role() in ('teacher','admin'));
create policy "teachers create import jobs" on public.import_jobs for insert to authenticated
with check (public.current_role() in ('teacher','admin') and created_by = auth.uid());
create policy "teachers update import jobs" on public.import_jobs for update to authenticated
using (public.current_role() in ('teacher','admin'));

create policy "teachers read staging" on public.question_staging for select to authenticated
using (public.current_role() in ('teacher','admin'));
create policy "teachers create staging" on public.question_staging for insert to authenticated
with check (public.current_role() in ('teacher','admin'));
create policy "teachers update staging" on public.question_staging for update to authenticated
using (public.current_role() in ('teacher','admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('question-pdfs','question-pdfs',false,52428800,array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "teachers upload question pdfs" on storage.objects for insert to authenticated
with check (bucket_id = 'question-pdfs' and public.current_role() in ('teacher','admin'));
create policy "teachers read question pdfs" on storage.objects for select to authenticated
using (bucket_id = 'question-pdfs' and public.current_role() in ('teacher','admin'));
create policy "admins delete question pdfs" on storage.objects for delete to authenticated
using (bucket_id = 'question-pdfs' and public.current_role() = 'admin');
