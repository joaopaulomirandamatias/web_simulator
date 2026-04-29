# Contribuindo com o AHCF-CPS Web Simulator

Obrigado pelo interesse! Este projeto é open source, acadêmico e industrial —
toda contribuição é bem-vinda.

## Código de conduta

Este projeto segue o [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md). Participar
implica concordar com seus termos.

## Fluxo de contribuição

1. Abra uma *issue* descrevendo o problema/melhoria.
2. Faça fork e crie branch a partir de `main`: `git checkout -b feat/minha-feature`.
3. Implemente com testes quando aplicável.
4. `pnpm lint && pnpm typecheck && pnpm test && pnpm build` devem passar.
5. Abra um *pull request* para `main` e aguarde revisão.

## Convenções

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/).
  Exemplos: `feat(engine): add TOPSIS strategy`, `fix(api): handle empty context`.
- **Código**: TypeScript estrito, Prettier + ESLint obrigatórios.
- **Testes**: ao tocar na engine, mantenha cobertura ≥ 90%.
- **Pastas**:
  - `packages/engine`: lógica de decisão, pura e testável.
  - `apps/api`: apenas transporte HTTP (Fastify + Zod).
  - `apps/web`: UI, sem regra de negócio duplicada da engine.

## Sugestões especialmente bem-vindas

- Novas estratégias de decisão (AHP, TOPSIS, Fuzzy Logic, RL adaptativo).
- Calibrações setoriais dos pesos (automotivo, farmacêutico, logístico…).
- Traduções (i18n) e melhorias de acessibilidade (WCAG AA).
- Integração com Digital Twin e leitura de PLC.

## Reportando vulnerabilidades

Veja [`SECURITY.md`](./SECURITY.md). **Não** abra issue pública para falhas de
segurança.

## Publicando pesquisa

Se usar o simulador em trabalho acadêmico, cite-o conforme
[`CITATION.cff`](./CITATION.cff).
