# FINDOMUS — FINANCIAL CORE CONSOLIDATION AUDIT v1

**Fase:** 20.3 — Consolidation Audit
**FDL:** 1.0 FROZEN
**Motivacao:** Estabelecer Source of Truth oficial antes de qualquer correcao
**Status:** AUDITADO

---

## 1. RESUMO EXECUTIVO

O FinDomus possui **6 implementacoes distintas** do conceito de "saldo total de contas" (`cashBalance`), **3 implementacoes** de `netWorth`, **3 implementacoes** de `investmentValue`, e **3 implementacoes** de `activeLiabilityBalance`. Apenas uma delas — `calculateFinancialCore()` em `financial-core.ts` — e consumida pelo Kernel e pelo Freedom Index. As demais sao calculos independentes implementados no Dashboard, nos Snapshots e na pagina Contas, cada um com regras de filtro e agregacao ligeiramente diferentes.

### Diagnostico

```
Existe 1 Source of Truth oficial?  NÃO.
Existem múltiplos cálculos?       SIM — 6 cashBalance, 3 netWorth, 3 investmentValue.
O Kernel centraliza?              SIM — mas outros componentes ignoram o Kernel.
As regras são consistentes?       NÃO — filtros de owner, type, e active divergem.
```

### Veredito

**Arquitetura parcialmente consolidada.** O `calculateFinancialCore()` e o calculo canonico e e usado pelo Kernel → Freedom Index → Home/Domus. Mas Dashboard, Snapshots e pagina Contas implementam seus proprios calculos, criando divergencia de resultados e dificultando manutencao.

---

## 2. MAPA DOS CALCULOS

### 2.1 cashBalance / saldo total de contas

| # | Arquivo:linha | Funcao/Contexto | Filtro | Tipo de calculo |
|---|:------------:|-----------------|--------|:--------------:|
| 1 | `financial-core.ts:71-73` | `calculateFinancialCore()` | `owner !== "PJ"` | **CANONICO** |
| 2 | `dashboard-real.ts:126-134` | `getDashboardReal()` | `owner === 'PF'` + `owner === 'PJ'` separados | **DUPLICADO** |
| 3 | `dashboard-snapshot-builder.ts:98-99` | `buildDashboardSnapshot()` | `owner === 'PF'` + `owner === 'PJ'` separados | **DUPLICADO** |
| 4 | `dashboard.admin.ts:15-21` | `getDashboardAdmin()` | `owner === 'PF'` + `owner === 'PJ'` separados | **DUPLICADO** |
| 5 | `snapshot-engine.ts:39-41` | `buildMonthlySnapshot()` | NENHUM (todas as contas) | **DUPLICADO** |
| 6 | `contas/page.tsx:110` | `ContasPage` | NENHUM (todas as contas) | **DUPLICADO** |

**Divergencias:**
- `financial-core.ts` exclui PJ do cashBalance. Dashboard separa em totalPF/totalPJ.
- `snapshot-engine.ts` e `contas/page.tsx` nao filtram por owner.
- NENHUM filtra por tipo (`LIQUID_ACCOUNT_TYPES`).

### 2.2 netWorth / patrimonio liquido

| # | Arquivo:linha | Funcao | Formula | Tipo |
|---|:------------:|--------|---------|:----:|
| 1 | `financial-core.ts:97-98` | `calculateFinancialCore()` | `cashBalance + investmentValue - activeLiabilityBalance` | **CANONICO** |
| 2 | `dashboard-real.ts:159` | `getDashboardReal()` | `totalAccounts + totalInvestments - totalLiabilities` | **DUPLICADO** |
| 3 | `dashboard-snapshot-builder.ts:110` | `buildDashboardSnapshot()` | `(totalPF + totalPJ + totalInvestments) - totalLiabilities` | **DUPLICADO** |
| 4 | `snapshot-engine.ts:71` | `buildMonthlySnapshot()` | `accountBalance - liabilitiesBalance` | **DUPLICADO** |

**Divergencias:**
- `snapshot-engine.ts` NAO inclui investments no netWorth.
- `dashboard-real.ts` e `snapshot-builder.ts` usam `totalLiabilities` com filtro diferente do `activeLiabilityBalance` canonico.
- `financial-core.ts` filtra liabilities ativas (`currentInstallment < totalInstallments`). Dashboard filtra apenas `remainingBalance > 0`.

### 2.3 investmentValue / total de investimentos

