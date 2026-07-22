'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

async function requireEditor(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).single();
  if(!['teacher','admin'].includes(profile?.role??'viewer'))throw new Error('Teacher 或 Admin 权限才能审核。');
  return{supabase,user};
}
const text=(fd:FormData,key:string)=>String(fd.get(key)??'').trim();
const num=(fd:FormData,key:string)=>{const n=Number(fd.get(key));return Number.isFinite(n)?n:null};

export async function updateStaging(formData:FormData){
  const {supabase}=await requireEditor();
  const id=text(formData,'id');
  if(!id)throw new Error('缺少 staging ID');
  const skills=text(formData,'skills').split('|').map(x=>x.trim()).filter(Boolean);
  const {error}=await supabase.from('question_staging').update({
    subject_id:text(formData,'subject_id')||null,
    chapter_id:text(formData,'chapter_id')||null,
    form_level:num(formData,'form_level'),
    question_no:text(formData,'question_no')||null,
    section:text(formData,'section')||null,
    marks:num(formData,'marks'),
    topic:text(formData,'topic')||null,
    question_type:text(formData,'question_type')||null,
    command_word:text(formData,'command_word')||null,
    cognitive_level:text(formData,'cognitive_level')||null,
    skills,
    review_note:text(formData,'review_note')||null,
    status:'needs_review',
  }).eq('id',id);
  if(error)throw new Error(error.message);
  revalidatePath('/staging');
}

export async function approveStaging(formData:FormData){
  const {supabase}=await requireEditor();
  const id=text(formData,'id');
  const {error}=await supabase.rpc('approve_staging_question',{p_staging_id:id});
  if(error)throw new Error(error.message);
  revalidatePath('/staging');revalidatePath('/workspace');
}

export async function rejectStaging(formData:FormData){
  const {supabase}=await requireEditor();
  const id=text(formData,'id');
  const {error}=await supabase.from('question_staging').update({status:'rejected',review_note:text(formData,'review_note')||'Rejected by teacher'}).eq('id',id);
  if(error)throw new Error(error.message);
  revalidatePath('/staging');
}
