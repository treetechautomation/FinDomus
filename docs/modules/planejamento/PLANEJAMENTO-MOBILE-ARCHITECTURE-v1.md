# FINDOMUS — PLANEJAMENTO MOBILE ARCHITECTURE v1

**Fase:** 10 — Arquitetura Mobile do Módulo Planejamento
**FDL:** 1.0 FROZEN
**Universal Module Pattern:** v1 homologado (tipo PL — Planning)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Home:** v1 homologada

---

## 1. RESUMO EXECUTIVO

O Planejamento do FinDomus é um módulo de **distribuição percentual de renda** entre 6 categorias (pilares), com cálculo automático de teto de gastos baseado na receita mensal, comparação entre planejado e realizado, e recomendações derivadas do Freedom Index.

A auditoria do código real revelou que o módulo **não possui metas financeiras no sentido tradicional** (target value + deadline + progress). As "metas" são categorias de alocação percentual (WealthProfile). O orçamento é calculado automaticamente como `renda × percentual`. Simulações existem como componente separado (`ScenarioComparator`) mas não estão integradas na página principal.

A arquitetura mobile propõe 3 tabs (Visão Geral, Orçamento, Estratégia), com a distribuição percentual como núcleo do módulo. A Domus contextual e as simulações entram como camadas complementares.

---

## 2. BASELINE

```
Baseline funcional: bc19adb
Branch: main
Working tree: clean (apenas docs/ não rastreados)
HEAD: bc19adb fix: freeze pre-FDL functional baseline
```

---

## 3. ARQUITETURA ATUAL (DESKTOP)

### 3.1 Arquivos auditados

| Arquivo | Linhas | Função |
|---------|:------:|--------|
| `src/app/(main)/planejamento/page.tsx` | 528 | Página principal. Carrega dados, roda kernel, orquestra UI |
| `src/services/firestore/planning.ts` | 213 | Firestore: WealthProfile, Budget, RecurringExpense CRUD |
| `src/core/finance/wealth-engine.ts` | 250 | Análise de distribuição de riqueza, score, insights |
| `src/core/finance/simulation-engine.ts` | 204 | Simulação de cenários (6 tipos) |
| `src/core/finance/freedom-engine.ts` | 610 | Freedom Index, timeline, action plan |
| `src/core/finance/kernel.ts` | 271 | Kernel: orquestra 7 engines |
| `src/lib/planning-snapshot-builder.ts` | 158 | Snapshot builder para cache |
| `src/lib/planning-snapshot-types.ts` | 85 | Tipos do snapshot de planejamento |
| `src/components/planejamento/` | 9 arquivos | Componentes de UI desktop |

### 3.2 UI Desktop — ordem real

```
Planejamento
├── Header: "Planejamento financeiro" + descrição
├── Tabs: Visão geral | Orçamento doméstico | Minhas metas
│
├── [Tab: Visão geral]
│   ├── Overview Cards (6 KPIs): Receita, Despesas, Parcelas, Saldo, Reserva, Freedom Index
│   ├── PlanningAlertCard (insights da IA, 0-3 exibidos)
│   ├── PlanningGoalsDiagnosisCard (meta pressionada, maior gasto, metas em atenção)
│   ├── PlanningGoalRecommendationCard (recomendação por meta)
│   └── PlanningInvestmentOpportunityCard (action plan do Freedom Index)
│
├── [Tab: Orçamento doméstico]
│   ├── Month Navigation: ← julho 2026 →
│   ├── Renda do mês (label)
│   ├── BudgetExpensesChartCard (PieChart de gastos realizados)
│   └── BudgetSummaryCard (tabela: Meta × Teto × Gasto × Saldo × Status)
│
└── [Tab: Minhas metas]
    ├── PlanningGoalsChartCard (PieChart da distribuição %)
    ├── PlanningGoalsManager (CRUD: nome, %, cor, categorias vinculadas, slider)
    └── Diagnóstico (total deve ser 100%, insight)
```

---

## 4. FUNCIONALIDADES REAIS

