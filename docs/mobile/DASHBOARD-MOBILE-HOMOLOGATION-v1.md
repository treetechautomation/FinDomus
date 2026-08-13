# FINDOMUS MOBILE PWA — DASHBOARD SCREEN HOMOLOGATION v1

**Fase:** M0.2 — Homologação do Dashboard
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado (`docs/mobile/FINDOMUS-MOBILE-PWA-DESIGN-v1.md`)
**Home:** v1 homologada (`docs/mobile/HOME-MOBILE-HOMOLOGATION-v1.md`)
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DO DASHBOARD

O Dashboard Mobile responde a **três perguntas**:

```text
"Para onde foi meu dinheiro este mês?"
"Minha situação melhorou ou piorou?"
"O que eu preciso saber para tomar uma decisão melhor?"
```

Ele não é um clone da Home. A Home mostra **o que** (saldo, resultado). O Dashboard explica **por quê** (categorias, tendências, insights).

## Contraste Home × Dashboard

| Aspecto | Home | Dashboard |
|---------|------|-----------|
| Pergunta | "Como estou?" | "Por que estou assim?" |
| Tom | Overview rápido | Análise com contexto |
| Protagonista | Saldo disponível | Fluxo do período |
| Profundidade | Superfície | Analytical (FDL) |
| Scroll típico | 1.2 viewports | 3-4 viewports |
| Frequência | Diária (5s) | Semanal (30-60s) |
| Estado emocional | Clareza instantânea | Compreensão refletida |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO NO DASHBOARD
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. PERÍODO (mês atual default)                            │
│    → "Como foi julho?"                                    │
│                                                          │
│ 2. RESULTADO DO MÊS                                       │
│    → "Sobrou R$ 3.920. Ganhei R$ 8.200, gastei R$ 4.280" │
│                                                          │
│ 3. CATEGORIAS DE GASTO                                    │
│    → "Meu maior gasto foi alimentação: R$ 1.240"         │
│                                                          │
│ 4. TENDÊNCIA (scroll)                                     │
│    → "Comparado a junho, gastei 8% menos"               │
│                                                          │
│ 5. INSIGHTS (scroll)                                      │
│    → "Transporte subiu 15%. Alimentação caiu 23%."       │
│                                                          │
│ 6. PATRIMÔNIO (scroll)                                    │
│    → "Meu patrimônio líquido é R$ 2.500"                 │
│                                                          │
│ 7. DOMUS (scroll final)                                   │
│    → "O que mudou? Pergunte à Domus."                    │
└──────────────────────────────────────────────────────────┘
    │
    ▼
