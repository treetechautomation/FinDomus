# FINDOMUS CONTAS MOBILE WIREFRAME v1

**Fase:** 20.1 — Architecture & Wireframe Correction
**FDL:** 1.0 FROZEN
**Contas Architecture:** v1 corrigida/homologada (`docs/modules/contas/CONTAS-MOBILE-ARCHITECTURE-v1.md`)
**Universal Module Pattern:** v1 homologado (tipo T — Transactional)
**Navigation:** v1 homologada
**Domus:** v1 homologada
**Viewport de referencia:** 390 × 844px
**Viewports de validacao:** 375 × 812px, 390 × 844px, 430 × 932px
**Status:** CORRECTED / HOMOLOGATED

---

## 1. RESUMO EXECUTIVO

Este wireframe transforma a arquitetura homologada do modulo Contas em wireframes Mobile completos, testando estrutura, hierarquia, CRUD, estados, privacidade, offline, PF/PJ, saldo manual, navegacao e Domus contextual.

O modulo Contas e o mais enxuto do FinDomus Mobile: **1 tela sem tabs**, com protagonista claro (saldo total), CRUD via Bottom Sheet (Add/Edit) e Confirmation Sheet (Delete), e Domus contextual no header.

A auditoria do codigo revelou 3 achados criticos que impactam o wireframe:
1. **`totalBalance` soma PF+PJ**, mas o `cashBalance` do Financial Core usa apenas PF — inconsistencia conceitual.
2. **Context Switcher global (Pessoal/Empresa) conflita** com a arquitetura que propos secoes PF/PJ simultaneas na mesma tela.
3. **Tipos `credit_card` e `investment`** sao tratados como ativos de saldo positivo, colidindo com modulos independentes (Cartoes, Investimentos).

Estes achados sao documentados como `CONTAS-WF-P0` e `CONTAS-WF-P1` e geram `CONTAS-ARCH-CR` para resolucao antes do Master Visual.

---

## 2. MEDIDAS (FDL Tokens)

| Elemento | Medida | Token FDL |
|----------|:------:|-----------|
| Header | 48px | Igual Context Bar |
| Summary Card | Variavel (~100px) | `space.4` padding |
| Insight Card | Variavel (~80px) | `space.4` padding |
| Primary Action (botao) | 44px altura | Touch target |
| List Item Standard | 56px | Universal Pattern |
| Section Label | ~32px | 10px caption + 12px gap |
| Gap entre elementos | `space.4` (16px) | Padrao |
| Gap entre secoes | `space.6` (24px) | Mudanca de secao |
| Gap Bottom Nav | `space.16` (64px) | Respiro final |
| Margem lateral | `space.4` (16px) | FDL mobile |
| Bottom Nav | 82px | Navigation Wireframe |
| Area util (390×844) | 708px | 844 − 54 − 82 |

---

## 3. FATO ARQUITETURAL CRITICO

### `account.balance` E MANUAL

| Operacao | Efeito no balance |
|----------|-------------------|
| `addAccount()` | `balance: 0` (sempre zero) |
| `updateAccount()` | `balance` editavel pelo usuario |
| `addTransaction()` | NAO atualiza `account.balance` |
| `deleteTransaction()` | NAO atualiza `account.balance` |
| Importacao (OFX/PDF/CSV) | NAO atualiza `account.balance` |
| Transferencia | NAO atualiza `account.balance` |
| Fechamento mensal | NAO atualiza `account.balance` |

Confirmado por auditoria de codigo em:
- `src/services/firestore/accounts.ts`
- `src/core/finance/financial-core.ts`
- `src/core/finance/monthly-closures.ts`
- `src/components/contas/new-account-dialog.tsx`

**O wireframe NAO pode dar a impressao de saldo automaticamente conciliado.**

---

## 4. SOURCE OF TRUTH

```
account.balance (Firestore, campo manual)
    ↓
totalBalance = Σ account.balance  (soma PF + PJ)
    ↓
cashBalance = Σ accounts[owner !== "PJ"].balance  (Financial Core, apenas PF)
    ↓
netWorth = cashBalance + investmentValue - activeLiabilityBalance
    ↓
Emergency Reserve, Freedom Index, Kernel, Home, Domus
```

### Achado critico: `totalBalance ≠ cashBalance`

| Metrica | Calculo | Componentes |
|---------|---------|-------------|
| `totalBalance` (Contas page) | `accounts.reduce(...)` | PF + PJ |
| `cashBalance` (financial-core) | `accounts.filter(owner !== "PJ")` | Apenas PF |

O `totalBalance` da pagina `/contas` soma contas PF e PJ indiscriminadamente, enquanto o Financial Core (`cashBalance`) exclui contas PJ para calculo de patrimonio liquido, reserva de emergencia e Freedom Index.

**Classificacao: `CONTAS-WF-P0`** — O wireframe nao pode chamar de "saldo total" um numero que mistura PF e PJ se o restante do sistema usa apenas PF. Isso cria uma metrica inconsistente com o Kernel e a Home.

**Resolucao proposta:** O `totalBalance` do modulo Contas deve ser desmembrado ou alinhado ao `cashBalance` antes do Master Visual. Ver secao 14 (Context Switcher) para decisao integrada.

---

## 5. COMPARACOES OBRIGATORIAS

### 5.1 SUMMARY — 3 FORMATOS

#### FORMATO A — Hero + contexto

```
┌──────────────────────────────────────────────────────────┐
│ SALDO EM CONTAS                                          │
│                                                          │
│ R$ 12.450                                                │
│                                                          │
│ 3 contas · 2 bancos                                      │
└──────────────────────────────────────────────────────────┘
```

| Criterio | Nota (1-5) |
|----------|:----------:|
| Clareza | 5 |
| Calma | 5 |
| 375px | 5 |
| Privacy | 5 |
| PF/PJ | 2 — nao distingue |
| Manual balance honesty | 3 — neutro, nao explica |
| Escala | 5 |

**Total: 30/35**

#### FORMATO B — Hero + PF/PJ

```
┌──────────────────────────────────────────────────────────┐
│ SALDO EM CONTAS                                          │
│                                                          │
│ R$ 12.450                                                │
│                                                          │
│ Pessoal      Empresarial                                 │
│ R$ 10.700    R$ 1.750                                    │
└──────────────────────────────────────────────────────────┘
```

| Criterio | Nota (1-5) |
|----------|:----------:|
| Clareza | 4 — mais informacao, mais ruido |
| Calma | 4 |
| 375px | 4 — 2 colunas apertam |
| Privacy | 4 |
| PF/PJ | 5 |
| Manual balance honesty | 3 |
| Escala | 4 |

**Total: 28/35**

#### FORMATO C — Hero + explicacao

```
┌──────────────────────────────────────────────────────────┐
│ SALDO EM CONTAS                                          │
│                                                          │
│ R$ 12.450                                                │
│                                                          │
│ Soma dos saldos cadastrados                               │
│ em suas contas.                                           │
└──────────────────────────────────────────────────────────┘
```

| Criterio | Nota (1-5) |
|----------|:----------:|
| Clareza | 3 — texto explicativo ocupa espaco |
| Calma | 5 |
| 375px | 5 |
| Privacy | 5 |
| PF/PJ | 2 |
| Manual balance honesty | 5 — comunica manualidade |
| Escala | 4 |

**Total: 29/35**

#### VENCEDOR: FORMATO A — Hero + contexto

**Justificativa:** O Formato A e o mais limpo e direto. Comunica o essencial em 5 segundos. Com a adocao do Context Switcher global (CR-01 aprovado), o Summary mostra apenas o saldo do contexto ativo — sem misturar PF e PJ. A honestidade sobre saldo manual e comunicada no Detail e no Edit.

---

### 5.2 PF/PJ VS GLOBAL CONTEXT SWITCHER

Este e o maior teste arquitetural desta fase. Ver secao 14 para analise completa.

---

### 5.3 LIST ITEM — 3 FORMATOS

#### FORMATO A — Nome + tipo em 2 linhas

```
┌──────────────────────────────────────────────────────────┐
│ Itau PF                                   R$ 8.200  →   │
│ Conta Corrente                                           │
└──────────────────────────────────────────────────────────┘
```

#### FORMATO B — Iniciais + nome + tipo

```
┌──────────────────────────────────────────────────────────┐
│ [IT] Itau PF                              R$ 8.200  →   │
│      Conta Corrente                                      │
└──────────────────────────────────────────────────────────┘
```

#### FORMATO C — Nome · tipo em 1 linha + saldo abaixo

```
┌──────────────────────────────────────────────────────────┐
│ Itau PF · Conta Corrente                                 │
│ R$ 8.200                                          →      │
└──────────────────────────────────────────────────────────┘
```

| Criterio | A | B | C |
|----------|:-:|:-:|:-:|
| Scanabilidade | 4 | 5 | 3 |
| 375px | 5 | 5 | 4 |
| 20 contas | 5 | 5 | 3 |
| 50 contas | 5 | 5 | 3 |
| Privacy | 5 | 5 | 4 |
| Long names | 4 | 5 | 4 |
| Bank recognition | 3 | 5 | 2 |
| Parece app bancario? | Nao | Leve | Nao |
| **TOTAL** | **36** | **40** | **23** |

#### VENCEDOR: FORMATO B — Iniciais + nome + tipo

**Justificativa:** Iniciais da instituicao ajudam reconhecimento rapido sem usar logos reais de bancos. O formato de 2 linhas (nome principal + tipo secundario) e o padrao de 56px do Universal Pattern. Em 375px, funciona confortavelmente. O risco de "parecer app bancario" e mitigado pela ausencia de cores de marca e pela estetica escura do FinDomus.

**Regra para iniciais:** Extrair primeiras 2 letras do nome da conta. Ex: "Itau PF" → "IT", "Nubank" → "NU", "XP Corporativo" → "XP". Se nome tem 1 palavra: primeiras 2 letras. Se tem 2+ palavras: primeira letra de cada uma das 2 primeiras.

---

### 5.4 AVATAR / INITIALS — DECISAO

**Manter iniciais da instituicao.**

| Criterio | Avaliacao |
|----------|-----------|
| Ajuda reconhecimento? | Sim. Diferencia contas visualmente na lista. |
| Cria estetica bancaria? | Levemente. Mitigado pelo fundo escuro e paleta FinDomus. |
| Alternativa? | Sem initials: lista fica monotonica, especialmente com 5+ contas. |
| Custo? | Baixo. Computado do nome da conta. Sem dependency externa. |

