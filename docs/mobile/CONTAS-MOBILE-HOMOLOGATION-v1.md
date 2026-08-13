# FINDOMUS MOBILE PWA — CONTAS MODULE HOMOLOGATION v1

**Fase:** M0.4 — Homologação do Módulo Contas
**FDL:** 1.0 FROZEN
**Arquitetura de referência:** `CONTAS-MOBILE-ARCHITECTURE-v1.md` (Fase 20.1, CORRECTED)
**Wireframe de referência:** `CONTAS-MOBILE-WIREFRAME-v1.md` (Fase 20.1, CORRECTED)
**Financial Core:** Consolidado (Fases 20.2–20.5)
**PWA Design:** v1 homologado
**Home / Dashboard / Fluxo de Caixa:** v1 homologados
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DO MÓDULO CONTAS

O módulo Contas responde a **uma pergunta patrimonial**:

```text
"Onde está meu dinheiro?"
```

Não é um extrato. Não é uma lista de bancos. Não é um dashboard. É um **mapa do patrimônio líquido disponível** — dinheiro em contas correntes, poupanças e carteiras.

## Posicionamento no ecossistema

| Tela | Pergunta | Protagonista |
|------|----------|:-----------:|
| Home | "Como estou?" | Saldo disponível |
| Dashboard | "Por que estou assim?" | Resultado do mês |
| Fluxo de Caixa | "O que aconteceu?" | Timeline de transações |
| **Contas** | **"Onde está meu dinheiro?"** | **Distribuição por conta** |

## Fatos arquiteturais (herdados da Fase 20)

| Fato | Implicação no design |
|------|---------------------|
| Saldo é **manual** | Label "Saldo informado". Helper no Edit. |
| Contexto ativo (Context Switcher) | Apenas contas do contexto ativo. PF e PJ não se misturam. |
| Tipos: `checking`, `savings`, `wallet` | Apenas 3 tipos para novas contas. |
| `credit_card` e `investment` são legado | Visíveis mas não criáveis. |
| Transações NÃO alteram saldo | Sem sugestão de conciliação automática. |
| `cashBalance` = Σ contas líquidas PF | Alinhado com Financial Core. |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE CONTAS
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. VÊ O SALDO TOTAL                                      │
│    → "Tenho R$ 9.500 em 3 contas"                        │
│                                                          │
│ 2. ESCANEIA A LISTA                                      │
│    → "Itaú concentra a maior parte"                      │
│    → "Nubank é minha conta do dia a dia"                 │
│                                                          │
│ 3. TOQUE EM UMA CONTA                                    │
│    → Bottom Sheet com detalhes + saldo informado         │
│    → "Saldo informado: R$ 8.200"                         │
│                                                          │
│ 4. AÇÕES                                                 │
│    → Editar saldo (Bottom Sheet)                         │
│    → Excluir conta (Confirmação)                         │
│    → Adicionar nova conta (FAB ou botão)                 │
│                                                          │
│ 5. TROCA DE CONTEXTO (avatar)                            │
│    → Ver contas PJ da empresa ativa                      │
│    → Voltar para contas PF                               │
└──────────────────────────────────────────────────────────┘
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px · Contexto: Pessoal

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Início         Contas                    [👤] [◈] [···]   │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Summary Card
│  │                                                          ││    ~100px
│  │  SALDO EM CONTAS                                        ││
│  │                                                          ││
│  │  R$ 9.500                                                ││ ← 36px hero
│  │                                                          ││
│  │  3 contas · 2 bancos · Pessoal                           ││ ← 13px secondary
│  │                                                          ││
│  │  ┌──────────────────────────────────────────────────────┐││ ← mini-barras
│  │  │ Itaú PF         ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 86%        │││
│  │  │ Nubank          ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ 14%         │││
│  │  └──────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight (0-1)
│  │ ┃ ◈ Domus                                               ││    ~60px
│  │ ┃ 72% do seu saldo está no Itaú PF.                     ││
│  │ ┃ Considera distribuir para aproveitar mais      ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CONTAS ────────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 56px cada
│  │  [IT]  Itaú PF · Conta Corrente        R$ 8.200    →   ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  [NU]  Nubank · Conta Corrente          R$ 1.300    →   ││
│  │         Atualizado em 15/07                               ││ ← 11px tertiary
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  [CA]  Carteira · Dinheiro              R$ 0,00     →   ││ ← saldo zero
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Conta legado
│  │  [XP]  XP Investimentos · Inv. (legado) R$ 10.000  →   ││ ← visível, não
│  └──────────────────────────────────────────────────────────┘│    editável o tipo
│                                                              │
│  ← 80px espaço (botão + safe) →                             │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav 82px
│ Início   Finanças   Investir   Domus     Mais                │
│          [ATIVO]                                             │
└──────────────────────────────────────────────────────────────┘
│                                                [+ Adicionar] │ ← Botão ou FAB
└──────────────────────────────────────────────────────────────┘
```

## 3.2 Contexto PJ (Empresa TreeTech Automation)

```
┌──────────────────────────────────────────────────────────┐
│  SALDO EM CONTAS                                        │
│                                                          │
│  R$ 42.500                                               │
│                                                          │
│  2 contas · 1 banco · TreeTech Automation                │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Itaú PJ         ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 85%        ││
│  │ Santander PJ    ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ 15%         ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