| # | Arquivo:linha | Funcao | Como calcula | Tipo |
|---|:------------:|--------|-------------|:----:|
| 1 | `financial-core.ts:75-78` | `calculateFinancialCore()` | `investments.reduce(getInvestmentCurrentValue)` | **CANONICO** |
| 2 | `dashboard-real.ts:139-147` | `getDashboardReal()` | `investments.reduce` (prefere currentValue, fallback quantity*price) | **DUPLICADO** |
| 3 | `dashboard-snapshot-builder.ts:101-105` | `buildDashboardSnapshot()` | `investments.reduce` (prefere currentValue, fallback quantity*price) | **DUPLICADO** |

**Divergencias:**
- `financial-core.ts` usa `getInvestmentCurrentValue()` que prefere `quantity * currentPrice` sobre `currentValue`.
- Dashboard e Snapshot preferem `currentValue` sobre `quantity * currentPrice`.
- **Ordem de precedencia invertida entre canonico e duplicados.**

### 2.4 activeLiabilityBalance / total de passivos

| # | Arquivo:linha | Funcao | Filtro | Tipo |
|---|:------------:|--------|--------|:----:|
| 1 | `financial-core.ts:85-89` | `calculateFinancialCore()` | `totalInstallments > 0 && current < total && balance > 0` | **CANONICO** |
| 2 | `dashboard-real.ts:149-157` | `getDashboardReal()` | `remainingBalance > 0` apenas | **DUPLICADO** |
| 3 | `dashboard-snapshot-builder.ts:107-108` | `buildDashboardSnapshot()` | `remainingBalance > 0` apenas | **DUPLICADO** |
| 4 | `snapshot-engine.ts:43-45` | `buildMonthlySnapshot()` | NENHUM (campo `remainingAmount` diferente) | **DUPLICADO** |

**Divergencias:**
- Canonico verifica se o passivo esta ativo (installments nao concluidos). Duplicados verificam apenas saldo > 0.
- `snapshot-engine.ts` usa campo `remainingAmount` em vez de `remainingBalance`.

### 2.5 wealthScore

| # | Arquivo:linha | Funcao | Tipo |
|---|:------------:|--------|:----:|
| 1 | `financial-core.ts:111-123` | `calculateFinancialCore()` | **CANONICO** |

**Sem duplicacao.** Unico componente que calcula wealthScore. Consumido por Freedom Index como `core.wealthScore`.

### 2.6 debtRatio

| # | Arquivo:linha | Funcao | Tipo |
|---|:------------:|--------|:----:|
| 1 | `financial-core.ts:100-101` | `calculateFinancialCore()` | **CANONICO** |

**Sem duplicacao.**

---

## 3. SOURCE OF TRUTH AUDIT

### 3.1 Existe um unico Source of Truth?

**NAO.** O sistema possui:

- **1 calculo canonico** (`calculateFinancialCore()`) usado pelo Kernel, Freedom Index, Freedom Timeline, Planning Snapshot, Simulation Engine, Auto Plan Generator, AI Advisor, e Academy.
- **4 calculos independentes** (`getDashboardReal()`, `buildDashboardSnapshot()`, `getDashboardAdmin()`, `buildMonthlySnapshot()`) que replicam a mesma logica com variacoes.
- **1 calculo local** (`contas/page.tsx`) para a UI da pagina Contas.

### 3.2 Classificacao: PARCIALMENTE DUPLICADO

```
CANONICO (1):      calculateFinancialCore()         ← Consumido por Kernel
DUPLICADOS (4):    Dashboard, Snapshots, Admin      ← Regras similares, implementacoes proprias
LOCAL (1):         contas/page.tsx                  ← Escopo de UI, justificavel
```

### 3.3 Quem consome o que

| Consumidor | Usa `calculateFinancialCore()`? | Ou calcula proprio? |
|------------|:-------------------------------:|:-------------------:|
| Kernel | ✅ Sim (linha 127) | — |
| Freedom Index | ✅ Via `core = calculateFinancialCore()` | — |
| Freedom Timeline | ✅ Via `core = calculateFinancialCore()` | — |
| Emergency Reserve | ❌ Calcula proprio (usa LIQUID_ACCOUNT_TYPES) | `calculateEmergencyReserve()` |
| Planning Snapshot | ✅ Via `kernelResult.financialCore` | — |
| Simulation Engine | ✅ Via `before.financialCore` | — |
| Auto Plan Generator | ✅ Via `kernelResult.financialCore` | — |
| AI Advisor | ✅ Via `kernelResult.financialCore` | — |
| Academy | ✅ Via metricas do Kernel | — |
| **Dashboard** | ❌ **NAO** | `getDashboardReal()` recalcula |
| **Dashboard Snapshot** | ⚠️ Parcial: chama Kernel mas recalcula netWorth | `buildDashboardSnapshot()` |
| **Dashboard Admin** | ❌ **NAO** | `getDashboardAdmin()` recalcula |
| **Snapshot Engine** | ❌ **NAO** | `buildMonthlySnapshot()` recalcula |
| **Contas (pagina)** | ❌ **NAO** | `page.tsx:110` recalcula |

