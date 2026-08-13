# FINDOMUS — CONTAS LEGACY COMPATIBILITY v1

**Fase:** 20.1 — Architecture & Wireframe Correction
**FDL:** 1.0 FROZEN
**Status:** HOMOLOGATED

---

## 1. RESUMO EXECUTIVO

O modulo Contas possui dois tipos legados (`credit_card` e `investment`) que foram removidos das opcoes de criacao de novas contas Mobile (CR-03 e CR-04). Registros existentes destes tipos permanecem visiveis e funcionais, mas requerem plano de migracao antes do lancamento em producao.

Este documento define o contrato de compatibilidade para estes registros: como eles se comportam na leitura, edicao, calculos e migracao futura.

---

## 2. TIPOS LEGADOS

| Tipo | Label Mobile | Criado antes de | Risco principal | Migracao destino |
|------|-------------|:--------------:|-----------------|-------------------|
| `credit_card` | Cartao de Credito (legado) | Fase 20.1 | Classificacao incorreta no `cashBalance` | Passivos ou modulo Cartoes |
| `investment` | Investimento (legado) | Fase 20.1 | **Dupla contagem comprovada** no `grossAssets` | Entidades de Investimento |

---

## 3. COMPORTAMENTO DE LEITURA

### 3.1 Lista principal

Registros legados sao exibidos normalmente na lista de contas. Nao recebem badge visual diferenciado.

```
┌──────────────────────────────────────────────────────────┐
│ [IT]  Itau PF                             R$ 8.200  →   │ ← normal
│       Conta Corrente                                     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [XP]  XP Investimentos                   R$ 10.000  →   │ ← investment legado
│       Investimento (legado)                              │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [NU]  Nubank Cartao                      R$ -2.000  →   │ ← credit_card legado
│       Cartao de Credito (legado)                         │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Detail

O Detail de um registro legado mostra o tipo com qualificador "(legado)" apenas na secao Info.

```
┌──────────────────────────────────────────────────────────┐
│ ← Contas    XP Investimentos              [◈ Domus] [···]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Investimento · Pessoal                               ││
│  │                                                      ││
│  │ Saldo informado                                      ││
│  │ R$ 10.000                                            ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Tipo                                                 ││
│  │ Investimento (legado)                                ││ ← qualificador sutil
│  │                                                      ││
│  │ Proprietario                                         ││
│  │ Pessoal (PF)                                         ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Editar conta                             ││
│  │              Excluir conta                            ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## 4. COMPORTAMENTO DE EDICAO

### 4.1 Regra geral

Registros legados podem ser editados. O campo `tipo` mantem o valor legado e nao oferece opcoes de reclassificacao.

| Campo | Comportamento |
|-------|--------------|
| Nome | Editavel normalmente |
| Tipo | **Congelado.** Exibe valor atual. Select desabilitado. |
| Saldo | Editavel normalmente. Helper "O saldo desta conta e mantido manualmente no FinDomus." |
| Outros | Editaveis conforme contrato normal |

### 4.2 Por que nao permitir reclassificacao?

Reclassificar um registro `investment` para `checking` ou `credit_card` para `wallet` sem auditoria previa pode:
1. Alterar `cashBalance` e `netWorth` retroativamente sem rastro.
2. Esconder o problema sem resolve-lo.
3. Dificultar a auditoria de dupla contagem.

Reclassificacao so deve ocorrer como parte de um plano de migracao dedicado, com snapshot pre-migracao e validacao de totais.

---

## 5. COMPORTAMENTO DE CRIACAO (NOVAS CONTAS)

Tipos legados **NAO** aparecem no select de tipo do Add Account Sheet Mobile.

### Opcoes disponiveis (Mobile)

| Valor | Label |
|-------|-------|
| `checking` | Conta Corrente |
| `savings` | Poupanca |
| `wallet` | Carteira |

### Impacto no Desktop

O Desktop (`new-account-dialog.tsx:101-102`) **ainda** oferece `investment` e `credit_card` como opcoes. Esta discrepancia deve ser resolvida na implementacao Mobile ou em fase separada.

