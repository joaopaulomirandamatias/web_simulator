import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Preferências de UI — persistidas em localStorage.
 *
 * Flags:
 * - `explainEnabled`: mostra o botão "Ver cálculo" no resultado.
 * - `aiTestModeEnabled`: habilita os botões assistidos por IA
 *   (Explicar com IA, Sugerir estratégia, Gerar simulação de teste).
 *
 * Cada flag respeita um build flag (para a comunidade desligar em forks)
 * E uma preferência do usuário. O toggle final é a interseção dos dois.
 */
export interface UiPrefs {
  explainEnabled: boolean;
  aiTestModeEnabled: boolean;
  setExplainEnabled: (value: boolean) => void;
  setAiTestModeEnabled: (value: boolean) => void;
}

const explainBuildFlag =
  (import.meta.env.VITE_EXPLAIN_ENABLED ?? 'true').toLowerCase() !== 'false';

const aiBuildFlag =
  (import.meta.env.VITE_AI_ENABLED ?? 'true').toLowerCase() !== 'false';

export const useUiPrefsStore = create<UiPrefs>()(
  persist(
    (set) => ({
      explainEnabled: explainBuildFlag,
      aiTestModeEnabled: false, // por segurança — default OFF
      setExplainEnabled: (value) => set({ explainEnabled: explainBuildFlag && value }),
      setAiTestModeEnabled: (value) =>
        set({ aiTestModeEnabled: aiBuildFlag && value }),
    }),
    { name: 'ahcf-cps-prefs' },
  ),
);

export const EXPLAIN_BUILD_FLAG = explainBuildFlag;
export const AI_BUILD_FLAG = aiBuildFlag;