### 4.1 Wealth Profile (as "metas")

| Aspecto | Realidade |
|---------|-----------|
| **O que é** | 6 categorias de distribuição percentual da renda |
| **Modelo** | `WealthProfile` com `categories[]` (id, name, percentage, color, categories[]) |
| **Persistência** | Firestore: `wealth_profiles/{id}` |
| **Default** | 6 categorias: Essenciais (30%), Qualidade (10%), Patrimônio (20%), Estilo (10%), Independência (25%), Intelectual (5%) |
| **CRUD** | Criar/editar nome, percentual, cor. Vincular/desvincular categorias de transação. Remover. |
| **Validação** | Total deve ser 100% para salvar |
| **NÃO é** | Meta financeira com valor alvo e prazo. É estratégia de alocação. |

### 4.2 Orçamento

| Aspecto | Realidade |
|---------|-----------|
| **Como funciona** | Para cada categoria do WealthProfile: `teto = rendaMensal × percentual / 100` |
| **Comparação** | Gasto real (transações do mês classificadas por categoria vinculada) vs teto |
| **Status** | Saudável (dentro), Atenção (até 5% acima), Estourou (>5% acima) |
| **Persistência** | `budgets` Firestore collection. `upsertBudget()` salva orçamento por categoria/mês |
| **Cálculo** | Todo derivado de transações + wealth profile + renda mensal. Nada fixo. |

### 4.3 Simulações

| Aspecto | Realidade |
|---------|-----------|
| **Componente** | `ScenarioComparator` (`src/components/simulations/scenario-comparator.tsx`, 375 linhas) |
| **Tipos** | 3 cenários com UI: quitar dívida (slider), aporte mensal (slider), cortar gastos (slider) |
| **Engine** | `simulation-engine.ts` (6 tipos, mas só 3 expostos na UI) |
| **Integração** | NÃO está na página de Planejamento. É componente standalone. Link via "Simular cenários no Laboratório de Decisões". |
| **Otimizador** | `findOptimalStrategy()` do `optimizer.ts` — gera top 3 estratégias recomendadas |

### 4.4 Insights e Recomendações

| Componente | Fonte | Conteúdo |
|------------|-------|----------|
| `PlanningAlertCard` | `financial-ai-engine.ts` → `ai.insights` | Alertas de recorrência, assinatura, forecast, comportamento. Máx 3 visíveis. |
| `PlanningGoalsDiagnosisCard` | Cálculo local no page.tsx (`budgetRows`) | Meta mais pressionada, maior gasto, metas em atenção |
| `PlanningGoalRecommendationCard` | `pressuredGoal` derivado | Recomendação por meta com impactos |
| `PlanningInvestmentOpportunityCard` | `freedom-engine.ts` → `freedom.actions` | Action plan do Freedom Index (máx 3 ações) |

---

## 5. DADOS

| Fonte | Tipo | Coleção/Engine |
|-------|------|----------------|
| `getAccountsWithBalance()` | Firestore | `accounts` |
| `getInvestments()` | Firestore | `investments` |
| `getLiabilities()` | Firestore | `liabilities` |
| `getPersonalTransactions()` | Firestore | `transactions` |
| `getRecurringExpenses()` | Firestore | `recurring_expenses` |
| `getCategories()` | Firestore | `categories` |
| `getWealthProfile()` | Firestore | `wealth_profiles` |
| `runFinancialKernel()` | Engine (in-memory) | Kernel → 7 engines |
| `saveWealthProfile()` | Firestore | `wealth_profiles` |
| `upsertBudget()` | Firestore | `budgets` |
| `financialEvents` | Pub/sub | Event bus local |

---

## 6. CONTEXTO PF / FAMÍLIA / PJ

| Contexto | Status | Evidência |
|----------|:------:|-----------|
| **PF** | ✅ IMPLEMENTADO | `owner === 'PF'` nos filtros. `getPersonalTransactions()`. `resolveUserHouseholdId()`. |
| **Família** | ❌ NÃO IMPLEMENTADO | `householdId` existe no schema mas não há lógica de agregação familiar. WealthProfile é individual. |
| **PJ** | ❌ NÃO IMPLEMENTADO | Sem suporte. Kernel filtra `owner === 'PF'`. Wealth engine opera sobre DRE PF apenas. |