# 4. COMPONENTES

## 4.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início         Contas                    [👤] [◈] [···]   │
└──────────────────────────────────────────────────────────────┘
```

| Ícone | Ação |
|:-----:|------|
| 👤 Avatar | Abre Context Switcher (trocar entre PF e empresas) |
| ◈ Domus | Abre Domus com contexto de Contas |
| ··· | Menu: Importar extrato, Filtrar |

## 4.2 Summary Card (Saldo Total)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  SALDO EM CONTAS                                        │ ← 10px tertiary uppercase
│                                                          │
│  R$ 9.500                                                │ ← 36px 800w financial-hero
│                                                          │
│  3 contas · 2 bancos · Pessoal                           │ ← 13px secondary
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Itaú PF         ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 86%        ││ ← mini-barras
│  │ Nubank          ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ 14%         ││    proporcionais
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Altura | ~100px (com 2 barras) |
| Label | "SALDO EM CONTAS" — nunca "Saldo total" (sugere agregação automática) |
| Valor | `financial-hero` (36px, 800w, tabular-nums) |
| Contexto | "X contas · Y bancos · [Contexto]" — sempre inclui o contexto ativo |
| Mini-barras | Até 5 contas. Cada barra: 6px altura, cor `action-primary` com opacidade proporcional ao saldo |
| Sem mini-barras | Se vazio (0 contas). Se apenas 1 conta: barra única 100%. |

### Por que mini-barras e não gráfico?

| Abordagem | Prós | Contras | Veredito |
|-----------|------|---------|:--------:|
| **Mini-barras inline** | Integrado ao Summary. Escaneável. Sem espaço extra. | Limitado a 5-6 contas. | ✅ |
| Gráfico donut | Visualmente rico. | Ocupa 120px+. Duplica informação da lista. | ❌ |
| Sem visualização | Limpo. | Perde noção de proporção. | ❌ |

## 4.3 Conta (List Item)

```
┌──────────────────────────────────────────────────────────┐
│  [IT]  Itaú PF · Conta Corrente        R$ 8.200    →   │ ← 56px
│         Atualizado em 15/07                               │ ← 11px tertiary
└──────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Altura | 56px (Standard) |
| Avatar | 36px container circular · Iniciais da instituição (2 letras) · `surface.raised` · 14px 600w `text-secondary` |
| Nome | 14px · 600w · text-primary |
| Tipo | 12px · 400w · text-secondary · Após o nome na linha 1: "· Conta Corrente" |
| Linha 2 | Opcional. "Atualizado em [data]" se `updatedAt` existe. Senão, omitida. |
| Saldo | 14px · 600w · tabular-nums · alinhado à direita |
| Negativo | Valor em `state-negative` |
| Zero | "R$ 0,00" normal |
| Touch | Card inteiro → Bottom Sheet de detalhe |
| Swipe left | Revela "Excluir" (confirmação) |
| Gap | 8px entre itens |

### Conta legado (credit_card / investment)

