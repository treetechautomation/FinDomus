# FINDOMUS MOBILE PWA — HOME SCREEN HOMOLOGATION v1

**Fase:** M0.1 — Homologação da Home
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado (`docs/mobile/FINDOMUS-MOBILE-PWA-DESIGN-v1.md`)
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DA HOME

A Home do FinDomus Mobile responde a **uma única pergunta** em menos de 5 segundos:

```text
"Como está minha vida financeira agora?"
```

Ela não é um dashboard. Não é um relatório. Não é uma tabela. É um **espelho financeiro** — reflete o estado atual com clareza, sem ansiedade, e aponta o próximo passo com precisão.

## Métricas de sucesso

| Métrica | Alvo |
|---------|:----:|
| Tempo para entender o saldo | < 2 segundos |
| Tempo para entender tendência do mês | < 5 segundos |
| Ações principais acessíveis com o polegar | 100% |
| Scroll necessário para ver tudo | < 2 viewports |
| Elementos visíveis sem scroll (above fold) | Saldo + KPIs + Insight Domus |
| Informação sem contexto | 0 elementos |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE O APP
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ SKELETON (300ms)                                          │
│ Hero shimmer + 2 KPI ghosts + 3 list ghosts              │
└──────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ HOME CARREGADA                                            │
│                                                          │
│ 1. Olhar vai direto para o SALDO (Hero, 36px)            │
│    → "Tenho R$ 9.500 disponível"                         │
│                                                          │
│ 2. Olhar desce para KPIs (Receitas / Despesas)           │
│    → "Ganhei R$ 8.200, gastei R$ 4.280"                 │
│                                                          │
│ 3. Olhar encontra Freedom Index                          │
│    → "67 pts · Construção"                               │
│                                                          │
│ 4. Insight Domus (se houver)                             │
│    → "Sua reserva cobre 4,2 meses. Ideal: 6."            │
│                                                          │
│ 5. Scroll revela Próximas contas + Investimentos          │
│    → Ações imediatas ou exploração                        │
└──────────────────────────────────────────────────────────┘
    │
    ▼
AÇÕES DO USUÁRIO
    ├── Tap no saldo → Finanças (detalhamento)
    ├── Tap no Freedom Index → expande breakdown
    ├── Tap na Domus → abre chat (Bottom Sheet)
    ├── Tap nas Próximas → tela de contas a pagar
    ├── Tap em Investimentos → módulo Investir
    ├── Tap no FAB → Domus Chat
    └── Scroll para baixo → Planejamento, Academia
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px · Estado: Carregado com dados

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bom dia, Anderson                       🔔 [notif] [avatar] │ ← Header 56px
│  Seu mês está indo bem.                                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Hero Card
│  │                                                          ││    ~130px
│  │  Saldo disponível                                        ││
│  │                                                          ││
│  │  R$ 9.500                                                ││ ← 36px, 800w
│  │                                                          ││
│  │  +R$ 620 este mês · ↑                                   ││ ← 13px, positive
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │ ← KPIs Dual
│  │  📥 Receitas     │  │  📤 Despesas     │                 │    80px cada
│  │  R$ 8.200        │  │  R$ 4.280        │                 │
│  │  ↑ 12%           │  │  ↓ 8%            │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │ ← KPIs Dual
│  │  📈 Investimentos│  │  🏛 Patrimônio   │                 │
│  │  R$ 15.000       │  │  R$ 2.500        │                 │
│  │  +2,8% no mês    │  │  = ativos - div  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Freedom Index
│  │                                                          ││    ~90px
│  │  🛡️ Freedom Index                             67 pts   ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱               Nível            ││
│  │  Construção                                       ▸     ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Domus Insight
│  │ ┃ ◈ Domus                                    agora      ││    ~70px
│  │ ┃                                                        ││
│  │ ┃ Sua reserva cobre 4,2 meses. O ideal são 6.           ││
│  │ ┃ Com R$ 620/mês, em 3 meses você chega lá.     ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── PRÓXIMAS CONTAS ───────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 56px cada
│  │  📅  Aluguel                       R$ 2.200   15 ago →  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📅  Financiamento                  R$ 1.000   20 ago →  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📅  Cartão Nubank                  R$ 580     22 ago →  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Link
│  │              Ver todas (5 contas)                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CARTEIRA ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 56px
│  │  📈  Investimentos                 R$ 15.000      ▸     ││
│  │       +R$ 420 este mês · Rentabilidade: +2,8%            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── PLANEJAMENTO ──────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 56px
│  │  🎯  Reserva de Emergência        ▰▰▰▰▰▰▱▱ 72%   ▸     ││
│  │       Meta: R$ 18.000 · Faltam R$ 5.000                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 64px espaço →                                             │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav 82px
│ Início   Finanças   Investir   Domus     Mais                │
└──────────────────────────────────────────────────────────────┘
│                                                       [◈]   │ ← FAB Domus 56px
└──────────────────────────────────────────────────────────────┘
```

## 3.2 Medidas da tela

```
844px total
  - 54px status bar
  - 56px header (2 linhas)
  - 82px bottom nav
  = 652px conteúdo útil

