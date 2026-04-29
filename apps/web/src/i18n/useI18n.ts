import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LOCALES, TRANSLATIONS, type Locale, type Translations } from './translations.ts';

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const detectInitial = (): Locale => {
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('pt')) return 'pt-BR';
  }
  return 'en';
};

export const useLocaleStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: detectInitial(),
      setLocale: (locale) => {
        set({ locale });
        if (typeof document !== 'undefined') document.documentElement.lang = locale;
      },
    }),
    { name: 'ahcf-cps-locale' },
  ),
);

export function useTranslations(): Translations {
  const locale = useLocaleStore((s) => s.locale);
  return TRANSLATIONS[locale];
}

export function useLocale(): [Locale, (l: Locale) => void] {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return [locale, setLocale];
}

export { LOCALES };
export type { Locale };
