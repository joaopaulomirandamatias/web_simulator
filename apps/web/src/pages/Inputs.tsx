import { SECTOR_IDS, type SimulationInputs, type SectorId } from '@ahcf-cps/engine';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AiStrategySuggest } from '../components/AiStrategySuggest.tsx';
import { LikertSlider } from '../components/LikertSlider.tsx';
import { StrategyExplain } from '../components/StrategyExplain.tsx';
import { useTranslations } from '../i18n/useI18n.ts';
import { calculateSimulation } from '../lib/api.ts';
import { useSimulationStore } from '../store/simulation.ts';
import { useUiPrefsStore } from '../store/prefs.ts';

const INPUT_ORDER: (keyof SimulationInputs)[] = [
  'taskComplexity',
  'variability',
  'operatorExperience',
  'safetyRequired',
  'ergonomicLoad',
  'resourcesAvailable',
  'productivityGoal',
  'costConstraint',
  'leadershipPreference',
  'transparencyNeed',
];

export function InputsPage() {
  const t = useTranslations();
  const navigate = useNavigate();
  const {
    context,
    inputs,
    strategy,
    setContext,
    setInput,
    setStrategy,
    setResult,
    saveEntry,
  } = useSimulationStore();

  const explainEnabled = useUiPrefsStore((s) => s.explainEnabled);
  const aiTestModeEnabled = useUiPrefsStore((s) => s.aiTestModeEnabled);

  const mutation = useMutation({
    mutationFn: () =>
      calculateSimulation({ inputs, context, strategy, trace: explainEnabled }),
    onSuccess: (entry) => {
      setResult(entry.result);
      saveEntry(entry);
      navigate('/result');
    },
  });

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <section className="card">
        <h2 className="text-xl font-semibold text-industrial-primary">
          {t.inputs.contextTitle}
        </h2>
        <p className="text-sm text-slate-500">{t.inputs.contextHint}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-slate-600">{t.inputs.sectorLabel}</span>
            <select
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3 bg-white"
              value={context.sector ?? ''}
              onChange={(e) =>
                setContext({ sector: (e.target.value || undefined) as SectorId | undefined })
              }
            >
              <option value="">—</option>
              {SECTOR_IDS.map((id) => (
                <option key={id} value={id}>
                  {t.sectors[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">{t.inputs.placeholders.process}</span>
            <input
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3"
              value={context.process ?? ''}
              onChange={(e) => setContext({ process: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">{t.inputs.placeholders.cobotModel}</span>
            <input
              className="mt-1 w-full rounded-xl2 border border-slate-200 px-4 py-3"
              value={context.cobotModel ?? ''}
              onChange={(e) => setContext({ cobotModel: e.target.value })}
            />
          </label>
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm text-slate-600 mb-2">{t.strategy.label}</legend>
          <div className="flex flex-wrap gap-2">
            {(['linear', 'ahp', 'topsis'] as const).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={strategy === id}
                onClick={() => setStrategy(id)}
                className={`rounded-xl2 px-4 py-2 text-sm font-medium border-2 ${
                  strategy === id
                    ? 'bg-industrial-accent border-industrial-accent text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-industrial-accent'
                }`}
              >
                {t.strategy[id]}
              </button>
            ))}
          </div>
        </fieldset>
        <StrategyExplain strategy={strategy} />
        {aiTestModeEnabled && (
          <AiStrategySuggest context={context} onApply={(id) => setStrategy(id)} />
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-primary mb-4">
          {t.inputs.dimensionsTitle}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {INPUT_ORDER.map((key) => (
            <LikertSlider
              key={key}
              inputKey={key}
              value={inputs[key]}
              onChange={(v) => setInput(key, v as SimulationInputs[typeof key])}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
          {t.inputs.back}
        </button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? t.inputs.calculating : t.inputs.calculate}
        </button>
      </div>

      {mutation.isError && (
        <div className="card border-industrial-danger text-industrial-danger">
          {t.inputs.error} {(mutation.error as Error).message}
        </div>
      )}
    </form>
  );
}