Acima da dobra (~652px visíveis sem scroll):
  ✅ Hero Card           (~130px)
  ✅ KPIs linha 1        (~80px)
  ✅ KPIs linha 2        (~80px)
  ✅ Freedom Index       (~90px)
  ✅ Domus Insight       (~70px)
  ─── dobra aproximada ───
  ⬜ Próximas contas     (~240px com 3 itens)
  ⬜ Carteira            (~70px)
  ⬜ Planejamento        (~70px)

Scroll total: ~800px (~1.2 viewports)
```

---

# 4. HIERARQUIA VISUAL

## 4.1 Ordem de importância visual

```
1. SALDO DISPONÍVEL         ← Protagonista absoluto
   Tamanho: 36px, 800w, cor: text-primary
   Posição: topo do conteúdo, isolado no Hero Card
   Função: responder "quanto tenho?" em <1s

2. FREEDOM INDEX             ← Âncora emocional
   Tamanho: 20px (pontuação) + barra de progresso
   Posição: após KPIs, antes do insight
   Função: contextualizar o momento financeiro

3. DOMUS INSIGHT             ← Guia inteligente
   Tamanho: card compacto com texto 13px
   Posição: após Freedom Index
   Função: apontar a próxima ação relevante

4. KPIs (Receitas/Despesas)  ← Contexto do mês
   Tamanho: cards 80px, 2 por linha
   Posição: logo abaixo do Hero
   Função: entrada vs saída

5. PRÓXIMAS CONTAS           ← Urgência
   Tamanho: itens 56px, máx 3 visíveis
   Posição: abaixo do insight (exige scroll)
   Função: o que precisa de atenção agora

6. INVESTIMENTOS + PLANEJAMENTO  ← Profundidade
   Tamanho: cards 56px
   Posição: final da página
   Função: exploração para power users
```

## 4.2 O que fica OCULTO (sem interação do usuário)

| Informação | Motivo |
|------------|--------|
| Breakdown completo do Freedom Index | Expansível via tap no card |
| Todas as transações do mês | Pertence ao Fluxo de Caixa |
| Gráfico de pizza de categorias | Pertence ao detalhe |
| Lista de todos os investimentos | Pertence ao módulo Investir |
| Lista de todas as metas | Pertence ao Planejamento |
| Histórico de conversas da Domus | Pertence à tela Domus |

## 4.3 O que exige INTERAÇÃO para revelar

| Ação | Resultado |
|------|----------|
| Tap no Freedom Index | Expande breakdown com 7 pilares |
| Tap no insight Domus | Abre chat da Domus em Bottom Sheet |
| Tap no FAB (◈) | Abre chat da Domus em Bottom Sheet |
| Tap em "Ver todas" | Navega para tela de contas a pagar |
| Pull-to-refresh | Atualiza dados do Firestore |
| Scroll down | Revela Próximas, Carteira, Planejamento |
| Tap no avatar | Abre Context Switcher (Bottom Sheet) |

---

# 5. COMPONENTES DA HOME

## 5.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│  Bom dia, Anderson                       🔔 [notif] [avatar] │
│  Seu mês está indo bem.                                      │
└──────────────────────────────────────────────────────────────┘
```

### Especificações

