-- SPM Question Intelligence · Data validation queries
-- Run after imports to find records that should enter teacher review.

-- 1. Missing high-value metadata
select
  q.question_code,
  s.year,
  sub.name as subject,
  c.name as chapter,
  array_remove(array[
    case when s.state is null or trim(s.state) = '' then 'state' end,
    case when q.section is null or trim(q.section) = '' then 'section' end,
    case when q.question_no is null or trim(q.question_no) = '' then 'question_no' end,
    case when q.command_word is null or trim(q.command_word) = '' then 'command_word' end,
    case when q.cognitive_level is null or trim(q.cognitive_level) = '' then 'cognitive_level' end,
    case when cardinality(q.skills) = 0 then 'skills' end
  ], null) as missing_fields
from public.questions q
join public.sources s on s.id = q.source_id
join public.subjects sub on sub.id = q.subject_id
left join public.chapters c on c.id = q.chapter_id
where q.review_status <> 'rejected'
  and (
    s.state is null or trim(s.state) = '' or
    q.section is null or trim(q.section) = '' or
    q.question_no is null or trim(q.question_no) = '' or
    q.command_word is null or trim(q.command_word) = '' or
    q.cognitive_level is null or trim(q.cognitive_level) = '' or
    cardinality(q.skills) = 0
  )
order by s.year desc, sub.name, c.chapter_no;

-- 2. Duplicate groups crossing different chapters (usually a classification error)
select
  duplicate_group,
  count(*) as records,
  count(distinct chapter_id) as chapter_count,
  array_agg(distinct chapter_id) as chapters
from public.questions
where duplicate_group is not null and trim(duplicate_group) <> ''
group by duplicate_group
having count(distinct chapter_id) > 1;

-- 3. Same question code used more than once
select question_code, count(*)
from public.questions
where question_code is not null
group by question_code
having count(*) > 1;

-- 4. Trial records without state or organisation identity
select q.question_code, s.title, s.source_kind, s.year, s.state
from public.questions q
join public.sources s on s.id = q.source_id
where s.source_kind in ('state_trial','sbp','mrsm','school_trial')
  and (s.state is null or trim(s.state) = '');

-- 5. Suspicious prediction inputs
select
  q.question_code,
  q.coverage_gap,
  q.trial_consensus,
  q.format_fit,
  q.skill_recurrence,
  q.completeness
from public.questions q
where q.coverage_gap not between 0 and 100
   or q.trial_consensus not between 0 and 100
   or q.format_fit not between 0 and 100
   or q.skill_recurrence not between 0 and 100
   or q.completeness not between 0 and 100;

-- 6. Chapters with insufficient independent samples
select
  sub.name as subject,
  c.form_level,
  c.chapter_no,
  c.name,
  coalesce(a.independent_question_count,0) as independent_questions,
  coalesce(a.verified_count,0) as verified_questions,
  coalesce(a.average_completeness,0) as average_completeness
from public.chapters c
join public.subjects sub on sub.id = c.subject_id
left join public.chapter_analytics_v a on a.chapter_id = c.id
where coalesce(a.independent_question_count,0) < 3
   or coalesce(a.verified_count,0) < 2
order by sub.name, c.form_level, c.chapter_no;
