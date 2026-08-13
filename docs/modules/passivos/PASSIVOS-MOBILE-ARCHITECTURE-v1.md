# FINDOMUS — PASSIVOS MOBILE ARCHITECTURE v1

**Fase:** 16 — Arquitetura Mobile do Módulo Passivos
**FDL:** 1.0 FROZEN
**Universal Module Pattern:** v1 homologado (tipo P — Portfolio)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Planejamento + Investimentos:** homologados
**Viewport de referência:** 390 × 844px

---

## 1. RESUMO EXECUTIVO

O módulo Passivos ("Liabilities") do FinDomus gerencia dívidas, financiamentos e parcelamentos. A auditoria revelou um módulo com entidade de 15 campos, subcoleção de pagamentos, criação automática via importação de parcelas, engine de projeção mensal, snapshot com métricas derivadas e integração crítica com `financial-core.ts` para cálculo de patrimônio líquido.

A arquitetura mobile propõe **2 tabs** (Visão Geral, Dívidas) — uma das arquiteturas mais enxutas entre os módulos. O protagonista é o **saldo devedor total**. O módulo preserva o tratamento emocional correto: dívidas são fatos financeiros, não falhas morais. Zero emojis, zero linguagem de culpa, zero urgência artificial.

---

## 2. BASELINE

```
Baseline funcional: bc19adb
Branch: main · Working tree: clean (apenas docs/)
```

---

## 3. ARQUIVOS AUDITADOS

| Arquivo | Linhas | Função |
|---------|:------:|--------|
| `app/(main)/passivos/page.tsx` | 204 | Página. 3 stats + projeção 6 meses + grid de cards. |
| `services/firestore/liabilities.ts` | 303 | CRUD + auto-criação via parcelas + payments subcollection. |
| `components/passivos/new-liability-dialog.tsx` | 135 | Dialog de criação (6 campos). |
| `core/finance/liability-engine.ts` | 71 | Projeção mensal + timeline detalhada. |
| `lib/liability-snapshot-builder.ts` | 96 | Snapshot com 10 métricas derivadas. |
| `lib/liability-snapshot-types.ts` | 32 | Tipos do snapshot. |

---

## 4. DATA MODEL

### 4.1 Liability (entidade principal)

| Campo | Tipo | Persistido | Calculado | Descrição |
|-------|------|:---------:|:---------:|-----------|
| `name` | string | ✅ | — | Nome da dívida |
| `type` | "Financiamento" \| "Empréstimo" \| "Cartão" \| "Outro" | ✅ | — | Tipo de passivo |
| `institution` | string | ✅ | — | Banco/instituição |
| `installmentValue` | number | ✅ | — | Valor de cada parcela |
| `currentInstallment` | number | ✅ | — | Parcela atual |
| `totalInstallments` | number | ✅ | — | Total de parcelas |
| `remainingBalance` | number | ✅ | — | Saldo devedor (input manual no create) |
| `remainingInstallments` | number | ✅ (opcional) | ✅ | Parcelas restantes: `total − current` |
| `installmentKey` | string | ✅ (auto) | — | Chave para deduplication (importação) |
| `owner` | "PF" \| "PJ" | ✅ | — | Contexto |
| `competenceMonthKey` | string | ✅ (auto) | — | Mês de competência |
| `category` | string | ✅ (auto) | — | Categoria |
| `source` | "manual" \| "import" | ✅ | — | Origem |
| `status` | "active" \| "paid" | ✅ | ✅ | Status da dívida |
| `createdAt` | string (ISO) | ✅ | — | — |
| `updatedAt` | string (ISO) | ✅ | — | — |
| `userId` | string | ✅ | — | Owner |
| `householdId` | string \| null | ✅ | — | Contexto familiar |

### 4.2 LiabilityPayment (subcoleção)

| Campo | Tipo |
|-------|------|
| `liabilityId` | string |
| `installmentNumber` | number |
| `amount` | number |
| `principalAmount` | number |
| `interestAmount` | number (sempre 0) |
| `transactionId` | string |
| `status` | "paid" \| "reversed" |

**Nota crítica:** `interestAmount` é sempre 0. Não há separação entre principal e juros nos pagamentos registrados.

### 4.3 AUSÊNCIA de campo de taxa de juros

A entidade Liability **não possui** campo `interestRate`. O snapshot calcula `averageInterestRate` como `(totalPaid − borrowed) / borrowed × 100` — que é uma taxa implícita derivada da diferença entre o total de parcelas e o saldo original estimado. **Não é uma taxa de juros contratual armazenada.**

