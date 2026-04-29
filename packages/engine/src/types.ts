/**
 * Types for the AHCF-CPS decision engine.
 *
 * Based on Matias (2026) — Adaptive Human-Centered Framework for Cobot
 * Programming Selection. Five dimensions: Safety, Ergonomic, Human
 * Preference, Performance, Task Complexity.
 */

export type LikertScore = 1 | 2 | 3 | 4 | 5;

export const PROGRAMMING_METHODS = [
  'conventional',
  'parameterized',
  'pbd',
  'kinesthetic',
  'xr',
  'shared_control',
] as const;

export type ProgrammingMethod = (typeof PROGRAMMING_METHODS)[number];

export interface SimulationInputs {
  /** Complexidade da tarefa (1 = trivial, 5 = crítica). */
  taskComplexity: LikertScore;
  /** Variabilidade do processo (1 = estável, 5 = high-mix low-volume). */
  variability: LikertScore;
  /** Experiência do operador (1 = iniciante, 5 = especialista). */
  operatorExperience: LikertScore;
  /** Nível de segurança exigido (ISO 10218 / ISO-TS 15066). */
  safetyRequired: LikertScore;
  /** Ergonomia / fadiga percebida (1 = ótima, 5 = crítica). */
  ergonomicLoad: LikertScore;
  /** Recursos tecnológicos disponíveis (1 = escassos, 5 = abundantes). */
  resourcesAvailable: LikertScore;
  /** Meta de produtividade (1 = baixa, 5 = agressiva). */
  productivityGoal: LikertScore;
  /** Restrição de custo (1 = sem restrição, 5 = custo baixíssimo). */
  costConstraint: LikertScore;
  /**
   * Preferência do operador:
   * 1 = fortemente prefere seguir o robô
   * 5 = fortemente prefere liderar a tarefa
   * (Noormohammadi-Asl et al., 2025)
   */
  leadershipPreference: LikertScore;
  /**
   * Demanda por transparência algorítmica.
   * (Bagheri et al., 2022)
   */
  transparencyNeed: LikertScore;
}

export interface DimensionScores {
  safety: number;
  ergonomic: number;
  humanPreference: number;
  performance: number;
  taskComplexity: number;
}

export interface MethodResult {
  method: ProgrammingMethod;
  score: number;
  normalized: number;
  contributions: DimensionScores;
  pros: readonly string[];
  cons: readonly string[];
  warnings: readonly string[];
}

export interface SimulationResult {
  recommended: ProgrammingMethod;
  ranking: MethodResult[];
  dimensions: DimensionScores;
  engineVersion: string;
  strategy: string;
  computedAt: string;
  /** Emitido apenas quando `compute({ trace: true })` é chamado. */
  trace?: import('./trace.js').StrategyTrace;
}

export interface ComputeOptions {
  /** Se verdadeiro, a estratégia deve popular `result.trace`. */
  trace?: boolean;
}

export interface DecisionStrategy {
  readonly name: string;
  compute(inputs: SimulationInputs, options?: ComputeOptions): SimulationResult;
}
