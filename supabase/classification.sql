-- Sprint 2.3 · staging classification and approval
-- Run after pdf_import.sql.

alter table public.question_staging
  add column if not exists matched_keywords text[] not null default '{}',
  add column if not exists classification_reason text,
  add column if not exists suggested_subject text,
  add column if not exists suggested_chapter text,
  add column if not exists suggested_form smallint check (suggested_form in (4,5));

create or replace function public.approve_staging_question(p_staging_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.question_staging%rowtype;
  j public.import_jobs%rowtype;
  q_id uuid;
  subject_uuid uuid;
  chapter_uuid uuid;
begin
  if public.current_role() not in ('teacher','admin') then
    raise exception 'Teacher or admin role required';
  end if;

  select * into s from public.question_staging where id = p_staging_id for update;
  if not found then raise exception 'Staging question not found'; end if;
  if s.status = 'approved' and s.approved_question_id is not null then
    return s.approved_question_id;
  end if;

  select * into j from public.import_jobs where id = s.import_job_id;
  subject_uuid := s.subject_id;
  chapter_uuid := s.chapter_id;

  if subject_uuid is null and coalesce(s.suggested_subject,'') <> '' then
    select id into subject_uuid from public.subjects where lower(name)=lower(s.suggested_subject) limit 1;
  end if;
  if chapter_uuid is null and subject_uuid is not null and coalesce(s.suggested_chapter,'') <> '' then
    select id into chapter_uuid
    from public.chapters
    where subject_id=subject_uuid
      and form_level=coalesce(s.form_level,s.suggested_form)
      and lower(name)=lower(s.suggested_chapter)
    limit 1;
  end if;

  if subject_uuid is null then raise exception 'Subject is required before approval'; end if;
  if j.source_id is null then raise exception 'Import job source is required before approval'; end if;

  insert into public.questions(
    source_id, subject_id, chapter_id, form_level, section, question_no,
    topic, question_type, marks, command_word, cognitive_level, skills,
    duplicate_group, question_summary, review_status, created_by
  ) values (
    j.source_id, subject_uuid, chapter_uuid, coalesce(s.form_level,s.suggested_form), s.section, s.question_no,
    coalesce(nullif(s.topic,''), left(coalesce(s.raw_text,'Imported question'),180)),
    coalesce(nullif(s.question_type,''),'Imported'), coalesce(s.marks,0), s.command_word,
    s.cognitive_level, s.skills, s.duplicate_candidate_group,
    left(coalesce(s.raw_text,''),1200), 'pending', auth.uid()
  ) returning id into q_id;

  update public.question_staging
  set status='approved', approved_question_id=q_id
  where id=p_staging_id;

  return q_id;
end;
$$;

grant execute on function public.approve_staging_question(uuid) to authenticated;
