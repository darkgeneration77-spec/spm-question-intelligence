# SPM Question Intelligence Web App

This directory is the new full-stack application. The existing root-level GitHub Pages prototype remains available during migration.

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

## Sprint 1 status

- Next.js App Router
- TypeScript strict mode
- Responsive dashboard shell
- Supabase dependencies installed
- Environment template
- Parallel migration strategy that preserves the current static site

## Next implementation

1. Supabase browser/server clients
2. Authentication and session middleware
3. Database-backed question list
4. Teacher CRUD and review workflow
5. Prediction analytics pages
