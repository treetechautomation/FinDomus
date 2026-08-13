# FINDOMUS — FINANCIAL CORE CONSOLIDATION IMPLEMENTATION PLAN v1

**Fase:** 20.4 — Consolidation Implementation Plan
**Pré-requisitos:** Fases 20.1, 20.2, 20.3 concluídas
**Status:** PLANEJADO

---

## 1. RESUMO EXECUTIVO

Este documento transforma os 14 Change Requests das auditorias anteriores em **7 CRs consolidados** e **9 patches de implementação sequencial**. Cada patch é pequeno, testável e reversível.

A ordem é ditada por dependências: primeiro os contratos, depois o filtro de liquidez, depois os consumidores. O Desktop (CR-07) é independente e pode ser executado em paralelo.

**Nenhuma linha de código é alterada nesta fase.** Este é o plano que guiará a Fase 20.5.

---

## 2. INVENTÁRIO DE ARQUIVOS AFETADOS

| # | Arquivo | Alteração | Patch |
|---|---------|-----------|:-----:|
| 1 | `src/core/finance/financial-core.ts` | Filtro `LIQUID_ACCOUNT_TYPES` + export | 2, 3 |
| 2 | `src/core/finance/kernel.ts` | Expor métricas canônicas | 4 |
| 3 | `src/core/finance/dashboard-real.ts` | Consumir Kernel | 5 |
| 4 | `src/lib/dashboard-snapshot-builder.ts` | Consumir Kernel + versionar | 6 |
| 5 | `src/services/firestore/dashboard.admin.ts` | Consumir Kernel | 7 |
| 6 | `src/ai/flows/financial-advisor.ts` | Remover fallback | 8 |
| 7 | `src/components/contas/new-account-dialog.tsx` | Remover tipos legados | 9 |
| 8 | `src/components/contas/edit-account-dialog.tsx` | Remover tipos legados | 9 |
| 9 | `src/core/finance/freedom-engine.ts` | Verificar consumo (ja correto) | — * |
| 10 | `src/core/finance/auto-plan-generator.ts` | Verificar (ja consome Kernel) | — * |
| 11 | `src/core/finance/simulation-engine.ts` | Verificar (ja consome Kernel) | — * |
| 12 | `src/lib/planning-snapshot-builder.ts` | Verificar (ja consome Kernel) | — * |
| 13 | `src/services/firestore/kernel.admin.ts` | Verificar (ja consome Kernel) | — * |
| 14 | `src/academy/academy-achievements.ts` | Verificar (ja consome Kernel) | — * |

\* Arquivos marcados com `—` já consomem o Kernel corretamente. Apenas verificação de não-regressão necessária.

---

## 3. SOURCE OF TRUTH CONTRACT (CORE-IMPL-CR-01)

### 3.1 Definição formal

```typescript
/**
 * FINANCIAL CORE — SOURCE OF TRUTH
 *
 * calculateFinancialCore() é o único proprietário autorizado dos seguintes
 * cálculos financeiros canônicos. Nenhum outro componente do sistema pode
 * recalcular estas métricas independentemente.
 *
 * Versão: 1
 * Arquivo: src/core/finance/financial-core.ts
 */
```

### 3.2 Métricas canônicas

| Métrica | Definição | Linha |
|---------|-----------|:-----:|
| `cashBalance` | Σ accounts[owner !== "PJ" && type in LIQUID_ACCOUNT_TYPES].balance | 71-73 |
| `investmentValue` | Σ investments[].currentValue (com fallback quantity×price) | 75-78 |
| `investedAmount` | Σ investments[].contributions | 80-83 |
| `activeLiabilityBalance` | Σ liabilities ativos (installments pendentes).remainingBalance | 85-89 |
| `monthlyDebtPayment` | Σ liabilities ativos.installmentValue | 92-95 |
| `grossAssets` | cashBalance + investmentValue | 97 |
| `netWorth` | grossAssets - activeLiabilityBalance | 98 |
| `debtRatio` | (activeLiabilityBalance / grossAssets) × 100 | 100-101 |
| `investmentProfit` | investmentValue - investedAmount | 103 |
| `investmentProfitPercent` | (investmentProfit / investedAmount) × 100 | 105-106 |
| `diversificationScore` | Score baseado em quantidade de investments | 108-109 |
| `wealthScore` | Score composto 0-100 | 111-123 |
| `wealthStatus` | Label qualitativo | 125-132 |
| `recommendation` | Texto de orientação financeira | 134-141 |

### 3.3 Métricas NÃO canônicas (outros donos)

