export * from './types.js';
export * from './methods.js';
export * from './sectors.js';
export * from './trace.js';
export {
  LinearStrategy,
  DEFAULT_WEIGHTS,
  ENGINE_VERSION,
  computeDimensionScores,
} from './strategies/linear.js';
export type { LinearWeights } from './strategies/linear.js';
export {
  AhpStrategy,
  DEFAULT_PAIRWISE,
  priorityVector,
  consistencyRatio,
} from './strategies/ahp.js';
export type { PairwiseMatrix } from './strategies/ahp.js';
export { TopsisStrategy } from './strategies/topsis.js';

import { AhpStrategy } from './strategies/ahp.js';
import { TopsisStrategy } from './strategies/topsis.js';
import { getSectorProfile, type SectorId } from './sectors.js';
import { LinearStrategy } from './strategies/linear.js';
import type { DecisionStrategy, SimulationInputs, SimulationResult } from './types.js';

export type StrategyId = 'linear' | 'ahp' | 'topsis';

export interface RunOptions {
  strategy?: StrategyId;
  sector?: SectorId;
  /** Quando verdadeiro, o resultado inclui um `trace` passo-a-passo. */
  trace?: boolean;
}

/**
 * Conveniência: roda a estratégia escolhida sobre os inputs.
 *
 * Para cenários avançados (TOPSIS, Fuzzy), adicione novas estratégias
 * em `strategies/` e registre aqui.
 */
export function runSimulation(
  inputs: SimulationInputs,
  options: RunOptions | DecisionStrategy = {},
): SimulationResult {
  if (typeof (options as DecisionStrategy).compute === 'function') {
    return (options as DecisionStrategy).compute(inputs);
  }
  const opts = options as RunOptions;
  const sector = getSectorProfile(opts.sector);
  let strategy: DecisionStrategy;
  switch (opts.strategy) {
    case 'ahp':
      strategy = new AhpStrategy(sector.ahpMatrix);
      break;
    case 'topsis':
      strategy = TopsisStrategy.fromMatrix(sector.ahpMatrix);
      break;
    default:
      strategy = new LinearStrategy(sector.linearWeights);
  }
  return strategy.compute(inputs, { trace: opts.trace });
}
