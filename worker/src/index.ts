import { createClient } from '@supabase/supabase-js';
import pdf from 'pdf-parse';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pollMs = Number(process.env.POLL_INTERVAL_MS ?? 15000);

if (!url || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type ImportJob = {
  id: string;
  storage_path: string;
  file_name: string;
  source_id: string | null;
};

type ExtractedQuestion = {
  question_no: string;
  raw_text: string;
  command_word: string | null;
  confidence: number;
};

function normalizeText(value: string) {
  return value
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectCommandWord(text: string) {
  const commands = [
    'Nyatakan', 'Jelaskan', 'Huraikan', 'Terangkan', 'Bincangkan',
    'Bandingkan', 'Hitung', 'Kirakan', 'Tentukan', 'State', 'Explain',
    'Describe', 'Calculate', 'Determine', 'Compare', 'Evaluate',
  ];
  return commands.find((word) => new RegExp(`\\b${word}\\b`, 'i').test(text)) ?? null;
}

function splitQuestions(text: string): ExtractedQuestion[] {
  const clean = normalizeText(text);
  const marker = /(?:^|\n)\s*(?:Soalan\s*)?(\d{1,2})(?:\s*[.)]|\s+(?=[A-Z]))/gim;
  const matches = [...clean.matchAll(marker)];

  if (!matches.length) {
    return clean
      ? [{ question_no: '1', raw_text: clean, command_word: detectCommandWord(clean), confidence: 0.35 }]
      : [];
  }

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? clean.length;
    const raw = clean.slice(start, end).trim();
    return {
      question_no: match[1] ?? String(index + 1),
      raw_text: raw,
      command_word: detectCommandWord(raw),
      confidence: raw.length > 40 ? 0.72 : 0.45,
    };
  });
}

async function claimJob(): Promise<ImportJob | null> {
  const { data, error } = await supabase
    .from('import_jobs')
    .select('id, storage_path, file_name, source_id')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: claimed, error: claimError } = await supabase
    .from('import_jobs')
    .update({ status: 'processing', progress: 5, started_at: new Date().toISOString(), error_message: null })
    .eq('id', data.id)
    .eq('status', 'queued')
    .select('id, storage_path, file_name, source_id')
    .maybeSingle();

  if (claimError) throw claimError;
  return claimed as ImportJob | null;
}

async function processJob(job: ImportJob) {
  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from('question-papers')
      .download(job.storage_path);
    if (downloadError || !file) throw downloadError ?? new Error('PDF download failed');

    await supabase.from('import_jobs').update({ progress: 20 }).eq('id', job.id);

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdf(buffer);
    const questions = splitQuestions(parsed.text);

    await supabase.from('import_jobs').update({ progress: 55, page_count: parsed.numpages }).eq('id', job.id);
    await supabase.from('question_staging').delete().eq('import_job_id', job.id);

    if (questions.length) {
      const rows = questions.map((question, index) => ({
        import_job_id: job.id,
        source_id: job.source_id,
        page_no: null,
        sequence_no: index + 1,
        question_no: question.question_no,
        raw_text: question.raw_text,
        extracted_text: question.raw_text,
        command_word: question.command_word,
        extraction_confidence: question.confidence,
        classification_status: 'pending',
        review_status: 'pending',
      }));
      const { error: insertError } = await supabase.from('question_staging').insert(rows);
      if (insertError) throw insertError;
    }

    await supabase
      .from('import_jobs')
      .update({
        status: 'extracted',
        progress: 100,
        completed_at: new Date().toISOString(),
        extracted_question_count: questions.length,
      })
      .eq('id', job.id);

    console.log(`[worker] extracted ${questions.length} questions from ${job.file_name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from('import_jobs')
      .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
      .eq('id', job.id);
    console.error(`[worker] job ${job.id} failed:`, message);
  }
}

async function tick() {
  const job = await claimJob();
  if (job) await processJob(job);
}

async function main() {
  console.log(`[worker] started; polling every ${pollMs}ms`);
  while (true) {
    try {
      await tick();
    } catch (error) {
      console.error('[worker] polling error:', error);
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

void main();