| Métrica | Dono | Arquivo |
|---------|------|---------|
| `reserveAmount` | `calculateEmergencyReserve()` | `financial-core.ts:183` |
| `freedomIndex` | `calculateFreedomIndex()` | `freedom-engine.ts:80` |
| `monthlyBalance` | `buildPFDRE()` | `dre-engine.ts` |
| `forecast` | `buildForecast()` | `forecast-engine.ts` |

---

## 4. KERNEL CONTRACT (CORE-IMPL-CR-01)

### 4.1 Definição formal

```typescript
/**
 * KERNEL — ORQUESTRADOR OFICIAL
 *
 * runFinancialKernel() é o único ponto de entrada autorizado para componentes
 * de Presentation, Planning, AI e Persistence que precisam de métricas
 * financeiras consolidadas.
 *
 * Nenhum componente de alto nível deve chamar calculateFinancialCore()
 * diretamente — use kernelResult.financialCore.
 *
 * Exceções legítimas documentadas:
 *   - snapshot-engine.ts (contexto contábil mensal)
 *   - contas/page.tsx (escopo de UI local)
 */
```

### 4.2 Entradas

| Campo | Tipo | Fonte |
|-------|------|-------|
| `accounts` | `any[]` | `getAccountsWithBalance(userId)` |
| `investments` | `any[]` | `getInvestments(userId)` |
| `liabilities` | `any[]` | `getLiabilities(userId)` |
| `transactions` | `any[]` | `getTransactionsByMonthList(...)` |
| `recurringExpenses` | `any[]` | Firestore |
| `taxObligations` | `any[]` | Firestore |
| `wealthProfile` | `any` | Firestore |
| `monthlyClosures` | `any[]` | Firestore |
| `investmentAnalytics` | `any` | Analytics engines |

### 4.3 Saídas (KernelResult)

| Campo | Tipo | Fonte |
|-------|------|-------|
| `dre` | `PFDRE` | `buildPFDRE()` |
| `financialCore` | `FinancialCoreResult` | `calculateFinancialCore()` |
| `projections` | `Record<string, number>` | `buildMonthlyProjection()` |
| `forecast` | `any[]` | `buildForecast()` |
| `wealth` | `PFWealthReport` | `buildPFWealthAnalysis()` |
| `freedom.index` | `FreedomIndexResult` | `calculateFreedomIndex()` |
| `freedom.timeline` | `FreedomTimeline` | `calculateFreedomTimeline()` |
| `freedom.actions` | `ActionPlanItem[]` | `generateActionPlan()` |
| `reserve` | `EmergencyReserveResult` | `calculateEmergencyReserve()` |
| `ai` | `any` | `getFinancialAIInsights()` |

### 4.4 Consumidores autorizados

| Componente | Deve chamar Kernel? | Evidência atual |
|------------|:-------------------:|-----------------|
| Home | ✅ Sim | Via server action/loader |
| Dashboard | ✅ Sim (CORRIGIR) | Hoje recalcula |
| Dashboard Snapshot | ✅ Sim (CORRIGIR) | Parcial |
| Dashboard Admin | ✅ Sim (CORRIGIR) | Hoje recalcula |
| Planning Snapshot | ✅ Sim | Já consome |
| AI Advisor | ✅ Sim (CORRIGIR fallback) | Já consome mas com fallback |
| Domus | ✅ Sim | Via AI Advisor |
| Simulation Engine | ✅ Sim | Já consome |
| Auto Plan Generator | ✅ Sim | Já consome |
| Academy | ✅ Sim | Já consome |
| Freedom Engine | ✅ Sim (chama Core via Kernel) | Já consome |

---

## 5. EXCEÇÕES LEGÍTIMAS

### 5.1 `snapshot-engine.ts` — `buildMonthlySnapshot()`

| Pergunta | Resposta |
|----------|----------|
| Por que não usa Kernel? | Contexto contábil mensal. Fecha um período específico com dados daquele mês. Investments não entram no balanço contábil mensal. |
| Escopo específico? | Registro de fechamento mensal (`monthly_closures`). |
| Cálculo local permitido? | `accountBalance - liabilitiesBalance` para o mês. |
| O que não pode replicar? | Não deve recalcular `cashBalance` com regras diferentes do Core. Deve usar o mesmo filtro `LIQUID_ACCOUNT_TYPES` se for somar contas. |

**Ação:** `snapshot-engine.ts:39-41` deve aplicar `LIQUID_ACCOUNT_TYPES` ao somar `accountBalance`, para consistência com o Core.

