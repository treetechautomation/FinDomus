# FINDOMUS — INVESTIMENTOS MOBILE WIREFRAME v1

**Fase:** 14 — Wireframe Mobile do Módulo Investimentos
**FDL:** 1.0 FROZEN
**Investimentos Architecture:** v1 homologada
**Universal Module Pattern:** v1 homologado (tipo P — Portfolio)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Viewport de referência:** 390 × 844px

---

## 1. RESUMO EXECUTIVO

Este wireframe prova que o módulo Investimentos funciona em 3 tabs mobile com 20 estados mapeados. As 10 tabs desktop foram consolidadas. O protagonista (`totalMarketValue`) ocupa um Summary de 1 superfície com 3 formatos comparados (vencedor: Hero + linha dupla). A alocação usa barras horizontais (vencedor sobre donut e lista). A carteira suporta 50 ativos com search + filtros rápidos. O Detail do ativo segue o contrato universal. A Análise consolida Health Score, 5 pilares, insights e dividendos em 1 tela de densidade Analytical.

---

## 2. MEDIDAS ESTRUTURAIS

| Elemento | Medida | Token |
|----------|:------:|-------|
| Header | 48px | Universal Pattern |
| Tabs | 44px | Universal Pattern |
| Summary | ~100px | Variável |
| Barras de alocação | 44px por classe | Touch target |
| List item (carteira) | 56px | Standard |
| Health Score | ~100px | Variável |
| Bottom Nav | 82px | Navigation Wireframe |
| Área útil (390×844) | 708px | 844 − 54 − 82 |

---

## 3. HEADER + TABS

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Investimentos                    [◈ Domus]       │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │ ← Tabs (44px)
│ │ Visão Geral  │   Carteira   │   Análise    │              │
│ │    [ATIVO]   │              │              │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│  CONTEÚDO DA TAB ATIVA                                       │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Header | ← Origem · "Investimentos" · [◈ Domus]. 48px, máx 2 ações ícone. |
| Tabs | 3 tabs. Active: text-primary, 600w, underline azul 2px. |

---

## 4. SUMMARY — COMPARAÇÃO OBRIGATÓRIA

### Opção A — Vertical

```
┌──────────────────────────────────────┐
│ Carteira                             │
│                                      │
│ R$ 42.800                            │
│                                      │
│ +R$ 4.300                            │
│ +11,2%                               │
│                                      │
│ Investido R$ 38.500                  │
└──────────────────────────────────────┘
```

### Opção B — Hero + linha dupla (RECOMENDADO)

```
┌──────────────────────────────────────┐
│ Carteira                             │
│                                      │
│ R$ 42.800                            │
│                                      │
│ Investido           Resultado        │
│ R$ 38.500           +R$ 4.300        │
│                     +11,2%           │
└──────────────────────────────────────┘
```

### Opção C — Hero + frase contextual

```
┌──────────────────────────────────────┐
│ Carteira                             │
│                                      │
│ R$ 42.800                            │
│                                      │
│ R$ 4.300 acima do valor investido    │
│ +11,2%                               │
└──────────────────────────────────────┘
```

| Critério | A | B | C |
|----------|:-:|:-:|:-:|
| Clareza (investido vs resultado) | 3 | **5** | 4 |
| Calma | 4 | **5** | 4 |
| 375px | 4 | **5** | 3 |
| Valor negativo | 3 | **5** | 3 |
| Privacy (mascarar) | 4 | **5** | 4 |
| **TOTAL** | **18** | **25** | **18** |

**Decisão: OPÇÃO B — Hero + linha dupla.** Separa investido de resultado com clareza. Funciona bem com valores negativos. A linha dupla é mais fácil de mascarar em privacy mode.

---

## 5. TAB 1 — VISÃO GERAL (INVEST-WF-01)

