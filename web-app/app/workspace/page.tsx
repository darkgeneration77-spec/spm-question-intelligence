import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { logout } from '../login/actions';
import { createQuestion, deleteQuestion, setReviewStatus, updateQuestion } from './actions';

type QuestionRow = {
  id: string;
  question_code: string | null;
  topic: string;
  question_type: string;
  marks: number;
  review_status: 'pending' | 'verified' | 'rejected';
  form_level: number | null;
  section: string | null;
  question_no: string | null;
  command_word: string | null;
  cognitive_level: string | null;
  skills: string[];
  duplicate_group: string | null;
  question_summary: string | null;
  teacher_note: string | null;
  high_value: boolean;
  chapter_id: string | null;
  created_at: string;
  chapters: { name: string } | null;
  subjects: { name: string } | null;
  sources: { title: string; year: number; state: string | null } | null;
};

type TaxonomyRow = { id: string; name: string };
type ChapterRow = TaxonomyRow & { form_level: number | null; subject_id: string };
type SourceRow = TaxonomyRow & { year: number; state: string | null };

export default async function WorkspacePage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!configured) {
    return (
      <main className="page-shell">
        <section className="next-step">
          <div>
            <p className="eyebrow">CONFIGURATION REQUIRED</p>
            <h1>Supabase 尚未连接</h1>
            <p>建立 .env.local 后，教师工作台才会读取与修改云端题库。</p>
          </div>
          <code>NEXT_PUBLIC_SUPABASE_URL</code>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileResult, questionResult, subjectResult, chapterResult, sourceResult] = await Promise.all([
    supabase.from('profiles').select('display_name, role').eq('id', user.id).single(),
    supabase
      .from('questions')
      .select(`
        id,
        question_code,
        topic,
        question_type,
        marks,
        review_status,
        form_level,
        section,
        question_no,
        command_word,
        cognitive_level,
        skills,
        duplicate_group,
        question_summary,
        teacher_note,
        high_value,
        chapter_id,
        created_at,
        chapters(name),
        subjects(name),
        sources(title, year, state)
      `)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('subjects').select('id, name').eq('active', true).order('name'),
    supabase.from('chapters').select('id, name, form_level, subject_id').order('form_level').order('chapter_no'),
    supabase.from('sources').select('id, title, year, state').order('year', { ascending: false }).limit(200),
  ]);

  const profile = profileResult.data;
  const questions = (questionResult.data ?? []) as unknown as QuestionRow[];
  const subjects = (subjectResult.data ?? []) as TaxonomyRow[];
  const chapters = (chapterResult.data ?? []) as ChapterRow[];
  const sources = (sourceResult.data ?? []) as SourceRow[];
  const role = profile?.role ?? 'viewer';
  const canEdit = role === 'teacher' || role === 'admin';
  const pending = questions.filter((question) => question.review_status === 'pending').length;
  const verified = questions.filter((question) => question.review_status === 'verified').length;
  const rejected = questions.filter((question) => question.review_status === 'rejected').length;

  return (
    <main className="page-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">CLOUD TEACHER WORKSPACE</p>
          <h1>教师工作台</h1>
          <p className="subtitle">
            {profile?.display_name ?? user.email} · {role}
          </p>
        </div>
        <form action={logout}>
          <button className="secondary-button" type="submit">退出登录</button>
        </form>
      </header>

      {questionResult.error && <div className="alert error">题库读取失败：{questionResult.error.message}</div>}
      {!canEdit && <div className="alert">当前账号是 Viewer，只能查看题库。管理员必须把账号提升为 Teacher 或 Admin 才能编辑。</div>}

      <section className="metrics">
        <article><span>已读取题目</span><strong>{questions.length}</strong><small>latest 100</small></article>
        <article><span>待审核</span><strong>{pending}</strong><small>review queue</small></article>
        <article><span>已验证</span><strong>{verified}</strong><small>verified records</small></article>
        <article><span>已驳回</span><strong>{rejected}</strong><small>rejected records</small></article>
      </section>

      {canEdit && (
        <details className="editor-card" open={!questions.length}>
          <summary>新增云端题目</summary>
          <form action={createQuestion} className="cloud-form">
            <label>Question Code<input name="question_code" placeholder="SJ-2026-JHR-P2-Q3" /></label>
            <label>科目<select name="subject_id" required><option value="">选择科目</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Form<select name="form_level" defaultValue="4"><option value="4">Form 4</option><option value="5">Form 5</option></select></label>
            <label>章节<select name="chapter_id"><option value="">未分类</option>{chapters.map((item) => <option key={item.id} value={item.id}>F{item.form_level ?? '—'} · {item.name}</option>)}</select></label>
            <label>来源<select name="source_id" required><option value="">选择来源</option>{sources.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.title} · {item.state ?? 'National'}</option>)}</select></label>
            <label>Section<input name="section" placeholder="Bahagian A" /></label>
            <label>题号<input name="question_no" placeholder="3(a)" /></label>
            <label>考点<input name="topic" required placeholder="Kepentingan pilihan raya" /></label>
            <label>题型<input name="question_type" required placeholder="Struktur" /></label>
            <label>分数<input name="marks" type="number" min="0" step="0.5" defaultValue="4" /></label>
            <label>Kata Tugas<input name="command_word" placeholder="Jelaskan" /></label>
            <label>认知层级<input name="cognitive_level" placeholder="Menganalisis" /></label>
            <label className="wide-field">技能标签<input name="skills" placeholder="fakta|sebab|KBAT" /></label>
            <label>重复题群<input name="duplicate_group" placeholder="TR26-SJ-F4B8-01" /></label>
            <label>Official Weight<input name="official_weight" type="number" min="0" max="1" step="0.1" defaultValue="0.6" /></label>
            <label>Coverage Gap<input name="coverage_gap" type="number" min="0" max="100" defaultValue="50" /></label>
            <label>Trial Consensus<input name="trial_consensus" type="number" min="0" max="100" defaultValue="50" /></label>
            <label>Format Fit<input name="format_fit" type="number" min="0" max="100" defaultValue="50" /></label>
            <label>Skill Recurrence<input name="skill_recurrence" type="number" min="0" max="100" defaultValue="50" /></label>
            <label className="wide-field">题目摘要<textarea name="question_summary" rows={3} /></label>
            <label className="wide-field">教师备注<textarea name="teacher_note" rows={2} /></label>
            <label className="check-field"><input name="high_value" type="checkbox" /> 标记为高价值题</label>
            <div className="form-actions"><button type="submit">保存到云端</button></div>
          </form>
        </details>
      )}

      <section className="cloud-table-card">
        <div className="table-heading">
          <div>
            <p className="eyebrow">QUESTION BANK</p>
            <h2>云端题库与审核队列</h2>
          </div>
          <span>{questions.length} records</span>
        </div>

        <div className="question-stack">
          {questions.map((question) => (
            <details className="question-panel" key={question.id}>
              <summary>
                <div><strong>{question.question_code ?? 'No code'}</strong><small>{question.topic}</small></div>
                <div><span className={`review-pill ${question.review_status}`}>{question.review_status}</span><small>{question.marks} marks</small></div>
              </summary>

              <div className="question-overview">
                <span>{question.subjects?.name ?? '—'}</span>
                <span>{question.chapters?.name ?? '未分类'}</span>
                <span>{question.sources?.year ?? '—'} · {question.sources?.title ?? '—'}</span>
                <span>{question.sources?.state ?? 'National'}</span>
                <span>{question.section ?? 'No section'} · Q{question.question_no ?? '—'}</span>
                <span>{question.question_type}</span>
                {question.high_value && <span className="value-badge">高价值</span>}
              </div>

              {canEdit && (
                <>
                  <form action={updateQuestion} className="cloud-form compact-form">
                    <input name="id" type="hidden" value={question.id} />
                    <label>Question Code<input name="question_code" defaultValue={question.question_code ?? ''} /></label>
                    <label>Form<select name="form_level" defaultValue={String(question.form_level ?? 4)}><option value="4">Form 4</option><option value="5">Form 5</option></select></label>
                    <label>章节<select name="chapter_id" defaultValue={question.chapter_id ?? ''}><option value="">未分类</option>{chapters.map((item) => <option key={item.id} value={item.id}>F{item.form_level ?? '—'} · {item.name}</option>)}</select></label>
                    <label>Section<input name="section" defaultValue={question.section ?? ''} /></label>
                    <label>题号<input name="question_no" defaultValue={question.question_no ?? ''} /></label>
                    <label>考点<input name="topic" required defaultValue={question.topic} /></label>
                    <label>题型<input name="question_type" required defaultValue={question.question_type} /></label>
                    <label>分数<input name="marks" type="number" min="0" step="0.5" defaultValue={question.marks} /></label>
                    <label>Kata Tugas<input name="command_word" defaultValue={question.command_word ?? ''} /></label>
                    <label>认知层级<input name="cognitive_level" defaultValue={question.cognitive_level ?? ''} /></label>
                    <label className="wide-field">技能标签<input name="skills" defaultValue={(question.skills ?? []).join('|')} /></label>
                    <label>重复题群<input name="duplicate_group" defaultValue={question.duplicate_group ?? ''} /></label>
                    <label className="wide-field">题目摘要<textarea name="question_summary" rows={2} defaultValue={question.question_summary ?? ''} /></label>
                    <label className="wide-field">教师备注<textarea name="teacher_note" rows={2} defaultValue={question.teacher_note ?? ''} /></label>
                    <label className="check-field"><input name="high_value" type="checkbox" defaultChecked={question.high_value} /> 高价值题</label>
                    <div className="form-actions"><button type="submit">保存修改</button></div>
                  </form>

                  <div className="review-actions">
                    <form action={setReviewStatus}><input name="id" type="hidden" value={question.id} /><input name="status" type="hidden" value="verified" /><button type="submit">通过审核</button></form>
                    <form action={setReviewStatus}><input name="id" type="hidden" value={question.id} /><input name="status" type="hidden" value="rejected" /><button className="danger-button" type="submit">驳回</button></form>
                    <form action={setReviewStatus}><input name="id" type="hidden" value={question.id} /><input name="status" type="hidden" value="pending" /><button className="secondary-button" type="submit">退回待审</button></form>
                    {role === 'admin' && <form action={deleteQuestion}><input name="id" type="hidden" value={question.id} /><button className="danger-button" type="submit">永久删除</button></form>}
                  </div>
                </>
              )}
            </details>
          ))}
          {!questions.length && <div className="empty-cell">数据库目前没有题目。请先新增题目或运行 seed.sql。</div>}
        </div>
      </section>
    </main>
  );
}