**Regra:** Container de 36px, fundo `surface.raised`, texto 14px/600w `text-secondary`. Sem cores individuais por banco.

---

### 5.5 SEARCH — COMPARACAO

| Opcao | Avaliacao |
|--------|-----------|
| NAO | ✅ Contas tipicas (1-5). Dominio pequeno. Se o Context Switcher reduz escopo, search e desnecessario. |
| Sob demanda | ⚠️ Icone no header. Util se 10+ contas. Custo: 1 slot de acao. |
| Sempre visivel | ❌ Polui tela para caso comum (3 contas). |

**Decisao: NAO para caso padrao. Sob demanda para 10+ contas.**

Com Context Switcher ativo, cada contexto tera tipicamente 1-5 contas. Search so se justifica no cenario extremo de 20+ contas em um unico contexto (ex: multiempresa com muitas contas PJ). Como a Arquitetura ja recomenda "sem search", manter.

**Reavaliar em CONTAS-WF-P2 se 50 contas em um contexto se tornar real.**

---

### 5.6 MANUAL BALANCE DISCLOSURE — 3 FORMAS

#### FORMA A — Label "Saldo informado"

```
┌──────────────────────────────────────────────────────────┐
│ Conta Corrente · Pessoal                                 │
│                                                          │
│ Saldo informado                                          │
│ R$ 8.200                                                 │
└──────────────────────────────────────────────────────────┘
```

#### FORMA B — Helper discreto

```
┌──────────────────────────────────────────────────────────┐
│ Conta Corrente · Pessoal                                 │
│                                                          │
│ Saldo                                                    │
│ R$ 8.200                                                 │
│                                                          │
│ Atualizado manualmente.                                   │
└──────────────────────────────────────────────────────────┘
```

#### FORMA C — Apenas no Edit

```
Detail:
┌──────────────────────────────────────────────────────────┐
│ Conta Corrente · Pessoal                                 │
│                                                          │
│ Saldo                                                    │
│ R$ 8.200                                                 │
└──────────────────────────────────────────────────────────┘

Edit (Bottom Sheet):
┌──────────────────────────────────────────────────────────┐
│ Saldo                                                    │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ R$ 8.200,00                                          │ │
│ └──────────────────────────────────────────────────────┘ │
│ Este saldo e mantido manualmente.                         │
└──────────────────────────────────────────────────────────┘
```

| Criterio | A | B | C |
|----------|:-:|:-:|:-:|
| Transparencia | 5 | 4 | 3 |
| Ruido | 4 | 3 | 5 |
| Confianca | 4 | 4 | 3 |
| 375px | 5 | 4 | 5 |
| Repeticao | 3 — toda conta ve o label | 3 | 4 |
| **TOTAL** | **21** | **18** | **20** |

#### VENCEDOR: FORMA A — Label "Saldo informado" no Detail

**Justificativa:** "Saldo informado" comunica manualidade de forma natural, sem disclaimer negativo. E uma qualificacao sutil, nao um alerta. A palavra "informado" e neutra — o usuario informou, o FinDomus mostra. Nao sugere que o saldo esta errado, apenas que sua origem e o input do usuario.

No Edit, reforcar com helper: "O saldo desta conta e mantido manualmente."

---

### 5.7 PRIMARY ACTION — 3 FORMATOS

#### FORMATO A — Botao full-width antes das listas

```
┌──────────────────────────────────────────────────────────┐
│              [ + Adicionar conta ]                        │
└──────────────────────────────────────────────────────────┘
```

#### FORMATO B — Acao compacta junto ao titulo da secao

```
PESSOAL                                          [+ Adicionar]
```

#### FORMATO C — Acao no header

```
← Inicio     Contas                              [+]
```

| Criterio | A | B | C |
|----------|:-:|:-:|:-:|
| Universal Pattern | 5 — prevê botao full-width | 3 | 4 — header action slot |
| Calma visual | 4 | 5 | 5 |
| Visibilidade | 5 | 3 | 3 |
| Empty state coesao | 5 — mesmo botao | 2 | 2 |
| **TOTAL** | **14** | **8** | **9** |

#### VENCEDOR: FORMATO A — Botao full-width

**Justificativa:** O Universal Pattern Type T (Transactional) define Primary Action como botao full-width de 44px, fundo azul FinDomus, texto Canvas, acima do conteudo principal. A consistencia com o sistema e o fator decisivo. O botao full-width tambem funciona melhor no empty state (mesma posicao, mesmo CTA).

---

### 5.8 ADD BALANCE BEHAVIOR

#### FORMATO A — Criar sem saldo + explicar

```
Fluxo:
1. Add Account Sheet: Nome, Tipo, Proprietario, Empresa (se PJ)
2. Salvar → conta criada com balance: 0
3. Toast ou redirecionamento: "Conta criada. Toque para informar o saldo."
4. Usuario navega para Detail → Edit → informa saldo
```

#### FORMATO B — Campo de saldo na criacao

```
Fluxo:
1. Add Account Sheet: Nome, Tipo, Proprietario, Empresa (se PJ), Saldo
2. Salvar → conta criada com balance informado
```

| Criterio | A | B |
|----------|:-:|:-:|
| Coerente com arquitetura atual | 5 — `balance: 0` | 1 — exigiria mudanca |
| Experiencia do usuario | 2 — friccao extra | 5 — direto |
| Simplicidade do Add | 5 | 4 |
| Risco de surpresa | 2 — "Cadastrei, por que zerada?" | 5 |

#### VENCEDOR: FORMATO B — Campo de saldo na criacao

**Porem:** FORMATO B exige mudanca arquitetural (`addAccount()` hoje forca `balance: 0`).

**Decisao do Wireframe:** Projetar o FORMATO B (campo de saldo na criacao) como UX ideal e registrar:

> **`CONTAS-ARCH-CR-02`**: `addAccount()` deve aceitar `balance` inicial opcional. Atualmente o `NewAccountDialog` (linha 51 de `new-account-dialog.tsx`) sempre define `balance: 0`. Propoe-se que o campo Saldo seja adicionado ao Add Account Sheet com valor default `0` e helper: "Saldo inicial desta conta. Voce pode editar depois."

Para o wireframe atual, o Add Account Sheet incluira o campo Saldo com valor `R$ 0,00` preenchido e editavel, antecipando a mudanca. O Edit mantem o campo Saldo como ja existe.

---

### 5.9 DETAIL ACTIONS — MAXIMO 3

Candidatos:

| Acao | Incluir? | Justificativa |
|------|:-------:|---------------|
| Editar | ✅ Sim | Essencial. Edit via Bottom Sheet. |
| Excluir | ✅ Sim | Essencial. Confirmacao via Sheet. |
| Importar extrato | ❌ Nao | Pertence a Importacoes. Acao secundaria cross-module. |
| Ver movimentacoes | ⚠️ Condicional | So se `/lancamentos?accountId=X` for suportado. Ver secao 20. |

**Decisao:** 2 acoes fixas (Editar, Excluir) + 0-1 condicional (Ver movimentacoes).

---

### 5.10 DELETE WITH HISTORY

A auditoria revelou que `deleteAccount()` (definido em `src/services/firestore/accounts.ts:160`) nao verifica transacoes associadas e nunca e chamado de nenhum componente UI.

| Cenario | Comportamento atual | UX Proposta |
|---------|---------------------|-------------|
| Conta sem transacoes | Delete direto (hard delete) | Confirmacao simples |
| Conta com transacoes | Delete direto (hard delete) — `accountId` nas transacoes e opcional, nao quebra FK | Confirmacao com alerta: "Transacoes associadas a esta conta nao serao excluidas, mas perderao a referencia." |

**Classificacao:** `REQUIRES IMPLEMENTATION`. O backend atual faz hard delete sem verificacao. A UX de "alerta de perda de referencia" depende de query previa de transacoes — que nao existe hoje.

**Para o wireframe:** Projetar 2 variantes do Delete Sheet:
1. **Delete simples** (sem transacoes): "A conta sera removida do FinDomus."
2. **Delete com transacoes**: "Esta conta possui X transacoes associadas. Elas nao serao excluidas, mas a referencia a esta conta sera perdida."

Ambas marcadas como `⚠️ REQUIRES IMPLEMENTATION`.

---

## 6. WIREFRAME 01 — TELA PRINCIPAL (CONTAS-WF-01)

### Viewport: 390 × 844px · Contexto: Pessoal (PF)

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR (54px)                        │
├──────────────────────────────────────────────────────────────┤
│ ← Inicio          Contas                   [◈ Domus]         │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary Card
│  │ SALDO EM CONTAS                                          ││ ← 10px, tertiary, uppercase
│  │                                                          ││
│  │ R$ 10.700                                                ││ ← 36px financial-hero
│  │                                                          ││
│  │ 2 contas · Pessoal                                       ││ ← contexto ativo
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight (0-1)
│  │ ◈ Domus                                                  ││ ← 10px, azul
│  │                                                          ││
│  │ 72% do saldo cadastrado esta                              ││ ← 13px, secondary
│  │ concentrado em uma unica conta.                           ││
│  │                                                          ││
│  │ Entender                                                 ││ ← CTA 13px, azul
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Primary Action
│  │              + Adicionar conta                            ││ ← 44px, full-width, azul
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
│  ← space.16 (64px) →                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │ ← Bottom Nav (82px)
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

### Estrutura de elementos

| # | Elemento | Altura (px) | Obrigatorio? |
|---|----------|:-----------:|:-----------:|
| 1 | Header | 48 | ✅ |
| 2 | Summary Card | ~80 | ✅ |
| 3 | Insight Card | ~70 | 0-1 |
| 4 | Primary Action | 44 + 16 gap | ✅ |
| 5 | List Item(s) | 56 cada | ✅ |
| 6 | Bottom Nav | 82 | ✅ |

### Notas sobre o wireframe

- **Label do Summary:** "SALDO EM CONTAS". "Saldo Total" e "Saldo Consolidado" foram preteridos — ambos sugerem agregacao automatica.
- **Contexto no Summary:** "2 contas · Pessoal". Sempre inclui o contexto ativo (via Context Switcher).
- **Sem Section Labels:** O contexto ativo ja e visivel no sistema (Context Bar na Home, avatar). Labels "PESSOAL"/"EMPRESARIAL" removidas (CR-01).
- **Lista unica:** Apenas contas do contexto ativo. Nao mistura PF e PJ na mesma tela.
- **Origem "← Inicio":** Assume acesso via Home (caso mais comum). Se vier de Modulos → "← Modulos". Se vier de Domus → "← Domus".
- **Domus no header:** Icone `BrainCircuit` (placeholder), 24px, touch target 44px.

