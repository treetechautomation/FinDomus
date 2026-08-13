# FINDOMUS — INVESTIMENTOS MOBILE ARCHITECTURE v1

**Fase:** 13 — Arquitetura Mobile do Módulo Investimentos
**FDL:** 1.0 FROZEN
**Universal Module Pattern:** v1 homologado (tipo P — Portfolio)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Viewport de referência:** 390 × 844px

---

## 1. RESUMO EXECUTIVO

O módulo Investimentos do FinDomus é um sistema de **consolidação de portfólio** que agrega ativos de 3 fontes (cadastro manual, importação B3, importação de corretoras) com **6 engines analíticos** (alocação, performance, dividendos, risco, health score, insights). A auditoria revelou um módulo maduro com 735 linhas de UI desktop, 10 tabs, cotações online (BRAPI/Binance/CoinGecko), e consolidação cross-source.

A arquitetura mobile reduz as 10 tabs para **3 tabs** (Visão Geral, Carteira, Análise), consolida 4 KPIs em 1 superfície de summary, transforma a tabela de ativos em lista de cards, e posiciona calculadoras e importações como ações secundárias ou telas dedicadas. O protagonista do módulo é o **valor atual da carteira** (`totalMarketValue`), com rentabilidade acumulada como tendência.

---

## 2. BASELINE

```
Baseline funcional: bc19adb
Branch: main
Working tree: clean (apenas docs/ não rastreados)
```

---

## 3. ARQUIVOS AUDITADOS

| Arquivo | Linhas | Função |
|---------|:------:|--------|
| `app/(main)/investimentos/page.tsx` | 93 | Página. Carrega dados + consolida. |
| `components/investimentos/investment-wallet.tsx` | 735 | Orquestrador. 10+ tabs, charts, tabelas. |
| `components/investimentos/new-investment-dialog.tsx` | 640 | CRUD de investimentos. Catálogo + busca de ticker. |
| `components/investimentos/new-yield-dialog.tsx` | 130 | CRUD de proventos. |
| `services/firestore/investments.ts` | 127 | Firestore CRUD: `investments` collection. |
| `services/firestore/yields.ts` | 73 | Firestore CRUD: `yields` collection. |
| `services/firestore/b3-investments.ts` | 24 | Leitura: `investment_positions`, `investment_income`. |
| `services/firestore/broker-investments.ts` | 47 | Leitura: `broker_positions`, `broker_income`. |
| `core/investments/analytics/analytics-engine.ts` | 80 | Orquestrador dos 6 sub-engines. |
| `core/investments/analytics/allocation-engine.ts` | 153 | Alocação por classe/instituição/origem/moeda/setor. |
| `core/investments/analytics/performance-engine.ts` | 76 | Performance por ativo/instituição/origem. |
| `core/investments/analytics/health-score.ts` | 170 | Health score 0-100, grade A+ a F, 5 pilares. |
| `core/investments/analytics/insights-engine.ts` | 147 | 7 tipos de insights rule-based. |
| `lib/investment-snapshot-builder.ts` | 102 | Snapshot builder para cache. |
| `lib/investment-snapshot-types.ts` | 41 | Tipos do snapshot de investimentos. |
| `lib/market/lookup.ts` | 93 | Cotação online: Binance, CoinGecko, BRAPI, BCB. |
| `lib/market/resolve-asset.ts` | 267 | 165+ tickers catalogados, setorização detalhada. |
| `hooks/investimentos/use-investment-metrics.ts` | — | Hook: filtros, distribuição, totals. |
| `hooks/investimentos/use-investment-aporte.ts` | — | Hook: sugestões de aporte por goal. |

---

## 4. ENTIDADE REAL — INVESTMENT

| Campo | Tipo | Fonte |
|-------|------|-------|
| `type` | string | "Ações Nacionais", "Ações Internacionais", "Fundos Imobiliários", "Criptomoedas", "Renda Fixa" |
| `ticker` | string | Símbolo do ativo (PETR4, BTC, MXRF11, etc.) |
| `institution` | string | Banco/corretora (NuInvest, XP, BTG, etc.) |
| `quantity` | number | Quantidade de cotas/unidades |
| `averagePrice` | number | Preço médio de compra |
| `currentPrice` | number | Preço atual (manual ou cotação online) |
| `currentValue` | number | `quantity × currentPrice` (calculado no save) |
| `contributions` | number | `quantity × averagePrice` (calculado no save) |
| `objective` | string | Nome do ativo |
| `liquidity` | string | Moeda (BRL, USD) |
| `userId` | string | Owner |
| `source` | string | "manual", "b3", "broker" (implícito na consolidação) |

