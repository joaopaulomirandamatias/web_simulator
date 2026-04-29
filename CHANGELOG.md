# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e
o projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added — Iteração 10 (Apresentação do artigo em .pptx)
- Novo script [`scripts/build_slides.js`](./scripts/build_slides.js)
  (pptxgenjs) e [`scripts/render_formula.py`](./scripts/render_formula.py)
  (matplotlib) que geram **18 slides** em formato 16:9 com a mesma
  identidade visual do web simulator (azul navy industrial `#0F172A`
  + accent `#2563EB`).
- **Motif consistente**: barra lateral esquerda azul, faixa superior navy,
  rodapé discreto com paginação em todos os slides internos.
- **Fórmula §7.9** renderizada como PNG em alta resolução via mathtext
  do matplotlib e embutida no slide 13, com legenda de domínios e
  nota das revisões R1–R5.
- **Estrutura dos 18 slides**: capa, problema, RQ1–RQ3, método PRISMA
  com cards numéricos (238→187→63→28), taxonomia de 6 métodos,
  5 dimensões (Safety, Ergonomic, Human Preference, Performance,
  Task Complexity), segurança/ergonomia estruturais, construtos
  humano-robô em 3 colunas, moderadores de complexidade,
  lacuna consolidada (RQ3), apresentação do AHCF-CPS, fórmula
  matemática revisada, compatibilidade com AHP/TOPSIS/Fuzzy/ML,
  contribuições, limitações + estudos futuros, consideração final,
  obrigado.
- **QA**: todas as 17 citações do artigo presentes, nenhuma invenção.
- **Arquivo gerado** em
  `Documents\JOAO PAULO\Mestrado\...\Apresentação dos artigos\AHCF_CPS_Apresentacao.pptx`.

### Added — Iteração 9 (Geração do artigo revisado em .docx)
- Novo script [`scripts/generate_article.py`](./scripts/generate_article.py)
  que lê o artigo original extraído em texto, aplica o patch do §7.9
  proposto em [`docs/ARTICLE_REVISION_PROPOSAL.md`](./docs/ARTICLE_REVISION_PROPOSAL.md),
  comprime cirurgicamente seções de síntese redundantes e emite um
  `Artigo_AHCF_CPS_USP_Revisado_v2.docx` com:
  - **Fórmula §7.9 em OMML nativo do Word** — $A_j$ com Σ, índices,
    superescritos (m*) e a equação de argmax em um segundo bloco.
  - **~8 072 palavras** (alvo 8 000, tolerância < 1%).
  - **Todas as 17 citações do artigo preservadas** (El Zaatari, Bagheri,
    Wolffgramm, Faccio, Proia, Meattini, Noormohammadi-Asl, Wu, Saenz,
    Tassi, Calzavara, Chan, Angleraud, Arrais, Al-Yacoub, Giberti,
    Nguyen).
  - Compressões documentadas: §2 Introdução, §3.1, §3.2.x, §3.3
    consolidada, §3.4, §3.6, §3.7, §5.x, §6.1, §6.2, §6.4, §6.5, §6.6,
    §6.7, §6.9, §7.1, §7.3, §7.4, §7.5, §7.6, §7.7, §7.13, §8.1, §8.2,
    §8.3 (subseções merged) e §8.4.
  - Sem inventar conteúdo: cada compressão é reescrita mais concisa de
    frases já presentes, com os mesmos dados, autores e anos.
- **Dependência Python**: `python-docx` para emitir o .docx e para
  injetar OMML via `docx.oxml`.
- **Arquivo gerado** em
  `C:\Users\DETRAN\Documents\JOAO PAULO\Mestrado\Disciplinas\PEA5733 - Automação e Sociedade (2026)\Apresentação dos artigos\Artigo\Artigo_AHCF_CPS_USP_Revisado_v2.docx`.

### Added — Iteração 8 (Fidelidade matemática ao artigo §7.9 + fórmula visual)
- Novo documento [`docs/ARTICLE_REVISION_PROPOSAL.md`](./docs/ARTICLE_REVISION_PROPOSAL.md)
  com proposta colaborativa de revisão ao §7.9 do artigo em desenvolvimento.
  Cinco pontos (R1–R5) com **justificativa científica** citando
  bibliografia MCDM e critérios de reprodutibilidade:
  - R1 — introduzir afinidade $a_{j,\cdot}$ para $A_j$ depender de $j$.
  - R2 — fechar domínio $X_i, H_k \in [0,1]$ com normalização Likert.
  - R3 — consolidar a partição $X/H$ nas 5 dimensões do §5.7.
  - R4 — corrigir o sinal do custo (subtrair em vez de somar).
  - R5 — tabela de afinidades ligando método × variáveis (taxonomia §6.2).
