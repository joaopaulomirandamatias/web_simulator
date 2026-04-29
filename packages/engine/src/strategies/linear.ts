import { METHOD_PROFILES } from '../methods.js';
import type {
  BusinessRuleApplication,
  LinearMethodStep,
  LinearTrace,
} from '../trace.js';
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

export const ENGINE_VERSION = '0.1.0';

/**
 * Pesos das dimensões (α/β da fórmula do §8 do PLANEJAMENTO.md).
 * Default: pesos iguais (calibráveis por setor).
 */
export interface LinearWeights {
  safety: number;
  ergonomic: number;
  humanPreference: number;
  performance: number;
  taskComplexity: number;
  /** Peso γ da penalização de custo. */
  cost: number;
}

export const DEFAULT_WEIGHTS: LinearWeights = {
  safety: 1.2,
  ergonomic: 1.0,
  humanPreference: 1.0,
  performance: 1.0,
  taskComplexity: 1.0,
  cost: 0.8,
};

const normalize = (likert: number): number => (likert - 1) / 4;

/**
 * Projeta as 10 entradas Likert nos 5 scores do framework AHCF-CPS.
 * Cada score ∈ [0, 1].
 */
export function computeDimensionScores(inputs: SimulationInputs): DimensionScores {
  const s = (k: keyof SimulationInputs) => normalize(inputs[k]);
  return {
    safety: s('safetyRequired'),
    ergonomic: s('ergonomicLoad'),
    humanPreference:
      0.5 * (1 - s('operatorExperience')) + // iniciantes demandam mais suporte humano
      0.3 * s('transparencyNeed') +
      0.2 * s('leadershipPreference'),
    performance: s('productivityGoal'),
    taskComplexity: 0.6 * s('taskComplexity') + 0.4 * s('variability'),
  };
}

interface RuleContext {
  adjusted: Record<ProgrammingMethod, number>;
  warnings: Record<ProgrammingMethod, string[]>;
  applied: BusinessRuleApplication[];
}

function apply(
  ctx: RuleContext,
  id: string,
  method: ProgrammingMethod,
  multiplier: number,
  reason: string,
  warning?: string,
) {
  ctx.adjusted[method] *= multiplier;
  if (warning) ctx.warnings[method].push(warning);
  ctx.applied.push({ id, method, multiplier, reason, warning });
}

/**
 * Regras de negócio (RN01–RN09 do PLANEJAMENTO.md §7).
 */
function applyBusinessRules(
  inputs: SimulationInputs,
  baseScores: Record<ProgrammingMethod, number>,
): RuleContext {
  const ctx: RuleContext = {
    adjusted: { ...baseScores },
    warnings: {
      conventional: [],
      parameterized: [],
      pbd: [],
      kinesthetic: [],
      xr: [],
      shared_control: [],
    },
    applied: [],
  };

  if (inputs.safetyRequired === 5) {
    apply(ctx, 'RN01', 'conventional', 0.85, 'Segurança máxima penaliza métodos simples.',
      'Segurança máxima (5) — limitação para colaboração dinâmica.');
    apply(ctx, 'RN01', 'xr', 0.85, 'Segurança máxima penaliza XR (latência).',
      'Segurança máxima (5) — XR pode ter latência crítica.');
  }

  if (inputs.operatorExperience <= 2) {
    apply(ctx, 'RN02', 'pbd', 1.1, 'Operador iniciante favorece PbD.');
    apply(ctx, 'RN02', 'xr', 1.1, 'Operador iniciante favorece XR.');
    apply(ctx, 'RN02', 'kinesthetic', 1.05, 'Operador iniciante se beneficia de ensino cinestésico.');
  }

  if (inputs.taskComplexity >= 4 && inputs.variability <= 2) {
    apply(ctx, 'RN03', 'conventional', 1.1, 'Alta precisão + baixa variabilidade favorece convencional.');
    apply(ctx, 'RN03', 'shared_control', 1.05, 'Alta precisão combina com Shared Control.');
  }

  if (inputs.variability >= 4) {
    apply(ctx, 'RN04', 'shared_control', 1.15, 'Alta variabilidade favorece Shared Control.');
    apply(ctx, 'RN04', 'pbd', 1.1, 'Alta variabilidade favorece PbD.');
    apply(ctx, 'RN04', 'conventional', 0.8, 'Alta variabilidade penaliza programação offline.');
  }

  if (inputs.costConstraint >= 4) {
    apply(ctx, 'RN05', 'xr', 0.75, 'Restrição severa de custo penaliza XR.',
      'Restrição de custo alta — XR demanda CAPEX elevado.');
    apply(ctx, 'RN05', 'shared_control', 0.85, 'Restrição de custo penaliza Adaptive AI.');
  }

  if (inputs.leadershipPreference <= 2 && inputs.taskComplexity >= 4) {
    apply(ctx, 'RN08', 'shared_control', 1.1, 'Preferência “seguir” + complexidade alta favorece Shared Control.');
  }

  if (inputs.transparencyNeed >= 4) {
    apply(ctx, 'RN09', 'shared_control', 0.92, 'Alta demanda por transparência penaliza IA opaca.',
      'Transparência alta exigida — considere módulo XAI no Shared Control.');
  }

  return ctx;
}

