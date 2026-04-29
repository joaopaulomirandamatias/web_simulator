import { describe, expect, it } from 'vitest';
import {
  TopsisStrategy,
  PROGRAMMING_METHODS,
  runSimulation,
  type SimulationInputs,
} from './index.js';

const balanced: SimulationInputs = {
  taskComplexity: 3,
  variability: 3,
  operatorExperience: 3,
  safetyRequired: 3,
  ergonomicLoad: 3,
  resourcesAvailable: 3,
  productivityGoal: 3,
  costConstraint: 3,
  leadershipPreference: 3,
  transparencyNeed: 3,
};

describe('TopsisStrategy', () => {
  it('runs deterministically', () => {
    const s = new TopsisStrategy();
    const a = s.compute(balanced);
    const b = s.compute(balanced);
    expect(a.recommended).toBe(b.recommended);
    expect(a.ranking.map((r) => r.method)).toEqual(b.ranking.map((r) => r.method));
  });

  it('produces closeness coefficients in [0, 1]', () => {
    const result = new TopsisStrategy().compute(balanced);
    for (const entry of result.ranking) {
      expect(entry.score).toBeGreaterThanOrEqual(0);
      expect(entry.score).toBeLessThanOrEqual(1);
    }
  });

  it('returns a full ranking with 6 methods', () => {
    const result = new TopsisStrategy().compute(balanced);
    expect(result.ranking).toHaveLength(PROGRAMMING_METHODS.length);
    expect(new Set(result.ranking.map((r) => r.method)).size).toBe(
      PROGRAMMING_METHODS.length,
    );
  });

  it('normalizes top/bottom to 1/0', () => {
    const result = new TopsisStrategy().compute(balanced);
    expect(result.ranking[0]!.normalized).toBeCloseTo(1);
    expect(result.ranking.at(-1)!.normalized).toBeCloseTo(0);
  });

  it('is dispatched via runSimulation({ strategy: "topsis" })', () => {
    const r = runSimulation(balanced, { strategy: 'topsis' });
    expect(r.strategy).toBe('topsis-v1');
  });

  it('prefers Shared Control under high variability + complexity', () => {
    const r = runSimulation(
      { ...balanced, variability: 5, taskComplexity: 5, safetyRequired: 4 },
      { strategy: 'topsis' },
    );
    expect(['shared_control', 'pbd', 'kinesthetic']).toContain(r.recommended);
  });

  it('demotes XR under severe cost constraint', () => {
    const tight = runSimulation({ ...balanced, costConstraint: 5 }, { strategy: 'topsis' });
    const relaxed = runSimulation({ ...balanced, costConstraint: 1 }, { strategy: 'topsis' });
    const tightXr = tight.ranking.findIndex((r) => r.method === 'xr');
    const relaxedXr = relaxed.ranking.findIndex((r) => r.method === 'xr');
    expect(tightXr).toBeGreaterThanOrEqual(relaxedXr);
  });
});