AÇÕES
    ├── Trocar período (chip ou DatePicker)
    ├── Tap na categoria → Bottom Sheet com detalhamento
    ├── Tap na tendência → expande sparkline
    ├── Tap no insight → Domus explica
    ├── Tap no patrimônio → expande breakdown
    └── Compartilhar (ícone no header)
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px · Período: Julho 2026

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Home      Dashboard                   [📅 mês] [🔍] [···] │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ─── PERÍODO ───────────────────────────────────────────────│
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐      │ ← Chips 32px
│  │  Jun │ │▶ Jul │ │  Ago │ │ 3 meses  │ │ 12 meses │      │
│  └──────┘ └──────┘ └──────┘ └──────────┘ └──────────┘      │
│                                                              │
│  ─── RESULTADO ─────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary Card
│  │                                                          ││
│  │  Resultado de julho                                      ││ ← 10px tertiary
│  │                                                          ││
│  │  +R$ 3.920                                               ││ ← 28px 700w positive
│  │                                                          ││
│  │  ┌──────────────────┐  ┌──────────────────┐             ││
│  │  │  📥 Receitas     │  │  📤 Despesas     │             ││ ← KPI inline
│  │  │  R$ 8.200        │  │  R$ 4.280        │             ││
│  │  │  ↑ 12% vs jun    │  │  ↓ 8% vs jun     │             ││
│  │  └──────────────────┘  └──────────────────┘             ││
│  │                                                          ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰  100%       ││ ← barra sutil
│  │  Receitas ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 66%              ││ ← proporção
│  │  Despesas ▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 34%                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── ONDE GASTEI ───────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Top 5 list
│  │  🍔  Alimentação           R$ 1.240    ▰▰▰▰▰▰▰▰ 29%    ││ ← 44px cada
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🏠  Moradia                R$ 1.100    ▰▰▰▰▰▰▱▱ 26%    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🚗  Transporte            R$ 840      ▰▰▰▰▰▱▱▱ 20%    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🎬  Lazer                 R$ 580      ▰▰▰▰▱▱▱▱ 14%    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💊  Saúde                 R$ 340      ▰▰▰▱▱▱▱▱  8%   ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Ver todas as categorias              ▸     ││ ← link
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── EVOLUÇÃO ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Sparkline
│  │                                                          ││
│  │  Tendência de gastos                      ↓ 8% vs jun    ││ ← 13px secondary
│  │                                                          ││
│  │     ▁         ▂         ▃         ▄         ▃         ▅  ││ ← mini sparkline
│  │    Jan       Fev       Mar       Abr       Mai    Jun Jul││    120px altura
│  │                                                          ││
│  │  ─── Comparação rápida ─────────────────────────────────││
│  │                                                          ││
│  │  Alimentação  R$ 1.240  ↓ 23%   ▰▰▰▰▱▱ jul            ││ ← mini barras
│  │                         R$ 1.610 ▰▰▰▰▰▰▱ jun            ││    comparativas
│  │                                                          ││
│  │  Transporte   R$ 840    ↑ 15%   ▰▰▰▱▱▱ jul             ││
│  │                         R$ 730   ▰▰▰▱▱▱ jun             ││
│  │                                                          ││
│  │  Lazer        R$ 580    ↓ 42%   ▰▰▱▱▱▱ jul             ││
│  │                         R$ 1.000 ▰▰▰▰▰▱ jun             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── O QUE MUDOU ───────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insights
│  │  ↓  Você economizou R$ 320 em alimentação.       ▸     ││   56px cada
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ↑  Transporte subiu R$ 110 por causa de uma      ▸     ││
│  │     viagem no fim de semana.                             ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ↓  Lazer caiu R$ 420. Saídas e delivery        ▸     ││
│  │     reduziram significativamente.                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── PATRIMÔNIO ────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 90px
│  │                                                          ││
│  │  Patrimônio líquido                     R$ 2.500  ▸     ││ ← 24px 700w
│  │                                                          ││
│  │  ┌──────────────────┐  ┌──────────────────┐             ││
│  │  │  Ativos          │  │  Passivos        │             ││ ← KPI inline
│  │  │  R$ 24.500       │  │  R$ 22.000       │             ││
│  │  │  Contas + Invest │  │  Dívidas ativas   │             ││
│  │  └──────────────────┘  └──────────────────┘             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── DOMUS ─────────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 80px
│  │ ┃ ◈ Domus                                               ││
│  │ ┃                                                        ││
│  │ ┃ Alimentação caiu 23% e lazer caiu 42%.                ││
│  │ ┃ Você está economizando R$ 790 a mais que               ││
│  │ ┃ no mês passado. Isso acelera sua reserva.     ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 64px espaço →                                             │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav 82px
│ Início   Finanças   Investir   Domus     Mais                │
│          [ATIVO]                                             │
└──────────────────────────────────────────────────────────────┘
```

## 3.2 Medidas

```
844px total
  - 54px  status bar
  - 48px  header
  - 82px  bottom nav
  = 660px conteúdo útil

Acima da dobra:
  ✅ Chips de período      (~48px)
  ✅ Resultado do mês      (~140px)
  ✅ Top 5 gastos          (~280px: 5 × 44 + gaps + label)
  ─── dobra aproximada ───

Abaixo da dobra (scroll):
  ⬜ Evolução + tendência  (~220px)
  ⬜ O que mudou (insights)(~200px)
  ⬜ Patrimônio            (~100px)
  ⬜ Domus                 (~80px)

Scroll total: ~1.100px (~1.7 viewports)
```

---

# 4. HIERARQUIA DAS INFORMAÇÕES

## 4.1 Ordem de importância

```
1. PERÍODO                    ← "De quando estou falando?"
   Chip de mês ativo. Padrão: mês atual.