---

## 4. RESPONSABILIDADES POR COMPONENTE

| Componente | Calcula? | Consome? | Transforma? | Replica? | Persiste? | Apresenta? |
|------------|:--------:|:--------:|:-----------:|:--------:|:---------:|:----------:|
| **Financial Core** | ✅ SIM | ❌ | — | — | ❌ | ❌ |
| **Kernel** | ❌ | ✅ (orquestra) | ❌ | ❌ | ❌ (cache) | ❌ |
| **Freedom Engine** | ❌ | ✅ (consome Core) | ✅ (deriva FI) | ❌ | ❌ | ❌ |
| **Emergency Reserve** | ✅ (calculo proprio) | ✅ (consome accounts) | ❌ | ❌ | ❌ | ❌ |
| **Dashboard** | ✅ **RECALCULA** | ❌ (ignora Core) | ❌ | ✅ **REPLICA** | ❌ | ✅ |
| **Dashboard Snapshot** | ✅ **RECALCULA parcial** | ✅ (Kernel para FI) | ❌ | ✅ **REPLICA netWorth** | ✅ (snapshot) | ❌ |
| **Dashboard Admin** | ✅ **RECALCULA** | ❌ | ❌ | ✅ **REPLICA** | ❌ | ✅ |
| **Snapshot Engine** | ✅ **RECALCULA** | ❌ | ❌ | ✅ **REPLICA** | ✅ (closure) | ❌ |
| **Planning Snapshot** | ❌ | ✅ (consome Core) | ❌ | ❌ | ✅ (snapshot) | ❌ |
| **Simulation Engine** | ❌ | ✅ (consome Core) | ✅ (gera cenarios) | ❌ | ❌ | ❌ |
| **Auto Plan Generator** | ❌ | ✅ (consome Core via Kernel) | ❌ | ❌ | ❌ | ❌ |
| **AI Advisor** | ❌ | ✅ (consome Core via Kernel) | ❌ | ❌ | ❌ | ❌ |
| **Academy** | ❌ | ✅ (consome metricas) | ❌ | ❌ | ❌ | ❌ |
| **Contas (pagina)** | ✅ (totalBalance local) | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Home** | ❌ | ✅ (consome Kernel ← Core) | ❌ | ❌ | ❌ | ✅ |
| **Domus** | ❌ | ✅ (consome AI ← Kernel ← Core) | ❌ | ❌ | ❌ | ✅ |

---

## 5. DOMINIOS

### 5.1 Separacao proposta

```
┌─────────────────────────────────────────────────┐
│ FINANCIAL CORE (src/core/finance/)               │
│ Dono das regras de negocio financeiras.          │
│                                                  │
│ calculateFinancialCore()                         │
│   ├── cashBalance                                │
│   ├── investmentValue                            │
│   ├── grossAssets                                │
│   ├── netWorth                                   │
│   ├── activeLiabilityBalance                     │
│   ├── debtRatio                                  │
│   ├── wealthScore                                │
│   └── recommendation                             │
│                                                  │
│ calculateEmergencyReserve()                       │
│   ├── reserveAmount                              │
│   ├── coveredMonths                              │
│   └── reservePercent                             │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ KERNEL (src/core/finance/kernel.ts)              │
│ Orquestrador. Agrega, cacheia, distribui.        │
│                                                  │
│ runFinancialKernel()                             │
│   ├── buildPFDRE()                               │
│   ├── calculateFinancialCore()  ← consome        │
│   ├── buildMonthlyProjection()                   │
│   ├── buildForecast()                            │
│   ├── buildPFWealthAnalysis()                    │
│   ├── calculateFreedomIndex()  ← consome Core    │
│   ├── calculateFreedomTimeline() ← consome Core  │
│   ├── generateActionPlan()                       │
│   ├── calculateEmergencyReserve()                │
│   └── getFinancialAIInsights()                   │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ PRESENTATION │ │ PLANNING │ │ AI           │
│              │ │          │ │              │
│ Home         │ │ Planning │ │ AI Advisor   │
│ Dashboard    │ │ Snapshot │ │ Domus        │
│ Contas       │ │ AutoPlan │ │              │
│ Domus (UI)   │ │          │ │              │
└──────────────┘ └──────────┘ └──────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────┐
│ PERSISTENCE (src/services/firestore/)            │
│ Leitura e escrita de dados.                     │
│ NAO contem regras de negocio.                   │
│                                                  │
│ kernel.admin.ts    — salva kernelResult          │
│ dashboard.admin.ts — admin dashboard (recalcula) │
│ monthly-closures.ts — fecha competencia          │
└─────────────────────────────────────────────────┘
```

