# SPM Question Intelligence Web App

This directory contains the new Next.js full-stack application. The existing root-level GitHub Pages prototype remains available during migration.

## Local development

```bash
cd web-app
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never place the Supabase service-role key in browser code or commit it to GitHub.

## Implemented

- Next.js 15 App Router and TypeScript strict mode
- Supabase browser and server clients
- SSR authentication cookies and protected routes
- Login, registration and logout
- Cloud teacher workspace
- Question create, edit, review, reject and admin delete actions
- Source registry for SPM, Trial, SBP and MRSM papers
- Validated cloud CSV import, maximum 500 rows per batch
- Exact matching for source, subject, Form and chapter taxonomy
- Vercel deployment configuration

## Cloud import workflow

1. Open `/sources` and create the paper source.
2. Download `/question-import-template.csv`.
3. Keep `source_title`, `subject` and `chapter` exactly consistent with the database.
4. Open `/import` and upload the completed UTF-8 CSV.
5. Review pending records in `/workspace`.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `web-app`.
3. Add both Supabase environment variables.
4. Deploy.
5. Add the deployed URL to Supabase Authentication redirect URLs.

The application cannot connect to cloud data until the Supabase project has been created and the SQL migrations in `/supabase` have been executed.
