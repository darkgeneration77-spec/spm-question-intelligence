# PDF Extraction Worker

This service processes queued PDF import jobs created by the Next.js app.

## Current capability

- Claims one `queued` job at a time.
- Downloads the private PDF from the `question-pdfs` Supabase Storage bucket.
- Extracts embedded PDF text with `pdf-parse`.
- Splits text using common question-number patterns.
- Detects common BM and English command words.
- Applies the Sejarah Form 4 / Form 5 rule classifier.
- Suggests chapter, cognitive level, question type and skills.
- Stores confidence, matched keywords and classification reason.
- Writes draft rows to `question_staging`.
- Changes the import job to `needs_review`.
- Records failures without losing the uploaded PDF.

## Important limitation

This version extracts embedded PDF text only. Image-only scanned PDFs still require a separate OCR adapter. The Sejarah classifier is rules-based, so teachers must review low-confidence or ambiguous results before approval. Duplicate similarity is not active yet.

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
5. `supabase/classification.sql`

## Review flow

1. Upload a PDF from `/pdf-import`.
2. Worker extracts and classifies questions.
3. Open `/staging`.
4. Correct chapter, Form, marks, skills or command word.
5. Approve the staging record.
6. The database creates a pending row in `questions` for final verification.

## Next adapters

- OCR adapter for scanned PDFs.
- Page-aware extraction and source-page preview.
- Similarity and duplicate clustering.
- Classification feedback metrics.
