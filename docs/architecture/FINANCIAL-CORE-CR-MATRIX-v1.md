# FINDOMUS — FINANCIAL CORE CHANGE REQUEST MATRIX v1

**Fase:** 20.4 — CR Consolidation Matrix
**Status:** AUDITADO

---

## 1. MATRIZ DE CONSOLIDACAO

### 1.1 CORE-ARCH vs FIN-ARCH

| CR original | Objetivo | Sobreposicao | CR final | Status |
|-------------|----------|:------------:|:--------:|:------:|
| `CORE-ARCH-CR-01` | `calculateFinancialCore()` = Source of Truth | Pré-requisito global | `CORE-IMPL-CR-01` | **ABSORVIDO** |
| `CORE-ARCH-CR-02` | `runFinancialKernel()` = único entry point | Pré-requisito global | `CORE-IMPL-CR-01` | **ABSORVIDO** |
| `CORE-ARCH-CR-03` | Dashboard consumir Kernel | Cobre `FIN-ARCH-CR-02` | `CORE-IMPL-CR-03` | **ABSORVE FIN-02** |
| `CORE-ARCH-CR-04` | Snapshot Builder consumir Kernel | Cobre `FIN-ARCH-CR-03` | `CORE-IMPL-CR-04` | **ABSORVE FIN-03** |
| `CORE-ARCH-CR-05` | Dashboard Admin consumir Kernel | Sem sobreposicao | `CORE-IMPL-CR-05` | **INDEPENDENTE** |
| `CORE-ARCH-CR-06` | AI Advisor remover fallback | Sem sobreposicao | `CORE-IMPL-CR-06` | **INDEPENDENTE** |
| `CORE-ARCH-CR-07` | `cashBalance` filtrar por liquid types | Igual a `FIN-ARCH-CR-01` | `CORE-IMPL-CR-02` | **ABSORVE FIN-01** |
| `CORE-ARCH-CR-08` | Exportar `LIQUID_ACCOUNT_TYPES` | Igual a `FIN-ARCH-CR-04` | `CORE-IMPL-CR-02` | **ABSORVE FIN-04** |
| `FIN-ARCH-CR-01` | `cashBalance` filtrar por liquid types | Igual a `CORE-ARCH-CR-07` | — | **ABSORVIDO** |
| `FIN-ARCH-CR-02` | Dashboard usar `calculateFinancialCore()` | Coberto por `CORE-ARCH-CR-03` | — | **ABSORVIDO** |
| `FIN-ARCH-CR-03` | Snapshot Builder usar Core | Coberto por `CORE-ARCH-CR-04` | — | **ABSORVIDO** |
| `FIN-ARCH-CR-04` | Exportar `LIQUID_ACCOUNT_TYPES` | Igual a `CORE-ARCH-CR-08` | — | **ABSORVIDO** |
| `FIN-ARCH-CR-05` | Remover legacy do new-account-dialog Desktop | Mobile ja fez | `CORE-IMPL-CR-07` | **INDEPENDENTE** |
| `FIN-ARCH-CR-06` | Remover legacy do edit-account-dialog Desktop | Mobile ja fez | `CORE-IMPL-CR-07` | **INDEPENDENTE** |

### 1.2 Perguntas de sobreposicao respondidas

| Pergunta | Resposta | Evidencia |
|----------|----------|:---------:|
| `CORE-ARCH-CR-07` absorve `FIN-ARCH-CR-01`? | **SIM** — ambos pedem filtrar `cashBalance` por `LIQUID_ACCOUNT_TYPES` | Identico objetivo, mesmo arquivo: `financial-core.ts:71-73` |
| `CORE-ARCH-CR-03` absorve `FIN-ARCH-CR-02`? | **SIM** — Dashboard consumir Kernel implica consumir Core | `dashboard-real.ts:126-159` recalculam; Kernel ja expoe `financialCore` |
| `CORE-ARCH-CR-04` absorve `FIN-ARCH-CR-03`? | **SIM** — Snapshot consumir Kernel implica consumir Core | `dashboard-snapshot-builder.ts:98-110` recalculam; Kernel ja chamado na linha 122 |
| `CORE-ARCH-CR-01` e `CORE-ARCH-CR-02` sao pré-requisitos? | **SIM** — todos os demais dependem de existir um Source of Truth declarado | Sem contrato formal, migracao de consumidores e ambígua |
| `FIN-ARCH-CR-05` e `FIN-ARCH-CR-06` permanecem independentes? | **SIM** — sao mudancas de UI Desktop, sem dependencia do Core | `new-account-dialog.tsx:101-102`, `edit-account-dialog.tsx:178-179` |

