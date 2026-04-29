import type { ProgrammingMethod, SectorId } from '@ahcf-cps/engine';

export type Locale = 'pt-BR' | 'en';

export const LOCALES: readonly Locale[] = ['pt-BR', 'en'];

export interface InputCopy {
  label: string;
  hint: string;
  low: string;
  high: string;
}

export interface Translations {
  appName: string;
  tagline: string;
  slogan: string;
  skipToContent: string;
  strategy: {
    label: string;
    linear: string;
    ahp: string;
    topsis: string;
    descriptions: {
      linear: {
        summary: string;
        useWhen: string;
        pros: string;
        cons: string;
      };
      ahp: {
        summary: string;
        useWhen: string;
        pros: string;
        cons: string;
      };
      topsis: {
        summary: string;
        useWhen: string;
        pros: string;
        cons: string;
      };
    };
    sectionTitle: string;
    useWhenLabel: string;
    prosLabel: string;
    consLabel: string;
  };
  operatorMode: {
    toggle: string;
    on: string;
    off: string;
  };
  common: {
    loading: string;
    language: string;
    intermediateMatrices: string;
    aiThinking: string;
    aiDisabled: string;
    aiNeedsApi: string;
    apply: string;
    cancel: string;
    retry: string;
    close: string;
    ranking: string;
    dimensionsProfile: string;
  };
  nav: {
    home: string;
    newSimulation: string;
    history: string;
    dashboard: string;
    login: string;
    logout: string;
    settings: string;
    aiTest: string;
  };
  settings: {
    title: string;
    close: string;
    explainToggleLabel: string;
    explainToggleDesc: string;
    explainDisabledByDeploy: string;
    communityNote: string;
    aiSectionTitle: string;
    aiToggleLabel: string;
    aiToggleDesc: string;
    aiDisabledByDeploy: string;
    aiWarning: string;
    aiModelLabel: string;
  };
  ai: {
    explainCta: string;
    suggestCta: string;
    suggestPromptLabel: string;
    suggestNotesPlaceholder: string;
    suggestResultTitle: string;
    suggestApply: string;
    testPageTitle: string;
    testPageSubtitle: string;
    testCount: string;
    testScenario: string;
    testScenarioPlaceholder: string;
    testGenerate: string;
    testGenerating: string;
    testApplyToInputs: string;
    testRunBatch: string;
    testRunning: string;
    /** Só recalcula o motor com a estratégia atual; não grava de novo no histórico */
    testRecalcOnly: string;
    testHintSaved: string;
    testEmpty: string;
    poweredBy: string;
    badge: string;
    unavailable: string;
  };
  explain: {
    cta: string;
    close: string;
    title: string;
    disclaimer: string;
    sectionInputs: string;
    sectionDimensions: string;
    sectionStrategy: string;
    sectionRules: string;
    sectionResult: string;
    inputLabel: string;
    dimensionFormula: string;
    weights: string;
    priorities: string;
    consistencyRatio: string;
    method: string;
    affinities: string;
    contributions: string;
    rawSum: string;
    costPenalty: string;
    preRuleScore: string;
    finalScore: string;
    normalized: string;
    decisionRow: string;
    normalizedRow: string;
    weightedRow: string;
    idealPositive: string;
    idealNegative: string;
    distancePlus: string;
    distanceMinus: string;
    closeness: string;
    noRules: string;
    ruleId: string;
    ruleMethod: string;
    ruleMultiplier: string;
    ruleReason: string;
    columnNorms: string;
    formulaLinear: string;
    formulaAhp: string;
    formulaTopsis: string;
    toggleOff: string;
    formulaArticleTitle: string;
    formulaSpecializedTitle: string;
    formulaArticleCaption: string;
    formulaLinearCaption: string;
    formulaAhpCaption: string;
    formulaTopsisCaption: string;
    formulaLegendTitle: string;
    revisionsTitle: string;
    revisionsIntro: string;
    revisionsLink: string;
    revisions: {
      r1: string;
      r2: string;
      r3: string;
      r4: string;
      r5: string;
    };
    formulaLegend: {
      aj: string;
      xi: string;
      hk: string;
      alphaBeta: string;
      wd: string;
      ajd: string;
      dimd: string;
      gamma: string;
      costFactor: string;
      normCost: string;
      priority: string;
      cj: string;
      mStar: string;
    };
    costNote: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    empty: string;
    totalCard: string;
    averageAdequacy: string;
    methodDistribution: string;
    bySector: string;
    sectorColumn: string;
    totalColumn: string;
    topMethodColumn: string;
    byStrategy: string;
    unspecified: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    register: string;
    logoutCta: string;
    signedInAs: string;
    invalidCredentials: string;
    passwordTooShort: string;
    emailInvalid: string;
    roleLabel: string;
    roleOperator: string;
    roleManager: string;
    roleAdmin: string;
    registerTitle: string;
    registerSubmit: string;
    emailTaken: string;
  };
  home: {
    heroTitle: string;
    heroBody: string;
    ctaNew: string;
    ctaHistory: string;
    dimensionsTitle: string;
    dimensions: Record<
      'safety' | 'ergonomic' | 'humanPreference' | 'performance' | 'taskComplexity',
      { title: string; desc: string }
    >;
  };
  inputs: {
    contextTitle: string;
    contextHint: string;
    placeholders: {
      sector: string;
      process: string;
      cobotModel: string;
    };
    sectorLabel: string;
    dimensionsTitle: string;
    back: string;
    calculate: string;
    calculating: string;
    error: string;
    copy: Record<string, InputCopy>;
  };
  result: {
    empty: string;
    start: string;
    recommended: string;
    adequacy: string;
    alerts: string;
    topThree: string;
    justification: string;
    engineLabel: string;
    newSim: string;
    openHistory: string;
    exportPdf: string;
    exportCsv: string;
    sector: string;
    operatorHeadline: string;
    operatorSimple: string;
  };
  history: {
    title: string;
    newSim: string;
    empty: string;
    open: string;
    exportCsv: string;
    filters: {
      all: string;
      sector: string;
      method: string;
      strategy: string;
      clear: string;
      summary: string;
    };
    delete: string;
    clearAll: string;
    clearConfirm: string;
    clearConfirmYes: string;
    clearConfirmNo: string;
  };
  methods: Record<ProgrammingMethod, string>;
  dimensions: {
    safety: string;
    ergonomic: string;
    humanPreference: string;
    performance: string;
    taskComplexity: string;
  };
  sectors: Record<SectorId, string>;
  footer: string;
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  'pt-BR': {
    appName: 'AHCF-CPS',
    tagline: 'Seletor de Programação para Cobots',
    slogan: 'Decida o melhor método para seu cobot em segundos.',
    skipToContent: 'Pular para o conteúdo',
    common: {
      loading: 'Carregando…',
      language: 'Idioma',
      intermediateMatrices: 'D · R · V (matrizes intermediárias)',
      aiThinking: 'A IA está analisando…',
      aiDisabled: 'A IA está desativada neste deploy.',
      aiNeedsApi: 'A IA exige uma API configurada (VITE_API_URL).',
      apply: 'Aplicar',
      cancel: 'Cancelar',
      retry: 'Tentar novamente',
      close: 'Fechar',
      ranking: 'Ranking dos métodos',
      dimensionsProfile: 'Perfil das dimensões AHCF-CPS',
    },
    strategy: {
      label: 'Estratégia de decisão',
      linear: 'Linear ponderada',
      ahp: 'AHP',
      topsis: 'TOPSIS',
      sectionTitle: 'Sobre esta estratégia',
      useWhenLabel: 'Quando usar',
      prosLabel: 'Pontos fortes',
      consLabel: 'Pontos de atenção',
      descriptions: {
        linear: {
          summary:
            'Soma ponderada das cinco dimensões do AHCF-CPS (Safety, Ergonomic, Human Preference, Performance, Task Complexity), com penalidade de custo e regras de negócio RN01–RN09 aplicadas como multiplicadores.',
          useWhen:
            'Quando os pesos entre critérios já estão bem definidos pelo pesquisador ou pelo setor, e quando se deseja um modelo direto e transparente.',
          pros:
            'Simples de auditar; a contribuição de cada critério é visível; ativa as regras de negócio (RN01–RN09); rapidíssima.',
          cons:
            'Assume que os critérios são linearmente comparáveis; calibrar os pesos "à mão" pode ser subjetivo.',
        },
        ahp: {
          summary:
            'Analytic Hierarchy Process — os pesos surgem de uma matriz de comparação pareada entre as cinco dimensões, transformada em vetor de prioridades pela média geométrica das linhas.',
          useWhen:
            'Quando há uma hierarquia clara de critérios e o especialista prefere pensar em termos de "X é quantas vezes mais importante que Y" em vez de escolher pesos numéricos diretos.',
          pros:
            'Fundamenta os pesos em julgamentos relativos; inclui um índice de consistência (CR) para detectar contradições; compatível com perfis setoriais pré-calibrados.',
          cons:
            'A matriz pareada precisa ser consistente (CR ≤ 0,10); não aplica as regras de negócio RN01–RN09 como a estratégia linear.',
        },
        topsis: {
          summary:
            'Technique for Order Preference by Similarity to Ideal Solution — cada método é comparado com uma solução ideal positiva (melhores valores) e uma solução ideal negativa (piores valores); o ranking usa a distância euclidiana em espaço ponderado.',
          useWhen:
            'Quando o foco está em saber o quão próximo cada método está do "melhor possível" para o contexto, em vez de apenas agregar pontuações.',
          pros:
            'Captura trade-offs entre critérios; closeness coefficient ∈ [0, 1] é intuitivo; usa os mesmos pesos setoriais do AHP.',
          cons:
            'Levemente mais custoso que as outras estratégias; sensível a outliers na matriz de decisão.',
        },
      },
    },
    operatorMode: {
      toggle: 'Modo operador',
      on: 'ATIVADO',
      off: 'DESATIVADO',
    },
    nav: {
      home: 'Início',
      newSimulation: 'Nova simulação',
      history: 'Histórico',
      dashboard: 'Painel',
      login: 'Entrar',
      logout: 'Sair',
      settings: 'Preferências',
      aiTest: 'Testes com IA',
    },
    settings: {
      title: 'Preferências',
      close: 'Fechar',
      explainToggleLabel: 'Mostrar botão "Ver cálculo" no resultado',
      explainToggleDesc:
        'Exibe o passo-a-passo matemático (inputs, dimensões, pesos, regras e fórmulas) de cada simulação. Útil para validação acadêmica do framework AHCF-CPS.',
      explainDisabledByDeploy:
        'Este deploy desativou a explicabilidade (VITE_EXPLAIN_ENABLED=false). A preferência só pode ser ajustada em builds que mantenham a feature ativa.',
      communityNote:
        'A comunidade pode desativar permanentemente esta feature em um fork definindo VITE_EXPLAIN_ENABLED=false no build e EXPLAIN_ENABLED=false na API.',
      aiSectionTitle: 'Modo de teste com IA',
      aiToggleLabel: 'Ativar modo de teste assistido por IA',
      aiToggleDesc:
        'Habilita três botões que usam IA (OpenRouter): (1) explicar o resultado em linguagem natural; (2) sugerir a estratégia de decisão mais adequada; (3) gerar simulações sintéticas para validar o sistema. Requer API com AI_ENABLED=true e OPENROUTER_API_KEY configurada.',
      aiDisabledByDeploy:
        'Este deploy desativou a integração com IA (VITE_AI_ENABLED=false ou API sem chave). O modo de teste só aparece quando a infraestrutura está habilitada.',
      aiWarning:
        'As chamadas enviam inputs e contexto da simulação atual para o modelo escolhido via OpenRouter. Não use com dados sensíveis da operação.',
      aiModelLabel: 'Modelo ativo',
    },
    ai: {
      explainCta: 'Explicar com IA',
      suggestCta: 'Sugerir estratégia com IA',
      suggestPromptLabel: 'Observações adicionais (opcional)',
      suggestNotesPlaceholder: 'Ex.: célula compartilhada, operadores rotativos, ISO/TS 15066 obrigatória…',
      suggestResultTitle: 'Recomendação da IA',
      suggestApply: 'Aplicar sugestão',
      testPageTitle: 'Testes com IA — simulações realistas e histórico',
      testPageSubtitle:
        'Gere cenários com base realista; o motor executa na hora e regista entradas no histórico para análise. Requer o modo de teste com IA ativado.',
      testCount: 'Quantidade',
      testScenario: 'Cenário (opcional)',
      testScenarioPlaceholder: 'Ex.: linha de montagem automotiva com alta variabilidade',
      testGenerate: 'Gerar e executar (gravar no histórico)',
      testGenerating: 'Gerando, executando no motor e gravando…',
      testApplyToInputs: 'Carregar no formulário',
      testRunBatch: 'Recalcular só na tela',
      testRunning: 'Recalculando…',
      testRecalcOnly:
        'Aplica a estratégia atual a estes itens, sem duplicar entradas no histórico.',
      testHintSaved: 'Cada simulação válida foi adicionada ao histórico (com nota de origem) para análise.',
      testEmpty: 'Ainda sem cenários. Use o botão acima para gerar e executar o lote.',
      poweredBy: 'via OpenRouter',
      badge: 'IA',
      unavailable: 'IA indisponível. Ative em Preferências após configurar o deploy.',
    },
    explain: {
      cta: 'Ver cálculo e processo',
      close: 'Fechar',
      title: 'Como chegamos a este resultado',
      disclaimer:
        'Esta seção é destinada à validação acadêmica do framework AHCF-CPS. Ela pode ser desativada nas preferências ou via build flag da comunidade.',
      sectionInputs: '1. Inputs informados',
      sectionDimensions: '2. Dimensões AHCF-CPS',
      sectionStrategy: '3. Estratégia aplicada',
      sectionRules: '4. Regras de negócio aplicadas',
      sectionResult: '5. Score final e ranking',
      inputLabel: 'Input',
      dimensionFormula: 'Cada dimensão é calculada a partir das entradas Likert normalizadas para [0, 1].',
      weights: 'Pesos',
      priorities: 'Vetor de prioridades',
      consistencyRatio: 'Consistency Ratio (CR)',
      method: 'Método',
      affinities: 'Afinidades',
      contributions: 'Contribuições w·a·d',
      rawSum: 'Soma bruta',
      costPenalty: 'Penalidade de custo',
      preRuleScore: 'Score antes das regras',
      finalScore: 'Score final',
      normalized: 'Normalizado [0,1]',
      decisionRow: 'D (matriz de decisão)',
      normalizedRow: 'R (normalizada por coluna)',
      weightedRow: 'V (ponderada)',
      idealPositive: 'Solução ideal positiva A⁺',
      idealNegative: 'Solução ideal negativa A⁻',
      distancePlus: 'S⁺ (distância para A⁺)',
      distanceMinus: 'S⁻ (distância para A⁻)',
      closeness: 'Closeness C = S⁻ / (S⁺ + S⁻)',
      noRules: 'Nenhuma regra foi acionada com estas entradas.',
      ruleId: 'Regra',
      ruleMethod: 'Método afetado',
      ruleMultiplier: 'Multiplicador',
      ruleReason: 'Motivo',
      columnNorms: 'Normas das colunas (sqrt(Σ D²))',
      formulaLinear:
        'Score_j = Σ_d (w_d · a_{j,d} · dim_d) − γ · costFactor_j · norm(cost), com regras RN01..RN09 como multiplicadores.',
      formulaAhp:
        'Score_j = Σ_d (priority_d · a_{j,d} · dim_d) − γ · costFactor_j · norm(cost). As prioridades vêm da média geométrica da matriz pareada.',
      formulaTopsis:
        'D → R (norm. por coluna) → V (w·R) → A⁺, A⁻ → S⁺, S⁻ → C = S⁻ / (S⁺ + S⁻). Método recomendado = argmax C.',
      toggleOff:
        'A explicação está desativada. Ative em Preferências para ver o passo-a-passo do cálculo.',
      formulaArticleTitle: 'Fórmula do artigo (§7.9, como publicada)',
      formulaSpecializedTitle: 'Fórmula aplicada após revisões R1–R5',
      formulaArticleCaption:
        'Reprodução literal da fórmula publicada no §7.9. Como publicada, X_i e H_k não dependem de j — logo todos os métodos recebem o mesmo escore e m* = arg max(A_j) fica indefinido. Veja R1 abaixo.',
      formulaLinearCaption:
        'Após as revisões R1–R5 (abaixo), a fórmula passa a discriminar métodos. A_j soma os pesos × afinidade × dimensão; regras RN01–RN09 aplicam multiplicadores. O termo de custo (R4) corrige o sinal do custo presente em §7.9.',
      formulaAhpCaption:
        'Mesma estrutura, com α_i e β_k obtidos da média geométrica de uma matriz pareada entre as dimensões. Consistency Ratio (CR ≤ 0,10) valida a coerência dos julgamentos.',
      formulaTopsisCaption:
        'Forma alternativa mencionada pelo próprio §7.9 como "implementação futura via TOPSIS". D = matriz de decisão; R = normalizada; V = ponderada; A⁺, A⁻ = ideais positivo/negativo.',
      formulaLegendTitle: 'Legenda',
      revisionsTitle:
        'Proposta de revisão ao §7.9 (artigo em desenvolvimento) — com justificativa científica',
      revisionsIntro:
        'A fórmula publicada em §7.9 é um rascunho e, como está, não discrimina métodos. Abaixo, a proposta de revisão e a justificativa de cada ajuste. Documento completo: docs/ARTICLE_REVISION_PROPOSAL.md.',
      revisionsLink: 'Ler a proposta completa (docs/ARTICLE_REVISION_PROPOSAL.md)',
      revisions: {
        r1: 'R1 — Introduzir a afinidade a_{j,·} ∈ [0,1] por método. Justificativa: sem um termo dependente de j, A_j é igual para todos os métodos e o argmax fica indefinido (condição lógica mínima de ranking em MCDM).',
        r2: 'R2 — Fixar o domínio X_i, H_k ∈ [0, 1] com a regra norm(ℓ) = (ℓ − 1)/4 a partir dos Likerts 1–5. Justificativa: reprodutibilidade — dois pesquisadores independentes precisam obter o mesmo A_j.',
        r3: 'R3 — Consolidar X/H nas cinco dimensões do §5.7 (Safety, Ergonomic, Human Preference, Performance, Task Complexity). Justificativa: coerência interna entre §5.7 e §7.9, eliminando sobreposições (segurança aparece em X e como dimensão; ergonomia em H e como dimensão).',
        r4: 'R4 — Substituir "custo" como parcela positiva por termo explícito −γ · c_j · norm(cost). Justificativa: como rascunhado, "mais custo" aumenta o escore de adequação — contrário ao comportamento esperado para uma restrição orçamentária.',
        r5: 'R5 — Formalizar o vínculo método × variáveis via tabela de afinidades para os seis métodos da taxonomia §6.2. Justificativa: a nota do próprio §7.9 ("implementação futura via AHP, TOPSIS…") pressupõe uma matriz alternativas × critérios que hoje não existe na fórmula.',
      },
      formulaLegend: {
        aj: 'adequação (score) do método j',
        xi: 'fator contextual i (segurança, custo, complexidade, flexibilidade…)',
        hk: 'construto humano-robô k (confiança, ergonomia, usabilidade…)',
        alphaBeta: 'pesos ajustáveis das componentes contextual e humano-robô',
        wd: 'peso da dimensão d (α_i / β_k consolidados no AHCF-CPS)',
        ajd: 'afinidade do método j com a dimensão d, ∈ [0, 1]',
        dimd: 'valor da dimensão d para o cenário, ∈ [0, 1]',
        gamma: 'peso global da penalidade de custo (extensão aplicada)',
        costFactor: 'custo relativo do método j, ∈ [0, 1]',
        normCost: 'restrição de custo informada (Likert normalizado)',
        priority: 'prioridade da dimensão d obtida via média geométrica da matriz AHP',
        cj: 'closeness coefficient do TOPSIS — proximidade ao ideal positivo',
        mStar: 'método recomendado = argmax_j(A_j)',
      },
      costNote:
        'Extensão — não previsto diretamente em §7.9, mas coerente com o espírito de m* = argmax(A_j).',
    },
    dashboard: {
      title: 'Dashboard analítico',
      subtitle: 'Visão agregada das simulações deste dispositivo.',
      empty: 'Execute pelo menos uma simulação para ver estatísticas aqui.',
      totalCard: 'Simulações',
      averageAdequacy: 'Adequação média',
      methodDistribution: 'Distribuição por método recomendado',
      bySector: 'Por setor',
      sectorColumn: 'Setor',
      totalColumn: 'Total',
      topMethodColumn: 'Método mais recomendado',
      byStrategy: 'Por estratégia',
      unspecified: 'Não informado',
    },
    login: {
      title: 'Entrar',
      subtitle: 'Autenticação opcional. O simulador funciona sem login.',
      emailLabel: 'E-mail',
      passwordLabel: 'Senha',
      submit: 'Entrar',
      register: 'Criar conta',
      logoutCta: 'Sair',
      signedInAs: 'Logado como',
      invalidCredentials: 'E-mail ou senha inválidos.',
      passwordTooShort: 'A senha precisa ter ao menos 8 caracteres.',
      emailInvalid: 'E-mail inválido.',
      roleLabel: 'Perfil',
      roleOperator: 'Operador',
      roleManager: 'Gestor',
      roleAdmin: 'Administrador',
      registerTitle: 'Criar conta',
      registerSubmit: 'Cadastrar',
      emailTaken: 'Este e-mail já está cadastrado.',
    },
    home: {
      heroTitle: 'Decida o melhor método para seu cobot em segundos.',
      heroBody:
        'O AHCF-CPS Web Simulator operacionaliza o framework adaptativo e centrado no humano para Human-Robot Collaboration industrial. Preencha o contexto produtivo e receba um ranking fundamentado dos seis métodos de programação — com justificativa por dimensão e alertas de risco.',
      ctaNew: 'Nova simulação →',
      ctaHistory: 'Ver histórico',
      dimensionsTitle: 'Cinco dimensões',
      dimensions: {
        safety: {
          title: 'Safety Score',
          desc: 'Risco operacional e requisitos normativos (ISO 10218 / TS 15066).',
        },
        ergonomic: {
          title: 'Ergonomic Score',
          desc: 'Esforço físico, postura e fadiga.',
        },
        humanPreference: {
          title: 'Human Preference',
          desc: 'Confiança, experiência e estilo de trabalho.',
        },
        performance: {
          title: 'Performance Score',
          desc: 'Produtividade, qualidade, tempo de ciclo.',
        },
        taskComplexity: {
          title: 'Task Complexity',
          desc: 'Variabilidade, precisão e necessidade decisória.',
        },
      },
    },
    inputs: {
      contextTitle: 'Contexto industrial',
      contextHint: 'Campos opcionais — ajudam a calibrar e documentar a simulação.',
      placeholders: {
        sector: 'Setor',
        process: 'Processo (ex.: montagem)',
        cobotModel: 'Modelo do cobot',
      },
      sectorLabel: 'Setor industrial',
      dimensionsTitle: 'Dimensões do framework (1 a 5)',
      back: 'Voltar',
      calculate: 'Calcular recomendação',
      calculating: 'Calculando…',
      error: 'Erro ao calcular simulação:',
      copy: {
        taskComplexity: {
          label: 'Complexidade da tarefa',
          hint: 'Precisão, número de passos, restrições espaciais.',
          low: 'Trivial',
          high: 'Crítica',
        },
        variability: {
          label: 'Variabilidade do processo',
          hint: 'Troca de produto, sequência ou parâmetros entre lotes.',
          low: 'Estável',
          high: 'High-mix low-volume',
        },
        operatorExperience: {
          label: 'Experiência do operador',
          hint: 'Familiaridade com programação de cobots.',
          low: 'Iniciante',
          high: 'Especialista',
        },
        safetyRequired: {
          label: 'Segurança requerida',
          hint: 'ISO 10218 / ISO-TS 15066, densidade humana no espaço compartilhado.',
          low: 'Baixa',
          high: 'Máxima',
        },
        ergonomicLoad: {
          label: 'Ergonomia / fadiga atual',
          hint: 'Carga percebida antes da automação.',
          low: 'Ótima',
          high: 'Crítica',
        },
        resourcesAvailable: {
          label: 'Recursos tecnológicos',
          hint: 'Maturidade digital, disponibilidade de sensores e integração.',
          low: 'Escassos',
          high: 'Abundantes',
        },
        productivityGoal: {
          label: 'Meta de produtividade',
          hint: 'Pressão de tempo de ciclo.',
          low: 'Moderada',
          high: 'Agressiva',
        },
        costConstraint: {
          label: 'Restrição de custo',
          hint: 'Limite de CAPEX para a solução colaborativa.',
          low: 'Sem restrição',
          high: 'Custo mínimo',
        },
        leadershipPreference: {
          label: 'Preferência liderar × seguir',
          hint: 'Estilo preferido do operador (Noormohammadi-Asl et al., 2025).',
          low: 'Seguir',
          high: 'Liderar',
        },
        transparencyNeed: {
          label: 'Demanda por transparência',
          hint: 'Necessidade de explicação das decisões do cobot (Bagheri et al., 2022).',
          low: 'Baixa',
          high: 'Alta',
        },
      },
    },
    result: {
      empty: 'Nenhuma simulação recente.',
      start: 'Iniciar simulação',
      recommended: 'Método recomendado',
      adequacy: 'Adequação',
      alerts: 'Alertas:',
      topThree: 'Top 3 recomendações',
      justification: 'Justificativa por dimensão (método recomendado)',
      engineLabel: 'Engine',
      newSim: 'Nova simulação',
      openHistory: 'Ver histórico',
      exportPdf: 'Exportar PDF',
      exportCsv: 'Exportar CSV',
      sector: 'Setor',
      operatorHeadline: 'Para o operador:',
      operatorSimple:
        'Use este método agora. Ele equilibra melhor segurança, ergonomia e produtividade para o seu caso.',
    },
    history: {
      title: 'Histórico de simulações',
      newSim: 'Nova simulação',
      empty: 'Sem simulações registradas ainda.',
      open: 'Abrir',
      exportCsv: 'Exportar CSV (anonimizado)',
      filters: {
        all: 'Todos',
        sector: 'Setor',
        method: 'Método',
        strategy: 'Estratégia',
        clear: 'Limpar filtros',
        summary: 'Mostrando {shown} de {total} simulações',
      },
      delete: 'Remover',
      clearAll: 'Limpar histórico',
      clearConfirm:
        'Tem certeza que deseja apagar todas as simulações deste navegador? Esta ação não pode ser desfeita.',
      clearConfirmYes: 'Sim, apagar tudo',
      clearConfirmNo: 'Cancelar',
    },
    methods: {
      conventional: 'Convencional / Offline',
      parameterized: 'Parametrizada',
      pbd: 'Programming by Demonstration',
      kinesthetic: 'Cinestésico Multimodal',
      xr: 'Interfaces Imersivas (XR)',
      shared_control: 'Shared Control / Adaptive AI',
    },
    dimensions: {
      safety: 'Segurança',
      ergonomic: 'Ergonomia',
      humanPreference: 'Pref. humana',
      performance: 'Performance',
      taskComplexity: 'Complexidade',
    },
    sectors: {
      generic: 'Genérico',
      automotive: 'Automotivo',
      pharmaceutical: 'Farmacêutico',
      logistics: 'Logística',
      electronics: 'Eletroeletrônico',
      agroindustrial: 'Agroindustrial',
      metalmechanical: 'Metalmecânico',
    },
    footer: 'AHCF-CPS Web Simulator · MIT License',
  },
  en: {
    appName: 'AHCF-CPS',
    tagline: 'Cobot Programming Selector',
    slogan: 'Decide the best method for your cobot in seconds.',
    skipToContent: 'Skip to content',
    common: {
      loading: 'Loading…',
      language: 'Language',
      intermediateMatrices: 'D · R · V (intermediate matrices)',
      aiThinking: 'AI is analyzing…',
      aiDisabled: 'AI is disabled on this deploy.',
      aiNeedsApi: 'AI requires a configured API (VITE_API_URL).',
      apply: 'Apply',
      cancel: 'Cancel',
      retry: 'Retry',
      close: 'Close',
      ranking: 'Method ranking',
      dimensionsProfile: 'AHCF-CPS dimensions profile',
    },
    strategy: {
      label: 'Decision strategy',
      linear: 'Weighted linear',
      ahp: 'AHP',
      topsis: 'TOPSIS',
      sectionTitle: 'About this strategy',
      useWhenLabel: 'When to use',
      prosLabel: 'Strengths',
      consLabel: 'Watch out for',
      descriptions: {
        linear: {
          summary:
            'Weighted sum over the five AHCF-CPS dimensions (Safety, Ergonomic, Human Preference, Performance, Task Complexity), with a cost penalty and business rules RN01–RN09 applied as multipliers.',
          useWhen:
            'When weights between criteria are already well defined by the researcher or sector, and you want a direct, transparent model.',
          pros:
            'Easy to audit; the contribution of each criterion is visible; activates the business rules (RN01–RN09); very fast.',
          cons:
            'Assumes criteria are linearly comparable; hand-tuned weights can be subjective.',
        },
        ahp: {
          summary:
            'Analytic Hierarchy Process — weights arise from a pairwise comparison matrix among the five dimensions, turned into a priority vector via the geometric mean of the rows.',
          useWhen:
            'When there is a clear hierarchy of criteria and the expert prefers to reason as "X is how many times more important than Y" instead of picking direct numeric weights.',
          pros:
            'Grounds weights in relative judgments; includes a consistency ratio (CR) to detect contradictions; works with the pre-calibrated sector profiles.',
          cons:
            'Pairwise matrix must be consistent (CR ≤ 0.10); it does not apply the RN01–RN09 business rules like the linear strategy.',
        },
        topsis: {
          summary:
            'Technique for Order Preference by Similarity to Ideal Solution — each method is compared against a positive ideal (best values) and a negative ideal (worst values); ranking uses Euclidean distance in a weighted space.',
          useWhen:
            'When the focus is on how close each method is to the "best possible" for the context, rather than aggregating raw scores.',
          pros:
            'Captures trade-offs across criteria; closeness coefficient ∈ [0, 1] is intuitive; shares the AHP sector weights.',
          cons:
            'Slightly more expensive than the others; sensitive to outliers in the decision matrix.',
        },
      },
    },
    operatorMode: {
      toggle: 'Operator mode',
      on: 'ON',
      off: 'OFF',
    },
    nav: {
      home: 'Home',
      newSimulation: 'New simulation',
      history: 'History',
      dashboard: 'Dashboard',
      login: 'Sign in',
      logout: 'Sign out',
      settings: 'Preferences',
      aiTest: 'AI test mode',
    },
    settings: {
      title: 'Preferences',
      close: 'Close',
      explainToggleLabel: 'Show the "See calculation" button on results',
      explainToggleDesc:
        'Displays the full step-by-step math (inputs, dimensions, weights, rules, formulas) for each simulation. Useful for academic validation of the AHCF-CPS framework.',
      explainDisabledByDeploy:
        'This deploy has disabled explainability (VITE_EXPLAIN_ENABLED=false). The preference can only be adjusted in builds that keep the feature on.',
      communityNote:
        'The community can permanently disable this feature in a fork by setting VITE_EXPLAIN_ENABLED=false at build time and EXPLAIN_ENABLED=false on the API.',
      aiSectionTitle: 'AI-assisted test mode',
      aiToggleLabel: 'Enable AI-assisted test mode',
      aiToggleDesc:
        'Turns on three AI-powered buttons (via OpenRouter): (1) explain the recommendation in natural language; (2) suggest the best decision strategy; (3) generate synthetic simulations to validate the system. Requires the API to run with AI_ENABLED=true and a valid OPENROUTER_API_KEY.',
      aiDisabledByDeploy:
        'This deploy has disabled AI integration (VITE_AI_ENABLED=false or API without a key). The test mode only appears when the infrastructure is enabled.',
      aiWarning:
        'Calls send the current simulation inputs and context to the chosen model via OpenRouter. Do not use with operationally sensitive data.',
      aiModelLabel: 'Active model',
    },
    ai: {
      explainCta: 'Explain with AI',
      suggestCta: 'Suggest strategy with AI',
      suggestPromptLabel: 'Additional notes (optional)',
      suggestNotesPlaceholder: 'E.g., shared workspace, rotating operators, ISO/TS 15066 mandatory…',
      suggestResultTitle: 'AI recommendation',
      suggestApply: 'Apply suggestion',
      testPageTitle: 'AI test — realistic sims and history',
      testPageSubtitle:
        'Generates believable HRC-style scenarios, runs the engine, and appends the history for analysis. Requires the AI test mode to be enabled.',
      testCount: 'How many',
      testScenario: 'Scenario (optional)',
      testScenarioPlaceholder: 'E.g., automotive assembly line with high variability',
      testGenerate: 'Generate & run (save to history)',
      testGenerating: 'Generating, running the engine, saving…',
      testApplyToInputs: 'Load into form',
      testRunBatch: 'Recalculate on this page only',
      testRunning: 'Recalculating…',
      testRecalcOnly:
        'Re-runs the current strategy for these items without adding new history entries.',
      testHintSaved: 'Each valid case was added to history (with a source tag) for analysis.',
      testEmpty: 'No scenarios yet. Use the button above to generate and run a batch.',
      poweredBy: 'via OpenRouter',
      badge: 'AI',
      unavailable: 'AI unavailable. Enable it in Preferences once the deploy is configured.',
    },
    explain: {
      cta: 'See calculation & process',
      close: 'Close',
      title: 'How we got this result',
      disclaimer:
        'This section exists for academic validation of the AHCF-CPS framework. It can be turned off in preferences or via a community build flag.',
      sectionInputs: '1. Inputs provided',
      sectionDimensions: '2. AHCF-CPS dimensions',
      sectionStrategy: '3. Applied strategy',
      sectionRules: '4. Business rules applied',
      sectionResult: '5. Final score & ranking',
      inputLabel: 'Input',
      dimensionFormula: 'Each dimension is derived from the Likert inputs normalized to [0, 1].',
      weights: 'Weights',
      priorities: 'Priority vector',
      consistencyRatio: 'Consistency Ratio (CR)',
      method: 'Method',
      affinities: 'Affinities',
      contributions: 'Contributions w·a·d',
      rawSum: 'Raw sum',
      costPenalty: 'Cost penalty',
      preRuleScore: 'Score before rules',
      finalScore: 'Final score',
      normalized: 'Normalized [0,1]',
      decisionRow: 'D (decision matrix)',
      normalizedRow: 'R (column-normalized)',
      weightedRow: 'V (weighted)',
      idealPositive: 'Positive ideal A⁺',
      idealNegative: 'Negative ideal A⁻',
      distancePlus: 'S⁺ (distance to A⁺)',
      distanceMinus: 'S⁻ (distance to A⁻)',
      closeness: 'Closeness C = S⁻ / (S⁺ + S⁻)',
      noRules: 'No rule triggered for these inputs.',
      ruleId: 'Rule',
      ruleMethod: 'Affected method',
      ruleMultiplier: 'Multiplier',
      ruleReason: 'Reason',
      columnNorms: 'Column norms (sqrt(Σ D²))',
      formulaLinear:
        'Score_j = Σ_d (w_d · a_{j,d} · dim_d) − γ · costFactor_j · norm(cost), with rules RN01..RN09 as multipliers.',
      formulaAhp:
        'Score_j = Σ_d (priority_d · a_{j,d} · dim_d) − γ · costFactor_j · norm(cost). Priorities come from the geometric mean of the pairwise matrix.',
      formulaTopsis:
        'D → R (column-normalized) → V (w·R) → A⁺, A⁻ → S⁺, S⁻ → C = S⁻ / (S⁺ + S⁻). Recommended = argmax C.',
      toggleOff:
        'Explanation is disabled. Enable it in Preferences to see the step-by-step math.',
      formulaArticleTitle: 'Article formula (§7.9, as published)',
      formulaSpecializedTitle: 'Applied formula after revisions R1–R5',
      formulaArticleCaption:
        'Literal reproduction of the formula published in §7.9. As written, X_i and H_k do not depend on j — so every method gets the same score and m* = arg max(A_j) is undefined. See R1 below.',
      formulaLinearCaption:
        'After revisions R1–R5 (below), the formula can actually discriminate methods. A_j sums weights × affinity × dimension; rules RN01–RN09 apply multipliers. The cost term (R4) fixes the sign of the cost factor implicit in §7.9.',
      formulaAhpCaption:
        'Same structure, with α_i and β_k derived from the geometric mean of a pairwise matrix over the dimensions. Consistency Ratio (CR ≤ 0.10) validates the coherence of the judgments.',
      formulaTopsisCaption:
        'Alternative form explicitly mentioned by §7.9 as "future implementation via TOPSIS". D = decision matrix; R = normalized; V = weighted; A⁺, A⁻ = positive/negative ideals.',
      formulaLegendTitle: 'Legend',
      revisionsTitle:
        'Proposed revision to §7.9 (article in development) — with scientific rationale',
      revisionsIntro:
        'The formula drafted in §7.9 does not yet discriminate between methods. Below, the proposed revisions with rationale for each. Full proposal: docs/ARTICLE_REVISION_PROPOSAL.md.',
      revisionsLink: 'Read the full proposal (docs/ARTICLE_REVISION_PROPOSAL.md)',
      revisions: {
        r1: 'R1 — Introduce per-method affinity a_{j,·} ∈ [0,1]. Rationale: without a j-dependent term, A_j is equal across methods and the argmax is undefined (minimal MCDM ranking condition).',
        r2: 'R2 — Close the domain: X_i, H_k ∈ [0, 1] via norm(ℓ) = (ℓ − 1)/4 from Likert 1–5. Rationale: two independent researchers must obtain the same A_j (reproducibility).',
        r3: 'R3 — Consolidate X/H into the five dimensions of §5.7 (Safety, Ergonomic, Human Preference, Performance, Task Complexity). Rationale: internal coherence — avoids overlap (safety shows up in X and as a dimension; ergonomics in H and as a dimension).',
        r4: 'R4 — Replace positively-summed cost with an explicit term −γ · c_j · norm(cost). Rationale: as drafted, "more cost" raises the score, contrary to what is expected from a budget constraint.',
        r5: 'R5 — Formalize the method × variables link via an affinity table for the six methods of the §6.2 taxonomy. Rationale: §7.9 already mentions "future implementation via AHP, TOPSIS…", which presupposes an alternatives × criteria matrix that the formula does not yet expose.',
      },
      formulaLegend: {
        aj: 'adequacy (score) of method j',
        xi: 'contextual factor i (safety, cost, complexity, flexibility…)',
        hk: 'human-robot construct k (trust, ergonomics, usability…)',
        alphaBeta: 'adjustable weights for contextual and human-robot components',
        wd: 'weight of dimension d (α_i / β_k consolidated in AHCF-CPS)',
        ajd: 'affinity between method j and dimension d, ∈ [0, 1]',
        dimd: 'value of dimension d for the scenario, ∈ [0, 1]',
        gamma: 'global weight of the cost penalty (applied extension)',
        costFactor: 'relative cost of method j, ∈ [0, 1]',
        normCost: 'informed cost constraint (normalized Likert)',
        priority: 'priority of dimension d from the AHP pairwise-matrix geometric mean',
        cj: 'TOPSIS closeness coefficient — proximity to the positive ideal',
        mStar: 'recommended method = argmax_j(A_j)',
      },
      costNote:
        'Extension — not stated directly in §7.9 but consistent with the spirit of m* = argmax(A_j).',
    },
    dashboard: {
      title: 'Analytics dashboard',
      subtitle: 'Aggregated view of this device\u2019s simulations.',
      empty: 'Run at least one simulation to see statistics here.',
      totalCard: 'Simulations',
      averageAdequacy: 'Average adequacy',
      methodDistribution: 'Distribution by recommended method',
      bySector: 'By sector',
      sectorColumn: 'Sector',
      totalColumn: 'Total',
      topMethodColumn: 'Top method',
      byStrategy: 'By strategy',
      unspecified: 'Unspecified',
    },
    login: {
      title: 'Sign in',
      subtitle: 'Authentication is optional. The simulator works without login.',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      submit: 'Sign in',
      register: 'Create account',
      logoutCta: 'Sign out',
      signedInAs: 'Signed in as',
      invalidCredentials: 'Invalid email or password.',
      passwordTooShort: 'Password must have at least 8 characters.',
      emailInvalid: 'Invalid email.',
      roleLabel: 'Role',
      roleOperator: 'Operator',
      roleManager: 'Manager',
      roleAdmin: 'Admin',
      registerTitle: 'Create account',
      registerSubmit: 'Register',
      emailTaken: 'This email is already registered.',
    },
    home: {
      heroTitle: 'Decide the best method for your cobot in seconds.',
      heroBody:
        'The AHCF-CPS Web Simulator operationalizes the adaptive, human-centered framework for industrial Human-Robot Collaboration. Describe the production context and receive a grounded ranking of the six programming methods — with per-dimension justification and risk alerts.',
      ctaNew: 'New simulation →',
      ctaHistory: 'See history',
      dimensionsTitle: 'Five dimensions',
      dimensions: {
        safety: {
          title: 'Safety Score',
          desc: 'Operational risk and normative requirements (ISO 10218 / TS 15066).',
        },
        ergonomic: {
          title: 'Ergonomic Score',
          desc: 'Physical effort, posture, and fatigue.',
        },
        humanPreference: {
          title: 'Human Preference',
          desc: 'Trust, experience, and working style.',
        },
        performance: {
          title: 'Performance Score',
          desc: 'Productivity, quality, cycle time.',
        },
        taskComplexity: {
          title: 'Task Complexity',
          desc: 'Variability, precision, decision load.',
        },
      },
    },
    inputs: {
      contextTitle: 'Industrial context',
      contextHint: 'Optional fields — help calibrate and document the simulation.',
      placeholders: {
        sector: 'Sector',
        process: 'Process (e.g., assembly)',
        cobotModel: 'Cobot model',
      },
      sectorLabel: 'Industrial sector',
      dimensionsTitle: 'Framework dimensions (1 to 5)',
      back: 'Back',
      calculate: 'Calculate recommendation',
      calculating: 'Calculating…',
      error: 'Error while computing simulation:',
      copy: {
        taskComplexity: {
          label: 'Task complexity',
          hint: 'Precision, number of steps, spatial constraints.',
          low: 'Trivial',
          high: 'Critical',
        },
        variability: {
          label: 'Process variability',
          hint: 'Product / sequence / parameter change between batches.',
          low: 'Stable',
          high: 'High-mix low-volume',
        },
        operatorExperience: {
          label: 'Operator experience',
          hint: 'Familiarity with cobot programming.',
          low: 'Novice',
          high: 'Expert',
        },
        safetyRequired: {
          label: 'Safety required',
          hint: 'ISO 10218 / ISO-TS 15066, human density in the shared space.',
          low: 'Low',
          high: 'Maximum',
        },
        ergonomicLoad: {
          label: 'Current ergonomic load',
          hint: 'Perceived load before automation.',
          low: 'Good',
          high: 'Critical',
        },
        resourcesAvailable: {
          label: 'Technology resources',
          hint: 'Digital maturity, sensor availability, integration.',
          low: 'Scarce',
          high: 'Abundant',
        },
        productivityGoal: {
          label: 'Productivity goal',
          hint: 'Cycle-time pressure.',
          low: 'Moderate',
          high: 'Aggressive',
        },
        costConstraint: {
          label: 'Cost constraint',
          hint: 'CAPEX cap for the collaborative solution.',
          low: 'Unconstrained',
          high: 'Minimum cost',
        },
        leadershipPreference: {
          label: 'Lead × follow preference',
          hint: 'Operator collaboration style (Noormohammadi-Asl et al., 2025).',
          low: 'Follow',
          high: 'Lead',
        },
        transparencyNeed: {
          label: 'Transparency need',
          hint: 'Need for explanation of cobot decisions (Bagheri et al., 2022).',
          low: 'Low',
          high: 'High',
        },
      },
    },
    result: {
      empty: 'No recent simulation.',
      start: 'Start a simulation',
      recommended: 'Recommended method',
      adequacy: 'Adequacy',
      alerts: 'Alerts:',
      topThree: 'Top 3 recommendations',
      justification: 'Per-dimension justification (recommended method)',
      engineLabel: 'Engine',
      newSim: 'New simulation',
      openHistory: 'See history',
      exportPdf: 'Export PDF',
      exportCsv: 'Export CSV',
      sector: 'Sector',
      operatorHeadline: 'For the operator:',
      operatorSimple:
        'Use this method now. It offers the best balance of safety, ergonomics, and productivity for your case.',
    },
    history: {
      title: 'Simulation history',
      newSim: 'New simulation',
      empty: 'No simulations recorded yet.',
      open: 'Open',
      exportCsv: 'Export CSV (anonymized)',
      filters: {
        all: 'All',
        sector: 'Sector',
        method: 'Method',
        strategy: 'Strategy',
        clear: 'Clear filters',
        summary: 'Showing {shown} of {total} simulations',
      },
      delete: 'Remove',
      clearAll: 'Clear history',
      clearConfirm:
        'Are you sure you want to erase every simulation stored in this browser? This action cannot be undone.',
      clearConfirmYes: 'Yes, delete all',
      clearConfirmNo: 'Cancel',
    },
    methods: {
      conventional: 'Conventional / Offline',
      parameterized: 'Parameterized',
      pbd: 'Programming by Demonstration',
      kinesthetic: 'Multimodal Kinesthetic',
      xr: 'Immersive Interfaces (XR)',
      shared_control: 'Shared Control / Adaptive AI',
    },
    dimensions: {
      safety: 'Safety',
      ergonomic: 'Ergonomic',
      humanPreference: 'Human Pref.',
      performance: 'Performance',
      taskComplexity: 'Complexity',
    },
    sectors: {
      generic: 'Generic',
      automotive: 'Automotive',
      pharmaceutical: 'Pharmaceutical',
      logistics: 'Logistics',
      electronics: 'Electronics',
      agroindustrial: 'Agroindustrial',
      metalmechanical: 'Metalmechanical',
    },
    footer: 'AHCF-CPS Web Simulator · MIT License',
  },
};
