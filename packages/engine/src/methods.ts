import type { ProgrammingMethod } from './types.js';

/**
 * Taxonomia dos métodos de programação (Seção 6.2 do artigo AHCF-CPS).
 *
 * Cada método tem um perfil de aderência nas cinco dimensões do framework,
 * derivado das evidências empíricas da Revisão Sistemática da Literatura.
 * Valores ∈ [0, 1] representam a força da sinergia entre o método e a
 * dimensão — quanto maior, mais o método se beneficia daquela característica
 * do contexto.
 *
 * Esses coeficientes podem ser recalibrados por setor (ver PLANEJAMENTO.md §15).
 */
export interface MethodProfile {
  id: ProgrammingMethod;
  label: string;
  description: string;
  /** Coeficientes de afinidade por dimensão ∈ [0, 1]. */
  affinities: {
    safety: number;
    ergonomic: number;
    humanPreference: number;
    performance: number;
    taskComplexity: number;
  };
  /** Quanto o método é sensível à restrição de custo (quanto maior, mais caro). */
  costFactor: number;
  pros: readonly string[];
  cons: readonly string[];
  references: readonly string[];
}

export const METHOD_PROFILES: Readonly<Record<ProgrammingMethod, MethodProfile>> = {
  conventional: {
    id: 'conventional',
    label: 'Programação convencional / offline',
    description:
      'Código pré-definido por especialista. Alta previsibilidade e precisão em processos estáveis.',
    affinities: {
      safety: 0.75,
      ergonomic: 0.3,
      humanPreference: 0.25,
      performance: 0.9,
      taskComplexity: 0.35,
    },
    costFactor: 0.2,
    pros: [
      'Alta previsibilidade e controle fino',
      'Robusto em processos estáveis e repetitivos',
      'Menor custo inicial de hardware',
    ],
    cons: [
      'Reprogramação lenta e dependente de especialista',
      'Baixa flexibilidade frente à variabilidade',
    ],
    references: ['El Zaatari et al. (2019)'],
  },
  parameterized: {
    id: 'parameterized',
    label: 'Programação parametrizada',
    description:
      'Operador ajusta parâmetros de comportamento (velocidade, pausa, alocação) sem escrever código.',
    affinities: {
      safety: 0.7,
      ergonomic: 0.55,
      humanPreference: 0.55,
      performance: 0.75,
      taskComplexity: 0.5,
    },
    costFactor: 0.3,
    pros: [
      'Reconfiguração rápida pelo operador',
      'Balanço entre controle técnico e acessibilidade',
      'Compatível com operadores não especialistas',
    ],
    cons: [
      'Limitado ao espaço de parâmetros disponíveis',
      'Requer interface bem desenhada',
    ],
    references: ['Giberti et al. (2022)', 'Wolffgramm et al. (2024)'],
  },
  pbd: {
    id: 'pbd',
    label: 'Programming by Demonstration (PbD)',
    description:
      'Operador ensina a tarefa por demonstração direta — ideal para transferir know-how tácito.',
    affinities: {
      safety: 0.6,
      ergonomic: 0.7,
      humanPreference: 0.8,
      performance: 0.65,
      taskComplexity: 0.75,
    },
    costFactor: 0.45,
    pros: [
      'Intuitivo e acessível ao chão de fábrica',
      'Transferência de know-how tácito',
      'Adaptação rápida a novos produtos',
    ],
    cons: [
      'Variabilidade entre demonstrações',
      'Depende da qualidade do instrutor humano',
    ],
    references: ['Arrais et al. (2021)', 'Al-Yacoub et al. (2021)'],
  },
  kinesthetic: {
    id: 'kinesthetic',
    label: 'Ensino cinestésico multimodal',
    description:
      'Operador guia fisicamente o cobot, ensinando trajetória e comportamento mecânico (compliance).',
    affinities: {
      safety: 0.65,
      ergonomic: 0.75,
      humanPreference: 0.85,
      performance: 0.6,
      taskComplexity: 0.7,
    },
    costFactor: 0.5,
    pros: [
      'Interação natural baseada em intenção',
      'Ensina também dinâmica e compliance',
      'Alta aceitação por operadores experientes',
    ],
    cons: [
      'Pode exigir sensores específicos (sEMG, vibrotátil)',
      'Curva de aprendizado para comportamentos complexos',
    ],
    references: ['Meattini et al. (2025)'],
  },
  xr: {
    id: 'xr',
    label: 'Interfaces imersivas (XR / AR / VR)',
    description:
      'Visualização intuitiva de trajetórias e zonas seguras em realidade estendida.',
    affinities: {
      safety: 0.7,
      ergonomic: 0.75,
      humanPreference: 0.7,
      performance: 0.55,
      taskComplexity: 0.5,
    },
    costFactor: 0.85,
    pros: [
      'Visualização intuitiva e treinamento remoto',
      'Reduz demanda física',
      'Permite ensaios sem risco',
    ],
    cons: [
      'Custo inicial elevado',
      'Precisão espacial limitada em tarefas finas',
      'Requer maturidade digital',
    ],
    references: ['Chan et al. (2022)', 'Angleraud et al. (2021)', 'Nguyen et al. (2026)'],
  },
  shared_control: {
    id: 'shared_control',
    label: 'Shared Control / Planejamento adaptativo',
    description:
      'Humano e robô dividem autoridade em tempo real, com IA ajustando trajetória, segurança e alocação.',
    affinities: {
      safety: 0.85,
      ergonomic: 0.8,
      humanPreference: 0.75,
      performance: 0.75,
      taskComplexity: 0.9,
    },
    costFactor: 0.75,
    pros: [
      'Altíssima adaptabilidade a contextos dinâmicos',
      'Combina julgamento humano com otimização algorítmica',
      'Ajusta-se a preferências de liderar/seguir',
    ],
    cons: [
      'Complexidade sistêmica',
      'Requer maturidade digital e dados de sensores',
      'Transparência exige esforço adicional (XAI)',
    ],
    references: [
      'Bagheri et al. (2022)',
      'Noormohammadi-Asl et al. (2025)',
      'Proia et al. (2025)',
    ],
  },
};