```
┌──────────────────────────────────────────────────────────┐
│  [XP]  XP Investimentos · Inv. (legado) R$ 10.000  →   │
└──────────────────────────────────────────────────────────┘
```

| Diferença | Comportamento |
|-----------|--------------|
| Tipo | Sufixo "(legado)" no label do tipo — sutil, informativo |
| Edição | Permite editar nome e saldo. Tipo congelado. |
| Criação | Não disponível no Add Account |

## 4.4 Bottom Sheet — Detalhe da Conta

```
┌──────────────────────────────────────────────────────────┐
│                    [scrim escuro]                         │
├──────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│ ← Summary
│  │                                                      ││    ~80px
│  │  Itaú PF · Conta Corrente · Pessoal                  ││
│  │                                                      ││
│  │  Saldo informado                                     ││ ← 10px tertiary
│  │  R$ 8.200                                            ││ ← 28px 700w
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── INFORMAÇÕES ───────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Tipo                 Conta Corrente                 ││ ← 44px cada
│  │  Proprietário         Pessoal (PF)                   ││
│  │  Empresa              —                              ││
│  │  Criada em            10/01/2026                     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── AÇÕES ─────────────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  ✏️  Editar conta                                    ││ ← 44px azul full
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │  📥  Importar extrato                                ││ ← 44px outline
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │  🗑  Excluir conta                                   ││ ← 44px text negativo
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ← safe area →                                            │
└──────────────────────────────────────────────────────────┘
```

### Por que "Saldo informado"?

Conforme decisão da Fase 20.1 (Wireframe), o label "Saldo informado" comunica que o saldo é **mantido manualmente** pelo usuário, sem sugerir que o dado é inválido ou impreciso. É um qualificador neutro — "informado" = o usuário informou, o FinDomus mostra.

Alternativas rejeitadas:
- "Saldo" — omite a manualidade
- "Saldo cadastrado" — burocrático
- "Saldo real" — falso (não há como garantir)

## 4.5 Bottom Sheet — Add Account

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  Nova conta                                              │
│                                                          │
│  Nome da conta                                           │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Ex: Itaú Conta Corrente                             ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Tipo                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Conta Corrente                                ▾     ││ ← checking/savings/wallet
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Saldo informado                                         │
│  ┌──────────────────────────────────────────────────────┐│
│  │ R$ 0,00                                             ││ ← input financeiro
│  └──────────────────────────────────────────────────────┘│
│  Você pode editar o saldo depois.                        │
│                                                          │
│  ───────────────────────────────────────                │
│  Conta pessoal                                           │ ← contexto informativo
│  (seu contexto ativo)                                    │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Salvar conta                            ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Tipo de conta — Opções

| Valor | Label | Disponível? |
|-------|-------|:-----------:|
| `checking` | Conta Corrente | ✅ Sim |
| `savings` | Poupança | ✅ Sim |
| `wallet` | Carteira | ✅ Sim |
| `credit_card` | Cartão de Crédito | ❌ Legado (visível, não criável) |
| `investment` | Investimento | ❌ Legado (visível, não criável) |

### Contexto

- **PF:** "Conta pessoal (seu contexto ativo)"
- **PJ:** "Empresa TreeTech Automation (seu contexto ativo)"
- **Sem seletor owner:** O contexto define PF/PJ automaticamente.
- **Sem seletor empresa:** Em PJ, `companyId` é preenchido com a empresa ativa.

## 4.6 Bottom Sheet — Edit Account

Igual ao Add, com diferenças:

| Campo | Comportamento |
|-------|--------------|
| Nome | Preenchido com valor atual |
| Tipo | Select normal para tipos ativos. Para legado: valor fixo, não editável. |
| Saldo | Valor atual. Helper: "O saldo desta conta é mantido manualmente no FinDomus." |

## 4.7 Confirmation Sheet — Delete

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  Excluir conta?                                          │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  [IT]  Itaú PF · Conta Corrente · R$ 8.200          ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  A conta será removida do FinDomus.                      │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Excluir conta                           ││ ← state-negative
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │              Cancelar                                ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

# 5. HIERARQUIA