### 5.2 `contas/page.tsx` — `ContasPage`

| Pergunta | Resposta |
|----------|----------|
| Por que não usa Kernel? | Escopo de UI local. Mostra saldo das contas cadastradas — é um subconjunto informativo, não uma métrica financeira canônica. |
| Escopo específico? | UI do módulo Contas. |
| Cálculo local permitido? | `totalBalance = Σ filteredAccounts.balance` para o contexto ativo. |
| O que não pode replicar? | Não deve ser confundido com `cashBalance`. O label "Saldo em contas" (contexto ativo) é diferente de "cashBalance" (PF líquido). |

**Ação:** Manter como está. A UI do módulo Contas tem seu próprio `localTotalBalance`. A distinção já está documentada.

---

## 6. LIQUID ACCOUNT TYPES CONTRACT (CORE-IMPL-CR-02)

### 6.1 Localização

```typescript
// src/core/finance/financial-core.ts:161
export const LIQUID_ACCOUNT_TYPES = ['checking', 'savings', 'wallet'];
```

### 6.2 Regras de uso

| Componente | Pode importar? | Justificativa |
|------------|:------------:|---------------|
| `calculateFinancialCore()` | ✅ **SIM** | Dono da constante |
| `calculateEmergencyReserve()` | ✅ **SIM** | Já usa |
| `snapshot-engine.ts` | ✅ **SIM** | Exceção legítima, deve alinhar |
| `contas/page.tsx` | ⚠️ **NÃO recomendado** | UI local; se precisar, usar |
| Dashboard | ❌ **NÃO** | Deve consumir Kernel, não a constante |
| Qualquer outro | ❌ **NÃO** | Deve consumir Kernel |

### 6.3 Tratamento de edge cases

| Caso | Comportamento |
|------|--------------|
| `owner` ausente (`undefined`/`null`) | `owner !== "PJ"` → `true`. **Incluído** no cashBalance. |
| `type` ausente | Fallback para `'checking'` (padrão mais seguro). |
| `balance` inválido (`NaN`, `undefined`) | `Number(balance || 0)` → `0`. |
| `balance` negativo | Permitido. Representa conta negativa (ex: cheque especial). |
| Conta PJ | Excluída (`owner === "PJ"`). |
| Registro legado `investment` PF | Excluído (não está em `LIQUID_ACCOUNT_TYPES`). |
| Registro legado `credit_card` PF | Excluído (não está em `LIQUID_ACCOUNT_TYPES`). |

---

## 7. CASHBALANCE CORRECTION CONTRACT

### 7.1 Fórmula corrigida

```typescript
const cashBalance = accounts
  .filter((account) => account.owner !== "PJ")
  .filter((account) => LIQUID_ACCOUNT_TYPES.includes(account.type || 'checking'))
  .reduce((sum, account) => sum + Number(account.balance || 0), 0);
```

### 7.2 Antes vs Depois

| Cenário | Antes (bug) | Depois (corrigido) |
|---------|:-----------:|:------------------:|
| `checking` PF, 5000 | ✅ Incluído | ✅ Incluído |
| `savings` PF, 2000 | ✅ Incluído | ✅ Incluído |
| `wallet` PF, 1000 | ✅ Incluído | ✅ Incluído |
| `investment` PF, 10000 | ❌ Incluído (bug) | ✅ Excluído |
| `credit_card` PF, -2000 | ❌ Incluído (bug) | ✅ Excluído |
| `credit_card` PF, 5000 | ❌ Incluído (bug) | ✅ Excluído |
| `checking` PJ, 50000 | ✅ Excluído (owner PJ) | ✅ Excluído |
| `owner` null, 1000 | ❌ Incluído (bug) | ✅ Incluído (fallback type='checking') |

---

## 8. INVESTMENT VALUE CONTRACT

### 8.1 Cálculo atual (não alterar)

```typescript
const investmentValue = investments.reduce(
  (sum, item) => sum + getInvestmentCurrentValue(item),
  0
);
```

### 8.2 `getInvestmentCurrentValue()` — precedência

```typescript
export function getInvestmentCurrentValue(item: FinancialInvestment) {
  const quantity = Number(item.quantity || 0);
  const currentPrice = Number(item.currentPrice || 0);
  if (quantity > 0 && currentPrice > 0) return quantity * currentPrice;
  return Number(item.currentValue || 0);
}
```

**Precedência:** `quantity × currentPrice` > `currentValue` > `0`.

### 8.3 Edge cases

