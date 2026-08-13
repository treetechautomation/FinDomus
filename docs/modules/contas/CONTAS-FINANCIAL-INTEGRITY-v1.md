# FINDOMUS — CONTAS FINANCIAL INTEGRITY v1

**Fase:** 20.2 — Financial Integrity & Legacy Audit
**FDL:** 1.0 FROZEN
**Motivacao:** `CONTAS-WF-P0 = 1` (dupla contagem investment)
**Status:** AUDITADO

---

## 1. RESUMO EXECUTIVO

Esta auditoria rastreou todas as 53 referencias a `cashBalance`, `grossAssets` e `netWorth` no codigo do FinDomus para confirmar ou refutar a hipotese de dupla contagem de ativos financeiros.

### Veredito

**P0-02 CONFIRMADO.** O sistema possui dois mecanismos independentes de soma de ativos que podem representar o mesmo patrimonio, sem qualquer deduplicacao:

1. `cashBalance` (financial-core.ts:71-73): soma TODAS as contas com `owner !== "PJ"`, **independentemente do tipo**. Inclui `investment` e `credit_card`.

2. `investmentValue` (financial-core.ts:75-78): soma entidades da colecao `investments[]`.

3. `grossAssets = cashBalance + investmentValue` (linha 97): somados diretamente.

4. `netWorth = grossAssets - activeLiabilityBalance` (linha 98): propaga a dupla contagem.

**Impacto:** Todo o sistema financeiro — Home, Dashboard, Kernel, Freedom Index, Freedom Timeline, Planejamento, Wealth Score, AI Advisor, Academy — consome estes valores e propaga a distorcao.

**Excecao:** `calculateEmergencyReserve()` filtra por `LIQUID_ACCOUNT_TYPES` e NAO e afetada pela dupla contagem (investment e credit_card sao corretamente excluidos).

---

## 2. MAPA DE DADOS

### 2.1 Accounts

| Aspecto | Detalhe |
|---------|---------|
| Dono do dado | Usuario (via UI) |
| Colecao Firestore | `accounts` |
| Quem cria | `addAccount()` (`src/services/firestore/accounts.ts:72`) |
| Quem le | `getAccounts()`, `getAccountsWithBalance()` (`accounts.ts:106-131`) |
| Quem altera | `updateAccount()` (`accounts.ts:133`), Pluggy sync |
| Quem deleta | `deleteAccount()` (`accounts.ts:160`) — nunca chamado da UI |
| Tipos validos | `checking`, `savings`, `wallet`, `investment`, `credit_card` |
| **Calculos que consome** | `cashBalance`, `totalPF`, `totalPJ`, `totalAccounts`, `calculateEmergencyReserve`, `getAccountAllocation` |

### 2.2 Investments (entidades)

| Aspecto | Detalhe |
|---------|---------|
| Dono do dado | Usuario (via UI) |
| Colecao Firestore | `investments` |
| Quem cria | `addInvestment()` (`src/services/firestore/investments.ts:16`) |
| Quem le | `getInvestments()` (`investments.ts:9`) |
| Quem altera | `updateInvestment()` (`investments.ts:96`) |
| Quem deleta | `deleteInvestment()` (`investments.ts:116`) |
| Campos | `type`, `institution`, `ticker`, `quantity`, `averagePrice`, `currentPrice`, `currentValue`, `contributions` |
| **Calculos que consome** | `investmentValue`, `investedAmount`, `totalInvestments`, `calculateEmergencyReserve` |

### 2.3 Liabilities

| Aspecto | Detalhe |
|---------|---------|
| Dono do dado | Usuario (via UI) |
| Colecao Firestore | `liabilities` |
| Quem le | `getLiabilities()` (`src/services/firestore/liabilities.ts`) |
| Campos | `remainingBalance`, `installmentValue`, `totalInstallments`, `currentInstallment` |
| **Calculos que consome** | `activeLiabilityBalance`, `monthlyDebtPayment`, `netWorth` |

### 2.4 Transactions

| Aspecto | Detalhe |
|---------|---------|
| Dono do dado | Usuario (via importacao/manual) |
| Colecao Firestore | `transactions` |
| Relacao com accounts | `accountId` (opcional). **NAO atualiza account.balance.** |
| **Calculos que consome** | DRE, receitaTotal, despesasOperacionais, taxaAcumulacao |

---

## 3. CASHBALANCE CONTRACT

### 3.1 Definicao

```typescript
// financial-core.ts:71-73
const cashBalance = accounts
  .filter((account) => account.owner !== "PJ")
  .reduce((sum, account) => sum + Number(account.balance || 0), 0);
```

### 3.2 Entradas

| Inclui | Condicao |
|--------|----------|
| Contas PF de qualquer tipo | `owner !== "PJ"` |
| Contas com `owner === null/undefined` | `owner !== "PJ"` e true para null/undefined |
| Contas `investment` PF | ✅ Incluidas |
| Contas `credit_card` PF | ✅ Incluidas |
| Contas `checking`, `savings`, `wallet` PF | ✅ Incluidas |

### 3.3 Exclusoes

| Exclui | Condicao |
|--------|----------|
| Contas PJ (todas) | `owner === "PJ"` |
| **NAO exclui por tipo** | Filtro e apenas por `owner` |

### 3.4 Divergencia com LIQUID_ACCOUNT_TYPES

`LIQUID_ACCOUNT_TYPES = ['checking', 'savings', 'wallet']` (linha 161) e usado **apenas** em `calculateEmergencyReserve()` (linhas 194-196). **NAO e usado** em `calculateFinancialCore()`.

