# Integração com IA via OpenRouter — Modo de Teste

Esta integração é **opcional, opt-in e explicitamente destinada a testes
de validação do framework AHCF-CPS**. Quando ativada, três capacidades
ficam disponíveis:

1. **Explicar com IA** — gera explicação em linguagem natural da recomendação.
2. **Sugerir estratégia com IA** — recomenda entre `linear`, `ahp` ou `topsis`
   para o contexto fornecido.
3. **Gerar simulações de teste** — produz cenários sintéticos para exercitar
   o sistema e validar seu comportamento (página `/ai-test`).

## Como funciona

A API AHCF-CPS atua como **proxy seguro** para a OpenRouter. O navegador
**nunca** envia chaves; ele apenas chama endpoints `/api/v1/ai/*` da
própria API, que encaminha a chamada com a `OPENROUTER_API_KEY` no header
server-side.

```
Web (botão IA)
  └──► POST /api/v1/ai/{explain|suggest-strategy|generate-simulation}
        └──► OpenRouter (model configurável)
```

## Configuração

### API (backend)

Variáveis em `apps/api` (ou no Railway):

| Variável                 | Default                           | Função                                |
|--------------------------|-----------------------------------|---------------------------------------|
| `AI_ENABLED`             | `false`                           | **Flag mestre**. Precisa ser `true`.  |
| `OPENROUTER_API_KEY`     | *(vazio)*                         | Chave da OpenRouter.                  |
| `OPENROUTER_MODEL`       | `anthropic/claude-3.5-sonnet`     | Qualquer modelo da catalogação.       |
| `OPENROUTER_REFERER`     | `https://ahcf-cps.example`        | Header `HTTP-Referer` (recomendado).  |
| `OPENROUTER_TITLE`       | `AHCF-CPS Web Simulator`          | Header `X-Title` (recomendado).       |
| `OPENROUTER_TIMEOUT_MS`  | `30000`                           | Timeout em ms por chamada.            |

A IA só fica ativa quando `AI_ENABLED=true` **E** a `OPENROUTER_API_KEY`
tem valor. Caso contrário, todos os endpoints `/ai/*` retornam **503**.

### Web (frontend)

| Variável            | Default | Função                                                          |
|---------------------|---------|-----------------------------------------------------------------|
| `VITE_AI_ENABLED`   | `true`  | Build flag. Se `false`, o bundle não expõe o toggle nem as UIs. |
| `VITE_API_URL`      | —       | Necessário (o client chama `${VITE_API_URL}/api/v1/ai/*`).      |

### Usuário (runtime)

Em **⚙ Preferências → Modo de teste com IA** o usuário decide se quer
usar a feature. O toggle só aparece quando:

- `VITE_AI_ENABLED=true` (build), E
- `/health` retorna `aiEnabled: true` (API configurada).

## Três níveis de opt-out

Igual à feature de explainability:

| Nível     | Variável                | Escopo                   |
|-----------|-------------------------|--------------------------|
| Usuário   | Toggle em Preferências  | Por navegador            |
| Build Web | `VITE_AI_ENABLED=false` | Por deploy da Web        |
| API       | `AI_ENABLED=false`      | Por deploy da API        |

Qualquer um desabilita a feature inteira.

## Endpoints

### `POST /api/v1/ai/explain`

Recebe `{ inputs, context?, result, locale? }` e retorna:

```json
{
  "explanation": "Este método prioriza segurança e ergonomia porque...",
  "model": "anthropic/claude-3.5-sonnet",
  "usage": { "totalTokens": 412 }
}
```

### `POST /api/v1/ai/suggest-strategy`

Recebe `{ context?, notes?, locale? }` e retorna:

```json
{
  "suggested": "ahp",
  "rationale": "O contexto sugere hierarquia clara...",
  "model": "anthropic/claude-3.5-sonnet"
}
```

Valores aceitos para `suggested`: `linear`, `ahp`, `topsis`. Qualquer
outra coisa → HTTP 502.

### `POST /api/v1/ai/generate-simulation`

Recebe `{ count, scenario?, locale? }` (count ∈ [1, 10]) e retorna:

```json
{
  "simulations": [
    {
      "label": "Célula automotiva de montagem com variabilidade",
      "context": { "sector": "automotive" },
      "inputs": { "taskComplexity": 4, "variability": 5, "..." }
    }
  ],
  "model": "anthropic/claude-3.5-sonnet",
  "requested": 3,
  "returned": 3
}
```

Cada simulação gerada passa por validação Zod idêntica à do endpoint
principal; inválidas são descartadas silenciosamente.

### `GET /api/v1/ai/config`

Responde `{ enabled, model }` (sem expor a chave). Usado pela Web para
renderizar ou esconder o toggle.

## Privacidade e custo

- **Dados enviados**: inputs Likert, contexto (setor/processo/cobot se
  informados) e resultado. **Não** há envio de histórico ou de dados de
  outros usuários.
- **Custos**: controlados pela OpenRouter e pelo modelo escolhido.
  Modelos menores (e.g., `meta-llama/llama-3-8b-instruct`) reduzem custo
  significativamente.
- **Testes automatizados**: não dependem da rede — `buildServer` aceita
  `chatFn` mockado (`apps/api/src/ai.test.ts`).

## Referências oficiais do projeto

- MATIAS, J. P. *Adaptive Human-Centered Framework for Cobot Programming
  Selection.* USP — Escola Politécnica, PEA5733, 2026.
