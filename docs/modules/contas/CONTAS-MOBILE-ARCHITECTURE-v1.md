# FINDOMUS — CONTAS MOBILE ARCHITECTURE v1

**Fase:** 20.1 — Architecture & Wireframe Correction
**FDL:** 1.0 FROZEN
**Universal Module Pattern:** v1 homologado (tipo T — Transactional)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Viewport de referencia:** 390 × 844px
**Status:** CORRECTED / HOMOLOGATED

---

## 1. RESUMO EXECUTIVO

O modulo Contas gerencia contas bancarias com **saldo manual**. A auditoria revelou que `account.balance` e um campo de input direto do usuario, armazenado no Firestore, sem reconciliacao automatica com transacoes. Nao ha engine de transferencia que atualize saldos automaticamente. O `cashBalance` no `financial-core.ts` e a soma dos `balance` de contas `owner !== "PJ"` e alimenta `netWorth` e o calculo de reserva de emergencia.

A arquitetura mobile propoe **1 tela sem tabs** — a estrutura mais enxuta entre todos os modulos. O protagonista e o **saldo total do contexto ativo**. As contas sao listadas em lista unica filtrada pelo Context Switcher global com itens compactos de 56px. CRUD usa Bottom Sheet (Add/Edit) e Confirmation Sheet (Delete).

### Correction v1 (Fase 20.1)

Quatro Change Requests aprovados foram incorporados apos o Wireframe v1:

| CR | Descricao | Impacto |
|:--:|-----------|---------|
| CR-01 | Contexto ativo substitui secoes PF/PJ simultaneas | Arquitetura de Informacao |
| CR-02 | Add Account aceita saldo inicial manual | Formulario de criacao |
| CR-03 | `credit_card` removido de novas contas (legado visivel) | Tipos disponiveis |
| CR-04 | `investment` removido de novas contas (legado visivel) | Tipos disponiveis |

---

## 2. BASELINE

```
Baseline funcional: bc19adb · Branch: main · Working tree: clean (docs/)
```

---

## 3. DATA MODEL — ACCOUNT

| Campo | Tipo | Persistido | Descricao |
|-------|------|:---------:|-----------|
| `name` | string | ✅ | Nome da conta (ex: "Itau PF") |
| `type` | string | ✅ | `checking`, `savings`, `wallet` (novos) + `investment`, `credit_card` (legado) |
| `owner` | "PF" \| "PJ" | ✅ | Contexto |
| `companyId` | string \| null | ✅ | Vinculado a empresa (apenas PJ) |
| `balance` | number | ✅ | **Saldo manual.** Input direto do usuario. |
| `createdAt` | string (ISO) | ✅ | — |
| `userId` | string | ✅ | Owner |
| `householdId` | string \| null | ✅ | Contexto familiar |

### 3.1 Tipos de conta

#### Tipos ativos (disponiveis para novas contas)

| Valor | Label | Liquido? |
|-------|-------|:-------:|
| `checking` | Conta Corrente | ✅ |
| `savings` | Poupanca | ✅ |
| `wallet` | Carteira | ✅ |

#### Tipos legados (nao disponiveis para novas contas; registros existentes preservados)

| Valor | Label | Motivo |
|-------|-------|--------|
| `investment` | Investimento | Colide com modulo Investimentos. Risco de dupla contagem no `grossAssets`. |
| `credit_card` | Cartao de Credito | Colide conceitualmente com `LIQUID_ACCOUNT_TYPES`. Representa divida, nao caixa. |

### 3.2 Contas liquidas (reserva de emergencia)

`financial-core.ts` define `LIQUID_ACCOUNT_TYPES = ['checking', 'savings', 'wallet']`. Apenas esses tipos entram no calculo da reserva de emergencia.

### 3.3 Riscos de legado

#### investment — Dupla contagem comprovada

```typescript
// financial-core.ts:71-73
const cashBalance = accounts
  .filter((account) => account.owner !== "PJ")
  .reduce((sum, account) => sum + Number(account.balance || 0), 0);

// financial-core.ts:75-78
const investmentValue = investments.reduce(
  (sum, item) => sum + getInvestmentCurrentValue(item), 0
);

// financial-core.ts:97
const grossAssets = cashBalance + investmentValue;
```

