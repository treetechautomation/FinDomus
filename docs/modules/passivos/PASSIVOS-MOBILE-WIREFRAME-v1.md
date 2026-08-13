# FINDOMUS — PASSIVOS MOBILE WIREFRAME v1

**Fase:** 17 — Wireframe Mobile do Módulo Passivos
**FDL:** 1.0 FROZEN
**Passivos Architecture:** v1 homologada
**Universal Module Pattern:** v1 homologado (tipo P — Portfolio)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Viewport de referência:** 390 × 844px

---

## 1. RESUMO EXECUTIVO

Este wireframe prova que o módulo Passivos funciona em 2 tabs mobile com 20 estados mapeados. O protagonista (saldo devedor total) ocupa um Summary de 1 superfície. O progresso global usa a fórmula do `payoffProgress.percentComplete` do snapshot (`(totalBorrowed − totalLiabilities) / totalBorrowed × 100`), validada matematicamente. A projeção compacta mostra 4 meses sem juros. A lista escala para 20 dívidas. O tratamento emocional é rigoroso: zero ansiedade, zero culpa, zero linguagem de cobrança.

---

## 2. VERIFICAÇÃO DE FÓRMULAS

### Progresso global (snapshot builder)

```
totalBorrowed = Σ(installmentValue × totalInstallments)  ← estimativa do valor original total
totalLiabilities = Σ(remainingBalance)                     ← saldo devedor atual
totalPaid = totalBorrowed − totalLiabilities
percentComplete = (totalPaid / totalBorrowed) × 100
```

**Validade:** ✅ Fórmula existe no `liability-snapshot-builder.ts:48-51`. Usa `totalBorrowed` como ESTIMATIVA (não é valor contratual armazenado). O wireframe deve rotular como "estimativa".

### Progresso por passivo

```
progress = (currentInstallment / totalInstallments) × 100
```

**Validade:** ✅ Fórmula em `page.tsx:175`. Mede progresso de parcelas, não progresso financeiro.

### Semântica de `currentInstallment`

O campo `currentInstallment` começa em 1 no `addLiability`. No `upsertLiabilityFromInstallmentTransaction`, é setado como o número da parcela atual da transação importada. No `addLiabilityPayment`, é atualizado para o `installmentNumber` do pagamento.

**Conclusão:** `currentInstallment` representa a **última parcela paga/registrada**. `18/48` significa que 18 parcelas foram pagas de 48 totais. É um progresso de parcelas, não de valor.

---

## 3. MEDIDAS ESTRUTURAIS

| Elemento | Medida | Token |
|----------|:------:|-------|
| Header | 48px | Universal Pattern |
| Tabs | 44px | Universal Pattern |
| Summary | ~100px | Variável |
| Projeção compacta | ~60px | 4 colunas |
| List item (dívida) | 72px | Com barra de progresso |
| Bottom Nav | 82px | Navigation Wireframe |
| Área útil (390×844) | 708px | 844 − 54 − 82 |

---

## 4. HEADER + TABS

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Passivos                         [◈ Domus]       │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┬────────────────────────────┐  │ ← Tabs (44px)
│ │       Visão Geral          │         Dívidas            │  │
│ │          [ATIVO]           │                            │  │
│ └────────────────────────────┴────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  CONTEÚDO DA TAB ATIVA                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. SUMMARY — COMPARAÇÃO OBRIGATÓRIA

### Opção A — Hero + linha dupla (RECOMENDADO)

```
┌──────────────────────────────────────┐
│ SALDO DEVEDOR                        │
│                                      │
│ R$ 8.400                             │ ← 36px hero
│                                      │
│ Comprometimento      Progresso       │
│ R$ 1.500/mês         62% estimado    │
│                                      │
│ 3 dívidas ativas · 11 meses proj.   │
└──────────────────────────────────────┘
```

### Opção B — Hero + frase

```
┌──────────────────────────────────────┐
│ SALDO DEVEDOR                        │
│                                      │
│ R$ 8.400                             │
│                                      │
│ Você compromete R$ 1.500/mês.        │
│ Cerca de 62% do total estimado       │
│ já foi pago. 3 dívidas ativas.      │
└──────────────────────────────────────┘
```

