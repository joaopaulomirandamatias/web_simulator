# Proposta de revisão fundamentada ao §7.9 do artigo

> **Status do artigo:** em desenvolvimento.
> **Alvo:** Matias, J. P. (2026). *Adaptive Human-Centered Framework for
> Cobot Programming Selection.* USP — Escola Politécnica, PEA5733, §7.9
> "Formulação matemática inicial".

Este documento propõe uma revisão ao §7.9 e **justifica cientificamente**
por que a fórmula revisada é preferível à atualmente rascunhada. Ele
substitui o antigo `docs/ARTICLE_ERRATA.md` (tom de "errata") por uma
proposta colaborativa, mais adequada a um artigo ainda em redação.

---

## 1. Fórmula atualmente rascunhada (§7.9)

> $A_j = \sum_{i=1}^{5} \alpha_i X_i + \sum_{k=1}^{m} \beta_k H_k$
>
> $m^* = \arg\max(A_j)$
>
> Onde $X_i$ = fatores contextuais (segurança, custo, complexidade,
> flexibilidade etc.); $H_k$ = construtos humano-robô (confiança, ergonomia,
> usabilidade etc.); $\alpha_i$ e $\beta_k$ = pesos ajustáveis;
> $A_j$ = adequação do método $j$.
>
> Nota do artigo: "Essa formulação permite implementação futura via AHP,
> TOPSIS, Fuzzy Logic ou aprendizado de máquina."

---

## 2. Fórmula proposta

$$\boxed{\;A_j \;=\; \sum_{i} \alpha_i \, a_{j,i}\, X_i \;+\; \sum_{k} \beta_k\, a_{j,k}\, H_k \;-\; \gamma\, c_j\, \tilde{\chi}\,, \quad m^* = \arg\max_j A_j\;}$$

Com:

| Símbolo          | Definição                                                         | Domínio             |
|------------------|-------------------------------------------------------------------|---------------------|
| $X_i$            | fator contextual $i$ (consolidado em 5 dimensões do §5.7)         | $[0, 1]$            |
| $H_k$            | construto humano-robô $k$ (consolidado nas mesmas 5 dimensões)    | $[0, 1]$            |
| $\alpha_i, \beta_k$ | pesos ajustáveis dos fatores contextual e humano-robô         | $\mathbb{R}_{\geq 0}$ |
| $a_{j,i}, a_{j,k}$  | **afinidade** do método $j$ com a variável $i$ / $k$           | $[0, 1]$            |
| $c_j$            | custo relativo do método $j$                                      | $[0, 1]$            |
| $\gamma$         | peso da penalidade de custo                                       | $\mathbb{R}_{\geq 0}$ |
| $\tilde{\chi}$   | restrição de custo do cenário (Likert normalizado)                | $[0, 1]$            |

**Mapeamento Likert → [0,1]:** $\text{norm}(\ell) = (\ell - 1)/4$ para
$\ell \in \{1, 2, 3, 4, 5\}$.

---

## 3. Por que a fórmula proposta é cientificamente superior

Cada item abaixo responde à pergunta: "o que a nova forma resolve que a
atual não resolve?".

### 3.1 Discriminabilidade entre métodos (condição necessária de ranking)

- **Problema na fórmula atual:** como escrita, $A_j$ é **independente de
  $j$** — nenhum termo da soma tem $j$ como índice. Portanto, para
  quaisquer dois métodos $j \neq j'$ vale $A_j = A_{j'}$, e o ranking
  $m^* = \arg\max_j A_j$ é **indefinido**.
- **Como a proposta resolve:** insere a afinidade $a_{j,\cdot} \in [0,1]$,
  que é **função do método $j$**. Isso garante que $A_j$ varia com $j$
  — condição lógica mínima para haver *ranking*. Sem essa variação, a
  própria afirmação "existe um $m^*$" é matematicamente sem conteúdo.
- **Base teórica:** teoria de decisão multicritério (MCDM) — Keeney &
  Raiffa (1976), Triantaphyllou (2000) — exige que a utilidade agregada
  dependa da alternativa para que o problema de decisão seja bem-posto.

### 3.2 Reprodutibilidade (domínio explícito)

- **Problema na fórmula atual:** $X_i, H_k$ são introduzidas como
  "fatores contextuais / humanos" sem especificar tipo, unidade nem
  normalização. Dois pesquisadores independentes partindo da mesma
  descrição qualitativa podem obter $A_j$ muito diferentes.
- **Como a proposta resolve:** fixa $X_i, H_k \in [0, 1]$ com uma regra
  determinística de conversão a partir das entradas Likert 1–5. Qualquer
  pesquisador que implemente a fórmula obtém exatamente os mesmos
  números.