```
390 × 844px · Tab: Visão Geral · Contexto: PF

┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Investimentos                    [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │   Carteira   │   Análise    │              │
│ │    [ATIVO]   │              │              │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ CARTEIRA                                                 ││
│  │                                                          ││
│  │ R$ 42.800                                                ││ ← 36px hero
│  │                                                          ││
│  │ Investido              Resultado                         ││
│  │ R$ 38.500              +R$ 4.300  ·  +11,2%              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight (0-1)
│  │ ◈ Domus                                                  ││
│  │ Sua carteira está concentrada em Ações Nacionais          ││
│  │ (42%). Considere diversificar em outras classes.         ││
│  │                                                          ││
│  │ Entender                                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Alocação
│  │ ALOCAÇÃO POR CLASSE                                      ││
│  │                                                          ││
│  │ Ações Nacionais      R$ 18.200  42%  ████████████       ││
│  │ Renda Fixa           R$ 12.800  30%  █████████          ││
│  │ Fundos Imobiliários  R$  7.600  18%  █████              ││
│  │ Criptomoedas         R$  4.200  10%  ███                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Top ativos (3)
│  │ PRINCIPAIS ATIVOS                                        ││
│  │                                                          ││
│  │ PETR4   Petrobras        R$ 8.200  +14,2%         →     ││
│  │ Tesouro IPCA+ 2035       R$ 7.500  +6,8%          →     ││
│  │ MXRF11  Maxi Renda       R$ 4.200  +9,1%          →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Ações
│  │              [Adicionar investimento]                     ││ ← Primary
│  │                                                          ││
│  │ Importar B3  ·  Importar corretora  ·  Calculadoras →    ││ ← Secondary
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Alocação — Comparação

| Critério | A: Barras horizontais | B: Donut | C: Lista percentual |
|----------|:---:|:---:|:---:|
| Legibilidade | **5** | 3 | 4 |
| 375px | **5** | 2 | 4 |
| 7+ classes | **5** | 2 | 3 |
| Privacy | **5** | 4 | 4 |
| Não parece corretora | **5** | 2 | 4 |
| **TOTAL** | **25** | **13** | **19** |

**Decisão: OPÇÃO A — Barras horizontais.** Mais legível, escala para 7+ classes, não evoca gráfico de corretora.

### Action Hierarchy — Comparação

| Opção | Descrição | Avaliação |
|:-----:|-----------|-----------|
| **A** | [Adicionar] primário + importações/calculadoras secundárias | ✅ Recomendado. Clara hierarquia. |
| B | [Adicionar] + chips para importação e calculadoras | Polui. Chips são para filtros, não ações. |
| C | [+ ] único → Sheet "Mais ações" | Esconde funcionalidades importantes. |

**Decisão: OPÇÃO A.** 1 botão azul primário + 1 linha de ações secundárias (texto).

---

## 6. TAB 2 — CARTEIRA (INVEST-WF-02)

```
390 × 844px · Tab: Carteira

