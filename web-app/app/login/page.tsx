import { login, signUp } from './actions';

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
};

const errorText: Record<string, string> = {
  missing: '请输入电邮和密码。',
  invalid: '电邮或密码不正确。',
  signup: '注册失败。密码至少需要 8 个字符。',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">TEACHER ACCESS</p>
        <h1>教师后台登录</h1>
        <p className="subtitle">
          登录后才能进入云端题库、审核队列和预测管理。新账号默认是 Viewer，需要管理员提升权限。
        </p>

        {!configured && (
          <div className="alert warning">
            Supabase 尚未配置。请先填写 web-app/.env.local。
          </div>
        )}
        {params.error && <div className="alert error">{errorText[params.error] ?? '操作失败。'}</div>}
        {params.message === 'check-email' && (
          <div className="alert success">注册成功，请检查电邮确认账号。</div>
        )}

        <form className="auth-form">
          <input type="hidden" name="next" value={params.next ?? '/workspace'} />
          <label>
            电邮
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            密码
            <input name="password" type="password" autoComplete="current-password" minLength={8} required />
          </label>
          <div className="auth-actions">
            <button formAction={login} className="primary-button" disabled={!configured}>
              登录
            </button>
            <button formAction={signUp} className="secondary-button" disabled={!configured}>
              注册账号
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