### Opção C — Hero + 3 linhas compactas

```
┌──────────────────────────────────────┐
│ SALDO DEVEDOR                        │
│                                      │
│ R$ 8.400                             │
│                                      │
│ Mensal       R$ 1.500                │
│ Progresso    62%                     │
│ Ativas       3                       │
└──────────────────────────────────────┘
```

| Critério | A | B | C |
|----------|:-:|:-:|:-:|
| Clareza (saldo vs mensal vs progresso) | **5** | 4 | 3 |
| Calma | **5** | 4 | 4 |
| 375px | **5** | 3 | 5 |
| Privacy (mascarar) | **5** | 3 | 4 |
| Valor alto (R$ 1.2M) | **5** | 4 | 4 |
| 1 dívida | 4 | **5** | 4 |
| 20 dívidas | **5** | 4 | 5 |
| **TOTAL** | **34** | 27 | 29 |

**Decisão: OPÇÃO A — Hero + linha dupla.** Melhor clareza, melhor privacidade, melhor com valores altos.

### Progresso global — VALIDADO

O `payoffProgress.percentComplete` do snapshot builder é uma fórmula válida. O wireframe a utiliza, mas SEMPRE com o rótulo "estimado" — porque `totalBorrowed` não é um valor contratual armazenado.

**Decisão:** Mostrar "62% estimado" no Summary. NUNCA "62% quitado" sem qualificação.

### Summary Label — COMPARAÇÃO

| Label | Avaliação |
|-------|-----------|
| "PASSIVOS" | ✅ Nome do módulo. Consistente. |
| "SALDO DEVEDOR" | ✅ Mais claro para PF. Descreve o protagonista. |

**Decisão:** Usar "SALDO DEVEDOR" como label do Summary. O nome do módulo no header permanece "Passivos". A tab secundária chama-se "Dívidas". Esta distinção resolve a ambiguidade sem renomear o módulo.

---

## 6. TAB 1 — VISÃO GERAL (PASSIVOS-WF-01)

```
390 × 844px · Tab: Visão Geral · Contexto: PF

┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Passivos                         [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┬────────────────────────────┐  │
│ │       Visão Geral          │         Dívidas            │  │
│ │          [ATIVO]           │                            │  │
│ └────────────────────────────┴────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ SALDO DEVEDOR                                            ││
│  │                                                          ││
│  │ R$ 8.400                                                 ││ ← 36px hero
│  │                                                          ││
│  │ Comprometimento mensal    Progresso estimado             ││
│  │ R$ 1.500                  62%                            ││
│  │                                                          ││
│  │ 3 dívidas ativas · 11 meses projetados                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight (0-1)
│  │ ◈ Domus                                                  ││
│  │ Seu financiamento do carro concentra 65%                 ││
│  │ do saldo devedor total.                                  ││
│  │                                                          ││
│  │ Entender                                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Projeção
│  │ COMPROMETIMENTO PROJETADO                                ││
│  │                                                          ││
│  │ ago/26    set/26    out/26    nov/26                     ││
│  │ R$ 1.500  R$ 1.500  R$ 1.380  R$ 960                    ││
│  │                                                          ││
│  │ Ver projeção completa →                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Ações
│  │              [Adicionar passivo]                          ││ ← Primary
│  │                                                          ││
│  │ Simular amortização →                                     ││ ← Secondary
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Projeção compacta — Comparação

| Critério | A: 4 meses em row | B: Barras | C: Lista |
|----------|:---:|:---:|:---:|
| 375px | **5** | 3 | 4 |
| Scan rápido | **5** | 4 | 4 |
| Não parece gráfico bancário | **5** | 2 | 5 |
| Valor alto | **5** | 3 | 5 |
| **TOTAL** | **20** | 12 | 18 |

**Decisão: OPÇÃO A — 4 meses em row.** Mais compacto, mais calmo, não evoca gráfico financeiro.

### Action Hierarchy — Comparação

| Opção | Avaliação |
|:-----:|-----------|
| **A: [Adicionar] primário + Simular secundário** | ✅ Recomendado. Clara hierarquia. |
| B: [Adicionar] + [Simular] ambos primários | Dois CTAs azuis competem. |
| C: Apenas texto, sem botão | Perde affordance para ação principal. |

**Decisão: OPÇÃO A.** 1 primary + 1 secondary.

### Simular amortização — fluxo

A ação "Simular amortização →" na Visão Geral abre um seletor de dívida (Bottom Sheet com lista de passivos ativos), pois a simulação requer `liabilityId`. Se acionada do Detail, o `id` já está definido.

---

## 7. TAB 2 — DÍVIDAS (PASSIVOS-WF-02)

```
390 × 844px · Tab: Dívidas

