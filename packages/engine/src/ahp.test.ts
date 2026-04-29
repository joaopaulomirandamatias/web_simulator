import { describe, expect, it } from 'vitest';
import {
  AhpStrategy,
  consistencyRatio,
  DEFAULT_PAIRWISE,
  priorityVector,
  runSimulation,
  SECTOR_PROFILES,
  SECTOR_IDS,
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

describe('AHP priority vector', () => {
  it('sums to 1', () => {
    const w = priorityVector(DEFAULT_PAIRWISE);
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('ranks Safety highest in default matrix', () => {
    const w = priorityVector(DEFAULT_PAIRWISE);
    expect(w.safety).toBeGreaterThan(w.ergonomic);
    expect(w.safety).toBeGreaterThan(w.humanPreference);
    expect(w.safety).toBeGreaterThan(w.performance);
    expect(w.safety).toBeGreaterThan(w.taskComplexity);
  });

  it('yields acceptable consistency ratio (CR ≤ 0.10)', () => {
    const cr = consistencyRatio(DEFAULT_PAIRWISE);
    expect(cr).toBeGreaterThanOrEqual(0);
    expect(cr).toBeLessThanOrEqual(0.1);
  });
});

describe('AhpStrategy', () => {
  it('is deterministic', () => {
    const s = new AhpStrategy();
    const a = s.compute(balanced);
    const b = s.compute(balanced);
    expect(a.recommended).toBe(b.recommended);
    expect(a.ranking.map((r) => r.method)).toEqual(b.ranking.map((r) => r.method));
  });

  it('exposes its name and priorities', () => {
    const s = new AhpStrategy();
    const p = s.getPriorities();
    expect(s.name).toBe('ahp-v1');
    expect(Object.keys(p)).toHaveLength(5);
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });

  it('normalizes top/bottom to 1/0', () => {
    const result = new AhpStrategy().compute(balanced);
    expect(result.ranking[0]!.normalized).toBeCloseTo(1);
    expect(result.ranking.at(-1)!.normalized).toBeCloseTo(0);
  });
});

describe('runSimulation dispatch', () => {
  it('runs the linear strategy by default', () => {
    const r = runSimulation(balanced);
    expect(r.strategy).toBe('linear-v1');
  });

  it('runs AHP when requested', () => {
    const r = runSimulation(balanced, { strategy: 'ahp' });
    expect(r.strategy).toBe('ahp-v1');
  });

  it('accepts a bespoke DecisionStrategy instance', () => {
    const r = runSimulation(balanced, new AhpStrategy());
    expect(r.strategy).toBe('ahp-v1');
  });

  it('applies sector calibration (pharmaceutical emphasises safety)', () => {
    const generic = runSimulation({ ...balanced, safetyRequired: 5 });
    const pharma = runSimulation(
      { ...balanced, safetyRequired: 5 },
      { sector: 'pharmaceutical' },
    );
    const rec = (r: ReturnType<typeof runSimulation>) =>
      r.ranking.find((m) => m.method === r.recommended)!.contributions.safety;
    expect(rec(pharma)).toBeGreaterThanOrEqual(rec(generic));
  });
});

describe('Sector profiles', () => {
  it('exposes a profile for every documented sector', () => {
    for (const id of SECTOR_IDS) {
      expect(SECTOR_PROFILES[id]).toBeDefined();
      expect(SECTOR_PROFILES[id].label['pt-BR']).toBeTruthy();
      expect(SECTOR_PROFILES[id].label.en).toBeTruthy();
    }
  });

  it('has reciprocal AHP matrices (a_ij · a_ji = 1)', () => {
    for (const id of SECTOR_IDS) {
      const m = SECTOR_PROFILES[id].ahpMatrix;
      const dims = Object.keys(m) as (keyof typeof m)[];
      for (const i of dims) {
        for (const j of dims) {
          expect(m[i][j] * m[j][i]).toBeCloseTo(1, 4);
        }
      }
    }
  });
});
