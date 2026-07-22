import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { createSource, deleteSource } from './actions';

const sourceKinds = ['official_spm','official_sample','sbp','mrsm','state_trial','school_trial','commercial','other'];

export default async function SourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: sources, error }] = await Promise.all([
    supabase.from('profiles').select('role, display_name').eq('id', user.id).single(),
    supabase.from('sources').select('id,title,source_kind,year,state,paper,curriculum,reliability,source_url,copyright_status').order('year',{ascending:false}).limit(200),
  ]);
  const canEdit = ['teacher','admin'].includes(profile?.role ?? 'viewer');

  return (
    <main className="page-shell">
      <header className="workspace-header">
        <div><p className="eyebrow">SOURCE REGISTRY</p><h1>试卷来源管理</h1><p className="subtitle">先建立来源，再导入题目。每份 SPM、Trial、SBP 或 MRSM 试卷应有独立来源记录。</p></div>
        <nav className="workspace-nav"><Link href="/workspace">题库</Link><Link href="/import">CSV 导入</Link></nav>
      </header>
      {error && <div className="alert error">读取来源失败：{error.message}</div>}

      {canEdit && <section className="cloud-table-card">
        <div className="table-heading"><div><p className="eyebrow">NEW SOURCE</p><h2>新增试卷来源</h2></div></div>
        <form action={createSource} className="editor-grid">
          <label>来源名称<input name="title" required placeholder="2025 Johor Trial Sejarah Paper 2" /></label>
          <label>年份<input name="year" type="number" min="2000" max="2100" required defaultValue={new Date().getFullYear()} /></label>
          <label>来源类型<select name="source_kind" required>{sourceKinds.map(kind=><option key={kind} value={kind}>{kind}</option>)}</select></label>
          <label>州属 / 机构<input name="state" placeholder="Johor / SBP / MRSM" /></label>
          <label>试卷<input name="paper" placeholder="Paper 2" /></label>
          <label>课程<input name="curriculum" defaultValue="KSSM" /></label>
          <label>可信权重<input name="reliability" type="number" min="0" max="1" step="0.05" defaultValue="0.6" /></label>
          <label>版权状态<input name="copyright_status" defaultValue="metadata-only" /></label>
          <label className="wide-field">来源网址<input name="source_url" type="url" placeholder="https://..." /></label>
          <div className="wide-field"><button className="primary-button" type="submit">保存来源</button></div>
        </form>
      </section>}

      <section className="cloud-table-card">
        <div className="table-heading"><div><p className="eyebrow">SOURCE LIBRARY</p><h2>已建立来源</h2></div><span>{sources?.length ?? 0} records</span></div>
        <div className="table-scroll"><table className="cloud-table"><thead><tr><th>来源</th><th>类型</th><th>年份 / 地区</th><th>试卷</th><th>权重</th><th>版权</th><th>操作</th></tr></thead><tbody>
          {(sources ?? []).map(source=><tr key={source.id}>
            <td><strong>{source.title}</strong><small>{source.source_url ? '有来源链接' : '未填写链接'}</small></td><td>{source.source_kind}</td><td><strong>{source.year}</strong><small>{source.state ?? 'National'}</small></td><td>{source.paper ?? '—'}</td><td>{source.reliability}</td><td>{source.copyright_status}</td><td>{profile?.role==='admin'&&<form action={deleteSource}><input type="hidden" name="id" value={source.id}/><button className="danger-button small-button" type="submit">删除</button></form>}</td>
          </tr>)}
          {!sources?.length&&<tr><td colSpan={7} className="empty-cell">尚未建立来源。</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  );
}
