import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function cleanFileName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'question-paper.pdf';
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['teacher', 'admin'].includes(profile?.role ?? 'viewer')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const sourceId = String(formData.get('source_id') ?? '').trim() || null;

  if (!(file instanceof File) || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'PDF file required' }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File must be smaller than 50 MB' }, { status: 400 });
  }

  const storagePath = `${user.id}/${Date.now()}-${cleanFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from('question-pdfs')
    .upload(storagePath, file, { contentType: 'application/pdf', upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: job, error: jobError } = await supabase
    .from('import_jobs')
    .insert({
      source_id: sourceId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
      status: 'queued',
      progress: 0,
      processor_version: 'manual-staging-v1',
      metadata: { original_name: file.name, upload_mode: 'teacher_upload' },
      created_by: user.id,
    })
    .select('id, status, created_at')
    .single();

  if (jobError) {
    await supabase.storage.from('question-pdfs').remove([storagePath]);
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  return NextResponse.json({ job }, { status: 201 });
}