---

## 2. CRs FINAIS CONSOLIDADOS

### CORE-IMPL-CR-01: Source of Truth + Kernel Contracts

| Campo | Valor |
|-------|-------|
| **Objetivo** | Declarar `calculateFinancialCore()` como Source of Truth canônico e `runFinancialKernel()` como único ponto de entrada |
| **Problema resolvido** | Ambiguidade sobre quem calcula métricas financeiras |
| **Arquivos afetados** | Nenhum código alterado. Contrato documental. |
| **Absorve** | CORE-ARCH-CR-01, CORE-ARCH-CR-02 |
| **Dependências** | Nenhuma |
| **Risco** | Nulo (apenas documentacao) |
| **Teste** | Revisao de arquitetura |
| **Rollback** | Reverter documento |
| **Critério** | Documento aprovado por arquitetura |

### CORE-IMPL-CR-02: cashBalance Liquid Filter + Export

| Campo | Valor |
|-------|-------|
| **Objetivo** | Filtrar `cashBalance` por `LIQUID_ACCOUNT_TYPES` e exportar constante |
| **Problema resolvido** | Contas `investment` e `credit_card` entram em `cashBalance` como caixa |
| **Arquivos afetados** | `src/core/finance/financial-core.ts` |
| **Funções afetadas** | `calculateFinancialCore()` linha 71-73, `LIQUID_ACCOUNT_TYPES` linha 161 |
| **Absorve** | CORE-ARCH-CR-07, CORE-ARCH-CR-08, FIN-ARCH-CR-01, FIN-ARCH-CR-04 |
| **Dependências** | CORE-IMPL-CR-01 (contrato) |
| **Risco** | **Alto** — altera `cashBalance`, `grossAssets`, `netWorth`, `wealthScore`, `debtRatio` em cascata |
| **Teste** | Golden cases com investment account + entity, credit_card + liability |
| **Rollback** | Reverter filtro. Sem impacto em dados. |
| **Critério** | `cashBalance` exclui `investment` e `credit_card`. `LIQUID_ACCOUNT_TYPES` exportado. |

### CORE-IMPL-CR-03: Dashboard → Kernel

| Campo | Valor |
|-------|-------|
| **Objetivo** | `getDashboardReal()` consumir `kernelResult.financialCore` em vez de recalcular |
| **Problema resolvido** | Dashboard recalcula netWorth com regras diferentes do Core |
| **Arquivos afetados** | `src/core/finance/dashboard-real.ts` |
| **Funções afetadas** | `getDashboardReal()` — remover linhas 126-160, substituir por `kernelResult.financialCore` |
| **Absorve** | CORE-ARCH-CR-03, FIN-ARCH-CR-02 |
| **Dependências** | CORE-IMPL-CR-01, CORE-IMPL-CR-02 |
| **Risco** | **Medio** — Dashboard e interface mais visível do usuario |
| **Teste** | `dashboard.netWorth === kernel.financialCore.netWorth` |
| **Rollback** | Restaurar calculo local |
| **Critério** | Dashboard mostra mesmos numeros que Home (via Kernel) |

### CORE-IMPL-CR-04: Dashboard Snapshot → Kernel

| Campo | Valor |
|-------|-------|
| **Objetivo** | `buildDashboardSnapshot()` persistir `kernelResult.financialCore` em vez de recalcular |
| **Problema resolvido** | Snapshot recalcula netWorth duplicado do Kernel |
| **Arquivos afetados** | `src/lib/dashboard-snapshot-builder.ts` |
| **Funções afetadas** | `buildDashboardSnapshot()` — remover linhas 98-110, usar `kernelResult.financialCore` da linha 122 |
| **Absorve** | CORE-ARCH-CR-04, FIN-ARCH-CR-03 |
| **Dependências** | CORE-IMPL-CR-01, CORE-IMPL-CR-02, CORE-IMPL-CR-03 |
| **Risco** | **Medio** — snapshots historicos podem divergir |
| **Teste** | `snapshot.netWorth === kernel.financialCore.netWorth` no momento da captura |
| **Rollback** | Restaurar calculo local |
| **Critério** | Snapshots novos usam valores canônicos. Adicionar `kernelVersion` ao snapshot. |

### CORE-IMPL-CR-05: Dashboard Admin → Kernel

