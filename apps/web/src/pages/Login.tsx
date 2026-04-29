import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../i18n/useI18n.ts';
import { useAuthStore, type Role } from '../store/auth.ts';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

type Mode = 'login' | 'register';

export function Login() {
  const t = useTranslations();
  const navigate = useNavigate();
  const { user, setSession, clear } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('OPERATOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return (
      <section className="card max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-industrial-primary">{t.login.signedInAs}</h1>
        <p className="mt-2 text-slate-600">
          <strong>{user.email}</strong> · {user.role}
        </p>
        <button
          type="button"
          className="btn-ghost mt-6"
          onClick={() => {
            clear();
            navigate('/');
          }}
        >
          {t.login.logoutCta}
        </button>
      </section>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError(t.login.emailInvalid);
      return;
    }
    if (password.length < 8) {
      setError(t.login.passwordTooShort);
      return;
    }
    if (!API_URL) {
      setError('VITE_API_URL not configured; login requires the API.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const payload =
        mode === 'register' ? { email, password, role } : { email, password };
      const response = await fetch(`${API_URL}/api/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        setError(t.login.invalidCredentials);
        return;
      }
      if (response.status === 409) {
        setError(t.login.emailTaken);
        return;
      }
      if (!response.ok) {
        setError(`HTTP ${response.status}`);
        return;
      }
      if (mode === 'register') {
        setMode('login');
        return;
      }
      const data = (await response.json()) as {
        token: string | null;
        user: { id: string; email: string; role: Role };
      };
      setSession({ user: data.user, token: data.token });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto space-y-4">
      <div className="card">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            aria-pressed={mode === 'login'}
            className={`flex-1 rounded-xl2 py-2 text-sm font-semibold border-2 ${
              mode === 'login'
                ? 'bg-industrial-accent border-industrial-accent text-white'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {t.login.title}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            aria-pressed={mode === 'register'}
            className={`flex-1 rounded-xl2 py-2 text-sm font-semibold border-2 ${
              mode === 'register'
                ? 'bg-industrial-accent border-industrial-accent text-white'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {t.login.registerTitle}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-industrial-primary">
          {mode === 'login' ? t.login.title : t.login.registerTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t.login.subtitle}</p>

        <form className="mt-4 space-y-3" onSubmit={submit} noValidate>
          <label className="block">
            <span className="text-sm text-slate-600">{t.login.emailLabel}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">{t.login.passwordLabel}</span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3"
            />
          </label>
          {mode === 'register' && (
            <label className="block">
              <span className="text-sm text-slate-600">{t.login.roleLabel}</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3 bg-white"
              >
                <option value="OPERATOR">{t.login.roleOperator}</option>
                <option value="MANAGER">{t.login.roleManager}</option>
                <option value="ADMIN">{t.login.roleAdmin}</option>
              </select>
            </label>
          )}
          {error && (
            <p role="alert" className="text-sm text-industrial-danger">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading
              ? t.inputs.calculating
              : mode === 'login'
                ? t.login.submit
                : t.login.registerSubmit}
          </button>
        </form>
      </div>
    </section>
  );
}