| Elemento | Especificação |
|----------|--------------|
| Altura | 56px (2 linhas: saudação + contexto) |
| Saudação | "Bom dia/tarde/noite, [Nome]" · 16px · 600w · text-primary |
| Contexto | Mensagem dinâmica baseada no Freedom Index · 12px · 400w · text-secondary |
| Notificações | Ícone Bell (24px) · badge com contagem se >0 |
| Avatar | 32px circular · iniciais ou foto · toque abre Context Switcher Sheet |
| Background | Transparente (Canvas) · Sem borda inferior |
| Sticky | SIM · fixa no topo durante scroll |

### Mensagens de contexto (dinâmicas)

| Freedom Index | Mensagem |
|:------------:|----------|
| ≥ 80 (Crescimento/Liberdade) | "Seu mês está excelente." |
| 40-79 (Estabilidade/Construção) | "Seu mês está indo bem." |
| 20-39 (Organização) | "Vamos organizar suas finanças." |
| < 20 (Sobrevivência) | "Estamos aqui para ajudar." |

## 5.2 Hero Card

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Saldo disponível                                        │ ← 10px · tertiary · uppercase
│                                                          │
│  R$ 9.500                                                │ ← 36px · 800w · tabular-nums
│                                                          │
│  +R$ 620 este mês · ↑                                   │ ← 13px · state-positive
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` (nível 1) |
| Raio | 16px (`radius.md`) |
| Padding | 16px (`space.4`) |
| Label | "Saldo disponível" — comunica que é dinheiro em conta, não patrimônio total |
| Valor | `financial-hero` (36px, 800w, tabular-nums, text-primary) |
| Tendência | "+R$ X este mês" com ícone de seta (↑/↓/→) |
| Cor da tendência | `state-positive` se >0, `state-negative` se <0, `text-secondary` se 0 |
| Touch | **Não interativo.** O saldo é informativo, não é botão. |
| Animação | Nenhuma. Valor estático. Atualiza via pull-to-refresh. |

### Por que "Saldo disponível" e não "Saldo em contas" ou "Patrimônio"?

| Label | Significado | Inclui | Problema |
|-------|------------|--------|----------|
| "Saldo disponível" | Dinheiro líquido em contas | Apenas contas líquidas PF | ✅ Preciso, direto |
| "Saldo em contas" | Todas as contas | PF + PJ + legacy | ❌ Muito amplo |
| "Patrimônio" | Ativos - Passivos | Contas + Investimentos - Dívidas | ❌ Outro conceito |
| "Saldo total" | — | — | ❌ Vago |
| "Dinheiro em conta" | — | — | ❌ Informal demais |

## 5.3 Ações Rápidas (Quick Actions)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────┐│
│    │  📥      │   │  📤      │   │  🔄      │   │  ⊕   ││
│    │ Receber  │   │  Pagar   │   │Transfe-  │   │Adicio-││
│    │          │   │          │   │  rir     │   │  nar  ││
│    └──────────┘   └──────────┘   └──────────┘   └──────┘│
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|-------|
| Posição | Abaixo do Hero Card |
| Layout | 4 ícones em linha horizontal |
| Tamanho do ícone | 24px, dentro de círculo 44px |
| Label | 10px, text-secondary |
| Touch target | 44×44px cada |
| Cor do círculo | `surface.raised` + `border-subtle` |
| Ações | Receber (income), Pagar (expense), Transferir, Adicionar (genérico) |
| Comportamento | Tap abre Bottom Sheet para adicionar transação rápida |

### Decisão: Horizontais, 4 ações, ícones circulares

Comparado com:
- **Carrossel**: pior descoberta (esconde opções)
- **Lista vertical**: ocupa muito espaço
- **Grid 2×2**: poluído visualmente
- **Oculto (FAB only)**: esconde ações úteis

**Vencedor:** Fileira horizontal de 4 ações. Ocupa 76px (44px ícone + 10px label + 22px gap). Visível acima da dobra. Alcançável com o polegar.

### ❌ Decisão de NÃO incluir Ações Rápidas na Home

Após reavaliação, as Ações Rápidas foram **removidas** da Home. Motivos:

1. **FDL P6:** "Cada tela tem um protagonista." A Home tem o saldo. Ações rápidas competem.
2. **Complexity budget:** 4 ações + 4 KPIs + Freedom + Insight = poluição.
3. **Mobile PWA Design v1:** A Home especificada no documento-base não inclui Quick Actions.
4. **Foco:** A Home é para **ver**, não para **fazer**. "Fazer" pertence ao Fluxo de Caixa.

As ações rápidas (Adicionar transação, etc.) serão acessíveis via:
- FAB da Domus (contextual: "Registrar despesa")
- Módulo Finanças → Fluxo de Caixa → botão "+"
- Swipe actions nos itens de lista

## 5.4 KPIs — Par Dual

```
┌──────────────────┐  ┌──────────────────┐
│  📥 Receitas     │  │  📤 Despesas     │
│  R$ 8.200        │  │  R$ 4.280        │
│  ↑ 12%           │  │  ↓ 8%            │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  📈 Investimentos│  │  🏛 Patrimônio   │
│  R$ 15.000       │  │  R$ 2.500        │
│  +2,8% no mês    │  │  = ativos - div  │
└──────────────────┘  └──────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|-------|
| Layout | 2 cards por linha · 2 linhas = 4 KPIs |
| Tamanho do card | 80px altura · ~175px largura (390px viewport) |
| Superfície | `surface` (nível 1) |
| Raio | 16px |
| Padding | 12px |
| Ícone | 20px, text-secondary, à esquerda do label |
| Label | 10px, tertiary, uppercase |
| Valor | 20px, 700w, tabular-nums, text-primary |
| Tendência | 11px, abaixo do valor |
| Touch | Cada card é tocável → navega para o detalhe correspondente |

