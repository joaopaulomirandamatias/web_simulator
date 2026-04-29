import type {
  AhpTrace,
  DimensionScores,
  LinearTrace,
  ProgrammingMethod,
  SimulationInputs,
  SimulationResult,
  StrategyTrace,
  TopsisTrace,
} from '@ahcf-cps/engine';
import { useTranslations } from '../i18n/useI18n.ts';
import {
  Const,
  FormulaBox,
  FormulaLegend,
  Op,
  Sigma,
  Sub,
  Sup,
  Var,
} from './FormulaBox.tsx';

const DIM_KEYS: (keyof DimensionScores)[] = [
  'safety',
  'ergonomic',
  'humanPreference',
  'performance',
  'taskComplexity',
];

const fmt = (n: number | undefined, digits = 3) =>
  typeof n === 'number' && Number.isFinite(n) ? n.toFixed(digits) : '—';

interface Props {
  result: SimulationResult;
  inputs: SimulationInputs;
}

export function ExplainPanel({ result, inputs }: Props) {
  const t = useTranslations();
  const trace = result.trace;

  if (!trace) {
    return (
      <div className="card border-amber-300 bg-amber-50 text-amber-900">
        {t.explain.toggleOff}
      </div>
    );
  }

  return (
    <article className="space-y-6" aria-label={t.explain.title}>
      <header className="card border-l-4 border-industrial-accent">
        <h2 className="text-xl font-bold text-industrial-primary">{t.explain.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.explain.disclaimer}</p>
        <p className="mt-3 text-xs text-slate-500">
          Engine {result.engineVersion} · {result.strategy} ·{' '}
          {new Date(result.computedAt).toLocaleString()}
        </p>
      </header>

      <InputsSection inputs={inputs} />
      <DimensionsSection dimensions={result.dimensions} />
      <StrategySection trace={trace} />
      {trace.kind === 'linear' && <RulesSection trace={trace} />}
      <ResultSection result={result} trace={trace} />
    </article>
  );
}

