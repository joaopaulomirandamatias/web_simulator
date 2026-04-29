import { METHOD_PROFILES, type DimensionScores } from '@ahcf-cps/engine';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiExplainBox } from '../components/AiExplainBox.tsx';
import { ExplainPanel } from '../components/ExplainPanel.tsx';
import { MethodBars } from '../components/MethodBars.tsx';
import { ScoreRadar } from '../components/ScoreRadar.tsx';
import { useTranslations } from '../i18n/useI18n.ts';
import { downloadBlob, exportAsPdf, exportHistoryToCsv } from '../lib/exporters.ts';
import { useUiPrefsStore } from '../store/prefs.ts';
import { useSimulationStore } from '../store/simulation.ts';

export function Result() {
  const t = useTranslations();
  const { lastResult: result, operatorMode, toggleOperatorMode, history, inputs, context } =
    useSimulationStore();
  const explainEnabled = useUiPrefsStore((s) => s.explainEnabled);
  const aiTestModeEnabled = useUiPrefsStore((s) => s.aiTestModeEnabled);
  const [showExplain, setShowExplain] = useState(false);

  if (!result) {
    return (
      <div className="card text-center">
        <p className="text-slate-600">{t.result.empty}</p>
        <Link to="/simulate" className="btn-primary mt-4 inline-flex">
          {t.result.start}
        </Link>
      </div>
    );
  }

  const top = result.ranking[0]!;
  const topProfile = METHOD_PROFILES[top.method];
  const topThree = result.ranking.slice(0, 3);
  const dimKeys: (keyof DimensionScores)[] = [
    'safety',
    'ergonomic',
    'humanPreference',
    'performance',
    'taskComplexity',
  ];

  const handleCsv = () => {
    downloadBlob(exportHistoryToCsv(history), 'ahcf-cps-history.csv');
  };

  return (
    <div className="space-y-6">
      <section className="card border-l-4 border-industrial-accent">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {t.result.recommended}
            </p>
            <h1 className="text-3xl font-bold text-industrial-primary">
              {t.methods[top.method]}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">{topProfile.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">{t.result.adequacy}</div>
            <div className="text-5xl font-bold text-industrial-accent">
              {(top.normalized * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {operatorMode && (
          <div className="mt-4 rounded-xl2 bg-green-50 border border-green-300 p-4">
            <strong className="text-green-800 text-lg">{t.result.operatorHeadline}</strong>
            <p className="mt-1 text-green-900 text-xl font-semibold">{t.result.operatorSimple}</p>
          </div>
        )}

        {!operatorMode && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {topProfile.references.map((ref) => (
                <span key={ref} className="chip">
                  {ref}
                </span>
              ))}
            </div>
            {top.warnings.length > 0 && (
              <div className="mt-4 rounded-xl2 bg-amber-50 border border-amber-200 p-4 text-sm">
                <strong className="text-amber-800">{t.result.alerts}</strong>
                <ul className="mt-1 list-disc pl-5 text-amber-900">
                  {top.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {!operatorMode && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreRadar dimensions={result.dimensions} />
            <MethodBars ranking={result.ranking} />
          </div>

          <section className="card">
            <h2 className="text-xl font-semibold text-industrial-primary">{t.result.topThree}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {topThree.map((r, i) => {
                const profile = METHOD_PROFILES[r.method];
                return (
                  <article
                    key={r.method}
                    className="rounded-xl2 border border-slate-200 p-4 flex flex-col"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        #{i + 1}
                      </span>
                      <span className="text-industrial-accent font-bold">
                        {(r.normalized * 100).toFixed(0)}%
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-industrial-primary">
                      {t.methods[r.method]}
                    </h3>
                    <ul className="mt-3 space-y-1 text-sm text-slate-700">
                      {profile.pros.slice(0, 2).map((p) => (
                        <li key={p}>✓ {p}</li>
                      ))}
                      {profile.cons.slice(0, 1).map((c) => (
                        <li key={c} className="text-slate-500">
                          ! {c}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold text-industrial-primary">
              {t.result.justification}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {dimKeys.map((dim) => (
                <div key={dim} className="rounded-xl2 bg-slate-50 p-3 text-center">
                  <div className="text-xs uppercase text-slate-500">{t.dimensions[dim]}</div>
                  <div className="text-xl font-semibold text-industrial-primary">
                    {top.contributions[dim].toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                {t.result.engineLabel} {result.engineVersion} · {result.strategy}
              </span>
              <span>{new Date(result.computedAt).toLocaleString()}</span>
            </div>
          </section>
        </>
      )}

      <div className="flex flex-wrap justify-end gap-3 no-print">
        <button
          type="button"
          onClick={toggleOperatorMode}
          aria-pressed={operatorMode}
          className="btn-ghost"
        >
          {t.operatorMode.toggle}: {operatorMode ? t.operatorMode.on : t.operatorMode.off}
        </button>
        {explainEnabled && (
          <button
            type="button"
            onClick={() => setShowExplain((v) => !v)}
            aria-expanded={showExplain}
            aria-controls="explain-panel"
            className="btn-ghost"
          >
            🔍 {showExplain ? t.explain.close : t.explain.cta}
          </button>
        )}
        <button type="button" onClick={handleCsv} className="btn-ghost">
          {t.result.exportCsv}
        </button>
        <button type="button" onClick={exportAsPdf} className="btn-ghost">
          {t.result.exportPdf}
        </button>
        <Link to="/simulate" className="btn-ghost">
          {t.result.newSim}
        </Link>
        <Link to="/history" className="btn-primary">
          {t.result.openHistory}
        </Link>
      </div>

      {aiTestModeEnabled && !operatorMode && (
        <AiExplainBox result={result} inputs={inputs} context={context} />
      )}

      {explainEnabled && showExplain && (
        <div id="explain-panel" className="no-print">
          <ExplainPanel result={result} inputs={inputs} />
        </div>
      )}
    </div>
  );
}