### Decisão: 4 KPIs em 2 linhas (não carrossel)

| Aspecto | Grid 2×2 | Carrossel horizontal |
|---------|:--------:|:--------------------:|
| Visibilidade | ✅ Tudo visível de uma vez | ❌ Esconde 2 KPIs |
| Scan | ✅ Rápido (padrão F) | ❌ Exige swipe |
| Espaço | ⚠️ Ocupa ~192px | ✅ Ocupa ~100px |
| Complexidade | ✅ Simples | ❌ Indicador de página |
| 375px | ✅ Funciona | ⚠️ Cards muito estreitos |
| **Veredito** | ✅ | ❌ |

## 5.5 Freedom Index Card

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  🛡️ Freedom Index                             67 pts   │ ← 20px · 700w
│  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱              Construção        │ ← barra + nível
│                                                          │
│  Próxima meta: Reserva de Emergência (72%)        ▸     │ ← CTA contextual
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Raio | 16px |
| Padding | 16px |
| Altura | ~90px (colapsado) |
| Pontuação | 20px, 700w, text-primary |
| Nível | 13px, 500w, cor do nível (ver Azul → Verde → Âmbar → Cinza) |
| Barra de progresso | 6px altura, 100% largura, radius 3px |
| Cor da barra | Gradiente do nível atual (ex: verde para Construção) |
| CTA | "Próxima meta: [nome da meta mais impactante]" |
| Touch | Card inteiro é tocável → expande breakdown |
| Estado expandido | Mostra 7 pilares com mini-barras e percentuais |

### Estado Expandido (tap no card)

```
┌──────────────────────────────────────────────────────────┐
│  🛡️ Freedom Index                             67 pts   │
│  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱              Construção        │
│                                                          │
│  ─── Seus pilares ──────────────────────────────────────│
│                                                          │
│  Quitação de Dívidas         ▰▰▰▰▰▰▰▰▰▰  100%  (25%) │
│  Comprometimento de Renda    ▰▰▰▰▰▰▱▱▱▱   62%  (20%) │
│  Reserva de Emergência       ▰▰▰▰▰▰▱▱▱▱   58%  (15%) │
│  Patrimônio Líquido          ▰▰▰▱▱▱▱▱▱▱   28%  (15%) │
│  Taxa de Poupança            ▰▰▰▰▰▱▱▱▱▱   50%  (10%) │
│  Renda Passiva               ▰▰▱▱▱▱▱▱▱▱   18%  (10%) │
│  Diversificação              ▰▰▰▰▱▱▱▱▱▱   40%  (5%)  │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Entenda seu índice                          ▸      ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ▲ Recolher                                               │
└──────────────────────────────────────────────────────────┘
```

