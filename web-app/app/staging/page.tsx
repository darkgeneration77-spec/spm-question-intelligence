import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { approveStaging, rejectStaging, updateStaging } from './actions';
import './staging.css';

export default async function StagingPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/login');

  const [profileResult,stagingResult,subjectResult,chapterResult]=await Promise.all([
    supabase.from('profiles').select('role').eq('id',user.id).single(),
    supabase.from('question_staging').select(`id,raw_text,question_no,section,marks,form_level,topic,question_type,command_word,cognitive_level,skills,classification_confidence,matched_keywords,classification_reason,suggested_subject,suggested_chapter,suggested_form,status,review_note,subject_id,chapter_id,import_jobs(file_name,sources(title,year))`).order('created_at',{ascending:false}).limit(100),
    supabase.from('subjects').select('id,name').order('name'),
    supabase.from('chapters').select('id,name,form_level,subject_id').order('form_level').order('chapter_no'),
  ]);
  const role=profileResult.data?.role??'viewer';
  const canEdit=['teacher','admin'].includes(role);
  const rows=stagingResult.data??[];
  const pending=rows.filter((x:any)=>!['approved','rejected'].includes(x.status)).length;

  return <main className="page-shell">
    <header className="workspace-header"><div><p className="eyebrow">SPRINT 2.3 · REVIEW LOOP</p><h1>Staging 审核</h1><p className="subtitle">检查自动切题与 Sejarah 分类结果，修改后写入正式题库。</p></div></header>
    {!canEdit&&<div className="alert warning">当前账号只能查看，无法审核。</div>}
    {stagingResult.error&&<div className="alert error">读取失败：{stagingResult.error.message}</div>}
    <section className="metrics">
      <article><span>暂存题目</span><strong>{rows.length}</strong><small>latest 100</small></article>
      <article><span>待处理</span><strong>{pending}</strong><small>review required</small></article>
      <article><span>已批准</span><strong>{rows.filter((x:any)=>x.status==='approved').length}</strong><small>moved to questions</small></article>
      <article><span>当前权限</span><strong>{role}</strong><small>RLS protected</small></article>
    </section>
    <section className="cloud-table-card"><div className="table-heading"><div><p className="eyebrow">STAGING QUEUE</p><h2>AI 分类结果</h2></div><span>{rows.length} records</span></div>
      <div className="question-stack">
        {rows.map((row:any)=><details className="question-panel" key={row.id} open={row.status==='needs_review'}>
          <summary><div><strong>Q{row.question_no??'—'} · {row.suggested_chapter??row.topic??'未分类'}</strong><small>{row.import_jobs?.sources?.year??'—'} · {row.import_jobs?.sources?.title??row.import_jobs?.file_name??'Unknown source'}</small></div><div><span className={`review-pill ${row.status==='approved'?'verified':row.status==='rejected'?'rejected':'pending'}`}>{row.status}</span><small>{row.classification_confidence??0}%</small></div></summary>
          <div className="question-overview"><span>建议 Form {row.suggested_form??'—'}</span><span>{row.suggested_subject??'—'}</span><span>{row.suggested_chapter??'未匹配章节'}</span>{(row.matched_keywords??[]).map((k:string)=><span key={k}>{k}</span>)}</div>
          <div className="staging-text"><strong>原始文字</strong><pre>{row.raw_text}</pre><small>{row.classification_reason}</small></div>
          {canEdit&&row.status!=='approved'&&<>
            <form action={updateStaging} className="cloud-form compact-form">
              <input type="hidden" name="id" value={row.id}/>
              <label>科目<select name="subject_id" defaultValue={row.subject_id??''}><option value="">未选择</option>{(subjectResult.data??[]).map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label>Form<select name="form_level" defaultValue={String(row.form_level??row.suggested_form??4)}><option value="4">Form 4</option><option value="5">Form 5</option></select></label>
              <label className="wide-field">章节<select name="chapter_id" defaultValue={row.chapter_id??''}><option value="">未分类</option>{(chapterResult.data??[]).map((x:any)=><option key={x.id} value={x.id}>F{x.form_level} · {x.name}</option>)}</select></label>
              <label>题号<input name="question_no" defaultValue={row.question_no??''}/></label>
              <label>Section<input name="section" defaultValue={row.section??''}/></label>
              <label>分数<input name="marks" type="number" step="0.5" min="0" defaultValue={row.marks??0}/></label>
              <label>题型<input name="question_type" defaultValue={row.question_type??'Imported'}/></label>
              <label className="wide-field">考点<input name="topic" defaultValue={row.topic??row.suggested_chapter??''}/></label>
              <label>Kata Tugas<input name="command_word" defaultValue={row.command_word??''}/></label>
              <label>认知层级<input name="cognitive_level" defaultValue={row.cognitive_level??''}/></label>
              <label className="wide-field">技能<input name="skills" defaultValue={(row.skills??[]).join('|')}/></label>
              <label className="wide-field">审核备注<textarea name="review_note" rows={2} defaultValue={row.review_note??''}/></label>
              <div className="form-actions"><button type="submit">保存修改</button></div>
            </form>
            <div className="review-actions">
              <form action={approveStaging}><input type="hidden" name="id" value={row.id}/><button type="submit">批准并写入题库</button></form>
              <form action={rejectStaging}><input type="hidden" name="id" value={row.id}/><input type="hidden" name="review_note" value="Rejected by teacher"/><button className="danger-button" type="submit">拒绝</button></form>
            </div>
          </>}
        </details>)}
        {!rows.length&&<div className="empty-cell">还没有暂存题目。先上传并处理一份 PDF。</div>}
      </div>
    </section>
  </main>;
}