| Caso | Comportamento |
|------|--------------|
| `currentValue` presente, `quantity`/`price` ausentes | Usa `currentValue` |
| `quantity` e `currentPrice` presentes | Usa `quantity × currentPrice` (ignora `currentValue`) |
| Ambos ausentes | `0` |
| `NaN` | `Number()` converte para `0` |

### 8.4 Separação PF/PJ?

**Não.** `investmentValue` soma todos os investments independentemente de owner. O Financial Core não tem conceito de "investment PJ" vs "investment PF" — investments são ativos do usuário.

---

## 9. LIABILITY CONTRACT

### 9.1 Cálculo atual (não alterar)

```typescript
const activeLiabilities = getActiveLiabilities(liabilities);
const activeLiabilityBalance = activeLiabilities.reduce(
  (sum, item) => sum + Number(item.remainingBalance || 0), 0
);
```

### 9.2 `getActiveLiabilities()` — critério de passivo ativo

```typescript
export function getActiveLiabilities(liabilities: FinancialLiability[] = []) {
  return liabilities.filter((item) => {
    const total = Number(item.totalInstallments || 0);
    const current = Number(item.currentInstallment || 0);
    const balance = Number(item.remainingBalance || 0);
    return total > 0 && current < total && balance > 0;
  });
}
```

**Três condições simultâneas:**
1. `totalInstallments > 0` (existe parcelamento)
2. `currentInstallment < totalInstallments` (não quitado)
3. `remainingBalance > 0` (ainda deve)

---

## 10. NETWORTH CONTRACT

### 10.1 Fórmula canônica

```
grossAssets = cashBalance + investmentValue

netWorth = grossAssets - activeLiabilityBalance
```

### 10.2 Componentes confirmados

| Componente | Incluído? | Evidência |
|------------|:---------:|-----------|
| Contas líquidas PF | ✅ Sim | `cashBalance` |
| Investimentos (entidades) | ✅ Sim | `investmentValue` |
| Passivos ativos | ✅ Subtraído | `activeLiabilityBalance` |
| Contas PJ | ❌ Não | `owner !== "PJ"` |
| Contas não-líquidas (legacy) | ❌ Não | `LIQUID_ACCOUNT_TYPES` (após CR-02) |
| Imóveis | ❌ Não | Não modelado |
| Veículos | ❌ Não | Não modelado |

---

## 11. PLANO DE PATCHES

### Ordem de execução

```
PATCH 1 — Contratos documentais (sem código)
PATCH 2 — Exportar LIQUID_ACCOUNT_TYPES
PATCH 3 — Filtrar cashBalance por liquid types
PATCH 4 — Kernel: expor métricas canônicas
PATCH 5 — Dashboard: consumir Kernel
PATCH 6 — Dashboard Snapshot: consumir Kernel + versionar
PATCH 7 — Dashboard Admin: consumir Kernel
PATCH 8 — AI Advisor: remover fallback
PATCH 9 — Desktop: remover tipos legados (paralelo)
```

---

### PATCH 1 — Contratos documentais

| Campo | Valor |
|-------|-------|
| **Objetivo** | Documentar Source of Truth sem alterar código |
| **Arquivos** | Nenhum código. Apenas documentação. |
| **Alterações** | Adicionar JSDoc em `calculateFinancialCore()` e `runFinancialKernel()` |
| **Risco** | Nulo |
| **Testes** | Revisão de arquitetura |
| **Rollback** | Reverter comentários |
| **Commit** | `docs(financial-core): establish canonical calculation contracts` |

---

### PATCH 2 — Exportar LIQUID_ACCOUNT_TYPES

| Campo | Valor |
|-------|-------|
| **Objetivo** | Tornar `LIQUID_ACCOUNT_TYPES` exportável para reuso |
| **Arquivos** | `src/core/finance/financial-core.ts` |
| **Alterações** | `const LIQUID_ACCOUNT_TYPES` → `export const LIQUID_ACCOUNT_TYPES` (linha 161) |
| **Risco** | **Baixo** — apenas visibilidade |
| **Testes** | Typecheck: import funciona |
| **Rollback** | Remover `export` |
| **Commit** | `refactor(financial-core): export LIQUID_ACCOUNT_TYPES constant` |

---

### PATCH 3 — Filtrar cashBalance por liquid types

