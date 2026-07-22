'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

type Role = 'admin' | 'teacher' | 'viewer';

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = (profile?.role ?? 'viewer') as Role;
  if (!['teacher', 'admin'].includes(role)) {
    throw new Error('只有 Teacher 或 Admin 可以修改题库。');
  }

  return { supabase, user, role };
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function createQuestion(formData: FormData) {
  const { supabase, user } = await requireEditor();

  const subjectId = text(formData, 'subject_id');
  const sourceId = text(formData, 'source_id');
  const chapterId = text(formData, 'chapter_id') || null;
  const topic = text(formData, 'topic');
  const questionType = text(formData, 'question_type');

  if (!subjectId || !sourceId || !topic || !questionType) {
    throw new Error('科目、来源、考点和题型为必填。');
  }

  const skills = text(formData, 'skills')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  const { error } = await supabase.from('questions').insert({
    question_code: text(formData, 'question_code') || null,
    source_id: sourceId,
    subject_id: subjectId,
    chapter_id: chapterId,
    form_level: numberValue(formData, 'form_level', 4),
    section: text(formData, 'section') || null,
    question_no: text(formData, 'question_no') || null,
    topic,
    question_type: questionType,
    marks: numberValue(formData, 'marks', 0),
    command_word: text(formData, 'command_word') || null,
    cognitive_level: text(formData, 'cognitive_level') || null,
    skills,
    duplicate_group: text(formData, 'duplicate_group') || null,
    question_summary: text(formData, 'question_summary') || null,
    teacher_note: text(formData, 'teacher_note') || null,
    high_value: formData.get('high_value') === 'on',
    review_status: 'pending',
    official_weight: numberValue(formData, 'official_weight', 0.5),
    coverage_gap: numberValue(formData, 'coverage_gap', 50),
    trial_consensus: numberValue(formData, 'trial_consensus', 50),
    format_fit: numberValue(formData, 'format_fit', 50),
    skill_recurrence: numberValue(formData, 'skill_recurrence', 50),
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/workspace');
}

export async function updateQuestion(formData: FormData) {
  const { supabase } = await requireEditor();
  const id = text(formData, 'id');
  if (!id) throw new Error('缺少题目 ID。');

  const skills = text(formData, 'skills')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from('questions')
    .update({
      question_code: text(formData, 'question_code') || null,
      chapter_id: text(formData, 'chapter_id') || null,
      form_level: numberValue(formData, 'form_level', 4),
      section: text(formData, 'section') || null,
      question_no: text(formData, 'question_no') || null,
      topic: text(formData, 'topic'),
      question_type: text(formData, 'question_type'),
      marks: numberValue(formData, 'marks', 0),
      command_word: text(formData, 'command_word') || null,
      cognitive_level: text(formData, 'cognitive_level') || null,
      skills,
      duplicate_group: text(formData, 'duplicate_group') || null,
      question_summary: text(formData, 'question_summary') || null,
      teacher_note: text(formData, 'teacher_note') || null,
      high_value: formData.get('high_value') === 'on',
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/workspace');
}

export async function setReviewStatus(formData: FormData) {
  const { supabase, user } = await requireEditor();
  const id = text(formData, 'id');
  const status = text(formData, 'status');

  if (!id || !['pending', 'verified', 'rejected'].includes(status)) {
    throw new Error('无效的审核操作。');
  }

  const { error } = await supabase
    .from('questions')
    .update({
      review_status: status,
      reviewed_by: status === 'pending' ? null : user.id,
      reviewed_at: status === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/workspace');
}

export async function deleteQuestion(formData: FormData) {
  const { supabase, role } = await requireEditor();
  if (role !== 'admin') throw new Error('只有 Admin 可以删除题目。');

  const id = text(formData, 'id');
  if (!id) throw new Error('缺少题目 ID。');

  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/workspace');
}