---

## 7. PERMISSÕES

| Aspecto | Status |
|---------|:------:|
| Owner vs Member | ❌ NÃO IMPLEMENTADO |
| Read-only | ❌ NÃO IMPLEMENTADO |
| Admin | ❌ NÃO IMPLEMENTADO |

Todas as ações assumem `user.uid` como proprietário. Sem verificação de permissão.

---

## 8. PROBLEMAS ATUAIS

| ID | Descrição | Tipo |
|----|-----------|------|
| **P-01** | "Metas" no UI são percentuais de alocação, não metas financeiras com target/date. Nome ambíguo. | UX/Conceitual |
| **P-02** | Simulações não estão integradas à página de Planejamento. Componente `ScenarioComparator` é standalone. | Arquitetural |
| **P-03** | Orçamento usa `upsertBudget()` no Firestore mas a UI NÃO exibe valores salvos — recalcula a partir de `renda × %`. O `upsertBudget` parece ser usado apenas pelo `EditBudgetDialog` em Pessoal. | Dados |
| **P-04** | Tabela de orçamento (`BudgetSummaryCard`) usa `min-w-[760px]` — quebra em mobile. | UX Desktop |
| **P-05** | Overview Cards mostram 6 KPIs lado a lado — grid de 6 colunas. Densidade Analytical, não Standard. | UX/Arquitetural |
| **P-06** | Sem Domus contextual. | Funcional |
| **P-07** | Sem estado de empty state diferenciado (sem metas vs sem transações vs sem renda). | UX |
| **P-08** | `getWealthInsight()` e `getWealthRecommendation()` usam emojis (🚨, 📈, ✅, 🎉). Viola FDL. | FDL |

---

## 9. CÓDIGO LEGADO / DUPLICAÇÕES

| ID | Descrição |
|----|-----------|
| **L-01** | `EditBudgetDialog` em `pessoal/` usa `upsertBudget()` mas a página de Planejamento não consome budgets salvos — recalcula. Duas fontes de verdade para orçamento. |
| **L-02** | `getWealthRecommendation()` no wealth-engine usa emojis mas não é chamada diretamente pelo page.tsx (que tem sua própria lógica de `recommendation`). Função subutilizada. |
| **L-03** | `ScenarioComparator` importa `runSimulation` e `findOptimalStrategy` mas não é referenciado pelo `page.tsx`. Componente órfão do ponto de vista do Planejamento. |

---

## 10. OBJETIVO MOBILE

> O Planejamento ajuda o usuário a definir **como distribuir sua renda** entre os pilares da vida financeira e a **acompanhar se está dentro do planejado** a cada mês.

**Pergunta central que o módulo responde:**

> "Minha renda está sendo distribuída conforme minha estratégia?"

---

## 11. TAXONOMIA — TIPO PL (Planning)

Aplicação do Universal Module Pattern tipo PL:

| Elemento | Decisão |
|----------|---------|
| Header | ← Origem + "Planejamento" + [Domus] |
| Summary | **Estratégia ativa**: distribuição percentual atual (ex: "Patrimônio 20% · Independência 25%") + status (salvo/alterado) |
| Insight | 0-1 insight Domus (ex: "Sua margem de segurança está baixa. Considere aumentar a alocação em Patrimônio.") |
| Primary Action | "Ajustar estratégia" → Tab Estratégia |
| Internal Navigation | 3 Tabs |
| Filters | Month navigator |
| Charts | PieChart (distribuição % ou gastos realizados) |
| Lists | Resumo de tetos por categoria |

---

## 12. ARQUITETURA DE INFORMAÇÃO