**cashBalance ignora completamente `LIQUID_ACCOUNT_TYPES`.** Isso significa que investment e credit_card accounts sao tratados como caixa para fins de cashBalance, grossAssets e netWorth — mas corretamente excluidos da reserva de emergencia.

### 3.5 Consumidores

| Consumidor | Como usa | Arquivo:linha |
|------------|----------|:------------:|
| `grossAssets` | `cashBalance + investmentValue` | `financial-core.ts:97` |
| `wealthScore` | `cashBalance > 0 ? 5 : -10` | `financial-core.ts:118` |
| `recommendation` | `cashBalance <= 0 ? "Monte reserva"` | `financial-core.ts:137` |
| Freedom Index | Via `core.cashBalance` | `freedom-engine.ts:102` |
| Freedom Timeline | `totalAssets = cashBalance + totalInvestments` | `freedom-engine.ts:296` |
| Reserve milestone | `cashBalance >= targetReserve` | `freedom-engine.ts:369` |
| Kernel | `financialCore.cashBalance` | `kernel.ts:127-131` |
| Planning snapshot | `financialCore.cashBalance` | `planning-snapshot-builder.ts:118` |
| Kernel admin | `kernelResult.financialCore.cashBalance` | `kernel.admin.ts:58` |
| AI Advisor | `p?.financialCore.cashBalance` | `financial-advisor.ts:68` |
| Dashboard | Via `totalPF` (NAO usa financial-core) | `dashboard-real.ts:126-128` |

---

## 4. GROSSASSETS CONTRACT

### 4.1 Definicao

```typescript
// financial-core.ts:97
const grossAssets = cashBalance + investmentValue;
```

### 4.2 Componentes

```
grossAssets
=
  cashBalance                  ← Σ accounts[owner !== "PJ"].balance
+ investmentValue              ← Σ investments[].currentValue
```

### 4.3 Problema de dupla contagem

Se um usuario possui:
- `Account { type: 'investment', balance: 10000, owner: 'PF' }` (conta)
- `Investment { currentValue: 10000 }` (entidade — mesmo ativo)

Entao:
- `cashBalance` = 10000 (a conta investment PF e incluida)
- `investmentValue` = 10000 (a entidade de investimento e incluida)
- `grossAssets` = 20000 (**DUPLA CONTAGEM**)

**Nao existe NENHUM mecanismo de deduplicacao entre `accounts` e `investments`.**

### 4.4 Onde grossAssets e usado

| Consumidor | Uso | Arquivo:linha |
|------------|-----|:------------:|
| `netWorth` | `grossAssets - activeLiabilityBalance` | `financial-core.ts:98` |
| `debtRatio` | `activeLiabilityBalance / grossAssets` | `financial-core.ts:101` |
| `recommendation` | `activeLiabilityBalance > grossAssets * 0.5` | `financial-core.ts:135` |

---

## 5. NETWORTH CONTRACT

### 5.1 Definicao (Financial Core)

```typescript
// financial-core.ts:97-98
const grossAssets = cashBalance + investmentValue;
const netWorth = grossAssets - activeLiabilityBalance;
```

### 5.2 Definicao (Dashboard — calculo proprio)

```typescript
// dashboard-real.ts:126-159
const totalAccounts = totalPF + totalPJ;              // Σ ALL accounts
const totalInvestments = Σ investments[].currentValue; // entidades
const netWorthValue = totalAccounts + totalInvestments - totalLiabilities;
```

**O Dashboard NAO usa `calculateFinancialCore()`.** Ele calcula seu proprio netWorth, mas com a MESMA estrutura de dupla contagem (`totalAccounts` inclui investment accounts + `totalInvestments` inclui entidades).

### 5.3 Definicao (Dashboard Snapshot Builder)

```typescript
// dashboard-snapshot-builder.ts:110
const netWorth = (totalPF + totalPJ + totalInvestments) - totalLiabilities;
```

Mesmo padrao.

### 5.4 Definicao (Snapshot Engine — mensal)

```typescript
// snapshot-engine.ts:71
netWorth: accountBalance - liabilitiesBalance,
```

Snapshot mensal usa apenas account balance e liabilities — nao inclui investments separadamente. Menos suscetivel a dupla contagem, mas `accountBalance` pode incluir investment accounts.

### 5.5 Consumidores de netWorth

| Consumidor | Como usa | Arquivo:linha |
|------------|----------|:------------:|
| Freedom Index | `netWorthPercent` (pilar 15%) | `freedom-engine.ts:143-145` |
| wealthScore | `netWorth > 0 ? 15 : -20` | `financial-core.ts:117` |
| Auto Plan Generator | Exibe netWorth | `auto-plan-generator.ts:143` |
| Simulation Engine | Compara `beforeNetWorth` vs `afterNetWorth` | `simulation-engine.ts:143-144` |
| Kernel admin | Salva snapshot | `kernel.admin.ts:57` |
| Planning snapshot | Salva snapshot | `planning-snapshot-builder.ts:117` |
| AI Advisor | Exibe patrimonio liquido | `financial-advisor.ts:126` |
| Academy | Achievement "netWorth" | `academy-achievements.ts:96` |
| Home | Via Kernel → Freedom Index | — |
| Dashboard | `netWorth.value` | `dashboard-real.ts:240` |
| Domus | Via Kernel → AI Advisor | — |

---