**Cenario de dupla contagem:**
1. Usuario cria Account `type: 'investment'`, `balance: 10000`, `owner: 'PF'`
2. `cashBalance` = 10000 (investment account e PF, entra no filtro `owner !== "PJ"`)
3. Usuario cria Investment entity com `currentValue: 10000` (mesmo ativo)
4. `investmentValue` = 10000
5. `grossAssets` = 10000 + 10000 = **20000** (dupla contagem!)

**Confirmado em dashboard-real.ts:159:**
```typescript
const netWorthValue = totalAccounts + totalInvestments - totalLiabilities;
```
`totalAccounts` inclui todas as contas PF+PJ (incluindo `investment`). Dupla contagem confirmada.

**Classificacao:** `CONTAS-WF-P0` — Risco comprovado de distorcao do patrimonio liquido.

#### credit_card — Classificacao incorreta de liquidez

Contas `credit_card` com `owner !== "PJ"` sao somadas ao `cashBalance`. Um cartao de credito com `balance: -2000` reduz o `cashBalance`, mas esse valor ja pode estar representado como passivo em `/passivos`. Alem disso, `balance` positivo em cartao de credito e um conceito financeiro problematico (cartao nao e conta de saldo positivo).

**Classificacao:** `CONTAS-WF-P1` — Risco de representacao incorreta e potencial dupla contagem com Passivos.

---

## 4. SOURCE OF TRUTH — BALANCE

### Achado critico: `balance` e MANUAL.

| Operacao | Efeito no balance |
|----------|-------------------|
| `addAccount()` | **Aceita `balance` como parametro** (backend suporta). UI atual (new-account-dialog.tsx:51) hardcoded `balance: 0`. Mobile: campo exposto. |
| `updateAccount()` | `balance` e editavel diretamente pelo usuario |
| `addTransaction()` | **NAO atualiza** `account.balance` |
| `deleteTransaction()` | **NAO atualiza** `account.balance` |
| Importacao (OFX/PDF/CSV) | **NAO atualiza** `account.balance` |
| Fechamento mensal | **NAO atualiza** `account.balance` |
| Transferencia | **NAO atualiza** `account.balance` |
| Pluggy sync | Atualiza `balance` diretamente da API bancaria (nao derivado de transacoes) |

**Conclusao:** `account.balance` e um campo de input manual. Nao existe reconciliacao automatica entre transacoes e saldo da conta. O usuario e responsavel por manter o saldo atualizado.

### Implicacoes para Mobile:
- O saldo mostrado e o que o usuario digitou
- Nao ha como garantir que o saldo esta correto
- A interface NAO deve implicar que o saldo e automaticamente reconciliado
- Label "Saldo informado" comunica manualidade sem desvalorizar o dado
- Helper no Edit: "O saldo desta conta e mantido manualmente no FinDomus."

---

## 5. DATA LINEAGE

### 5.1 Context Filter Lineage (Mobile)

```
Context Switcher global
    ↓
owner/companyId do contexto ativo
    ↓
filteredAccounts = accounts.filter(owner === activeOwner && companyId === activeCompanyId)
    ↓
localTotalBalance = Σ filteredAccounts.balance
    ↓
Summary (modulo Contas)
    ↓
Domus context
```

### 5.2 CashBalance Lineage (Financial Core — NAO alterado pelo modulo)

```
accounts[owner !== "PJ"].balance (Firestore, manual)
    ↓ soma em calculateFinancialCore()
cashBalance
    ↓
grossAssets = cashBalance + investmentValue
netWorth = grossAssets - activeLiabilityBalance
    ↓
calculateEmergencyReserve() → reserveAmount, coveredMonths
calculateFreedomIndex() → pilar de caixa, reserva, patrimonio
    ↓
KernelResult → Home, Domus
```

### 5.3 Distincao critica

| Metrica | Escopo | Fonte |
|---------|--------|-------|
| `localTotalBalance` (modulo Contas) | Contas do contexto ativo | `filteredAccounts.reduce(...)` |
| `cashBalance` (Financial Core) | Contas `owner !== "PJ"` | `financial-core.ts:71-73` |