**Yield (provento):**
| Campo | Tipo |
|-------|------|
| `investmentId` | string |
| `ticker` | string |
| `date` | string (ISO date) |
| `amount` | number |
| `type` | "DIVIDEND", "JCP", "FII", "COUPON", "OTHER" |
| `description` | string |

---

## 5. DATA LINEAGE — PRINCIPAIS MÉTRICAS

### 5.1 Valor Atual da Carteira (`totalMarketValue`)

```
investment.currentValue (manual, save-time calc)
+ b3_positions.marketValue (import B3)
+ broker_positions.marketValue (import corretora)
    ↓
consolidatePortfolio(userId) → ConsolidatedPortfolio.totalMarketValue
    ↓
UI
```

### 5.2 Valor Investido (`totalInvested`)

```
investment.contributions (manual, qty × avgPrice)
+ b3_positions (cost basis)
+ broker_positions (qty × averagePrice)
    ↓
consolidatePortfolio → totalInvested
    ↓
UI
```

### 5.3 Lucro / Prejuízo

```
totalMarketValue − totalInvested = totalProfit
(totalProfit / totalInvested) × 100 = totalProfitPercent
```

### 5.4 Diversificação

```
allocation-engine.ts:
  byClass: número de classes de ativos distintas (>3 = boa)
  bySector: setorização por ticker (FII: 80+ tickers mapeados; ações: 50+)
  → diversificationScore (risk-engine.ts): 0-100
```

### 5.5 Cotações

```
lookupPrice(symbol, type):
  Cripto → Binance (BTC/ETH/SOL) → CoinGecko fallback
  Ações Nacionais / FIIs → BRAPI quote/{symbol}.SA
  Ações Internacionais → BRAPI quote/{symbol}.US
  Cache: 60min (ações), 5min (cripto)
```

---

## 6. UI DESKTOP ATUAL

```
Investimentos (investment-wallet.tsx, 735 linhas)
│
├── Header: título + botão refresh + botão "Novo Investimento"
│
├── 4 KPI Cards: Patrimônio Consolidado, Total Investido, Retorno, Instituições
│
├── Tabs (10+, scroll horizontal):
│   ├── Consolidação (consolidado-tab)
│   │   ├── PieChart: Classe / Instituição / Origem
│   │   ├── BarChart: Top 8 Ativos
│   │   ├── LineChart: Evolução Patrimonial (closures)
│   │   └── Table: Ativos com expansão de origens
│   ├── Ativos (ativos-tab)
│   ├── B3 Dashboard (b3-dashboard-tab)
│   ├── Análise (analise-tab) — health score, insights
│   ├── Aportes (aporte-tab) — sugestões de alocação
│   ├── Yields (yields-tab)
│   ├── Portfolio Chart (portfolio-chart)
│   ├── Goals (goals-tab)
│   ├── Questions (questions-tab)
│   └── Market Watch (market-watch-tab)
│
└── Dialogs: NewInvestment (640 linhas, catálogo + busca ticker), NewYield (130 linhas)
```

---

## 7. CLASSIFICAÇÃO — TIPO P (Portfolio)

### 7.1 Capacidades reais