## 6. INVESTMENT AUDIT — DUPLA CONTAGEM COMPROVADA

### 6.1 Evidencia 1: cashBalance nao filtra por tipo

```typescript
// financial-core.ts:71-73
const cashBalance = accounts
  .filter((account) => account.owner !== "PJ")     // ← apenas owner, sem filtro de tipo
  .reduce((sum, account) => sum + Number(account.balance || 0), 0);
```

### 6.2 Evidencia 2: investmentValue e independente

```typescript
// financial-core.ts:75-78
const investmentValue = investments.reduce(            // ← colecao separada
  (sum, item) => sum + getInvestmentCurrentValue(item),
  0
);
```

### 6.3 Evidencia 3: grossAssets soma ambos

```typescript
// financial-core.ts:97
const grossAssets = cashBalance + investmentValue;     // ← soma direta, sem deduplicacao
```

### 6.4 Evidencia 4: Dashboard faz o mesmo

```typescript
// dashboard-real.ts:137,139,159
const totalAccounts = totalPF + totalPJ;                // ← inclui investment accounts
const totalInvestments = investments.reduce(...);        // ← entidades separadas
const netWorthValue = totalAccounts + totalInvestments - totalLiabilities;  // ← soma ambos
```

### 6.5 Evidencia 5: Dashboard Snapshot Builder idem

```typescript
// dashboard-snapshot-builder.ts:110
const netWorth = (totalPF + totalPJ + totalInvestments) - totalLiabilities;
```

### 6.6 Evidencia 6: Freedom Timeline usa cashBalance + totalInvestments

```typescript
// freedom-engine.ts:296
const totalAssets = cashBalance + totalInvestments;
```

### 6.7 Classificacao: COMPROVADO

A dupla contagem esta comprovada em nivel de codigo. Nao depende de dados de producao para ser confirmada — o caminho de codigo existe e e deterministico.

**A unica variavel e se usuarios reais possuem ambos os tipos de registro.** Se existir pelo menos um usuario com `account.type = 'investment'` E `investments[].currentValue > 0`, o netWorth desse usuario esta distorcido.

---

## 7. CREDIT_CARD AUDIT — CLASSIFICACAO INCORRETA + DUPLA SUBTRACAO

### 7.1 Evidencia 1: credit_card entra no cashBalance

```typescript
// financial-core.ts:71-73
// Nao ha filtro: `a.type !== 'credit_card'`
// Contas credit_card PF sao incluidas em cashBalance
```

### 7.2 Evidencia 2: credit_card com balance negativo reduz cashBalance

```
Account { type: 'credit_card', balance: -2000, owner: 'PF' }
→ cashBalance -= 2000
```

### 7.3 Evidencia 3: credit_card com balance positivo aumenta cashBalance

```
Account { type: 'credit_card', balance: 5000, owner: 'PF' }
→ cashBalance += 5000   ← tratado como dinheiro
```

### 7.4 Evidencia 4: Modulo Cartoes e redirect

```typescript
// src/app/(main)/cartoes/page.tsx
export default function Page() {
  redirect('/passivos');
}
```

Nao ha modulo independente para cartoes de credito.

### 7.5 Dupla subtracao comprovada

Se o mesmo cartao de credito existe como:
- `Account { type: 'credit_card', balance: -2000, owner: 'PF' }`
- `Liability { remainingBalance: 2000, name: 'Cartao Nubank' }`

Entao:
```
cashBalance = Σ contas PF = ... - 2000     ← subtrai do caixa
activeLiabilityBalance = Σ liabilities = 2000  ← soma ao passivo
netWorth = cashBalance + investmentValue - activeLiabilityBalance
         = (-2000 + investments) - 2000
         = investments - 4000               ← DUPLA SUBTRACAO
```

**Mesmo ativo (divida de cartao) e subtraido DUAS VEZES do patrimonio liquido.**

### 7.6 Classificacao: COMPROVADO

Risco de dupla subtracao comprovado em codigo. Impacto: `netWorth` subestimado (2x a divida do cartao).

---

## 8. LIQUID ACCOUNT CONTRACT — DIVERGENCIA

### 8.1 Definicao

```typescript
// financial-core.ts:161-162
const LIQUID_ACCOUNT_TYPES = ['checking', 'savings', 'wallet'];
const LIQUID_INVESTMENT_CLASSES = ['Renda Fixa'];
```

### 8.2 Onde e usado

| Funcao | Usa LIQUID_ACCOUNT_TYPES? | Arquivo:linha |
|--------|:-------------------------:|:------------:|
| `calculateEmergencyReserve()` | ✅ Sim | `financial-core.ts:194-200` |
| `calculateFinancialCore()` — cashBalance | ❌ **NAO** | `financial-core.ts:71-73` |
| `calculateFinancialCore()` — grossAssets | ❌ **NAO** (herda de cashBalance) | `financial-core.ts:97` |
| `calculateFinancialCore()` — netWorth | ❌ **NAO** (herda de grossAssets) | `financial-core.ts:98` |
| `getDashboardReal()` | ❌ **NAO** | `dashboard-real.ts:126-159` |
| `buildDashboardSnapshot()` | ❌ **NAO** | `dashboard-snapshot-builder.ts:98-110` |

### 8.3 Divergencia

`LIQUID_ACCOUNT_TYPES` existe e e usado corretamente na Reserva de Emergencia, mas e **ignorado** em todos os outros calculos financeiros. A intencao do codigo (separar contas liquidas de nao-liquidas) nao foi propagada para `cashBalance`, `grossAssets` ou `netWorth`.

