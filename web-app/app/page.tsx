import Link from 'next/link';

const modules = [
  ['Question Bank', '标准化题目、来源、章节、技能与审核状态'],
  ['Trend Analytics', '年份衰减、章节覆盖、Trial 共识与技能频率'],
  ['Prediction Engine', '质量修正评分、证据、反对证据与置信度'],
  ['Teacher Workspace', '登录、云端读取、审核与权限保护'],
];

export default function HomePage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">NEXT.JS · SUPABASE AUTH</p>
          <h1>SPM Question Intelligence</h1>
          <p className="subtitle">
            新版全栈应用已经具备 Supabase Client、登录、Session Middleware、受保护教师后台和云端题库读取骨架。
          </p>
        </div>
        <span className={configured ? 'status ready' : 'status pending'}>
          {configured ? 'Supabase configured' : 'Waiting for Supabase keys'}
        </span>
      </header>

      <section className="metrics">
        <article><span>应用架构</span><strong>Next.js 15</strong><small>App Router + TypeScript</small></article>
        <article><span>身份验证</span><strong>Supabase Auth</strong><small>SSR session cookies</small></article>
        <article><span>权限保护</span><strong>Middleware</strong><small>/workspace protected</small></article>
        <article><span>当前 Sprint</span><strong>1.2 / 5</strong><small>Cloud connection layer</small></article>
      </section>

      <section className="module-grid">
        {modules.map(([title, text]) => (
          <article className="module-card" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <span>{title === 'Teacher Workspace' ? 'Cloud route ready' : 'Foundation ready'}</span>
          </article>
        ))}
      </section>

      <section className="next-step">
        <div>
          <p className="eyebrow">AVAILABLE ROUTES</p>
          <h2>登录与云端后台</h2>
          <p>配置 Supabase 环境变量后，注册账号并进入受保护的教师工作台。</p>
        </div>
        <div className="auth-actions">
          <Link className="primary-button" href="/login">登录</Link>
          <Link className="secondary-button" href="/workspace">教师后台</Link>
        </div>
      </section>
    </main>
  );
}