- **UI**: seção "Estratégia aplicada" no `ExplainPanel` agora mostra
  **lado a lado** a fórmula publicada em §7.9 e a fórmula aplicada após
  revisões, seguidas de um painel "⚠ Proposta de revisão ao §7.9"
  com R1–R5 e suas justificativas.
- **Componente `FormulaBox`**: tipografia matemática (Cambria Math /
  STIX Two Math) com Σ estilizado, variáveis em itálico e operadores
  em cor secundária — sem dependências pesadas (KaTeX/MathJax).
- **i18n**: novas chaves `explain.formulaArticleTitle`,
  `formulaSpecializedTitle`, `formulaArticleCaption`, `revisionsTitle`,
  `revisionsIntro`, `revisions.r1..r5`, `formulaLegend.*`, `costNote`.

### Added — Iteração 7 (Polimento de histórico + explicações de estratégia)
- **Home**: removido o bloco "Últimas simulações" — o histórico agora vive
  exclusivamente em `/history`.
- **Store**: `removeEntry(id)` e `clearHistory()` em `useSimulationStore`.
- **Página /history**:
  - Filtros por **setor**, **método recomendado** e **estratégia** com
    contador "mostrando X de Y".
  - Botão **Remover** individual em cada entrada.
  - Botão **Limpar histórico** com modal de confirmação (aria-modal).
  - Export CSV respeita os filtros atuais.
- **Página /simulate**: novo componente `<StrategyExplain>` abaixo do
  seletor. Para cada estratégia (Linear / AHP / TOPSIS) mostra: resumo,
  quando usar, pontos fortes e pontos de atenção (em pt-BR / en).
- **i18n**: novas chaves `history.filters.*`, `history.clear*`,
  `strategy.descriptions.*` e rótulos `useWhenLabel` / `prosLabel` /
  `consLabel`.

### Added — Iteração 6 (Modo de teste com IA + auditoria i18n)
- **Integração OpenRouter** (opt-in) com três endpoints:
  - `POST /api/v1/ai/explain` — explicação em linguagem natural.
  - `POST /api/v1/ai/suggest-strategy` — recomenda `linear`/`ahp`/`topsis`.
  - `POST /api/v1/ai/generate-simulation` — gera cenários sintéticos.
  - `GET /api/v1/ai/config` — expõe estado e modelo.
- **Três níveis de opt-out**: `AI_ENABLED=false` (API), `VITE_AI_ENABLED=false`
  (Web) ou toggle do usuário em **⚙ Preferências**.
- **Web**:
  - `AiExplainBox` na tela de resultado.
  - `AiStrategySuggest` na tela de inputs (aplica a estratégia com 1 clique).
  - Nova página `/ai-test` para gerar N cenários sintéticos e rodá-los no motor.
  - Link 🧠 "Testes com IA" na nav quando o modo está ativo.
- **Testes**: 9 testes de IA com mock (total API: 22).
- **Auditoria de i18n**: strings hardcoded (`Loading…`, labels dos gráficos,
  `aria-label="language"`, `<summary>` do ExplainPanel) agora em pt-BR/en.
- **Citações**: referências não-oficiais removidas da UI e das seções
  "References" dos docs públicos. Saaty/Hwang-Yoon aparecem apenas em
  comentários de implementação do algoritmo (metodologia).
- **Docs**: [`docs/AI_INTEGRATION.md`](./docs/AI_INTEGRATION.md) novo;
  README, CHANGELOG, `.env.example` atualizados.

### Added — Iteração 5 (Explainability passo-a-passo)
- **Engine**: tipos `StrategyTrace` (Linear, AHP, TOPSIS) expondo
  inputs, dimensões, pesos, matrizes intermediárias, regras aplicadas,
  distâncias e closeness — ver [`docs/EXPLAINABILITY.md`](./docs/EXPLAINABILITY.md).
- `runSimulation(inputs, { trace: true })` e `Strategy.compute(inputs, { trace: true })`
  passam a emitir o trace (opt-in, backward-compatible).
- **API**: aceita `trace: true` no payload; novo flag `EXPLAIN_ENABLED`
  (default `true`) expõe se a API responde traces. `/health` reporta o flag.
- **Web**:
  - Botão "🔍 Ver cálculo e processo" na tela de Resultado.
  - `ExplainPanel` com rendering por estratégia (Linear, AHP, TOPSIS).
  - Drawer ⚙ Preferências com toggle para esconder a feature por usuário.
  - Build flag `VITE_EXPLAIN_ENABLED=false` desativa a feature no
    bundle final (útil para forks comunitários).
- **Testes**: +5 na engine, +4 na API (total: 34 + 13 = **47 testes**).
- **Docs**: `docs/EXPLAINABILITY.md`, `.env.example` e `README.md`
  atualizados.