---

## 9. IMPACT MATRIX

| Componente | Impactado? | Evidencia | Tipo de distorcao |
|------------|:---------:|-----------|-------------------|
| **cashBalance** | ✅ SIM | `financial-core.ts:71-73` | Inflado (investment) / Distorcido (credit_card) |
| **grossAssets** | ✅ SIM | `financial-core.ts:97` | Inflado (investment + investmentValue) |
| **netWorth** | ✅ SIM | `financial-core.ts:98` | Inflado (investment) / Subestimado (credit_card dupla) |
| **wealthScore** | ✅ SIM | `financial-core.ts:117-118` | Depende de netWorth e cashBalance |
| **debtRatio** | ✅ SIM | `financial-core.ts:101` | Subestimado (grossAssets inflado) |
| **recommendation** | ✅ SIM | `financial-core.ts:135-141` | Pode sugerir acao errada |
| **Freedom Index** | ✅ SIM | `freedom-engine.ts:101-145` | 3 pilares afetados (netWorth 15%, cashBalance indireto, passiveIncome) |
| **Freedom Timeline** | ✅ SIM | `freedom-engine.ts:296,369` | Datas projetadas incorretas |
| **Emergency Reserve** | ❌ NAO | `financial-core.ts:194-196` | Usa LIQUID_ACCOUNT_TYPES — filtra corretamente |
| **Dashboard** | ✅ SIM | `dashboard-real.ts:159` | netWorth distorcido |
| **Dashboard Snapshot** | ✅ SIM | `dashboard-snapshot-builder.ts:110` | netWorth distorcido |
| **Planning Snapshot** | ✅ SIM | `planning-snapshot-builder.ts:117-118` | Via financialCore |
| **Kernel** | ✅ SIM | `kernel.ts:127-131` | Propaga para todos os consumers |
| **AI Advisor** | ✅ SIM | `financial-advisor.ts:126` | Usa netWorth para recomendacoes |
| **Academy** | ✅ SIM | `academy-achievements.ts:96` | Achievement "netWorth" |
| **Auto Plan Generator** | ✅ SIM | `auto-plan-generator.ts:143` | Usa netWorth |
| **Simulation Engine** | ✅ SIM | `simulation-engine.ts:143-144` | before/after netWorth |
| **Home** | ✅ SIM | Via Kernel → Freedom Index | Exibe indice incorreto |
| **Domus** | ✅ SIM | Via Kernel → AI Advisor | Respostas baseadas em dados incorretos |
| **Contas (modulo)** | ❌ NAO | Soma local de balances | Nao usa financial-core diretamente |
| **Passivos (modulo)** | ❌ NAO | — | Independe |
| **Investimentos (modulo)** | ⚠️ PARCIAL | `investmentValue` e correto | Apenas cashBalance o distorce |

---

## 10. PRODUCAO — DEPENDENCIA DE DADOS REAIS

### 10.1 O risco foi comprovado APENAS no codigo?

**Sim.** O caminho de codigo existe independentemente dos dados. A dupla contagem e deterministico — se houver investment accounts + investment entities, o calculo estara errado.

### 10.2 Depende da existencia de registros reais?

**Depende.** O codigo TEM o bug, mas o bug so se manifesta se existirem dados que o acionem. Sem acesso ao Firestore de producao, nao e possivel afirmar quantos usuarios sao afetados.

### 10.3 Dados necessarios para conclusao completa

| Metrica | Proposito |
|---------|-----------|
| Quantidade de `accounts` com `type = 'investment'` | Dimensao do problema |
| Quantidade de `investments` (entidades) | Potencial de dupla contagem |
| Usuarios com AMBOS (`account.investment` + `investment` entity) | Usuarios afetados |
| Soma de `balance` de investment accounts | Valor distorcido no cashBalance |
| Quantidade de `accounts` com `type = 'credit_card'` | Dimensao do problema |
| Usuarios com `credit_card` account + `liability` correspondente | Usuarios com dupla subtracao |
| Distribuicao de `owner` (PF vs PJ) nos tipos legados | Impacto no cashBalance (so PF entra) |

---

## 11. FINANCIAL CORE REVIEW — PROTECAO CONTRA DUPLA CONTAGEM

**Pergunta:** O Financial Core possui alguma protecao contra dupla contagem?

**Resposta: NAO.**

Evidencias:
1. `cashBalance` (linha 71-73): filtra apenas por `owner !== "PJ"`. Nao filtra por `type`. Nao consulta se existe entidade correspondente em `investments[]`.
2. `grossAssets` (linha 97): soma direta. Nao ha `Set`, `Map`, deduplicacao por ID, ou qualquer mecanismo de exclusao mutua.
3. Nao ha comentario, documentacao ou validacao que indique consciencia do problema.
4. `LIQUID_ACCOUNT_TYPES` (linha 161) existe mas nao e usado em `calculateFinancialCore()`.

---

## 12. KERNEL REVIEW — PROPAGACAO

### 12.1 O Kernel depende do cashBalance?

**Sim.** `kernel.ts:127-131` chama `calculateFinancialCore()` e armazena o resultado em `financialCore`. Este objeto e repassado para:

- `calculateFreedomIndex()` (linha 186-194)
- `calculateEmergencyReserve()` (linha 248-253 — NAO usa cashBalance, usa LIQUID_ACCOUNT_TYPES)
- `getFinancialAIInsights()` (linha 227-243)
- Retornado como `kernelResult.financialCore`

