# Supabase Setup

## What this upgrade changes

The current GitHub Pages version stores teacher-created questions in browser LocalStorage. The database upgrade moves permanent data to Supabase PostgreSQL while the public dashboard can continue to run during migration.

## Setup

1. Create a free Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. In **Authentication → URL Configuration**, add the deployed GitHub Pages URL as an allowed redirect URL.
6. Copy the Project URL and public anon key from **Project Settings → API**.
7. Do not expose or commit the service-role key.

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
5. Review duplicates and chapter labels.
6. Mark confirmed records as `verified`.
7. Generate a prediction run only after the verified dataset reaches useful coverage.

## Security model

- Public visitors can read verified questions and prediction results.
- Signed-in teachers can add and update sources and questions.
- Only administrators can delete questions or manage taxonomy.
- Supabase Row Level Security is enabled on all application tables.

## Important limitation

Adding SQL files to GitHub does not create the Supabase project automatically. The project owner must create the free project and run the migrations once. Until credentials are configured, the live site continues using LocalStorage.