### 5.2 Violacao de dominio

**`dashboard.admin.ts` recalcula `totalPF`/`totalPJ`** em vez de consumir `calculateFinancialCore()`. Isso coloca regra de negocio na camada de persistencia.

---

## 6. DUPLICACAO DE LOGICA

### 6.1 netWorth — 4 implementacoes

| # | Local | Necessario? | Deveria reutilizar? |
|---|-------|:-----------:|:-------------------:|
| 1 | `financial-core.ts:98` | ✅ Canonico | — |
| 2 | `dashboard-real.ts:159` | ❌ Duplicado | ✅ Deveria consumir Core |
| 3 | `dashboard-snapshot-builder.ts:110` | ❌ Duplicado | ✅ Deveria consumir Core |
| 4 | `snapshot-engine.ts:71` | ⚠️ Justificavel? | ⚠️ Contexto diferente (mensal, sem investments) |

### 6.2 cashBalance — 6 implementacoes

| # | Local | Necessario? | Deveria reutilizar? |
|---|-------|:-----------:|:-------------------:|
| 1 | `financial-core.ts:71-73` | ✅ Canonico | — |
| 2 | `dashboard-real.ts:126-134` | ❌ Duplicado | ✅ Deveria consumir Core |
| 3 | `dashboard-snapshot-builder.ts:98-99` | ❌ Duplicado | ✅ Deveria consumir Core |
| 4 | `dashboard.admin.ts:15-21` | ❌ Duplicado | ✅ Deveria consumir Core |
| 5 | `snapshot-engine.ts:39-41` | ⚠️ Justificavel | ⚠️ Escopo mensal, todas as contas |
| 6 | `contas/page.tsx:110` | ✅ Justificavel | ❌ Escopo de UI local |

### 6.3 investmentValue — 3 implementacoes

| # | Local | Necessario? | Deveria reutilizar? |
|---|-------|:-----------:|:-------------------:|
| 1 | `financial-core.ts:75-78` | ✅ Canonico | — |
| 2 | `dashboard-real.ts:139-147` | ❌ Duplicado | ✅ Deveria consumir Core |
| 3 | `dashboard-snapshot-builder.ts:101-105` | ❌ Duplicado | ✅ Deveria consumir Core |

### 6.4 activeLiabilityBalance — 4 implementacoes

| # | Local | Necessario? | Deveria reutilizar? |
|---|-------|:-----------:|:-------------------:|
| 1 | `financial-core.ts:85-89` | ✅ Canonico | — |
| 2 | `dashboard-real.ts:149-157` | ❌ Duplicado | ✅ Deveria consumir Core |
| 3 | `dashboard-snapshot-builder.ts:107-108` | ❌ Duplicado | ✅ Deveria consumir Core |
| 4 | `snapshot-engine.ts:43-45` | ⚠️ Justificavel | ⚠️ Campo diferente (remainingAmount) |

---

## 7. FINANCIAL CORE CONTRACT

### 7.1 Responsabilidades atuais

`calculateFinancialCore()` e responsavel por **7 metricas financeiras**:

```
financial-core.ts:66-158
│
├── cashBalance            (linha 71-73)
├── investmentValue         (linha 75-78)
├── investedAmount          (linha 80-83)
├── activeLiabilityBalance  (linha 85-89)
├── monthlyDebtPayment      (linha 92-95)
├── grossAssets             (linha 97)
├── netWorth                (linha 98)
├── debtRatio               (linha 100-101)
├── investmentProfit        (linha 103)
├── investmentProfitPercent (linha 105-106)
├── diversificationScore    (linha 108-109)
├── wealthScore             (linha 111-123)
├── wealthStatus            (linha 125-132)
└── recommendation          (linha 134-141)
```

### 7.2 Contrato proposto

`calculateFinancialCore()` deve ser o **unico calculo autorizado** de:

