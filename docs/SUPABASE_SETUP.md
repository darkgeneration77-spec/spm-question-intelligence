# Supabase Setup

## What this upgrade changes

The current GitHub Pages version stores teacher-created questions in browser LocalStorage. The database upgrade moves permanent data to Supabase PostgreSQL while the public dashboard can continue to run during migration.

## Setup

1. Create a free Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Run `supabase/analytics.sql`.
6. Optionally run `supabase/validation.sql` after each major import to detect missing metadata, duplicate conflicts and weak chapter coverage.
7. In **Authentication → URL Configuration**, add the deployed GitHub Pages URL as an allowed redirect URL.
8. Copy the Project URL and public anon key from **Project Settings → API**.
9. Do not expose or commit the service-role key.

## First administrator

After registering the first account, open SQL Editor and run:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

Teachers can then be promoted by an administrator:

```sql
update public.profiles
set role = 'teacher'
where id = (select id from auth.users where email = 'TEACHER_EMAIL');
```

## Migration sequence

1. Export browser records from the Teacher Workspace as CSV.
2. Create matching rows in `sources`.
3. Resolve `subject_id` and `chapter_id`.
4. Import each question into `questions` with `review_status='pending'`.
5. Run `supabase/validation.sql` and correct warnings.
6. Review duplicates and chapter labels.
7. Mark confirmed records as `verified`.
8. Generate predictions only after each chapter has enough independent, verified samples.

## Prediction engine

`supabase/analytics.sql` creates:

- `question_quality_v`: recency, verification, completeness and duplicate-adjusted record quality.
- `chapter_analytics_v`: chapter coverage, independent sample count, effective marks and dominant question type.
- `skill_frequency_v`: frequency of each skill after question tagging.
- `trial_consensus_v`: independent Trial source consensus by year.
- `calculate_chapter_predictions(...)`: transparent chapter priority and confidence calculation.

Example:

```sql
select *
from public.calculate_chapter_predictions(
  (select id from public.subjects where name = 'Sejarah'),
  2026,
  5
);
```

The returned score is a revision priority score, not a guaranteed examination probability.

## Minimum data standard before publishing predictions

For a chapter-level result to be treated as more than experimental, target at least:

- 3 independent question records;
- 2 verified records;
- more than one year of coverage;
- average completeness of at least 70%;
- correctly assigned duplicate groups for copied or adapted Trial questions.

Results below this threshold should display a low-confidence warning.

## Security model

- Public visitors can read verified questions and prediction results.
- Signed-in teachers can add and update sources and questions.
- Only administrators can delete questions or manage taxonomy.
- Supabase Row Level Security is enabled on all application tables.
- Never place the service-role key in GitHub Pages or any browser JavaScript.

## Important limitation

Adding SQL files to GitHub does not create the Supabase project automatically. The project owner must create the free project and run the migrations once. Until credentials are configured, the live site continues using LocalStorage.
