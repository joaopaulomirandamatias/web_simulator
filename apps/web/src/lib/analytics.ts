import type { ProgrammingMethod, SectorId } from '@ahcf-cps/engine';
import type { HistoryEntry } from '../store/simulation.ts';

export interface MethodCount {
  method: ProgrammingMethod;
  count: number;
}

export interface SectorBucket {
  sector: SectorId | 'unspecified';
  total: number;
  byMethod: Record<ProgrammingMethod, number>;
}

export interface AverageDimensions {
  safety: number;
  ergonomic: number;
  humanPreference: number;
  performance: number;
  taskComplexity: number;
}

export interface HistoryStats {
  total: number;
  byMethod: MethodCount[];
  bySector: SectorBucket[];
  byStrategy: Array<{ strategy: string; count: number }>;
  averageDimensions: AverageDimensions;
  averageAdequacy: number;
}

const emptyByMethod = (): Record<ProgrammingMethod, number> => ({
  conventional: 0,
  parameterized: 0,
  pbd: 0,
  kinesthetic: 0,
  xr: 0,
  shared_control: 0,
});

export function summarizeHistory(entries: readonly HistoryEntry[]): HistoryStats {
  const byMethod = emptyByMethod();
  const bySectorMap = new Map<string, SectorBucket>();
  const byStrategyMap = new Map<string, number>();
  const sumDims: AverageDimensions = {
    safety: 0,
    ergonomic: 0,
    humanPreference: 0,
    performance: 0,
    taskComplexity: 0,
  };
  let sumAdequacy = 0;

  for (const entry of entries) {
    byMethod[entry.result.recommended] += 1;
    byStrategyMap.set(
      entry.result.strategy,
      (byStrategyMap.get(entry.result.strategy) ?? 0) + 1,
    );
    const sectorKey = entry.context.sector ?? 'unspecified';
    const existing =
      bySectorMap.get(sectorKey) ??
      ({
        sector: sectorKey as SectorId | 'unspecified',
        total: 0,
        byMethod: emptyByMethod(),
      } satisfies SectorBucket);
    existing.total += 1;
    existing.byMethod[entry.result.recommended] += 1;
    bySectorMap.set(sectorKey, existing);

    sumDims.safety += entry.result.dimensions.safety;
    sumDims.ergonomic += entry.result.dimensions.ergonomic;
    sumDims.humanPreference += entry.result.dimensions.humanPreference;
    sumDims.performance += entry.result.dimensions.performance;
    sumDims.taskComplexity += entry.result.dimensions.taskComplexity;

    const top = entry.result.ranking[0];
    if (top) sumAdequacy += top.normalized;
  }

  const total = entries.length || 1;
  return {
    total: entries.length,
    byMethod: (Object.keys(byMethod) as ProgrammingMethod[])
      .map((m) => ({ method: m, count: byMethod[m] }))
      .sort((a, b) => b.count - a.count),
    bySector: [...bySectorMap.values()].sort((a, b) => b.total - a.total),
    byStrategy: [...byStrategyMap.entries()]
      .map(([strategy, count]) => ({ strategy, count }))
      .sort((a, b) => b.count - a.count),
    averageDimensions: {
      safety: sumDims.safety / total,
      ergonomic: sumDims.ergonomic / total,
      humanPreference: sumDims.humanPreference / total,
      performance: sumDims.performance / total,
      taskComplexity: sumDims.taskComplexity / total,
    },
    averageAdequacy: sumAdequacy / total,
  };
}