| Metrica | Responsabilidade |
|---------|:---------------:|
| `cashBalance` | ✅ Financial Core |
| `investmentValue` | ✅ Financial Core |
| `grossAssets` | ✅ Financial Core |
| `netWorth` | ✅ Financial Core |
| `activeLiabilityBalance` | ✅ Financial Core |
| `debtRatio` | ✅ Financial Core |
| `wealthScore` | ✅ Financial Core |
| `wealthStatus` | ✅ Financial Core |
| `recommendation` | ✅ Financial Core |

### 7.3 O que NAO e responsabilidade do Financial Core

| Metrica | Dono |
|---------|------|
| `reserveAmount` | `calculateEmergencyReserve()` |
| `freedomIndex` | `calculateFreedomIndex()` |
| `monthlyBalance` | DRE |
| `forecast` | `buildForecast()` |

---

## 8. KERNEL CONTRACT

### 8.1 O Kernel:

| Pergunta | Resposta | Evidencia |
|----------|----------|:---------:|
| Calcula? | **NAO** — delegou todos os calculos para engines especializadas | `kernel.ts:127-131` chama `calculateFinancialCore()`, nao recalcula |
| Orquestra? | **SIM** — coordena 7 engines em sequencia | `kernel.ts:82-271` |
| Agrega? | **SIM** — junta resultados em `KernelResult` | `kernel.ts:257-270` |
| Distribui? | **SIM** — retorna resultado unificado para consumers | Home, Dashboard, Planning, AI |
| Cacheia? | **SIM** — `KernelCache` com hash-based invalidation | `kernel.ts:56-78` |

### 8.2 O Kernel e o unico ponto de entrada para calculos financeiros

```
Nenhum componente de Presentation/AI/Planning deve contornar o Kernel.
Todos devem consumir kernelResult.financialCore para metricas financeiras.
```

**Violacao atual:** Dashboard e Snapshots contornam o Kernel e recalculam metricas.

---

## 9. DASHBOARD CONTRACT

### 9.1 Dashboard deveria:

| Pergunta | Resposta |
|----------|----------|
| Calcular? | **NAO.** As regras de negocio pertencem ao Financial Core. |
| Ou consumir Financial Core? | **SIM.** Deveria usar `kernelResult.financialCore`. |

### 9.2 Evidencia arquitetural

O Kernel ja e chamado em `buildDashboardSnapshot()` (linha 122-133) para obter `freedomIndex`, `freedomLevel`, e `freedomBreakdown`. Mas as metricas `totalPF`, `totalPJ`, `totalInvestments`, `totalLiabilities` e `netWorth` sao **recalculadas manualmente** nas linhas 98-110 em vez de extraidas de `kernelResult.financialCore`.

```
// dashboard-snapshot-builder.ts
const kernelResult = runFinancialKernel({...});       // linha 122 ← Kernel disponivel!
// ...
const netWorth = (totalPF + totalPJ + totalInvestments) - totalLiabilities;  // linha 110 ← RECALCULO DESNECESSARIO
// kernelResult.financialCore.netWorth ← IGNORADO
```

### 9.3 `getDashboardReal()` — pior caso

`getDashboardReal()` em `dashboard-real.ts` **nem sequer chama o Kernel ou o Financial Core**. Reimplementa todos os calculos manualmente. Nao ha justificativa arquitetal para isso.

---

## 10. SNAPSHOT CONTRACT

### 10.1 Snapshot deve salvar:

| Opcao | Vantagens | Riscos |
|-------|-----------|--------|
| **Valores prontos** (do Kernel) | Consistencia, rastreabilidade, imutabilidade historica | Se o Kernel mudar, snapshots antigos ficam com "versao antiga" da formula |
| **Recalcular** | Sempre usa a formula mais recente | Inconsistencia historica, 2 versoes do mesmo periodo podem ter valores diferentes |

### 10.2 Recomendacao

Salvar valores prontos do Kernel com `kernelVersion` no snapshot. Isso garante:
- Consistencia: o snapshot de jul/2026 sempre tera o mesmo netWorth.
- Rastreabilidade: sabe-se qual versao do Kernel gerou o snapshot.
- Performance: nao recalcula sob demanda.

---

## 11. FREEDOM ENGINE CONTRACT

### 11.1 Freedom Engine deve:

| Pergunta | Resposta | Evidencia |
|----------|----------|:---------:|
| Consumir Financial Core? | **SIM** — ja faz isso | `freedom-engine.ts:95-99` chama `calculateFinancialCore()` |
| Ou recalcular patrimonio? | **NAO** — ja consome Core | Usa `core.cashBalance`, `core.netWorth`, `core.investmentValue` |

**Freedom Engine e o exemplo correto de consumo.** Ele NAO recalcula cashBalance nem netWorth — confia no Financial Core.