**`localTotalBalance` ≠ `cashBalance` quando contexto ativo = PJ.**
**`localTotalBalance` = `cashBalance` apenas quando contexto = PF.**

O Summary do modulo Contas e uma metrica local de escopo — nao substitui nem recalcula o `cashBalance` do Financial Core.

---

## 6. TRANSFERENCIAS

- Transactions tem `type: 'transfer'`, `fromAccountId`, `toAccountId`
- Existe `transfer-reconciliation-engine.ts` para matching de pares
- Existe `transferPairId` e `transferConfidence`
- **MAS transfers NAO atualizam account.balance** — porque balance e manual

**Impacto no Mobile:** Transferencias sao um conceito de transacao (fluxo), nao de conta (estoque). Nao faz sentido ter acao "Transferir" em Contas se ela nao atualiza saldos. A acao pertence ao modulo de transacoes (Pessoal/Lancamentos).

---

## 7. CRUD

| Operacao | Funcao | UI atual | Mobile | Mudanca CR-02 |
|----------|--------|:--------:|:------:|:------------:|
| Read | `getAccountsWithBalance()` | ✅ | ✅ | — |
| Create | `addAccount()` — backend aceita `balance: number` | ✅ Dialog (balance=0 hardcoded) | Bottom Sheet (com campo Saldo) | UI: expor campo Saldo. Backend ja suporta. |
| Update | `updateAccount()` — inclui balance | ✅ Dialog | Bottom Sheet | — |
| Delete | `deleteAccount()` — hard delete | ❌ Nao exposto | Confirmation Sheet | — |

### 7.1 Add Account — Saldo inicial

**CR-02 aprovado.** O backend (`accounts.ts:72`) ja aceita `balance: number`. A UI atual (`new-account-dialog.tsx:51`) hardcoded `balance: 0`. A UI Mobile deve expor o campo "Saldo informado" com valor default `0` e helper: "Voce pode editar o saldo depois."

### 7.2 Delete — Risco

`deleteAccount()` faz hard delete sem verificar transacoes associadas. O campo `accountId` nas transacoes e opcional, entao o delete nao quebra relacoes obrigatorias — mas perde a referencia historica.

**Classificacao:** `CONTAS-P2` — Delete nao tem protecao contra perda de dados historicos.

---

## 8. CONTEXTO PF / FAMILIA / PJ — ATUALIZADO CR-01

### 8.1 Contexto ativo (Context Switcher global)

**CR-01 aprovado.** O modulo Contas respeita o Context Switcher global e mostra apenas contas do contexto ativo.

| Contexto | Filtro | Exemplo |
|----------|--------|---------|
| Pessoal | `owner === 'PF'` | Contas pessoais |
| Empresa A | `owner === 'PJ' && companyId === 'empresaA_id'` | Contas da Empresa A |
| Empresa B | `owner === 'PJ' && companyId === 'empresaB_id'` | Contas da Empresa B |
| Familia | `owner === 'PF' && householdId === 'familia_id'` | ❌ NAO IMPLEMENTADO |

### 8.2 Comportamento ao trocar contexto

```
Context Switch:
1. Sheet fecha
2. Lista recarrega com novo filtro
3. Summary recalcula (localTotalBalance do novo contexto)
4. Scroll volta ao topo
5. Detail fecha (se aberto)
6. Domus recebe novo financialContext
7. Bottom Nav preserva destino ativo
```

### 8.3 Contexto ausente no modulo

Se a rota atual nao existe no novo contexto (ex: estava em modulo exclusivo PJ, trocou para PF):
- Redireciona para Home
- Sem mensagem de erro. A Home mostra o estado correto.

---

## 9. OBJETIVO MOBILE

> O modulo Contas ajuda o usuario a saber **quanto dinheiro esta em cada conta e onde ele esta**.

**Pergunta central:**

> "Quanto tenho em contas? Onde esse dinheiro esta distribuido?"

---

## 10. PROTAGONISTA

**Decisao: SALDO TOTAL DO CONTEXTO ATIVO (`localTotalBalance` = Σ filteredAccounts.balance)**