```
Planejamento
│
├── Tab 1: Visão Geral
│   ├── Summary (estratégia atual + status)
│   ├── Insight Domus (0-1)
│   ├── Destaque do mês: Receita, Despesas, Saldo
│   ├── Alertas (0-3 insights do financial-ai-engine)
│   └── Recomendações (action plan do Freedom Index)
│
├── Tab 2: Orçamento
│   ├── Month Navigator
│   ├── Resumo: Receita + Total Gasto + % utilizado
│   ├── PieChart: Gastos realizados por categoria
│   └── Lista de categorias: teto × gasto × saldo × status
│
└── Tab 3: Estratégia
    ├── PieChart: Distribuição percentual
    ├── Lista de categorias editável (nome, %, cor)
    ├── Vinculação de categorias de transação
    └── Ações: Salvar | Resetar | Adicionar categoria
```

**3 Tabs** — dentro do budget de ≤4. Simulações não entram como tab própria; são acessadas via Domus ou via link contextual.

---

## 13. TAB 1 — VISÃO GERAL

### Summary

```
┌──────────────────────────────────────────────────────────────┐
│  Estratégia atual                                            │
│                                                              │
│  Essenciais 30% · Patrimônio 20% · Independência 25%        │
│  Qualidade 10% · Estilo 10% · Intelectual 5%                │
│                                                              │
│  Total: 100%  ✅                                             │
└──────────────────────────────────────────────────────────────┘
```

Se houve alterações não salvas: "Total: 95% ⚠️ — [Salvar alterações]"

### Insight Domus (0-1)

```
┌──────────────────────────────────────────────────────────────┐
│ ◈ Domus                                                      │
│ Sua alocação em Patrimônio (20%) está abaixo                 │
│ do recomendado para sua idade (25-30%).                      │
│                                                              │
│ Entender                                                     │
└──────────────────────────────────────────────────────────────┘
```

### Destaque do mês

```
┌──────────────────────────────────────────────────────────────┐
│ ← agosto 2026 →                                              │
│                                                              │
│ Receita           R$ 6.200                                   │
│ Despesas          R$ 4.280     69% da renda                  │
│ Parcelas          R$ 420        7% da renda                  │
│ ─────────────────────────────────────                        │
│ Saldo             R$ 1.500     24% da renda                  │
└──────────────────────────────────────────────────────────────┘
```

3 métricas principais (não 6). Foco em receita, despesas e saldo.

### Alertas (0-3)

Lista compacta de insights do `financial-ai-engine.ts`, sem emojis, máximo 3.

### Recomendações (0-3)

Action plan do Freedom Index. Cada ação com: prioridade (badge), título, descrição, impacto (R$ + pts), CTA.

---

## 14. TAB 2 — ORÇAMENTO

### Month Navigator + Resumo

```
┌──────────────────────────────────────────────────────────────┐
│ ← agosto 2026 →                                              │
│                                                              │
│ Receita do mês     R$ 6.200                                  │
│ Total gasto        R$ 4.700     76% utilizado                │
└──────────────────────────────────────────────────────────────┘
```

### PieChart

Distribuição real dos gastos do mês por categoria. 260px altura. Legendas abaixo.

### Lista de categorias (orçamento)

```
┌──────────────────────────────────────────────────────────────┐
│ Categoria          Teto         Gasto       Saldo    Status  │
│ ──────────────────────────────────────────────────────────── │
│ Essenciais         R$ 1.860     R$ 1.720    +R$ 140  ✅     │
│ Qualidade de Vida  R$ 620       R$ 540      +R$ 80   ✅     │
│ Patrimônio         R$ 1.240     R$ 980      +R$ 260  ✅     │
│ Estilo de Vida     R$ 620       R$ 890      −R$ 270  ⚠️     │
│ Independência      R$ 1.550     R$ 380      +R$ 1.170 ✅    │
│ Intelectual        R$ 310       R$ 190      +R$ 120  ✅     │
└──────────────────────────────────────────────────────────────┘
```

**Formato mobile:** Lista vertical de cards (não tabela horizontal). Cada card mostra: nome da categoria + barra de progresso + teto/gasto/saldo + status.