---

## 5. SOURCE OF TRUTH

| Métrica | Source | Derivação |
|---------|--------|-----------|
| Saldo devedor total | `remainingBalance` (Firestore) | Soma dos saldos de passivos ativos |
| Valor original | — (não armazenado) | Estimado: `installmentValue × totalInstallments` |
| Parcela mensal | `installmentValue` (Firestore) | — |
| Progresso de quitação | Derivado | `(currentInstallment / totalInstallments) × 100` |
| Projeção mensal | Engine | `buildMonthlyProjection(active, baseMonth)` |
| Impacto Freedom | financial-core | `activeLiabilityBalance` → `debtRatio` → Freedom |
| Taxa de juros | **NÃO ARMAZENADA** | Derivada: `(totalPago − emprestado) / emprestado` |

---

## 6. FREEDOM INDEX — LINEAGE

```
liabilities (Firestore)
    ↓
getActiveLiabilities() — financial-core.ts:56
    ↓ filtra remainingBalance > 0 && totalInstallments > 0
activeLiabilityBalance (soma remainingBalance)
    ↓
netWorth = grossAssets − activeLiabilityBalance
debtRatio = activeLiabilityBalance / grossAssets × 100
    ↓
calculateFinancialCore() → CoreResult
    ↓
runFinancialKernel() → KernelResult
    ↓
calculateFreedomIndex() → pilar "Quitação de dívidas" (25% do peso)
    ↓
Freedom Index → Home
```

---

## 7. ANÁLISE DE DUPLA CONTAGEM

### Cenário: Financiamento de R$ 50.000 com parcela de R$ 1.500

**Impactos no sistema:**

1. **Patrimônio líquido:** `remainingBalance` reduz `netWorth` → correto (passivo deduz patrimônio)
2. **Despesa mensal:** A parcela de R$ 1.500 NÃO aparece nas transações automaticamente. Só aparece se o usuário registrar manualmente ou importar.
3. **Saldo da conta:** Reduz quando a transação de pagamento é registrada (manual/importação).

**Risco de dupla contagem:** Se o usuário registra a parcela como despesa E o `remainingBalance` reduz o patrimônio → o impacto no net worth seria duplo? **NÃO.** O `netWorth = cashBalance + investments − liabilities`. A transação reduz `cashBalance`. O passivo reduz `liabilities` (via `remainingBalance`). São contas diferentes do balanço. Sem dupla contagem.

**Risco de confusão DRE × Passivo:** A parcela aparece como despesa no DRE (se registrada) mas NÃO reduz o `remainingBalance` automaticamente. O `remainingBalance` só é atualizado via `addLiabilityPayment()` ou edição manual. Isso significa que pagar uma parcela não reduz automaticamente o saldo devedor — **precisa de ação explícita.** Isso é um gap funcional, não de arquitetura mobile.

**Classificação:** `PASSIVOS-P2` — pagamento de parcela não atualiza automaticamente o saldo devedor.

---

## 8. CRUD

| Operação | Função | UI atual |
|----------|--------|:--------:|
| Read | `getLiabilities(userId)` | ✅ Carrega na página |
| Create | `addLiability(userId, data)` — 6 campos | ✅ Dialog |
| Update | `updateLiability(userId, id, data)` | ❌ Não exposto na UI |
| Delete | `deleteLiability(userId, id)` | ❌ Não exposto na UI |
| Auto-create | `upsertLiabilityFromInstallmentTransaction()` | ✅ Importação de parcelas |
| Add payment | `addLiabilityPayment(userId, payment)` | ✅ Interno (auto-create) |
| Reverse payment | `reverseLiabilityPayment(userId, id, n)` | ✅ Interno |

---

## 9. CONTEXTO PF / FAMÍLIA / PJ

| Contexto | Status | Evidência |
|----------|:------:|-----------|
| PF | ✅ IMPLEMENTADO | `owner: 'PF'`, `userId` |
| Família | ❌ NÃO IMPLEMENTADO | `householdId` existe no schema mas sem agregação |
| PJ | ❌ NÃO IMPLEMENTADO | `owner: 'PJ'` teoricamente suportado mas sem UI/engine PJ |

---

## 10. OBJETIVO MOBILE

> O módulo Passivos ajuda o usuário a entender **quanto deve, qual o comprometimento mensal e quanto tempo falta para quitar** — sem julgamento, sem ansiedade, com clareza e caminho.