---

## 12. AI CONTRACT

### 12.1 AI Advisor deve consumir:

**Resposta: Kernel.**

```typescript
// financial-advisor.ts
// Recebe kernelResult como parametro
netWorth: d.netWorth,                                    // ← do snapshot/dashboard
cashBalance: p?.financialCore.cashBalance ?? d.totalPF + d.totalPJ,  // ← fallback para dashboard
```

O AI Advisor ja consome `financialCore.cashBalance` com fallback para `d.totalPF + d.totalPJ` (dashboard). Isso mostra que o codigo reconhece a duplicacao — tem um fallback porque sabe que `financialCore` pode nao estar disponivel.

**Recomendacao:** Remover o fallback. AI Advisor deve confiar apenas no `financialCore.cashBalance`.

---

## 13. OWNERSHIP MATRIX

| Conceito | Dono Oficial | Implementacao | Alternativas (a remover) |
|----------|:------------:|---------------|--------------------------|
| `cashBalance` | `calculateFinancialCore()` | `financial-core.ts:71-73` | dashboard-real, dashboard-snapshot, dashboard-admin, snapshot-engine |
| `grossAssets` | `calculateFinancialCore()` | `financial-core.ts:97` | dashboard-real (totalAssets) |
| `netWorth` | `calculateFinancialCore()` | `financial-core.ts:98` | dashboard-real, dashboard-snapshot, snapshot-engine |
| `investmentValue` | `calculateFinancialCore()` | `financial-core.ts:75-78` | dashboard-real, dashboard-snapshot |
| `activeLiabilityBalance` | `calculateFinancialCore()` | `financial-core.ts:85-89` | dashboard-real, dashboard-snapshot |
| `wealthScore` | `calculateFinancialCore()` | `financial-core.ts:111-123` | — (sem duplicacao) |
| `debtRatio` | `calculateFinancialCore()` | `financial-core.ts:100-101` | — (sem duplicacao) |
| `Freedom Index` | `calculateFreedomIndex()` | `freedom-engine.ts:80` | — (sem duplicacao) |
| `Emergency Reserve` | `calculateEmergencyReserve()` | `financial-core.ts:183` | — (sem duplicacao) |
| `Planning Snapshot` | `runFinancialKernel()` → snapshot | `planning-snapshot-builder.ts` | — (ja consome Core) |
| `Dashboard` | Deveria ser `calculateFinancialCore()` | Hoje: `getDashboardReal()` recalcula | dashboard-real.ts |

---

## 14. DEPENDENCY GRAPH

```
                    ┌──────────────────────┐
                    │   Firestore Data      │
                    │  accounts[]           │
                    │  investments[]        │
                    │  liabilities[]        │
                    │  transactions[]       │
                    └──────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
   ┌────────────────┐ ┌──────────────┐ ┌─────────────────┐
   │ calculate      │ │ getDashboard │ │ buildMonthly    │
   │ FinancialCore  │ │ Real         │ │ Snapshot        │
   │                │ │ (RECALCULA)  │ │ (RECALCULA)     │
   │ ✅ CANONICO    │ │ ❌ DUPLICADO │ │ ⚠️ PARCIAL      │
   └───────┬────────┘ └──────┬───────┘ └────────┬────────┘
           │                 │                  │
           ▼                 ▼                  ▼
   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐
   │ Kernel       │  │ Dashboard UI │  │ Monthly        │
   │ (orquestra)  │  │ (apresenta)  │  │ Closures       │
   └──────┬───────┘  └──────────────┘  └────────────────┘
          │
    ┌─────┼─────────┬──────────┬──────────┐
    ▼     ▼         ▼          ▼          ▼
  Home  Freedom  Planning   AI Advisor  Academy
  (UI)  Index    Snapshot   (Domus)     (Achiev.)
```

**Problema:** Dashboard e Snapshot contornam o Financial Core e calculam metricas independentemente. Isso cria **2 fluxos paralelos** de calculo financeiro que podem divergir.

---

## 15. VIOLACOES DE ARQUITETURA