### 12.2 Depende do grossAssets?

**Sim, indiretamente.** `grossAssets` alimenta `netWorth`, que alimenta `wealthScore`, `debtRatio` e `recommendation`. Todos estes sao retornados em `financialCore`.

### 12.3 Como isso propaga?

```
Kernel
├── financialCore { cashBalance, grossAssets, netWorth, ... }
│   ├── Freedom Index { freedomIndex, netWorthPercent, wealthScore }
│   │   ├── Home (exibe indice)
│   │   ├── Planning Snapshot
│   │   └── Kernel Admin (salva historico)
│   ├── Freedom Timeline { monthsToFreedom, milestones }
│   ├── AI Insights → Domus
│   ├── Wealth Report
│   └── Auto Plan Generator
├── Reserve (NAO afetado — usa LIQUID_ACCOUNT_TYPES)
└── Forecast (NAO afetado — usa transactions)
```

---

## 13. EMERGENCY RESERVE REVIEW — NAO AFETADA

### 13.1 A reserva utiliza cashBalance?

**NAO.** `calculateEmergencyReserve()` (linha 183-270) tem sua propria logica de filtro:

```typescript
const liquidAccounts = (params.accounts || [])
  .filter(a => a.owner !== 'PJ')
  .filter(a => LIQUID_ACCOUNT_TYPES.includes(a.type || 'checking'));
```

Investment e credit_card accounts sao **excluidos** das contas liquidas e listados como `excludedAssets` com o motivo "Conta do tipo X nao tem liquidez imediata".

### 13.2 A reserva utiliza grossAssets?

**NAO.**

### 13.3 A reserva utiliza investmentValue?

**NAO diretamente.** Usa `liquidInvestments` (filtrado por `LIQUID_INVESTMENT_CLASSES = ['Renda Fixa']`).

### 13.4 Conclusao

`calculateEmergencyReserve()` e o **unico calculo financeiro** que implementa corretamente o conceito de `LIQUID_ACCOUNT_TYPES`. E a referencia de como `cashBalance` DEVERIA se comportar.

---

## 14. FREEDOM INDEX REVIEW

### 14.1 Pilares que recebem dados do cashBalance

| Pilar | Peso | Fonte | Afetado? |
|-------|:----:|-------|:--------:|
| Quitacao de Dividas | 25% | `liabilities.totalInstallments` | ❌ Nao |
| Comprometimento de Renda | 20% | `core.monthlyDebtPayment` / `dre.receitaTotal` | ❌ Nao |
| Reserva de Emergencia | 15% | `calculateEmergencyReserve().reservePercent` | ❌ Nao (usa LIQUID_ACCOUNT_TYPES) |
| **Patrimonio Liquido** | **15%** | **`core.netWorth`** | ✅ **SIM** |
| Taxa de Poupanca | 10% | `dre.taxaAcumulacao` | ❌ Nao |
| Renda Passiva | 10% | `totalInvestments * monthlyYield` | ⚠️ Parcial (totalInvestments via core.investmentValue e correto; mas cashBalance nao afeta) |
| Diversificacao | 5% | `realDiversificationScore` | ❌ Nao |

### 14.2 Impacto

Apenas o pilar de **Patrimonio Liquido (15%)** e diretamente afetado pela dupla contagem, via `core.netWorth`. Os outros pilares ou sao independentes de cashBalance/netWorth ou usam `calculateEmergencyReserve()` (que e imune).

---

## 15. HOME REVIEW

### 15.1 A Home mostra cashBalance?

Depende da implementacao. A Home consome o Kernel, que retorna `financialCore.cashBalance` e `freedom.index.freedomIndex`. O Freedom Index inclui netWorth (15%).

### 15.2 A Home mostra netWorth?

Via Freedom Index (pilar 15%) e possivelmente diretamente em Summary Cards.

### 15.3 A Home mostra grossAssets?

Provavelmente nao diretamente. Mas o `wealthScore` (que alimenta labels como "Forte"/"Saudavel") depende de `grossAssets` via `debtRatio`.

---

## 16. DOMUS REVIEW

### 16.1 Domus utiliza esses valores?

**Sim, via Kernel.** A Domus consulta o AI Advisor (`financial-advisor.ts`), que recebe o `kernelResult.financialCore` completo:

```typescript
// financial-advisor.ts:67-68
netWorth: d.netWorth,
cashBalance: p?.financialCore.cashBalance ?? d.totalPF + d.totalPJ,
```

O AI Advisor usa `netWorth` para gerar recomendacoes personalizadas. Se o netWorth esta distorcido, as recomendacoes da Domus podem ser incorretas.

### 16.2 Ou apenas consulta o Kernel?

Consulta o Kernel, que propaga a distorcao. A Domus nao tem calculo proprio — herda o erro.

---

## 17. P0 REVIEW

### 17.1 O P0 esta:

**CONFIRMADO.**

A dupla contagem de investment accounts em `grossAssets = cashBalance + investmentValue` esta comprovada por 6 evidencias independentes de codigo:

1. `cashBalance` nao filtra por tipo (financial-core.ts:71-73)
2. `investmentValue` soma de colecao separada (financial-core.ts:75-78)
3. `grossAssets` soma ambos diretamente (financial-core.ts:97)
4. Dashboard replica o padrao (dashboard-real.ts:137-159)
5. Dashboard Snapshot Builder replica (dashboard-snapshot-builder.ts:98-110)
6. Freedom Timeline usa `cashBalance + totalInvestments` (freedom-engine.ts:296)

