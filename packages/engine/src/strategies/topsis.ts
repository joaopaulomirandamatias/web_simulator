import { METHOD_PROFILES } from '../methods.js';
import type { TopsisStep, TopsisTrace } from '../trace.js';
import type {
  ComputeOptions,
  DecisionStrategy,
  DimensionScores,
  MethodResult,
  ProgrammingMethod,
  SimulationInputs,
  SimulationResult,
} from '../types.js';
import { PROGRAMMING_METHODS } from '../types.js';
import { ENGINE_VERSION, computeDimensionScores } from './linear.js';
import { priorityVector, DEFAULT_PAIRWISE, type PairwiseMatrix } from './ahp.js';

/**
 * TOPSIS — Technique for Order Preference by Similarity to Ideal Solution.
 * Técnica multicritério clássica mencionada pelo artigo AHCF-CPS (§7.9)
 * como uma das opções de operacionalização do framework.
 *
 * Implementação:
 *   1. Construir matriz de decisão D (m métodos × n dimensões), onde
 *      D[j, d] = affinity_{j,d} · dim_d  −  costFactor_j · norm(cost) / n
 *      (a penalidade de custo é distribuída pelas dimensões para
 *      manter a normalização consistente).
 *   2. Normalização vetorial: r[j, d] = D[j, d] / sqrt(Σ_j D[j, d]²).
 *   3. Aplicar pesos do critério (vindos de AHP priorityVector ou
 *      fornecidos pelo chamador): v[j, d] = w_d · r[j, d].
 *   4. Solução ideal positiva A⁺ = max_j v[j, d] (todas são critérios de benefício).
 *   5. Solução ideal negativa A⁻ = min_j v[j, d].
 *   6. Distância euclidiana: S⁺_j = ||v_j − A⁺||, S⁻_j = ||v_j − A⁻||.
 *   7. Closeness coefficient: C_j = S⁻_j / (S⁺_j + S⁻_j) ∈ [0, 1].
 *   8. Ordenar por C_j decrescente.
 */

export type Dimension =
  | 'safety'
  | 'ergonomic'
  | 'humanPreference'
  | 'performance'
  | 'taskComplexity';

const DIMENSIONS: readonly Dimension[] = [
  'safety',
  'ergonomic',
  'humanPreference',
  'performance',
  'taskComplexity',
];

const normalize = (likert: number): number => (likert - 1) / 4;

export class TopsisStrategy implements DecisionStrategy {
  readonly name = 'topsis-v1';

  constructor(
    private readonly weights: Record<Dimension, number> = priorityVector(DEFAULT_PAIRWISE),
    private readonly costPenalty = 0.25,
  ) {}

  static fromMatrix(matrix: PairwiseMatrix, costPenalty = 0.25): TopsisStrategy {
    return new TopsisStrategy(priorityVector(matrix), costPenalty);
  }

