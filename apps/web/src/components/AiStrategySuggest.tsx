import type { StrategyId } from '@ahcf-cps/engine';
import { useState } from 'react';
import { useLocaleStore, useTranslations } from '../i18n/useI18n.ts';
import { aiSuggestStrategy } from '../lib/ai.ts';
import type { Context } from '../store/simulation.ts';

interface Props {
  context: Context;
  onApply: (strategy: StrategyId) => void;
}

export function AiStrategySuggest({ context, onApply }: Props) {
  const t = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    suggested: StrategyId;
    rationale: string;
    model: string;
  } | null>(null);

  const call = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiSuggestStrategy({ context, notes, locale });
      setSuggestion(response);
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
    <div className="mt-4 rounded-xl2 border border-indigo-200 bg-indigo-50/40 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-700">
        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-white text-[10px]">
          {t.ai.badge}
        </span>
        {t.ai.suggestCta}
      </div>
      <label className="mt-3 block text-sm text-slate-600">
        {t.ai.suggestPromptLabel}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.ai.suggestNotesPlaceholder}
          rows={2}
          className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-2 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={call}
        disabled={loading}
        className="btn-ghost mt-3 text-sm px-4 py-2"
      >
        {loading ? t.common.aiThinking : t.ai.suggestCta}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-industrial-danger">
          {error}
        </p>
      )}
      {suggestion && (
        <div className="mt-3 rounded-xl2 bg-white border border-slate-200 p-3">
          <div className="text-xs uppercase text-slate-500">{t.ai.suggestResultTitle}</div>
          <div className="mt-1 text-lg font-semibold text-industrial-primary">
            {t.strategy[suggestion.suggested]}
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            {suggestion.rationale}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            {suggestion.model} · {t.ai.poweredBy}
          </div>
          <button
            type="button"
            className="btn-primary mt-3 text-sm px-4 py-2"
            onClick={() => onApply(suggestion.suggested)}
          >
            {t.ai.suggestApply}
          </button>
        </div>
      )}
    </div>
  );
}
