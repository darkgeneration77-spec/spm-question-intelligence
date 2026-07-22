import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { importQuestions } from './actions';

type PageProps={searchParams:Promise<{added?:string;invalid?:string}>};

export default async function ImportPage({searchParams}:PageProps){
  const params=await searchParams;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).single();
  const canEdit=['teacher','admin'].includes(profile?.role??'viewer');

  return <main className="page-shell">
    <header className="workspace-header">
      <div><p className="eyebrow">CLOUD CSV IMPORT</p><h1>批量导入真实题库</h1><p className="subtitle">先在来源管理建立试卷来源，再使用完全相同的来源名称、科目名称和章节名称导入题目。</p></div>
      <nav className="workspace-nav"><Link href="/workspace">题库</Link><Link href="/sources">来源管理</Link></nav>
    </header>
    {params.added&&<div className="alert success">导入完成：新增 {params.added} 道题，跳过无效行 {params.invalid??'0'} 条。</div>}
    {!canEdit&&<div className="alert warning">当前账号是 Viewer，没有导入权限。</div>}

    <section className="import-layout">
      <article className="cloud-table-card">
        <p className="eyebrow">UPLOAD</p><h2>选择 CSV 文件</h2>
        <p className="subtitle">每次最多 500 道题，文件最大 2 MB。导入题目默认进入 pending，只有 verified=true 才会直接标记为已审核。</p>
        <form action={importQuestions} className="upload-form">
          <label className="file-drop">CSV 文件<input name="file" type="file" accept=".csv,text/csv" required disabled={!canEdit}/></label>
          <button className="primary-button" type="submit" disabled={!canEdit}>开始云端导入</button>
        </form>
        <a className="secondary-link" href="/question-import-template.csv" download>下载导入模板</a>
      </article>

      <article className="cloud-table-card">
        <p className="eyebrow">MATCHING RULES</p><h2>导入前检查</h2>
        <ol className="rule-list">
          <li><strong>source_title</strong> 必须与来源管理中的名称完全一致。</li>
          <li><strong>subject</strong> 必须与 subjects 表的名称一致，例如 Sejarah。</li>
          <li><strong>chapter</strong> 必须与对应 Form 的章节名称一致。</li>
          <li><strong>skills</strong> 使用竖线分隔，例如 fakta|sebab|KBAT。</li>
          <li>相同题目应填写相同 <strong>duplicate_group</strong>。</li>
        </ol>
      </article>
    </section>
  </main>;
}
