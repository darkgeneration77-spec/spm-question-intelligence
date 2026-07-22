import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { PdfUploadForm } from './upload-form';

export default async function PdfImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: sources }, { data: jobs, error }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    supabase.from('sources').select('id, title, year').order('year', { ascending: false }).limit(200),
    supabase
      .from('import_jobs')
      .select('id, file_name, file_size, status, progress, page_count, error_message, created_at, sources(title, year)')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const canEdit = ['teacher', 'admin'].includes(profile?.role ?? 'viewer');

  return (
    <main className="page-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">SPRINT 2.1 · PDF PIPELINE</p>
          <h1>PDF 导入任务</h1>
          <p className="subtitle">上传试卷到 Supabase Storage，并建立可追踪的处理任务。当前版本负责安全上传与暂存；OCR、拆题和 AI 分类将在处理服务接入后更新任务状态。</p>
        </div>
      </header>

      {!canEdit && <div className="alert warning">当前账号没有上传权限。</div>}
      {error && <div className="alert error">任务读取失败：{error.message}</div>}

      {canEdit && (
        <section className="editor-card">
          <p className="eyebrow">UPLOAD</p>
          <h2>上传 PDF 试卷</h2>
          <p className="subtitle">仅接受 PDF，最大 50 MB。正式题、Trial、SBP 和 MRSM 应先在 Sources 页面建立来源记录。</p>
          <PdfUploadForm sources={sources ?? []} />
        </section>
      )}

      <section className="cloud-table-card">
        <div className="table-heading">
          <div><p className="eyebrow">IMPORT QUEUE</p><h2>处理队列</h2></div>
          <span>{jobs?.length ?? 0} jobs</span>
        </div>
        <div className="question-stack">
          {(jobs ?? []).map((job: any) => (
            <article className="question-panel" key={job.id}>
              <div className="job-row">
                <div>
                  <strong>{job.file_name}</strong>
                  <small>{job.sources?.year ?? '—'} · {job.sources?.title ?? '未匹配来源'} · {(Number(job.file_size) / 1024 / 1024).toFixed(2)} MB</small>
                </div>
                <div>
                  <span className={`review-pill ${job.status === 'failed' ? 'rejected' : job.status === 'completed' ? 'verified' : 'pending'}`}>{job.status}</span>
                  <small>{job.progress}% · {job.page_count ?? '—'} pages</small>
                </div>
              </div>
              {job.error_message && <div className="alert error">{job.error_message}</div>}
            </article>
          ))}
          {!jobs?.length && <div className="empty-cell">还没有 PDF 导入任务。</div>}
        </div>
      </section>
    </main>
  );
}
