# API — AHCF-CPS Web Simulator

Base URL padrão (dev): `http://localhost:3333`
Prefixo: `/api/v1`

## Autenticação

O MVP não exige autenticação. Há plugin JWT opcional em `apps/api/src/auth.ts`.
Para ativar em produção:

```
AUTH_ENABLED=true
JWT_SECRET=<segredo de ≥ 32 caracteres>
JWT_EXPIRES_IN=12h
```

## Store backend

Configurado pela variável `STORE_BACKEND`:

- `memory` (default) — `InMemorySimulationStore`; não persiste entre reinícios.
- `prisma` — `PrismaSimulationStore` contra Postgres.
  Requer `docker compose up -d postgres` e
  `pnpm --filter @ahcf-cps/api prisma:generate && prisma:migrate`.

## Endpoints

### `GET /health`

Healthcheck. Retorna `{ status, engine, timestamp }`.

---

### `POST /api/v1/simulations`

Calcula uma nova recomendação.

**Request body:**

```jsonc
{
  "strategy": "linear",            // opcional: "linear" | "ahp"
  "context": {
    "sector": "automotive",        // opcional: generic | automotive | pharmaceutical |
                                   //           logistics | electronics | agroindustrial |
                                   //           metalmechanical
    "process": "assembly",         // opcional
    "taskType": "screwing",        // opcional
    "operators": 2,                // opcional, inteiro
    "cobotModel": "UR10e",         // opcional
    "productionVolume": "medium",  // opcional
    "lotType": "HMLV"              // opcional: HMLV | HVLM | mixed
  },
  "inputs": {
    "taskComplexity": 4,        // 1..5
    "variability": 5,           // 1..5
    "operatorExperience": 2,    // 1..5
    "safetyRequired": 4,        // 1..5
    "ergonomicLoad": 3,         // 1..5
    "resourcesAvailable": 3,    // 1..5
    "productivityGoal": 4,      // 1..5
    "costConstraint": 3,        // 1..5
    "leadershipPreference": 2,  // 1..5 (1 = seguir, 5 = liderar)
    "transparencyNeed": 4       // 1..5
  }
}
```

**Response `201`:**

```jsonc
{
  "id": "…uuid…",
  "context": { /* echo */ },
  "inputs":  { /* echo */ },
  "result": {
    "recommended": "shared_control",
    "ranking": [
      {
        "method": "shared_control",
        "score": 3.1,
        "normalized": 1.0,
        "contributions": {
          "safety": 0.81,
          "ergonomic": 0.55,
          "humanPreference": 0.60,
          "performance": 0.55,
          "taskComplexity": 0.58
        },
        "pros": ["…"],
        "cons": ["…"],
        "warnings": []
      }
      /* …outros métodos… */
    ],
    "dimensions": { /* Safety..TaskComplexity ∈ [0,1] */ },
    "engineVersion": "0.1.0",
    "strategy": "linear-v1",
    "computedAt": "2026-04-22T12:34:56.000Z"
  },
  "createdAt": "2026-04-22T12:34:56.000Z"
}
```

**Erros:**
- `400` — payload inválido.

---

### `GET /api/v1/simulations?limit=20`

Lista simulações recentes (máx. 200).

**Response:** `{ "items": StoredSimulation[] }`

---

### `GET /api/v1/simulations/:id`

Detalhe de uma simulação.

**Erros:**
- `404` — id não encontrado.

---

### `POST /api/v1/auth/register`

Cria um usuário. Store em memória no MVP; schema Prisma (tabela `User`)
pronto para produção.

```json
{ "email": "op@example.com", "password": "password123", "role": "OPERATOR" }
```

Respostas:
- `201` — `{ id, email, role }`
- `400` — payload inválido
- `409` — e-mail já cadastrado

---

### `POST /api/v1/auth/login`

```json
{ "email": "op@example.com", "password": "password123" }
```

Respostas:
- `200` — `{ token, user: { id, email, role } }`. O `token` é nulo quando
  `AUTH_ENABLED=false`.
- `400` — payload inválido
- `401` — credenciais inválidas

---

### `GET /api/v1/export/csv`

Exporta todas as simulações persistidas em CSV anonimizado (RF11). Cabeçalho:

```
id,createdAt,sector,recommended,engineVersion,strategy,
taskComplexity,variability,operatorExperience,safetyRequired,ergonomicLoad,
resourcesAvailable,productivityGoal,costConstraint,leadershipPreference,
transparencyNeed,
dim_safety,dim_ergonomic,dim_humanPreference,dim_performance,dim_taskComplexity
```

A Web também pode gerar um CSV idêntico a partir do histórico local —
útil para validação empírica em campo sem rede.