┌──────────────────────────────────────────────────────────────┐
│ ← Início    Passivos                         [◈ Domus]       │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┬────────────────────────────┐  │
│ │       Visão Geral          │         Dívidas            │  │
│ │                            │          [ATIVO]           │  │
│ └────────────────────────────┴────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Ativas]  [Quitadas]  [Todas]                               │ ← Chips filtro
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← List item (72px)
│  │ Financiamento Carro                    R$ 5.400    →    ││
│  │ Banco Itaú · R$ 850/mês · 18/48 parcelas                ││
│  │ ████████████████████████████░░░░░░░░░░ 38%              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Empréstimo Pessoal                     R$ 2.200    →    ││
│  │ Banco do Brasil · R$ 450/mês · 8/24 parcelas            ││
│  │ ██████████████░░░░░░░░░░░░░░░░░░░░░░░░ 33%              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Cartão Nubank                          R$   800    →    ││
│  │ Nubank · R$ 200/mês · 2/6 parcelas                      ││
│  │ ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 33%              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  3 dívidas ativas                                            │
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### List Item — Comparação

| Opção | 375px | Scan | 20 dívidas | Progresso visível |
|:-----:|:-----:|:----:|:----------:|:-----------------:|
| **A: Nome + instituição + parcela + progresso + saldo** | **5** | **5** | **5** | **5** |
| B: Nome + instituição + saldo + parcela + progresso (expandido) | 3 | 3 | 3 | 5 |
| C: Nome + instituição + saldo (compacto) | 5 | 4 | 5 | 2 |

**Decisão: OPÇÃO A — 72px com barra de progresso.** Progresso é essencial para o domínio. Mostrar sem abrir detail.

### Search — Decisão: NÃO

Com 20 dívidas, o filtro "Ativas/Quitadas/Todas" é suficiente. Search adicionaria complexidade desnecessária para este domínio (diferente de Investimentos com 50+ ativos e tickers).

### Filtro — Comparação

| Formato | Avaliação |
|---------|-----------|
| **A: Chips horizontais** | ✅ Recomendado. Leve, rápido. |
| B: Segmented control | Pesado visualmente para 3 opções. |
| C: Tabs secundárias | Confunde com navegação principal. |

**Decisão: OPÇÃO A — Chips.**

---

## 8. DETAIL DO PASSIVO (PASSIVOS-WF-03)

