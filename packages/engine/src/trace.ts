/**
 * StrategyTrace — registros determinísticos e inspecionáveis do cálculo
 * realizado por cada estratégia. Objetivo: permitir **validação acadêmica
 * do framework AHCF-CPS** (Matias, 2026) reproduzindo passo a passo a
 * recomendação de qualquer simulação.
 *
 * A emissão do trace é **opt-in** (`runSimulation(inputs, { trace: true })`)
 * para não sobrecarregar o payload em produção. Implantações que não
 * queiram expor os números podem simplesmente manter `trace: false`
 * (default) — o resultado continua correto e deterministicamente reprodutível.
 */
import type {
  DimensionScores,
  ProgrammingMethod,
} from './types.js';

export type Dimension = keyof DimensionScores;

export interface BusinessRuleApplication {
  /** Código legível (ex.: "RN04"). */
  id: string;
  /** Método afetado. */
  method: ProgrammingMethod;
  /** Multiplicador aplicado ao score bruto. */
  multiplier: number;
  /** Explicação para humanos. */
  reason: string;
  /** Warning adicionado ao resultado (quando aplicável). */
  warning?: string;
}

export interface LinearMethodStep {
  method: ProgrammingMethod;
  affinities: DimensionScores;
  /** Contribuição ponderada por dimensão (w_d · a_{j,d} · dim_d). */
  contributions: DimensionScores;
  /** Soma das contribuições (antes da penalidade de custo). */
  rawSum: number;
  costFactor: number;
  /** γ · costFactor · norm(costConstraint). */
  costPenalty: number;
  /** rawSum − costPenalty, antes de aplicar regras de negócio. */
  preRuleScore: number;
  /** Após regras RN01–RN09. */
  finalScore: number;
  normalized: number;
}

export interface LinearTrace {
  kind: 'linear';
  weights: Record<Dimension, number> & { cost: number };
  dimensionScores: DimensionScores;
  costIntensity: number;
  steps: LinearMethodStep[];
  rulesApplied: BusinessRuleApplication[];
}

export interface AhpStep {
  method: ProgrammingMethod;
  affinities: DimensionScores;
  contributions: DimensionScores;
  rawSum: number;
  costPenalty: number;
  finalScore: number;
  normalized: number;
}

export interface AhpTrace {
  kind: 'ahp';
  /** Matriz pareada usada (5×5). */
  matrix: Record<Dimension, Record<Dimension, number>>;
  /** Vetor de prioridades (soma ≈ 1). */
  priorities: Record<Dimension, number>;
  /** Consistency Ratio (≤ 0.10 é aceitável). */
  consistencyRatio: number;
  dimensionScores: DimensionScores;
  costIntensity: number;
  steps: AhpStep[];
}

export interface TopsisStep {
  method: ProgrammingMethod;
  /** Linha da matriz de decisão D. */
  decision: DimensionScores;
  /** Linha da matriz normalizada R (D / colunaNorm). */
  normalized: DimensionScores;
  /** Linha da matriz ponderada V (w_d · R). */
  weighted: DimensionScores;
  distanceToIdealPositive: number;
  distanceToIdealNegative: number;
  /** Closeness coefficient C_j ∈ [0, 1]. */
  closeness: number;
  /** Score normalizado [0,1] sobre o ranking. */
  normalizedRank: number;
}

export interface TopsisTrace {
  kind: 'topsis';
  weights: Record<Dimension, number>;
  dimensionScores: DimensionScores;
  costPenalty: number;
  /** Normas por coluna utilizadas no passo 2 (sqrt(Σ D²)). */
  columnNorms: Record<Dimension, number>;
  idealPositive: Record<Dimension, number>;
  idealNegative: Record<Dimension, number>;
  steps: TopsisStep[];
}

export type StrategyTrace = LinearTrace | AhpTrace | TopsisTrace;