```
1. SALDO EM CONTAS           ← "Quanto tenho no total?"
   Hero 36px. Sempre visível no topo.

2. DISTRIBUIÇÃO (barras)     ← "Onde está concentrado?"
   Mini-barras inline no Summary. Percepção visual instantânea.

3. INSIGHT DOMUS (0-1)       ← "O que a IA observa?"
   Concentração, inatividade, oportunidades.

4. LISTA DE CONTAS           ← "Quais contas?"
   Ordenadas por saldo (maior primeiro).
   Itens de 56px. Scroll natural.
```

---

# 6. MICROINTERAÇÕES

| Gesto | Alvo | Ação |
|-------|------|------|
| Tap | Conta | Bottom Sheet de detalhe |
| Swipe left | Conta | Revela "Excluir" |
| Tap | Avatar (header) | Context Switcher Sheet |
| Tap | ◈ Domus (header) | Abre Domus contextual |
| Tap | "+ Adicionar" | Bottom Sheet Add Account |
| Pull-to-refresh | Tela | Recarrega contas do Firestore |

## Animações

| Evento | Animação | Duração |
|--------|----------|:-------:|
| Add/Edit Sheet | Spring do bottom | 300ms |
| Delete Sheet | Spring do bottom + scrim fade | 250ms |
| Troca de contexto | Fade-out + fade-in do conteúdo | 250ms |

---

# 7. ESTADOS

## 7.1 Sem contas (Empty)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [Landmark, 48px, text-tertiary]              │
│                                                          │
│         Nenhuma conta cadastrada                         │
│                                                          │
│   Cadastre suas contas correntes, poupanças              │
│   ou carteiras para acompanhar seus saldos.              │
│                                                          │
│     ┌──────────────────────────────────────┐             │
│     │        + Adicionar conta             │             │
│     └──────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

## 7.2 Loading

Skeleton: Summary (2 linhas) + 3 ghost rows de conta (avatar + nome + valor).

## 7.3 Saldo zero

```
┌──────────────────────────────────────────────────────────┐
│  SALDO EM CONTAS                                        │
│                                                          │
│  R$ 0,00                                                 │
│                                                          │
│  1 conta · 1 banco · Pessoal                             │
└──────────────────────────────────────────────────────────┘
```

Saldo zero é um valor válido. Não é empty state.

## 7.4 Saldo negativo

O valor do Summary e o valor da conta usam `state-negative`. O card permanece com fundo normal (sem fundo vermelho). FDL P5: "Problemas financeiros não gritam."

## 7.5 Offline

- Dados cacheados visíveis.
- Botão "Adicionar": desabilitado ("Indisponível offline").
- Editar/Excluir: desabilitados.
- Badge "Offline" no header.

## 7.6 Privacy Mode

- Valores mascarados: `R$ ••••••`.
- Nomes, tipos, instituições: visíveis.
- Mini-barras: mantidas (proporção sem valores).

---

