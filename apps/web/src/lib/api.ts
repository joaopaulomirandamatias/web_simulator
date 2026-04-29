import { runSimulation, type SimulationResult, type StrategyId } from '@ahcf-cps/engine';
import type { Context, HistoryEntry } from '../store/simulation.ts';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export interface CalculatePayload {
  inputs: Parameters<typeof runSimulation>[0];
  context: Context;
  strategy: StrategyId;
  trace?: boolean;
}

/**
 * Executa uma simulação.
 * Se `VITE_API_URL` estiver definido, delega ao backend; caso contrário,
 * roda a engine localmente — útil para demos e validação empírica offline.
 */
export async function calculateSimulation(
  payload: CalculatePayload,
): Promise<HistoryEntry> {
  if (API_URL) {
    const response = await fetch(`${API_URL}/api/v1/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }
    return (await response.json()) as HistoryEntry;
  }
  const result: SimulationResult = runSimulation(payload.inputs, {
    strategy: payload.strategy,
    sector: payload.context.sector,
    trace: payload.trace,
  });
  return {
    id: crypto.randomUUID(),
    context: payload.context,
    inputs: payload.inputs,
    result,
    createdAt: new Date().toISOString(),
  };
}