```
┌──────────────────────────────────────────────────────────────┐
│ Essenciais                                          ✅       │
│ Teto: R$ 1.860  ·  Gasto: R$ 1.720  ·  Saldo: +R$ 140      │
│ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱ 92% utilizado                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. TAB 3 — ESTRATÉGIA

### PieChart da distribuição

Gráfico de pizza com as 6 categorias e seus percentuais. Total visível (deve ser 100%).

### Lista de categorias editável

Cada categoria em um card expansível:

```
┌──────────────────────────────────────────────────────────────┐
│ Essenciais                                          30% ▾   │
│ ──────────────────────────────────────────────────────────── │
│ [██████████████████████████████░░░░░░░░░░░░░] 30%            │
│                                                              │
│ Categorias vinculadas:                                       │
│ [Moradia ×] [Alimentação ×] [Transporte ×] [Energia ×]      │
│                                                              │
│ [+ Adicionar categoria]                                      │
└──────────────────────────────────────────────────────────────┘
```

- Slider para ajustar percentual
- Edição inline de nome e cor (toque no nome → input, toque na cor → color picker)
- Categorias vinculadas como chips removíveis

### Ações

```
┌──────────────────────────────────────────────────────────────┐
│              [Salvar estratégia]                              │
│              [Resetar para padrão]                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 16. SIMULAÇÕES NO MOBILE

**Decisão: Simulações NÃO são uma tab.**

Elas são acessadas de duas formas:
1. **Domus contextual:** "E se eu aumentar meu aporte?" → Domus com `moduleContext: planejamento`
2. **Link contextual na Visão Geral:** "Simular cenário" → abre tela dedicada de simulação (componente adaptado do ScenarioComparator)

A tela de simulação segue o padrão de Detail Screen (header com ← Planejamento, conteúdo com sliders e comparação antes/depois).

---

## 17. DOMUS CONTEXTUAL

### Ponto de acesso
Ícone no header (slot de ação, lado direito).

### Contexto enviado
```js
{
  financialContext: "PF",
  moduleContext: "planejamento",
  subSection: "visao-geral" | "orcamento" | "estrategia",
  period: "2026-08",
  activeFilters: {}
}
```

### Exemplos de perguntas
- "Estou no caminho certo com minha estratégia?"
- "Qual categoria está mais pressionada?"
- "E se eu aumentar Patrimônio para 25%?"
- "Como reduzir meus gastos em Estilo de Vida?"

---

## 18. EMPTY STATES

### Sem estratégia (wealth profile vazio ou default nunca salvo)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              Você ainda não definiu sua estratégia            │
│                                                              │
│     Distribua sua renda entre os 6 pilares                   │
│     da vida financeira para acompanhar seus gastos.          │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Criar estratégia              │           │
│           └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Sem transações no mês