| Campo | Valor |
|-------|-------|
| **Objetivo** | `cashBalance` excluir `investment` e `credit_card` |
| **Arquivos** | `src/core/finance/financial-core.ts` |
| **Alterações** | Linha 71-73: adicionar `.filter(a => LIQUID_ACCOUNT_TYPES.includes(a.type \|\| 'checking'))` |
| **Risco** | **ALTO** — altera `cashBalance`, `grossAssets`, `netWorth`, `wealthScore`, `debtRatio`, `recommendation` |
| **Dependências** | Patch 2 |
| **Testes** | Golden test cases (seção 14) |
| **Rollback** | Remover o filtro adicional |
| **Critério** | `cashBalance` exclui investment e credit_card. `calculateEmergencyReserve()` inalterado. |
| **Commit** | `fix(financial-core): filter cash balance by liquid account types` |

---

### PATCH 4 — Kernel expor métricas canônicas

| Campo | Valor |
|-------|-------|
| **Objetivo** | Garantir que `kernelResult.financialCore` contém todas as métricas necessárias |
| **Arquivos** | `src/core/finance/kernel.ts` |
| **Alterações** | Verificar se `financialCore` já é exposto (linha 127-131, 259). Adicionar tipagem explícita. |
| **Risco** | **Baixo** — Kernel já expõe `financialCore` |
| **Testes** | Typecheck: `KernelResult.financialCore.cashBalance` acessível |
| **Rollback** | Reverter |
| **Commit** | `refactor(kernel): expose canonical financial metrics contract` |

---

### PATCH 5 — Dashboard consumir Kernel

| Campo | Valor |
|-------|-------|
| **Objetivo** | `getDashboardReal()` parar de recalcular métricas financeiras |
| **Arquivos** | `src/core/finance/dashboard-real.ts` |
| **Alterações** | (1) Chamar `runFinancialKernel()` ou receber `kernelResult` pré-calculado. (2) Substituir `totalPF`, `totalPJ`, `totalAccounts`, `totalInvestments`, `totalLiabilities`, `netWorthValue`, `totalAssets` pelo `kernelResult.financialCore`. (3) Manter `allocation` (gráfico de pizza — é apresentação, não cálculo). |
| **Linhas a remover** | 126-160 (cálculos duplicados de totals e netWorth) |
| **Linhas a alterar** | 219-241 (usar `financialCore` em vez de variáveis locais) |
| **Dependências** | Patch 3 |
| **Risco** | **MÉDIO** — Dashboard é a interface mais visível |
| **Testes** | `dashboard.netWorth.value === kernel.financialCore.netWorth` |
| **Rollback** | Restaurar cálculos locais |
| **Critério** | Dashboard e Home mostram mesmo netWorth. Allocation (gráfico) preservado. |
| **Commit** | `refactor(dashboard): consume kernel financial metrics` |

---

### PATCH 6 — Dashboard Snapshot consumir Kernel + versionar

| Campo | Valor |
|-------|-------|
| **Objetivo** | `buildDashboardSnapshot()` persistir valores canônicos |
| **Arquivos** | `src/lib/dashboard-snapshot-builder.ts` |
| **Alterações** | (1) Remover `totalPF`, `totalPJ`, `totalInvestments`, `totalLiabilities`, `netWorth` calculados localmente (linhas 98-110). (2) Extrair de `kernelResult.financialCore` (linha 122). (3) Adicionar `financialCoreVersion: 2` ao snapshot. |
| **Dependências** | Patch 3, Patch 5 |
| **Risco** | **MÉDIO** — snapshots antigos não terão `financialCoreVersion` |
| **Testes** | `snapshot.netWorth === kernel.financialCore.netWorth` no momento do build |
| **Rollback** | Restaurar cálculos locais |
| **Critério** | Snapshots novos incluem `financialCoreVersion`. Valores batem com Kernel. |
| **Commit** | `refactor(snapshot): persist canonical kernel metrics with versioning` |

---

### PATCH 7 — Dashboard Admin consumir Kernel

| Campo | Valor |
|-------|-------|
| **Objetivo** | `getDashboardAdmin()` parar de recalcular |
| **Arquivos** | `src/services/firestore/dashboard.admin.ts` |
| **Alterações** | Remover `totalPF`/`totalPJ` calculados (linhas 15-21). Consumir `kernelResult.financialCore` ou delegar ao Kernel. |
| **Dependências** | Patch 3 |
| **Risco** | **Baixo** — admin dashboard |
| **Testes** | Admin dashboard consistente com Dashboard principal |
| **Rollback** | Restaurar |
| **Commit** | `refactor(admin): consume kernel for dashboard admin metrics` |

---

### PATCH 8 — AI Advisor remover fallback

