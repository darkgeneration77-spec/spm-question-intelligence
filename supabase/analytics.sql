-- SPM Question Intelligence · Analytics views and prediction engine
-- Run after supabase/schema.sql and supabase/seed.sql.

create or replace view public.question_quality_v as
select
  q.id,
  q.question_code,
  q.subject_id,
  q.chapter_id,
  q.form_level,
  q.question_type,
  q.marks,
  q.command_word,
  q.cognitive_level,
  q.skills,
  q.duplicate_group,
  q.review_status,
  q.official_weight,
  q.coverage_gap,
  q.trial_consensus,
  q.format_fit,
  q.skill_recurrence,
  q.completeness,
  s.year,
  s.source_kind,
  s.state,
  s.reliability,
  greatest(25, 100 - greatest(0, extract(year from current_date)::int - s.year) * 9) as recency_score,
  case when q.review_status = 'verified' then 1.0 else 0.65 end as verification_factor,
  case when q.duplicate_group is null or q.duplicate_group = '' then 1.0
       when row_number() over (
         partition by q.duplicate_group
         order by (q.review_status = 'verified') desc, q.completeness desc, s.reliability desc, q.created_at asc
       ) = 1 then 1.0 else 0.25 end as duplicate_factor,
  (0.55 + 0.45 * q.completeness / 100.0) as completeness_factor
from public.questions q
join public.sources s on s.id = q.source_id;

create or replace view public.chapter_analytics_v as
select
  qv.subject_id,
  qv.chapter_id,
  qv.form_level,
  count(*) as question_count,
  count(distinct coalesce(nullif(qv.duplicate_group,''), qv.id::text)) as independent_question_count,
  count(*) filter (where qv.review_status = 'verified') as verified_count,
  min(qv.year) as first_year,
  max(qv.year) as latest_year,
  round(sum(qv.marks * qv.verification_factor * qv.duplicate_factor * qv.completeness_factor)::numeric,2) as effective_marks,
  round(avg(qv.completeness)::numeric,2) as average_completeness,
  round(avg(qv.reliability * 100)::numeric,2) as average_source_reliability,
  round(avg(qv.trial_consensus)::numeric,2) as average_trial_consensus,
  round(avg(qv.skill_recurrence)::numeric,2) as average_skill_recurrence,
  round(avg(qv.format_fit)::numeric,2) as average_format_fit,
  round(avg(qv.coverage_gap)::numeric,2) as average_coverage_gap,
  mode() within group (order by qv.question_type) as dominant_question_type
from public.question_quality_v qv
group by qv.subject_id, qv.chapter_id, qv.form_level;

create or replace view public.skill_frequency_v as
select
  q.subject_id,
  q.chapter_id,
  q.form_level,
  lower(trim(skill)) as skill,
  count(*) as raw_frequency,
  count(distinct coalesce(nullif(q.duplicate_group,''), q.id::text)) as independent_frequency,
  max(s.year) as latest_year,
  round(avg(q.skill_recurrence)::numeric,2) as recurrence_score
from public.questions q
join public.sources s on s.id = q.source_id
cross join lateral unnest(q.skills) as skill
where trim(skill) <> ''
group by q.subject_id, q.chapter_id, q.form_level, lower(trim(skill));

create or replace view public.trial_consensus_v as
select
  q.subject_id,
  q.chapter_id,
  q.form_level,
  s.year,
  count(distinct coalesce(s.state, s.title)) filter (
    where s.source_kind in ('state_trial','sbp','mrsm','school_trial')
  ) as independent_trial_sources,
  count(distinct coalesce(nullif(q.duplicate_group,''), q.id::text)) filter (
    where s.source_kind in ('state_trial','sbp','mrsm','school_trial')
  ) as independent_trial_questions,
  round(avg(q.trial_consensus)::numeric,2) as stored_consensus_score
from public.questions q
join public.sources s on s.id = q.source_id
group by q.subject_id, q.chapter_id, q.form_level, s.year;