  compute(inputs: SimulationInputs, options: ComputeOptions = {}): SimulationResult {
    const dims = computeDimensionScores(inputs);
    const costIntensity = normalize(inputs.costConstraint);

    // Step 1 — decision matrix
    const D = {} as Record<ProgrammingMethod, Record<Dimension, number>>;
    for (const method of PROGRAMMING_METHODS) {
      const profile = METHOD_PROFILES[method];
      D[method] = {
        safety: profile.affinities.safety * dims.safety,
        ergonomic: profile.affinities.ergonomic * dims.ergonomic,
        humanPreference: profile.affinities.humanPreference * dims.humanPreference,
        performance: profile.affinities.performance * dims.performance,
        taskComplexity: profile.affinities.taskComplexity * dims.taskComplexity,
      };
      const penalty = (this.costPenalty * profile.costFactor * costIntensity) / DIMENSIONS.length;
      for (const dim of DIMENSIONS) D[method][dim] = Math.max(0, D[method][dim] - penalty);
    }

    // Step 2 — vector normalization per column
    const colNorms = {} as Record<Dimension, number>;
    for (const dim of DIMENSIONS) {
      let sumSq = 0;
      for (const method of PROGRAMMING_METHODS) sumSq += D[method][dim] ** 2;
      colNorms[dim] = Math.sqrt(sumSq) || 1e-9;
    }

    // Step 3 — normalized + weighted normalized matrices
    const R = {} as Record<ProgrammingMethod, Record<Dimension, number>>;
    const V = {} as Record<ProgrammingMethod, Record<Dimension, number>>;
    for (const method of PROGRAMMING_METHODS) {
      R[method] = { ...D[method] };
      V[method] = { ...D[method] };
      for (const dim of DIMENSIONS) {
        R[method][dim] = D[method][dim] / colNorms[dim];
        V[method][dim] = R[method][dim] * this.weights[dim];
      }
    }

    // Step 4/5 — ideal and anti-ideal (all benefit criteria)
    const Aplus = {} as Record<Dimension, number>;
    const Aminus = {} as Record<Dimension, number>;
    for (const dim of DIMENSIONS) {
      Aplus[dim] = -Infinity;
      Aminus[dim] = Infinity;
      for (const method of PROGRAMMING_METHODS) {
        if (V[method][dim] > Aplus[dim]) Aplus[dim] = V[method][dim];
        if (V[method][dim] < Aminus[dim]) Aminus[dim] = V[method][dim];
      }
    }

    // Step 6/7 — distances and closeness
    const closeness = {} as Record<ProgrammingMethod, number>;
    const splus = {} as Record<ProgrammingMethod, number>;
    const sminus = {} as Record<ProgrammingMethod, number>;
    for (const method of PROGRAMMING_METHODS) {
      let sp = 0;
      let sm = 0;
      for (const dim of DIMENSIONS) {
        sp += (V[method][dim] - Aplus[dim]) ** 2;
        sm += (V[method][dim] - Aminus[dim]) ** 2;
      }
      sp = Math.sqrt(sp);
      sm = Math.sqrt(sm);
      splus[method] = sp;
      sminus[method] = sm;
      const total = sp + sm;
      closeness[method] = total === 0 ? 0 : sm / total;
    }

    // Step 8 — ranking (normalized already ∈ [0, 1])
    const values = PROGRAMMING_METHODS.map((m) => closeness[m]);
    const maxC = Math.max(...values);
    const minC = Math.min(...values);
    const range = Math.max(maxC - minC, 1e-9);

    const ranking: MethodResult[] = PROGRAMMING_METHODS.map((method) => {
      const profile = METHOD_PROFILES[method];
      const contributions: DimensionScores = V[method];
      return {
        method,
        score: closeness[method],
        normalized: (closeness[method] - minC) / range,
        contributions,
        pros: profile.pros,
        cons: profile.cons,
        warnings: [],
      };
    }).sort((a, b) => b.score - a.score);

    const result: SimulationResult = {
      recommended: ranking[0]!.method,
      ranking,
      dimensions: dims,
      engineVersion: ENGINE_VERSION,
      strategy: this.name,
      computedAt: new Date().toISOString(),
    };

    if (options.trace) {
      const steps: TopsisStep[] = PROGRAMMING_METHODS.map((method) => ({
        method,
        decision: D[method],
        normalized: R[method],
        weighted: V[method],
        distanceToIdealPositive: splus[method]!,
        distanceToIdealNegative: sminus[method]!,
        closeness: closeness[method]!,
        normalizedRank: (closeness[method]! - minC) / range,
      }));
      const trace: TopsisTrace = {
        kind: 'topsis',
        weights: this.weights,
        dimensionScores: dims,
        costPenalty: this.costPenalty * costIntensity,
        columnNorms: colNorms,
        idealPositive: Aplus,
        idealNegative: Aminus,
        steps,
      };
      result.trace = trace;
    }

    return result;
  }
}