| Campo | Valor |
|-------|-------|
| **Objetivo** | Remover fallback `d.totalPF + d.totalPJ` |
| **Arquivos** | `src/ai/flows/financial-advisor.ts` |
| **Alterações** | Linha 68: `cashBalance: p?.financialCore.cashBalance` (remover `?? d.totalPF + d.totalPJ`) |
| **Dependências** | Patch 5 (Dashboard já usa Kernel, não precisa de fallback) |
| **Risco** | **Baixo** |
| **Testes** | Typecheck. AI Advisor compila sem referência a `totalPF`/`totalPJ`. |
| **Rollback** | Restaurar fallback |
| **Commit** | `fix(ai): remove dashboard fallback from financial advisor` |

---

### PATCH 9 — Desktop remover tipos legados

| Campo | Valor |
|-------|-------|
| **Objetivo** | Alinhar Desktop com Mobile (CR-03, CR-04) |
| **Arquivos** | `src/components/contas/new-account-dialog.tsx` (linhas 101-102), `src/components/contas/edit-account-dialog.tsx` (linhas 178-179) |
| **Alterações** | Remover `<SelectItem value="investment">` e `<SelectItem value="credit_card">` de ambos. |
| **Dependências** | Nenhuma (independente) |
| **Risco** | **Baixo** — apenas remove opções do select. Registros existentes preservados. |
| **Testes** | Select de tipo no Add/Edit mostra apenas `checking`, `savings`, `wallet` |
| **Rollback** | Restaurar opções |
| **Commit** | `fix(accounts): remove legacy types from desktop creation/edition` |

---

## 12. PLANO DE TESTES

### 12.1 Golden Test Cases

Dados de entrada:

```typescript
const testAccounts = [
  { name: 'Itaú PF',       type: 'checking',    owner: 'PF', balance: 5000 },
  { name: 'Poupança PF',   type: 'savings',     owner: 'PF', balance: 2000 },
  { name: 'Carteira PF',   type: 'wallet',      owner: 'PF', balance: 1000 },
  { name: 'Inv Legacy PF', type: 'investment',   owner: 'PF', balance: 10000 },  // legado
  { name: 'Cartão PF',     type: 'credit_card',  owner: 'PF', balance: -2000 },  // legado
  { name: 'Cartão PF 2',   type: 'credit_card',  owner: 'PF', balance: 5000 },   // legado (raro)
  { name: 'Itaú PJ',       type: 'checking',    owner: 'PJ', balance: 50000 },
  { name: 'Sem owner',     type: 'checking',    owner: null,  balance: 1000 },
  { name: 'Sem type',      type: null,          owner: 'PF', balance: 500 },
];

const testInvestments = [
  { type: 'Renda Fixa',  currentValue: 10000, quantity: 0, currentPrice: 0 },
  { type: 'Ações',       currentValue: 5000,  quantity: 100, currentPrice: 50 },
];

const testLiabilities = [
  { name: 'Financiamento', remainingBalance: 20000, installmentValue: 1000, totalInstallments: 24, currentInstallment: 4 },
  { name: 'Cartão Nubank', remainingBalance: 2000,  installmentValue: 200,  totalInstallments: 12, currentInstallment: 1 },
];
```

### 12.2 Resultados esperados

| Métrica | Valor esperado | Cálculo |
|---------|:-------------:|---------|
| **cashBalance** | **8.500** | 5000 + 2000 + 1000 + 500 (sem type=checking) |
| **investmentValue** | **15.000** | 10000 + (100×50) |
| **grossAssets** | **23.500** | 8500 + 15000 |
| **activeLiabilityBalance** | **22.000** | 20000 + 2000 |
| **netWorth** | **1.500** | 23500 - 22000 |

### 12.3 O que NÃO entra mais (após Patch 3)

| Item | Valor | Motivo |
|------|:-----:|--------|
| `investment` PF (10000) | ❌ Excluído | Não é líquido |
| `credit_card` PF (-2000) | ❌ Excluído | Não é líquido |
| `credit_card` PF (5000) | ❌ Excluído | Não é líquido |
| `checking` PJ (50000) | ❌ Excluído | owner PJ |

### 12.4 Testes de regressão

| Teste | Verificação |
|-------|------------|
| Emergency Reserve | `reserveAmount` inalterado (já usa LIQUID_ACCOUNT_TYPES) |
| Freedom Index | `netWorthPercent` usa novo `netWorth` (menor, sem dupla contagem) |
| Dashboard | `dashboard.netWorth.value === kernel.financialCore.netWorth` |
| Snapshot | `snapshot.netWorth === kernel.financialCore.netWorth` (mesmo timestamp) |
| Domus | Respostas refletem netWorth corrigido |
| Planning | `financialCore.netWorth` consistente |