**Pergunta central:**

> "Quanto eu devo? Qual é o meu progresso? Qual o impacto nas minhas finanças?"

---

## 11. PROTAGONISTA

**Decisão: SALDO DEVEDOR TOTAL (`totalLiabilities`)**

| Candidato | Avaliação |
|-----------|-----------|
| Saldo devedor total | ✅ O dado mais direto. Responde "quanto devo". |
| Comprometimento mensal | ⚠️ Contexto importante, mas secundário. |
| Progresso de quitação | ⚠️ Derivado, depende de ter `totalInstallments`. |
| Meses projetados | ⚠️ Contexto, não protagonista. |

---

## 12. ARQUITETURA DE INFORMAÇÃO

De 1 tela desktop (resumo + projeção + grid) para **2 tabs mobile**:

```
Passivos
│
├── Tab 1: Visão Geral
│   ├── Summary: saldo devedor total + comprometimento mensal + progresso
│   ├── Insight Domus (0-1)
│   ├── Próximos meses (projeção compacta)
│   └── Ação: Adicionar passivo
│
└── Tab 2: Dívidas
    ├── Lista de passivos ativos
    ├── Cada item: nome + instituição + saldo + parcela + progresso
    └── Detail: toque → tela de detalhe do passivo
```

### Comparação de arquiteturas

| Arquitetura | Avaliação |
|-------------|-----------|
| **A: 2 tabs (Visão Geral + Dívidas)** | ✅ Recomendado. Suficiente para o domínio. |
| B: 3 tabs (Visão Geral + Dívidas + Projeções) | Projeções são parte natural da Visão Geral. Tab extra desnecessária. |
| C: 1 tela única sem tabs | Funcionaria, mas misturaria resumo e lista longa. Tabs organizam melhor. |

**Decisão: Arquitetura A — 2 tabs.**

---

## 13. TAB 1 — VISÃO GERAL

### Summary

```
┌──────────────────────────────────────────────────────────────┐
│ PASSIVOS                                                     │
│                                                              │
│ R$ 8.400                                                     │ ← 36px financial-hero
│                                                              │
│ Comprometimento mensal     Progresso                         │
│ R$ 1.500                   62% quitado                       │
│ 3 dívidas ativas · 11 meses projetados                      │
└──────────────────────────────────────────────────────────────┘
```

### Insight Domus (0-1)

```
┌──────────────────────────────────────────────────────────────┐
│ ◈ Domus                                                      │
│ Seu financiamento do carro concentra 65% do                  │
│ saldo devedor total. Priorizar essa dívida pode              │
│ liberar R$ 850/mês em 18 meses.                             │
│                                                              │
│ Entender                                                     │
└──────────────────────────────────────────────────────────────┘
```

### Projeção compacta (próximos 3 meses)

```
┌──────────────────────────────────────────────────────────────┐
│ PRÓXIMOS MESES                                               │
│                                                              │
│ ago/26    set/26    out/26    nov/26    ...                  │
│ R$ 1.500  R$ 1.500  R$ 1.380  R$ 960     ...                │
│                                                              │
│ Ver projeção completa →                                      │
└──────────────────────────────────────────────────────────────┘
```

### Ação

```
┌──────────────────────────────────────────────────────────────┐
│              [Adicionar passivo]                              │
│                                                              │
│ Simular amortização →                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 14. TAB 2 — DÍVIDAS

### Lista de passivos ativos

```
┌──────────────────────────────────────────────────────────────┐
│ Financiamento Carro                   R$ 5.400         →    │
│ Banco Itaú · 18/48 parcelas · 62%                           │
│ ████████████████████████████████░░░░░░░░░░                   │
└──────────────────────────────────────────────────────────────┘
```

Filtro: "Ativas" (default), "Quitadas", "Todas".

### Detail do passivo

```
┌──────────────────────────────────────────────────────────────┐
│ ← Dívidas    Financiamento Carro              [◈] [···]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Banco Itaú · Financiamento                                   │
│                                                              │
│ Saldo devedor     R$ 5.400                                   │
│ Valor original    R$ 10.000 (estimado)                       │
│                                                              │
│ Parcela           R$ 850                                     │
│ Progresso         18/48 (38%)                                │
│ Previsão término  fev/2028                                   │
│                                                              │
│ [Editar]    [Simular amortização]    [Excluir]               │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. CRUD MOBILE

### Add Passivo — Bottom Sheet