Nao ha concorrencia real — e a unica metrica agregada significativa do modulo.

| Candidato | Avaliacao |
|-----------|-----------|
| Saldo total do contexto ativo | ✅ Direto. Soma dos balances filtrados por contexto. |
| Cobertura da reserva | ⚠️ Derivado do `calculateEmergencyReserve`. Nao e especifico de Contas. |
| Quantidade de contas | ⚠️ Contexto, nao protagonista. |

---

## 11. ARQUITETURA DE INFORMACAO — CORRIGIDA CR-01

```
Contas
│
└── 1 tela sem tabs
    ├── Header: ← Origem  Contas  [◈ Domus]
    ├── Summary: saldo total do contexto ativo + contexto
    ├── Insight Domus (0-1)
    ├── Primary Action: Adicionar conta
    ├── Lista unica: contas do contexto ativo
    └── Bottom Nav
```

### 11.1 Antes vs Depois (CR-01)

| Elemento | Antes (Architecture v1) | Depois (Correction v1) |
|----------|------------------------|------------------------|
| Lista | 2 secoes (PF + PJ simultaneas) | 1 lista (contexto ativo) |
| Summary | PF + PJ somados | Apenas contexto ativo |
| Section Labels | "PESSOAL" / "EMPRESARIAL" | Removidas (contexto visivel no sistema) |
| Add Account | Seletor owner PF/PJ | Contexto pre-definido pelo Context Switcher |
| Empresa (PJ) | Seletor de empresa manual | Pre-preenchido com empresa ativa |

---

## 12. ANATOMIA — CORRIGIDA

```
390 × 844px · Contexto: Pessoal (PF)

┌──────────────────────────────────────────────────────────────┐
│ ← Inicio    Contas                           [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ SALDO EM CONTAS                                          ││
│  │                                                          ││
│  │ R$ 10.700                                                ││ ← 36px hero
│  │                                                          ││
│  │ 2 contas · Pessoal                                       ││ ← contexto ativo
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight (0-1)
│  │ ◈ Domus                                                  ││
│  │ 72% do saldo cadastrado esta concentrado                 ││
│  │ em uma unica conta.                                      ││
│  │ Entender                                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Primary Action
│  │              + Adicionar conta                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← List Item (56px)
│  │ [IT]  Itau PF                             R$ 8.200  →   ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [NU]  Nubank                              R$ 2.500  →   ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Inicio   Modulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Contexto PJ (Empresa TreeTech Automation)

```
Summary: SALDO EM CONTAS
         R$ 42.500
         3 contas · TreeTech Automation

List:
[IT] Itau PJ                 R$ 28.000  →
[SA] Santander PJ            R$ 12.000  →
[BB] Banco do Brasil PJ      R$  2.500  →
```

---

## 13. ACCOUNT LIST ITEM

Altura 56px (Standard — Universal Pattern). Iniciais da instituicao + nome + tipo + saldo + chevron.

Para 50 contas: scroll natural. Search sob demanda (icone no header para 10+ contas).

---

## 14. ACCOUNT DETAIL

Acessivel via toque no item da lista.

```
┌──────────────────────────────────────────────────────────────┐
│ ← Contas    Itau PF                          [◈] [···]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Detail Summary
│  │ Conta Corrente · Pessoal                                 ││
│  │                                                          ││
│  │ Saldo informado                                          ││ ← comunica manualidade
│  │ R$ 8.200                                                 ││ ← 28px, 700w
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Detail Info
│  │ Tipo            Conta Corrente                           ││
│  │ Proprietario    Pessoal (PF)                             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Actions
│  │              Editar conta                                 ││
│  │              Excluir conta                                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
└──────────────────────────────────────────────────────────────┘
```

### Conta legada (credit_card / investment)

Para registros `type: 'investment'` ou `type: 'credit_card'`, o Detail mostra:

```
Tipo            Investimento (legado)
```

O label "(legado)" aparece apenas no Detail — nao na lista principal. O registro e tratado como qualquer outra conta para calculo.

---

## 15. ADD ACCOUNT — CORRIGIDO CR-02, CR-03, CR-04

Bottom Sheet. Campos:

| Campo | Tipo | Default | Notas |
|-------|------|:------:|-------|
| Nome | Input texto | — | Obrigatorio |
| Tipo | Select | `checking` | Opcoes: Conta Corrente, Poupanca, Carteira (apenas tipos ativos) |
| Saldo informado | Input financeiro | `R$ 0,00` | CR-02: campo exposto. Teclado numerico. |
| Contexto | Informativo | Contexto ativo | Ex: "Conta pessoal" ou "Empresa Alfa". Nao editavel. |

**CR-02 implementado:** Backend (`accounts.ts:72`) ja aceita `balance: number`. A UI Mobile expoe o campo "Saldo informado".

**CR-03/CR-04 implementado:** `credit_card` e `investment` removidos das opcoes de tipo para novas contas.

### Contexto PF

```
Nova conta