| ID | Violacao | Componentes | Classificacao |
|----|----------|-------------|:------------:|
| V-01 | **netWorth em 4 locais** com regras diferentes | Core, Dashboard, Snapshot, Snapshot Engine | **P0** |
| V-02 | **cashBalance em 6 locais** com filtros diferentes | Core, Dashboard, Snapshot, Admin, Snapshot Engine, Contas | **P0** |
| V-03 | **investmentValue em 3 locais** com ordem de precedencia invertida | Core (qty*price first), Dashboard (currentValue first) | **P1** |
| V-04 | **activeLiabilityBalance em 4 locais** com criterios de ativo divergentes | Core (3 checks), Dashboard (1 check) | **P1** |
| V-05 | **Dashboard ignora Kernel** — recalcula metricas que o Kernel ja calculou | `dashboard-real.ts`, `dashboard-snapshot-builder.ts` | **P0** |
| V-06 | **Regra de negocio na camada de persistencia** | `dashboard.admin.ts` recalcula totalPF/totalPJ | **P2** |
| V-07 | **Snapshot mensal sem investments** — netWorth incompleto | `snapshot-engine.ts:71` | **P1** |
| V-08 | **LIQUID_ACCOUNT_TYPES nao usado em cashBalance** | `financial-core.ts:71 vs 161` | **P1** |
| V-09 | **AI Advisor com fallback para dashboard** — reconhece duplicacao | `financial-advisor.ts:68` | **P2** |

---

## 16. CONSOLIDACAO

### 16.1 E possivel consolidar todos os calculos em Financial Core?

**SIM, com 2 excecoes legitimas:**

| Excecao | Justificativa |
|---------|--------------|
| `snapshot-engine.ts` (monthly closures) | Contexto diferente: fecha um mes especifico. Usa apenas accounts + liabilities do periodo. Nao inclui investments porque o snapshot e um registro contabil, nao de portfolio. |
| `contas/page.tsx` (UI local) | Escopo de UI. Mostra saldo de contas cadastradas — um subconjunto do cashBalance. Pode ser mantido como `localTotalBalance` sem usar Financial Core. |

### 16.2 Tudo o mais deve consumir Financial Core via Kernel

```
Dashboard        → kernelResult.financialCore
Dashboard Admin  → kernelResult.financialCore
Planning         → kernelResult.financialCore (ja consome)
AI Advisor       → kernelResult.financialCore (remover fallback)
Home             → kernelResult.financialCore (ja consome)
Domus            → kernelResult.financialCore (ja consome)
```

---

## 17. PERFORMANCE

### 17.1 Centralizar calculos:

| Aspecto | Impacto |
|---------|:-------:|
| Performance | **NEUTRO.** O Kernel ja calcula `calculateFinancialCore()` uma vez e distribui o resultado. Dashboard recalcular e trabalho desperdicado. |
| Cache | **MELHORA.** KernelCache ja existe. Dashboard recalcular ignora o cache. |
| Consistencia | **MELHORA.** Um unico calculo garante que todos os componentes veem o mesmo numero. |
| Manutencao | **MELHORA.** Mudanca na regra de negocio afeta 1 arquivo, nao 6. |

---

## 18. TESTABILIDADE

### 18.1 Uma arquitetura centralizada:

| Aspecto | Impacto |
|---------|:-------:|
| Testes unitarios | **MELHORA.** Testa `calculateFinancialCore()` uma vez. Nao precisa testar 6 implementacoes da mesma regra. |
| Testes de integracao | **MELHORA.** Menos caminhos de codigo para validar. |
| Confiabilidade | **MELHORA.** Sem divergencia entre Dashboard e Home. |
| Auditoria | **MELHORA.** Um unico ponto para rastrear calculos financeiros. |

---

## 19. ROADMAP DE CONSOLIDACAO

### Fase A — Consagrar o Canon (sem alterar codigo)

1. Declarar `calculateFinancialCore()` como **Source of Truth oficial**.
2. Declarar `runFinancialKernel()` como **unico ponto de entrada** para componentes de Presentation, Planning e AI.
3. Documentar `snapshot-engine.ts` e `contas/page.tsx` como excecoes legitimas.

### Fase B — Corrigir Financial Core (FIN-ARCH-CR-01)

1. Adicionar filtro `LIQUID_ACCOUNT_TYPES` ao `cashBalance` (excluir `investment` e `credit_card`).
2. Exportar `LIQUID_ACCOUNT_TYPES` para reuso.
3. Testar impacto no Kernel, Freedom Index, Freedom Timeline.

### Fase C — Refatorar consumidores

1. `getDashboardReal()` → consumir `kernelResult.financialCore` em vez de recalcular.
2. `buildDashboardSnapshot()` → remover recalculo de netWorth. Usar `kernelResult.financialCore.netWorth`.
3. `getDashboardAdmin()` → consumir `kernelResult.financialCore` ou delegar ao Kernel.
4. `financial-advisor.ts` → remover fallback `d.totalPF + d.totalPJ`. Confiar apenas em `financialCore.cashBalance`.

