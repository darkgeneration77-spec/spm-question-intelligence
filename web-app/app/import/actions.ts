'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

type Role = 'admin' | 'teacher' | 'viewer';

type CsvRow = Record<string,string>;

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id',user.id).single();
  const role = (profile?.role ?? 'viewer') as Role;
  if (!['teacher','admin'].includes(role)) throw new Error('只有 Teacher 或 Admin 可以导入题库。');
  return { supabase, user };
}

function parseCsv(input:string): string[][] {
  const rows:string[][]=[]; let row:string[]=[]; let cell=''; let quoted=false;
  for(let i=0;i<input.length;i++){
    const char=input[i]; const next=input[i+1];
    if(char==='"'&&quoted&&next==='"'){cell+='"';i++;}
    else if(char==='"'){quoted=!quoted;}
    else if(char===','&&!quoted){row.push(cell);cell='';}
    else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
    else cell+=char;
  }
  row.push(cell); if(row.some(v=>v.trim()))rows.push(row); return rows;
}

function num(value:string,fallback:number,min=0,max=100){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;}
function bool(value:string){return ['true','1','yes','verified','已验证'].includes(value.trim().toLowerCase());}

export async function importQuestions(formData:FormData){
  const { supabase, user }=await requireEditor();
  const file=formData.get('file');
  if(!(file instanceof File)||file.size===0) throw new Error('请选择 CSV 文件。');
  if(file.size>2_000_000) throw new Error('CSV 文件不能超过 2 MB。');

  const matrix=parseCsv((await file.text()).replace(/^\uFEFF/,''));
  if(matrix.length<2) throw new Error('CSV 没有资料行。');
  const headers=matrix[0].map(h=>h.trim());
  const required=['source_title','subject','form_level','chapter','topic','question_type','marks'];
  const missing=required.filter(k=>!headers.includes(k));
  if(missing.length) throw new Error(`缺少字段：${missing.join(', ')}`);

  const rows:CsvRow[]=matrix.slice(1).map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]??'').trim()])));
  if(rows.length>500) throw new Error('每次最多导入 500 道题。');

  const [{data:sources},{data:subjects},{data:chapters}]=await Promise.all([
    supabase.from('sources').select('id,title'),
    supabase.from('subjects').select('id,name'),
    supabase.from('chapters').select('id,name,form_level,subject_id'),
  ]);
  const sourceMap=new Map((sources??[]).map(x=>[x.title.toLowerCase(),x.id]));
  const subjectMap=new Map((subjects??[]).map(x=>[x.name.toLowerCase(),x.id]));
  const chapterMap=new Map((chapters??[]).map(x=>[`${x.subject_id}|${x.form_level}|${x.name.toLowerCase()}`,x.id]));

  const payload=[]; let invalid=0; const errors:string[]=[];
  rows.forEach((row,index)=>{
    const sourceId=sourceMap.get(row.source_title.toLowerCase());
    const subjectId=subjectMap.get(row.subject.toLowerCase());
    const formLevel=Number(row.form_level);
    const chapterId=subjectId?chapterMap.get(`${subjectId}|${formLevel}|${row.chapter.toLowerCase()}`):undefined;
    if(!sourceId||!subjectId||!Number.isInteger(formLevel)||!row.topic||!row.question_type||!Number.isFinite(Number(row.marks))){
      invalid++; if(errors.length<8)errors.push(`第 ${index+2} 行：来源、科目、Form、章节或必填字段无法匹配。`); return;
    }
    payload.push({
      question_code:row.question_code||null,
      source_id:sourceId,
      subject_id:subjectId,
      chapter_id:chapterId||null,
      form_level:formLevel,
      section:row.section||null,
      question_no:row.question_no||null,
      topic:row.topic,
      question_type:row.question_type,
      marks:Number(row.marks),
      command_word:row.command_word||null,
      cognitive_level:row.cognitive_level||null,
      skills:(row.skills||'').split('|').map(v=>v.trim()).filter(Boolean),
      duplicate_group:row.duplicate_group||null,
      question_summary:row.question_summary||null,
      teacher_note:row.teacher_note||null,
      high_value:bool(row.high_value||''),
      review_status:bool(row.verified||'')?'verified':'pending',
      official_weight:num(row.official_weight||'',0.5,0,1),
      coverage_gap:num(row.coverage_gap||'',50),
      trial_consensus:num(row.trial_consensus||'',50),
      format_fit:num(row.format_fit||'',50),
      skill_recurrence:num(row.skill_recurrence||'',50),
      created_by:user.id,
      reviewed_by:bool(row.verified||'')?user.id:null,
      reviewed_at:bool(row.verified||'')?new Date().toISOString():null,
    });
  });

  if(!payload.length) throw new Error(errors.join(' ')||'没有可导入的有效题目。');
  const {error}=await supabase.from('questions').insert(payload);
  if(error) throw new Error(error.message);
  redirect(`/import?added=${payload.length}&invalid=${invalid}`);
}
