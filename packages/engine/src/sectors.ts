import type { LinearWeights } from './strategies/linear.js';
import { DEFAULT_PAIRWISE, type PairwiseMatrix } from './strategies/ahp.js';

/**
 * Perfis de calibração setorial — pesos recomendados para LinearStrategy
 * e matrizes AHP iniciais.
 *
 * Valores derivados da RSL do AHCF-CPS (Matias, 2026), combinando:
 *  - Setores com maior sensibilidade a segurança (ex.: farmacêutico).
 *  - Setores com alta variabilidade (ex.: logístico, agroindustrial).
 *  - Setores com pressão por tempo de ciclo (ex.: automotivo).
 *
 * Cada perfil pode ser sobrescrito em runtime via payload da API.
 */
export type SectorId =
  | 'generic'
  | 'automotive'
  | 'pharmaceutical'
  | 'logistics'
  | 'electronics'
  | 'agroindustrial'
  | 'metalmechanical';

export interface SectorProfile {
  id: SectorId;
  label: {
    'pt-BR': string;
    en: string;
  };
  linearWeights: LinearWeights;
  ahpMatrix: PairwiseMatrix;
  notes: string;
}

const invert = (m: PairwiseMatrix): PairwiseMatrix => {
  const copy: PairwiseMatrix = {
    safety: { ...m.safety },
    ergonomic: { ...m.ergonomic },
    humanPreference: { ...m.humanPreference },
    performance: { ...m.performance },
    taskComplexity: { ...m.taskComplexity },
  };
  for (const row of Object.keys(copy) as (keyof PairwiseMatrix)[]) {
    for (const col of Object.keys(copy[row]) as (keyof PairwiseMatrix)[]) {
      if (row !== col && copy[row][col] !== 1 / copy[col][row]) {
        copy[col][row] = 1 / copy[row][col];
      }
    }
  }
  return copy;
};

export const SECTOR_PROFILES: Readonly<Record<SectorId, SectorProfile>> = {
  generic: {
    id: 'generic',
    label: { 'pt-BR': 'Genérico', en: 'Generic' },
    linearWeights: {
      safety: 1.2,
      ergonomic: 1.0,
      humanPreference: 1.0,
      performance: 1.0,
      taskComplexity: 1.0,
      cost: 0.8,
    },
    ahpMatrix: DEFAULT_PAIRWISE,
    notes: 'Default balanceado; use quando o setor não está definido.',
  },
  automotive: {
    id: 'automotive',
    label: { 'pt-BR': 'Automotivo', en: 'Automotive' },
    linearWeights: {
      safety: 1.3,
      ergonomic: 1.1,
      humanPreference: 0.9,
      performance: 1.3,
      taskComplexity: 1.0,
      cost: 0.7,
    },
    ahpMatrix: invert({
      safety: { safety: 1, ergonomic: 2, humanPreference: 3, performance: 2, taskComplexity: 2 },
      ergonomic: { safety: 1 / 2, ergonomic: 1, humanPreference: 2, performance: 1, taskComplexity: 1 },
      humanPreference: {
        safety: 1 / 3,
        ergonomic: 1 / 2,
        humanPreference: 1,
        performance: 1 / 2,
        taskComplexity: 1 / 2,
      },
      performance: {
        safety: 1 / 2,
        ergonomic: 1,
        humanPreference: 2,
        performance: 1,
        taskComplexity: 1,
      },
      taskComplexity: {
        safety: 1 / 2,
        ergonomic: 1,
        humanPreference: 2,
        performance: 1,
        taskComplexity: 1,
      },
    }),
    notes: 'Pressão forte por tempo de ciclo e segurança normativa.',
  },
  pharmaceutical: {
    id: 'pharmaceutical',
    label: { 'pt-BR': 'Farmacêutico', en: 'Pharmaceutical' },
    linearWeights: {
      safety: 1.5,
      ergonomic: 1.1,
      humanPreference: 1.0,
      performance: 1.0,
      taskComplexity: 1.2,
      cost: 0.7,
    },
    ahpMatrix: invert({
      safety: { safety: 1, ergonomic: 3, humanPreference: 4, performance: 3, taskComplexity: 2 },
      ergonomic: { safety: 1 / 3, ergonomic: 1, humanPreference: 2, performance: 1, taskComplexity: 1 },
      humanPreference: {
        safety: 1 / 4,
        ergonomic: 1 / 2,
        humanPreference: 1,
        performance: 1 / 2,
        taskComplexity: 1 / 2,
      },
      performance: {
        safety: 1 / 3,
        ergonomic: 1,
        humanPreference: 2,
        performance: 1,
        taskComplexity: 1,
      },
      taskComplexity: {
        safety: 1 / 2,
        ergonomic: 1,
        humanPreference: 2,
        performance: 1,
        taskComplexity: 1,
      },
    }),
    notes: 'Regulamentação GMP e rastreabilidade aumentam o peso de segurança e complexidade.',
  },
  logistics: {
    id: 'logistics',
    label: { 'pt-BR': 'Logística', en: 'Logistics' },
    linearWeights: {
      safety: 1.2,
      ergonomic: 1.3,
      humanPreference: 1.1,
      performance: 1.2,
      taskComplexity: 1.1,
      cost: 0.9,
    },
    ahpMatrix: DEFAULT_PAIRWISE,
    notes: 'Tarefas de manipulação — ergonomia e performance em destaque.',
  },
  electronics: {
    id: 'electronics',
    label: { 'pt-BR': 'Eletroeletrônico', en: 'Electronics' },
    linearWeights: {
      safety: 1.0,
      ergonomic: 1.0,
      humanPreference: 1.1,
      performance: 1.2,
      taskComplexity: 1.3,
      cost: 0.8,
    },
    ahpMatrix: DEFAULT_PAIRWISE,
    notes: 'Alta precisão e miniaturização elevam complexidade da tarefa.',
  },
  agroindustrial: {
    id: 'agroindustrial',
    label: { 'pt-BR': 'Agroindustrial', en: 'Agroindustrial' },
    linearWeights: {
      safety: 1.1,
      ergonomic: 1.4,
      humanPreference: 1.2,
      performance: 1.0,
      taskComplexity: 1.1,
      cost: 1.0,
    },
    ahpMatrix: DEFAULT_PAIRWISE,
    notes: 'Ergonomia central (Wu et al., 2025); ambientes variáveis e restrição de custo.',
  },
  metalmechanical: {
    id: 'metalmechanical',
    label: { 'pt-BR': 'Metalmecânico', en: 'Metalmechanical' },
    linearWeights: {
      safety: 1.3,
      ergonomic: 1.2,
      humanPreference: 1.0,
      performance: 1.1,
      taskComplexity: 1.2,
      cost: 0.9,
    },
    ahpMatrix: DEFAULT_PAIRWISE,
    notes: 'Cargas maiores e risco mecânico — safety + ergonomic elevados.',
  },
};

export const SECTOR_IDS = Object.keys(SECTOR_PROFILES) as SectorId[];

export function getSectorProfile(id: SectorId | string | undefined): SectorProfile {
  if (id && id in SECTOR_PROFILES) return SECTOR_PROFILES[id as SectorId];
  return SECTOR_PROFILES.generic;
}