```
┌──────────────────────────────────────────────────────────────┐
│              Sem transações em agosto 2026                    │
│                                                              │
│     Importe seus extratos para começar a                     │
│     acompanhar seu orçamento.                                │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Importar extratos             │           │
│           └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

---

## 19. CAPABILITY MATRIX

| Capability | Backend | Engine | UI Atual | Mobile UX | Gap |
|------------|:-------:|:------:|:--------:|:---------:|-----|
| Wealth Profile CRUD | ✅ Firestore | — | ✅ PlanningGoalsManager | ✅ Tab Estratégia | Nenhum |
| Orçamento (teto = renda × %) | ✅ Kernel/DRE | ✅ wealth-engine | ✅ BudgetSummaryCard | ✅ Tab Orçamento (cards) | Adaptar tabela → cards |
| Month navigation | ✅ period-engine | — | ✅ ← mês → | ✅ Month navigator | Nenhum |
| Insights (rule-based) | ✅ financial-ai-engine | ✅ | ✅ PlanningAlertCard | ✅ Visão Geral | Remover emojis (viola FDL) |
| Freedom Index action plan | ✅ kernel | ✅ freedom-engine | ✅ InvestmentOpportunityCard | ✅ Visão Geral | Nenhum |
| PieChart (gastos) | ✅ Recharts | — | ✅ BudgetExpensesChartCard | ✅ Tab Orçamento | Nenhum |
| PieChart (distribuição) | ✅ Recharts | — | ✅ PlanningGoalsChartCard | ✅ Tab Estratégia | Nenhum |
| Diagnóstico de metas | ✅ Cálculo local | — | ✅ GoalsDiagnosisCard | ✅ Visão Geral | Nenhum |
| Simulações | ✅ simulation-engine | ✅ kernel | ⚠️ Standalone | ✅ Tela dedicada | Integrar ao módulo |
| Otimizador de estratégia | ✅ optimizer.ts | ✅ kernel | ⚠️ Na simulação | ✅ Domus/Simulação | Nenhum |
| Domus contextual | ❌ | ❌ | ❌ | ✅ Ícone no header | **CRIAR** |
| Contexto Família | ❌ | ❌ | ❌ | — | **ENGINE REQUIRED** |
| Contexto PJ | ❌ | ❌ | ❌ | — | **ENGINE REQUIRED** |
| Permissões | ❌ | ❌ | ❌ | — | **AUTH REQUIRED** |

---

## 20. CURRENT → MOBILE MAP

| Elemento Desktop | Destino Mobile | Ação |
|------------------|----------------|------|
| Header (h1 + p) | Header padrão (← Origem + Planejamento + [Domus]) | ADAPT |
| 3 Tabs (Radix) | 3 Tabs (Visão Geral, Orçamento, Estratégia) | KEEP |
| 6 Overview Cards (grid xl:grid-cols-6) | 3 métricas principais (Receita, Despesas, Saldo) | MERGE |
| PlanningAlertCard (emojis) | Lista de alertas sem emojis | ADAPT |
| PlanningGoalsDiagnosisCard | Card de diagnóstico na Visão Geral | ADAPT |
| PlanningGoalRecommendationCard | Card de recomendação na Visão Geral | ADAPT |
| PlanningInvestmentOpportunityCard | Lista de recomendações na Visão Geral | KEEP |
| Month Navigation (← mês →) | Month navigator padrão | KEEP |
| BudgetExpensesChartCard (PieChart 260px) | PieChart 260px na Tab Orçamento | KEEP |
| BudgetSummaryCard (tabela min-w-[760px]) | Lista de cards por categoria | ADAPT |
| PlanningGoalsChartCard (PieChart 260px) | PieChart 260px na Tab Estratégia | KEEP |
| PlanningGoalsManager (CRUD inline) | CRUD em cards expansíveis | ADAPT |
| Diagnóstico (total = 100%) | Indicador no Summary | MERGE |
| ScenarioComparator (standalone) | Tela dedicada acessível via Visão Geral ou Domus | MOVE |
| EditBudgetDialog (em Pessoal) | Fora do escopo do Planejamento Mobile | HIDE |
| Simulações link "Laboratório de Decisões" | CTA contextual na Visão Geral | ADAPT |

---

## 21. IMPLEMENTATION GAP MAP

| Gap | Descrição | Bloqueia v1? |
|-----|-----------|:------------:|
| Domus contextual | Ícone no header + contexto enviado | Não (ícone placeholder, funcionalidade futura) |
| Simulações integradas | Tela de simulação acessível do Planejamento | Não (pode ser P2) |
| Emojis no wealth-engine | Substituir 🚨📈✅🎉 por texto/ícones Lucide | Sim (viola FDL — deve ser corrigido) |
| Contexto Família | Agregar dados de múltiplos membros | Não (família é FUTURE) |
| Contexto PJ | DRE PJ no wealth engine | Não (PJ é FUTURE) |
| Permissões | Owner vs member vs read-only | Não (não existe hoje) |
| Budget persistido vs calculado | Resolver ambiguidade upsertBudget vs renda×% | Não (usar renda×% como verdade; budget collection é legado) |

---

## 22. PLANNING MODULE CONTRACT

### Tipo: PL — Planning

| Elemento | Obrigatório? | Implementação |
|----------|:-----------:|---------------|
| Header | ✅ | ← Origem + Planejamento + [Domus] |
| Summary | ✅ | Estratégia atual (distribuição %) + status |
| Insight | Opcional | 0-1 insight Domus |
| Primary Action | ✅ | "Ajustar estratégia" → Tab Estratégia |
| Secondary Action | Opcional | "Simular cenário" → Tela de Simulação |
| Internal Navigation | ✅ | 3 Tabs: Visão Geral, Orçamento, Estratégia |
| Month Navigator | ✅ | ← mês ano → |
| Filters | — | Não aplicável |
| Main Content | ✅ | Charts, cards, listas por tab |
| Detail Screen | Opcional | Tela de Simulação (quando acessada) |
| Bottom Nav | ✅ | Active conforme origem |

---

## 23. COMPLEXITY BUDGET

| Limite | Valor |
|--------|:-----:|
| Tabs | 3 |
| KPIs no Summary (Visão Geral) | 3 (Receita, Despesas, Saldo) |
| Insights | 0-3 (máx 3 na Visão Geral) |
| Recomendações | 0-3 (máx 3 na Visão Geral) |
| Categorias na Estratégia | 6 (padrão, expansível) |
| Gráficos por viewport | 1 (PieChart) |
| Primary Action | 1 ("Salvar estratégia" ou "Ajustar estratégia") |
| Month Navigator | 1 |

---

## 24. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum P0 ou P1 bloqueador | — |
| P2-01 | `getWealthInsight()` e `getWealthRecommendation()` usam emojis (🚨📈✅🎉). Viola FDL. Precisa ser corrigido para ícones Lucide ou texto. | PLANNING-P2 |
| P2-02 | Simulações não integradas à página de Planejamento. Componente standalone. | PLANNING-P2 |
| P2-03 | `EditBudgetDialog` em Pessoal e orçamento calculado no Planejamento usam fontes de verdade diferentes para budget. | PLANNING-P2 |
| P3-01 | Wealth Profile é individual. Sem suporte a Família. | PLANNING-P3 |
| P3-02 | Sem permissões (owner/member/read-only). | PLANNING-P3 |

---

## 25. CHANGE REQUESTS

| ID | Tipo | Descrição |
|----|------|-----------|
| FDL-CR-01 | FDL | Remover emojis do `wealth-engine.ts` (`getWealthInsight`, `getWealthRecommendation`). Substituir por ícones Lucide ou texto sem emoji. Viola regra FDL de não usar emojis. |

---

## 26. DECISÕES ABERTAS

| # | Questão | Recomendação |
|---|---------|-------------|
| 1 | Nome da Tab 3: "Estratégia" vs "Minhas metas" vs "Distribuição"? | "Estratégia" — reflete melhor o conceito de alocação percentual. "Metas" sugere metas financeiras (target + deadline) que não existem. |
| 2 | Simulações como tab ou tela separada? | Tela separada, acessível via Visão Geral ou Domus. Não é visita frequente o suficiente para justificar tab. |
| 3 | Manter 6 KPIs ou reduzir para 3 na Visão Geral? | Reduzir para 3 (Receita, Despesas, Saldo). Freedom Index e Reserva já estão na Home. Parcelas é detalhe do orçamento. |

---

## 27. RECOMENDAÇÃO FINAL

A arquitetura mobile do Planejamento reduz a complexidade do módulo desktop (6 KPIs lado a lado, tabela de 760px, 9 componentes visíveis simultaneamente) para uma experiência mobile coesa em 3 tabs com densidade Standard.

O achado mais importante da auditoria é que **o Planejamento não tem metas financeiras** (target value + deadline) — tem **estratégia de alocação percentual**. A nomenclatura e UX mobile precisam refletir isso com precisão: "Estratégia", não "Metas".

**Próximo passo:** Com PLANNING-P0 = 0 e PLANNING-P1 = 0:

→ **PLANEJAMENTO MOBILE WIREFRAME v1**

---

*FinDomus Planejamento Mobile Architecture v1 · Fase 10 concluída · Aguardando homologação*
