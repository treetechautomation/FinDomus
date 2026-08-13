# FINDOMUS — PLANEJAMENTO MOBILE WIREFRAME v1

**Fase:** 11 — Wireframe Mobile do Módulo Planejamento
**FDL:** 1.0 FROZEN
**Planejamento Architecture:** v1 homologada
**Universal Module Pattern:** v1 homologado (tipo PL)
**Navigation:** v1 homologada
**Viewport de referência:** 390 × 844px

---

## 1. RESUMO EXECUTIVO

Este wireframe prova que o Planejamento Mobile funciona em 3 tabs com 3 KPIs (não 6), orçamento em cards verticais (não tabela 760px), e estratégia de alocação percentual como núcleo do módulo (não "metas" com target/deadline).

As decisões de formato (KPIs em 1 superfície unificada, estratégia com barras horizontais, simulações via ação secundária na Visão Geral) foram validadas contra 375px, 390px e 430px. A Domus contextual está presente no header. O módulo não parece dashboard, planilha, lista de metas ou calculadora.

---

## 2. MEDIDAS ESTRUTURAIS

| Elemento | Medida | Token FDL |
|----------|:------:|-----------|
| Header | 48px | Padrão Universal |
| Tabs | 44px | Touch target |
| Summary card | ~80px | Variável |
| KPI row (3 métricas) | ~64px | 3 colunas, 44px touch |
| Budget card (categoria) | 72px | Nome + barra + valores |
| Strategy pillar row | 56px | Nome + % + barra |
| Gap entre seções | `space.6` (24px) | Mudança de contexto |
| Gap entre cards | `space.2` (8px) | Itens relacionados |
| Bottom Nav | 82px | Navigation Wireframe |
| Área útil (390×844) | 708px | 844 − 54 − 82 |

---

## 3. HEADER + TABS

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Planejamento                     [◈ Domus]       │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │ ← Tabs (44px)
│ │ Visão Geral  │  Orçamento   │  Estratégia  │              │
│ │    [ATIVO]   │              │              │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CONTEÚDO DA TAB ATIVA                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Header | ← Origem (16px, 600w) // "Planejamento" (16px, 600w) // [◈ Domus] (ícone 24px, 44px touch) |
| Tabs | 3 tabs. Active: text-primary, 600w, underline azul 2px. Inactive: text-tertiary, 500w. |
| Origem | "← Início" se veio da Home. "← Módulos" se veio dos Módulos. "← Domus" se deep link. |
| Domus | Ícone no header (slot único). Touch target 44px. Marcado: UX READY / TECH PENDING. |

---

## 4. FORMATO DOS 3 KPIs — COMPARAÇÃO

### Opção A — 3 cards independentes

```
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ Receita             │ │ Despesas            │ │ Saldo               │
│ R$ 6.200            │ │ R$ 4.280            │ │ R$ 1.920            │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### Opção B — 1 superfície com 3 métricas (RECOMENDADO)

```
┌──────────────────────────────────────────────────────────────┐
│ Este mês                                                     │
│                                                              │
│ Receita              Despesas               Saldo            │
│ R$ 6.200             R$ 4.280               R$ 1.920         │
│                      69% da receita          31% da receita   │
└──────────────────────────────────────────────────────────────┘
```

### Opção C — 2+1 layout

```
┌─────────────────────┐ ┌─────────────────────┐
│ Receita    R$ 6.200 │ │ Despesas  R$ 4.280  │
└─────────────────────┘ └─────────────────────┘
┌──────────────────────────────────────────────┐
│ Saldo                   R$ 1.920             │
└──────────────────────────────────────────────┘
```

### Opção D — strip horizontal

```
┌──────────────────────────────────────────────────────────────┐
│ Receita · R$ 6.200 │ Despesas · R$ 4.280 │ Saldo · R$ 1.920 │
└──────────────────────────────────────────────────────────────┘
```

### Pontuação

| Critério | A (3 cards) | B (1 superfície) | C (2+1) | D (strip) |
|----------|:-----------:|:----------------:|:-------:|:---------:|
| Calm (não parece dashboard) | 2 | **5** | 3 | 3 |
| Leitura rápida (375px) | 4 | **5** | 3 | 4 |
| Scan vertical | 3 | **5** | 3 | 5 |
| Números legíveis em 36px | 2 | **4** | 3 | 2 |
| Não parece grade de KPI | 1 | **5** | 3 | 2 |
| **TOTAL** | **12** | **24** | **15** | **16** |

**Decisão: OPÇÃO B — 1 superfície unificada com 3 métricas em linha.**

Justificativa: 3 cards lado a lado evocam dashboard (viola FDL Calm). A superfície unificada é percebida como "resumo do mês", não como "painel de indicadores". Os números ficam legíveis mesmo em 375px porque cada coluna tem ~114px.

---

## 5. TAB 1 — VISÃO GERAL (PLANNING-WF-01)

```
390 × 844px · Tab: Visão Geral · Contexto: PF · Dados completos

┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Planejamento                     [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │  Orçamento   │  Estratégia  │              │
│ │    [ATIVO]   │              │              │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ ESTRATÉGIA ATUAL                                         ││
│  │                                                          ││
│  │ Sua distribuição está equilibrada.                       ││
│  │ Principal alocação: Essenciais · 30%                     ││
│  │ Secundária: Independência financeira · 25%               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← agosto 2026 →                                             │ ← Month navigator
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← KPIs (1 superfície)
│  │ Este mês                                                 ││
│  │                                                          ││
│  │ Receita           Despesas              Saldo            ││
│  │ R$ 6.200          R$ 4.280              R$ 1.920         ││
│  │                   69% da receita         31% da receita   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight (0-1)
│  │ ◈ Domus                                                  ││
│  │ Sua margem de 31% está acima da média dos                ││
│  │ últimos 3 meses (24%).                                    ││
│  │                                                          ││
│  │ Entender                                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Recomendações
│  │ RECOMENDAÇÕES                                            ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ Crítica                                          →  │ ││
│  │ │ Completar reserva de emergência                      │ ││
│  │ │ Impacto: R$ 680 · +3 pts no índice                   │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ Alta                                             →  │ ││
│  │ │ Aumentar aporte em Construção patrimonial             │ ││
│  │ │ Impacto: R$ 500/mês · +2 pts no índice                │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Simular cenário >                                           │ ← Ação secundária
│                                                              │
│  ← space.16 (64px) →                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │ ← Bottom Nav
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Elementos da Visão Geral

| # | Elemento | Obrigatório? | Descrição |
|---|----------|:-----------:|-----------|
| 1 | Summary (estratégia atual) | ✅ | 2-3 linhas: síntese da distribuição + principal alocação |
| 2 | Month navigator | ✅ | ← agosto 2026 → |
| 3 | 3 KPIs (superfície unificada) | ✅ | Receita, Despesas, Saldo. Percentual de referência. |
| 4 | Insight Domus | Opcional (0-1) | 1 insight, máximo 3 linhas + CTA "Entender" |
| 5 | Recomendações | Opcional (0-3) | Action plan do Freedom Index. Cada item: prioridade (badge), título, descrição, impacto, CTA → |
| 6 | Simular cenário | Opcional | Ação secundária. Texto "Simular cenário >" |
| 7 | Bottom Nav | ✅ | Ativo conforme origem |

### Ação principal

**Decisão:** A Visão Geral NÃO tem botão azul preenchido como ação principal. A ação mais frequente nesta tab é "entender" (via insight ou recomendações). "Ajustar estratégia" é ação da tab Estratégia. "Simular cenário" é ação secundária.

---

## 6. TAB 2 — ORÇAMENTO (PLANNING-WF-02)

```
390 × 844px · Tab: Orçamento · Mês: agosto 2026

┌──────────────────────────────────────────────────────────────┐
│ ← Início    Planejamento                     [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │  Orçamento   │  Estratégia  │              │
│ │              │   [ATIVO]    │              │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ← agosto 2026 →                                             │ ← Month navigator
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resumo
│  │ Receita do mês     R$ 6.200                              ││
│  │ Total gasto        R$ 4.700    76% da receita            ││
│  │ Acima do planejado em 2 categorias                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Budget Card (Essenciais)
│  │ Essenciais                                       ✅      ││ ← Nome + status
│  │ Teto: R$ 1.860  ·  Gasto: R$ 1.720  ·  Restam: R$ 140  ││ ← Valores
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ 92% utilizado               ││ ← Barra
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Budget Card (Qualidade)
│  │ Qualidade de vida                                ✅      ││
│  │ Teto: R$ 620  ·  Gasto: R$ 540  ·  Restam: R$ 80        ││
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ 87% utilizado                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Budget Card (Patrimônio)
│  │ Construção patrimonial                           ✅      ││
│  │ Teto: R$ 1.240  ·  Gasto: R$ 980  ·  Restam: R$ 260     ││
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱ 79% utilizado                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Budget Card (Estilo ⚠️)
│  │ Estilo de vida                                   ⚠️      ││ ← Status warn
│  │ Teto: R$ 620  ·  Gasto: R$ 890  ·  Acima em: R$ 270     ││ ← state-negative
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 143% utilizado           ││ ← Barra vermelha
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Budget Card (Independência)
│  │ Independência financeira                         ✅      ││
│  │ Teto: R$ 1.550  ·  Gasto: R$ 380  ·  Restam: R$ 1.170   ││
│  │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ 25% utilizado                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Budget Card (Intelectual)
│  │ Capital intelectual                              ✅      ││
│  │ Teto: R$ 310  ·  Gasto: R$ 190  ·  Restam: R$ 120       ││
│  │ ▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱ 61% utilizado                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 (64px) →                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Budget Card — Especificação

| Elemento | Especificação |
|----------|--------------|
| Altura | 72px |
| Nome | 14px, 600w, text-primary. Nome real do pilar. |
| Status | ✅ (dentro do teto), ⚠️ (atenção), ❌ (estourou). Ícone Lucide, não emoji. |
| Teto/Gasto/Diferença | 13px, 500w. "Teto: R$ X · Gasto: R$ Y · Restam: R$ Z" ou "Acima em: R$ Z" |
| Barra de progresso | 4px altura. Fundo Raised. Preenchimento: text-tertiary (normal), state-warning (atenção), state-negative (estourou). |
| Cor de fundo | Card Surface padrão. NUNCA pintar card inteiro de vermelho. |
| Touch | Card inteiro tocável → Detail do pilar (gastos detalhados do mês naquela categoria). |

---

## 7. TAB 3 — ESTRATÉGIA (PLANNING-WF-03)

### Formato — Comparação

| Opção | Descrição | Avaliação |
|:-----:|-----------|-----------|
| A | 6 cards verticais | Ocupa muito. Concorre com orçamento visualmente. |
| B | Lista com % à direita | Pobre. Não mostra proporção relativa. |
| C | Gráfico (donut) + lista | Donut apenas decora. Informação já está nos %. |
| **D** | **Barras horizontais com label + %** | **Visualiza proporção relativa. Escaneável. Cada barra é interativa.** |

**Decisão: OPÇÃO D — Barras horizontais.**

```
390 × 844px · Tab: Estratégia

┌──────────────────────────────────────────────────────────────┐
│ ← Início    Planejamento                     [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │  Orçamento   │  Estratégia  │              │
│ │              │              │   [ATIVO]    │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ DISTRIBUIÇÃO DA RENDA                                    ││
│  │                                                          ││
│  │ Total: 100%  ✅                                          ││
│  │                                                          ││
│  │ Sua renda mensal é distribuída entre                     ││
│  │ 6 pilares. Cada pilar define um teto de gastos.          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Pillar row
│  │ Essenciais                                       30%  → ││ ← Nome + % + chevron
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱││ ← Barra azul-claro
│  │ 5 categorias vinculadas                                  ││ ← Meta info
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Qualidade de vida                                10%  → ││
│  │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱││ ← Barra verde
│  │ 4 categorias vinculadas                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Construção patrimonial                           20%  → ││
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱││ ← Barra amarela
│  │ 3 categorias vinculadas                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Estilo de vida                                   10%  → ││
│  │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱││
│  │ 8 categorias vinculadas                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Independência financeira                         25%  → ││
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱││ ← Barra azul-escuro
│  │ 2 categorias vinculadas                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Capital intelectual                               5%  → ││
│  │ ▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱││ ← Barra laranja
│  │ 6 categorias vinculadas                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Actions
│  │              [Ajustar estratégia]                         ││ ← Primary (azul)
│  │              [Restaurar padrão]                           ││ ← Secondary (outline)
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 (64px) →                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Pillar Row — Especificação

| Elemento | Especificação |
|----------|--------------|
| Altura | 56px (44px touch + padding) |
| Nome | 14px, 600w, text-primary |
| Percentual | 14px, 700w, text-primary, alinhado à direita, tabular-nums |
| Barra | 6px altura, radius 3px. Largura proporcional ao %. Cor = cor do pilar (do WealthProfile). Fundo da barra = Raised. |
| Meta info | "N categorias vinculadas", 11px, text-tertiary |
| Touch | Abre Detail do Pilar |

### Ação principal

"Ajustar estratégia" → botão azul full-width, 44px. Abre tela de edição dos 6 pilares.
"Restaurar padrão" → botão outline full-width, 44px.

---

## 8. EDITAR ESTRATÉGIA (PLANNING-WF-04)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Estratégia   Ajustar estratégia                            │ ← Header com back
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Total: 100%  ✅                                              │ ← Validação
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Pillar edit
│  │ Essenciais                                       30%  ▾  ││ ← Expansível
│  │ ──────────────────────────────────────────────────────── ││
│  │ [██████████████████████████████░░░░░░░░░░░░░░░░░]        ││ ← Slider
│  │                                                          ││
│  │ Cor: [■]                                                 ││ ← Color picker
│  │                                                          ││
│  │ Categorias vinculadas:                                   ││
│  │ [Moradia ×] [Alimentação ×] [Transporte ×] [Energia ×]   ││
│  │                                                          ││
│  │ [+ Adicionar categoria]                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Collapsed
│  │ Qualidade de vida                                10%  ▸  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Construção patrimonial                           20%  ▸  ││
│  └──────────────────────────────────────────────────────────┘│
│  ...                                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              [Salvar estratégia]                          ││ ← Sticky save
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Header | ← Estratégia + "Ajustar estratégia" |
| Validação | "Total: 100% ✅" ou "Total: 95% ⚠️ — A soma precisa ser 100%" |
| Accordion | 1 pilar expandido por vez. Demais colapsados. |
| Slider | 0-100%, step 1. Ajuste automático dos outros pilares? NÃO — usuário controla. Validação no save. |
| Categorias vinculadas | Chips removíveis. Select para adicionar (filtra já vinculadas). |
| Save | Full-width azul. Sticky no bottom. Desabilitado se total ≠ 100%. |
| Cor | Color input nativo (6 cores). |

---

## 9. DETALHE DO PILAR (PLANNING-WF-05)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Estratégia   Essenciais                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Alocação: 30% da renda                                   ││
│  │                                                          ││
│  │ Teto atual (R$ 6.200): R$ 1.860                          ││
│  │ Gasto este mês: R$ 1.720                                 ││
│  │                                                          ││
│  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ 92% utilizado               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ CATEGORIAS VINCULADAS                                    ││
│  │                                                          ││
│  │ Moradia (aluguel, condomínio)                            ││
│  │ Alimentação                                              ││
│  │ Transporte                                               ││
│  │ Energia                                                  ││
│  │ Internet                                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ GASTOS DO MÊS — Essenciais                               ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ 15/08  Supermercado         R$ 620            →     │ ││
│  │ │ 10/08  Aluguel              R$ 800            →     │ ││
│  │ │ 05/08  Posto gasolina       R$ 200            →     │ ││
│  │ │ 02/08  Conta de luz         R$ 100            →     │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  │                                                          ││
│  │ Ver todas as transações >                                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. SIMULAÇÕES (PLANNING-WF-06)

### Ponto de acesso

**Decisão: Opção A — ação secundária na Visão Geral ("Simular cenário >").**

| Opção | Avaliação |
|:-----:|-----------|
| **A — ação secundária na Visão Geral** | ✅ Recomendado. Visível sem ocupar espaço permanente. |
| B — card na Visão Geral | Ocupa espaço fixo para uso ocasional. |
| C — overflow (··· menu) | Esconde funcionalidade. |
| D — ação na Estratégia | Contexto errado (simulação não é sobre editar estratégia). |

### Tela de Simulação

```
┌──────────────────────────────────────────────────────────────┐
│ ← Planejamento   Simular cenário                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Tipo de simulação
│  │ [Quitar dívida]  [Aporte mensal]  [Cortar gastos]        ││ ← Chips
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Parâmetros
│  │ Aporte mensal                                            ││
│  │                                                          ││
│  │ R$ 500                                                   ││
│  │ [████████████████████████░░░░░░░░░░░░░░░░]               ││ ← Slider
│  │ 100                                         10.000       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resultado
│  │               Atual               Simulado               ││
│  │              ───────              ────────                ││
│  │ Índice        67                   74       +7 ▲         ││
│  │ Patrimônio    R$ 46.850           R$ 52.850  +R$ 6.000   ││
│  │ Reserva       4,2 meses           5,1 meses  +0,9        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 💡 Com R$ 500/mês de aporte, você atingiria              ││
│  │     o Nível Crescimento em aproximadamente 8 meses.      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Header | ← Planejamento + "Simular cenário" |
| Tipo de simulação | 3 chips. Active = action-primary-soft. |
| Parâmetros | Slider + valor atual. Rótulo claro. |
| Resultado | Comparison card: 2 colunas (atual vs simulado). 3-4 métricas com delta. |
| Recomendação | Texto contextual. Sem emojis (usar ícone Lucide). |
| Status técnico | ⚠️ UX READY / INTEGRATION PENDING. Componente ScenarioComparator existe standalone. |

---

## 11. ESTADOS

### 11.1 Primeiro Acesso — Sem WealthProfile (PLANNING-WF-07)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início    Planejamento                     [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐              │
│ │ Visão Geral  │  Orçamento   │  Estratégia  │              │
│ └──────────────┴──────────────┴──────────────┘              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    [ícone Target, 48px]                       │
│                                                              │
│         Você ainda não definiu sua estratégia                │
│                                                              │
│   Distribua sua renda entre os 6 pilares                     │
│   da vida financeira para criar tetos de gastos.             │
│                                                              │
│         ┌────────────────────────────────────────┐           │
│         │        Criar estratégia                │           │ ← Primary CTA
│         └────────────────────────────────────────┘           │
│                                                              │
│   A estratégia define quanto da sua renda                    │
│   vai para cada área da sua vida financeira.                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
└──────────────────────────────────────────────────────────────┘
```

**Neste estado, as 3 tabs colapsam?** Não. Elas permanecem visíveis mas a tab ativa mostra o empty state. Se o usuário trocar para Orçamento: "Importe transações para ver seu orçamento." Estratégia: mesmo empty state de "Criar estratégia".

### 11.2 Sem transações no mês (Orçamento vazio)

```
┌──────────────────────────────────────────────────────────────┐
│              Sem transações em agosto 2026                    │
│                                                              │
│   Importe seus extratos para começar a                       │
│   acompanhar seu orçamento.                                  │
│                                                              │
│         ┌────────────────────────────────────────┐           │
│         │        Importar extratos               │           │
│         └────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### 11.3 Privacy Mode (PLANNING-WF-08)

```
┌──────────────────────────────────────────────────────────────┐
│ Este mês                                                     │
│                                                              │
│ Receita           Despesas              Saldo                │
│ R$ ••••••         R$ ••••••             R$ ••••••            │
│                   ••% da receita         ••% da receita      │
└──────────────────────────────────────────────────────────────┘
```

Valores monetários mascarados. Percentuais da estratégia permanecem visíveis (não revelam patrimônio diretamente). Nomes de pilares e categorias permanecem.

### 11.4 Offline (PLANNING-WF-09)

Módulo funciona com dados cacheados (último kernel executado). Ações de edição (salvar estratégia, ajustar percentuais) desabilitadas com label "Indisponível offline". Month navigator: meses com dados cacheados navegáveis.

### 11.5 Error parcial (PLANNING-WF-10)

Se Orçamento falha mas Visão Geral carregou: preservar Summary + KPIs. Tab Orçamento mostra estado de erro com "Tentar novamente".

### 11.6 Loading

Skeleton: Summary (2 linhas), KPIs (3 colunas de placeholder), tabs ativas.

---

## 12. DOMUS CONTEXTUAL (PLANNING-WF-11)

### Entrada

Ícone no header (slot direito). Touch target 44px.

### Contexto enviado por tab

| Tab | Contexto |
|-----|----------|
| Visão Geral | `{ financialContext, module: "planejamento", tab: "overview", period: "2026-08" }` |
| Orçamento | `{ ... tab: "budget", period, activeCategory? }` |
| Estratégia | `{ ... tab: "strategy", wealthProfile }` |

### Exemplos de perguntas

| Tab | Perguntas |
|-----|-----------|
| Visão Geral | "Estou no caminho certo?", "Como melhorar minha margem?" |
| Orçamento | "Onde estourou meu orçamento?", "Qual categoria priorizar?" |
| Estratégia | "Minha distribuição está coerente?", "E se eu mudar Patrimônio para 25%?" |

### Retorno da Domus

Ao voltar: tab ativa preservada, scroll preservado.

---

## 13. DEEP LINK — ESTRATÉGIA (PLANNING-WF-12)

```
Domus: "Quer ajustar sua estratégia?"
       [Abrir Estratégia]

→ Planejamento abre na tab Estratégia
→ Header: ← Domus
→ Bottom Nav: Domus ativo
```

---

## 14. CURRENT → WIREFRAME MAP

| Desktop | Mobile Wireframe | Ação |
|---------|-----------------|------|
| 6 Overview Cards (xl:grid-cols-6) | 1 superfície com 3 métricas | MERGE |
| PlanningAlertCard (emojis) | Insight Domus + Recomendações (sem emoji) | ADAPT |
| BudgetSummaryCard (tabela 760px) | 6 Budget Cards (72px cada) | ADAPT |
| BudgetExpensesChartCard (PieChart) | Mantido na tab Orçamento | KEEP |
| Month navigation | Month navigator padrão | KEEP |
| PlanningGoalsManager (CRUD inline) | Accordion de pilares (1 aberto por vez) | ADAPT |
| PlanningGoalsChartCard (PieChart) | Substituído por barras horizontais | ADAPT |
| ScenarioComparator (standalone) | Tela dedicada, acesso via ação secundária | MOVE |
| "Laboratório de Decisões" link | "Simular cenário >" na Visão Geral | ADAPT |
| "Metas" (nomenclatura) | "Estratégia" | RENAME |

---

## 15. IMPLEMENTATION GAP MAP

| Gap | Status | Bloqueia v1? |
|-----|:------:|:------------:|
| Domus contextual no header | TECH PENDING | Não (ícone placeholder) |
| ScenarioComparator integrado ao módulo | INTEGRATION PENDING | Não (tela pode ser P2) |
| Budget source of truth (upsertBudget vs renda×%) | P2 existente | Não |
| Emojis no wealth-engine (🚨📈✅🎉) | FDL-CR-01 | Sim (sanitizar na implementação) |
| State restoration (tab, scroll, period) | NEW | Não (melhoria progressiva) |
| Deep link para tab/pilar específico | NEW | Não |

---

## 16. PLANNING WIREFRAME CONTRACT v1

### Header
```
← Origem · "Planejamento" · [◈ Domus]
Altura: 48px. Máximo 2 ações ícone.
```

### Tabs
```
3 tabs: Visão Geral | Orçamento | Estratégia
Altura: 44px. Active: underline azul 2px, 600w.
Inactive: text-tertiary, 500w.
```

### Summary (Visão Geral)
```
"ESTRATÉGIA ATUAL"
2-3 linhas. Síntese da distribuição + principal alocação.
Card Surface, padding 16px.
```

### Overview Metrics
```
1 superfície unificada, 3 colunas.
Receita | Despesas | Saldo.
Valores: 20px, 700w, tabular-nums.
Percentuais de referência: 11px, text-tertiary.
```

### Insight
```
0-1. Card Surface + borda esquerda azul 2px.
Label "◈ Domus" + corpo 13px + CTA "Entender".
```

### Recomendações
```
0-3 itens. Lista de cards compactos.
Prioridade (badge) + título + descrição + impacto + CTA →.
```

### Budget Cards
```
6 cards de 72px. Nome + status + teto/gasto/diferença + barra 4px.
Card NUNCA totalmente vermelho.
Toque → Detail do pilar.
```

### Strategy
```
6 barras horizontais de 56px. Nome + % + barra proporcional + categorias vinculadas.
Toque → Detail do pilar.
Ação: "Ajustar estratégia" (primária) + "Restaurar padrão" (secundária).
```

### Edit Strategy
```
Tela dedicada. Accordion de pilares (1 aberto por vez).
Slider 0-100% + color picker + categorias vinculadas (chips).
Validação: total = 100%. Save sticky.
```

### Simulations
```
Tela dedicada. Acesso: "Simular cenário >" na Visão Geral.
3 tipos via chips. Slider de parâmetro. Comparison card (atual vs simulado).
```

### Domus
```
Ícone no header. Contexto varia por tab ativa.
```

### Bottom Nav
```
Sempre visível. Active conforme origem.
```

### Back
```
← Origem no header. Preserva tab, scroll, period.
```

---

## 17. STRATEGY CONTRACT

```
Estratégia ≡ WealthProfile (6 pilares percentuais).
NUNCA chamar de "Metas" no Mobile.
Nomes reais dos pilares (do defaultWealthCategories):
  Essenciais, Qualidade de vida, Construção patrimonial,
  Estilo de vida, Independência financeira, Capital intelectual.
Total deve ser 100% para salvar.
Cada pilar: nome, percentual, cor, categorias de transação vinculadas.
```

---

## 18. BUDGET WIREFRAME CONTRACT

```
Orçamento ≡ teto calculado (renda × percentual da estratégia) vs gasto real.
Fonte: transações do mês classificadas por categoria vinculada ao pilar.
Cada Budget Card: nome do pilar, teto, gasto, diferença, barra de utilização.
Status: ✅ (≤100%), ⚠️ (>100% e ≤105%), ❌ (>105%).
```

---

## 19. SIMULATION ENTRY CONTRACT

```
Ponto de acesso: ação secundária "Simular cenário >" na Visão Geral.
Tela dedicada (não tab).
Header: ← Planejamento + "Simular cenário".
Status: UX READY / INTEGRATION PENDING.
```

---

## 20. PLANNING DOMUS CONTRACT

```
Entrada: ícone no header (slot direito).
Contexto: { financialContext, module: "planejamento", tab, period, activeCategory? }.
Retorno: preserva tab, scroll, period.
```

---

## 21. TESTES

### 21.1 375px

- Tabs: 3 tabs × ~115px cada. Cabem sem scroll. ✅
- KPIs (1 superfície, 3 colunas): ~114px por coluna. "R$ 6.200" em 20px cabe. ✅
- Budget Cards: 343px largura. Valores em 3 colunas internas (~114px cada). Cabem. ✅
- Strategy barras: 343px. 6 barras proporcionais. Cabem. ✅

### 21.2 390px (referência)

Todos os elementos com respiro confortável. ✅

### 21.3 430px

Mais respiro horizontal. KPIs mais espaçados. Sem alteração estrutural. ✅

### 21.4 Teste 5 segundos — Visão Geral

1. "Estratégia atual" → sei como minha renda está distribuída ✅
2. "R$ 6.200 / R$ 4.280 / R$ 1.920" → sei quanto entrou, saiu, sobrou ✅
3. Recomendações → sei o que fazer ✅

### 21.5 Teste 5 segundos — Orçamento

1. Cards com ✅ e ⚠️ → identifico onde estourei ✅
2. Barra de progresso → entendo intensidade do consumo ✅

### 21.6 Teste 5 segundos — Estratégia

1. Barras horizontais → entendo proporção relativa entre pilares ✅
2. "Total: 100%" → sei que está completo ✅

### 21.7 Teste dashboard

Visão Geral com 1 superfície unificada de 3 métricas NÃO parece grade de KPI. ✅

### 21.8 Teste planilha

Orçamento como cards verticais NÃO parece tabela Excel. ✅

### 21.9 Teste metas

Estratégia como barras de distribuição percentual NÃO parece goals com prazo. ✅

### 21.10 Teste calculadora

Simulações em tela dedicada, acesso secundário. NÃO domina o módulo. ✅

---

## 22. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**PLANNING-WF-P0: 0 · PLANNING-WF-P1: 0 · PLANNING-WF-P2: 1 · PLANNING-WF-P3: 2**

### PLANNING-WF-P2

| ID | Descrição |
|----|-----------|
| P2-01 | ScenarioComparator standalone. Integração com tela de simulação dentro do Planejamento pendente. |

### PLANNING-WF-P3

| ID | Descrição |
|----|-----------|
| P3-01 | State restoration (tab, scroll, period) ao navegar entre módulos. |
| P3-02 | Budget source of truth — resolver ambiguidade upsertBudget vs renda×%. |

---

## 23. CHANGE REQUESTS

| ID | Tipo | Descrição |
|----|------|-----------|
| FDL-CR-01 | FDL | (Já registrado na arquitetura) Remover emojis do wealth-engine.ts. |

Nenhum change request novo. O wireframe é compatível com todos os contratos homologados.

---

## 24. RECOMENDAÇÃO FINAL

O Planejamento Mobile Wireframe prova que o módulo funciona em 3 tabs com densidade Standard, sem parecer dashboard, planilha, lista de metas ou calculadora. A nomenclatura "Estratégia" substitui corretamente "Metas" para refletir o domínio real (WealthProfile de distribuição percentual).

**Próximo passo:** Com PLANNING-WF-P0 = 0 e PLANNING-WF-P1 = 0:

→ **PLANEJAMENTO MOBILE MASTER VISUAL v1**

---

*FinDomus Planejamento Mobile Wireframe v1 · Fase 11 concluída · Aguardando homologação*
