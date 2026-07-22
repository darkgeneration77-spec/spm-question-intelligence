'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

type Role = 'admin' | 'teacher' | 'viewer';

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = (profile?.role ?? 'viewer') as Role;
  if (!['teacher', 'admin'].includes(role)) throw new Error('只有 Teacher 或 Admin 可以管理来源。');
  return { supabase, user, role };
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

export async function createSource(formData: FormData) {
  const { supabase, user } = await requireEditor();
  const title = text(formData, 'title');
  const year = Number(formData.get('year'));
  const sourceKind = text(formData, 'source_kind');
  if (!title || !Number.isInteger(year) || !sourceKind) throw new Error('来源名称、年份和来源类型为必填。');

  const reliability = Math.min(1, Math.max(0, Number(formData.get('reliability') ?? 0.5)));
  const { error } = await supabase.from('sources').insert({
    title,
    source_kind: sourceKind,
    year,
    state: text(formData, 'state') || null,
    paper: text(formData, 'paper') || null,
    curriculum: text(formData, 'curriculum') || 'KSSM',
    source_url: text(formData, 'source_url') || null,
    copyright_status: text(formData, 'copyright_status') || 'metadata-only',
    reliability,
    uploaded_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/sources');
  revalidatePath('/workspace');
}

export async function deleteSource(formData: FormData) {
  const { supabase, role } = await requireEditor();
  if (role !== 'admin') throw new Error('只有 Admin 可以删除来源。');
  const id = text(formData, 'id');
  if (!id) throw new Error('缺少来源 ID。');
  const { error } = await supabase.from('sources').delete().eq('id', id);
  if (error) throw new Error('删除失败。请先确认该来源没有题目记录。');
  revalidatePath('/sources');
}
