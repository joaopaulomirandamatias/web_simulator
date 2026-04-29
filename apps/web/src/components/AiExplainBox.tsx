import type { SimulationInputs, SimulationResult } from '@ahcf-cps/engine';
import { useState } from 'react';
import { useLocaleStore, useTranslations } from '../i18n/useI18n.ts';
import { aiExplain } from '../lib/ai.ts';
import type { Context } from '../store/simulation.ts';

interface Props {
  result: SimulationResult;
  inputs: SimulationInputs;
  context: Context;
}

export function AiExplainBox({ result, inputs, context }: Props) {
  const t = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const call = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiExplain({ inputs, context, result, locale });
      setText(response.explanation);
      setModel(response.model);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'AI_DISABLED') setError(t.common.aiDisabled);
      else if (msg === 'AI_NEEDS_API') setError(t.common.aiNeedsApi);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card border-l-4 border-indigo-400 bg-indigo-50/40">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-indigo-700">
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-white text-[10px]">
              {t.ai.badge}
            </span>
            {t.ai.explainCta}
          </div>
          {model && (
            <div className="mt-1 text-xs text-slate-500">
              {model} · {t.ai.poweredBy}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={call}
          disabled={loading}
          className="btn-ghost text-sm px-4 py-2 disabled:opacity-60"
        >
          {loading ? t.common.aiThinking : text ? t.common.retry : t.ai.explainCta}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-industrial-danger">
          {error}
        </p>
      )}
      {text && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {text}
        </p>
      )}
    </section>
  );
}
