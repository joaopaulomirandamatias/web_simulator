import type { SectorId, SimulationInputs, SimulationResult, StrategyId } from '@ahcf-cps/engine';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Context {
  sector?: SectorId;
  process?: string;
  taskType?: string;
  operators?: number;
  cobotModel?: string;
  productionVolume?: string;
  lotType?: 'HMLV' | 'HVLM' | 'mixed';
}

const DEFAULT_INPUTS: SimulationInputs = {
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

export interface HistoryEntry {
  id: string;
  context: Context;
  inputs: SimulationInputs;
  result: SimulationResult;
  createdAt: string;
  /** Ex.: título do cenário no teste com IA (rastreio / análise) */
  note?: string;
}

interface SimulationState {
  context: Context;
  inputs: SimulationInputs;
  strategy: StrategyId;
  operatorMode: boolean;
  lastResult: SimulationResult | null;
  history: HistoryEntry[];
  setContext: (patch: Partial<Context>) => void;
  setInput: <K extends keyof SimulationInputs>(key: K, value: SimulationInputs[K]) => void;
  setStrategy: (strategy: StrategyId) => void;
  toggleOperatorMode: () => void;
  setResult: (result: SimulationResult) => void;
  saveEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      context: {},
      inputs: DEFAULT_INPUTS,
      strategy: 'linear',
      operatorMode: false,
      lastResult: null,
      history: [],
      setContext: (patch) => set((s) => ({ context: { ...s.context, ...patch } })),
      setInput: (key, value) => set((s) => ({ inputs: { ...s.inputs, [key]: value } })),
      setStrategy: (strategy) => set({ strategy }),
      toggleOperatorMode: () => set((s) => ({ operatorMode: !s.operatorMode })),
      setResult: (result) => set({ lastResult: result }),
      saveEntry: (entry) => set((s) => ({ history: [entry, ...s.history].slice(0, 50) })),
      removeEntry: (id) =>
        set((s) => ({ history: s.history.filter((entry) => entry.id !== id) })),
      clearHistory: () => set({ history: [] }),
      reset: () => set({ context: {}, inputs: DEFAULT_INPUTS, lastResult: null }),
    }),
    {
      name: 'ahcf-cps-simulation',
      partialize: (s) => ({
        history: s.history,
        context: s.context,
        inputs: s.inputs,
        strategy: s.strategy,
        operatorMode: s.operatorMode,
      }),
    },
  ),
);