function InputsSection({ inputs }: { inputs: SimulationInputs }) {
  const t = useTranslations();
  const entries = Object.entries(inputs) as [keyof SimulationInputs, number][];
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.explain.sectionInputs}
      </h3>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-xl2 bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-500">{t.inputs.copy[key]?.label ?? key}</div>
            <div className="text-lg font-semibold text-industrial-primary">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DimensionsSection({ dimensions }: { dimensions: DimensionScores }) {
  const t = useTranslations();
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.explain.sectionDimensions}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{t.explain.dimensionFormula}</p>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        {DIM_KEYS.map((dim) => (
          <div key={dim} className="rounded-xl2 bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-500">{t.dimensions[dim]}</div>
            <div className="text-lg font-semibold text-industrial-primary">
              {fmt(dimensions[dim])}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StrategySection({ trace }: { trace: StrategyTrace }) {
  if (trace.kind === 'linear') return <LinearSection trace={trace} />;
  if (trace.kind === 'ahp') return <AhpSection trace={trace} />;
  return <TopsisSection trace={trace} />;
}

function DimensionRow({
  label,
  values,
}: {
  label: string;
  values: Record<string, number>;
}) {
  return (
    <tr>
      <th scope="row" className="text-left py-1 pr-4 text-slate-500">
        {label}
      </th>
      {DIM_KEYS.map((dim) => (
        <td key={dim} className="py-1 pr-2 font-mono text-xs">
          {fmt(values[dim])}
        </td>
      ))}
    </tr>
  );
}

function MethodLabel({ method }: { method: ProgrammingMethod }) {
  const t = useTranslations();
  return <>{t.methods[method]}</>;
}

function RevisionList() {
  const t = useTranslations();
  const rev = t.explain.revisions;
  return (
    <aside
      role="note"
      className="mt-3 rounded-xl2 border border-amber-300 bg-amber-50 p-4"
    >
      <header className="flex items-start justify-between gap-2 flex-wrap">
        <h4 className="text-sm font-bold text-amber-900">
          ⚠ {t.explain.revisionsTitle}
        </h4>
      </header>
      <p className="mt-1 text-xs text-amber-900 leading-relaxed">
        {t.explain.revisionsIntro}
      </p>
      <ol className="mt-3 space-y-2 text-xs text-amber-950 leading-relaxed">
        {(['r1', 'r2', 'r3', 'r4', 'r5'] as const).map((id) => (
          <li key={id} className="flex gap-2">
            <span className="font-mono font-bold">·</span>
            <span>{rev[id]}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function ArticleFormula() {
  return (
    <>
      <Var>A</Var>
      <Sub>j</Sub>
      <Op>=</Op>
      <Sigma from={<>i=1</>} to={<>5</>} />
      <Var>α</Var>
      <Sub>i</Sub>
      <Var>X</Var>
      <Sub>i</Sub>
      <Op>+</Op>
      <Sigma from={<>k=1</>} to={<>m</>} />
      <Var>β</Var>
      <Sub>k</Sub>
      <Var>H</Var>
      <Sub>k</Sub>
      <Op>;</Op>
      <Var>m</Var>
      <Sup>*</Sup>
      <Op>=</Op>
      <Const>arg&nbsp;max</Const>
      <Sub>j</Sub>
      <Op>(</Op>
      <Var>A</Var>
      <Sub>j</Sub>
      <Op>)</Op>
    </>
  );
}

function LinearSection({ trace }: { trace: LinearTrace }) {
  const t = useTranslations();
  const legend = t.explain.formulaLegend;
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.explain.sectionStrategy}
      </h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <FormulaBox
          title={t.explain.formulaArticleTitle}
          caption={t.explain.formulaArticleCaption}
        >
          <ArticleFormula />
        </FormulaBox>
        <FormulaBox
          title={t.explain.formulaSpecializedTitle}
          caption={t.explain.formulaLinearCaption}
        >
          <Var>Score</Var>
          <Sub>j</Sub>
          <Op>=</Op>
          <Sigma from={<>d</>} />
          <Var>w</Var>
          <Sub>d</Sub>
          <Op>·</Op>
          <Var>a</Var>
          <Sub>j,d</Sub>
          <Op>·</Op>
          <Var>dim</Var>
          <Sub>d</Sub>
          <Op>−</Op>
          <Var>γ</Var>
          <Op>·</Op>
          <Var>cost</Var>
          <Sub>j</Sub>
          <Op>·</Op>
          <Const>norm</Const>
          <Op>(</Op>
          <Var>cost</Var>
          <Op>)</Op>
        </FormulaBox>
      </div>
      <RevisionList />
      <FormulaLegend
        items={[
          { term: <><Var>A</Var><Sub>j</Sub></>, description: legend.aj },
          { term: <><Var>X</Var><Sub>i</Sub></>, description: legend.xi },
          { term: <><Var>H</Var><Sub>k</Sub></>, description: legend.hk },
          { term: <><Var>α</Var><Sub>i</Sub><Op>,</Op><Var>β</Var><Sub>k</Sub></>, description: legend.alphaBeta },
          { term: <><Var>w</Var><Sub>d</Sub></>, description: legend.wd },
          { term: <><Var>a</Var><Sub>j,d</Sub></>, description: legend.ajd },
          { term: <><Var>dim</Var><Sub>d</Sub></>, description: legend.dimd },
          { term: <><Var>γ</Var></>, description: legend.gamma },
          { term: <><Var>cost</Var><Sub>j</Sub></>, description: legend.costFactor },
          { term: <><Const>norm</Const><Op>(</Op><Var>cost</Var><Op>)</Op></>, description: legend.normCost },
          { term: <><Var>m</Var><Sup>*</Sup></>, description: legend.mStar },
        ]}
      />
      <p className="mt-2 text-xs text-industrial-warning">{t.explain.costNote}</p>
      <div className="mt-4 rounded-xl2 bg-slate-50 p-3">
        <div className="text-xs uppercase text-slate-500">{t.explain.weights}</div>
        <div className="mt-1 grid grid-cols-2 md:grid-cols-6 gap-2 text-sm font-mono">
          {Object.entries(trace.weights).map(([k, v]) => (
            <span key={k}>
              {k}: {fmt(v, 2)}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2 pr-4">{t.explain.method}</th>
              <th className="py-2 pr-4">{t.explain.rawSum}</th>
              <th className="py-2 pr-4">{t.explain.costPenalty}</th>
              <th className="py-2 pr-4">{t.explain.preRuleScore}</th>
              <th className="py-2 pr-4">{t.explain.finalScore}</th>
              <th className="py-2 pr-4">{t.explain.normalized}</th>
            </tr>
          </thead>
          <tbody>
            {trace.steps.map((step) => (
              <tr key={step.method} className="border-t border-slate-200">
                <td className="py-1.5 pr-4 font-medium text-industrial-primary">
                  <MethodLabel method={step.method} />
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.rawSum)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">−{fmt(step.costPenalty)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.preRuleScore)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.finalScore)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">
                  {(step.normalized * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AhpSection({ trace }: { trace: AhpTrace }) {
  const t = useTranslations();
  const legend = t.explain.formulaLegend;
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.explain.sectionStrategy}
      </h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <FormulaBox
          title={t.explain.formulaArticleTitle}
          caption={t.explain.formulaArticleCaption}
        >
          <ArticleFormula />
        </FormulaBox>
        <FormulaBox
          title={t.explain.formulaSpecializedTitle}
          caption={t.explain.formulaAhpCaption}
        >
          <Var>Score</Var>
          <Sub>j</Sub>
          <Op>=</Op>
          <Sigma from={<>d</>} />
          <Var>priority</Var>
          <Sub>d</Sub>
          <Op>·</Op>
          <Var>a</Var>
          <Sub>j,d</Sub>
          <Op>·</Op>
          <Var>dim</Var>
          <Sub>d</Sub>
          <Op>−</Op>
          <Var>γ</Var>
          <Op>·</Op>
          <Var>cost</Var>
          <Sub>j</Sub>
          <Op>·</Op>
          <Const>norm</Const>
          <Op>(</Op>
          <Var>cost</Var>
          <Op>)</Op>
        </FormulaBox>
      </div>
      <RevisionList />
      <FormulaLegend
        items={[
          { term: <><Var>A</Var><Sub>j</Sub></>, description: legend.aj },
          { term: <><Var>priority</Var><Sub>d</Sub></>, description: legend.priority },
          { term: <><Var>a</Var><Sub>j,d</Sub></>, description: legend.ajd },
          { term: <><Var>dim</Var><Sub>d</Sub></>, description: legend.dimd },
          { term: <><Var>γ</Var></>, description: legend.gamma },
          { term: <><Var>cost</Var><Sub>j</Sub></>, description: legend.costFactor },
          { term: <><Var>m</Var><Sup>*</Sup></>, description: legend.mStar },
        ]}
      />
      <p className="mt-2 text-xs text-industrial-warning">{t.explain.costNote}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl2 bg-slate-50 p-3">
          <div className="text-xs uppercase text-slate-500">{t.explain.priorities}</div>
          <ul className="mt-1 space-y-1 text-sm font-mono">
            {DIM_KEYS.map((d) => (
              <li key={d} className="flex justify-between">
                <span>{t.dimensions[d]}</span>
                <span>{fmt(trace.priorities[d], 4)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl2 bg-slate-50 p-3">
          <div className="text-xs uppercase text-slate-500">{t.explain.consistencyRatio}</div>
          <div className="mt-1 font-mono text-lg text-industrial-primary">
            {fmt(trace.consistencyRatio, 4)} {trace.consistencyRatio <= 0.1 ? '✓' : '⚠'}
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2 pr-4">{t.explain.method}</th>
              <th className="py-2 pr-4">{t.explain.rawSum}</th>
              <th className="py-2 pr-4">{t.explain.costPenalty}</th>
              <th className="py-2 pr-4">{t.explain.finalScore}</th>
              <th className="py-2 pr-4">{t.explain.normalized}</th>
            </tr>
          </thead>
          <tbody>
            {trace.steps.map((step) => (
              <tr key={step.method} className="border-t border-slate-200">
                <td className="py-1.5 pr-4 font-medium text-industrial-primary">
                  <MethodLabel method={step.method} />
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.rawSum)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">−{fmt(step.costPenalty)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.finalScore)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">
                  {(step.normalized * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TopsisSection({ trace }: { trace: TopsisTrace }) {
  const t = useTranslations();
  const legend = t.explain.formulaLegend;
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.explain.sectionStrategy}
      </h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <FormulaBox
          title={t.explain.formulaArticleTitle}
          caption={t.explain.formulaArticleCaption}
        >
          <ArticleFormula />
        </FormulaBox>
        <FormulaBox
          title={t.explain.formulaSpecializedTitle}
          caption={t.explain.formulaTopsisCaption}
        >
          <Var>C</Var>
          <Sub>j</Sub>
          <Op>=</Op>
          <span className="inline-flex flex-col items-center leading-tight">
            <span>
              <Var>S</Var>
              <Sub>j</Sub>
              <Sup>−</Sup>
            </span>
            <span className="w-full border-t border-slate-500"></span>
            <span>
              <Var>S</Var>
              <Sub>j</Sub>
              <Sup>+</Sup>
              <Op>+</Op>
              <Var>S</Var>
              <Sub>j</Sub>
              <Sup>−</Sup>
            </span>
          </span>
          <Op>;</Op>
          <Var>m</Var>
          <Sup>*</Sup>
          <Op>=</Op>
          <Const>arg&nbsp;max</Const>
          <Sub>j</Sub>
          <Op>(</Op>
          <Var>C</Var>
          <Sub>j</Sub>
          <Op>)</Op>
        </FormulaBox>
      </div>
      <RevisionList />
      <FormulaLegend
        items={[
          { term: <><Var>D</Var></>, description: legend.aj },
          { term: <><Var>R</Var></>, description: 'D / ‖D‖ por coluna' },
          { term: <><Var>V</Var></>, description: 'w · R' },
          { term: <><Var>A</Var><Sup>+</Sup><Op>,</Op><Var>A</Var><Sup>−</Sup></>, description: 'max / min por dimensão sobre V' },
          { term: <><Var>S</Var><Sub>j</Sub><Sup>+</Sup></>, description: '‖V_j − A⁺‖ (euclidiana)' },
          { term: <><Var>S</Var><Sub>j</Sub><Sup>−</Sup></>, description: '‖V_j − A⁻‖ (euclidiana)' },
          { term: <><Var>C</Var><Sub>j</Sub></>, description: legend.cj },
          { term: <><Var>m</Var><Sup>*</Sup></>, description: legend.mStar },
        ]}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MiniDimCard label={t.explain.columnNorms} values={trace.columnNorms} />
        <MiniDimCard label={t.explain.idealPositive} values={trace.idealPositive} />
        <MiniDimCard label={t.explain.idealNegative} values={trace.idealNegative} />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2 pr-4">{t.explain.method}</th>
              <th className="py-2 pr-4">{t.explain.distancePlus}</th>
              <th className="py-2 pr-4">{t.explain.distanceMinus}</th>
              <th className="py-2 pr-4">{t.explain.closeness}</th>
              <th className="py-2 pr-4">{t.explain.normalized}</th>
            </tr>
          </thead>
          <tbody>
            {trace.steps.map((step) => (
              <tr key={step.method} className="border-t border-slate-200">
                <td className="py-1.5 pr-4 font-medium text-industrial-primary">
                  <MethodLabel method={step.method} />
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.distanceToIdealPositive)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.distanceToIdealNegative)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(step.closeness, 4)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">
                  {(step.normalizedRank * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-industrial-accent">
          {t.common.intermediateMatrices}
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs min-w-[720px]">
            <thead>
              <tr>
                <th />
                {DIM_KEYS.map((d) => (
                  <th key={d} className="text-left text-slate-500">
                    {t.dimensions[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trace.steps.map((step) => (
                <tbody key={step.method}>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <th
                      scope="rowgroup"
                      colSpan={DIM_KEYS.length + 1}
                      className="text-left py-1 pl-2"
                    >
                      <MethodLabel method={step.method} />
                    </th>
                  </tr>
                  <DimensionRow label={t.explain.decisionRow} values={step.decision as unknown as Record<string, number>} />
                  <DimensionRow label={t.explain.normalizedRow} values={step.normalized as unknown as Record<string, number>} />
                  <DimensionRow label={t.explain.weightedRow} values={step.weighted as unknown as Record<string, number>} />
                </tbody>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function MiniDimCard({
  label,
  values,
}: {
  label: string;
  values: Record<string, number>;
}) {
  const t = useTranslations();
  return (
    <div className="rounded-xl2 bg-slate-50 p-3">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <ul className="mt-1 space-y-1 text-xs font-mono">
        {DIM_KEYS.map((d) => (
          <li key={d} className="flex justify-between">
            <span>{t.dimensions[d]}</span>
            <span>{fmt(values[d], 4)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RulesSection({ trace }: { trace: LinearTrace }) {
  const t = useTranslations();
  if (trace.rulesApplied.length === 0) {
    return (
      <section className="card">
        <h3 className="text-base font-semibold text-industrial-primary">
          {t.explain.sectionRules}
        </h3>
        <p className="mt-2 text-sm text-slate-500">{t.explain.noRules}</p>
      </section>
    );
  }
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">{t.explain.sectionRules}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2 pr-4">{t.explain.ruleId}</th>
              <th className="py-2 pr-4">{t.explain.ruleMethod}</th>
              <th className="py-2 pr-4">{t.explain.ruleMultiplier}</th>
              <th className="py-2 pr-4">{t.explain.ruleReason}</th>
            </tr>
          </thead>
          <tbody>
            {trace.rulesApplied.map((r, i) => (
              <tr key={`${r.id}-${r.method}-${i}`} className="border-t border-slate-200">
                <td className="py-1.5 pr-4 font-mono">{r.id}</td>
                <td className="py-1.5 pr-4">
                  <MethodLabel method={r.method} />
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs">×{r.multiplier.toFixed(2)}</td>
                <td className="py-1.5 pr-4 text-slate-600">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ResultSection({
  result,
  trace,
}: {
  result: SimulationResult;
  trace: StrategyTrace;
}) {
  const t = useTranslations();
  void trace;
  return (
    <section className="card">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.explain.sectionResult}
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">{t.explain.method}</th>
              <th className="py-2 pr-4">{t.explain.finalScore}</th>
              <th className="py-2 pr-4">{t.explain.normalized}</th>
            </tr>
          </thead>
          <tbody>
            {result.ranking.map((r, i) => (
              <tr key={r.method} className="border-t border-slate-200">
                <td className="py-1.5 pr-4 text-slate-500">{i + 1}</td>
                <td className="py-1.5 pr-4 font-medium text-industrial-primary">
                  <MethodLabel method={r.method} />
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs">{fmt(r.score, 4)}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">
                  {(r.normalized * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
