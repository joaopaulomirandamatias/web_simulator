import { runSimulation, type SimulationResult } from '@ahcf-cps/engine';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocaleStore, useTranslations } from '../i18n/useI18n.ts';
import { aiGenerateSimulation, type GeneratedSimulation } from '../lib/ai.ts';
import { useUiPrefsStore } from '../store/prefs.ts';
import { useSimulationStore } from '../store/simulation.ts';

interface Row {
  sim: GeneratedSimulation;
  result?: SimulationResult;
}

function buildHistoryNote(sim: GeneratedSimulation, locale: 'pt-BR' | 'en'): string {
  const base =
    locale === 'en' ? 'Analysis example (AI test — realistic inputs)' : 'Exemplo para análise (teste com IA — entradas realistas)';
  return sim.label ? `${base} — ${sim.label}` : base;
}

export function AiTest() {
  const t = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const navigate = useNavigate();
  const aiEnabled = useUiPrefsStore((s) => s.aiTestModeEnabled);
  const { strategy, setContext, setInput, setResult, saveEntry } = useSimulationStore();

  const [count, setCount] = useState(3);
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [savedBatch, setSavedBatch] = useState(false);

  if (!aiEnabled) {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold text-industrial-primary">
          {t.ai.testPageTitle}
        </h1>
        <p className="mt-2 text-slate-600">{t.ai.unavailable}</p>
        <Link to="/" className="btn-ghost mt-4 inline-flex">
          {t.nav.home}
        </Link>
      </div>
    );
  }

  const runEngineOnSims = (sims: GeneratedSimulation[], saveToHistory: boolean): Row[] => {
    return sims.map((sim) => {
      const result = runSimulation(sim.inputs, {
        strategy,
        sector: sim.context?.sector,
      });
      if (saveToHistory) {
        saveEntry({
          id: crypto.randomUUID(),
          inputs: sim.inputs,
          context: sim.context ?? {},
          result,
          createdAt: new Date().toISOString(),
          note: buildHistoryNote(sim, locale),
        });
      }
      return { sim, result };
    });
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSavedBatch(false);
    try {
      const response = await aiGenerateSimulation({
        count,
        scenario: scenario.trim() || undefined,
        locale,
      });
      const withResults = runEngineOnSims(response.simulations, true);
      setRows(withResults);
      if (withResults.length > 0) {
        setSavedBatch(true);
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'AI_DISABLED') setError(t.common.aiDisabled);
      else if (msg === 'AI_NEEDS_API') setError(t.common.aiNeedsApi);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const recalcOnly = () => {
    if (rows.length === 0) return;
    setRecalcLoading(true);
    const withResults = runEngineOnSims(
      rows.map((r) => r.sim),
      false,
    );
    setRows(withResults);
    setRecalcLoading(false);
  };

  const applyToForm = (sim: GeneratedSimulation) => {
    if (sim.context) setContext(sim.context);
    (Object.entries(sim.inputs) as [keyof typeof sim.inputs, number][]).forEach(
      ([key, value]) => setInput(key, value as never),
    );
    navigate('/simulate');
  };

  const openResult = (result: SimulationResult) => {
    setResult(result);
    navigate('/result');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-industrial-primary">
          {t.ai.testPageTitle}
        </h1>
        <p className="text-sm text-slate-500">{t.ai.testPageSubtitle}</p>
      </header>

      <section className="card">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-slate-600">{t.ai.testCount}</span>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm text-slate-600">{t.ai.testScenario}</span>
            <input
              type="text"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder={t.ai.testScenarioPlaceholder}
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? t.ai.testGenerating : t.ai.testGenerate}
          </button>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={recalcOnly}
              disabled={recalcLoading}
              className="btn-ghost"
              title={t.ai.testRecalcOnly}
            >
              {recalcLoading ? t.ai.testRunning : t.ai.testRunBatch}
            </button>
          )}
          <Link to="/history" className="text-sm text-industrial-accent hover:underline">
            {t.nav.history} →
          </Link>
        </div>
        {savedBatch && !error && (
          <p className="mt-3 text-sm text-slate-600" role="status">
            {t.ai.testHintSaved}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-industrial-danger">
            {error}
          </p>
        )}
      </section>

      {rows.length === 0 ? (
        <p className="card text-sm text-slate-500">{t.ai.testEmpty}</p>
      ) : (
        <div className="card p-0 divide-y divide-slate-200">
          {rows.map(({ sim, result }, i) => (
            <article key={i} className="p-4 flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[240px]">
                <div className="text-xs uppercase text-slate-500">#{i + 1}</div>
                <div className="font-semibold text-industrial-primary">
                  {sim.label ?? '—'}
                </div>
                <div className="mt-1 text-xs text-slate-500 font-mono break-all">
                  {sim.context?.sector
                    ? `${t.sectors[sim.context.sector]} · `
                    : ''}
                  {Object.entries(sim.inputs)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(' · ')}
                </div>
                {result && (
                  <div className="mt-2 text-sm">
                    → <strong>{t.methods[result.recommended]}</strong> (
                    {(result.ranking[0]!.normalized * 100).toFixed(0)}%, {result.strategy})
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost text-sm px-3 py-2"
                  onClick={() => applyToForm(sim)}
                >
                  {t.ai.testApplyToInputs}
                </button>
                {result && (
                  <button
                    type="button"
                    className="btn-primary text-sm px-3 py-2"
                    onClick={() => openResult(result)}
                  >
                    {t.history.open}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