```
390 × 844px · Detail: Financiamento Carro

┌──────────────────────────────────────────────────────────────┐
│ ← Dívidas   Financiamento Carro              [◈] [···]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary
│  │ Banco Itaú · Financiamento                               ││
│  │                                                          ││
│  │ R$ 5.400                                                 ││ ← 28px, 700w
│  │ saldo devedor                                            ││
│  │                                                          ││
│  │ Parcela mensal       Progresso                           ││
│  │ R$ 850               18/48 parcelas (38%)                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Info
│  │ DETALHES                                                 ││
│  │                                                          ││
│  │ Valor total estimado    R$ 40.800                        ││
│  │ Total já pago (est.)    R$ 15.300                        ││
│  │ Parcelas restantes      30                               ││
│  │ Previsão de término     fev/2028                         ││
│  │                                                          ││
│  │ Os valores de juros não estão disponíveis                ││ ← Honestidade
│  │ para este passivo.                                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Projeção (compacta)
│  │ PRÓXIMOS MESES                                           ││
│  │                                                          ││
│  │ ago/26    set/26    out/26    nov/26    dez/26           ││
│  │ R$ 850    R$ 850    R$ 850    R$ 850    R$ 850           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Actions
│  │ [Editar]    [Simular amortização]    [Excluir]           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Honestidade sobre juros

A linha "Os valores de juros não estão disponíveis para este passivo" é OBRIGATÓRIA. A entidade não armazena taxa de juros. O FinDomus não deve fingir que conhece o custo real dos juros. Esta é uma demonstração de integridade, não uma limitação a esconder.

---

## 9. ADD PASSIVO (PASSIVOS-WF-04)

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro]                             │
├──────────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                         │
│                                                              │
│  Adicionar passivo                                           │
│                                                              │
│  Nome                                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Financiamento Carro                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Tipo                            Instituição                 │
│  ┌────────────────────────────┐  ┌──────────────────────────┐│
│  │ Financiamento       ▾      │  │ Banco Itaú               ││
│  └────────────────────────────┘  └──────────────────────────┘│
│                                                              │
│  Saldo devedor                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ R$ 5.400                                                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Valor da parcela               Total de parcelas           │
│  ┌────────────────────────────┐ ┌───────────────────────────┐│
│  │ R$ 850                     │ │ 48                        ││
│  └────────────────────────────┘ └───────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar passivo                               ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 6 campos em Sheet — Validado

| Verificação | Resultado |
|-------------|:---------:|
| 375px | ✅ Layout vertical/2-colunas. Sem scroll horizontal. |
| Teclado | ✅ Inputs numéricos abrem teclado numérico. Save visível acima do teclado. |
| Scroll | ✅ Sheet permite scroll interno se necessário. 6 campos + save ~400px. Cabe em 80% viewport. |
| Safe area | ✅ Sheet com padding bottom. |

**Sem Change Request.** O Bottom Sheet comporta 6 campos confortavelmente.

### Field order — Decisão

```
Nome → Tipo + Instituição → Saldo devedor → Parcela + Total parcelas → Save
```

Justificativa: Identidade primeiro (nome, tipo, instituição), depois valores (saldo, parcela, total). O saldo devedor é o dado mais importante, aparece antes dos detalhes da parcela.

---

## 10. EDIT + DELETE (PASSIVOS-WF-05/06)

### Edit: Mesmo Sheet do Add, pré-preenchido.

### Delete:

```
┌──────────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                         │
│                                                              │
│  Excluir passivo?                                            │
│                                                              │
│  Financiamento Carro                                         │
│  Saldo devedor: R$ 5.400                                     │
│                                                              │
│  O passivo será removido. Os dados de                        │
│  pagamento associados serão perdidos.                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Excluir                                     ││ ← state-negative
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Cancelar                                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 11. PROJEÇÃO COMPLETA (PASSIVOS-WF-07)

Tela dedicada, acessível via "Ver projeção completa →" na Visão Geral.

```
┌──────────────────────────────────────────────────────────────┐
│ ← Passivos    Projeção                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ COMPROMETIMENTO MENSAL PROJETADO                         ││
│  │                                                          ││
│  │ ago/26    R$ 1.500  ████████████████████████████         ││
│  │ set/26    R$ 1.500  ████████████████████████████         ││
│  │ out/26    R$ 1.380  ██████████████████████████           ││
│  │ nov/26    R$   960  ████████████████████                 ││
│  │ dez/26    R$   850  █████████████████                    ││
│  │ ...                                                       ││
│  │ fev/28    R$     0  —                                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ POR PASSIVO                                              ││
│  │                                                          ││
│  │ Financiamento Carro                                      ││
│  │   ago/26 a jan/28: R$ 850/mês                            ││
│  │                                                          ││
│  │ Empréstimo Pessoal                                       ││
│  │   ago/26 a nov/26: R$ 450/mês                            ││
│  │                                                          ││
│  │ Cartão Nubank                                            ││
│  │   ago/26 a out/26: R$ 200/mês                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Projeção full — Comparação

| Formato | Avaliação |
|---------|-----------|
| **A: Lista mensal com barras** | ✅ Recomendado. Clareza. Sem gráfico desnecessário. |
| B: Line chart | Evoca dashboard. Juros não existem. Gráfico sem sentido. |
| C: Apenas lista | Funciona mas perde noção de proporção entre meses. |

**Decisão: OPÇÃO A.** Barras finas (4px) como indicador de proporção, não como gráfico financeiro.

---

## 12. EMPTY STATES

### Nunca cadastrou (PASSIVOS-WF-09)

```
┌──────────────────────────────────────────────────────────────┐
│              [ícone Landmark, 48px]                           │
│                                                              │
│     Você ainda não cadastrou passivos                        │
│                                                              │
│   Registre financiamentos, empréstimos ou                    │
│   parcelamentos para acompanhar sua evolução.                │
│                                                              │
│     ┌────────────────────────────────────────┐               │
│     │        Adicionar passivo               │               │
│     └────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### Todos quitados (PASSIVOS-WF-10)

