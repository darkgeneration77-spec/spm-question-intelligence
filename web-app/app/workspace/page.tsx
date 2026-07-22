import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { logout } from '../login/actions';

type QuestionRow = {
  id: string;
  question_code: string | null;
  topic: string;
  question_type: string;
  marks: number;
  review_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  chapters: { name: string } | null;
  subjects: { name: string } | null;
  sources: { title: string; year: number; state: string | null } | null;
};

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
            <p>建立 .env.local 后，教师工作台才会读取云端题库。</p>
          </div>
          <code>NEXT_PUBLIC_SUPABASE_URL</code>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data, error }] = await Promise.all([
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
        created_at,
        chapters(name),
        subjects(name),
        sources(title, year, state)
      `)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const questions = (data ?? []) as unknown as QuestionRow[];
  const pending = questions.filter((question) => question.review_status === 'pending').length;
  const verified = questions.filter((question) => question.review_status === 'verified').length;

  return (
    <main className="page-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">CLOUD TEACHER WORKSPACE</p>
          <h1>教师工作台</h1>
          <p className="subtitle">
            {profile?.display_name ?? user.email} · {profile?.role ?? 'viewer'}
          </p>
        </div>
        <form action={logout}>
          <button className="secondary-button" type="submit">退出登录</button>
        </form>
      </header>

      {error && <div className="alert error">题库读取失败：{error.message}</div>}

      <section className="metrics">
        <article><span>已读取题目</span><strong>{questions.length}</strong><small>latest 50</small></article>
        <article><span>待审核</span><strong>{pending}</strong><small>review queue</small></article>
        <article><span>已验证</span><strong>{verified}</strong><small>verified records</small></article>
        <article><span>当前权限</span><strong>{profile?.role ?? 'viewer'}</strong><small>RLS protected</small></article>
      </section>

      <section className="cloud-table-card">
        <div className="table-heading">
          <div>
            <p className="eyebrow">QUESTION BANK</p>
            <h2>云端题库</h2>
          </div>
          <span>{questions.length} records</span>
        </div>
        <div className="table-scroll">
          <table className="cloud-table">
            <thead>
              <tr><th>题目</th><th>科目 / 章节</th><th>来源</th><th>题型</th><th>分数</th><th>审核</th></tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id}>
                  <td><strong>{question.question_code ?? 'No code'}</strong><small>{question.topic}</small></td>
                  <td><strong>{question.subjects?.name ?? '—'}</strong><small>{question.chapters?.name ?? '未分类'}</small></td>
                  <td><strong>{question.sources?.title ?? '—'}</strong><small>{question.sources?.year ?? '—'} · {question.sources?.state ?? 'National'}</small></td>
                  <td>{question.question_type}</td>
                  <td>{question.marks}</td>
                  <td><span className={`review-pill ${question.review_status}`}>{question.review_status}</span></td>
                </tr>
              ))}
              {!questions.length && (
                <tr><td colSpan={6} className="empty-cell">数据库目前没有题目。先运行 seed.sql 或导入真实资料。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