Nome:       [_______________]
Tipo:       [Conta Corrente ▾]
Saldo informado: [R$ 0,00]

Conta pessoal
(seu contexto ativo)

          [Salvar conta]
```

### Contexto PJ

```
Nova conta

Nome:       [_______________]
Tipo:       [Conta Corrente ▾]
Saldo informado: [R$ 0,00]

Empresa TreeTech Automation
(seu contexto ativo)

          [Salvar conta]
```

Nao ha seletor de owner PF/PJ nem seletor de empresa — ambos vem do Context Switcher.

---

## 16. EDIT ACCOUNT — CORRIGIDO

Bottom Sheet. Campos: Nome, Tipo, Saldo. Contexto e empresa (se PJ) sao informativos.

### Conta normal

| Campo | Comportamento |
|-------|--------------|
| Nome | Editavel |
| Tipo | Select: Conta Corrente, Poupanca, Carteira |
| Saldo | Input financeiro. Helper: "O saldo desta conta e mantido manualmente no FinDomus." |
| Contexto | Informativo (nao editavel) |

### Conta legada (credit_card / investment)

| Campo | Comportamento |
|-------|--------------|
| Nome | Editavel |
| Tipo | Mostra valor legado. Nao editavel OU editavel mas sem opcoes legadas. |
| Saldo | Editavel |
| Contexto | Informativo |

**Decisao para tipo legado no Edit:** Manter valor legado visivel. Permitir editar outros campos (nome, saldo). Nao oferecer o tipo legado na lista de opcoes de tipo. Se o usuario quiser reclassificar, precisa de migracao dedicada.

---

## 17. DELETE ACCOUNT

Confirmation Sheet. Sem protecao contra perda de historico (P2 existente).

```
Excluir conta?

[IT] Itau PF · Conta Corrente · R$ 8.200

A conta sera removida do FinDomus.

          [Excluir conta]
          [Cancelar]
```

### Delete com transacoes associadas

```
⚠️ Esta conta possui X transacoes associadas.
As transacoes nao serao excluidas, mas
a referencia a esta conta sera perdida.

          [Excluir assim mesmo]
          [Cancelar]

⚠️ REQUIRES IMPLEMENTATION
```

---

## 18. DOMUS CONTEXTUAL — ATUALIZADO CR-01

Icone no header. Contexto:

```js
{
  financialContext: "PF" | "PJ",
  companyId: string | null,
  moduleContext: "contas",
  activeAccount: { id, name, type, balance } | null
}
```

Perguntas suportadas:
- "Quanto tenho informado nas contas deste contexto?" ✅ (`localTotalBalance`)
- "Qual conta tem maior saldo?" ✅ (sort by balance)
- "Como o saldo deste contexto esta distribuido?" ✅ (maior conta / total)
- "Como isso afeta meu patrimonio?" ✅ (cashBalance → netWorth)
- "Quanto posso gastar?" ❌ (saldo ≠ disponibilidade)

---

## 19. EMPTY STATE

```
┌──────────────────────────────────────────────────────────────┐
│              [icone Landmark, 48px]                            │
│                                                              │
│       Nenhuma conta cadastrada                               │
│                                                              │
│   Cadastre suas contas correntes, poupancas                  │
│   ou carteiras para acompanhar seus saldos.                  │
│                                                              │
│     ┌────────────────────────────────────────┐               │
│     │        Adicionar conta                 │               │
│     └────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