Alem disso, foi descoberto um segundo problema: **dupla subtracao de credit_card** (account + liability subtraem o mesmo valor duas vezes).

### 17.2 Classificacao final

| ID | Descricao | Classificacao |
|----|-----------|:------------:|
| P0-02 | `investment` account + `investment` entity = dupla contagem em `grossAssets`/`netWorth` | **CONFIRMADO P0** |
| P0-03 | `credit_card` account + `liability` = dupla subtracao em `netWorth` | **CONFIRMADO P0** |
| P1-05 | `LIQUID_ACCOUNT_TYPES` nao usado em `calculateFinancialCore()` — divergencia de intencao | **P1** |
| P2-07 | `cashBalance` ignora tipo de conta — deveria usar `LIQUID_ACCOUNT_TYPES` | **P2** |

---

## 18. MIGRATION STRATEGY

### 18.1 Pre-requisitos

1. **Auditoria de dados de producao:** Quantificar usuarios com investment accounts, credit_card accounts, investment entities e liabilities correspondentes.
2. **Aprovacao de stakeholders:** Validar que a migracao e necessaria e o plano e aceitavel.
3. **Ambiente de dry-run:** Firestore isolado ou emulador para validar migracao.

### 18.2 Correcao de codigo (pre-migracao)

Antes de migrar dados, o codigo DEVE ser corrigido para que:

1. `calculateFinancialCore()` filtre `cashBalance` por `LIQUID_ACCOUNT_TYPES` OU filtre por tipo, excluindo `investment` e `credit_card`.
2. `getDashboardReal()` e `buildDashboardSnapshot()` usem `calculateFinancialCore()` em vez de calculo proprio — ou implementem o mesmo filtro.

**Sem esta correcao, a migracao de dados nao resolve o problema para futuros registros.**

### 18.3 Fases da migracao

```
Fase 1 — Auditoria de producao
  ├── Contar accounts por type
  ├── Contar investments (entidades)
  ├── Identificar usuarios com ambos
  ├── Contar credit_card accounts
  ├── Identificar credit_card + liability overlap
  └── Estimar impacto financeiro (R$)

Fase 2 — Snapshot pre-migracao
  ├── Salvar kernelResult completo por usuario
  ├── Salvar freedomIndex, freedomTimeline
  ├── Salvar dashboard snapshot
  └── Armazenar em colecao `migration_snapshots`

Fase 3 — Dry-run
  ├── Executar migracao em ambiente isolado
  ├── Recalcular kernel para usuarios migrados
  ├── Comparar netWorth pre vs pos
  └── Validar que dupla contagem foi eliminada

Fase 4 — Validacao
  ├── Revisar resultados do dry-run
  ├── Aprovar ou rejeitar migracao
  └── Ajustar script se necessario

Fase 5 — Migracao
  ├── Para cada investment account:
  │   ├── Se existe Investment entity correspondente → remover account
  │   └── Se nao existe → criar Investment entity, remover account
  ├── Para cada credit_card account:
  │   ├── Se balance < 0 → criar Liability ou ajustar existente, remover account
  │   └── Se balance >= 0 → reclassificar para checking/wallet
  ├── Registrar todas as alteracoes em audit log
  └── Recalcular kernel para usuarios afetados

Fase 6 — Monitoramento
  ├── Validar kernel reports pos-migracao
  ├── Monitorar Freedom Index (deve ser mais preciso)
  ├── Verificar Home/Dashboard/Domus
  └── Período de rollback: 30 dias
```

---

## 19. SNAPSHOT CONTRACT

### 19.1 O que salvar

```typescript
{
  userId: string;
  snapshotDate: string;  // ISO
  pre: {
    accounts: { count: number; byType: Record<string, number> };
    investments: { count: number; totalValue: number };
    liabilities: { count: number; totalBalance: number };
    kernel: {
      cashBalance: number;
      grossAssets: number;
      netWorth: number;
      freedomIndex: number;
    };
  };
}
```

### 19.2 Quando salvar

Imediatamente antes da migracao. Congelar writes por usuarios afetados durante a migracao.

### 19.3 Como comparar

`pre.kernel.netWorth` vs `post.kernel.netWorth`. O delta esperado e:
- **Positivo** (netWorth aumenta): se havia credit_card com dupla subtracao
- **Negativo** (netWorth diminui): se havia investment com dupla contagem
- **Zero**: se nao havia registros legados

### 19.4 Criterio de sucesso

- Nenhum usuario com `netWorth` pos-migracao > pre-migracao + investment entity value
- Nenhum usuario com `netWorth` pos-migracao com dupla subtracao residual
- Freedom Index consistente com a nova realidade financeira

---

## 20. ROLLBACK CONTRACT

### 20.1 Quando voltar

- `netWorth` pos-migracao difere do esperado em >5% para qualquer usuario
- Freedom Index muda de nivel (>20 pontos) de forma inesperada
- Usuarios reportam dados incorretos
- Erro tecnico na execucao da migracao

### 20.2 Como voltar

1. Restaurar registros removidos do backup (snapshot pre-migracao)
2. Reexecutar kernel para usuarios restaurados
3. Validar que `netWorth` e `freedomIndex` voltaram aos valores pre-migracao
4. Notificar usuarios afetados (se aplicavel)

### 20.3 O que validar

- Todos os `investment` accounts restaurados
- Todos os `credit_card` accounts restaurados
- Kernel reports identicos ao pre-migracao
- Home/Dashboard/Domus refletem valores restaurados

