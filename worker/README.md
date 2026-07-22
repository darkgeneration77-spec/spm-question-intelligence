# PDF Extraction Worker

This service processes queued PDF import jobs created by the Next.js app.

## Current capability

- Claims one `queued` job at a time.
- Downloads the private PDF from the `question-pdfs` Supabase Storage bucket.
- Extracts embedded PDF text with `pdf-parse`.
- Splits text using common question-number patterns.
- Detects common BM and English command words.
- Writes draft rows to `question_staging`.
- Changes the import job to `needs_review`.
- Records failures without losing the uploaded PDF.

## Important limitation

This version extracts embedded PDF text only. Image-only scanned PDFs require a separate OCR adapter. AI chapter classification and duplicate detection are also not active yet.

## Run locally

```bash
cd worker
npm install
cp .env.example .env
npm run dev
```

Required variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POLL_INTERVAL_MS`

The service-role key must only be stored in the worker environment. Never expose it in the browser or commit the real value to GitHub.

## Required database setup

Run these migrations before starting the worker:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/analytics.sql`
4. `supabase/pdf_import.sql`

## Next adapters

- OCR adapter for scanned PDFs.
- Page-aware extraction.
- Sejarah chapter classifier.
- Similarity and duplicate clustering.
- Teacher staging review and approval workflow.