---

## 20. FINANCIAL INTEGRITY REVIEW — ATUALIZADA

| Verificacao | Status |
|-------------|:------:|
| Balance source of truth | `account.balance` — campo manual. Unica fonte. ✅ |
| Transacoes NAO alteram balance | Confirmado. Sem dupla contagem nesse aspecto. ✅ |
| Transferencias NAO alteram balance | Confirmado. Sem risco de alterar total indevidamente. ✅ |
| cashBalance = Σ owner !== "PJ" | Confirmado. Filtro correto. ✅ |
| Delete sem protecao | Hard delete, sem check de transacoes. ⚠️ P2 |
| Saldo manual sem audit trail | Usuario edita livremente. Sem historico. ⚠️ P2 |
| **investment account → dupla contagem** | **COMPROVADO. `grossAssets = cashBalance + investmentValue` soma investment account (via cashBalance) + investment entity (via investmentValue).** | ❌ P0 |
| **credit_card account → cashBalance** | Contas credit_card PF entram em cashBalance como se fossem caixa. Representacao incorreta. | ⚠️ P1 |

---

## 21. CAPABILITY MATRIX — CORRIGIDA

| Capacidade | Backend | UI Atual | Mobile UX | Gap |
|------------|:-------:|:--------:|:---------:|-----|
| Saldo total (contexto ativo) | ✅ soma filter | ❌ PF+PJ misto | ✅ Summary | UI: filter |
| Lista contexto ativo | ✅ filter owner/companyId | ❌ 2 secoes | ✅ 1 lista | UI: context filter |
| CRUD Create | ✅ Firestore (suporta balance) | ✅ Dialog (balance=0 hardcoded) | ✅ Bottom Sheet (com saldo) | UI: expor campo |
| CRUD Update | ✅ Firestore | ✅ Dialog | ✅ Bottom Sheet | Adaptar |
| CRUD Delete | ✅ Firestore | ❌ Nao exposto | ✅ Confirmation Sheet | ADICIONAR |
| Reserva emergencia | ✅ | ✅ KPI card | — (pertence a Home) | REMOVE do modulo |
| Freedom Index | ✅ | ✅ KPI card | — (pertence a Home) | REMOVE do modulo |
| Domus contextual | ❌ | ❌ | ✅ Header | CRIAR |
| Historico transacoes | — | — | — (Pessoal cobre) | NAO DUPLICAR |
| Saldo inicial na criacao | ✅ (backend) | ❌ (UI hardcoded 0) | ✅ (CR-02) | UI: expor campo |
| Tipos ativos Mobile | ✅ (checking, savings, wallet) | — | ✅ (CR-03, CR-04) | Documentar |
| Legado credit_card/investment | ✅ preservado | — | ✅ visivel, nao criavel | Migracao futura |

---

## 22. CURRENT → MOBILE MAP — CORRIGIDO

| Desktop | Mobile | Acao | CR |
|---------|--------|------|:--:|
| 1 tela sem tabs | 1 tela sem tabs | KEEP | — |
| 3 KPI cards | 1 Summary superficie | MERGE | — |
| Reserva Emergencia (KPI) | Removido do modulo | REMOVE | — |
| Freedom Index (KPI) | Removido do modulo | REMOVE | — |
| Secoes PF/PJ simultaneas | Lista unica (contexto ativo) | CHANGE | CR-01 |
| Add Dialog (balance=0) | Bottom Sheet (campo Saldo) | CHANGE | CR-02 |
| Tipos: 5 opcoes | Tipos: 3 ativos + 2 legado visivel | CHANGE | CR-03, CR-04 |
| Avatar de banco (iniciais) | Avatar de banco | KEEP | — |
| Edit Dialog | Bottom Sheet | ADAPT | — |
| Delete (nao exposto) | Confirmation Sheet | ADICIONAR | — |
| Domus contextual (inexistente) | Icone no header | CRIAR | — |

---

## 23. ACHADOS — CORRIGIDOS