### Fase D — Migracao de dados legados

1. Auditoria de producao (quantificar investment e credit_card accounts).
2. Snapshot pre-migracao.
3. Dry-run.
4. Migracao.
5. Rollback se necessario.

### Fase E — Remocao de duplicidades

1. Remover calculos redundantes de `dashboard-real.ts`.
2. Remover calculos redundantes de `dashboard-snapshot-builder.ts`.
3. Remover calculos redundantes de `dashboard.admin.ts`.
4. Validar que todos os componentes produzem resultados consistentes.

---

## 20. CHANGE REQUESTS

| ID | Descricao | Prioridade | Fase |
|----|-----------|:----------:|:----:|
| `CORE-ARCH-CR-01` | `calculateFinancialCore()` declarado Source of Truth oficial | **P0** | A |
| `CORE-ARCH-CR-02` | `runFinancialKernel()` declarado unico ponto de entrada para Presentation/AI/Planning | **P0** | A |
| `CORE-ARCH-CR-03` | Dashboard (`getDashboardReal`) deve consumir Kernel, nao recalcular | **P0** | C |
| `CORE-ARCH-CR-04` | Dashboard Snapshot Builder deve consumir Kernel para netWorth/totals | **P0** | C |
| `CORE-ARCH-CR-05` | Dashboard Admin deve consumir Kernel, nao recalcular | **P1** | C |
| `CORE-ARCH-CR-06` | AI Advisor: remover fallback `d.totalPF + d.totalPJ` | **P2** | C |
| `CORE-ARCH-CR-07` | `cashBalance` deve filtrar por `LIQUID_ACCOUNT_TYPES` | **P0** | B |
| `CORE-ARCH-CR-08` | Exportar `LIQUID_ACCOUNT_TYPES` como constante publica | **P2** | B |

---

## 21. VEREDITO FINAL

### Situacao

O FinDomus possui um **nucleo financeiro bem definido** (`calculateFinancialCore()`) que e consumido corretamente pelo Kernel, Freedom Index e componentes downstream (Home, Domus, Planning, AI). Porem, o **Dashboard e os Snapshots ignoram este nucleo** e implementam calculos paralelos com regras ligeiramente diferentes.

### Acao necessaria

**Consolidar.** Todos os componentes de Presentation e Persistence devem consumir `kernelResult.financialCore` em vez de recalcular metricas financeiras. As unicas excecoes legitimas sao `snapshot-engine.ts` (contexto contabil mensal) e `contas/page.tsx` (escopo de UI local).

### Criterio de avanco atendido?

```
✅ Existe um Source of Truth oficial?      SIM — calculateFinancialCore()
✅ Responsabilidades separadas?             SIM — mapeadas neste documento
✅ Sem ambiguidade sobre quem calcula?      SIM — Core calcula, Kernel distribui, UI consome
⚠️ Consolidacao implementada?              NAO — Dashboard e Snapshots ainda recalculam
```

**Recomendacao:** Prosseguir com `CORE-ARCH-CR-01` a `CORE-ARCH-CR-08` antes de implementar `FIN-ARCH-CR-01` a `FIN-ARCH-CR-06`. A consolidacao arquitetural e pre-requisito para a correcao de bugs financeiros.

---

*FinDomus Financial Core Consolidation Audit v1 · Fase 20.3 · AUDITADO*

---

## Apendice A: Tabela de Divergencias

| Metrica | Canonico | Dashboard | Snapshot | Admin |
|---------|----------|:---------:|:--------:|:-----:|
| cashBalance | `owner !== "PJ"` | PF/PJ separados | Sem filtro | PF/PJ separados |
| netWorth | Core formula | Propria | Propria (sem inv.) | — |
| investmentValue | qty*price first | currentValue first | currentValue first | — |
| activeLiabilityBalance | 3 condicoes | 1 condicao | 1 condicao | — |
| grossAssets | Sim | Como totalAssets | — | — |

## Apendice B: Consumidores por tipo

| Tipo | Componentes | Usam Core? |
|------|------------|:----------:|
| **CORRETO** | Kernel, Freedom Index, Freedom Timeline, Planning Snapshot, Simulation Engine, Auto Plan, AI Advisor, Academy, Home, Domus | ✅ Sim |
| **INCORRETO** | Dashboard (real), Dashboard Admin | ❌ Nao |
| **PARCIAL** | Dashboard Snapshot Builder | ⚠️ So para FI |
| **EXCECAO** | Snapshot Engine, Contas (pagina) | ⚠️ Contexto proprio |