### 12.5 Consistency Assertions

```typescript
// A implementar nos testes:
expect(dashboard.netWorth.value).toEqual(kernel.financialCore.netWorth);
expect(snapshot.netWorth).toEqual(kernel.financialCore.netWorth);
expect(freedomIndex.breakdown.netWorthPercent).toBeGreaterThanOrEqual(0);
expect(freedomIndex.breakdown.netWorthPercent).toBeLessThanOrEqual(100);
```

---

## 13. VERSIONAMENTO

### 13.1 Constantes de versão

| Constante | Necessária? | Local | Quando incrementar |
|-----------|:----------:|-------|--------------------|
| `FINANCIAL_CORE_VERSION` | ✅ **Sim** | `financial-core.ts` | Após Patch 3 (mudança no cálculo) |
| `KERNEL_VERSION` | ✅ **Sim** | `kernel.ts` | Já existe (`kernelVersion: 1`, linha 267) |
| `NET_WORTH_VERSION` | ❌ **Não** | — | Redundante com FINANCIAL_CORE_VERSION |

### 13.2 Valor proposto

```typescript
// financial-core.ts
export const FINANCIAL_CORE_VERSION = 2;
// v1: cashBalance = Σ accounts[owner !== "PJ"].balance
// v2: cashBalance = Σ accounts[owner !== "PJ" && type in LIQUID_ACCOUNT_TYPES].balance
```

### 13.3 Snapshots antigos

Snapshots sem `financialCoreVersion` são interpretados como **v1** (comportamento antigo). Snapshots com `financialCoreVersion: 2` usam o cálculo corrigido.

---

## 14. MATRIZ DE COMPATIBILIDADE CÓDIGO × DADOS

| Código | Dados | cashBalance | netWorth | Seguro? |
|--------|-------|:-----------:|:--------:|:-------:|
| Antigo (v1) | Legado atual | Inclui investment/credit_card | Inflado/Subestimado | ❌ Bug |
| Corrigido (v2) | Legado atual | Exclui investment/credit_card | **Correto** | ✅ Sim |
| Antigo (v1) | Migrado (sem legacy) | Correto (não há legacy) | Correto | ✅ Sim |
| Corrigido (v2) | Migrado (sem legacy) | Correto | Correto | ✅ Sim |

**Conclusão:** A correção de código (v2) pode ser deployada **antes** da migração de dados. O código v2 convive seguramente com dados legados — simplesmente os ignora no `cashBalance`. A migração de dados pode ocorrer depois, sem pressa.

---

## 15. FEATURE FLAG

**Decisão: NÃO usar feature flag.**

Justificativa:
- A correção é uma mudança de cálculo, não de funcionalidade.
- Feature flag adicionaria complexidade (2 branches de código) para um comportamento que é estritamente mais correto.
- Rollback por deploy é suficiente (reverter commit).
- A matriz de compatibilidade mostra que código v2 + dados legados é seguro.

---

## 16. ROLLOUT

| Etapa | Ação | Critério |
|:-----:|------|----------|
| 1 | Local dev | Typecheck + unit tests passam |
| 2 | Build produção | `NODE_ENV=production next build` OK |
| 3 | Emulador Firestore | Testes com dados sintéticos |
| 4 | Staging | Deploy em ambiente isolado |
| 5 | Produção controlada | 1% usuários, monitorar deltas |
| 6 | Produção completa | 100% usuários |

---

## 17. OBSERVABILIDADE

### 17.1 Logs temporários (remover após validação)

```typescript
// Apenas durante rollout. NUNCA logar valores financeiros.
console.debug('[financial-core:v2]', {
  accountCount: accounts.length,
  liquidCount: accounts.filter(a => LIQUID_ACCOUNT_TYPES.includes(a.type)).length,
  legacyCount: accounts.filter(a => !LIQUID_ACCOUNT_TYPES.includes(a.type || 'checking')).length,
  version: FINANCIAL_CORE_VERSION,
});
```

### 17.2 Política de privacidade

- **NUNCA** logar `balance`, `netWorth`, `cashBalance` ou qualquer valor financeiro.
- **NUNCA** logar `userId` em produção.
- Apenas contagens e metadados são seguros para observabilidade.

---

## 18. ROLLBACK