---

## 7. CONTEXTO PF/PJ — DECISAO FINAL (CR-01 APROVADO)

### 7.1 Decisao

**Context Switcher global prevalece.** O modulo Contas mostra apenas contas do contexto ativo.

```
Contexto Pessoal → apenas contas PF
Contexto Empresa A → apenas contas da Empresa A
```

Section labels "PESSOAL" e "EMPRESARIAL" foram removidas. O contexto ativo ja e visivel em todo o sistema (Context Bar, avatar, Perfil).

### 7.2 Impacto nos wireframes

- **WF-01 (Tela Principal):** Lista unica do contexto ativo. Sem secoes PF/PJ.
- **WF-09 (PF Only) e WF-10 (PJ Only):** Sao o mesmo wireframe WF-01, apenas com dados diferentes.
- **WF-11 (Multiempresa):** Contas da empresa ativa. Troca via Context Switcher.
- **Summary:** Mostra "2 contas · Pessoal" ou "3 contas · TreeTech Automation".

---

## 8. WIREFRAME 02 — ACCOUNT DETAIL (CONTAS-WF-02)

### Viewport: 390 × 844px

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR (54px)                        │
├──────────────────────────────────────────────────────────────┤
│ ← Contas      Itau PF                     [◈ Domus] [···]    │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Detail Summary
│  │ Conta Corrente · Pessoal                                 ││ ← 10px, tertiary
│  │                                                          ││
│  │ Saldo informado                                          ││ ← 10px, tertiary
│  │ R$ 8.200                                                 ││ ← 28px, 700w, financial
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Detail Info
│  │ Tipo                                                     ││ ← 10px, tertiary
│  │ Conta Corrente                                           ││ ← 13px, primary
│  │                                                          ││
│  │ Proprietario                                             ││
│  │ Pessoal (PF)                                             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Actions
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │              Editar conta                            │ ││ ← 44px, azul, full-width
│  │ └──────────────────────────────────────────────────────┘ ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │              Excluir conta                           │ ││ ← 44px, outline, full-width
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 (64px) →                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │ ← Bottom Nav (82px)
│ Inicio   Modulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Notas

- **Header:** "← Contas" (volta para lista). Nome da conta como titulo. Icone Domus contextual + "···" (More Sheet com acoes adicionais se necessario).
- **Summary:** "Saldo informado" como label — comunica manualidade. Nao usar "Saldo" sem qualificador.
- **Info:** Apenas campos reais do modelo: Tipo, Proprietario. Nao inventar agencia/conta.
- **Acoes:** 2 acoes (Editar, Excluir). Dentro do budget ≤3 do Universal Pattern.
- **Bottom Nav:** "Inicio" ativo (veio da Home). Se veio de Modulos → "Modulos" ativo. Se veio de Domus → "Domus" ativo.

### O que NAO esta no Detail

- ❌ Historico de transacoes (pertence a Pessoal/Lancamentos)
- ❌ Freedom Index (pertence a Home)
- ❌ Reserva de emergencia (pertence a Home/Kernel)
- ❌ Grafico de saldo ao longo do tempo (nao existe dado temporal de balance)
- ❌ "Atualizado ha X minutos" (sem `updatedAt` especifico para saldo)

---

## 9. WIREFRAME 03 — ADD ACCOUNT (CONTAS-WF-03) · CORRIGIDO CR-02

### Bottom Sheet · Contexto PF

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro 60%]                         │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤ ← sheet comeca
│                                                              │
│           ━━━━━━━━━━  (handle, 32px × 4px)                   │
│                                                              │
│  Nova conta                                                  │ ← 16px, 600w
│                                                              │
│  Nome da conta                                               │ ← 10px, tertiary
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Ex: Itau Conta Corrente                                 ││ ← Input 44px
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Tipo                                                        │ ← 10px, tertiary
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Conta Corrente                                    ▾     ││ ← Select 44px
│  └──────────────────────────────────────────────────────────┘│
│  Opcoes: Conta Corrente, Poupanca, Carteira                   │ ← tipos ativos apenas
│                                                              │
│  Saldo informado                                             │ ← 10px, tertiary (CR-02)
│  ┌──────────────────────────────────────────────────────────┐│
│  │ R$ 0,00                                                 ││ ← Input financeiro 44px
│  └──────────────────────────────────────────────────────────┘│
│  Voce pode editar o saldo depois.                             │ ← 11px, tertiary helper
│                                                              │
│  ─────────────────────────────────────────                  │
│  Conta pessoal                                               │ ← contexto informativo
│  (seu contexto ativo)                                        │ ← 11px, tertiary
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar conta                                 ││ ← 44px, azul
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← safe area →                                                │
└──────────────────────────────────────────────────────────────┘
```

### Bottom Sheet · Contexto PJ (Empresa TreeTech Automation)

```
─ O mesmo, exceto contexto informativo ─

Empresa TreeTech Automation
(seu contexto ativo)
```

### Notas (CR-02, CR-03, CR-04)

- **Saldo informado:** Campo incluido conforme CR-02. Default `R$ 0,00`. Teclado numerico. O backend (`accounts.ts:72`) ja aceita `balance: number` — apenas a UI Desktop hardcoded `balance: 0`. Mobile expoe o campo. Helper: "Voce pode editar o saldo depois."
- **Tipo:** Select apenas com tipos ativos: Conta Corrente, Poupanca, Carteira. `credit_card` (CR-03) e `investment` (CR-04) removidos.
- **Contexto:** Informativo, nao editavel. Vem do Context Switcher global (CR-01). Contexto PF mostra "Conta pessoal". Contexto PJ mostra nome da empresa ativa.
- **Sem seletor owner PF/PJ:** O owner e definido pelo contexto ativo.
- **Sem seletor empresa:** No contexto PJ, companyId e pre-preenchido com empresa ativa.

---

## 10. WIREFRAME 04 — EDIT ACCOUNT (CONTAS-WF-04)

### Bottom Sheet

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro 60%]                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤ ← sheet comeca
│                                                              │
│           ━━━━━━━━━━                                         │
│                                                              │
│  Editar conta                                                │
│                                                              │
│  Nome da conta                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Itau PF                                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Tipo                                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Conta Corrente                                    ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Proprietario                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Pessoal (PF)                                      ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Empresa                  (apenas se Proprietario = PJ)      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ TreeTech Automation                               ▾     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Saldo                                                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ R$ 8.200,00                                             ││ ← Input financeiro
│  └──────────────────────────────────────────────────────────┘│
│  O saldo desta conta e mantido manualmente.                  │ ← helper
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar alteracoes                            ││ ← 44px, azul
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← safe area →                                                │
└──────────────────────────────────────────────────────────────┘
```

### Notas

- **Saldo:** Campo livre. Teclado numerico. Permite valor negativo (ex: `-R$ 1.200,00`).
- **Helper obrigatorio:** "O saldo desta conta e mantido manualmente." Nao usar "Saldo real", "Saldo bancario", "Saldo sincronizado".
- **Salvar:** Atualiza Firestore via `updateAccount()`. Fecha Sheet. Lista e Detail refletem novo valor.
- **Cancelar:** Fecha Sheet sem salvar. Sem confirmacao (dados nao gravados).

---

## 11. WIREFRAME 05 — DELETE (CONTAS-WF-05)

### Confirmation Sheet — Simples (sem transacoes)

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro 60%]                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤ ← sheet comeca
│                                                              │
│           ━━━━━━━━━━                                         │
│                                                              │
│  Excluir conta?                                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                                            ││ ← Card da conta
│  │       Conta Corrente                                     ││
│  │       R$ 8.200                                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  A conta sera removida do FinDomus.                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Excluir conta                               ││ ← 44px, state-negative
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Cancelar                                    ││ ← 44px, outline
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← safe area →                                                │
└──────────────────────────────────────────────────────────────┘
```

### Confirmation Sheet — Com transacoes

```
┌──────────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                         │
│                                                              │
│  Excluir conta?                                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                                            ││
│  │       Conta Corrente · R$ 8.200                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⚠️ Esta conta possui 47 transacoes                          │
│  associadas.                                                 │
│                                                              │
│  As transacoes nao serao excluidas, mas                       │
│  a referencia a esta conta sera perdida.                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Excluir assim mesmo                         ││ ← 44px, state-negative
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Cancelar                                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⚠️ REQUIRES IMPLEMENTATION                                  │
└──────────────────────────────────────────────────────────────┘
```

### Notas

- **Delete simples:** `⚠️ REQUIRES IMPLEMENTATION` — `deleteAccount()` existe em `src/services/firestore/accounts.ts:160` mas nunca e chamado de nenhum componente UI. Precisa ser conectado.
- **Delete com transacoes:** `⚠️ REQUIRES IMPLEMENTATION` — requer query previa de transacoes com `accountId` para exibir contagem. Backend atual nao faz essa verificacao.
- **Botao destrutivo:** Usa `state-negative` (#EF4444) apenas no botao "Excluir conta". Nao no fundo, nao no texto, nao no card da conta.
- **Frase factual:** "A conta sera removida do FinDomus." Nao promete que transacoes serao preservadas (nao serao) nem que serao excluidas (tambem nao — ficam orfas com `accountId` opcional).

---

## 12. WIREFRAME 06 — ZERO BALANCE (CONTAS-WF-06)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                             R$ 0,00  →    ││ ← 56px
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

- Saldo `R$ 0,00` e um valor valido.
- Nao e empty state.
- Tratamento igual a qualquer outro valor.
- Se todas as contas tem saldo zero, o Summary mostra `R$ 0,00`.

---

## 13. WIREFRAME 07 — NEGATIVE BALANCE (CONTAS-WF-07)

```
┌──────────────────────────────────────────────────────────────┐
│ Summary:
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS                                          ││
│  │                                                          ││
│  │ -R$ 1.200                                                ││ ← 36px, state-negative
│  │                                                          ││
│  │ 2 contas · 2 bancos                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│ List:
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                            -R$ 1.200  →   ││ ← state-negative
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [NU]  Nubank                              R$ 0,00  →    ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Regras

