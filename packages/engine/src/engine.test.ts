import { describe, expect, it } from 'vitest';
import {
  LinearStrategy,
  PROGRAMMING_METHODS,
  computeDimensionScores,
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

describe('computeDimensionScores', () => {
  it('maps neutral inputs to scores around 0.5', () => {
    const dims = computeDimensionScores(balanced);
    expect(dims.safety).toBeCloseTo(0.5);
    expect(dims.ergonomic).toBeCloseTo(0.5);
    expect(dims.performance).toBeCloseTo(0.5);
    expect(dims.taskComplexity).toBeCloseTo(0.5);
    expect(dims.humanPreference).toBeCloseTo(0.5);
  });

  it('bounds every dimension to [0, 1]', () => {
    const extremeLow: SimulationInputs = {
      ...balanced,
      taskComplexity: 1,
      variability: 1,
      operatorExperience: 1,
      safetyRequired: 1,
      ergonomicLoad: 1,
      productivityGoal: 1,
      transparencyNeed: 1,
      leadershipPreference: 1,
    };
    const extremeHigh: SimulationInputs = {
      ...balanced,
      taskComplexity: 5,
      variability: 5,
      operatorExperience: 5,
      safetyRequired: 5,
      ergonomicLoad: 5,
      productivityGoal: 5,
      transparencyNeed: 5,
      leadershipPreference: 5,
    };
    for (const inputs of [extremeLow, extremeHigh]) {
      const dims = computeDimensionScores(inputs);
      for (const value of Object.values(dims)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('LinearStrategy', () => {
  it('returns a ranking with every known method', () => {
    const result = new LinearStrategy().compute(balanced);
    expect(result.ranking).toHaveLength(PROGRAMMING_METHODS.length);
    const methods = result.ranking.map((r) => r.method).sort();
    expect(methods).toEqual([...PROGRAMMING_METHODS].sort());
  });

  it('is deterministic for the same input', () => {
    const strategy = new LinearStrategy();
    const a = strategy.compute(balanced);
    const b = strategy.compute(balanced);
    expect(a.recommended).toBe(b.recommended);
    for (let i = 0; i < a.ranking.length; i++) {
      expect(a.ranking[i]!.method).toBe(b.ranking[i]!.method);
      expect(a.ranking[i]!.score).toBeCloseTo(b.ranking[i]!.score);
    }
  });

  it('normalizes top score to 1 and bottom to 0', () => {
    const result = runSimulation(balanced);
    const top = result.ranking[0]!;
    const bottom = result.ranking[result.ranking.length - 1]!;
    expect(top.normalized).toBeCloseTo(1);
    expect(bottom.normalized).toBeCloseTo(0);
  });

  it('recommends a flexible method when variability is high (RN04)', () => {
    const result = runSimulation({
      ...balanced,
      variability: 5,
      taskComplexity: 4,
    });
    expect(['shared_control', 'pbd', 'kinesthetic']).toContain(result.recommended);
    const conventional = result.ranking.find((m) => m.method === 'conventional')!;
    const sharedControl = result.ranking.find((m) => m.method === 'shared_control')!;
    expect(sharedControl.score).toBeGreaterThan(conventional.score);
  });

  it('penalizes XR when cost constraint is severe (RN05)', () => {
    const tight = runSimulation({ ...balanced, costConstraint: 5 });
    const xr = tight.ranking.find((m) => m.method === 'xr')!;
    expect(xr.warnings.some((w) => /custo/i.test(w))).toBe(true);
  });

  it('favors PbD / XR when operator is a beginner (RN02)', () => {
    const novice = runSimulation({ ...balanced, operatorExperience: 1 });
    const top3 = novice.ranking.slice(0, 3).map((r) => r.method);
    const supportive = ['pbd', 'xr', 'kinesthetic', 'shared_control'];
    const overlap = top3.filter((m) => supportive.includes(m));
    expect(overlap.length).toBeGreaterThanOrEqual(1);
  });

  it('warns about transparency when need is high (RN09)', () => {
    const result = runSimulation({ ...balanced, transparencyNeed: 5 });
    const shared = result.ranking.find((m) => m.method === 'shared_control')!;
    expect(shared.warnings.some((w) => /transpar|XAI/i.test(w))).toBe(true);
  });

  it('exposes engine version and timestamp', () => {
    const result = runSimulation(balanced);
    expect(result.engineVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(result.strategy).toBe('linear-v1');
    expect(new Date(result.computedAt).toString()).not.toBe('Invalid Date');
  });
});