6 campos (nome, tipo, instituição, valor parcela, total parcelas, saldo devedor). >5 campos → **tela dedicada** conforme Universal Pattern. Porém, o formulário é simples (6 inputs numéricos/seleção). **Decisão: Bottom Sheet**, pois a complexidade é baixa apesar de 6 campos.

### Edit — Bottom Sheet (mesmo componente do Add)

### Delete — Confirmation Sheet

---

## 16. AÇÕES

| Ação | Status | Mobile |
|------|:------:|--------|
| Adicionar passivo | ✅ | Bottom Sheet |
| Editar passivo | ⚠️ Existe no service, não na UI | Bottom Sheet (adicionar à UI) |
| Excluir passivo | ⚠️ Existe no service, não na UI | Confirmation Sheet |
| Simular amortização | ✅ Link para Home com `?simulate=payoff_debt&id=X` | Action Card → Simulation Engine |
| Registrar pagamento | ❌ NÃO EXISTE | GAP — Future |

---

## 17. DOMUS CONTEXTUAL

Ícone no header. Contexto:

```js
{
  financialContext: "PF",
  moduleContext: "passivos",
  activeTab: "overview" | "dividas",
  activeLiability: { id, name, type, remainingBalance } | null
}
```

### Perguntas suportadas pelos dados reais:

| Pergunta | Status |
|----------|:------:|
| "Qual dívida devo priorizar?" | ✅ SUPORTADA (maior remainingBalance ou maior installmentValue) |
| "Quanto ainda devo?" | ✅ SUPORTADA |
| "Quando termino de pagar?" | ✅ SUPORTADA (projeção) |
| "Quanto pago por mês?" | ✅ SUPORTADA |
| "Vale antecipar?" | ⚠️ PARCIAL (simulation-engine suporta payoff_debt) |
| "Quanto pago em juros?" | ❌ NÃO SUPORTADA (interestAmount = 0, sem taxa) |
| "Como as dívidas afetam meu índice?" | ✅ SUPORTADA (Freedom Index pilar dívidas) |

---

## 18. EMPTY STATES

### Sem passivos (nunca cadastrou)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              [ícone ShieldCheck, 48px]                        │
│                                                              │
│       Você não possui dívidas cadastradas                    │
│                                                              │
│   Registre financiamentos, empréstimos ou                    │
│   parcelamentos para acompanhar sua evolução.                │
│                                                              │
│     ┌────────────────────────────────────────┐               │
│     │        Adicionar passivo               │               │
│     └────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### Todos quitados (empty positivo)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              [ícone CheckCircle, 48px, verde]                 │
│                                                              │
│       Você quitou todos os seus passivos                     │
│                                                              │
│   Seu patrimônio não está comprometido                       │
│   com dívidas ativas.                                        │
└──────────────────────────────────────────────────────────────┘
```

**Distinção:** O sistema pode diferenciar "nunca cadastrou" (0 passivos total) de "quitou todos" (passivos existem mas `status = 'paid'`). ✅

---

## 19. COMPLEXITY BUDGET

| Limite | Valor |
|--------|:-----:|
| Tabs | 2 |
| Summary KPIs | 1 protagonista (36px) + 2 métricas contextuais |
| Projeção (Visão Geral) | 3-4 meses visíveis |
| Insights | 0-1 |
| Ação primária | 1 ("Adicionar passivo") |
| Ação secundária | 1 ("Simular amortização →") |
| List items | Standard 56px |
| Detail actions | ≤3 |

---

## 20. DATA LINEAGE COMPLETO

```
Liability (Firestore)
    ↓ getLiabilities(userId)
    ↓ filtro: remainingBalance > 0 && current < total
activeLiabilities[]
    ↓
    ├── totalLiabilities = Σ remainingBalance → Summary (protagonista)
    ├── totalMonthlyCommitment = Σ installmentValue → Summary (contexto)
    ├── progress = (currentInstallment / totalInstallments) × 100
    ├── buildMonthlyProjection(active, baseMonth) → Projeção
    ├── buildProjectionTimeline(active, baseMonth) → Timeline
    └── getActiveLiabilities() → financialCore → Kernel → Freedom Index