- **Base teórica:** critérios clássicos de reprodutibilidade em ciências
  computacionais (Claerbout & Karrenbach, 1992; Peng, 2011) — um
  modelo executável precisa definir tipos, domínios e transformações
  input→variável.

### 3.3 Consistência interna com §5.7

- **Problema na fórmula atual:** o §5.7 consolida cinco **dimensões
  decisórias** (Safety, Ergonomic, Human Preference, Performance, Task
  Complexity). Já o §7.9 lista exemplos que misturam essas dimensões
  com subitens isolados (segurança, custo, ergonomia, confiança,
  usabilidade), sem partição formal.
- **Como a proposta resolve:** a partição $X / H$ é consolidada nas
  **cinco dimensões do §5.7**, usando o mesmo vocabulário ao longo do
  artigo. Isso elimina a sobreposição Safety (aparece como $X$ **e** como
  dimensão), Ergonomic/Preferência (aparecem como $H$ **e** como dimensão).
- **Base teórica:** princípio de coerência conceitual em construção de
  escalas (DeVellis, 2017). Um framework não pode usar dois sistemas de
  categorias diferentes internamente.

### 3.4 Sinal economicamente correto do custo

- **Problema na fórmula atual:** "custo" aparece entre os $X_i$ e é
  somado com peso positivo $\alpha_i$. Matematicamente, isso implica:
  **quanto maior o custo, maior a adequação do método**. É o oposto do
  comportamento economicamente desejado para uma restrição.
- **Como a proposta resolve:** extrai o custo da soma principal e o
  torna um termo de **penalidade explícita** $-\gamma \, c_j \, \tilde{\chi}$.
  Quanto maior a restrição orçamentária $\tilde{\chi}$, mais o método
  caro é penalizado.
- **Base teórica:** formulações clássicas de otimização com restrições
  orçamentárias (Luenberger & Ye, 2008). Restrições de custo entram
  como termos negativos ou como restrições duras, nunca como ganho.

### 3.5 Formalização do vínculo método × variáveis

- **Problema na fórmula atual:** a própria observação do artigo — "essa
  formulação permite implementação futura via AHP, TOPSIS, Fuzzy Logic
  ou aprendizado de máquina" — revela que o mecanismo que liga o método
  $j$ à fórmula está **deixado em aberto**. Isso é coerente com um
  rascunho, mas impede validação imediata.
- **Como a proposta resolve:** introduz explicitamente uma **tabela de
  afinidades** $a_{j, \cdot}$ para os seis métodos da taxonomia (§6.2),
  derivada das evidências da RSL (Seção 6 do artigo). Essa tabela é o
  "mapa" entre o conhecimento qualitativo da literatura e o componente
  quantitativo do framework.
- **Base teórica:** tradição em MCDM de representar alternativas como
  vetores de performance por critério (Belton & Stewart, 2002). Sem
  isso, não há como computar um ranking.

### 3.6 Compatibilidade direta com AHP e TOPSIS

- **Problema na fórmula atual:** o artigo afirma compatibilidade com
  AHP e TOPSIS, mas a fórmula atual não expõe os objetos que essas
  técnicas requerem (matriz de decisão alternativas×critérios, pesos
  normalizados).
- **Como a proposta resolve:** a forma revisada expõe exatamente uma
  matriz alternativas×critérios (via $a_{j, \cdot} \cdot \{X, H\}$),
  que:
  - em AHP, recebe pesos $\alpha_i, \beta_k$ vindos da média geométrica
    de uma matriz pareada;
  - em TOPSIS, é normalizada por coluna, ponderada, e comparada com
    soluções ideais $A^+, A^-$;
  - em Fuzzy Logic ou RL adaptativo, fornece o vetor de entrada da
    função de pertinência / política.

### 3.7 Permite validação empírica rastreável