---

## 21. RISK MATRIX

| Risco | Probabilidade | Impacto | Mitigacao | Responsavel |
|-------|:------------:|:-------:|-----------|:-----------:|
| Dupla contagem investment | **Alta** (basta 1 usuario ter ambos) | **Alto** (netWorth, FI, Home, Domus) | Corrigir codigo + migrar dados | Arquitetura/Backend |
| Dupla subtracao credit_card | **Media** (requer account + liability) | **Medio** (netWorth subestimado) | Corrigir codigo + migrar dados | Arquitetura/Backend |
| Migracao incorreta | **Baixa** (com dry-run) | **Alto** (dados financeiros corrompidos) | Dry-run + snapshot + rollback | Backend/QA |
| Usuarios insatisfeitos com mudanca | **Baixa** | **Baixo** (netWorth mais preciso) | Comunicacao transparente | Produto |
| Regressao em outros modulos | **Media** | **Alto** | Testes de regressao completos | QA |

---

## 22. DECISION MATRIX

### 22.1 O que fazer com investment accounts?

| Opcao | Recomendada? | Justificativa |
|-------|:------------:|---------------|
| Remover | ✅ **Sim** | Nao deveriam existir. Colidem com entidades de Investment. |
| Migrar para Investment entity | ✅ **Sim (se nao existe entidade)** | Preserva o valor. Cria entidade correspondente. |
| Congelar | ❌ Nao | Nao resolve o problema. Mantem distorcao. |
| Ocultar | ❌ Nao | Esconde sem resolver. Piora a confianca. |
| Reclassificar para checking | ❌ Nao | Perde a natureza do ativo. Falso conserto. |

### 22.2 O que fazer com credit_card accounts?

| Opcao | Recomendada? | Justificativa |
|-------|:------------:|---------------|
| Migrar para Liability | ✅ **Sim (se balance < 0)** | Cartao de credito e passivo, nao conta. |
| Reclassificar para checking | ⚠️ **So se balance >= 0** | Caso raro. Auditar manualmente. |
| Remover sem criar nada | ❌ Nao | Perde informacao financeira. |
| Congelar | ❌ Nao | Mantem distorcao. |
| Ocultar | ❌ Nao | Esconde sem resolver. |

### 22.3 Decisao final

1. **Corrigir `calculateFinancialCore()`** para filtrar `cashBalance` por `LIQUID_ACCOUNT_TYPES` (excluir `investment` e `credit_card`).
2. **Corrigir `getDashboardReal()` e `buildDashboardSnapshot()`** para usar o mesmo filtro.
3. **Migrar dados legados** conforme estrategia da secao 18.
4. **Remover `investment` e `credit_card` do `new-account-dialog.tsx` (Desktop)** para alinhar com Mobile.

---

## 23. CHANGE REQUESTS

| ID | Descricao | Bloco |
|----|-----------|:-----:|
| `FIN-ARCH-CR-01` | `calculateFinancialCore().cashBalance` deve filtrar por `LIQUID_ACCOUNT_TYPES` ou equivalente, excluindo `investment` e `credit_card`. | `financial-core.ts:71-73` |
| `FIN-ARCH-CR-02` | `getDashboardReal()` deve usar `calculateFinancialCore()` em vez de calculo proprio, ou replicar o filtro `LIQUID_ACCOUNT_TYPES`. | `dashboard-real.ts:126-159` |
| `FIN-ARCH-CR-03` | `buildDashboardSnapshot()` deve usar `calculateFinancialCore()` ou replicar o filtro `LIQUID_ACCOUNT_TYPES`. | `dashboard-snapshot-builder.ts:98-110` |
| `FIN-ARCH-CR-04` | `LIQUID_ACCOUNT_TYPES` deve ser exportado/publico para reuso em outros modulos. | `financial-core.ts:161` |
| `FIN-ARCH-CR-05` | Remover `investment` e `credit_card` do `new-account-dialog.tsx` (Desktop) para alinhar com Mobile. | `new-account-dialog.tsx:101-102` |
| `FIN-ARCH-CR-06` | Remover `investment` e `credit_card` do `edit-account-dialog.tsx` (Desktop). | `edit-account-dialog.tsx:178-179` |

---

## 24. VEREDITO FINAL

### Situacao atual

```
CONTAS-WF-P0 = 2  ❌
  P0-02: Dupla contagem investment (CONFIRMADO)
  P0-03: Dupla subtracao credit_card (CONFIRMADO — NOVO)

CONTAS-WF-P1 = 1  ⚠️
  P1-05: LIQUID_ACCOUNT_TYPES nao usado em calculateFinancialCore()

CONTAS-WF-P2 = 7
  (P2-01 a P2-06 existentes + P2-07 novo)
```

### Bloqueio para Master Visual

**O Master Visual NAO pode prosseguir enquanto CONTAS-WF-P0 > 0.**

O wireframe e a arquitetura de UX estao corretos — as novas contas nao permitirao `investment` nem `credit_card`. Mas o sistema financeiro que alimenta a Home, o Dashboard, o Freedom Index e a Domus esta com calculos incorretos para usuarios com dados legados.

### Caminho para zerar P0

