# Arquitetura — AHCF-CPS Web Simulator

## Visão de alto nível

```
┌──────────────────────────────────────┐
│ Frontend React (Vite + Tailwind)     │
│  · Zustand (estado local)            │
│  · TanStack Query (cache HTTP)       │
│  · Recharts (radar + barras)         │
└──────────────┬───────────────────────┘
               │ HTTPS / JSON
┌──────────────▼───────────────────────┐
│ API REST Fastify (TypeScript)        │
│  · Zod (validação de inputs)         │
│  · @fastify/sensible                 │
│  · CORS configurável                 │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│ @ahcf-cps/engine (pacote puro)       │
│  · DecisionStrategy                   │
│  · LinearStrategy (v0.1)              │
│  · METHOD_PROFILES                    │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│ Store (InMemory no MVP)              │
│  → Postgres/Prisma no Sprint 2       │
└──────────────────────────────────────┘
```

## Decisões arquiteturais (ADR curtos)

### ADR-001 — Monorepo pnpm
- **Decisão**: Monorepo com `apps/` e `packages/`.
- **Motivação**: Compartilhar `@ahcf-cps/engine` entre `api` e `web` sem
  duplicar lógica; permitir rodar a engine no cliente (modo offline de demo).
- **Alternativas**: Multirepo (descartado — overhead de publicar npm).

### ADR-002 — Padrão Strategy na engine
- **Decisão**: Interface `DecisionStrategy` com `LinearStrategy` como default.
- **Motivação**: Roadmap inclui AHP, TOPSIS, Fuzzy, RL — substituíveis sem
  romper a API pública.
- **Implicação**: Consumidores injetam estratégia quando necessário.

### ADR-003 — Validação com Zod
- **Decisão**: Schemas Zod compartilhados entre API e (futuramente) Web.
- **Motivação**: Tipagem forte + validação em um único lugar; compatível com
  `fastify-type-provider-zod`.

### ADR-004 — Store em memória no MVP
- **Decisão**: `InMemorySimulationStore` no MVP; Prisma + Postgres no Sprint 2.
- **Motivação**: Reduzir fricção de setup inicial; histórico já persiste no
  navegador via Zustand `persist` middleware.

### ADR-005 — Recharts em vez de D3 direto
- **Decisão**: Recharts para radar e barras.
- **Motivação**: Componentização React-friendly, acessibilidade razoável,
  suficiente para o MVP.

## Diretórios-chave

- `packages/engine/src/strategies/` — Estratégias de decisão (plugáveis).
- `packages/engine/src/methods.ts` — Perfis dos 6 métodos (afinidades, custo).
- `apps/api/src/routes/` — Rotas HTTP.
- `apps/web/src/pages/` — Telas (Home, Inputs, Result, History).
- `apps/web/src/components/` — Componentes reutilizáveis.