| Patch | Pode reverter isoladamente? | Ponto sem retorno? |
|:-----:|:---------------------------:|:------------------:|
| 1 | ✅ Sim | Não |
| 2 | ✅ Sim | Não |
| 3 | ✅ Sim | Não |
| 4 | ✅ Sim | Não |
| 5 | ✅ Sim | Não |
| 6 | ⚠️ Snapshots gerados com v2 ficam | **Snapshots.** Reverter código + regenerar snapshots |
| 7 | ✅ Sim | Não |
| 8 | ✅ Sim | Não |
| 9 | ✅ Sim | Não |

**Nenhum patch é irreversível antes da migração de dados.** A migração de dados (fase futura) é o ponto sem retorno — requer snapshot pré-migração.

---

## 19. COMMITS PLANEJADOS

| # | Mensagem | Patch |
|:-:|----------|:-----:|
| 1 | `docs(financial-core): establish canonical calculation contracts` | P1 |
| 2 | `refactor(financial-core): export LIQUID_ACCOUNT_TYPES constant` | P2 |
| 3 | `fix(financial-core): filter cash balance by liquid account types` | P3 |
| 4 | `refactor(kernel): expose canonical financial metrics contract` | P4 |
| 5 | `refactor(dashboard): consume kernel financial metrics` | P5 |
| 6 | `refactor(snapshot): persist canonical kernel metrics with versioning` | P6 |
| 7 | `refactor(admin): consume kernel for dashboard admin metrics` | P7 |
| 8 | `fix(ai): remove dashboard fallback from financial advisor` | P8 |
| 9 | `fix(accounts): remove legacy types from desktop creation/edition` | P9 |

---

## 20. CRITÉRIO DE ACEITE POR PATCH

| # | Typecheck | Build | Unit Tests | Sem regressão |
|:-:|:---------:|:-----:|:----------:|:------------:|
| P1 | ✅ | ✅ | N/A | N/A |
| P2 | ✅ | ✅ | ✅ | ✅ |
| P3 | ✅ | ✅ | ✅ (golden) | ✅ Reserve inalterado |
| P4 | ✅ | ✅ | ✅ | ✅ |
| P5 | ✅ | ✅ | ✅ (consistency) | ✅ Dash = Kernel |
| P6 | ✅ | ✅ | ✅ (consistency) | ✅ Snap = Kernel |
| P7 | ✅ | ✅ | ✅ | ✅ |
| P8 | ✅ | ✅ | ✅ | ✅ |
| P9 | ✅ | ✅ | ✅ | ✅ |

---

## 21. CRITÉRIO DE CONCLUSÃO DA FASE DE IMPLEMENTAÇÃO

A Fase 20.5 será considerada concluída quando:

```
✅ calculateFinancialCore() é o único dono dos KPIs canônicos
✅ runFinancialKernel() é o único orquestrador de alto nível
✅ Dashboard não recalcula netWorth
✅ Dashboard Snapshot não recalcula netWorth
✅ Freedom Engine não recompõe ativos canônicos (já está correto)
✅ LIQUID_ACCOUNT_TYPES é aplicado ao cashBalance
✅ Desktop não permite novos tipos legados
✅ Testes cobrem dupla contagem e dupla subtração
✅ Dashboard.netWorth === Kernel.netWorth
✅ Snapshot.netWorth === Kernel.netWorth
✅ Emergency Reserve inalterado
✅ Build produção OK
```

---

## 22. RELAÇÃO COM MIGRAÇÃO DE DADOS

```
ESTA FASE (20.4):       Plano de implementação
PRÓXIMA FASE (20.5):    Implementação dos patches de código
FASE FUTURA:             Auditoria de dados de produção
FASE FUTURA:             Migração de dados legados
APÓS MIGRAÇÃO:           CONTAS-WF-P0 = 0
APÓS P0=0:               Master Visual v1
```

---

## 23. CLASSIFICAÇÃO FINAL

```
CORE-IMPL-P0 = 4  (CR-01, CR-02, CR-03, CR-05)
CORE-IMPL-P1 = 2  (CR-04, CR-07)
CORE-IMPL-P2 = 1  (CR-06)
CORE-IMPL-P3 = 0
```

---

## 24. RECOMENDAÇÃO DA PRÓXIMA FASE

Com o plano de implementação completo e validado:

→ **FASE 20.5 — FINANCIAL CORE CONSOLIDATION IMPLEMENTATION v1**

Executar os 9 patches na ordem definida, com os testes golden documentados, e validar cada patch contra os critérios de aceite.

---

*FinDomus Financial Core Consolidation Implementation Plan v1 · Fase 20.4 · PLANEJADO*