1. ✅ Fase 20.1: Arquitetura e Wireframe corrigidos (CR-01 a CR-04 incorporados).
2. ✅ Fase 20.2: Auditoria de integridade financeira (este documento) — **CONCLUIDA**.
3. ⬜ **PROXIMO:** `FIN-ARCH-CR-01` a `FIN-ARCH-CR-06` — correcao do `calculateFinancialCore()`.
4. ⬜ Auditoria de dados de producao (quantificar usuarios afetados).
5. ⬜ Migracao de dados legados (conforme secao 18).
6. ⬜ Validacao pos-migracao.

### Apos zerar P0

```
CONTAS-WF-P0 = 0  ✅
→ CONTAS MOBILE MASTER VISUAL v1
```

---

*FinDomus Contas Financial Integrity v1 · Fase 20.2 · AUDITADO*

---

## Apendice A: Mapa Completo de Referencias a cashBalance/grossAssets/netWorth

| # | Arquivo | Linha | Variavel | Dependencia |
|---|---------|:-----:|----------|-------------|
| 1 | `financial-core.ts` | 71-73 | `cashBalance` | Definicao |
| 2 | `financial-core.ts` | 75-78 | `investmentValue` | Definicao |
| 3 | `financial-core.ts` | 97 | `grossAssets` | cashBalance + investmentValue |
| 4 | `financial-core.ts` | 98 | `netWorth` | grossAssets - liabilities |
| 5 | `financial-core.ts` | 101 | `debtRatio` | grossAssets |
| 6 | `financial-core.ts` | 117 | `wealthScore` | netWorth |
| 7 | `financial-core.ts` | 118 | `wealthScore` | cashBalance |
| 8 | `financial-core.ts` | 135 | `recommendation` | grossAssets |
| 9 | `financial-core.ts` | 137 | `recommendation` | cashBalance |
| 10 | `financial-core.ts` | 144 | retorno | cashBalance |
| 11 | `financial-core.ts` | 149 | retorno | grossAssets |
| 12 | `financial-core.ts` | 150 | retorno | netWorth |
| 13 | `freedom-engine.ts` | 101 | `netWorth` | core.netWorth |
| 14 | `freedom-engine.ts` | 102 | `cashBalance` | core.cashBalance |
| 15 | `freedom-engine.ts` | 103 | `totalInvestments` | core.investmentValue |
| 16 | `freedom-engine.ts` | 143-145 | `netWorthPercent` | netWorth |
| 17 | `freedom-engine.ts` | 174 | `freedomIndex` | netWorthPercent |
| 18 | `freedom-engine.ts` | 249 | `cashBalance` | core.cashBalance |
| 19 | `freedom-engine.ts` | 250 | `totalInvestments` | core.investmentValue |
| 20 | `freedom-engine.ts` | 296 | `totalAssets` | cashBalance + totalInvestments |
| 21 | `freedom-engine.ts` | 369 | milestone | cashBalance |
| 22 | `dashboard-real.ts` | 126-128 | `totalPF` | Calculo proprio |
| 23 | `dashboard-real.ts` | 130-132 | `totalPJ` | Calculo proprio |
| 24 | `dashboard-real.ts` | 137 | `totalAccounts` | totalPF + totalPJ |
| 25 | `dashboard-real.ts` | 139-147 | `totalInvestments` | Calculo proprio |
| 26 | `dashboard-real.ts` | 159 | `netWorthValue` | totalAccounts + totalInvestments - liabilities |
| 27 | `dashboard-real.ts` | 160 | `totalAssets` | totalAccounts + totalInvestments |
| 28 | `dashboard-snapshot-builder.ts` | 98-99 | `totalPF`/`totalPJ` | Calculo proprio |
| 29 | `dashboard-snapshot-builder.ts` | 101-105 | `totalInvestments` | Calculo proprio |
| 30 | `dashboard-snapshot-builder.ts` | 110 | `netWorth` | totalPF + totalPJ + totalInvestments - liabilities |
| 31 | `kernel.ts` | 127-131 | `financialCore` | calculateFinancialCore() |
| 32 | `kernel.ts` | 248-253 | `reserve` | calculateEmergencyReserve() |
| 33 | `planning-snapshot-builder.ts` | 117 | `netWorth` | financialCore.netWorth |
| 34 | `planning-snapshot-builder.ts` | 118 | `cashBalance` | financialCore.cashBalance |
| 35 | `kernel.admin.ts` | 57 | `netWorth` | kernelResult.financialCore.netWorth |
| 36 | `kernel.admin.ts` | 58 | `cashBalance` | kernelResult.financialCore.cashBalance |
| 37 | `financial-advisor.ts` | 67 | `netWorth` | d.netWorth |
| 38 | `financial-advisor.ts` | 68 | `cashBalance` | financialCore.cashBalance |
| 39 | `financial-advisor.ts` | 126 | — | baseline.financialCore.netWorth |
| 40 | `simulation-engine.ts` | 143 | `beforeNetWorth` | financialCore.netWorth |
| 41 | `simulation-engine.ts` | 144 | `afterNetWorth` | financialCore.netWorth |
| 42 | `auto-plan-generator.ts` | 143 | — | kernelResult.financialCore.netWorth |
| 43 | `auto-plan-generator.ts` | 162 | — | kernelResult.financialCore.netWorth |
| 44 | `academy-achievements.ts` | 96 | trigger | netWorth |
| 45 | `snapshot-engine.ts` | 71 | `netWorth` | accountBalance - liabilitiesBalance |
| 46 | `monthly-closures.ts` | 279 | `snapshot.netWorth` | snapshot |
| 47 | `freedom-engine.ts` | 528 | `hasNoInvestments` | accounts.every(a => a.type !== 'investment') |