### Added — Iteração 4 (TOPSIS + Dashboard + Login + Deploy)
- **Engine**:
  - Estratégia **TOPSIS** — matriz de decisão normalizada, soluções ideais
    A⁺/A⁻, closeness coefficient ∈ [0, 1] (técnica multicritério clássica
    mencionada no artigo §7.9 como candidata de operacionalização).
  - `runSimulation(inputs, { strategy: 'topsis', sector })` despacha TOPSIS.
  - **7 testes** adicionais (total: 29 na engine).
  - Microbenchmark `pnpm --filter @ahcf-cps/engine bench` — gate de
    regressão de performance (p95 > 5 ms falha o CI). Medição atual:
    linear 0.015 ms · ahp 0.018 ms · topsis 0.066 ms (p95).
- **API**:
  - `POST /api/v1/auth/register` e `POST /api/v1/auth/login` (bcrypt,
    store em memória; schema Prisma pronto para migrar).
  - `strategy: "topsis"` aceito no payload de simulações.
  - **3 testes** adicionais (total: 9 na API).
- **Web**:
  - Nova página `/dashboard` com agregações locais: distribuição de
    métodos, radar das dimensões médias, tabela por setor, totais por
    estratégia.
  - Nova página `/login` com registro e login (persistência Zustand,
    JWT quando `AUTH_ENABLED=true`).
  - Seletor de estratégia agora inclui TOPSIS.
  - Navegação `Dashboard` e `Login` no header.
  - LikertSlider com navegação por teclado (setas) + aria-describedby.
- **Deploy**:
  - `apps/api/Dockerfile` (multi-stage, healthcheck, pnpm).
  - `apps/web/Dockerfile` + `nginx.conf` para SPA + healthcheck.
  - `railway.toml` com serviços `api` + `web` + Postgres gerenciado.
- **CI**:
  - Job `e2e` em `.github/workflows/ci.yml` usando Playwright (roda em
    PRs).
  - Bench adicionado ao pipeline principal como gate de performance.

### Added — Iteração 3 (engine avançado + persistência + UX)
- **Engine**:
  - Estratégia **AHP** (Analytic Hierarchy Process) com matriz pareada,
    vetor de prioridades por média geométrica e Consistency Ratio (CR).
  - **Perfis setoriais** calibrados (`generic`, `automotive`, `pharmaceutical`,
    `logistics`, `electronics`, `agroindustrial`, `metalmechanical`).
  - `runSimulation(inputs, { strategy, sector })` despacha a estratégia
    escolhida e aplica calibração setorial.
  - 12 novos testes Vitest (total: 22 na engine).
- **API**:
  - Aceita `strategy` (`linear` | `ahp`) e `context.sector` no payload.
  - Endpoint `GET /api/v1/export/csv` (RF11) — export anonimizado.
  - 6 testes de integração (fastify.inject) em `server.test.ts`.
  - Plugin opcional de autenticação JWT (`AUTH_ENABLED=true`).
  - Store abstraído em interface `SimulationStore` (InMemory + Prisma).
- **Persistência**:
  - `docker-compose.yml` com PostgreSQL 16 pronto para uso.
  - `prisma/schema.prisma` (`User`, `Simulation`) e `PrismaSimulationStore`.
  - `.env.example` ampliado com `DATABASE_URL`, `STORE_BACKEND`, `JWT_SECRET`.
- **Web**:
  - Seletor de setor industrial na tela de inputs.
  - Toggle de estratégia (Linear / AHP).
  - Botão "Modo operador" (RF10) — versão simplificada do resultado.
  - Exportação **PDF** via `window.print()` com `@media print` dedicado.
  - Exportação **CSV** client-side (roda mesmo offline).
  - **Code splitting** por rota com `React.lazy` + `Suspense` — main
    bundle caiu de 672 kB para 253 kB (gzip 83 kB).
  - **Skip link** de acessibilidade + `aria-label` em navegação/logo.

### Added — Iteração 1/2 (MVP)
- Scaffolding do monorepo (pnpm workspaces).
- Pacote `@ahcf-cps/engine` com estratégia linear e testes.
- API Fastify com endpoints `/api/v1/simulations` (POST/GET/GET:id) e `/health`.
- Frontend React + Vite + Tailwind: Home, Inputs, Result e Histórico.
- Internacionalização pt-BR / en com toggle persistente.
- Documentação pública: README, LICENSE (MIT), CONTRIBUTING, CODE_OF_CONDUCT,
  SECURITY, CITATION, CHANGELOG.
- CI (GitHub Actions): typecheck, test, build em Node 20 e 22.

## [0.1.0] — planejado

Primeira release navegável (MVP).
