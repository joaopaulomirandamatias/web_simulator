# UX Guidelines — AHCF-CPS Web Simulator

## Princípios

1. **Operador usa com luva** — alvos de toque ≥ 48 px, espaçamento generoso.
2. **Leitura rápida** — fonte base ≥ 16 px desktop, ≥ 18 px tablet.
3. **Alto contraste** — paleta industrial (primária `#0F172A`, accent `#2563EB`).
4. **Poucos cliques** — ≤ 2 cliques da Home até iniciar uma simulação.
5. **Explicável** — toda recomendação exibe contribuição por dimensão e fontes
   bibliográficas.

## Componentes críticos

### `LikertSlider`

- 5 botões grandes (flex-1), valor atual em 24px, rótulos verbais nos extremos.
- Foco visível com anel azul.
- ARIA `role="radiogroup"` + `role="radio"`.

### Cards industriais

- `rounded-xl2 (1.25rem)`, sombra suave, borda `slate-200`.
- Sem animações agressivas — feedback direto.

## Acessibilidade

- Meta: WCAG 2.1 AA.
- Contraste mínimo 4.5:1 para texto corpo.
- `:focus-visible` obrigatório em botões e links.
- Hierarquia de headings coerente (`h1` por página).

## Copy

- Português direto, termos de chão de fábrica (evitar jargão acadêmico na UI).
- Termos técnicos do framework (Safety, Ergonomic…) aparecem no radar e nos
  detalhes técnicos — **não** na entrada de dados.

## Internacionalização

- Default: `pt-BR`.
- Planejado v1.0: `en` (i18next ou `use-intl`).
- Strings de UI devem ser centralizadas antes da release pública para facilitar
  tradução por colaboradores.