## 5.6 Domus Insight Card

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                    agora       │
│ ┃                                                        │
│ ┃ Sua reserva cobre 4,2 meses. O ideal são 6.           │
│ ┃ Com R$ 620/mês, em 3 meses você chega lá.     ▸      │
└──────────────────────────────────────────────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Borda esquerda | 2px, `action-primary` (#00B4D8) |
| Raio | 16px (borda esquerda reta via overflow) |
| Padding | 12px |
| Altura | ~70px |
| Label | "◈ Domus" + timestamp relativo ("agora", "há 2h") |
| Texto | 13px, 400w, text-secondary · Máximo 2 linhas |
| CTA | "▸" ou link textual · Abre Domus Chat |
| Touch | Card inteiro tocável |
| Quando mostrar | Somente se insight relevante disponível |
| Quando NÃO mostrar | Sem dados, primeiro acesso, insight já visto |

### Regras de geração de insight

| Condição | Insight sugerido |
|----------|-----------------|
| Reserva < 6 meses | "Sua reserva cobre X meses." |
| Despesa > 80% da receita | "Seus gastos estão altos este mês." |
| Meta próxima de vencer | "Sua meta X vence em Y dias." |
| Saldo concentrado (>60% em 1 conta) | "Seu saldo está concentrado." |
| 3+ contas a pagar próximas | "Você tem X contas vencendo esta semana." |
| Nenhum investimento | "Que tal começar a investir?" |

## 5.7 Próximas Contas — Lista

```
┌──────────────────────────────────────────────────────────┐
│  📅  Aluguel                       R$ 2.200   15 ago →  │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  📅  Financiamento                  R$ 1.000   20 ago →  │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  📅  Cartão Nubank                  R$ 580     22 ago →  │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│              Ver todas (5 contas)                        │ ← link
└──────────────────────────────────────────────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|-------|
| Itens visíveis | Máximo 3 (os mais próximos) |
| Altura do item | 56px (Standard) |
| Ícone | 📅 (Calendar) ou ícone do tipo de conta |
| Nome | 14px, 600w, text-primary |
| Valor | 14px, 600w, tabular-nums, alinhado à direita |
| Data | 10px, tertiary, abaixo do nome |
| Ordenação | Por data de vencimento (mais próxima primeiro) |
| Se vazio | Seção não aparece |

## 5.8 Carteira (Investimentos) — Card Resumo

```
┌──────────────────────────────────────────────────────────┐
│  📈  Investimentos                 R$ 15.000      ▸     │
│       +R$ 420 este mês · Rentabilidade: +2,8%            │
└──────────────────────────────────────────────────────────┘
```

## 5.9 Planejamento — Card Resumo

```
┌──────────────────────────────────────────────────────────┐
│  🎯  Reserva de Emergência        ▰▰▰▰▰▰▱▱ 72%   ▸     │
│       Meta: R$ 18.000 · Faltam R$ 5.000                  │
└──────────────────────────────────────────────────────────┘
```

---

# 6. MICROINTERAÇÕES

## 6.1 Scroll

| Evento | Comportamento |
|--------|--------------|
| Scroll inicial | Header torna-se sticky. Conteúdo desliza sob o header. |
| Pull-to-refresh | Indicador nativo. Atualiza dados do Firestore. Animação de conclusão sutil. |
| Fim da página | Sem lazy load adicional. Tudo carregado de uma vez (poucos dados). |

## 6.2 Toques

| Alvo | Feedback |
|------|----------|
| Card interativo | `scale(0.97)` por 100ms + `haptic` (iOS) |
| Botão | `scale(0.97)` + cor de pressed state |
| FAB | `scale(0.95)` + `haptic` + abre Sheet |
| List item | `scale(0.98)` + highlight sutil |
| Non-interactive (Hero) | Sem feedback |

## 6.3 Animações

| Elemento | Animação | Duração |
|----------|----------|:-------:|
| Entrada da Home | Hero + KPIs: fade-in + slide-up (20px) · stagger 50ms | 300ms total |
| Freedom Index expand | max-height transition | 250ms ease-out |
| Domus Insight entrada | fade-in (aparece após carregar) | 200ms |
| Sheet (Domus Chat) | spring do bottom | 300ms |
| Pull-to-refresh | padrão do SO | — |

## 6.4 FAB (Domus)

```
Posição: fixa, bottom: 100px (acima da Bottom Nav), right: 16px
Tamanho: 56px × 56px, circular
Cor: #00B4D8 (action-primary)
Ícone: BrainCircuit (24px, branco)
Sombra: shadow.float
Animação: scale + fade, 200ms ease-out
Scroll: esconde ao descer, mostra ao subir
Teclado: esconde quando teclado abre
```

---

# 7. ESTADOS DA HOME

## 7.1 Estado: Loading (primeira abertura)

```
┌──────────────────────────────────────────────────────────────┐
│  Bom dia, Anderson                       🔔 [notif] [avatar] │ ← Header real
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████████████████████                                    ││ ← Hero skeleton
│  │                                                          ││
│  │ ██████████████                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ ██████████       │  │ ██████████       │                 │ ← KPI skeletons
│  │ ██████           │  │ ██████           │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ ██████████       │  │ ██████████       │                 │
│  │ ██████           │  │ ██████           │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ██████████████████████                          ████    ││ ← FI skeleton
│  │ ██████████████████████████████████████                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── ██████████████ ────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████  ██████████████████             ████████████  →    ││ ← 3 list skeletons
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████  ██████████████████             ████████████  →    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████  ██████████████████             ████████████  →    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Especificações do Skeleton

- `animate-pulse` com duração 2s
- Cores: `surface.raised` para blocos, opacidade 0.5
- Header: mostrado real (nome do usuário vem do cache/auth)
- Sem spinner. Sem tela branca.

## 7.2 Estado: Primeiro Acesso (sem dados)

```
┌──────────────────────────────────────────────────────────────┐
│  Olá, Anderson                                  [avatar]     │
│  Bem-vindo ao FinDomus.                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    🏦 [Landmark, 48px]                        │
│                                                              │
│              Sua jornada financeira começa aqui.             │
│                                                              │
│     Importe seu primeiro extrato ou cadastre                 │
│     suas contas para ver seu saldo e metas.                  │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │  📥  Importar extrato                │           │ ← 44px, full-width
│           └──────────────────────────────────────┘           │
│           ┌──────────────────────────────────────┐           │
│           │  💳  Adicionar conta                 │           │ ← 44px, outline
│           └──────────────────────────────────────┘           │
│                                                              │
│  ─── COMO FUNCIONA ─────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  1️⃣  Cadastre suas contas                                ││
│  │      Adicione conta corrente, poupança ou carteira.     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  2️⃣  Importe transações                                  ││
│  │      Use extratos OFX, PDF ou CSV dos seus bancos.      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  3️⃣  Acompanhe seu progresso                             ││
│  │      Freedom Index, metas e Domus IA te guiam.          ││
│  └──────────────────────────────────────────────────────────┘│
```

## 7.3 Estado: Erro

```
┌──────────────────────────────────────────────────────────────┐
│  Bom dia, Anderson                                  [avatar] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    [AlertCircle, 48px, state-negative]        │
│                                                              │
│              Não foi possível carregar                       │
│                                                              │
│     Verifique sua conexão e tente novamente.                 │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Tentar novamente              │           │
│           └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Erro parcial

Se o Hero carregou mas as Próximas Contas falharam:
- Hero + KPIs + Freedom Index visíveis (dados cacheados ou carregados)
- Seção "Próximas Contas" mostra card de erro inline: "Não foi possível carregar."
- Botão "Tentar novamente" apenas para a seção que falhou

## 7.4 Estado: Offline

```
┌──────────────────────────────────────────────────────────────┐
│  Bom dia, Anderson                       [offline] [avatar]  │ ← badge sutil
│  Dados de 2 horas atrás.                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Home normal com dados cacheados]                           │
│                                                              │
│  ⚠️ Ações que exigem rede estão desabilitadas.               │
│  Domus · FAB: visível mas mensagem "Preciso de conexão."    │
└──────────────────────────────────────────────────────────────┘
```

## 7.5 Estado: Privacy Mode

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Saldo disponível                                        ││
│  │  R$ ••••••                                               ││ ← mascarado
│  │  ••••• este mês                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Receitas        │  │  Despesas        │                 │
│  │  R$ ••••••       │  │  R$ ••••••       │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ... (todos os valores monetários mascarados)                │
│  Labels e ícones: visíveis                                  │
│  Freedom Index: visível (não é valor monetário)             │
└──────────────────────────────────────────────────────────────┘
```