```
┌──────────────────────────────────────────────────────────────┐
│              [ícone CheckCircle, 48px, verde]                 │
│                                                              │
│     Todos os passivos cadastrados estão quitados             │
│                                                              │
│   Nenhum saldo devedor ativo no momento.                     │
└──────────────────────────────────────────────────────────────┘
```

**Sem celebração.** Sem "Parabéns!". Sem confete. A informação é suficiente.

---

## 13. ESTADOS

### Privacy (PASSIVOS-WF-16)

Valores monetários mascarados. Progresso percentual visível. Nomes e instituições visíveis. Projeção: valores mascarados, labels de mês visíveis.

### Offline (PASSIVOS-WF-17)

Banner "Você está offline. Dados de 28 de julho." Dados cacheados visíveis. Add/Edit/Delete desabilitados.

### Loading (PASSIVOS-WF-19)

Skeleton: Summary (2 linhas), projeção (4 placeholders), lista (3 placeholders de 72px).

---

## 14. DOMUS CONTEXTUAL (PASSIVOS-WF-20)

```
Contexto enviado:
{
  financialContext: "PF",
  moduleContext: "passivos",
  activeTab: "overview" | "dividas",
  activeLiability: { id, name, type, remainingBalance } | null
}
```

### Perguntas — Classificação de segurança

| Pergunta | Classificação | Justificativa |
|----------|:------------:|---------------|
| "Quanto ainda devo?" | ✅ SUPORTADA | `remainingBalance` |
| "Quanto pago por mês?" | ✅ SUPORTADA | `installmentValue` |
| "Quando termino de pagar?" | ✅ SUPORTADA | Projeção `buildMonthlyProjection` |
| "Como minhas dívidas afetam meu índice?" | ✅ SUPORTADA | Freedom Index pilar dívidas |
| "Qual dívida devo priorizar?" | ⚠️ DADOS INSUFICIENTES | Sem taxa de juros, não há base para avalanche. Maior saldo/parcela NÃO significa "prioridade ótima". |
| "Vale antecipar pagamento?" | ⚠️ PARCIAL | `simulation-engine` suporta `payoff_debt` mas sem juros não calcula economia real. |
| "Quanto pago em juros?" | ❌ NÃO SUPORTADA | `interestAmount = 0`. Sem `interestRate`. |

**Regra crítica:** A Domus NUNCA deve recomendar "priorizar dívida X" baseada apenas em `remainingBalance` ou `installmentValue`. Sem taxa de juros contratual, não existe base para estratégia de quitação ótima. A Domus pode INFORMAR qual é a maior dívida ou maior parcela, mas não pode recomendar prioridade.

---

## 15. CONTRACTS

### Summary Contract
```
Protagonista: saldo devedor total (reservado 36px financial-hero).
Label: "SALDO DEVEDOR" (não "PASSIVOS").
Linha dupla: Comprometimento mensal (esquerda) | Progresso estimado (direita).
Progresso: SEMPRE rotulado como "estimado". Fonte: payoffProgress.percentComplete.
Meta: 3 dívidas ativas · N meses projetados.
Negativo: card NUNCA vermelho. Apenas número é fato.
```

