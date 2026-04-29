import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LocaleSwitch } from './components/LocaleSwitch.tsx';
import { SettingsDrawer } from './components/SettingsDrawer.tsx';
import { useLocaleStore, useTranslations } from './i18n/useI18n.ts';
import { useAuthStore } from './store/auth.ts';
import { useUiPrefsStore } from './store/prefs.ts';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-xl2 text-sm font-medium transition ${
    isActive
      ? 'bg-white text-industrial-primary shadow-industrial'
      : 'text-slate-200 hover:bg-slate-800'
  }`;

export function App() {
  const t = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const aiTestModeEnabled = useUiPrefsStore((s) => s.aiTestModeEnabled);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="min-h-full flex flex-col">
      <a href="#main" className="skip-link">
        {t.skipToContent}
      </a>
      <header className="bg-industrial-primary text-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label={t.appName}>
            <img
              src="/logo.png"
              alt=""
              role="presentation"
              className="h-12 w-12 rounded-xl2 bg-white/5 object-contain p-1"
            />
            <div>
              <div className="text-lg font-semibold leading-none">{t.appName}</div>
              <div className="text-xs text-slate-300">{t.tagline}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2" aria-label="main">
              <NavLink to="/" end className={navClass}>
                {t.nav.home}
              </NavLink>
              <NavLink to="/simulate" className={navClass}>
                {t.nav.newSimulation}
              </NavLink>
              <NavLink to="/dashboard" className={navClass}>
                {t.nav.dashboard}
              </NavLink>
              <NavLink to="/history" className={navClass}>
                {t.nav.history}
              </NavLink>
              {aiTestModeEnabled && (
                <NavLink to="/ai-test" className={navClass}>
                  🧠 {t.nav.aiTest}
                </NavLink>
              )}
              <NavLink to="/login" className={navClass}>
                {user ? user.email.split('@')[0] : t.nav.login}
              </NavLink>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label={t.nav.settings}
                className="px-3 py-2 rounded-xl2 text-slate-200 hover:bg-slate-800"
                title={t.nav.settings}
              >
                ⚙
              </button>
            </nav>
            <LocaleSwitch />
          </div>
        </div>
      </header>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <main id="main" tabIndex={-1} className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-slate-500 flex justify-between gap-4">
          <span>{t.footer}</span>
          <span>{t.slogan}</span>
        </div>
      </footer>
    </div>
  );
}