2. RESULTADO DO MÊS           ← "Sobrou ou faltou?"
   Valor grande (28px) + proporção receitas/despesas.
   Verde se positivo, âmbar se negativo.

3. ONDE GASTEI (Top 5)        ← "Para onde foi o dinheiro?"
   Lista com mini-barras de proporção.
   Categorias ordenadas por valor (maior primeiro).

4. EVOLUÇÃO (Tendência)       ← "Melhorou ou piorou?"
   Sparkline 6 meses + mini-barras comparativas mês atual vs anterior.

5. O QUE MUDOU (Insights)     ← "O que aconteceu de diferente?"
   3-5 observações sobre variações relevantes.

6. PATRIMÔNIO                 ← "Quanto eu valho?"
   Ativos - Passivos. Visão patrimonial, não operacional.

7. DOMUS                      ← "O que a IA tem a dizer?"
   Insight analítico sobre o período.
```

## 4.2 O que fica OCULTO

| Informação | Motivo |
|------------|--------|
| Todas as categorias (além do Top 5) | Link "Ver todas" expande para lista completa |
| Detalhamento de transações da categoria | Tap abre Bottom Sheet |
| Breakdown completo do patrimônio | Tap expande com composição |
| Gráfico de pizza/donut de categorias | Tap na seção "Onde gastei" abre visualização |
| Comparação ano a ano | Exige seleção de período 12 meses |
| Histórico de conversas com Domus | Pertence à tela Domus |

## 4.3 O que exige INTERAÇÃO

| Ação | Resultado |
|------|----------|
| Swipe nos chips de período | Navega entre meses |
| Tap em chip "Personalizado" | Abre DatePicker (Bottom Sheet) |
| Tap em categoria (Top 5) | Bottom Sheet: detalhamento + subcategorias |
| Tap em "Ver todas as categorias" | Lista completa com busca |
| Tap na sparkline | Expande para gráfico de linha interativo |
| Tap em insight | Abre Domus com contexto específico |
| Tap no patrimônio | Expande breakdown Ativos/Passivos |
| Pull-to-refresh | Atualiza dados do período |

---

# 5. COMPONENTES

## 5.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Home      Dashboard                   [📅 mês] [🔍] [···] │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Altura | 48px |
| Back | "← Home" (ou ← Finanças se veio de lá) |
| Título | "Dashboard" · 16px · 600w |
| Ícone calendário | Abre DatePicker rápido (Bottom Sheet com meses) |
| Ícone busca | Abre campo de busca para categorias |
| Ícone mais | Ações secundárias: Exportar, Compartilhar |

## 5.2 Chips de Período

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│  Jun │ │▶ Jul │ │  Ago │ │ 3 meses  │ │ 12 meses │
└──────┘ └──────┘ └──────┘ └──────────┘ └──────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | 32px |
| Padding | 12px horizontal |
| Raio | 8px (`radius.sm`) |
| Ativo | `action-primary-soft` background + `action-primary` texto |
| Inativo | `surface.raised` + `text-secondary` |
| Scroll | Horizontal com fade nas bordas |
| Comportamento | Swipe horizontal nos chips. Tap seleciona. |
| "Personalizado" | Último chip (não visível nos 5 default). Abre DatePicker Sheet. |
| Período futuro | Desabilitado se sem dados |

## 5.3 Resultado do Mês (Summary Card)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Resultado de julho                                      │ ← 10px tertiary
│                                                          │
│  +R$ 3.920                                               │ ← 28px 700w
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  📥 Receitas     │  │  📤 Despesas     │             │
│  │  R$ 8.200        │  │  R$ 4.280        │             │
│  │  ↑ 12% vs jun    │  │  ↓ 8% vs jun     │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰  100%       │
│  Receitas ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 66%              │
│  Despesas ▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 34%                            │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Altura | ~140px |
| Valor principal | 28px · 700w · `state-positive` se >0, `state-negative` se <0 |
| KPIs inline | 2 cards dentro do Summary, fundo `surface.raised` |
| Barra de proporção | 4px altura · radius 2px · receitas em `action-primary`, despesas em `text-tertiary` |
| Label | "Resultado de [mês]" |
| Comparação | "↑/↓ X% vs [mês anterior]" |

## 5.4 Top 5 Categorias (Lista com barra)

```
┌──────────────────────────────────────────────────────────┐
│  🍔  Alimentação           R$ 1.240    ▰▰▰▰▰▰▰▰ 29%    │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | 44px (Compact) |
| Ícone | 20px emoji ou Lucide representando a categoria |
| Nome | 14px · 600w · text-primary |
| Valor | 14px · 600w · tabular-nums · alinhado à direita |
| Barra de proporção | 6px altura · 40px largura · cor da categoria |
| Percentual | 11px · text-tertiary |
| Touch | Card inteiro → Bottom Sheet com subcategorias |
| Ordenação | Maior valor primeiro |