---

# 8. PERFORMANCE

## 8.1 Métricas alvo

| Métrica | Alvo |
|---------|:----:|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s (Hero Card) |
| Time to Interactive (TTI) | < 3.5s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Dados do Firestore | Cache-first, network update |

## 8.2 Estratégia de carregamento

```
1. Shell HTML/CSS                      ← instantâneo (precache SW)
2. Header (nome do auth cache)         ← <100ms (local)
3. Skeleton (Hero + 2 KPIs + 3 items)  ← <200ms (renderizado)
4. Firestore fetch (accounts, DRE, FI) ← <500ms (rede)
5. Dados preenchem skeleton            ← <300ms (render)
6. Domus Insight (async, opcional)     ← <2s (IA)

Total percebido: <2s para interação completa
```

## 8.3 Lazy Loading

| Elemento | Estratégia |
|----------|-----------|
| Gráficos (sparkline, donut) | Carregar sob demanda (quando visível) |
| Domus Insight | Carregar após dados principais |
| Seções abaixo da dobra | Renderizadas mas dados preenchidos async |

---

# 9. BOTTOM NAVIGATION

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ⌂         💰         📈         ◈         ☰                 │
│ Início   Finanças   Investir   Domus     Mais                │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

## 9.1 Ordem e justificativa

| Slot | Ícone | Label | Justificativa |
|:----:|:-----:|-------|---------------|
| 1 | ⌂ | **Início** | Primeiro = mais acessível. É a Home. Sempre ativo ao abrir o app. |
| 2 | 💰 | **Finanças** | Segundo mais usado. Fluxo de caixa, contas, planejamento. |
| 3 | 📈 | **Investir** | Terceiro. Aspiracional. Separado de finanças operacionais. |
| 4 | ◈ | **Domus** | Quarto. IA acessível mas não dominante. Também acessível via FAB. |
| 5 | ☰ | **Mais** | Último = menor frequência. Perfil, config, planos, ajuda. |

