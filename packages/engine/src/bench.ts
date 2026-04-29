/**
 * Microbenchmark da engine AHCF-CPS.
 *
 * Rodar com: `pnpm --filter @ahcf-cps/engine bench` (veja package.json).
 *
 * Objetivo (RNF01): mostrar que o p95 por simulação fica bem abaixo de 1 s,
 * para qualquer estratégia, em uma máquina modesta.
 */
import { runSimulation, type SimulationInputs } from './index.js';

const INPUT: SimulationInputs = {
  taskComplexity: 4,
  variability: 5,
  operatorExperience: 2,
  safetyRequired: 4,
  ergonomicLoad: 3,
  resourcesAvailable: 3,
  productivityGoal: 4,
  costConstraint: 3,
  leadershipPreference: 2,
  transparencyNeed: 4,
};

type StrategyId = 'linear' | 'ahp' | 'topsis';

function bench(strategy: StrategyId, iterations: number) {
  const samples: number[] = [];
  // warm-up
  for (let i = 0; i < 50; i++) runSimulation(INPUT, { strategy });
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    runSimulation(INPUT, { strategy });
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  const pct = (p: number) => samples[Math.min(samples.length - 1, Math.floor(p * samples.length))]!;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return {
    strategy,
    iterations,
    mean_ms: mean,
    p50_ms: pct(0.5),
    p95_ms: pct(0.95),
    p99_ms: pct(0.99),
  };
}

const results = (['linear', 'ahp', 'topsis'] as const).map((s) => bench(s, 5000));
console.table(
  results.map((r) => ({
    strategy: r.strategy,
    iterations: r.iterations,
    'mean (ms)': r.mean_ms.toFixed(3),
    'p50 (ms)': r.p50_ms.toFixed(3),
    'p95 (ms)': r.p95_ms.toFixed(3),
    'p99 (ms)': r.p99_ms.toFixed(3),
  })),
);

const worstP95 = Math.max(...results.map((r) => r.p95_ms));
if (worstP95 > 5) {
  console.error(`\n✗ Regression: worst p95 = ${worstP95.toFixed(2)} ms (> 5 ms).`);
  process.exit(1);
}
console.log(`\n✓ All strategies under 5 ms p95 (worst: ${worstP95.toFixed(2)} ms).`);
