import type {
  Context as SimContext,
  HistoryEntry,
} from '../store/simulation.ts';
import type { SimulationInputs, SimulationResult, StrategyId } from '@ahcf-cps/engine';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

async function request<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) {
    throw new Error('AI_NEEDS_API');
  }
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 503) {
    throw new Error('AI_DISABLED');
  }
  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    const text = await response.text().catch(() => '');
    try {
      const j = JSON.parse(text) as { error?: string; message?: string };
      if (j.error) msg = j.error;
      else if (j.message) msg = j.message;
    } catch {
      if (text) msg = text.slice(0, 400);
    }
    throw new Error(`AI error ${response.status}: ${msg}`);
  }
  return (await response.json()) as T;
}

export interface AiConfigResponse {
  enabled: boolean;
  model?: string;
}

export async function fetchAiConfig(): Promise<AiConfigResponse> {
  if (!API_URL) return { enabled: false };
  try {
    const response = await fetch(`${API_URL}/api/v1/ai/config`);
    if (response.status === 503) return { enabled: false };
    if (!response.ok) return { enabled: false };
    return (await response.json()) as AiConfigResponse;
  } catch {
    return { enabled: false };
  }
}

export interface ExplainResponse {
  explanation: string;
  model: string;
}

export async function aiExplain(params: {
  inputs: SimulationInputs;
  result: SimulationResult;
  context?: SimContext;
  locale: 'pt-BR' | 'en';
}): Promise<ExplainResponse> {
  return request<ExplainResponse>('/api/v1/ai/explain', {
    inputs: params.inputs,
    context: params.context,
    result: {
      recommended: params.result.recommended,
      strategy: params.result.strategy,
      ranking: params.result.ranking.map((r) => ({
        method: r.method,
        score: r.score,
        normalized: r.normalized,
      })),
      dimensions: params.result.dimensions,
    },
    locale: params.locale,
  });
}

export interface SuggestStrategyResponse {
  suggested: StrategyId;
  rationale: string;
  model: string;
}

export async function aiSuggestStrategy(params: {
  context?: SimContext;
  notes?: string;
  locale: 'pt-BR' | 'en';
}): Promise<SuggestStrategyResponse> {
  return request<SuggestStrategyResponse>('/api/v1/ai/suggest-strategy', params);
}

export interface GeneratedSimulation {
  label?: string;
  context?: SimContext;
  inputs: SimulationInputs;
}

export interface GenerateResponse {
  simulations: GeneratedSimulation[];
  model: string;
  requested: number;
  returned: number;
}

export async function aiGenerateSimulation(params: {
  count: number;
  scenario?: string;
  locale: 'pt-BR' | 'en';
}): Promise<GenerateResponse> {
  return request<GenerateResponse>('/api/v1/ai/generate-simulation', params);
}

/** Helper para converter uma simulação gerada em HistoryEntry local. */
export function toHistoryEntry(
  sim: GeneratedSimulation,
  result: SimulationResult,
  note?: string,
): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    inputs: sim.inputs,
    context: sim.context ?? {},
    result,
    createdAt: new Date().toISOString(),
    ...(note ? { note } : {}),
  };
}