| Capacidade | Status | Engine/Arquivo |
|------------|:------:|----------------|
| Valor atual da carteira | ✅ EXISTE | `consolidatePortfolio` → `totalMarketValue` |
| Valor investido (custo) | ✅ EXISTE | `consolidatePortfolio` → `totalInvested` |
| Lucro/prejuízo absoluto | ✅ EXISTE | `totalMarketValue − totalInvested` |
| Rentabilidade percentual | ✅ EXISTE | `(profit / invested) × 100` |
| Alocação por classe | ✅ EXISTE | `allocation-engine` → `byClass` |
| Alocação por instituição | ✅ EXISTE | `allocation-engine` → `byInstitution` |
| Alocação por origem | ✅ EXISTE | `allocation-engine` → `byOrigin` |
| Alocação por setor | ✅ EXISTE | `allocation-engine` → `bySector` (80+ FII, 50+ ações) |
| Performance por ativo | ✅ EXISTE | `performance-engine` → `byAsset` |
| Dividendos recebidos | ✅ EXISTE | `dividend-engine` + `yields` collection |
| Dividend yield | ✅ EXISTE | `dividend-engine` → `dividendYield` |
| Yield on cost | ✅ EXISTE | `dividend-engine` → `yieldOnCost` |
| Health score (0-100) | ✅ EXISTE | `health-score` → 5 pilares, grade A+ a F |
| Insights rule-based | ✅ EXISTE | `insights-engine` → 7 tipos |
| Cotação online | ✅ EXISTE | `lookup.ts` (BRAPI, Binance, CoinGecko) |
| Ticker catalog (165+) | ✅ EXISTE | `resolve-asset.ts` |
| CRUD de investimento | ✅ EXISTE | `investments.ts` + `new-investment-dialog.tsx` |
| CRUD de proventos | ✅ EXISTE | `yields.ts` + `new-yield-dialog.tsx` |
| Importação B3 | ✅ EXISTE | `b3-investments.ts` + import flow |
| Importação corretoras | ✅ EXISTE | `broker-investments.ts` + import flow |
| Histórico de fechamentos | ✅ EXISTE | `monthly-closures` (net worth evolution) |
| Sugestão de aporte | ✅ EXISTE | `use-investment-aporte` |
| Evolução patrimonial | ✅ EXISTE | `chartNetWorthHistory` (closures + portfolio) |

### 7.2 Capacidades NÃO existentes

| Capacidade | Status |
|------------|:------:|
| Benchmark comparativo (CDI, IPCA, Ibovespa) | ❌ NÃO EXISTE |
| Rebalanceamento automático | ❌ NÃO EXISTE |
| Perfil de risco do investidor | ❌ NÃO EXISTE |
| Recomendação de compra/venda | ❌ NÃO EXISTE |
| Performance diária (1D, 7D, 30D) | ❌ NÃO EXISTE |
| Metas de investimento (target + deadline) | ❌ NÃO EXISTE (goals-tab é placeholder) |
| Simulações de investimento | ❌ SEPARADO (calculadoras, outra rota) |
| Contexto Família | ❌ NÃO EXISTE |
| Contexto PJ | ❌ NÃO EXISTE |
| Permissões | ❌ NÃO EXISTE |

---

## 8. OBJETIVO MOBILE

> O Investimentos ajuda o usuário a entender **quanto tem investido, como está distribuído e se está evoluindo** — sem se tornar uma corretora ou terminal de mercado.

**Pergunta central:**

> "Meu patrimônio investido está crescendo e está bem distribuído?"

---

## 9. PROTAGONISTA DO MÓDULO

**Decisão: VALOR ATUAL DA CARTEIRA (`totalMarketValue`)**

| Candidato | Justificativa |
|-----------|--------------|
| Valor atual da carteira | ✅ O dado mais direto. Responde "quanto tenho investido". |
| Rentabilidade | ⚠️ Importante, mas é tendência, não protagonista. |
| Valor investido (custo) | ⚠️ Informativo, mas secundário ao valor atual. |

---

## 10. ARQUITETURA DE INFORMAÇÃO

De 10 tabs desktop para **3 tabs mobile**:

```
Investimentos
│
├── Tab 1: Visão Geral
│   ├── Summary: valor atual + rentabilidade + contexto
│   ├── Insight Domus (0-1)
│   ├── Alocação (barras horizontais por classe)
│   ├── Top ativos (3-5, lista compacta)
│   └── Ações: Adicionar + Importar
│
├── Tab 2: Carteira
│   ├── Lista de ativos (search + filter)
│   ├── Cada item: ticker + nome + valor + rentabilidade + classe
│   └── Detail: toque → tela de detalhe do ativo
│
└── Tab 3: Análise
    ├── Health Score (0-100, grade)
    ├── 5 pilares (barras)
    ├── Insights (0-5, rule-based)
    └── Dividendos (resumo: yield, total recebido)
```

### O que foi REMOVIDO da visão primária:

| Elemento | Destino |
|----------|---------|
| B3 Dashboard | → Ação secundária na Carteira |
| Aportes (sugestões) | → Domus contextual ou tela dedicada |
| Market Watch (cotações) | → Removido da visão primária. Cotações são carregadas sob demanda (ao abrir detail). |
| Goals (placeholder) | → Não implementado. Não promover placeholder. |
| Questions (placeholder) | → Domus contextual cobre. |
| Portfolio Chart (gráfico isolado) | → Absorvido pela Visão Geral (alocação) |
| Evolução Patrimonial (gráfico) | → Absorvido pela Análise |
| Yields | → Absorvido pela Análise (dividendos) |
| 4 KPI Cards separados | → 1 superfície de Summary |

---

## 11. TAB 1 — VISÃO GERAL

### Summary

```
┌──────────────────────────────────────────────────────────────┐
│ Carteira                                                     │
│                                                              │
│ R$ 42.800                                                    │ ← 36px financial-hero
│                                                              │
│ Investido: R$ 38.500     Lucro: +R$ 4.300 (+11,2%)          │ ← 13px
│ 12 ativos · 4 classes · 3 instituições                       │ ← 11px, tertiary
└──────────────────────────────────────────────────────────────┘
```

### Alocação

Barras horizontais por classe de ativo (3-5 classes principais):

```
┌──────────────────────────────────────────────────────────────┐
│ Alocação por classe                                          │
│                                                              │
│ Ações Nacionais        R$ 18.200     42%  ████████████      │
│ Renda Fixa             R$ 12.800     30%  █████████         │
│ Fundos Imobiliários    R$  7.600     18%  █████             │
│ Criptomoedas           R$  4.200     10%  ███               │
└──────────────────────────────────────────────────────────────┘
```

### Top ativos (3-5)

Lista compacta dos maiores ativos por valor:

```
┌──────────────────────────────────────────────────────────────┐
│ PETR4 Petrobras      R$ 8.200  +14,2%  →                    │
│ Tesouro IPCA+ 2035   R$ 7.500  +6,8%   →                    │
│ MXRF11 Maxi Renda    R$ 4.200  +9,1%   →                    │
└──────────────────────────────────────────────────────────────┘
```

### Ações

```
┌──────────────────────────────────────────────────────────────┐
│ [Adicionar investimento]                                     │ ← Primary (azul)
│                                                              │
│ Importar B3 · Importar corretora                              │ ← Secondary (texto)
└──────────────────────────────────────────────────────────────┘
```

---

## 12. TAB 2 — CARTEIRA

### Header da lista

Busca + filtro por classe:

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Buscar ativo...                    [Todos ▾]              │
└──────────────────────────────────────────────────────────────┘
```

### List Item padrão (Standard 56px)

```
┌──────────────────────────────────────────────────────────────┐
│ [ícone/classe]  PETR4                        R$ 8.200  →    │
│                  Petrobras · Ações Nacionais  +14,2%         │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Altura | 56px |
| Ícone | Indicador de classe (cor sutil) |
| Ticker + Nome | 14px, 600w, text-primary |
| Classe | 12px, 400w, text-secondary |
| Valor | 14px, 600w, tabular-nums, alinhado à direita |
| Rentabilidade | 12px, 500w, verde se positivo, vermelho se negativo |
| Toque | Abre Detail do ativo |

### Filtros

Chips horizontais acima da lista: "Todos", "Ações Nacionais", "Renda Fixa", "FIIs", "Criptomoedas", "Internacionais".

### Search

Busca interna por ticker, nome, instituição. Campo expansível no topo.

---

## 13. TAB 3 — ANÁLISE

### Health Score

```
┌──────────────────────────────────────────────────────────────┐
│ Saúde da Carteira                                            │
│                                                              │
│ 82 / 100  —  Nota A                                          │
│                                                              │
│ Diversificação       ████████████████████  18/20            │
│ Concentração         ██████████████████    16/20            │
│ Liquidez             ████████████████████  18/20            │
│ Dividendos           ██████████████        14/20            │
│ Risco                ████████████████      16/20            │
└──────────────────────────────────────────────────────────────┘
```

### Insights (0-5)

Lista compacta de insights do `insights-engine.ts` (rule-based). Cada insight com: tipo (info/warning/success/danger), texto curto, categoria.

### Dividendos