### Bottom Sheet da Categoria (ao tocar)

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  🍔  Alimentação                                         │
│                                                          │
│  Total: R$ 1.240                ↓ 23% vs jun             │
│                                                          │
│  ─── Subcategorias ──────────────────────────────────────│
│                                                          │
│  Supermercado             R$ 620       ▰▰▰▰▰▰▱▱ 50%    │
│  Restaurantes             R$ 320       ▰▰▰▱▱▱▱▱ 26%    │
│  Delivery                 R$ 180       ▰▰▱▱▱▱▱▱ 15%    │
│  Padaria                  R$ 120       ▰▱▱▱▱▱▱▱ 10%    │
│                                                          │
│  ─── Tendência ─────────────────────────────────────────│
│       ▁        ▂        ▃        ▄        ▂              │
│      Fev      Mar      Abr      Mai      Jun      Jul    │
│                                                          │
│  [Ver transações desta categoria]                        │
│  [Definir orçamento para Alimentação]                    │
└──────────────────────────────────────────────────────────┘
```

## 5.5 Evolução (Sparkline + Comparação)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Tendência de gastos                      ↓ 8% vs jun    │
│                                                          │
│     ▁         ▂         ▃         ▄         ▃         ▅  │
│    Jan       Fev       Mar       Abr       Mai    Jun Jul│
│                                                          │
│  ─── Comparação rápida ─────────────────────────────────│
│                                                          │
│  Alimentação  R$ 1.240  ↓ 23%   ▰▰▰▰▱▱ jul            │
│                         R$ 1.610 ▰▰▰▰▰▰▱ jun            │
│                                                          │
│  Transporte   R$ 840    ↑ 15%   ▰▰▰▱▱▱ jul             │
│                         R$ 730   ▰▰▰▱▱▱ jun             │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Sparkline | 120px largura × 40px altura · cor `action-primary` |
| Pontos | 6 ou 7 (últimos meses) |
| Eixos | Sem eixos Y. Apenas labels de mês no X (abreviados) |
| Mini-barras | Cada categoria: 2 barras (atual + anterior) lado a lado |
| Cor atual | `action-primary` |
| Cor anterior | `text-tertiary` com opacidade 0.3 |
| Touch | Sparkline expande para gráfico de linha interativo |

## 5.6 Insights ("O que mudou")

```
┌──────────────────────────────────────────────────────────┐
│  ↓  Alimentação: -23% (economia de R$ 320)       ▸     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  ↑  Transporte: +15% (viagem no fim de semana)   ▸     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  ↓  Lazer: -42% (redução em delivery e saídas)   ▸     │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | 56px (com 2 linhas se necessário) |
| Ícone | ↑ (state-negative se despesa subiu), ↓ (state-positive se despesa caiu) |
| Texto | "Categoria: +X% (explicação curta)" · 13px · text-secondary |
| Máximo | 5 insights |
| Touch | Abre Domus com contexto da categoria |
| Origem | Derivado da comparação mês atual vs anterior |

## 5.7 Patrimônio (Card)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Patrimônio líquido                     R$ 2.500  ▸     │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Ativos          │  │  Passivos        │             │
│  │  R$ 24.500       │  │  R$ 22.000       │             │
│  │  Contas + Invest │  │  Dívidas ativas   │             │
│  └──────────────────┘  └──────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