| Campo | Valor |
|-------|-------|
| **Objetivo** | `getDashboardAdmin()` consumir `kernelResult.financialCore` |
| **Problema resolvido** | Admin recalcula totalPF/totalPJ com regras próprias |
| **Arquivos afetados** | `src/services/firestore/dashboard.admin.ts` |
| **Funções afetadas** | `getDashboardAdmin()` — remover linhas 15-21, consumir Kernel |
| **Absorve** | CORE-ARCH-CR-05 |
| **Dependências** | CORE-IMPL-CR-01, CORE-IMPL-CR-02 |
| **Risco** | **Baixo** — admin dashboard, menos usuarios |
| **Teste** | `admin.totalPF === kernel.financialCore.cashBalance` (se contexto PF) |
| **Rollback** | Restaurar calculo local |
| **Critério** | Admin dashboard consistente com Dashboard principal |

### CORE-IMPL-CR-06: AI Advisor remove fallback

| Campo | Valor |
|-------|-------|
| **Objetivo** | Remover fallback `d.totalPF + d.totalPJ` do AI Advisor |
| **Problema resolvido** | AI Advisor usa dados do Dashboard como fallback, perpetuando duplicacao |
| **Arquivos afetados** | `src/ai/flows/financial-advisor.ts` |
| **Funções afetadas** | Linha 68: `cashBalance: p?.financialCore.cashBalance ?? d.totalPF + d.totalPJ` |
| **Absorve** | CORE-ARCH-CR-06 |
| **Dependências** | CORE-IMPL-CR-01, CORE-IMPL-CR-02, CORE-IMPL-CR-03 |
| **Risco** | **Baixo** — fallback raramente usado se Kernel sempre disponivel |
| **Teste** | AI Advisor sempre usa `financialCore.cashBalance` |
| **Rollback** | Restaurar fallback |
| **Critério** | Sem referencia a `d.totalPF + d.totalPJ` no AI Advisor |

### CORE-IMPL-CR-07: Desktop remove legacy types

| Campo | Valor |
|-------|-------|
| **Objetivo** | Remover `investment` e `credit_card` das opcoes de criacao/edicao Desktop |
| **Problema resolvido** | Desktop ainda permite criar contas com tipos que causam dupla contagem |
| **Arquivos afetados** | `src/components/contas/new-account-dialog.tsx`, `src/components/contas/edit-account-dialog.tsx` |
| **Funções afetadas** | `NewAccountDialog` linhas 101-102, `EditAccountDialog` linhas 178-179 |
| **Absorve** | FIN-ARCH-CR-05, FIN-ARCH-CR-06 |
| **Dependências** | Nenhuma (independente do Core) |
| **Risco** | **Baixo** — Mobile ja fez. Apenas remove opcoes do select. |
| **Teste** | Select de tipo mostra apenas `checking`, `savings`, `wallet` |
| **Rollback** | Restaurar opcoes no select |
| **Critério** | Novas contas Desktop nao podem ser `investment` ou `credit_card` |

---

## 3. DEPENDENCIAS ENTRE CRs

```
CORE-IMPL-CR-01 (Contracts)
    │
    ├── CORE-IMPL-CR-02 (Liquid Filter) ──── independente de UI
    │       │
    │       ├── CORE-IMPL-CR-03 (Dashboard) ── depende do filtro
    │       │       │
    │       │       ├── CORE-IMPL-CR-04 (Snapshot) ── depende do Dashboard
    │       │       │
    │       │       └── CORE-IMPL-CR-06 (AI Advisor) ── depende do Dashboard
    │       │
    │       └── CORE-IMPL-CR-05 (Dashboard Admin) ── depende do filtro
    │
    └── CORE-IMPL-CR-07 (Desktop types) ──── totalmente independente
```

---

## 4. CLASSIFICACAO FINAL

| ID | Classificacao | Justificativa |
|----|:------------:|---------------|
| CORE-IMPL-CR-01 | **P0** | Pré-requisito para todos os demais |
| CORE-IMPL-CR-02 | **P0** | Corrige dupla contagem e dupla subtracao |
| CORE-IMPL-CR-03 | **P0** | Dashboard e a interface mais visivel |
| CORE-IMPL-CR-04 | **P1** | Snapshots historicos; impacto menor |
| CORE-IMPL-CR-05 | **P2** | Admin dashboard, audiencia limitada |
| CORE-IMPL-CR-06 | **P2** | Fallback raramente usado |
| CORE-IMPL-CR-07 | **P1** | Mobile ja fez; Desktop deve alinhar |

---

*FinDomus Financial Core CR Matrix v1 · Fase 20.4*
