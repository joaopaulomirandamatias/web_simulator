# Explainability — "Ver cálculo e processo"

Esta feature expõe, **passo a passo**, como cada simulação chegou à
recomendação final. Foi pensada para **validação acadêmica** do framework
AHCF-CPS (Matias, 2026) e é **opcional** — deploys de produção podem
desativá-la sem impacto no resultado.

---

## Por que existe

A seleção do método de programação de cobots é uma decisão multicritério
e, para ser validada cientificamente, precisa ser **reprodutível, auditável
e reportável**. A modalidade "Ver cálculo":

- mostra os inputs originais (Likert 1–5);
- mostra as 5 dimensões AHCF-CPS derivadas e suas fórmulas;
- explicita pesos, matrizes pareadas (AHP), matrizes D/R/V (TOPSIS),
  soluções ideais A⁺/A⁻, distâncias e closeness coefficient;
- lista as regras de negócio (RN01..RN09) que foram acionadas e seu
  impacto multiplicativo;
- permite que um revisor reproduza o cálculo com papel e caneta.

## Como funciona

1. O chamador (API ou client) passa `trace: true` em `runSimulation`.
2. Cada estratégia (`LinearStrategy`, `AhpStrategy`, `TopsisStrategy`)
   popula `result.trace` com um `StrategyTrace` tipado
   ([`packages/engine/src/trace.ts`](../packages/engine/src/trace.ts)).
3. A Web exibe o trace numa seção colapsável ("🔍 Ver cálculo") na página
   de Resultado, com uma tabela por etapa.

## Como desativar

A feature tem **três níveis de opt-out** independentes — qualquer um
desliga tudo:

| Nível        | Onde                  | Variável / ação                   | Efeito                                        |
|--------------|-----------------------|-----------------------------------|-----------------------------------------------|
| Usuário      | Settings drawer (⚙)   | Toggle "Mostrar botão Ver cálculo" | O botão some apenas para aquele usuário/navegador |
| Build (Web)  | `apps/web` build time | `VITE_EXPLAIN_ENABLED=false`      | Remove o toggle dos Settings e o botão do Result |
| API          | Runtime               | `EXPLAIN_ENABLED=false`           | API ignora `trace: true` e nunca inclui o campo |

Isso permite que:

- **pesquisadores** mantenham a feature ativa para validar o artigo;
- **uma comunidade/fork** possa gerar builds sem a feature (Web + API);
- **cada usuário** tenha controle fino via Settings (persistido em
  localStorage).

O endpoint `/health` expõe `explainEnabled` para a Web decidir como
renderizar o toggle.

## O que o trace contém

### Linear
- `weights` (α_d, γ)
- `dimensionScores` e `costIntensity`
- Para cada método: `affinities`, `contributions`, `rawSum`, `costPenalty`,
  `preRuleScore`, `finalScore`, `normalized`
- `rulesApplied`: lista de `{ id: 'RN04', method, multiplier, reason }`

### AHP
- `matrix` (matriz pareada 5×5)
- `priorities` (soma ≈ 1)
- `consistencyRatio` (aceitável ≤ 0.10)
- Para cada método: `contributions`, `rawSum`, `costPenalty`, `finalScore`,
  `normalized`

### TOPSIS
- `weights`, `columnNorms`, `idealPositive`, `idealNegative`
- Para cada método: `decision` (D), `normalized` (R), `weighted` (V),
  `distanceToIdealPositive`, `distanceToIdealNegative`, `closeness` (C),
  `normalizedRank`

## Tipagem

Todos os tipos ficam em `@ahcf-cps/engine`:

```ts
import type { StrategyTrace, LinearTrace, AhpTrace, TopsisTrace } from '@ahcf-cps/engine';
```

## Teste de reprodutibilidade

O teste [`packages/engine/src/trace.test.ts`](../packages/engine/src/trace.test.ts)
cobre:

- trace é `undefined` quando o flag é falso (backward compat);
- trace aparece com o `kind` correto para cada estratégia;
- `rulesApplied` reflete os inputs (RN02, RN04, RN09 etc.);
- somas e CR ficam nos ranges esperados.

## Referências oficiais do projeto

- MATIAS, J. P. *Adaptive Human-Centered Framework for Cobot Programming
  Selection.* USP — Escola Politécnica, PEA5733, 2026.

> **Observação metodológica.** As estratégias AHP e TOPSIS são técnicas
> multicritério clássicas mencionadas pelo artigo AHCF-CPS como candidatas
> de operacionalização (§7.9). A implementação neste repositório segue a
> formulação canônica descrita nos comentários dos arquivos
> `packages/engine/src/strategies/ahp.ts` e `.../topsis.ts`.
