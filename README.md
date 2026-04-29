# AHCF-CPS Web Simulator

**Adaptive Human-Centered Framework for Cobot Programming Selection**

Ferramenta web open source de apoio à decisão sobre métodos de programação de
robôs colaborativos em contextos de *Human-Robot Collaboration* (HRC)
industrial, operacionalizando o framework AHCF-CPS (Matias, 2026).

> **Decida o melhor método para seu cobot em segundos — com ciência por trás.**

---

## Visão rápida

- Interface inspirada em **tablet industrial** (botões grandes, alto contraste,
  usável com luva).
- Recomendação multicritério entre **seis métodos**: Convencional, Parametrizada,
  PbD, Cinestésico Multimodal, XR/Imersiva e Shared Control / Adaptive AI.
- **Cinco dimensões** (Safety, Ergonomic, Human Preference, Performance, Task
  Complexity) + regras de negócio coerentes com a RSL.
- Motor com **padrão Strategy**: roadmap para AHP, TOPSIS, Fuzzy Logic e
  Bayesian Decision Models.
- Engine explicável: cada recomendação exibe contribuição por dimensão
  (alinhado a Bagheri et al., 2022).

## Estrutura do repositório

```
web_simulator/
├── apps/
│   ├── api/          # Fastify + TypeScript (REST)
│   └── web/          # React + Vite + Tailwind (UI)
├── packages/
│   └── engine/       # Motor AHCF-CPS puro (TypeScript, testável)
├── .github/workflows # CI (lint, typecheck, test, build)
├── docs/             # Documentação pública (versionada)
└── doc/              # Planejamento interno (ignorado pelo git)
```

## Pré-requisitos

- Node.js ≥ 20
- pnpm ≥ 10

## Quickstart

```bash
# 1. Instalar dependências (monorepo)
pnpm install

# 2. Rodar testes do motor
pnpm --filter @ahcf-cps/engine test

# 3. Subir API e Web em paralelo
cp .env.example .env
pnpm dev
#   → API:  http://localhost:3333
#   → Web:  http://localhost:5173
```

A Web funciona **offline** (roda a engine localmente no navegador) se
`VITE_API_URL` estiver vazia.

## Scripts principais

| Comando              | Descrição                                          |
|----------------------|----------------------------------------------------|
| `pnpm dev`           | Dev server Web + API em paralelo                   |
| `pnpm build`         | Build de todos os pacotes                          |
| `pnpm test`          | Testes em todos os pacotes                         |
| `pnpm typecheck`     | TypeScript check sem emitir                        |
| `pnpm format`        | Prettier em todo o repo                            |

## API (MVP)

| Método | Rota                           | Descrição                     |
|--------|--------------------------------|-------------------------------|
| GET    | `/health`                      | Healthcheck                   |
| POST   | `/api/v1/simulations`          | Calcula nova recomendação     |
| GET    | `/api/v1/simulations`          | Lista simulações recentes     |
| GET    | `/api/v1/simulations/:id`      | Detalha simulação             |
| GET    | `/api/v1/export/csv`           | Export CSV anonimizado (RF11) |

### Backends do store

| `STORE_BACKEND` | Comportamento                                                 |
|-----------------|---------------------------------------------------------------|
| `memory`        | Default; não persiste entre reinícios. Ideal para MVP/demo.   |
| `prisma`        | Postgres via Prisma. Requer `docker compose up -d postgres` + `pnpm --filter @ahcf-cps/api prisma:migrate`. |

### Estratégias de decisão

O campo opcional `strategy` aceita `linear` (default), `ahp` ou `topsis`.
A combinação `{ strategy, context.sector }` ativa a calibração setorial
definida em `packages/engine/src/sectors.ts` (automotive, pharmaceutical,
logistics, electronics, agroindustrial, metalmechanical, generic).

### Rotas Web

| Rota            | Descrição                                                |
|-----------------|----------------------------------------------------------|
| `/`             | Home                                                     |
| `/simulate`     | Formulário de inputs                                     |
| `/result`       | Tela de resultado (com PDF/CSV + modo operador)          |
| `/history`      | Histórico local + export                                 |
| `/dashboard`    | Dashboard analítico (agregações por setor/método)        |
| `/login`        | Autenticação opcional (register/login; JWT via API)      |

### Deploy

- `apps/api/Dockerfile` — API em Node 20 Alpine com healthcheck.
- `apps/web/Dockerfile` + `apps/web/nginx.conf` — SPA servida por Nginx.
- `railway.toml` — define serviços `api` e `web` e consome `Postgres.DATABASE_URL`.

### Explainability (🔍 Ver cálculo)

Cada simulação pode retornar um **trace passo-a-passo** do cálculo
(útil para validação acadêmica do framework). Ver
[`docs/EXPLAINABILITY.md`](./docs/EXPLAINABILITY.md).

- Opt-in no payload: `POST /api/v1/simulations { ..., "trace": true }`.
- Toggle de usuário no drawer de **Preferências** (⚙ no header).
- Feature globalmente desativável pela comunidade via
  `EXPLAIN_ENABLED=false` (API) e `VITE_EXPLAIN_ENABLED=false` (Web).

### Modo de teste com IA (OpenRouter)

Opt-in explícito, pensado para **validação do sistema e do framework
AHCF-CPS** em cenários de teste. Ver [`docs/AI_INTEGRATION.md`](./docs/AI_INTEGRATION.md).

Três capacidades, todas ativadas apenas quando `AI_ENABLED=true` e
`OPENROUTER_API_KEY` está configurada:

- **Explicar com IA** — botão na tela de resultado.
- **Sugerir estratégia com IA** — na tela de inputs (ajuda o pesquisador
  a escolher entre Linear / AHP / TOPSIS).
- **Gerar simulações de teste** — página dedicada `/ai-test` com
  cenários sintéticos para exercitar o motor.

Três níveis de opt-out (usuário / build / API).

### Performance

```
$ pnpm --filter @ahcf-cps/engine bench
linear  p95 = 0.015 ms
ahp     p95 = 0.018 ms
topsis  p95 = 0.066 ms
```

### Exemplo de requisição

```json
POST /api/v1/simulations
{
  "context": { "sector": "automotive", "process": "assembly" },
  "inputs": {
    "taskComplexity": 4,
    "variability": 5,
    "operatorExperience": 2,
    "safetyRequired": 4,
    "ergonomicLoad": 3,
    "resourcesAvailable": 3,
    "productivityGoal": 4,
    "costConstraint": 3,
    "leadershipPreference": 2,
    "transparencyNeed": 4
  }
}
```

## Referências acadêmicas

- MATIAS, J. P. (2026). *Adaptive Human-Centered Framework for Cobot
  Programming Selection*. USP — Escola Politécnica, PEA5733.
- EL ZAATARI et al. (2019). *Cobot programming for collaborative industrial
  tasks: an overview.*
- BAGHERI et al. (2022). *Improving non-expert users' task teaching to
  collaborative robots through transparent graphical user interfaces.*
- NOORMOHAMMADI-ASL et al. (2025). *Adaptive leadership allocation in
  human-robot collaboration.*
- Demais referências em [`CITATION.cff`](./CITATION.cff).

## Como contribuir

Leia [`CONTRIBUTING.md`](./CONTRIBUTING.md) — seguimos Conventional Commits e
código de conduta Contributor Covenant 2.1.

## Licença

[MIT](./LICENSE) — © 2026 João Paulo Matias.
