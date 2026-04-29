import clsx from 'clsx';
import { LOCALES, useLocale } from '../i18n/useI18n.ts';
import { useTranslations } from '../i18n/useI18n.ts';

const LABEL: Record<string, string> = { 'pt-BR': 'PT', en: 'EN' };

export function LocaleSwitch() {
  const [current, set] = useLocale();
  const t = useTranslations();
  return (
    <div
      role="group"
      aria-label={t.common.language}
      className="inline-flex rounded-xl2 bg-slate-800 p-1"
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => set(locale)}
          aria-pressed={current === locale}
          className={clsx(
            'px-3 py-1.5 text-xs font-semibold rounded-lg transition',
            current === locale
              ? 'bg-industrial-accent text-white'
              : 'text-slate-300 hover:text-white',
          )}
        >
          {LABEL[locale]}
        </button>
      ))}
    </div>
  );
}
