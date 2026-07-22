const modules = [
  ["Question Bank", "标准化题目、来源、章节、技能与审核状态"],
  ["Trend Analytics", "年份衰减、章节覆盖、Trial 共识与技能频率"],
  ["Prediction Engine", "质量修正评分、证据、反对证据与置信度"],
  ["Teacher Workspace", "新增、审核、标记高价值题及重复题处理"],
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
          <p className="eyebrow">NEXT.JS · SUPABASE READY</p>
          <h1>SPM Question Intelligence</h1>
          <p className="subtitle">
            新版全栈应用骨架已经建立。现有 GitHub Pages 版本继续运行，数据库版会在此目录逐步接管登录、题库、审核与预测。
          </p>
        </div>
        <span className={configured ? "status ready" : "status pending"}>
          {configured ? "Supabase configured" : "Waiting for Supabase keys"}
        </span>
      </header>

      <section className="metrics">
        <article><span>应用架构</span><strong>Next.js 15</strong><small>App Router + TypeScript</small></article>
        <article><span>数据库</span><strong>Supabase</strong><small>PostgreSQL + Auth + RLS</small></article>
        <article><span>迁移策略</span><strong>Parallel</strong><small>不破坏当前静态网站</small></article>
        <article><span>当前 Sprint</span><strong>1 / 5</strong><small>Full-stack foundation</small></article>
      </section>

      <section className="module-grid">
        {modules.map(([title, text]) => (
          <article className="module-card" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <span>Foundation ready</span>
          </article>
        ))}
      </section>

      <section className="next-step">
        <div>
          <p className="eyebrow">NEXT IMPLEMENTATION</p>
          <h2>Supabase connection layer</h2>
          <p>下一步将加入浏览器与服务器端 Supabase Client、登录页面、Session Middleware，以及数据库题目读取。</p>
        </div>
        <code>web-app/.env.local</code>
      </section>
    </main>
  );
}