### Expandido (tap)

```
│  ─── Composição ────────────────────────────────────────│
│                                                          │
│  Contas líquidas     R$ 9.500      ▰▰▰▰▰▰▰▰▰▰ 39%     │
│  Investimentos       R$ 15.000     ▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 61%  │
│                                                          │
│  ─── Passivos ──────────────────────────────────────────│
│                                                          │
│  Financiamento       R$ 20.000     ▰▰▰▰▰▰▰▰▰▰ 91%     │
│  Cartão Nubank       R$ 2.000      ▰▰▱▱▱▱▱▱▱▱  9%     │
│                                                          │
│  ▲ Recolher                                              │
```

## 5.8 Domus (Card Analítico)

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃                                                        │
│ ┃ Alimentação caiu 23% e lazer caiu 42%.                │
│ ┃ Você economizou R$ 790 a mais este mês.        ▸      │
└──────────────────────────────────────────────────────────┘
```

Mesmo padrão do Insight da Home. Borda azul esquerda (2px). Texto 13px.

---

# 6. MICROINTERAÇÕES

## 6.1 Scroll

| Evento | Comportamento |
|--------|--------------|
| Scroll normal | Header fica sticky. Chips de período sobem e fixam abaixo do header. |
| Pull-to-refresh | Atualiza dados do período atual. |
| Scroll horizontal (chips) | Navega entre meses com snap. |

## 6.2 Toques

| Alvo | Feedback |
|------|----------|
| Categoria (Top 5) | `scale(0.98)` + `haptic` → Bottom Sheet com subcategorias |
| Sparkline | `scale(0.98)` → expande para gráfico de linha interativo |
| Insight | `scale(0.98)` → navega para Domus com contexto |
| Patrimônio | `scale(0.98)` → expande breakdown inline |
| Chip de período | `scale(0.95)` → seleciona + atualiza dados |

## 6.3 Animações

| Elemento | Animação | Duração |
|----------|----------|:-------:|
| Troca de período | Fade-out + fade-in do conteúdo | 200ms |
| Expansão de categoria | Sheet: spring do bottom | 300ms |
| Expansão de patrimônio | max-height transition | 250ms ease-out |
| Entrada de insights | Fade-in stagger 50ms por item | 250ms total |

---

# 7. ESTADOS

## 7.1 Loading

```
┌──────────────────────────────────────────────────────────┐
│  ← Home      Dashboard                                    │
├──────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ ← chips skeleton
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ ██████████████                                        ││ ← summary skeleton
│  │ ████████████████                                      ││
│  │ ██████████  ██████████                                ││
│  │ ████████████████████████████████                      ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── ██████████ ─────────────────────────────────────────│
│  ┌──────────────────────────────────────────────────────┐│
│  │ ████  ██████████  ██████  ██████████████             ││ ← ×5
│  └──────────────────────────────────────────────────────┘│
│  ... (repetir 5×)                                        │
└──────────────────────────────────────────────────────────┘
```

Animate-pulse. Blocos com `surface.raised`. Header real visível.

## 7.2 Sem dados no período

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [Calendar, 48px, text-tertiary]              │
│                                                          │
│         Nenhum dado em agosto de 2026                    │
│                                                          │
│   Este mês ainda não possui transações registradas.      │
│                                                          │
│     ┌──────────────────────────────────────┐             │
│     │        Ver mês anterior              │             │
│     └──────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

## 7.3 Erro

```
┌──────────────────────────────────────────────────────────┐
│              [AlertCircle, 48px, state-negative]          │
│                                                          │
│         Não foi possível carregar o período              │
│                                                          │
│     ┌──────────────────────────────────────┐             │
│     │        Tentar novamente              │             │
│     └──────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

Erro parcial: se o resumo carregou mas as categorias falharam, mostrar resumo + erro inline na seção de categorias.

## 7.4 Offline

- Dados cacheados do último fetch.
- Badge "Offline" no header.
- Troca de período: apenas meses cacheados disponíveis.

---

# 8. FILTROS DE PERÍODO

## 8.1 Chips rápidos (padrão)

5 chips visíveis: 2 meses anteriores + mês atual + 1 mês futuro + "3 meses" + "12 meses".
Scroll horizontal com fade nas bordas.