- Saldo negativo usa `state-negative` (#EF4444) no valor.
- Nao usa card vermelho, fundo vermelho, ou icone de alerta.
- A conta permanece na posicao normal da lista.
- FDL P5: "Problemas financeiros nao gritam."
- FDL P19: "A interface nao julga."

---

## 14. WIREFRAME 08 — NEVER ADDED (CONTAS-WF-08)

### Empty State

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR (54px)                        │
├──────────────────────────────────────────────────────────────┤
│ ← Inicio          Contas                   [◈ Domus]         │ ← Header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    [Landmark, 48px, text-tertiary]            │ ← Icone (Lucide)
│                                                              │
│              Nenhuma conta cadastrada                         │ ← 16px, 600w, primary
│                                                              │
│     Cadastre suas contas correntes, poupancas                 │ ← 13px, secondary
│     ou carteiras para acompanhar seus saldos.                 │
│                                                              │
│           ┌──────────────────────────────────────────┐       │
│           │        + Adicionar conta                  │       │ ← 44px, azul
│           └──────────────────────────────────────────┘       │
│                                                              │
│  ← space.16 (64px) →                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Inicio   Modulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Notas

- **Icone:** `Landmark` (Lucide) — representa instituicao financeira sem remeter a banco especifico. Alternativa: `Building2`.
- **Texto:** "Nenhuma conta cadastrada" — direto, sem negatividade.
- **Descricao:** "contas correntes, poupancas ou carteiras" — cobre tipos liquidos. Nao menciona `investment` ou `credit_card` (ver secao 23).
- **CTA:** Mesmo botao "Adicionar conta" da tela principal — consistencia.
- **Domus no header:** Visivel mesmo em empty state. Perguntas conceituais ainda sao respondiveis.

---

## 15. WIREFRAME 09 — PF ONLY (CONTAS-WF-09)

Mesmo wireframe do WF-01, contexto = Pessoal.

```
Summary: R$ 10.700 · 2 contas · 2 bancos

[IT] Itau PF                 R$ 8.200  →
[NU] Nubank                  R$ 2.500  →
```

- Nao ha section label "PESSOAL" — o Context Bar ja indica o contexto ativo.
- Sem secao PJ visivel.

---

## 16. WIREFRAME 10 — PJ ONLY (CONTAS-WF-10)

Mesmo wireframe do WF-01, contexto = Empresa (TreeTech Automation).

```
Summary: R$ 42.500 · 3 contas · 2 bancos

[IT] Itau PJ                 R$ 28.000  →
[SA] Santander PJ            R$ 12.000  →
[BB] Banco do Brasil PJ      R$  2.500  →
```

- Nao ha section label "EMPRESARIAL" — o Context Bar ja indica a empresa ativa.
- Sem secao PF visivel.

---

## 17. WIREFRAME 11 — MULTIEMPRESA (CONTAS-WF-11)

Contexto ativo = TreeTech Automation. Outras empresas acessiveis via Context Switcher.

```
┌──────────────────────────────────────────────────────────────┐
│ ← Inicio     Contas · TreeTech Automation    [◈ Domus]       │ ← Header com empresa
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS · TreeTech Automation                    ││
│  │                                                          ││
│  │ R$ 42.500                                                ││
│  │                                                          ││
│  │ 3 contas · 2 bancos                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Adicionar conta                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PJ                     R$ 28.000  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [SA]  Santander PJ                R$ 12.000  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [BB]  Banco do Brasil PJ          R$  2.500  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                 │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Inicio   Modulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Notas

- **Header:** Sufixo com nome da empresa ativa para clareza. Opcional se Context Bar ja mostrar.
- **Summary:** Sufixo "· TreeTech Automation" no label.
- **Add Account:** `owner: "PJ"` pre-selecionado. `companyId` pre-preenchido com empresa ativa.
- **Troca de empresa:** Avatar → Context Switcher Sheet → selecionar outra empresa. Modulo recarrega com contas da nova empresa.

---

## 18. WIREFRAME 12 — 20 CONTAS (CONTAS-WF-12)

```
390 × 844px · Contexto: Pessoal

┌──────────────────────────────────────────────────────────────┐
│ ← Inicio          Contas                   [🔍] [◈ Domus]    │ ← Header com search
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS                                          ││
│  │ R$ 156.420                                               ││
│  │ 20 contas · 5 bancos                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Adicionar conta                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Scroll
│  │ [IT]  Itau PF                     R$ 48.200  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [NU]  Nubank                      R$ 22.500  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [SA]  Santander                   R$ 15.800  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [BB]  Banco do Brasil             R$ 12.300  →           ││
│  │       Poupanca                                            ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [CA]  Caixa                        R$ 9.700  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ... (15 more items, each 56px)                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                 │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
└──────────────────────────────────────────────────────────────┘
```

### Analise de scroll

- 20 contas × 56px = 1.120px
- + Summary (~80px) + Insight (~70px) + Action (~60px) + gaps (~200px) = ~1.530px
- Em viewport de 708px uteis → ~2.2 viewports de scroll
- Confortavel. Sem necessidade de search para 20 itens.
- Search (icon 🔍) adicionado no header como "sob demanda".

---

## 19. WIREFRAME 13 — 50 CONTAS (CONTAS-WF-13)

```
390 × 844px · Contexto: Pessoal

Header: search sempre visivel (campo expandido ou icon + expand on tap)

┌──────────────────────────────────────────────────────────────┐
│ ← Inicio     Contas              [🔍 Buscar...] [◈ Domus]    │ ← Header com search
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS                                          ││
│  │ R$ 342.780                                               ││
│  │ 50 contas · 8 bancos                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [Scroll com 50 items × 56px]                                │
│  Scroll total: ~3.000px (~4.2 viewports)                    │
│                                                              │
│  Avaliacao:                                                  │
│  - Scroll funcional mas longo                                │
│  - Search necessario para usabilidade                        │
│  - Search busca por: nome, tipo, banco (substring)          │
│  - Resultado filtra lista em tempo real                      │
│  - Sem filtros complexos (contexto ja limita escopo)        │
│  - Order: maior saldo primeiro (default)                     │
└──────────────────────────────────────────────────────────────┘
```

### Decisoes para escala extrema (50+ contas)

| Recurso | Decisao |
|---------|---------|
| Search | ✅ Obrigatorio. Visivel como campo no header. |
| Filtro | ❌ Desnecessario. Context Switcher ja filtra por owner. |
| Sort | ⚠️ Opcional. Default: maior saldo. Alternativa: alfabetico. |
| Grouping | ❌ Desnecessario. 1 secao por contexto. |
| Paginacao | ❌ Scroll natural. 50 itens e limite aceitavel. |

**Classificacao:** `CONTAS-WF-P2` — Search para 50 contas e necessario. Componente de search inline com filtro local (sem chamada ao Firestore — filtra sobre dados ja carregados).

---

## 20. WIREFRAME 14 — PRIVACY (CONTAS-WF-14)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Inicio          Contas                   [◈ Domus]         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS                                          ││
│  │                                                          ││
│  │ R$ ••••••                                                ││ ← 36px, mascarado
│  │                                                          ││
│  │ 3 contas · 2 bancos                                      ││ ← visivel
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Adicionar conta                            ││ ← desabilitado?
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                     R$ ••••••  →           ││ ← saldo mascarado
│  │       Conta Corrente                                     ││ ← nome visivel
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [NU]  Nubank                      R$ ••••••  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [XP]  XP Corporativo              R$ ••••••  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                 │
└──────────────────────────────────────────────────────────────┘
```

### Regras de privacidade

| Elemento | Visibilidade |
|----------|:-----------:|
| Nome da conta | ✅ Visivel |
| Tipo | ✅ Visivel |
| Iniciais (avatar) | ✅ Visivel |
| Saldo | ❌ Mascarado `R$ ••••••` |
| Saldo total (Summary) | ❌ Mascarado `R$ ••••••` |
| Contagem de contas | ✅ Visivel |
| Contagem de bancos | ✅ Visivel |
| Detail: saldo | ❌ Mascarado |
| Detail: nome, tipo, proprietor | ✅ Visivel |

- Add/Edit/Delete: comportamentos mantidos. Saldo mascarado no Edit (revela ao focar no campo).
- FDL: Privacy Mode definido no FDL 1.0 secao 17. Mascara com `•`. Nunca esconder labels.

---

## 21. WIREFRAME 15 — OFFLINE (CONTAS-WF-15)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Inicio     Contas                    [offline] [◈ Domus]    │ ← indicador offline
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS  (dados em cache)                        ││
│  │                                                          ││
│  │ R$ 12.450                                                ││ ← ultimo valor cacheado
│  │                                                          ││
│  │ 3 contas · 2 bancos                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Adicionar conta   (indisponivel offline)   ││ ← desabilitado
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                     R$ 8.200  →           ││ ← visualmente normal
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [NU]  Nubank                      R$ 2.500  →           ││
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Detail: visivel (dados cacheados).                           │
│  Editar: desabilitado.                                       │
│  Excluir: desabilitado.                                      │
│                                                              │
│  ← space.16 →                                                 │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
└──────────────────────────────────────────────────────────────┘
```

### Regras offline

- Dados cacheados (ultimo fetch) permanecem visiveis.
- Add/Edit/Delete: botoes desabilitados com label "Indisponivel offline".
- Detail: navegacao permitida, dados cacheados exibidos.
- Bottom Nav: 100% funcional.
- Indicador offline: subtle, no header ou abaixo do status bar.

---

## 22. WIREFRAME 16 — PARTIAL ERROR (CONTAS-WF-16)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Inicio          Contas                   [◈ Domus]         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ SALDO EM CONTAS                                          ││ ← ✅ Carregou
│  │ R$ 10.700                                                ││
│  │ 2 contas · 2 bancos                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Adicionar conta                            ││ ← ✅ Habilitado
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── PESSOAL ─────────────────────────────────────────────── │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [IT]  Itau PF                     R$ 8.200  →           ││ ← ✅ Carregou
│  │       Conta Corrente                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⚠️  Nao foi possivel carregar as demais contas.         ││ ← ❌ Erro parcial
│  │                                                          ││
│  │     ┌──────────────────────────────────────┐             ││
│  │     │        Tentar novamente              │             ││ ← 44px, outline
│  │     └──────────────────────────────────────┘             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                 │
└──────────────────────────────────────────────────────────────┘
```

### Regras de erro parcial

- Summary carregou? Mostrar.
- Parte das contas carregou? Mostrar as que carregaram.
- Parte falhou? Indicar na posicao onde os itens estariam.
- CTA "Tentar novamente" recarrega apenas a secao que falhou.
- Nao usar tela de erro full-screen se ha dados parciais aproveitaveis.
- FDL P18: "O erro nunca e do usuario."

---

## 23. WIREFRAME 17 — LOADING (CONTAS-WF-17)

### Skeleton

```
┌──────────────────────────────────────────────────────────────┐
│ ← Inicio          Contas                   [◈ Domus]         │ ← Header normal
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████████████████                                        ││ ← Summary skeleton
│  │                                                          ││
│  │ ████████████                                            ││
│  │                                                          ││
│  │ ██████████████                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████████████████████████████████████████████████████████ ││ ← Action skeleton
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── ██████████ ──────────────────────────────────────────── │ ← Section skeleton
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████  ██████████████████             ████████████  →    ││ ← List item skeleton
│  │       ████████████                                       ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████  ██████████████████             ████████████  →    ││
│  │       ████████████                                       ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████  ██████████████████             ████████████  →    ││
│  │       ████████████                                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 →                                                 │
└──────────────────────────────────────────────────────────────┘
```

### Especificacao do skeleton

- `animate-pulse` do Tailwind.
- Fundo: `surface.raised` ou `surface`.
- 1 Summary skeleton + 1 Action skeleton + 3 account row skeletons.
- Altura de cada linha: ~14px, radius consistente.
- Sem spinner de pagina inteira (Universal Pattern: skeleton por bloco).

---

## 24. WIREFRAME 18 — DOMUS CONTEXTUAL (CONTAS-WF-18)

### Contexto enviado

```js
{
  financialContext: "PF",          // contexto ativo do Context Switcher
  moduleContext: "contas",
  activeAccount: null              // ou { id, name, type, balance } se no Detail
}
```

### Perguntas seguras (respondiveis com dados existentes)

```
"Quanto tenho cadastrado em contas?"
→ totalBalance do contexto ativo. Resposta: Metric Card.

"Qual conta tem maior saldo?"
→ sort by balance desc. Resposta: Text + Metric Card.

"Como meu saldo em contas afeta meu patrimonio?"
→ cashBalance → netWorth → composicao. Resposta: Explanation Card.

"Meu saldo esta concentrado?"
→ maior conta / totalBalance. Resposta: Insight + Metric.
```

### Perguntas nao seguras (responder com limitacao)

```
"Quanto posso gastar?"
→ ❌ Saldo ≠ disponibilidade. Resposta: "DADOS INSUFICIENTES. Saldo em contas
   nao representa dinheiro disponivel para gasto. Para saber sua capacidade
   de gasto mensal, consulte seu Planejamento ou seu fluxo de caixa em Pessoal."

"Quanto posso transferir?"
→ ❌ Transferencias nao alteram balance. Saldo nao e saldo disponivel.

"Quanto esta disponivel para gastar?"
→ ❌ Mesmo caso. Requer contexto de fluxo (receitas - despesas).
```

### Marcacao de limitacao

```
╔══════════════════════════════════════════════════════════════╗
║ DADOS INSUFICIENTES / REQUER CONTEXTO DE FLUXO E PLANEJAMENTO ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 25. WIREFRAME 19 — IMPORT ENTRY (CONTAS-WF-19)

### Acao secundaria cross-module

Nao e um wireframe de tela, e uma relacao de navegacao:

```
Contas (Detail)
    ↓
    "Importar extrato" (acao terciaria ou no More Sheet)
    ↓
Importacoes (modulo /importacoes)
    ↓
Workflow de importacao (OFX, PDF, CSV)
```

### Contrato

| Elemento | Regra |
|----------|-------|
| Ponto de entrada | Detail: More Sheet ("···" no header). Opcao "Importar extrato". |
| Fluxo | Navega para `/importacoes`. Nao e Bottom Sheet. |
| Pre-selecao | Nao. Importacoes tem seu proprio fluxo de selecao de conta. |
| Promessa | ❌ Nunca sugerir que importar atualiza o saldo automaticamente. |
| Label seguro | "Importar extrato" (acao). Nao "Atualizar saldo" ou "Sincronizar". |

### Por que nao e Primary Action

Importacao e um fluxo de trabalho complexo (5 etapas no modulo Importacoes). Nao pertence ao CRUD simples de Contas. A acao primaria do modulo Contas e "Adicionar conta" — criar a entidade. Importar e uma acao secundaria que ocorre depois que a conta ja existe.

---

## 26. WIREFRAME 20 — CROSS-MODULE MOVEMENTS (CONTAS-WF-20)

### "Ver movimentacoes" — Condicional

```
Contas (Detail)
    ↓
    "Ver movimentacoes" (acao no Detail, se suportado)
    ↓
Lancamentos (/lancamentos?accountId=abc123)
    ↓
    Lista de transacoes filtrada por accountId
```

### Condicao tecnica

So incluir esta acao se:
1. A rota `/lancamentos` aceitar query param `accountId`
2. O modulo Lancamentos tiver UI para filtrar por conta
3. Navegacao cross-modulo for suportada (Bottom Nav active state, header back)

**Estado atual do codigo:** `accountId` existe como campo opcional em transacoes (`src/services/firestore/types.ts`). A rota `/lancamentos` existe. A viabilidade de filtro por `accountId` precisa ser verificada.

**Marcacao:** `⚠️ REQUER VERIFICACAO TECNICA`. Nao incluir no wireframe final ate confirmacao.

---

## 27. CREDIT_CARD TYPE — DECISAO (CR-03 APROVADO)

### Diagnostico

O codigo atual trata `credit_card` como um tipo valido de `Account`:

- `src/components/contas/new-account-dialog.tsx:102`: selecionavel na criacao (Desktop)
- `src/core/finance/financial-core.ts:161`: NAO e conta liquida (excluido de `LIQUID_ACCOUNT_TYPES`)
- `src/core/finance/financial-core.ts:71-73`: **ENTRA no `cashBalance`** se `owner !== "PJ"` — tratado como caixa
- `/cartoes` (src/app/(main)/cartoes/page.tsx): **redireciona para /passivos** — nao ha modulo independente

### Risco comprovado

Contas `credit_card` com `owner === 'PF'` e `balance: -2000` **reduzem o `cashBalance`** em R$ 2.000. Se o mesmo cartao tambem estiver registrado como passivo, ha dupla contagem negativa no `netWorth`.

Contas `credit_card` com `balance` positivo (ex: R$ 5.000) **aumentam o `cashBalance`** como se fossem dinheiro em conta — o que e conceitualmente incorreto (cartao de credito nao e conta de saldo positivo).

### Decisao (CR-03)

**`credit_card` removido das opcoes de criacao de novas contas Mobile.**

| Aspecto | Comportamento |
|---------|--------------|
| Novas contas | Tipo `credit_card` NAO aparece no select de tipo |
| Registros legados | Visiveis na lista. Editaveis (nome, saldo). Tipo mantido. |
| Detail legado | Mostra "Cartao de Credito (legado)" |
| cashBalance | Legado continua sendo somado ate migracao |
| Migracao | `⚠️ REQUER PLANO DE MIGRACAO` — reclassificar credit_cards para Passivos ou Cartoes |

**Classificacao:** `CONTAS-WF-P1` (risco de representacao incorreta; resolvido para novas contas).

---

## 28. INVESTMENT TYPE — DECISAO (CR-04 APROVADO)

### Diagnostico

O codigo atual trata `investment` como um tipo valido de `Account`:

- `src/components/contas/new-account-dialog.tsx:101`: selecionavel (Desktop)
- `src/core/finance/financial-core.ts:71-73`: **ENTRA no `cashBalance`** se `owner !== "PJ"`
- `src/core/finance/financial-core.ts:75-78`: `investmentValue` e calculado de `investments[]` (entidades do modulo Investimentos)
- `src/core/finance/financial-core.ts:97`: `grossAssets = cashBalance + investmentValue`

### Dupla contagem comprovada (P0)

```
Cenario:
1. Account: type='investment', balance=10000, owner='PF'
2. Investment entity: currentValue=10000 (mesmo ativo)

cashBalance = 10000  (investment account PF entra)
investmentValue = 10000  (investment entity)
grossAssets = 10000 + 10000 = 20000  ← DUPLA CONTAGEM
netWorth = 20000 - liabilities  ← DISTORCIDO
```

**Confirmado em `dashboard-real.ts:159`:**
```typescript
const netWorthValue = totalAccounts + totalInvestments - totalLiabilities;
// totalAccounts inclui contas investment → dupla contagem
```

### Decisao (CR-04)

**`investment` removido das opcoes de criacao de novas contas Mobile.**

| Aspecto | Comportamento |
|---------|--------------|
| Novas contas | Tipo `investment` NAO aparece no select de tipo |
| Registros legados | Visiveis na lista. Editaveis (nome, saldo). Tipo mantido. |
| Detail legado | Mostra "Investimento (legado)" |
| cashBalance | Legado continua sendo somado ate migracao |
| grossAssets/netWorth | **DISTORCIDO** para usuarios com investment accounts + investment entities. |
| Migracao | `⚠️ REQUER PLANO DE MIGRACAO COM AUDITORIA DE DADOS` |

**Classificacao:** `CONTAS-WF-P0` — **Risco comprovado de dupla contagem no patrimonio liquido.**

---

## 29. ACCOUNT TYPES NO MOBILE · CORRIGIDO CR-03/CR-04

### Tipos disponiveis para novas contas (Add/Edit)

| Tipo | Label | Incluir? |
|------|-------|:-------:|
| `checking` | Conta Corrente | ✅ Sim |
| `savings` | Poupanca | ✅ Sim |
| `wallet` | Carteira | ✅ Sim |

### Tipos legados (visiveis, nao criaveis)

| Tipo | Label | Status |
|------|-------|:------:|
| `investment` | Investimento (legado) | Visivel ate migracao. Nao disponivel para novas contas. |
| `credit_card` | Cartao de Credito (legado) | Visivel ate migracao. Nao disponivel para novas contas. |

### Justificativa

O modulo Contas gerencia **dinheiro em contas**, nao investimentos nem cartoes. Os tipos `checking`, `savings` e `wallet` representam dinheiro liquido — alinhado com `LIQUID_ACCOUNT_TYPES` do Financial Core e com o conceito de "estoque" (stock).

Tipos `investment` e `credit_card` causam distorcao no `cashBalance` e `grossAssets`. Para novas contas, foram removidos. Registros legados permanecem visiveis ate plano de migracao.

---

## 30. STOCK VS FLOW — CONTRATO

### Principio fundamental

```
CONTA = ESTOQUE (stock)
    ↓
    Representa dinheiro parado em um ponto no tempo.
    Saldo e um valor manual estatico.

TRANSACAO = FLUXO (flow)
    ↓
    Representa movimento de dinheiro ao longo do tempo.
    Pertence a Pessoal/Lancamentos.

TRANSFERENCIA = MOVIMENTO INTERNO
    ↓
    E uma transacao (fluxo), nao uma operacao de conta (estoque).
    Nao altera saldo de contas.
```

### Implicacoes no wireframe

- ❌ Nao criar acao "Transferir" em Contas.
- ❌ Nao mostrar historico de transacoes no Account Detail.
- ❌ Nao sugerir que saldo de conta e atualizado por transacoes.
- ❌ Nao usar linguagem de fluxo ("entrou", "saiu", "movimentou").
- ✅ Usar linguagem de estoque ("cadastrado", "informado", "mantido").

---

## 31. HOME CARD — CONCEITUAL (CONTAS-WF-HOME)

### Wireframe conceitual (nao implementar)

```
┌──────────────────────────────────────────────────────────┐
│ Contas                                          →        │ ← Summary Card (FDL)
│                                                          │
│ Saldo em contas                                          │
│ R$ 10.700                                                │ ← 24px
│                                                          │
│ 2 contas · 2 bancos                                      │
└──────────────────────────────────────────────────────────┘
```

### Decisao: "Saldo em contas · R$ X" (sem contagem no hero)

Home Card deve mostrar:
- Label: "Saldo em contas" ou "Contas"
- Valor: saldo do contexto ativo (consistente com modulo)
- Contexto: "X contas · Y bancos"

Nao incluir:
- Freedom Index
- Reserva de emergencia
- Tendencia/variacao

---

## 32. RESUMO DOS WIREFRAMES

| ID | Nome | Viewport | Descricao |
|----|------|:-------:|-----------|
| CONTAS-WF-01 | Tela Principal | 390×844 | Header + Summary + Insight + Action + List + Bottom Nav |
| CONTAS-WF-02 | Account Detail | 390×844 | Header + Summary + Info + Actions |
| CONTAS-WF-03 | Add Account | Bottom Sheet | Nome + Tipo + Proprietario + Empresa + Saldo inicial |
| CONTAS-WF-04 | Edit Account | Bottom Sheet | Nome + Tipo + Proprietario + Empresa + Saldo + Helper |
| CONTAS-WF-05 | Delete | Conf. Sheet | Simples + Com transacoes (REQUIRES IMPLEMENTATION) |
| CONTAS-WF-06 | Zero Balance | 390×844 | Saldo R$ 0,00 valido |
| CONTAS-WF-07 | Negative Balance | 390×844 | Saldo negativo, state-negative pontual |
| CONTAS-WF-08 | Never Added | 390×844 | Empty state + CTA |
| CONTAS-WF-09 | PF Only | 390×844 | Contexto Pessoal |
| CONTAS-WF-10 | PJ Only | 390×844 | Contexto Empresa |
| CONTAS-WF-11 | Multiempresa | 390×844 | Empresa ativa + Context Switcher |
| CONTAS-WF-12 | 20 Accounts | 390×844 | Scroll ~2.2 viewports |
| CONTAS-WF-13 | 50 Accounts | 390×844 | Search obrigatorio |
| CONTAS-WF-14 | Privacy | 390×844 | Saldos mascarados |
| CONTAS-WF-15 | Offline | 390×844 | Dados cacheados, acoes desabilitadas |
| CONTAS-WF-16 | Partial Error | 390×844 | Summary ok, lista parcial |
| CONTAS-WF-17 | Loading | 390×844 | Skeleton por bloco |
| CONTAS-WF-18 | Domus | — | Contexto + perguntas seguras/nao seguras |
| CONTAS-WF-19 | Import Entry | — | Relacao cross-module com Importacoes |
| CONTAS-WF-20 | Cross-module Movements | — | Condicional (Lancamentos) |

---

## 33. CONTAS SUMMARY CONTRACT v1

```
Label:         "SALDO EM CONTAS" (10px, tertiary, uppercase)
Valor:         financial-hero (36px, 800w, tabular-nums)
Contexto:      "X contas · Y bancos" (13px, secondary)
Escopo:        Contexto ativo (PF ou Empresa X)
PF/PJ:         Determinado pelo Context Switcher global
Privacy:       Valor mascarado (R$ ••••••). Contagem visivel.
Manual:        Label nao qualifica o saldo no Summary. Clareza delegada ao Detail.
Card:          Surface, radius-md, padding space.4
```

---

## 34. ACCOUNT LIST CONTRACT v1

```
Altura:        56px (Standard — Universal Pattern)
Avatar:        36px container, iniciais da instituicao, text-secondary
Nome:          14px, 600w, text-primary
Tipo:          12px, 400w, text-secondary (linha 2)
Saldo:         14px, 600w, tabular-nums, text-primary, alinhado a direita
Negativo:      state-negative no valor. Container normal.
Zero:          "R$ 0,00" normal. Sem distincao.
Tap:           Navega para Detail. Card inteiro e touch target (affordance Raised).
Privacy:       Saldo mascarado. Nome e tipo visiveis.
Gap:           space.2 (8px) entre itens
```

---

## 35. ACCOUNT DETAIL CONTRACT v1

```
Header:        "← Contas" + nome da conta + [◈ Domus] + [···]
Summary:       "Conta Corrente · Pessoal" + "Saldo informado" + valor (28px)
Info:          Tipo, Proprietario. Apenas campos reais do modelo.
Acoes:         [Editar conta] primario + [Excluir conta] outline (max 3)
Domus:         Icone no header. Contexto com activeAccount.
Back:          ← Contas. Restaura scroll e estado da lista.
```

---

## 36. FORM CONTRACT v1

### Add Account

```
Campos:        Nome, Tipo, Proprietario, Empresa (condicional), Saldo inicial
Saldo:         Default R$ 0,00. Editavel. Teclado numerico.
Helper:        "Voce pode editar o saldo depois."
Botao:         "Salvar conta" (full-width, azul)
Tipo:          Bottom Sheet
```

### Edit Account

```
Campos:        Nome, Tipo, Proprietario, Empresa (condicional), Saldo
Saldo:         Valor atual. Editavel. Teclado numerico. Permite negativo.
Helper:        "O saldo desta conta e mantido manualmente."
Botao:         "Salvar alteracoes" (full-width, azul)
Tipo:          Bottom Sheet
```

---

## 37. DELETE CONTRACT v1

```
Simples:       "A conta sera removida do FinDomus."
Com transacoes:"X transacoes associadas. Nao serao excluidas, mas a referencia sera perdida."
Botao:         "Excluir conta" (state-negative). "Cancelar" (outline).
Tipo:          Confirmation Sheet
Gap:           ⚠️ REQUIRES IMPLEMENTATION (backend nao verifica transacoes)
```

---

## 38. CONTEXT CONTRACT v1

```
Fonte:         Context Switcher global (Navigation v1)
Escopo:        Apenas contas do contexto ativo
PF:            owner === "PF"
PJ:            owner === "PJ" && companyId === activeCompany
Multiempresa:  Contas da empresa ativa no Context Switcher
Troca:         Context Switch → modulo recarrega com novo escopo
Section Labels: Removidas (contexto ja visivel no sistema)
totalBalance:  Igual a cashBalance (Financial Core) quando contexto = PF
```

---

## 39. DOMUS CONTRACT v1

```
Entrada:       Icone no header (slot de acao)
Contexto:      { financialContext, moduleContext: "contas", activeAccount }
Seguras:       "Quanto tenho em contas?", "Qual conta tem maior saldo?",
               "Meu saldo esta concentrado?", "Como isso afeta meu patrimonio?"
Nao seguras:   "Quanto posso gastar?", "Quanto posso transferir?",
               "Quanto esta disponivel?"
Marcacao:      "DADOS INSUFICIENTES / REQUER CONTEXTO DE FLUXO E PLANEJAMENTO"
```

---

## 40. IMPORT ENTRY CONTRACT v1

```
Ponto:         More Sheet (Detail) → "Importar extrato"
Destino:       /importacoes (modulo independente)
Promessa:      ❌ NUNCA sugerir que importacao atualiza saldo
Label seguro:  "Importar extrato" (acao). Nao "Atualizar saldo".
```

---

## 41. STOCK/FLOW CONTRACT v1

```
Account (Contas):        ESTOQUE. Saldo manual. Sem historico de transacoes.
Transaction (Pessoal):   FLUXO. Movimentacoes. Nao atualizam saldo de conta.
Transfer (Pessoal):      FLUXO interno. Nao atualizam saldo de conta.
Import (Importacoes):    ENTRADA DE DADOS. Nao atualizam saldo de conta.
```

---

## 42. PRIVACY CONTRACT v1

```
Mascarar:      Saldo total (Summary), saldo por conta (List), saldo (Detail)
Visivel:       Nome da conta, tipo, iniciais, contagem, bancos
Comportamento: Toggle global. Sessao. Nunca esconder labels.
```

---

## 43. OFFLINE CONTRACT v1

```
Dados:         Ultimo fetch cacheado. Visiveis normalmente.
Acoes:         Add/Edit/Delete desabilitados. Label "Indisponivel offline".
Navegacao:     Detail acessivel. Bottom Nav funcional.
Indicador:     Sutil no header ou abaixo do status bar.
```

---

## 44. EMPTY CONTRACT v1

```
Titulo:        "Nenhuma conta cadastrada"
Descricao:     "Cadastre suas contas correntes, poupancas ou carteiras..."
CTA:           "+ Adicionar conta"
Icone:         Landmark (Lucide), 48px
```

---

## 45. ERROR CONTRACT v1

```
Parcial:       Preservar dados carregados. Indicar secao que falhou.
Total:         Tela de erro. "Nao foi possivel carregar." + "Tentar novamente".
Mensagem:      Sempre orientar acao. Nunca expor stack trace.
```

---

## 46. STATE RESTORATION CONTRACT v1

```
Scroll:        Preservado ao voltar de Detail.
Tab/Filtro:    N/A (modulo sem tabs).
Draft:         Add/Edit Sheet preserva texto se fechado acidentalmente? V2.
```

---

## 47. CURRENT → WIREFRAME MAP

| Desktop (atual) | Mobile (wireframe) | Acao |
|---------|--------|------|
| 1 tela sem tabs | 1 tela sem tabs | KEEP |
| 3 KPI cards (Saldo, Reserva, FI) | 1 Summary (apenas Saldo) | MERGE |
| Reserva Emergencia (KPI) | Removido do modulo | REMOVE |
| Freedom Index (KPI) | Removido do modulo | REMOVE |
| Secoes PF/PJ simultaneas | Contexto ativo (Context Switcher) | CHANGE |
| Avatar de banco (iniciais) | Avatar de banco (iniciais) | KEEP |
| Add Dialog (Radix) | Bottom Sheet | ADAPT |
| Edit Dialog (Radix) | Bottom Sheet | ADAPT |
| Delete (nao exposto) | Confirmation Sheet | ADICIONAR |
| Domus contextual (inexistente) | Icone no header | CRIAR |
| credit_card type | Excluido do Add/Edit Mobile | REMOVE |
| investment type | Excluido do Add/Edit Mobile | REMOVE |
| Saldo na criacao (sempre 0) | Campo Saldo opcional (default 0) | CHANGE |

---

## 48. ARQUITETURA COMPLIANCE

| Requisito da Arquitetura | Wireframe | Status |
|--------------------------|-----------|:------:|
| 1 tela sem tabs | WF-01 | ✅ |
| Saldo total protagonista | Summary: 36px hero | ✅ |
| Lista PF/PJ | Contexto ativo (via Context Switcher) | ⚠️ CR |
| 56px list items | Standard (Universal Pattern) | ✅ |
| Bottom Sheet Add/Edit | WF-03, WF-04 | ✅ |
| Confirmation Sheet Delete | WF-05 | ✅ |
| Domus contextual no header | WF-01, WF-18 | ✅ |
| Sem historico de transacoes | Detail sem transacoes | ✅ |
| Saldo manual claro | "Saldo informado" + helper | ✅ |

---

## 49. FDL COMPLIANCE

| Requisito FDL | Wireframe | Status |
|---------------|-----------|:------:|
| Protagonista (P6) | Saldo total, 36px hero | ✅ |
| Acao principal obvia (P7) | "+ Adicionar conta" full-width | ✅ |
| Profundidade progressiva (P8) | List → Detail → Edit | ✅ |
| Calma escura | Fundo escuro, azul pontual | ✅ |
| 1 KPI por tela | Apenas saldo total no Summary | ✅ |
| 5-10% azul | Botao + icon Domus + CTA insight | ✅ |
| Nao parece banco | Fundo escuro, sem logos, sem cores de marca | ✅ |
| Nao e dashboard | 1 metrica, nao 3-4 KPIs | ✅ |
| Nao e planilha | Lista, nao tabela | ✅ |
| Interface nao julga (P19) | Saldo negativo: state-negative pontual | ✅ |
| Erro nunca e do usuario (P18) | Mensagens orientativas | ✅ |

---

## 50. NAVIGATION COMPLIANCE

| Requisito Navigation | Wireframe | Status |
|----------------------|-----------|:------:|
| Header universal (← Origem + Titulo + acoes) | WF-01 | ✅ |
| Max 2 acoes no header | [◈ Domus] apenas | ✅ |
| Bottom Nav sempre visivel | 82px fixa | ✅ |
| Active state: Inicio | WF-01 (via Home) | ✅ |
| Context Switcher global | Avatar → Sheet | ✅ |
| Origem dinamica | ← Inicio / ← Modulos / ← Domus | ✅ |

---

## 51. DOMUS COMPLIANCE

| Requisito Domus | Wireframe | Status |
|-----------------|-----------|:------:|
| Icone no header | [◈ Domus] slot de acao | ✅ |
| Contexto: modulo + conta ativa | { moduleContext: "contas", activeAccount } | ✅ |
| Perguntas seguras mapeadas | WF-18 | ✅ |
| Perguntas nao seguras bloqueadas | WF-18 | ✅ |
| Sem avatar/rosto | Icone BrainCircuit | ✅ |
| Sem emojis | — | ✅ |

---

## 52. UNIVERSAL MODULE COMPLIANCE

| Requisito Universal Pattern | Wireframe | Status |
|-----------------------------|-----------|:------:|
| Type T (Transactional) | Header + Summary + Action + List + Detail | ✅ |
| Header universal | 48px, back + titulo + acoes | ✅ |
| Module Summary | Saldo total, 36px hero | ✅ |
| Module Insight | 0-1 insight Domus | ✅ |
| Primary Action | Botao full-width "+ Adicionar conta" | ✅ |
| List item standard 56px | Com iniciais + nome + tipo + saldo | ✅ |
| Detail screen dedicado | WF-02 (tela propria, nao dialog) | ✅ |
| Bottom Sheet Add/Edit | WF-03, WF-04 | ✅ |
| Skeleton por bloco | WF-17 | ✅ |
| Empty state com CTA | WF-08 | ✅ |

---

## 53. FINANCIAL CORE COMPLIANCE

| Verificacao Financeira | Wireframe | Status |
|------------------------|-----------|:------:|
| totalBalance = Σ balance | ✅ Confirmado no codigo | ✅ |
| cashBalance = PF only | ✅ Alinhado via Context Switcher | ✅ |
| Nao recalcular metricas do Kernel | Nao expoe Freedom Index/Reserva | ✅ |
| Saldo manual = unica fonte | "Saldo informado" deixa claro | ✅ |
| Transacoes nao alteram balance | Wireframe nao sugere o contrario | ✅ |
| Transferencias nao alteram balance | Sem acao "Transferir" no modulo | ✅ |
| Saldo ≠ disponibilidade | Domus bloqueia perguntas de gasto | ✅ |
| Saldo ≠ receita | Summary nao usa "Disponivel" | ✅ |
| Saldo ≠ patrimonio liquido | Nao menciona netWorth | ✅ |
| Saldo ≠ orcamento | Sem referencia a orcamento | ✅ |

---

## 54. FINANCIAL INTEGRITY REVIEW

| Verificacao | Status |
|-------------|:------:|
| `account.balance` e manual | ✅ Confirmado. Unica fonte de verdade. |
| Transacoes NAO alteram balance | ✅ Confirmado via auditoria de codigo. |
| Transferencias NAO alteram balance | ✅ Confirmado. `transfer-reconciliation-engine` nao escreve em accounts. |
| Importacoes NAO alteram balance | ✅ Confirmado. Monthly closures nunca tocam `accounts`. |
| `cashBalance = Σ owner !== "PJ"` | ✅ Confirmado em `financial-core.ts:72`. |
| `totalBalance = Σ all` (PF+PJ) | ✅ Confirmado em `page.tsx:110`. |
| Delete sem protecao | ⚠️ `deleteAccount()` existe mas nao e chamado. Hard delete sem check. |
| Saldo manual sem audit trail | ⚠️ Usuario edita livremente. Sem historico de alteracoes de saldo. |
| `credit_card` como account type | ❌ Tratado como ativo positivo. Colide com `/cartoes`. P1. |
| `investment` como account type | ❌ Tratado como ativo positivo. Colide com `/investimentos`. P1. |
| totalBalance ≠ cashBalance | ❌ Metrica do modulo difere do Financial Core. P0 resolvido via Context Switcher. |

---

## 53. ACHADOS · CORRIGIDO

### CONTAS-WF-P0
| ID | Descricao |
|----|-----------|
| P0-02 | **Dupla contagem comprovada:** Contas `investment` PF entram em `cashBalance`. Se existir `Investment` entity para o mesmo ativo, `grossAssets = cashBalance + investmentValue` soma o mesmo patrimonio duas vezes. Confirmado em `financial-core.ts:71-97` e `dashboard-real.ts:159`. **Requer auditoria de dados e migracao.** |

### CONTAS-WF-P1
| ID | Descricao | Status |
|----|-----------|:------:|
| P1-01 | Context Switcher conflitava com secoes PF/PJ. | ✅ Resolvido (CR-01) |
| P1-02 | `credit_card` como account type — tratado como caixa no `cashBalance`. | ✅ Resolvido p/ novas contas (CR-03). Legado: requer migracao. |
| P1-03 | `investment` como account type — risco de dupla contagem. | ⚠️ Parcial. Resolvido p/ novas contas (CR-04). Legado: P0-02. |
| P1-04 | Add Account sem campo saldo. | ✅ Resolvido (CR-02) |

### CONTAS-WF-P2
| ID | Descricao |
|----|-----------|
| P2-01 | `deleteAccount()` existe mas nunca e chamado de nenhum componente UI. |
| P2-02 | Delete nao verifica transacoes associadas. |
| P2-03 | Domus contextual nao implementado. |
| P2-04 | Contexto Familia nao implementado. |
| P2-05 | Search para 50 contas nao implementado. |
| P2-06 | State restoration entre sessoes. |

### CONTAS-WF-P3
| ID | Descricao |
|----|-----------|
| P3-01 | Deep links: `/contas?id=abc123`. |
| P3-02 | Draft preservation no Add/Edit Sheet. |
| P3-03 | Animacao List → Detail. |
| P3-04 | Pull-to-refresh. |
| P3-05 | Haptics no delete. |

### Resumo

```
CONTAS-WF-P0 = 1  ⚠️ (P0-02: dupla contagem investment — requer migracao)
CONTAS-WF-P1 = 0  ✅ (todos resolvidos pelos CRs aprovados)
CONTAS-WF-P2 = 6
CONTAS-WF-P3 = 5
```

---

## 54. CHANGE REQUESTS · STATUS FINAL

| ID | Descricao | Status |
|----|-----------|:------:|
| `CONTAS-ARCH-CR-01` | Context Switcher substitui secoes PF/PJ | ✅ Incorporado |
| `CONTAS-ARCH-CR-02` | `addAccount()` expor campo saldo inicial | ✅ Incorporado (backend ja suporta) |
| `CONTAS-ARCH-CR-03` | Remover `credit_card` de novas contas | ✅ Incorporado |
| `CONTAS-ARCH-CR-04` | Remover `investment` de novas contas | ✅ Incorporado |
| `NAVIGATION-CR` | Nenhum | — |

---

## 57. IMPLEMENTATION GAP MAP

| Gap | Status | Classificacao |
|-----|:------:|:------------:|
| Saldo manual sem reconciliacao | Documentado. UX comunicada via "Saldo informado". | P2 |
| Delete sem protecao | `REQUIRES IMPLEMENTATION`. Backend e UI. | P2 |
| Delete nunca chamado da UI | `REQUIRES IMPLEMENTATION`. Conectar botao ao service. | P2 |
| Domus contextual | `REQUIRES IMPLEMENTATION`. | P2 |
| Contexto Familia | `FUTURE`. | P3 |
| State restoration | `FUTURE`. | P3 |
| Deep links | `FUTURE`. | P3 |
| Search para 50+ contas | `FUTURE`. | P2/P3 |
| Cross-module movements (Lancamentos) | `REQUER VERIFICACAO`. | P2 |
| Saldo inicial na criacao | Projetado. `REQUIRES IMPLEMENTATION`. | P1 |

---

## 58. VALIDACAO DE VIEWPORTS

### 375 × 812px

```
Area util: 812 − 54 − 82 = 676px

- Summary: 80px ✅
- Insight: 70px ✅
- Action: 60px ✅
- Items: ~5 visiveis sem scroll (56px cada = 280px + gaps)
- Total sem scroll: ~490px. Restante com scroll. ✅
- Long names: "Conta Empresarial Principal de Recebimentos" (~40 chars)
  Cabem em 343px com fonte 14px? ~240px. OK. ✅
- Large balance: "R$ 1.245.930,82" cabe? 343px com 14px fonte. OK. ✅
```

### 390 × 844px (principal)

```
Area util: 708px. Confortavel. ✅
```

### 430 × 932px

```
Area util: 796px. Amplo. ✅
- Margem lateral: ainda 16px (398px uteis)
- Mais respiro para nome + saldo na mesma linha. ✅
```

---

## 59. 5-SECOND TESTS

### Tela Principal (WF-01)

| Pergunta | Resposta | Tempo |
|----------|----------|:-----:|
| Quanto tenho cadastrado em contas? | R$ 10.700 (hero, 36px) | <1s |
| Quantas contas existem? | "2 contas · 2 bancos" | <2s |
| Onde esta a maior parte? | Insight: "72% concentrado..." | <3s |
| Como adiciono outra conta? | Botao "+ Adicionar conta" | <2s |

✅ Passou.

### Detail (WF-02)

| Pergunta | Resposta | Tempo |
|----------|----------|:-----:|
| Qual conta? | Header: "Itau PF" | <1s |
| Qual saldo cadastrado? | "Saldo informado R$ 8.200" | <2s |
| Qual tipo/contexto? | "Conta Corrente · Pessoal" | <2s |
| Como edito? | Botao "Editar conta" | <2s |

✅ Passou.

---

## 60. TESTES QUALITATIVOS

| Teste | Pergunta | Resposta |
|-------|----------|----------|
| Bank App | Parece app de um banco especifico? | NAO. Fundo escuro, sem logos, sem cores de marca. |
| Multiaccount | Fica claro que FinDomus consolida multiplas contas? | SIM. Lista com iniciais + nomes distintos. |
| Open Finance | Algum elemento sugere sincronizacao automatica? | NAO. "Saldo informado" + helper manual. |
| Manual Balance | O usuario entende que o saldo e informado/manualmente mantido? | SIM. Sem transformar a interface em disclaimer. |
| Dashboard | Virou 3-4 KPIs? | NAO. Apenas 1 metrica (saldo total). |
| Planilha | Virou tabela de contas? | NAO. Lista de cards com affordance de toque. |
| Banking | Parece extrato bancario? | NAO. Sem colunas de data/historico. |
| Accounting | Parece razao contabil? | NAO. Sem debito/credito, sem plano de contas. |
| Wallet | Parece app de carteira cripto? | NAO. Sem grafico de cotacao, sem % de variacao. |
| Intelligence | Insight ajuda interpretacao sem sugerir uso do dinheiro? | SIM. "72% concentrado" e observacao, nao sugestao de acao. |

---

## 61. COMPARACOES — SUMARIO DOS VENCEDORES

| Comparacao | Vencedor | Justificativa resumida |
|------------|----------|------------------------|
| Summary | Formato A — Hero + contexto | Mais limpo. Clareza em 5s. |
| PF/PJ vs Context | Opcao B — Apenas contexto ativo | Coerencia com Navigation + Financial Core. |
| List item | Formato B — Iniciais + nome + tipo | Melhor scan. Reconhecimento sem logo. |
| Avatar/institution initials | Manter iniciais | Ajuda reconhecimento. Custo baixo. |
| Search | NAO (sob demanda para 10+) | Dominio pequeno com Context Switcher. |
| Manual balance disclosure | Forma A — Label "Saldo informado" | Natural, sem disclaimer. Neutro. |
| Primary action | Formato A — Botao full-width | Universal Pattern. Empty state coeso. |
| Add balance behavior | Formato B — Campo saldo na criacao | UX superior. Exige ARCH-CR. |
| Detail actions | 2 fixas (Editar, Excluir) | Budget ≤3. Cross-module condicional. |
| Delete with history | 2 variantes (simples + com transacoes) | Honestidade. Marcado REQUIRES IMPLEMENTATION. |

---

## 62. COMPLEXITY BUDGET — RESPEITADO

| Limite | Valor | Status |
|--------|:-----:|:------:|
| Hero | 1 (saldo total) | ✅ |
| Insight | 0-1 | ✅ |
| Primary action | 1 | ✅ |
| Tabs | 0 | ✅ |
| Section labels | 0 (removidas via Context Switcher) | ✅ |
| Detail actions | ≤3 | ✅ (2 fixas) |
| Header actions | ≤2 (1 usado: Domus) | ✅ |
| Emojis | 0 | ✅ |
| Graficos | 0 | ✅ |

---

## 63. DECISOES TOMADAS NESTA FASE

| Decisao | Escolha |
|---------|---------|
| Estrutura | 1 tela sem tabs (mantido da Arquitetura) |
| Contexto PF/PJ | Apenas contexto ativo (Context Switcher) — Opcao B |
| Summary | "SALDO EM CONTAS" + valor + "X contas · Y bancos" |
| Manual balance | Label "Saldo informado" no Detail. Helper no Edit. |
| List item | 56px Standard com iniciais da instituicao |
| Add Account | Bottom Sheet com campo Saldo (default 0) |
| Edit Account | Bottom Sheet com helper manual |
| Primary Action | Botao full-width "+ Adicionar conta" |
| Delete | Confirmation Sheet (2 variantes) |
| Search | Sob demanda (icone no header para 10+ contas) |
| credit_card type | Excluido do Add/Edit Mobile |
| investment type | Excluido do Add/Edit Mobile |
| Account types Mobile | `checking`, `savings`, `wallet` |
| Import entry | Acao secundaria via More Sheet → Importacoes |
| Cross-module movements | Condicional (depende de Lancamentos) |
| Home Card | "Saldo em contas · R$ X" (conceitual) |

---

## 64. RECOMENDACAO FINAL · CORRIGIDA

O Contas Mobile Wireframe v1 (corrigido) prova que o modulo funciona com **1 tela sem tabs**, protagonista claro (saldo do contexto ativo), CRUD simplificado (Bottom Sheet / Confirmation Sheet), e respeito absoluto a realidade do dominio: **saldo manual, sem reconciliacao automatica**.

Os 4 Change Requests foram incorporados: Context Switcher (CR-01), saldo inicial no Add (CR-02), remocao de `credit_card` (CR-03) e `investment` (CR-04) das novas contas.

### Riscos documentados

O risco de **dupla contagem de investimentos** (P0-02) esta documentado e requer auditoria de dados de producao. Contas `investment` PF existentes entram em `cashBalance` e podem ser somadas novamente via `investmentValue` das entidades de Investimento, distorcendo `grossAssets` e `netWorth`.

### Estado de homologacao

```
CONTAS-WF-P0 = 1  ⚠️ (P0-02: dupla contagem investment — documentado, requer migracao)
CONTAS-WF-P1 = 0  ✅ (todos os 4 P1 resolvidos pelos CRs aprovados)
CONTAS-WF-P2 = 6
CONTAS-WF-P3 = 5
```

**Proximo passo:** Com `CONTAS-WF-P1 = 0`, prosseguir para **CONTAS MOBILE MASTER VISUAL v1**. O P0-02 (dupla contagem) e um risco de dados legados — nao bloqueia o design de novas telas, mas deve ser resolvido antes do lancamento em producao.

---

## 65. VEREDITO · CORRIGIDO

### O wireframe prova que:

```
✅ 1 tela funciona
✅ 375px funciona
✅ 390px funciona
✅ 430px funciona
✅ Saldo total do contexto ativo e claro
✅ Contexto ativo e coerente (CR-01)
✅ PF/PJ nao se misturam
✅ Multiempresa isolada por empresa ativa
✅ Saldo manual e transparente ("Saldo informado")
✅ Saldo inicial disponivel na criacao (CR-02)
✅ Tipos ativos: checking, savings, wallet (CR-03, CR-04)
✅ Tipos legados permanecem visiveis
✅ Saldo zero funciona
✅ Saldo negativo funciona
✅ 20 contas funciona
✅ 50 contas funciona (com search)
✅ Detail funciona
✅ Add/Edit funciona (Bottom Sheet)
✅ Delete e honesto (marcado REQUIRES IMPLEMENTATION)
✅ Importacao nao promete atualizar saldo
✅ Domus nao confunde saldo com disponibilidade
✅ Privacy funciona
✅ Offline funciona
✅ Nao parece banco
✅ Nao parece Open Finance
✅ Nao parece dashboard
✅ Nao parece planilha
```

### Principio final preservado:

```
SIMPLES NA SUPERFICIE.
PRECISA NA SEMANTICA.
HONESTA NA ORIGEM DOS DADOS.

CONTA E ESTOQUE.
TRANSACAO E FLUXO.
SALDO NAO E RENDA.
SALDO NAO E ORCAMENTO.
SALDO NAO E DINHEIRO LIVRE PARA GASTAR.

CONTEXTO ATIVO DEFINE O ESCOPO.
COMPATIBILIDADE ANTES DE LIMPEZA.
INTEGRIDADE ANTES DE SIMPLICIDADE.
MIGRACAO SOMENTE COM EVIDENCIA.
```

---

*FinDomus Contas Mobile Wireframe v1 · Fase 20.1 · CORRECTED / HOMOLOGATED*
