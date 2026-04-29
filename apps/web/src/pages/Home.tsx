import { Link } from 'react-router-dom';
import { useTranslations } from '../i18n/useI18n.ts';

export function Home() {
  const t = useTranslations();
  const dims = t.home.dimensions;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="card">
        <h1 className="text-3xl font-bold text-industrial-primary">{t.home.heroTitle}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">{t.home.heroBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/simulate" className="btn-primary">
            {t.home.ctaNew}
          </Link>
          <Link to="/history" className="btn-ghost">
            {t.home.ctaHistory}
          </Link>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-industrial-primary">
          {t.home.dimensionsTitle}
        </h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          {(
            [
              ['safety', dims.safety],
              ['ergonomic', dims.ergonomic],
              ['humanPreference', dims.humanPreference],
              ['performance', dims.performance],
              ['taskComplexity', dims.taskComplexity],
            ] as const
          ).map(([key, { title, desc }]) => (
            <li key={key} className="flex gap-3">
              <span className="mt-2 h-2 w-2 flex-none rounded-full bg-industrial-accent" />
              <span>
                <strong className="text-industrial-primary">{title}</strong>
                <span className="block text-sm text-slate-500">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