**Recomendacao:** Alinhar Desktop com Mobile — remover `investment` e `credit_card` do `new-account-dialog.tsx` e `edit-account-dialog.tsx` simultaneamente a implementacao Mobile.

---

## 6. CALCULOS

### 6.1 cashBalance (Financial Core)

Registros legados continuam sendo somados ao `cashBalance` normalmente.

```typescript
// financial-core.ts:71-73
const cashBalance = accounts
  .filter((account) => account.owner !== "PJ")
  .reduce((sum, account) => sum + Number(account.balance || 0), 0);
```

**Impacto:**
- Contas `investment` PF: somadas ao `cashBalance`. **Risco de dupla contagem** (ver secao 7).
- Contas `credit_card` PF: somadas ao `cashBalance`. **Classificacao incorreta** — cartao de credito nao e caixa.

### 6.2 Dashboard / netWorth

```typescript
// dashboard-real.ts:159
const netWorthValue = totalAccounts + totalInvestments - totalLiabilities;
```

`totalAccounts` inclui todas as contas PF+PJ, inclusive `investment`. `totalInvestments` inclui entidades de Investimento. **Dupla contagem confirmada quando ambos existem para o mesmo ativo.**

### 6.3 Modulo Contas (Mobile)

O `localTotalBalance` (Summary do modulo) soma todos os `balance` das contas do contexto ativo, incluindo legados. Isso e intencional — o modulo mostra o que o usuario cadastrou.

---

## 7. DUPLA CONTAGEM — INVESTMENT

### 7.1 Cenario comprovado

```
1. Usuario criou Account {
     type: 'investment',
     balance: 10000,   // ← valor manual
     owner: 'PF'
   }

2. Usuario criou Investment entity {
     currentValue: 10000,   // ← mesmo ativo
     type: 'Renda Fixa'
   }

3. calculateFinancialCore():
   cashBalance = 10000       (investment account PF)
   investmentValue = 10000   (investment entity)
   grossAssets = 20000       ← DUPLA CONTAGEM

4. dashboard-real.ts:
   totalAccounts = 10000     (inclui investment account)
   totalInvestments = 10000  (entidade)
   netWorthValue = 20000 - liabilities  ← DISTORCIDO
```

### 7.2 Confirmacao no codigo

- `financial-core.ts:71-73`: `cashBalance` nao filtra por tipo — apenas `owner !== "PJ"`.
- `financial-core.ts:75-78`: `investmentValue` soma entidades separadas de `investments[]`.
- `financial-core.ts:97`: `grossAssets = cashBalance + investmentValue` — soma direta, sem deduplicacao.
- `dashboard-real.ts:159`: `netWorthValue = totalAccounts + totalInvestments - totalLiabilities` — mesmo problema.

**Nao existe mecanismo de deduplicacao entre `accounts[type=investment]` e `investments[]`.**

### 7.3 Classificacao

**`CONTAS-WF-P0`** — Risco comprovado de distorcao do patrimonio liquido. Impacta `netWorth`, Freedom Index, Emergency Reserve e Home.

---

## 8. CREDIT_CARD — CLASSIFICACAO INCORRETA

### 8.1 Cenario

```
Account {
  type: 'credit_card',
  balance: -2000,   // ← fatura/divida
  owner: 'PF'
}

calculateFinancialCore():
  cashBalance = cashBalance - 2000  ← tratado como dinheiro negativo
```

### 8.2 Problemas

1. **Cartao de credito nao e caixa:** `balance` negativo reduz `cashBalance` como se fosse dinheiro retirado.
2. **Cartao de credito nao e conta de saldo:** `balance` positivo em cartao de credito e conceitualmente problematico.
3. **Potencial dupla contagem com Passivos:** Se o mesmo cartao existe como `Liability`, ha dupla subtracao do `netWorth`.
4. **Modulo `/cartoes` e redirect:** `src/app/(main)/cartoes/page.tsx` faz `redirect('/passivos')`. Nao ha tratamento proprio.

### 8.3 Classificacao

**`CONTAS-WF-P1`** — Risco de representacao incorreta. Nao compromete diretamente o `netWorth` (ao contrario de `investment`), mas distorce a composicao do `cashBalance`.