create or replace function public.calculate_chapter_predictions(
  p_subject_id uuid,
  p_target_year smallint,
  p_form_level smallint default null
)
returns table (
  chapter_id uuid,
  priority_score numeric,
  confidence numeric,
  evidence jsonb,
  counter_evidence jsonb,
  recommendation text
)
language sql
stable
security definer
set search_path = public
as $$
with base as (
  select
    c.id as chapter_id,
    c.importance,
    coalesce(a.question_count,0) as question_count,
    coalesce(a.independent_question_count,0) as independent_question_count,
    coalesce(a.verified_count,0) as verified_count,
    a.latest_year,
    coalesce(a.effective_marks,0) as effective_marks,
    coalesce(a.average_completeness,0) as average_completeness,
    coalesce(a.average_source_reliability,0) as average_source_reliability,
    coalesce(a.average_trial_consensus,0) as average_trial_consensus,
    coalesce(a.average_skill_recurrence,0) as average_skill_recurrence,
    coalesce(a.average_format_fit,0) as average_format_fit,
    coalesce(a.average_coverage_gap,50) as average_coverage_gap,
    a.dominant_question_type,
    greatest(25, 100 - greatest(0, p_target_year - coalesce(a.latest_year,p_target_year-8)) * 9) as recency_score
  from public.chapters c
  left join public.chapter_analytics_v a on a.chapter_id = c.id
  where c.subject_id = p_subject_id
    and (p_form_level is null or c.form_level = p_form_level)
), scored as (
  select *,
    least(100,
      0.25 * recency_score
      + 0.20 * importance
      + 0.15 * average_coverage_gap
      + 0.15 * average_trial_consensus
      + 0.10 * average_format_fit
      + 0.10 * average_skill_recurrence
      + 0.05 * case when question_count = 0 then 0 else verified_count * 100.0 / question_count end
    ) as raw_score,
    least(100,
      25
      + least(30, independent_question_count * 5)
      + least(20, average_completeness * 0.20)
      + least(15, average_source_reliability * 0.15)
      + case when verified_count >= 3 then 10 when verified_count > 0 then 5 else 0 end
    ) as confidence_score
  from base
)
select
  chapter_id,
  round(raw_score::numeric,2) as priority_score,
  round(confidence_score::numeric,2) as confidence,
  jsonb_build_array(
    jsonb_build_object('signal','recent_coverage','value',recency_score),
    jsonb_build_object('signal','curriculum_importance','value',importance),
    jsonb_build_object('signal','trial_consensus','value',average_trial_consensus),
    jsonb_build_object('signal','independent_questions','value',independent_question_count),
    jsonb_build_object('signal','dominant_type','value',coalesce(dominant_question_type,'unknown'))
  ) as evidence,
  jsonb_strip_nulls(jsonb_build_array(
    case when question_count < 3 then jsonb_build_object('risk','small_sample','value',question_count) end,
    case when average_completeness < 70 then jsonb_build_object('risk','low_completeness','value',average_completeness) end,
    case when verified_count = 0 then jsonb_build_object('risk','no_verified_questions','value',verified_count) end
  )) as counter_evidence,
  case
    when raw_score >= 80 then '高优先：完成完整结构题／Essay训练，并覆盖主要命令词与技能。'
    when raw_score >= 65 then '较高优先：掌握核心概念、常见题型与高频技能。'
    when raw_score >= 50 then '中等优先：维持基础覆盖，并补充数据不足的题型。'
    else '基础覆盖：暂不应完全忽略；先改善样本和审核质量。'
  end as recommendation
from scored
order by raw_score desc;
$$;

grant select on public.question_quality_v, public.chapter_analytics_v, public.skill_frequency_v, public.trial_consensus_v to anon, authenticated;
grant execute on function public.calculate_chapter_predictions(uuid,smallint,smallint) to anon, authenticated;