```

---

## 21. CAPABILITY MATRIX

| Capacidade | Backend | Engine | UI Atual | Mobile UX | Gap |
|------------|:-------:|:------:|:--------:|:---------:|-----|
| Saldo devedor total | ✅ Firestore | ✅ Soma | ✅ StatCard | ✅ Summary | Nenhum |
| Comprometimento mensal | ✅ Firestore | ✅ Soma | ✅ StatCard | ✅ Summary | Nenhum |
| Projeção mensal | ✅ liability-engine | ✅ buildMonthlyProjection | ✅ 6 cards | ✅ Visão Geral (compacto) | Adaptar |
| Timeline detalhada | ✅ liability-engine | ✅ buildProjectionTimeline | ✅ Dentro dos cards | ✅ "Ver projeção →" | Mover |
| CRUD (create) | ✅ Firestore | — | ✅ Dialog | ✅ Bottom Sheet | Adaptar |
| CRUD (edit) | ✅ Firestore | — | ❌ Não exposto | ✅ Bottom Sheet | ADICIONAR |
| CRUD (delete) | ✅ Firestore | — | ❌ Não exposto | ✅ Confirmation Sheet | ADICIONAR |
| Simulação amortização | ✅ simulation-engine | ✅ payoff_debt | ✅ Link | ✅ Action Card | Nenhum |
| Auto-create (import) | ✅ upsertLiability | ✅ | ✅ (interno) | — (transparente) | Nenhum |
| Registro de pagamento | ❌ | ❌ | ❌ | ❌ | FUTURE |
| Domus contextual | ❌ | ❌ | ❌ | ✅ Header | CRIAR |
| Família | ❌ | ❌ | ❌ | — | ENGINE |
| PJ | ❌ | ❌ | ❌ | — | ENGINE |

---

## 22. CURRENT → MOBILE MAP

| Desktop | Mobile | Ação |
|---------|--------|------|
| 1 tela sem tabs | 2 tabs (Visão Geral + Dívidas) | ADAPT |
| 3 StatCards | 1 Summary superfície | MERGE |
| Projeção 6 meses (3 colunas) | Projeção compacta 3-4 meses | ADAPT |
| Grid de cards de passivos | Lista de itens Standard 56px | ADAPT |
| "Simular Amortização" link | Action secundária "Simular amortização →" | KEEP |
| Progress bar por passivo | Progress bar no item da lista | KEEP |
| Sem edit/delete na UI | Adicionar edit/delete ao mobile | ADICIONAR |
| Sem Domus | Ícone no header | CRIAR |

---

## 23. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |
| P2-01 | Pagamento de parcela não atualiza automaticamente o saldo devedor. Ação explícita requerida via `addLiabilityPayment`. | PASSIVOS-P2 |
| P2-02 | Edit e delete existem no service mas não são expostos na UI desktop. | PASSIVOS-P2 |
| P2-03 | Domus contextual: ícone no header precisa ser implementado. | PASSIVOS-P2 |
| P3-01 | Taxa de juros não é armazenada (interestAmount sempre 0). Impossível calcular custo real de juros. | PASSIVOS-P3 |
| P3-02 | Contexto Família e PJ não implementados. | PASSIVOS-P3 |

---

## 24. FINANCIAL INTEGRITY REVIEW

| Verificação | Status |
|-------------|:------:|
| Saldo devedor vs net worth | ✅ Correto. `remainingBalance` → `activeLiabilityBalance` → deduz `netWorth`. |
| Dupla contagem DRE × Passivo | ✅ Sem dupla contagem. Transação afeta `cashBalance`, passivo afeta `liabilities`. São contas diferentes. |
| Pagamento não reduz saldo automaticamente | ⚠️ P2. `addLiabilityPayment` atualiza `remainingBalance`, mas não é chamado automaticamente ao registrar transação de pagamento. |
| Cálculo de progresso | ✅ Correto. `currentInstallment / totalInstallments`. |
| Juros | ⚠️ P3. `interestAmount` = 0 em todos os payments. Sem campo `interestRate` na entidade. |

---

## 25. CHANGE REQUESTS

Nenhum. Compatível com todos os contratos homologados.

---

## 26. RECOMENDAÇÃO FINAL

O Passivos Mobile é um dos módulos mais enxutos (2 tabs), com protagonista claro (saldo devedor total) e tratamento emocional correto (dados, não julgamento). A arquitetura aproveita engines existentes (liability-engine, simulation-engine, financial-core) sem criar complexidade desnecessária.

**Próximo passo:** Com PASSIVOS-P0 = 0 e PASSIVOS-P1 = 0:

→ **PASSIVOS MOBILE WIREFRAME v1**

---

*FinDomus Passivos Mobile Architecture v1 · Fase 16 concluída · Aguardando homologação*