---

## 9. MIGRACAO FUTURA

### 9.1 Pre-requisitos

Antes de qualquer migracao:

1. **Snapshot pre-migracao:** Registrar `netWorth`, `cashBalance`, `grossAssets` antes da migracao.
2. **Auditoria de dupla contagem:** Identificar usuarios com `investment` accounts + `investment` entities para o mesmo ativo.
3. **Auditoria de credit_card:** Identificar usuarios com `credit_card` accounts + passivos correspondentes.
4. **Dry-run:** Executar migracao em ambiente isolado. Validar totais.
5. **Validacao de totais:** Confirmar que `netWorth` pos-migracao e consistente.

### 9.2 Plano para investment

```
1. Identificar todas as accounts com type = 'investment'
2. Para cada uma, verificar se existe Investment entity correspondente
3. Se duplicado:
   - Remover account (o valor ja esta em investmentValue)
   - OU ajustar balance para 0
   - Registrar no audit log
4. Se nao duplicado (sem Investment entity):
   - Criar Investment entity com currentValue = account.balance
   - Remover account
   - Registrar no audit log
5. Recalcular kernel e verificar consistencia
```

### 9.3 Plano para credit_card

```
1. Identificar todas as accounts com type = 'credit_card'
2. Para cada uma, verificar se existe Liability correspondente
3. Se balance < 0 (divida):
   - Criar Liability se nao existir
   - OU ajustar Liability existente
   - Remover account
4. Se balance >= 0 (raro, provavelmente erro):
   - Reclassificar para checking ou wallet
   - Auditar manualmente
5. Recalcular kernel e verificar consistencia
```

### 9.4 Rollback

Manter snapshot pre-migracao por no minimo 30 dias. Capacidade de restaurar registros originais em caso de inconsistencia detectada.

---

## 10. CRITERIOS DE REMOCAO DO LEGADO

Registros legados podem ser removidos do sistema quando:

1. Todos os registros `investment` foram migrados para entidades de Investimento.
2. Todos os registros `credit_card` foram migrados para Passivos ou reclassificados.
3. `netWorth`, `cashBalance` e `grossAssets` pos-migracao foram validados.
4. Kernel, Home e Freedom Index refletem valores corretos.
5. Período de rollback expirou sem incidentes.

Somente apos esses criterios:

- Remover `investment` e `credit_card` do select de tipo no Desktop.
- Remover documentacao de legado (este documento pode ser arquivado).
- Remover tratamento condicional de "tipo legado" no Detail.

---

## 11. RISK MATRIX

| Tipo | Risco | Gravidade | Probabilidade | Impacto |
|------|-------|:---------:|:------------:|:-------:|
| `investment` | Dupla contagem no `grossAssets`/`netWorth` | P0 | Media (depende de usuario ter ambos) | Distorcao do patrimonio |
| `credit_card` | Classificacao incorreta no `cashBalance` | P1 | Media | Distorcao da composicao de caixa |
| `credit_card` | Dupla contagem com Passivos | P1 | Baixa | Distorcao do patrimonio |
| Ambos | Dado removido sem auditoria | P0 | Baixa (controlada) | Perda de rastro financeiro |

---

## 12. RESPONSABILIDADES

| Papel | Responsabilidade |
|-------|-----------------|
| Arquitetura | Definir plano de migracao detalhado |
| Backend | Implementar scripts de migracao e rollback |
| Dados | Auditar registros legados em producao |
| QA | Validar totais pre e pos-migracao |
| Mobile | Implementar UX de compatibilidade (tipos legados visiveis, nao criaveis) |
| Desktop | Alinhar com Mobile (remover tipos legados do Add/Edit) |

---

## 13. CHANGE LOG

| Versao | Data | Descricao |
|--------|------|-----------|
| v1 | 2026-07-30 | Documento inicial. CR-03/CR-04 incorporados. Dupla contagem investment comprovada (P0). Credit card classificado (P1). Plano de migracao esbocado. |

---

*FinDomus Contas Legacy Compatibility v1 · Fase 20.1 · HOMOLOGATED*