```
┌──────────────────────────────────────────────────────────────┐
│ Dividendos                                                   │
│                                                              │
│ Total recebido    R$ 1.240                                   │
│ Dividend Yield    2,9%                                       │
│ Yield on Cost     3,4%                                       │
│                                                              │
│ [Lançar provento]                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 14. DETAIL DO ATIVO

```
┌──────────────────────────────────────────────────────────────┐
│ ← Carteira    PETR4                                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Petrobras · Ações Nacionais                              ││
│  │                                                          ││
│  │ Valor atual     R$ 8.200                                 ││
│  │ Quantidade      220 cotas                                ││
│  │ Preço médio     R$ 31,82                                 ││
│  │ Preço atual     R$ 37,27                                 ││
│  │ Investido       R$ 7.000                                 ││
│  │ Lucro           +R$ 1.200 (+17,1%)                       ││
│  │                                                          ││
│  │ Instituição: NuInvest                                    ││
│  │ Cotação: BRAPI (atualizado agora)                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [Editar]    [Lançar provento]    [Excluir]               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ [Active = origem]                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. CRUD — ADICIONAR INVESTIMENTO

**Decisão: Bottom Sheet para catálogo, tela para busca de ticker.**

O formulário real tem 5 campos (tipo, ativo, quantidade, preço médio, preço atual). O `NewInvestmentDialog` atual (640 linhas) tem dois modos: catálogo e busca de ticker.

| Modo | Mecanismo mobile |
|------|-----------------|
| Catálogo (selecionar tipo → selecionar ativo da lista) | Bottom Sheet (≤5 campos) |
| Buscar ticker (digitar → resolver → preencher) | Bottom Sheet (expansível) |

---

## 16. PROVENTOS

**Decisão: Bottom Sheet para lançar provento.** Formulário com 4 campos (ativo, tipo, valor, data). Já existe `NewYieldDialog`.

---

## 17. IMPORTAÇÃO B3 / CORRETORAS

Não pertencem diretamente ao módulo Investimentos. São ações que abrem o workflow de Importações.

**Ações na Visão Geral:**
- "Importar B3" → navega para `/importacoes?source=b3`
- "Importar corretora" → navega para `/importacoes?source=broker`

---

## 18. CALCULADORAS

Rotas separadas (`/investimentos/calculadoras/*`). Não são tabs do módulo.

**Acesso:** Ação secundária na Visão Geral: "Calculadoras →". Abre tela dedicada ou navega para a rota de calculadoras.

---

## 19. DOMUS CONTEXTUAL

Ícone no header. Contexto enviado:

```js
{
  financialContext: "PF",
  moduleContext: "investimentos",
  activeTab: "overview" | "carteira" | "analise",
  activeAsset: { ticker, type, id } | null,
  filters: { class: "Ações Nacionais" } | null
}
```

### Exemplos de perguntas suportadas pelos engines:

- "Como está minha carteira?" — consome `performance-analytics`
- "Minha alocação está equilibrada?" — consome `allocation-engine` + `insights-engine`
- "Quanto recebi de dividendos?" — consome `dividend-engine`
- "Qual ativo está com pior desempenho?" — consome `performance-engine.byAsset`
- "Minha carteira está concentrada?" — consome `risk-engine`

---

## 20. DATA FRESHNESS

Cotações têm cache (5min cripto, 60min ações). Mostrar "Cotação atualizada em..." no detail do ativo quando relevante.

Valores da carteira são calculados no momento do carregamento. Se `currentPrice` é manual (não veio de API), não mostrar indicador de freshness.

---

## 21. EMPTY STATE

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
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
│   Importar B3 · Importar corretora                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 22. COMPLEXITY BUDGET

| Limite | Valor |
|--------|:-----:|
| Tabs | **3** (Visão Geral, Carteira, Análise) |
| Summary KPIs | **1 protagonista** (financial-hero 36px) + 2 métricas de contexto |
| Barras de alocação | ≤5 classes |
| Top ativos | 3-5 |
| Insights | 0-5 (rule-based) |
| Health pillars | 5 |
| Ação primária | 1 ("Adicionar investimento") |
| Ações secundárias | 1-2 ("Importar B3", "Importar corretora") |
| Gráfico principal | 1 (alocação na Visão Geral, health na Análise) |
| Cotações em tempo real | NÃO na visão principal. Sob demanda no detail. |

---

## 23. CONTEXTO PF / FAMÍLIA / PJ

| Contexto | Status |
|----------|:------:|
| PF | ✅ IMPLEMENTADO |
| Família | ❌ NÃO IMPLEMENTADO |
| PJ | ❌ NÃO IMPLEMENTADO |

---

## 24. CAPABILITY MATRIX