## 9.2 Por que esta ordem?

- **Frequência de uso** decresce da esquerda para a direita.
- **Polegar** alcança mais facilmente as bordas. Início e Mais são os destinos mais extremos.
- **Domus no slot 4** (não 3): a IA é acessível via FAB de qualquer tela. O slot 3 (Investir) é mais usado como destino de navegação.

---

# 10. ACESSIBILIDADE

## 10.1 Checklist

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44×44px | ✅ Todos os cards, botões, itens de lista |
| Safe Areas (notch, home indicator) | ✅ Padding com `env(safe-area-inset-*)` |
| Dynamic Type | ✅ Fontes escalam com preferência do sistema até 200% |
| Contraste AA (4.5:1 corpo, 3:1 large) | ✅ Texto primário (#EDF0F5) sobre Canvas (#0A0E14) = 13.5:1 |
| Contraste AAA (7:1) | ⚠️ Texto secundário (#8B949E) = 5.6:1. Próximo do AA, abaixo do AAA. |
| Screen reader (VoiceOver/TalkBack) | ✅ Labels semânticos. Hero: "Saldo disponível, 9.500 reais". KPIs: "Receitas do mês, 8.200 reais, aumento de 12%". |
| Redução de movimento | ✅ `prefers-reduced-motion` desabilita animações |
| Modo escuro | ✅ Padrão. Light mode disponível como opção. |
| Modo claro | ✅ Contraste equivalente. Cores adaptadas. |
| Uso com uma mão | ✅ Todas as ações principais na metade inferior |

## 10.2 Teste do Polegar

```
375px viewport (menor):
┌──────────────────────────────┐
│        DIFÍCIL               │ ← Header, Status Bar
│        (header)              │
├──────────────────────────────┤
│        MÉDIO                 │ ← Hero, KPIs (ainda alcançável)
│        (hero + KPIs)         │
├──────────────────────────────┤
│        FÁCIL                 │ ← Freedom Index, Domus Insight,
│        (FI + insight +       │    Próximas, Bottom Nav,
│         próximas + nav)      │    FAB
└──────────────────────────────┘

Ações na zona FÁCIL: Freedom Index (expandir), Domus (abrir chat),
Próximas contas (scroll horizontal ou tap), Bottom Nav, FAB.
```

---

# 11. CHECKLIST DE HOMOLOGAÇÃO

## 11.1 Design

- [ ] FDL 1.0: cores, tipografia, espaçamento, grid
- [ ] PWA Design v1: estrutura de navegação, 5 destinos
- [ ] Protagonista: Saldo disponível em Hero Card (36px)
- [ ] KPIs: 4 cards em grid 2×2
- [ ] Freedom Index: colapsado com CTA expansível
- [ ] Domus Insight: 0-1, com borda azul esquerda
- [ ] Próximas Contas: máx 3 itens + link "Ver todas"
- [ ] Carteira + Planejamento: cards resumo no final
- [ ] FAB: 56px, azul, posição fixa cant inferior direito
- [ ] Bottom Nav: 5 destinos, 82px, ordem correta

## 11.2 Estados

- [ ] Loading: skeleton (Hero + 2 KPIs + 3 items)
- [ ] Primeiro acesso: empty state com CTAs de onboarding
- [ ] Erro total: mensagem + botão "Tentar novamente"
- [ ] Erro parcial: preservar dados carregados
- [ ] Offline: badge + dados cacheados + ações desabilitadas
- [ ] Privacy: valores mascarados, labels visíveis

## 11.3 Interações

- [ ] Pull-to-refresh funcional
- [ ] Scroll: header sticky, FAB esconde/mostra
- [ ] Tap no Freedom Index: expande/colapsa com animação
- [ ] Tap no Insight Domus: abre chat em Bottom Sheet
- [ ] Tap no FAB: abre chat em Bottom Sheet
- [ ] Tap em cards de KPI: navega para detalhe
- [ ] Tap em Próximas Contas: navega para tela de contas
- [ ] Tap no avatar: abre Context Switcher Sheet

## 11.4 Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Safe areas iOS + Android
- [ ] Contraste AA para texto primário
- [ ] Screen reader: labels descritivos
- [ ] Dynamic Type até 200%
- [ ] prefers-reduced-motion respeitado
- [ ] Dark + Light mode

## 11.5 Performance

- [ ] FCP < 1.5s
- [ ] LCP (Hero) < 2.5s
- [ ] CLS < 0.1
- [ ] Skeleton visível em <200ms
- [ ] Cache-first para dados do Firestore

## 11.6 PWA

- [ ] Manifest configurado
- [ ] Service Worker com precache
- [ ] Funciona offline (dados cacheados)
- [ ] Instalável (standalone)
- [ ] Splash screen
- [ ] Ícones 192×192 e 512×512

---

# 12. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Protagonista | Saldo disponível (Hero 36px) | FDL P6: um protagonista por tela |
| KPIs | 4 em grid 2×2 | Visibilidade total, sem swipe |
| Freedom Index | Colapsado com expansão | Profundidade progressiva (FDL P8) |
| Domus Insight | 0-1, borda azul | IA proativa mas não invasiva (FDL P9) |
| Próximas Contas | Máx 3 + link | Urgência sem poluição |
| Ações Rápidas | REMOVIDAS da Home | Competem com o protagonista. Pertencem ao Fluxo de Caixa. |
| FAB | Domus (BrainCircuit, 56px, azul) | IA sempre acessível |
| Bottom Nav | 5 destinos (ordem por frequência) | Início > Finanças > Investir > Domus > Mais |
| Tema padrão | Dark | Assinatura FinDomus (FDL Bloco 1) |

---

*FinDomus Home Mobile Homologation v1 · Fase M0.1 · PRONTO PARA HOMOLOGAÇÃO*