## 8.2 DatePicker (chip "Personalizado")

Bottom Sheet com:
- Seleção de mês/ano
- Ou intervalo "De" / "Até"
- Botão "Aplicar"

---

# 9. GRÁFICOS

## 9.1 Regras

| Permitido | Proibido |
|-----------|----------|
| Sparkline (até 7 pontos) | Gráfico de pizza com 8+ fatias |
| Barra horizontal (até 5 itens) | Tabela com scroll horizontal |
| Linha simples (até 12 pontos) | Radar/spider |
| Donut (até 5 segmentos) | Candlestick |
| | 2+ gráficos na mesma viewport |

## 9.2 Especificações

| Parâmetro | Valor |
|-----------|-------|
| Altura máxima | 160px |
| Cores | Paleta FDL: azul, verde, cinza, âmbar, vermelho (nesta ordem) |
| Tooltip | Tap no gráfico |
| Legenda | Abaixo do gráfico |
| Animação | Nenhuma (performance) |
| Eixos | Labels abreviados. Sem grid lines. |

---

# 10. PERFORMANCE

| Métrica | Alvo |
|---------|:----:|
| Render inicial | < 500ms (dados cacheados) |
| Troca de período | < 300ms (fetch + render) |
| Sparkline | SVG inline, sem biblioteca externa |
| Gráficos | Renderizados apenas quando visíveis (Intersection Observer) |

---

# 11. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Chips, categorias, cards |
| Safe areas | ✅ |
| Dynamic Type até 200% | ✅ |
| Contraste AA | ✅ |
| Screen reader | ✅ "Resultado de julho: positivo, 3.920 reais" |
| Dark + Light | ✅ |
| Uso com uma mão | ✅ Chips e lista de categorias na metade inferior |

---

# 12. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Não repete a Home (perguntas diferentes)
- [ ] Período selecionável via chips + DatePicker
- [ ] Resultado do mês com valor grande + proporção
- [ ] Top 5 categorias com mini-barras
- [ ] Evolução com sparkline + comparação mês atual vs anterior
- [ ] Insights "O que mudou" (3-5 itens)
- [ ] Patrimônio com Ativos/Passivos (expansível)
- [ ] Domus analítico (borda azul)
- [ ] Gráficos: sparkline + barras horizontais apenas
- [ ] Sem tabelas, sem pizza com 8+ fatias
- [ ] Componentes reutilizados da Home (Insight Card, KPIs, lista)
- [ ] FDL 1.0: cores, tipografia, grid

## Estados

- [ ] Loading: skeleton por seção
- [ ] Sem dados no período: empty state com CTA
- [ ] Erro parcial: preservar seções carregadas
- [ ] Offline: dados cacheados + badge

## Interações

- [ ] Swipe nos chips de período
- [ ] Tap em categoria → Bottom Sheet com subcategorias
- [ ] Tap na sparkline → expande gráfico
- [ ] Tap em insight → Domus
- [ ] Pull-to-refresh

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Contraste AA
- [ ] Screen reader: labels descritivos
- [ ] Dark + Light mode
- [ ] Uso com uma mão

---

# 13. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Protagonista | Resultado do mês (não saldo) | Home já tem o saldo. Dashboard analisa fluxo. |
| Top categorias | 5 + link "Ver todas" | 5 é escaneável. Todas seria poluição. |
| Sparkline | 6-7 pontos, sem eixo Y | Simplicidade. Tendência visual, não valor exato. |
| Insights | 3-5, automáticos | Derivados da comparação mês atual vs anterior. |
| Patrimônio | Colapsado com expansão | Profundidade progressiva. Não é o foco do Dashboard. |
| Período | Chips horizontais + DatePicker | Rápido (swipe) + preciso (Picker). |
| Gráfico de categorias | Mini-barras na lista | Integrado ao contexto. Não ocupa espaço extra. |
| Domus | Card analítico (não operacional) | Explica tendências e variações. |

---

*FinDomus Dashboard Mobile Homologation v1 · Fase M0.2 · PRONTO PARA HOMOLOGAÇÃO*