┌──────────────────────────────────────────────────────────────┐
│ ← Início    Investimentos                    [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │   Carteira   │   Análise    │              │
│ │              │   [ATIVO]    │              │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Search
│  │ 🔍 Buscar ativo...                                       ││ ← Sempre visível
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [Todos] [Ações Nac.] [Renda Fixa] [FIIs] [Cripto]          │ ← Chips filtro
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← List item (56px)
│  │ PETR4                          R$ 8.200            →     ││
│  │ Petrobras · Ações Nacionais    +14,2%                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Tesouro IPCA+ 2035              R$ 7.500           →     ││
│  │ Renda Fixa                      +6,8%                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ MXRF11                          R$ 4.200           →     ││
│  │ Maxi Renda · Fundos Imobiliários +9,1%                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ BTC                             R$ 3.800           →     ││
│  │ Bitcoin · Criptomoedas          +24,3%                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ WEGE3                           R$ 3.500           →     ││
│  │ WEG · Ações Nacionais           −2,1%                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ... (scroll)                                                │
│                                                              │
│  12 ativos                                                   │ ← Contador sutil
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### List Item — Comparação

| Opção | 375px | Clareza | renda fixa sem ticker | Scan |
|:-----:|:-----:|:-------:|:---------------------:|:----:|
| **A: ticker grande + nome/classe + valor + rentabilidade** | **5** | **5** | **5** | **5** |
| B: ticker·nome + classe + valor·rentabilidade | 4 | 3 | 4 | 3 |
| C: ticker + nome + valor apenas | 5 | 3 | 4 | 4 |

**Decisão: OPÇÃO A.** Ticker como identificador principal. Nome e classe na linha secundária. Valor à direita com rentabilidade.

### Search — Comparação

| Opção | Avaliação |
|:-----:|-----------|
| A: Sempre visível | ✅ Recomendado. 50 ativos exigem busca acessível. |
| B: Recolhido (ícone no header) | Esconde funcionalidade essencial para carteiras grandes. |

**Decisão: Sempre visível.** Campo de busca expandido no topo da lista. Em 50 ativos, é indispensável.

---

## 7. ASSET DETAIL (INVEST-WF-03)

```
390 × 844px · Detail: PETR4

┌──────────────────────────────────────────────────────────────┐
│ ← Carteira    PETR4                          [◈] [···]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ Petrobras · Ações Nacionais                              ││
│  │                                                          ││
│  │ R$ 8.200                                                 ││ ← 28px, 700w
│  │                                                          ││
│  │ Investido           Resultado                            ││
│  │ R$ 7.000            +R$ 1.200  ·  +17,1%                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Info
│  │ DETALHES                                                 ││
│  │                                                          ││
│  │ Quantidade       220 cotas                               ││
│  │ Preço médio      R$ 31,82                                ││
│  │ Preço atual      R$ 37,27                                ││
│  │ Instituição      NuInvest                                ││
│  │ Origem           Manual                                   ││
│  │                                                          ││
│  │ Cotação: BRAPI · atualizada agora                        ││ ← Freshness
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Proventos (se houver)
│  │ PROVENTOS                                                ││
│  │                                                          ││
│  │ Total recebido    R$ 340                                 ││
│  │ Último            15/07/2026 · R$ 85 (Dividendo)        ││
│  │                                                          ││
│  │ Ver todos os proventos →                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Actions
│  │ [Editar]    [Lançar provento]    [Excluir]               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. TAB 3 — ANÁLISE (INVEST-WF-04)

```
390 × 844px · Tab: Análise

┌──────────────────────────────────────────────────────────────┐
│ ← Início    Investimentos                    [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │   Carteira   │   Análise    │              │
│ │              │              │   [ATIVO]    │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Health Score
│  │ SAÚDE DA CARTEIRA                                        ││
│  │                                                          ││
│  │ 82/100    Nota A                                         ││ ← Opção A
│  │                                                          ││
│  │ Diversificação    ████████████████████    18/20          ││
│  │ Concentração      ██████████████████      16/20          ││
│  │ Liquidez          ████████████████████    18/20          ││
│  │ Dividendos        ██████████████          14/20          ││
│  │ Risco             ████████████████        16/20          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insights (0-3)
│  │ ANÁLISES                                                 ││
│  │                                                          ││
│  │ ⚠️  O setor Financeiro concentra 28% da                  ││
│  │     sua alocação de risco.                                ││
│  │                                                          ││
│  │ ✅  Excelente diversificação institucional!               ││
│  │     Seu patrimônio está em 3 instituições.               ││
│  │                                                          ││
│  │ ℹ️  Sua alocação em Renda Fixa (30%) está                ││
│  │     adequada para o perfil.                               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Dividendos
│  │ DIVIDENDOS                                               ││
│  │                                                          ││
│  │ Total recebido    R$ 1.240                               ││
│  │ Dividend Yield    2,9%                                   ││
│  │ Yield on Cost     3,4%                                   ││
│  │                                                          ││
│  │ [Lançar provento]                                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Health Score — Comparação

| Opção | Clareza | Não compete com protagonista | Scan |
|:-----:|:-------:|:---------------------------:|:----:|
| **A: "82/100 — Nota A"** | **5** | **5** | **5** |
| B: "82 — Carteira saudável" | 3 | 4 | 4 |
| C: "A — 82/100" | 3 | 5 | 4 |

**Decisão: OPÇÃO A.** Número + grade legível. Terminologia real do engine.

### Evolução Patrimonial — Comparação

| Opção | Avaliação |
|:-----:|-----------|
| A: Gráfico na própria tela Análise | ⚠️ Densidade alta. 3 seções + gráfico = ~3 viewports. |
| **B: "Ver evolução →" (tela dedicada)** | ✅ Recomendado. Mantém Análise em ≤2 viewports. |
| C: Abaixo dos dividendos | Scroll excessivo (≥4 viewports). |

**Decisão: OPÇÃO B.** "Ver evolução patrimonial →" como link na Análise. Abre tela dedicada com LineChart dos monthly closures. Mantém a tab Análise com densidade Analytical gerenciável.

---

## 9. ADD INVESTMENT (INVEST-WF-05)

### Bottom Sheet — Modo Catálogo

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro]                             │
├──────────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                         │
│                                                              │
│  Adicionar investimento                                      │
│                                                              │
│  Tipo                                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Ações Nacionais                                   ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Ativo                                                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ PETR4 — Petrobras                                ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Quantidade           Preço médio          Preço atual       │
│  ┌────────────┐      ┌────────────┐       ┌────────────┐    │
│  │ 220        │      │ R$ 31,82   │       │ R$ 37,27   │    │
│  └────────────┘      └────────────┘       └────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar ativo                                 ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Bottom Sheet — Modo Busca Ticker

```
┌──────────────────────────────────────────────────────────────┐
│  Adicionar investimento                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar ticker...                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resolvido
│  │ BTC — Bitcoin                                            ││
│  │ Criptomoedas · Binance · USD                             ││
│  │ R$ 352.400,00                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Quantidade           Preço médio          Preço atual       │
│  ┌────────────┐      ┌────────────┐       ┌────────────┐    │
│  │ 0,01       │      │ R$ 320.000 │       │ R$ 352.400 │    │
│  └────────────┘      └────────────┘       └────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar ativo                                 ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 10. ADD YIELD (INVEST-WF-08)

```
┌──────────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                         │
│                                                              │
│  Lançar provento                                             │
│                                                              │
│  Ativo                                                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ PETR4 — Petrobras                                ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Tipo                         Valor                          │
│  ┌────────────────────┐      ┌────────────┐                 │
│  │ Dividendo    ▾     │      │ R$ 85,00   │                 │
│  └────────────────────┘      └────────────┘                 │
│                                                              │
│  Data                                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 15/07/2026                                       ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar provento                              ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 11. DELETE (INVEST-WF-07)

```
┌──────────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                         │
│                                                              │
│  Excluir PETR4?                                              │
│                                                              │
│  Petrobras · Ações Nacionais                                 │
│  Valor atual: R$ 8.200                                       │
│                                                              │
│  O ativo será removido da sua carteira.                      │
│  Os dados de proventos associados serão perdidos.            │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Excluir                                     ││ ← state-negative
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Cancelar                                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 12. ESTADOS

### Empty (INVEST-WF-12)

```
┌──────────────────────────────────────────────────────────────┐
│              [ícone Landmark, 48px]                           │
│                                                              │
│       Você ainda não registrou investimentos                 │
│                                                              │
│   Adicione ativos manualmente ou importe                     │
│   sua carteira da B3 ou de corretoras.                       │
│                                                              │
│     ┌────────────────────────────────────────┐               │
│     │        Adicionar investimento          │               │
│     └────────────────────────────────────────┘               │
│                                                              │
│   Importar B3  ·  Importar corretora                         │
└──────────────────────────────────────────────────────────────┘
```

### Carteira Negativa (INVEST-WF-14)

```
┌──────────────────────────────────────────────────────────────┐
│ CARTEIRA                                                     │
│                                                              │
│ R$ 35.200                                                    │
│                                                              │
│ Investido              Resultado                             │
│ R$ 38.500              −R$ 3.300  ·  −8,6%                   │
└──────────────────────────────────────────────────────────────┘
```

Vermelho APENAS no valor do resultado e no percentual. Card NÃO fica vermelho.

### Privacy (INVEST-WF-15)

```
┌──────────────────────────────────────────────────────────────┐
│ CARTEIRA                                                     │
│                                                              │
│ R$ ••••••                                                    │
│                                                              │
│ Investido              Resultado                             │
│ R$ ••••••              +••%                                  │
└──────────────────────────────────────────────────────────────┘
```

Alocação: valores mascarados, percentuais e nomes de classe visíveis. Carteira: valores mascarados, tickers/nomes visíveis.

### Offline (INVEST-WF-16)

Banner "Você está offline. Dados de 28 de julho." Cotações não atualizadas. "Adicionar" e "Importar" desabilitados. Dados cacheados da carteira visíveis.

### Loading (INVEST-WF-18)

Skeleton: Summary (2 linhas), barras de alocação (4 placeholders), top ativos (3 placeholders). Não spinner central.

### 50 Ativos (INVEST-WF-19)

Search visível. Filtros rápidos. Lista com scroll. Performance: renderização condicional (virtualização futura). Wireframe prova que estrutura não quebra com 50 itens — cada item 56px, scroll natural.

### 7+ Classes (INVEST-WF-20)

Barras de alocação com "Ver todas as classes →" após 5 barras. Expansão via Sheet com lista completa.

---

## 13. DOMUS CONTEXTUAL (INVEST-WF-11)

```
Usuário em: Carteira · PETR4
Toca: [◈ Domus] no header

Contexto enviado:
{
  financialContext: "PF",
  moduleContext: "investimentos",
  activeTab: "carteira",
  activeAsset: { id, ticker: "PETR4", type: "Ações Nacionais" }
}

Retorno: ← Domus no header. Carteira restaurada. PETR4 mantido.
```

---

## 14. IMPORT ENTRY (INVEST-WF-09)

```
Investimentos → "Importar B3" → /importacoes?source=b3
Header: ← Investimentos
Ao concluir importação → volta para Investimentos
Bottom Nav: Início ativo (se veio da Home)
```

---

## 15. FLUXOS

### Back

| Origem | Header | Comportamento |
|--------|--------|--------------|
| Home → Investimentos | ← Início | Volta para Home. Scroll/tab preservados. |
| Módulos → Investimentos | ← Módulos | Volta para Módulos. |
| Visão Geral → Detail | ← Carteira | Volta para Carteira. Scroll/filtro preservados. |
| Detail → Edit Sheet | ← Carteira | Sheet fecha. Detail preservado. |

### Deep Links

| Rota | Comportamento |
|------|--------------|
| `/investimentos` | Abre na tab Visão Geral |
| `/investimentos?tab=carteira` | Abre na tab Carteira |
| `/investimentos?tab=carteira&search=PETR4` | Abre Carteira com busca preenchida |
| `/investimentos/ativo/PETR4` | Abre Detail do ativo. Back → Carteira. ⚠️ Rota futura |

### State Restoration

| Estado | Persiste? |
|--------|:---------:|
| Tab ativa | ✅ (durante sessão) |
| Scroll da lista | ✅ (durante sessão) |
| Filtro de classe | ✅ (durante sessão) |
| Search query | ❌ (reseta ao sair) |
| Detail aberto | ❌ (reseta ao sair do módulo) |

---

## 16. TESTES

### Identidade

| Teste | Resultado |
|-------|:---------:|
| **Corretora:** Trocar nome por XP/Modal → parece corretora? | ✅ Não. Sem ticker protagonista. Sem cotação em tempo real na visão principal. Sem ordem de compra/venda. |
| **Home broker:** Cotações dominam? | ✅ Não. Cotações só no detail, sob demanda. |
| **Trading:** Variação de mercado > patrimônio? | ✅ Não. Protagonista é valor da carteira, não variação. |
| **Dashboard:** Overview é coleção de widgets? | ✅ Não. Summary hierárquico + alocação + top ativos integrados. |
| **Planilha:** Carteira é tabela adaptada? | ✅ Não. Lista de cards com hierarquia visual. |
| **Calculadoras:** Ferramentas são centrais? | ✅ Não. Ação secundária na Visão Geral. |

### 5 Segundos

| Tela | Percepção |
|------|----------|
| **Visão Geral** | "R$ 42.800 investidos · +11,2% · distribuído em 4 classes · top: PETR4" |
| **Carteira** | "12 ativos · PETR4 R$ 8.200 · Tesouro R$ 7.500 · posso buscar e filtrar" |
| **Análise** | "Nota A · 82/100 · Diversificação 18/20 · Dividendos R$ 1.240" |

### Viewports

| Viewport | Resultado |
|----------|:---------:|
| 375px | Tabs cabem (3×~115px). Summary com valores em 2 colunas. Barras de alocação OK. List items OK. |
| 390px | Referência. Confortável. |
| 430px | Mais respiro. Sem alteração estrutural. |

---

## 17. COMPARISONS SUMMARY

| Comparação | Vencedor | Placar |
|------------|----------|:------:|
| Summary | **B: Hero + linha dupla** | 25/25 |
| Alocação | **A: Barras horizontais** | 25/25 |
| List Item | **A: Ticker grande + nome/classe + valor + rentabilidade** | — |
| Action Hierarchy | **A: 1 primary + 1 linha secondary** | — |
| Health Score | **A: Número + grade** | — |
| Evolução | **B: "Ver evolução →" tela dedicada** | — |
| Search | **A: Sempre visível** | — |

---

## 18. CONTRACTS

### Summary Contract
```
1 superfície Surface, radius-md.
Protagonista: totalMarketValue (reservado 36px financial-hero).
Linha dupla: Investido (esquerda) | Resultado + % (direita).
Negativo: apenas resultado e % em state-negative. Card NUNCA vermelho.
Privacy: valores mascarados. % mascarado.
Zero invested: não mostrar rentabilidade (evitar divisão por zero).
```

### Allocation Contract
```
Barras horizontais. Máx 5 visíveis. + "Ver todas →" se >5.
Cada barra: nome da classe + valor + percentual + barra proporcional.
Cor: usar cor da classe do WealthProfile/engine (funcional, não decorativa).
Toque: filtra Carteira por aquela classe.
```

### Portfolio List Contract
```
Item Standard 56px. Ticker (14px, 600w) + nome/classe (12px, 400w).
Valor (14px, 600w, tabular-nums, direita) + rentabilidade (12px, 500w).
Toque: abre Detail.
Filtros: chips horizontais. Search: campo sempre visível.
Compact mode: se >30 ativos, opcionalmente reduzir altura para 44px (sem linha de nome).
```

### Asset Detail Contract
```
Header: ← Carteira + ticker + [◈ Domus] [···].
Summary: nome + classe + valor (28px) + investido + resultado.
Info: quantidade, preço médio, preço atual, instituição, origem, freshness.
Proventos (se houver): total + último.
Actions: ≤3. Editar, Lançar provento, Excluir (último).
Delete: Sheet de confirmação com state-negative.
```

### Analysis Contract
```
Health Score: 1 superfície. Nota numérica + grade. 5 pilares com barra + score/max.
Insights: 0-3 visíveis. "Ver todos" se >3. Tipos: info, success, warning, danger.
Dividendos: 1 superfície com 3 métricas. Total recebido, DY, YOC.
Evolução: "Ver evolução →" → tela dedicada com LineChart.
```

---

## 19. CONTRACTS (CONT.)

### Form Contract — Add Investment
```
Bottom Sheet. 2 modos: catálogo (tipo → ativo → qtd/preço) ou busca ticker.
5 campos: tipo, ativo/ticker, quantidade, preço médio, preço atual.
Salvar: full-width azul. Loading state no botão.
Keyboard: input financeiro → teclado numérico.
```

### Form Contract — Add Yield
```
Bottom Sheet. 4 campos: ativo, tipo, valor, data.
Tipo: DIVIDEND, JCP, FII, COUPON, OTHER (valores reais do código).
```

### Import Entry Contract
```
Ação secundária na Visão Geral. Navega para /importacoes.
Header: ← Investimentos. Ao concluir, retorna.
Estado do módulo pai preservado.
```

### Domus Contract
```
Entrada: ícone no header. Contexto: financialContext + moduleContext + activeTab + activeAsset (se detail).
Retorno: preserva tab, scroll, filtros, asset detail.
```

---

## 20. CURRENT → WIREFRAME MAP

| Desktop | Mobile | Ação |
|---------|--------|------|
| 10 tabs | 3 tabs | CONSOLIDATE |
| 4 KPI Cards | 1 Summary superfície | MERGE |
| Consolidação (PieCharts) | Visão Geral (barras alocação) | ADAPT |
| Ativos (tabela) | Carteira (cards) | ADAPT |
| Análise + Yields + Aportes | Análise (health + insights + dividendos) | MERGE |
| B3 Dashboard | Ação secundária | MOVE |
| Market Watch | Detail (sob demanda) | MOVE |
| Goals (placeholder) | — | HIDE |
| Questions (placeholder) | Domus cobre | HIDE |
| Portfolio Chart (isolado) | Alocação na Visão Geral | MERGE |
| Evolução Patrimonial | Tela dedicada (via Análise) | MOVE |

---

## 21. COMPLIANCE

| Contrato | Status |
|----------|:------:|
| FDL 1.0 | ✅ |
| Navigation v1 | ✅ |
| Domus v1 | ✅ |
| Universal Module Pattern v1 | ✅ |
| Investimentos Architecture v1 | ✅ |

Nenhuma decisão homologada foi alterada.

---

## 22. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**INVEST-WF-P0: 0 · INVEST-WF-P1: 0 · INVEST-WF-P2: 2 · INVEST-WF-P3: 2**

### P2

| ID | Descrição |
|----|-----------|
| P2-01 | Deep link `/investimentos/ativo/{ticker}` — rota não existe, requer implementação. |
| P2-02 | "Ver evolução patrimonial →" — tela dedicada com LineChart não existe como rota separada. |

### P3

| ID | Descrição |
|----|-----------|
| P3-01 | Virtualização de lista para 50+ ativos (performance). |
| P3-02 | Contexto Família e PJ não implementados. |

---

## 23. CHANGE REQUESTS

Nenhum. O wireframe é compatível com todos os contratos homologados.

---

## 24. RECOMENDAÇÃO FINAL

O Investimentos Mobile Wireframe prova que 3 tabs são suficientes para cobrir todas as capacidades do módulo — valor da carteira, alocação, lista de ativos com search/filter, detail com ações, health score com 5 pilares, insights rule-based, dividendos e evolução patrimonial. A experiência não parece corretora, home broker, trading app ou planilha.

**Próximo passo:** Com INVEST-WF-P0 = 0 e INVEST-WF-P1 = 0:

→ **INVESTIMENTOS MOBILE MASTER VISUAL v1**

---

*FinDomus Investimentos Mobile Wireframe v1 · Fase 14 concluída · Aguardando homologação*
