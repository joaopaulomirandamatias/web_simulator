import { METHOD_PROFILES } from '../methods.js';
import type { AhpStep, AhpTrace } from '../trace.js';
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

/**
 * Estratégia AHP (Analytic Hierarchy Process). Técnica multicritério
 * clássica mencionada pelo artigo AHCF-CPS (§7.9) como candidata de
 * operacionalização do framework.
 *
 * Implementação simplificada:
 *   1. Matriz de comparação pareada das 5 dimensões (escala 1–9).
 *   2. Vetor de prioridades obtido por normalização geométrica
 *      (aproximação suficiente do autovetor principal para matrizes 5×5
 *      reciprocamente consistentes).
 *   3. Score por método = Σ_d prioridade_d · afinidade_{j,d} · dim_d
 *      − γ · costFactor_j · norm(costConstraint).
 *   4. Ranking determinístico + normalização [0, 1].
 *
 * A matriz default reflete a ênfase sugerida pela RSL do AHCF-CPS:
 * Safety > TaskComplexity ≈ Ergonomic > Performance ≈ HumanPreference.
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

export type PairwiseMatrix = Record<Dimension, Record<Dimension, number>>;

/**
 * Matriz default (escala Saaty 1–9). Valores acima da diagonal; abaixo é
 * recíproco. Expressa: Safety é "moderadamente mais importante" (3) que
 * a maior parte das dimensões; TaskComplexity e Ergonomic vêm logo abaixo.
 */
export const DEFAULT_PAIRWISE: PairwiseMatrix = {
  safety: { safety: 1, ergonomic: 2, humanPreference: 3, performance: 3, taskComplexity: 2 },
  ergonomic: { safety: 1 / 2, ergonomic: 1, humanPreference: 2, performance: 2, taskComplexity: 1 },
  humanPreference: {
    safety: 1 / 3,
    ergonomic: 1 / 2,
    humanPreference: 1,
    performance: 1,
    taskComplexity: 1 / 2,
  },
  performance: {
    safety: 1 / 3,
    ergonomic: 1 / 2,
    humanPreference: 1,
    performance: 1,
    taskComplexity: 1 / 2,
  },
  taskComplexity: {
    safety: 1 / 2,
    ergonomic: 1,
    humanPreference: 2,
    performance: 2,
    taskComplexity: 1,
  },
};

/**
 * Vetor de prioridades pela média geométrica das linhas (aproximação
 * clássica do autovetor principal). Retorna pesos que somam 1.
 */
export function priorityVector(matrix: PairwiseMatrix): Record<Dimension, number> {
  const geom: Record<Dimension, number> = {
    safety: 1,
    ergonomic: 1,
    humanPreference: 1,
    performance: 1,
    taskComplexity: 1,
  };
  for (const row of DIMENSIONS) {
    let product = 1;
    for (const col of DIMENSIONS) {
      product *= matrix[row][col];
    }
    geom[row] = Math.pow(product, 1 / DIMENSIONS.length);
  }
  const total = DIMENSIONS.reduce((acc, d) => acc + geom[d], 0);
  const priorities = {} as Record<Dimension, number>;
  for (const d of DIMENSIONS) priorities[d] = geom[d] / total;
  return priorities;
}

/**
 * Consistency Ratio (CR) de Saaty. Para matrizes 5×5, RI ≈ 1.12.
 * CR ≤ 0.10 é considerado aceitável.
 */
export function consistencyRatio(matrix: PairwiseMatrix): number {
  const w = priorityVector(matrix);
  let lambdaMax = 0;
  for (const row of DIMENSIONS) {
    let sum = 0;
    for (const col of DIMENSIONS) sum += matrix[row][col] * w[col];
    lambdaMax += sum / w[row];
  }
  lambdaMax /= DIMENSIONS.length;
  const n = DIMENSIONS.length;
  const CI = (lambdaMax - n) / (n - 1);
  const RI = 1.12; // Saaty's random index for n=5
  return CI / RI;
}

const normalize = (likert: number): number => (likert - 1) / 4;

export class AhpStrategy implements DecisionStrategy {
  readonly name = 'ahp-v1';
  private readonly matrix: PairwiseMatrix;
  private readonly priorities: Record<Dimension, number>;
  private readonly costPenaltyCoef: number;

  constructor(matrix: PairwiseMatrix = DEFAULT_PAIRWISE, costPenalty = 0.3) {
    this.matrix = matrix;
    this.priorities = priorityVector(matrix);
    this.costPenaltyCoef = costPenalty;
  }

  getPriorities(): Record<Dimension, number> {
    return { ...this.priorities };
  }

  compute(inputs: SimulationInputs, options: ComputeOptions = {}): SimulationResult {
    const dims = computeDimensionScores(inputs);
    const costIntensity = normalize(inputs.costConstraint);

    const rawScores = {} as Record<ProgrammingMethod, number>;
    const rawSumMap = {} as Record<ProgrammingMethod, number>;
    const costPenaltyMap = {} as Record<ProgrammingMethod, number>;
    const contribMap = {} as Record<ProgrammingMethod, DimensionScores>;

    for (const method of PROGRAMMING_METHODS) {
      const profile = METHOD_PROFILES[method];
      const contributions: DimensionScores = {
        safety: this.priorities.safety * profile.affinities.safety * dims.safety,
        ergonomic: this.priorities.ergonomic * profile.affinities.ergonomic * dims.ergonomic,
        humanPreference:
          this.priorities.humanPreference *
          profile.affinities.humanPreference *
          dims.humanPreference,
        performance:
          this.priorities.performance * profile.affinities.performance * dims.performance,
        taskComplexity:
          this.priorities.taskComplexity *
          profile.affinities.taskComplexity *
          dims.taskComplexity,
      };
      const sum =
        contributions.safety +
        contributions.ergonomic +
        contributions.humanPreference +
        contributions.performance +
        contributions.taskComplexity;
      const penalty = this.costPenaltyCoef * profile.costFactor * costIntensity;
      rawSumMap[method] = sum;
      costPenaltyMap[method] = penalty;
      rawScores[method] = sum - penalty;
      contribMap[method] = contributions;
    }

    const values = PROGRAMMING_METHODS.map((m) => rawScores[m]);
    const minScore = Math.min(...values);
    const maxScore = Math.max(...values);
    const range = Math.max(maxScore - minScore, 1e-9);

    const ranking: MethodResult[] = PROGRAMMING_METHODS.map((method) => {
      const profile = METHOD_PROFILES[method];
      return {
        method,
        score: rawScores[method],
        normalized: (rawScores[method] - minScore) / range,
        contributions: contribMap[method]!,
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
      const steps: AhpStep[] = PROGRAMMING_METHODS.map((method) => {
        const profile = METHOD_PROFILES[method];
        return {
          method,
          affinities: profile.affinities,
          contributions: contribMap[method]!,
          rawSum: rawSumMap[method]!,
          costPenalty: costPenaltyMap[method]!,
          finalScore: rawScores[method]!,
          normalized: (rawScores[method]! - minScore) / range,
        };
      });
      const trace: AhpTrace = {
        kind: 'ahp',
        matrix: this.matrix,
        priorities: this.priorities,
        consistencyRatio: consistencyRatio(this.matrix),
        dimensionScores: dims,
        costIntensity,
        steps,
      };
      result.trace = trace;
    }

    return result;
  }
}