### Debt List Contract
```
Item: 72px altura. Nome + instituição + parcela + progresso (barra 4px) + saldo.
Barra de progresso: 4px, Raised bg, text-tertiary fill.
Filtros: chips [Ativas] [Quitadas] [Todas]. Default: Ativas.
Search: NÃO (20 dívidas não justificam).
Tap: abre Detail.
```

### Debt Detail Contract
```
Header: ← Dívidas + nome do passivo + [◈ Domus] [···].
Summary: instituição + tipo + saldo devedor (28px) + parcela + progresso.
Info: valor total estimado (rotulado como estimativa), total já pago (est.), parcelas restantes, previsão de término.
Honestidade: "Os valores de juros não estão disponíveis para este passivo."
Projeção: 5 meses em row.
Actions: ≤3. Editar, Simular amortização, Excluir.
Delete: Confirmation Sheet com state-negative.
```

### Form Contract
```
Add/Edit: Bottom Sheet. 6 campos. Ordem: Nome → Tipo+Instituição → Saldo → Parcela+Total.
Save: full-width azul. Loading + disabled.
Keyboard: inputs numéricos → teclado numérico. Save visível.
```

---

## 16. COMPLIANCE

| Contrato | Status |
|----------|:------:|
| FDL 1.0 | ✅ |
| Navigation v1 | ✅ |
| Domus v1 | ✅ |
| Universal Module Pattern v1 | ✅ |
| Passivos Architecture v1 | ✅ |

---

## 17. FINANCIAL INTEGRITY

| Verificação | Resultado |
|-------------|:---------:|
| Progresso global: fórmula válida | ✅ `payoffProgress.percentComplete` |
| Progresso rotulado como "estimado" | ✅ |
| Sem juros: interface não finge | ✅ Linha de honestidade no Detail |
| Sem recomendação de prioridade sem taxa | ✅ Domus limitada a informar, não recomendar |
| currentInstallment semântica validada | ✅ Última parcela paga/registrada |
| Dupla contagem | ✅ cashBalance ≠ liabilities |
| Add Sheet com 6 campos | ✅ Validado em 375px |

---

## 18. CURRENT → WIREFRAME MAP

| Desktop | Mobile | Ação |
|---------|--------|------|
| 1 tela sem tabs | 2 tabs (Visão Geral + Dívidas) | ADAPT |
| 3 StatCards | 1 Summary superfície | MERGE |
| Projeção 6 meses grid | Projeção compacta 4 meses row | ADAPT |
| Grid de cards de passivos | Lista de itens 72px | ADAPT |
| "Simular Amortização" link por passivo | Ação secundária + seletor de dívida | ADAPT |
| Sem edit/delete na UI | Bottom Sheet (Edit) + Confirmation (Delete) | ADICIONAR |
| Sem Domus | Ícone no header | CRIAR |

---

## 19. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**PASSIVOS-WF-P0: 0 · PASSIVOS-WF-P1: 0 · PASSIVOS-WF-P2: 2 · PASSIVOS-WF-P3: 2**

### P2

| ID | Descrição |
|----|-----------|
| P2-01 | Edit e delete não expostos na UI atual (existem no service). |
| P2-02 | Simular amortização da Visão Geral requer seletor de dívida (a simulação precisa de `liabilityId`). |

### P3

| ID | Descrição |
|----|-----------|
| P3-01 | Registro de pagamento não implementado (não reduz saldo automaticamente). |
| P3-02 | Contexto Família e PJ não implementados. |

---

## 20. CHANGE REQUESTS

Nenhum. Compatível com todos os contratos homologados.

---

## 21. RECOMENDAÇÃO FINAL

O Passivos Mobile Wireframe prova que 2 tabs são suficientes, o progresso é matematicamente válido, a honestidade sobre juros ausentes é preservada, e o tratamento emocional é correto (dados, não julgamento).

**Próximo passo:** Com PASSIVOS-WF-P0 = 0 e PASSIVOS-WF-P1 = 0:

→ **PASSIVOS MOBILE MASTER VISUAL v1**

---

*FinDomus Passivos Mobile Wireframe v1 · Fase 17 concluída · Aguardando homologação*
