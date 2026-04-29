# Engine — detalhamento matemático (v0.1)

O pacote `@ahcf-cps/engine` implementa a lógica de decisão do framework
AHCF-CPS. Esta versão usa uma **estratégia linear ponderada** como baseline;
estratégias AHP/TOPSIS/Fuzzy estão no roadmap.

## 1. Entradas (inputs Likert 1–5)

| Chave                 | Dimensão primária    | Referência principal                 |
|-----------------------|----------------------|--------------------------------------|
| `taskComplexity`      | Task Complexity      | El Zaatari et al. (2019)             |
| `variability`         | Task Complexity      | Giberti et al. (2022)                |
| `operatorExperience`  | Human Preference     | Wolffgramm et al. (2024)             |
| `safetyRequired`      | Safety               | Proia et al. (2025); Faccio (2024)   |
| `ergonomicLoad`       | Ergonomic            | Wu et al. (2025)                     |
| `resourcesAvailable`  | contexto             | —                                    |
| `productivityGoal`    | Performance          | Calzavara et al. (2024)              |
| `costConstraint`      | penalidade γ         | —                                    |
| `leadershipPreference`| Human Preference     | Noormohammadi-Asl et al. (2025)      |
| `transparencyNeed`    | Human Preference     | Bagheri et al. (2022)                |

## 2. Normalização

Cada Likert é mapeado para `[0, 1]`:

```
norm(x) = (x − 1) / 4
```

## 3. Dimension Scores

```
safety         = norm(safetyRequired)
ergonomic      = norm(ergonomicLoad)
performance    = norm(productivityGoal)
taskComplexity = 0.6 · norm(taskComplexity) + 0.4 · norm(variability)
humanPref      = 0.5 · (1 − norm(operatorExperience))
               + 0.3 · norm(transparencyNeed)
               + 0.2 · norm(leadershipPreference)
```

Observação: `humanPref` captura a **demanda por suporte humano-robô** — é
alta quando o operador é iniciante, quando há exigência de transparência e
quando ele prefere liderar (autonomia ativa).

## 4. Perfis dos métodos

Cada método `j ∈ M` tem um vetor de **afinidades** `a_j ∈ [0,1]⁵` e um
`costFactor_j ∈ [0,1]` (ver `packages/engine/src/methods.ts`).

## 5. Score bruto

```
S_j = Σ_d  w_d · a_{j,d} · dim_d  −  γ · costFactor_j · norm(costConstraint)
```

Com pesos default:

```
w_safety=1.2, w_ergonomic=1.0, w_humanPref=1.0,
w_performance=1.0, w_taskComplexity=1.0, γ=0.8
```

## 6. Regras de negócio (RN)

Aplicadas como multiplicadores sobre `S_j`:

| Regra | Condição                                         | Efeito                                       |
|-------|--------------------------------------------------|----------------------------------------------|
| RN01  | `safetyRequired = 5`                             | `× 0.85` em Convencional e XR               |
| RN02  | `operatorExperience ≤ 2`                         | `× 1.1` em PbD/XR; `× 1.05` em Cinestésico  |
| RN03  | `taskComplexity ≥ 4` e `variability ≤ 2`         | `× 1.1` em Convencional; `× 1.05` em Shared |
| RN04  | `variability ≥ 4`                                | `× 1.15` em Shared; `× 1.1` em PbD; `× 0.8` em Convencional |
| RN05  | `costConstraint ≥ 4`                             | `× 0.75` em XR; `× 0.85` em Shared; alerta   |
| RN08  | `leadershipPreference ≤ 2` e `taskComplexity ≥ 4`| `× 1.1` em Shared                            |
| RN09  | `transparencyNeed ≥ 4`                           | `× 0.92` em Shared; alerta XAI               |

## 7. Normalização final e ranking

```
normalized_j = (S_j − min) / (max − min)
recommended  = argmax_j S_j
```

## 8. Determinismo e reprodutibilidade

- A engine é **determinística** (mesmo input → mesmo output).
- `engineVersion` e `strategy` acompanham cada resultado.
- Em release pública, `CHANGELOG.md` documenta qualquer mudança de pesos.

## 9. Estratégia AHP (implementada)

A estratégia `AhpStrategy` implementa o método Analytic Hierarchy Process
(técnica multicritério clássica mencionada pelo artigo AHCF-CPS, §7.9)
sobre as mesmas cinco dimensões:

1. Matriz pareada 5×5 (escala 1–9), reciprocamente consistente.
2. Vetor de prioridades obtido por **média geométrica das linhas** (boa
   aproximação do autovetor principal).
3. Score por método = Σ_d priority_d · a_{j,d} · dim_d − γ · costFactor_j ·
   norm(costConstraint).
4. O pacote expõe `consistencyRatio(matrix)` para monitorar CR; a matriz
   default atinge CR ≤ 0.10 (aceitável).

## 10. Perfis setoriais

`packages/engine/src/sectors.ts` define pesos e matrizes AHP pré-calibrados
por setor (`generic`, `automotive`, `pharmaceutical`, `logistics`,
`electronics`, `agroindustrial`, `metalmechanical`). A função
`runSimulation(inputs, { strategy, sector })` aplica o perfil correspondente.

## 11. Estratégia TOPSIS (implementada)

`TopsisStrategy` (Hwang & Yoon, 1981) aplica:

1. Matriz de decisão D[j,d] = afinidade_{j,d} · dim_d (com penalidade de
   custo distribuída pelas dimensões).
2. Normalização vetorial por coluna.
3. Multiplicação pelos pesos (vindos do AHP priority vector).
4. Determinação de A⁺ (melhor por dimensão) e A⁻ (pior).
5. Distâncias euclidianas S⁺, S⁻ e closeness coefficient
   C_j = S⁻ / (S⁺ + S⁻) ∈ [0, 1].
6. Ranking por C_j decrescente.

Invocável via `runSimulation(inputs, { strategy: 'topsis', sector })` ou
`new TopsisStrategy(weights, costPenalty)` diretamente.

## 12. Performance

`pnpm --filter @ahcf-cps/engine bench` roda 5 000 iterações por estratégia
e gate no p95 > 5 ms. Medição de referência:

```
strategy   mean(ms)  p95(ms)  p99(ms)
linear     0.010     0.015    0.067
ahp        0.012     0.018    0.053
topsis     0.040     0.066    0.222
```

Ou seja, todas as estratégias atendem ao RNF01 (≤ 1 s) com ~4 ordens de
magnitude de margem.

## 13. Roadmap

- **v0.4**: pesos setoriais sobrescritíveis via payload/DB.
- **v2.0**: Fuzzy Logic (Mamdani) e Bayesian Decision Model.
- **v2.x**: RL adaptativo com feedback de simulações reais.