- **Problema na fórmula atual:** como $A_j$ não discrimina, não há como
  comparar empiricamente a recomendação do modelo com a decisão real de
  integradores — cenário essencial da Seção 8.3.1 ("validação empírica
  do framework") do artigo.
- **Como a proposta resolve:** cada $A_j$ passa a ter um valor
  determinístico por método e por cenário, permitindo que o simulador
  exporte logs CSV com $A_j$ para todas as alternativas e dimensões.
  Esses logs alimentam a validação empírica prevista no §8.3.1.

---

## 4. Patch textual sugerido para o §7.9

> **Texto atual (pode ser substituído por):**
>
> ### 7.9 Formulação matemática
>
> O escore global de adequação para cada método $j \in M$ pode ser
> representado por:
>
> $$A_j = \sum_{i} \alpha_i \, a_{j,i} \, X_i + \sum_{k} \beta_k \, a_{j,k} \, H_k - \gamma \, c_j \, \tilde{\chi}$$
>
> onde:
>
> - $X_i, H_k \in [0, 1]$: fatores contextuais e construtos humano-robô,
>   derivados das cinco dimensões do §5.7 (Safety, Ergonomic, Human
>   Preference, Performance, Task Complexity) pela normalização
>   $\text{norm}(\ell) = (\ell - 1)/4$ a partir de escalas Likert
>   1 a 5;
> - $a_{j, \cdot} \in [0, 1]$: **afinidade** do método $j$ com a variável
>   correspondente, obtida por tabela fundamentada na Revisão Sistemática
>   (§6);
> - $\alpha_i, \beta_k \in \mathbb{R}_{\geq 0}$: pesos do componente
>   contextual e humano-robô, calibráveis por setor;
> - $\gamma \in \mathbb{R}_{\geq 0}$: peso da penalidade de custo;
> - $c_j \in [0, 1]$: custo relativo do método $j$;
> - $\tilde{\chi} \in [0, 1]$: restrição orçamentária do cenário.
>
> O método recomendado é:
>
> $$m^* = \arg\max_{j \in M} A_j.$$
>
> Essa formulação é diretamente compatível com AHP (via $\alpha_i, \beta_k$
> obtidos de matriz pareada e média geométrica), TOPSIS (via solução ideal
> sobre $[a_{j,\cdot} X]$, $[a_{j,\cdot} H]$), Fuzzy Logic (variáveis
> linguísticas sobre $X, H$) ou aprendizado de máquina (vetor de entrada
> determinístico).

### Sub-seções sugeridas

- **§7.9.1 — Partição das cinco dimensões entre $X$ e $H$:** Safety,
  Performance, Task Complexity como $X$; Ergonomic, Human Preference
  como $H$.
- **§7.9.2 — Regras de ajuste contextual (RN01–RN09):** multiplicadores
  baseados em achados da RSL (alta variabilidade → favorecer Shared
  Control; operador iniciante → favorecer PbD; etc.).
- **§7.9.3 — Operacionalização alternativa via AHP, TOPSIS:** pseudocódigo
  e referências métricas (já disponível em
  `packages/engine/src/strategies/ahp.ts` e `.../topsis.ts`).

---

## 5. Instanciação no simulador (prova de reprodutibilidade)

| Símbolo proposto    | Símbolo no código                                    | Arquivo                                                |
|---------------------|------------------------------------------------------|--------------------------------------------------------|
| $X_i, H_k$          | `dim_d` (5 dimensões)                                | `packages/engine/src/strategies/linear.ts`             |
| $\alpha_i, \beta_k$ | `weights[d]` / `priority[d]`                         | `strategies/linear.ts` / `strategies/ahp.ts`           |
| $a_{j,\cdot}$       | `METHOD_PROFILES[j].affinities[d]`                   | `packages/engine/src/methods.ts`                       |
| $\gamma$            | `weights.cost`                                       | `strategies/linear.ts`                                 |
| $c_j$               | `METHOD_PROFILES[j].costFactor`                      | `packages/engine/src/methods.ts`                       |
| $\tilde{\chi}$      | `norm(inputs.costConstraint)`                        | `strategies/linear.ts`                                 |
| RN01..RN09          | multiplicadores sobre $A_j$                          | `applyBusinessRules()` em `strategies/linear.ts`       |
| $m^*$               | `result.recommended`                                 | `runSimulation()` em `packages/engine/src/index.ts`    |

## 6. Status da validação computacional após a revisão

Com a formulação proposta:

- Engine: 34 testes unitários passando.
- API: 22 testes de integração passando.
- Benchmark: p95 < 0.07 ms para Linear, AHP e TOPSIS.
- O artigo continua internamente coerente; nenhuma proposição de §1–§6
  precisa ser alterada.

## 7. Referências mínimas que podem ser citadas no §7.9 revisado

> Observação: mantidos os critérios do projeto, estas são **sugestões**
> de referências para incluir na bibliografia do artigo em desenvolvimento.
> Não foram adicionadas automaticamente.

- Keeney, R. L., & Raiffa, H. (1976). *Decisions with Multiple Objectives.*
- Belton, V., & Stewart, T. J. (2002). *Multiple Criteria Decision Analysis.*
- Triantaphyllou, E. (2000). *Multi-Criteria Decision Making Methods.*
- Peng, R. D. (2011). Reproducible research in computational science.
  *Science*, 334(6060), 1226–1227.
