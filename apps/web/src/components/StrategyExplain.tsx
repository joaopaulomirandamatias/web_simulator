import type { StrategyId } from '@ahcf-cps/engine';
import { useTranslations } from '../i18n/useI18n.ts';

interface Props {
  strategy: StrategyId;
}

/**
 * Painel estático que explica a estratégia selecionada no momento —
 * resumo, quando usar, pontos fortes e pontos de atenção.
 *
 * Conteúdo vem de `t.strategy.descriptions[...]` (pt-BR / en).
 */
export function StrategyExplain({ strategy }: Props) {
  const t = useTranslations();
  const meta = t.strategy.descriptions[strategy];
  return (
    <section
      className="mt-4 rounded-xl2 border border-slate-200 bg-slate-50/60 p-4"
      aria-live="polite"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t.strategy.sectionTitle} · {t.strategy[strategy]}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{meta.summary}</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase text-industrial-accent">
            {t.strategy.useWhenLabel}
          </dt>
          <dd className="mt-1 text-xs leading-relaxed text-slate-700">{meta.useWhen}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-industrial-success">
            {t.strategy.prosLabel}
          </dt>
          <dd className="mt-1 text-xs leading-relaxed text-slate-700">{meta.pros}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-industrial-warning">
            {t.strategy.consLabel}
          </dt>
          <dd className="mt-1 text-xs leading-relaxed text-slate-700">{meta.cons}</dd>
        </div>
      </dl>
    </section>
  );
}