function methodContributions(
  dims: DimensionScores,
  method: ProgrammingMethod,
  weights: LinearWeights,
): { contributions: DimensionScores; rawSum: number; costPenalty: number } {
  const profile = METHOD_PROFILES[method];
  const contributions: DimensionScores = {
    safety: weights.safety * profile.affinities.safety * dims.safety,
    ergonomic: weights.ergonomic * profile.affinities.ergonomic * dims.ergonomic,
    humanPreference:
      weights.humanPreference * profile.affinities.humanPreference * dims.humanPreference,
    performance: weights.performance * profile.affinities.performance * dims.performance,
    taskComplexity:
      weights.taskComplexity * profile.affinities.taskComplexity * dims.taskComplexity,
  };
  const rawSum =
    contributions.safety +
    contributions.ergonomic +
    contributions.humanPreference +
    contributions.performance +
    contributions.taskComplexity;
  return { contributions, rawSum, costPenalty: weights.cost * profile.costFactor };
}

export class LinearStrategy implements DecisionStrategy {
  readonly name = 'linear-v1';
  constructor(private readonly weights: LinearWeights = DEFAULT_WEIGHTS) {}

  compute(inputs: SimulationInputs, options: ComputeOptions = {}): SimulationResult {
    const dims = computeDimensionScores(inputs);
    const costIntensity = normalize(inputs.costConstraint);

    const baseMap = {} as Record<ProgrammingMethod, number>;
    const contribMap = {} as Record<ProgrammingMethod, DimensionScores>;
    const rawSumMap = {} as Record<ProgrammingMethod, number>;
    const costPenaltyMap = {} as Record<ProgrammingMethod, number>;

    for (const method of PROGRAMMING_METHODS) {
      const { contributions, rawSum, costPenalty } = methodContributions(
        dims,
        method,
        this.weights,
      );
      contribMap[method] = contributions;
      rawSumMap[method] = rawSum;
      costPenaltyMap[method] = costPenalty * costIntensity;
      baseMap[method] = rawSum - costPenalty * costIntensity;
    }

    const ctx = applyBusinessRules(inputs, baseMap);

    const rawScores = PROGRAMMING_METHODS.map((m) => ctx.adjusted[m]);
    const minScore = Math.min(...rawScores);
    const maxScore = Math.max(...rawScores);
    const range = Math.max(maxScore - minScore, 1e-9);

    const ranking: MethodResult[] = PROGRAMMING_METHODS.map((method) => {
      const profile = METHOD_PROFILES[method];
      return {
        method,
        score: ctx.adjusted[method],
        normalized: (ctx.adjusted[method] - minScore) / range,
        contributions: contribMap[method]!,
        pros: profile.pros,
        cons: profile.cons,
        warnings: ctx.warnings[method],
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
      const steps: LinearMethodStep[] = PROGRAMMING_METHODS.map((method) => {
        const profile = METHOD_PROFILES[method];
        return {
          method,
          affinities: profile.affinities,
          contributions: contribMap[method]!,
          rawSum: rawSumMap[method]!,
          costFactor: profile.costFactor,
          costPenalty: costPenaltyMap[method]!,
          preRuleScore: baseMap[method]!,
          finalScore: ctx.adjusted[method]!,
          normalized:
            (ctx.adjusted[method]! - minScore) / range,
        };
      });
      const trace: LinearTrace = {
        kind: 'linear',
        weights: {
          safety: this.weights.safety,
          ergonomic: this.weights.ergonomic,
          humanPreference: this.weights.humanPreference,
          performance: this.weights.performance,
          taskComplexity: this.weights.taskComplexity,
          cost: this.weights.cost,
        },
        dimensionScores: dims,
        costIntensity,
        steps,
        rulesApplied: ctx.applied,
      };
      result.trace = trace;
    }

    return result;
  }
}
