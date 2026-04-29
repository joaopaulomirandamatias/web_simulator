import { describe, expect, it } from 'vitest';
import {
  AhpStrategy,
  LinearStrategy,
  PROGRAMMING_METHODS,
  runSimulation,
  TopsisStrategy,
  type AhpTrace,
  type LinearTrace,
  type SimulationInputs,
  type TopsisTrace,
} from './index.js';

const base: SimulationInputs = {
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

describe('Strategy trace (opt-in)', () => {
  it('LinearStrategy emits a trace only when asked', () => {
    const s = new LinearStrategy();
    expect(s.compute(base).trace).toBeUndefined();
    const trace = s.compute(base, { trace: true }).trace as LinearTrace | undefined;
    expect(trace).toBeDefined();
    expect(trace!.kind).toBe('linear');
    expect(trace!.steps).toHaveLength(PROGRAMMING_METHODS.length);
    // rulesApplied reflects inputs above (operator inexperience + high variability + etc.)
    const ids = new Set(trace!.rulesApplied.map((r) => r.id));
    expect(ids.has('RN02')).toBe(true);
    expect(ids.has('RN04')).toBe(true);
    expect(ids.has('RN09')).toBe(true);
  });

  it('AhpStrategy trace exposes priorities and CR', () => {
    const trace = new AhpStrategy().compute(base, { trace: true }).trace as AhpTrace;
    expect(trace.kind).toBe('ahp');
    expect(Object.values(trace.priorities).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
    expect(trace.consistencyRatio).toBeLessThanOrEqual(0.1);
    expect(trace.steps).toHaveLength(PROGRAMMING_METHODS.length);
  });

  it('TopsisStrategy trace exposes D, R, V, A+ and A-', () => {
    const trace = new TopsisStrategy().compute(base, { trace: true }).trace as TopsisTrace;
    expect(trace.kind).toBe('topsis');
    expect(Object.values(trace.columnNorms).every((n) => n > 0)).toBe(true);
    for (const step of trace.steps) {
      expect(step.closeness).toBeGreaterThanOrEqual(0);
      expect(step.closeness).toBeLessThanOrEqual(1);
    }
    // A+ >= A- per dimension
    for (const d of Object.keys(trace.idealPositive) as Array<keyof typeof trace.idealPositive>) {
      expect(trace.idealPositive[d]).toBeGreaterThanOrEqual(trace.idealNegative[d]);
    }
  });

  it('runSimulation forwards the trace flag for every strategy', () => {
    for (const strategy of ['linear', 'ahp', 'topsis'] as const) {
      const r = runSimulation(base, { strategy, trace: true });
      expect(r.trace).toBeDefined();
      expect(r.trace!.kind).toBe(strategy);
    }
  });

  it('trace is omitted by default (backwards-compatible payload)', () => {
    for (const strategy of ['linear', 'ahp', 'topsis'] as const) {
      const r = runSimulation(base, { strategy });
      expect(r.trace).toBeUndefined();
    }
  });
});