| Capacidade | Backend | Engine | UI Atual | Mobile UX | Gap |
|------------|:-------:|:------:|:--------:|:---------:|-----|
| Valor atual | ✅ consolidate | ✅ portfolio | ✅ 4 KPIs | ✅ Summary | Nenhum |
| Rentabilidade | ✅ consolidate | ✅ performance | ✅ KPI card | ✅ Summary | Nenhum |
| Alocação | ✅ consolidate | ✅ allocation | ✅ 3 PieCharts | ✅ Barras horiz. | Adaptar |
| Health Score | ✅ analytics | ✅ health-score | ✅ Tab Análise | ✅ Tab Análise | Nenhum |
| Insights | ✅ analytics | ✅ insights-engine | ✅ Tab Análise | ✅ Tab Análise | Nenhum |
| Dividendos | ✅ yields coll | ✅ dividend | ✅ Tab Yields | ✅ Tab Análise | Merge |
| CRUD investimento | ✅ investments | — | ✅ Dialog | ✅ Bottom Sheet | Adaptar |
| CRUD provento | ✅ yields | — | ✅ Dialog | ✅ Bottom Sheet | Nenhum |
| Importação B3 | ✅ b3-inv | — | ✅ Tab B3 | ✅ Ação sec. | Mover |
| Importação corretora | ✅ broker-inv | — | ✅ Import flow | ✅ Ação sec. | Mover |
| Cotação online | ✅ lookup | ✅ BRAPI/Binance | ✅ Market watch | ✅ Detail (sob demanda) | Mover |
| Sugestão aporte | ✅ hook | ✅ use-aporte | ✅ Tab Aportes | ✅ Domus/Detail | Mover |
| Domus contextual | ❌ | ❌ | ❌ | ✅ Header | CRIAR |
| Família | ❌ | ❌ | ❌ | — | ENGINE |
| PJ | ❌ | ❌ | ❌ | — | ENGINE |

---

## 25. CURRENT → MOBILE MAP

| Desktop (10 tabs) | Mobile (3 tabs) | Ação |
|--------------------|-----------------|------|
| Consolidação (PieCharts + Table) | Visão Geral (barras alocação + top ativos) | MERGE |
| Ativos (lista) | Carteira (lista + search + filter) | KEEP |
| Análise (health + insights) | Análise (health + insights + dividendos) | MERGE |
| Yields (dividendos) | Análise (seção dividendos) | MERGE |
| B3 Dashboard | Ação secundária na Visão Geral | MOVE |
| Market Watch | Detail do ativo (sob demanda) | MOVE |
| Aportes (sugestões) | Domus contextual ou Detail | MOVE |
| Goals (placeholder) | — | HIDE |
| Questions (placeholder) | Domus cobre | HIDE |
| Portfolio Chart (isolado) | Visão Geral (alocação) | MERGE |
| Evolução Patrimonial | Análise | MERGE |
| 4 KPI Cards | 1 Summary superfície | MERGE |

---

## 26. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**INVEST-P0: 0 · INVEST-P1: 0 · INVEST-P2: 2 · INVEST-P3: 2**

### INVEST-P2

| ID | Descrição |
|----|-----------|
| P2-01 | 10 tabs desktop → 3 tabs mobile. Consolidar consolidação + ativos + análise em 3 tabs. |
| P2-02 | Domus contextual: ícone no header precisa ser implementado. |

### INVEST-P3

| ID | Descrição |
|----|-----------|
| P3-01 | Contexto Família e PJ não implementados. |
| P3-02 | Market Watch (cotações em tempo real) movido para detail. Não na visão principal. |

---

## 27. CHANGE REQUESTS

Nenhum. A arquitetura é compatível com todos os contratos homologados.

---

## 28. RECOMENDAÇÃO FINAL

O Investimentos Mobile reduz 10 tabs desktop para 3 tabs com densidade Standard, mantendo todas as capacidades analíticas dos 6 engines. O protagonista é o valor atual da carteira (financial-hero 36px). Cotações em tempo real são acessadas sob demanda, não na visão principal — preservando a identidade FinDomus de gestão financeira, não de corretora.

**Próximo passo:** Com INVEST-P0 = 0 e INVEST-P1 = 0:

→ **INVESTIMENTOS MOBILE WIREFRAME v1**

---

*FinDomus Investimentos Mobile Architecture v1 · Fase 13 concluída · Aguardando homologação*