### CONTAS-P0
| ID | Descricao |
|----|-----------|
| P0-01 | `totalBalance` misturava PF+PJ enquanto `cashBalance` usa apenas PF. **RESOLVIDO:** modulo usa contexto ativo, alinhado ao Financial Core. |
| P0-02 | Contas `investment` PF causam dupla contagem em `grossAssets = cashBalance + investmentValue`. **DOCUMENTADO.** Requer migracao/auditoria de dados. |

### CONTAS-P1
| ID | Descricao |
|----|-----------|
| P1-01 | Context Switcher conflitava com secoes PF/PJ. **RESOLVIDO:** CR-01 aprovado. |
| P1-02 | `credit_card` como account type — tratado como caixa. **RESOLVIDO para novas contas:** CR-03 aprovado. Legado: requer auditoria. |
| P1-03 | `investment` como account type — risco de dupla contagem. **RESOLVIDO para novas contas:** CR-04 aprovado. Legado: requer auditoria. |
| P1-04 | Add Account sem campo saldo. **RESOLVIDO:** CR-02 aprovado. Backend ja suporta. |

### CONTAS-P2
| ID | Descricao |
|----|-----------|
| P2-01 | `deleteAccount()` nunca chamado da UI. Precisa conectar. |
| P2-02 | Delete sem verificacao de transacoes associadas. |
| P2-03 | Domus contextual nao implementado. |
| P2-04 | Contexto Familia nao implementado. |
| P2-05 | Search sob demanda para 10+ contas. |
| P2-06 | State restoration entre sessoes. |

### CONTAS-P3
| ID | Descricao |
|----|-----------|
| P3-01 | Deep links: `/contas?id=abc123`. |
| P3-02 | Draft preservation no Add/Edit Sheet. |
| P3-03 | Animacao List → Detail. |
| P3-04 | Pull-to-refresh. |
| P3-05 | Haptics no delete. |

---

## 24. CHANGE REQUESTS APROVADOS

| ID | Descricao | Status |
|----|-----------|:------:|
| `CONTAS-ARCH-CR-01` | Context Switcher substitui secoes PF/PJ | ✅ Aprovado / Documentado |
| `CONTAS-ARCH-CR-02` | `addAccount()` expor campo saldo inicial | ✅ Aprovado / Backend ja suporta |
| `CONTAS-ARCH-CR-03` | Remover `credit_card` de novas contas | ✅ Aprovado / Legado preservado |
| `CONTAS-ARCH-CR-04` | Remover `investment` de novas contas | ✅ Aprovado / Legado preservado |

---

## 25. RECOMENDACAO FINAL

O Contas Mobile Architecture v1, corrigido pelos quatro Change Requests, define um modulo enxuto (1 tela sem tabs), com protagonista claro (saldo do contexto ativo), CRUD simplificado e respeito absoluto a realidade do dominio: **saldo manual, sem reconciliacao automatica, sem transferencias no modulo, sem duplicacao de transacoes**.

Os riscos de dupla contagem (`investment` account) e classificacao incorreta (`credit_card`) estao documentados. Para novas contas, estes tipos foram removidos. Registros legados permanecem visiveis ate migracao segura.

**Estado final:**

```
CONTAS-P0 = 1 (P0-02: dupla contagem investment — documentado, requer migracao)
CONTAS-P1 = 0 ✅ (todos resolvidos pelos CRs aprovados)
CONTAS-P2 = 6
CONTAS-P3 = 5
```

**Próximo passo:** `CONTAS-P0 = 1` (dupla contagem investment) requer auditoria de dados de producao e plano de migracao antes do Master Visual. O wireframe pode prosseguir — a UX de novas contas esta correta; o risco e apenas nos dados legados existentes.

---

*FinDomus Contas Mobile Architecture v1 · Fase 20.1 · CORRECTED / HOMOLOGATED*

---

## 26. CHANGE LOG

| Versao | Data | Descricao |
|--------|------|-----------|
| v1 | 2026-07-29 | Architecture original homologada. |
| v1-corrected | 2026-07-30 | CR-01 (contexto ativo), CR-02 (saldo inicial), CR-03 (credit_card), CR-04 (investment). Dupla contagem documentada. Contratos atualizados. |
