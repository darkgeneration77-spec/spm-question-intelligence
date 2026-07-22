import { createClient } from '@supabase/supabase-js';
import pdf from 'pdf-parse';
import { classifySejarah } from './sejarah-classifier.js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pollMs = Number(process.env.POLL_INTERVAL_MS ?? 15000);
if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

type ImportJob = { id:string; storage_path:string; file_name:string; source_id:string|null };
type ExtractedQuestion = { question_no:string; raw_text:string; command_word:string|null; confidence:number };

function normalizeText(value:string){return value.replace(/\r/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()}
function detectCommandWord(text:string){const words=['Nyatakan','Jelaskan','Huraikan','Terangkan','Bincangkan','Bandingkan','Hitung','Kirakan','Tentukan','State','Explain','Describe','Calculate','Determine','Compare','Evaluate'];return words.find(w=>new RegExp(`\\b${w}\\b`,'i').test(text))??null}
function splitQuestions(text:string):ExtractedQuestion[]{const clean=normalizeText(text);const marker=/(?:^|\n)\s*(?:Soalan\s*)?(\d{1,2})(?:\s*[.)]|\s+(?=[A-Z]))/gim;const matches=[...clean.matchAll(marker)];if(!matches.length)return clean?[{question_no:'1',raw_text:clean,command_word:detectCommandWord(clean),confidence:35}]:[];return matches.map((m,i)=>{const raw=clean.slice(m.index??0,matches[i+1]?.index??clean.length).trim();return{question_no:m[1]??String(i+1),raw_text:raw,command_word:detectCommandWord(raw),confidence:raw.length>40?72:45}})}

async function claimJob():Promise<ImportJob|null>{
  const {data,error}=await supabase.from('import_jobs').select('id, storage_path, file_name, source_id').eq('status','queued').order('created_at',{ascending:true}).limit(1).maybeSingle();
  if(error)throw error;if(!data)return null;
  const {data:claimed,error:claimError}=await supabase.from('import_jobs').update({status:'processing',progress:5,error_message:null,processor_version:'worker-0.2.0'}).eq('id',data.id).eq('status','queued').select('id, storage_path, file_name, source_id').maybeSingle();
  if(claimError)throw claimError;return claimed as ImportJob|null;
}

async function resolveTaxonomy(classification:ReturnType<typeof classifySejarah>){
  const {data:subject}=await supabase.from('subjects').select('id').eq('name','Sejarah').maybeSingle();
  if(!subject?.id||!classification.chapter||!classification.form)return{subjectId:subject?.id??null,chapterId:null};
  const {data:chapter}=await supabase.from('chapters').select('id').eq('subject_id',subject.id).eq('form_level',classification.form).eq('name',classification.chapter).maybeSingle();
  return{subjectId:subject.id,chapterId:chapter?.id??null};
}

async function processJob(job:ImportJob){
  try{
    const {data:file,error:downloadError}=await supabase.storage.from('question-pdfs').download(job.storage_path);
    if(downloadError||!file)throw downloadError??new Error('PDF download failed');
    await supabase.from('import_jobs').update({progress:20}).eq('id',job.id);
    const parsed=await pdf(Buffer.from(await file.arrayBuffer()));
    const questions=splitQuestions(parsed.text);
    await supabase.from('import_jobs').update({progress:55,page_count:parsed.numpages}).eq('id',job.id);
    await supabase.from('question_staging').delete().eq('import_job_id',job.id);

    const rows=[];
    for(const question of questions){
      const c=classifySejarah(question.raw_text);
      const taxonomy=await resolveTaxonomy(c);
      rows.push({
        import_job_id:job.id,page_from:null,page_to:null,raw_text:question.raw_text,question_no:question.question_no,
        command_word:question.command_word,classification_confidence:Math.round((question.confidence+c.confidence)/2),
        subject_id:taxonomy.subjectId,chapter_id:taxonomy.chapterId,form_level:c.form,topic:null,question_type:c.questionType,
        cognitive_level:c.cognitiveLevel,skills:c.skills,status:c.confidence>=80?'classified':'needs_review',
        matched_keywords:c.matchedKeywords,classification_reason:c.reason,suggested_subject:c.subject,
        suggested_chapter:c.chapter,suggested_form:c.form,
      });
    }
    if(rows.length){const {error}=await supabase.from('question_staging').insert(rows);if(error)throw error}
    await supabase.from('import_jobs').update({status:'needs_review',progress:100,metadata:{extracted_question_count:questions.length,extraction_mode:'embedded-text',classifier:'sejarah-rules-v1'}}).eq('id',job.id);
    console.log(`[worker] extracted and classified ${questions.length} questions from ${job.file_name}`);
  }catch(error){const message=error instanceof Error?error.message:String(error);await supabase.from('import_jobs').update({status:'failed',error_message:message}).eq('id',job.id);console.error(`[worker] job ${job.id} failed:`,message)}
}

async function main(){console.log(`[worker] started; polling every ${pollMs}ms`);while(true){try{const job=await claimJob();if(job)await processJob(job)}catch(error){console.error('[worker] polling error:',error)}await new Promise(r=>setTimeout(r,pollMs))}}
void main();