# 8. DOMUS CONTEXTUAL

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃                                                        │
│ ┃ 72% do seu saldo está no Itaú PF.                     │
│ ┃ Considera distribuir para aproveitar mais      ▸      │
└──────────────────────────────────────────────────────────┘
```

| Insight | Gatilho |
|---------|---------|
| "X% do saldo está concentrado em uma conta." | Maior conta > 60% do total |
| "Sua conta Y não tem movimentação há Z dias." | Conta sem atualização de saldo |
| "Você tem 3 contas no mesmo banco." | Agrupar por nome similar |
| "Seu saldo em contas representa X% do seu patrimônio." | cashBalance / grossAssets |

### Perguntas seguras para a Domus

- "Quanto tenho informado nas contas?"
- "Qual conta tem maior saldo?"
- "Como meu saldo está distribuído?"

### Perguntas NÃO seguras (bloquear)

- "Quanto posso gastar?" → Saldo ≠ disponibilidade
- "Quanto posso transferir?" → Saldo ≠ saldo disponível do banco

---

# 9. PERFORMANCE

| Métrica | Alvo | Estratégia |
|---------|:----:|------------|
| Render inicial | < 400ms | Cache-first. Dados locais. |
| Add/Edit/Delete | < 1s | Firestore write + atualização local otimista. |
| 50 contas | Scroll 60fps | Virtualização se necessário. |
| Troca de contexto | < 500ms | Novo fetch filtrado por owner/companyId. |

---

# 10. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Contas (56px), botões (44px), avatar (44px) |
| Safe areas | ✅ |
| Dynamic Type | ✅ |
| Contraste AA | ✅ |
| Screen reader | ✅ "Itaú PF, Conta Corrente, Saldo informado: 8.200 reais" |
| Dark + Light | ✅ |
| Uso com uma mão | ✅ Botão Adicionar na metade inferior, lista alcançável |

---

# 11. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Summary: "SALDO EM CONTAS" + valor 36px + contexto ativo + mini-barras
- [ ] Lista: avatar com iniciais, nome, tipo, saldo, 56px
- [ ] Contexto ativo visível no Summary e header (avatar)
- [ ] Sem seções "PESSOAL" / "EMPRESARIAL" — contexto define escopo
- [ ] Tipos no Add: apenas checking, savings, wallet
- [ ] Tipos legado: visíveis na lista com "(legado)", não criáveis
- [ ] Saldo: label "Saldo informado" no Detail, helper no Edit
- [ ] Delete: Confirmation Sheet. Mensagem factual.
- [ ] Importar extrato: ação secundária via ··· no header
- [ ] Domus: contextual, com perguntas seguras mapeadas
- [ ] FAB/Botão "Adicionar conta" acessível
- [ ] Componentes reutilizados: Insight Card, Summary Card, List Item
- [ ] FDL 1.0: cores, tipografia, grid

## Estados

- [ ] Empty: mensagem + CTA Adicionar
- [ ] Loading: skeleton (Summary + 3 ghost rows)
- [ ] Saldo zero: valor válido, não empty
- [ ] Saldo negativo: state-negative pontual
- [ ] Offline: dados cacheados + ações desabilitadas
- [ ] Privacy: valores mascarados, estrutura preservada
- [ ] Erro parcial: preservar dados carregados

## Interações

- [ ] Tap na conta → Bottom Sheet de detalhe
- [ ] Swipe left → excluir
- [ ] Tap avatar → Context Switcher
- [ ] Tap ◈ → Domus contextual
- [ ] Tap/FAB Adicionar → Bottom Sheet Add
- [ ] Pull-to-refresh

## Integridade financeira

- [ ] Saldo é manual (não sugere conciliação automática)
- [ ] Apenas contas do contexto ativo (Context Switcher)
- [ ] Tipos legados visíveis mas não criáveis
- [ ] `credit_card` e `investment` não disponíveis no Add
- [ ] Importação não promete atualizar saldo
- [ ] Sem ação "Transferir" (transferência é transação, não conta)
- [ ] Sem Freedom Index ou Reserva de Emergência (pertencem à Home)

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Contraste AA
- [ ] Screen reader
- [ ] Dark + Light mode
- [ ] Uso com uma mão

---

# 12. DECISÕES TOMADAS

| Decisão | Escolha | Referência |
|---------|---------|:----------:|
| Estrutura | 1 tela sem tabs | ARCH-CR-01 (Fase 20.1) |
| Contexto | Apenas contexto ativo (Context Switcher) | ARCH-CR-01 |
| Saldo no Add | Campo "Saldo informado" com default 0 | ARCH-CR-02 |
| Tipos disponíveis | `checking`, `savings`, `wallet` | ARCH-CR-03, CR-04 |
| Tipos legados | Visíveis, não criáveis, tipo congelado no Edit | Legacy Compatibility v1 |
| Label do saldo | "Saldo informado" (Detail) + helper (Edit) | Wireframe v1 (Fase 20.1) |
| Mini-barras | Inline no Summary (não gráfico separado) | FDL: simplicidade |
| Detail | Bottom Sheet (não navegação) | PWA Design v1 |
| Add/Edit | Bottom Sheet | PWA Design v1 + Universal Module Pattern |
| Importar extrato | Ação secundária (··· header) | Wireframe v1 |

---

*FinDomus Contas Mobile Homologation v1 · Fase M0.4 · PRONTO PARA HOMOLOGAÇÃO*
