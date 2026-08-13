# FINDOMUS MOBILE PWA — FLUXO DE CAIXA SCREEN HOMOLOGATION v1

**Fase:** M0.3 — Homologação do Fluxo de Caixa
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado
**Home:** v1 homologada
**Dashboard:** v1 homologado
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DO FLUXO DE CAIXA

O Fluxo de Caixa responde a **três perguntas operacionais**:

```text
"Quanto entrou e saiu hoje?"
"Onde foi parar aquele gasto de terça?"
"Como registro isso rapidamente?"
```

É a tela de **ação**. Não é overview (Home). Não é análise (Dashboard). É **registro e consulta**.

## Posicionamento no ecossistema

| Tela | Pergunta | Verbo | Frequência |
|------|----------|:-----:|:----------:|
| Home | "Como estou?" | Ver | 5-10×/dia |
| Dashboard | "Por que estou assim?" | Analisar | 1-2×/semana |
| **Fluxo de Caixa** | **"O que aconteceu?"** | **Registrar** | **10-20×/dia** |

É a tela mais usada. Precisa ser a mais rápida.

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE O FLUXO DE CAIXA
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. VÊ O SALDO DO DIA                                     │
│    → "Hoje: +R$ 320. Entradas R$ 500, Saídas R$ 180"    │
│                                                          │
│ 2. SCROLLA PELA TIMELINE                                  │
│    → Vê transações agrupadas por data                     │
│    → Hoje expandido. Dias anteriores colapsados.          │
│                                                          │
│ 3. REGISTRA ALGO NOVO (FAB)                               │
│    → Bottom Sheet. 3 campos. 5 segundos.                 │
│                                                          │
│ 4. BUSCA OU FILTRA (quando precisa achar algo)            │
│    → Campo de busca no header. Filtros em chips.         │
│                                                          │
│ 5. EDITA OU CONFERE (tap na transação)                    │
│    → Bottom Sheet com todos os detalhes.                  │
└──────────────────────────────────────────────────────────┘
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px · Mês: Julho 2026

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Fluxo de Caixa                  [🔍] [📅] [···] │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resumo do dia
│  │  Hoje · 15 de julho                                      ││     ~40px
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              ││
│  │  │ 📥 Ent   │  │ 📤 Sai   │  │ 💰 Saldo │              ││
│  │  │ +R$ 500  │  │ -R$ 180  │  │ +R$ 320  │              ││
│  │  └──────────┘  └──────────┘  └──────────┘              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CHIPS ─────────────────────────────────────────────────│
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │ ← 32px
│  │ Todos  │ │▶ Entr. │ │ Saídas │ │ Pend.  │ │ Categoria │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘  │
│                                                              │
│  ─── TIMELINE ──────────────────────────────────────────────│
│                                                              │
│  ▼ HOJE · 15 JUL                                   +R$ 320  │ ← Dia header 40px
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ┃ 📥  Salário                      +R$ 8.200   09:15    ││ ← 56px
│  │ ┃     Conta Itaú PF · Recorrente                ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Aluguel                     -R$ 2.200   10:30    ││
│  │         Conta Itaú PF · Moradia                  ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Supermercado                -R$ 320     14:00    ││
│  │         Cartão Nubank · Alimentação             ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Uber                         -R$ 45     18:20    ││
│  │         Cartão Nubank · Transporte              ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ▶ ONTEM · 14 JUL                                  -R$ 120  │ ← Dia header colapsado
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Farmácia                     -R$ 120    19:45    ││ ← 1 linha preview
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ▶ 13 JUL · DOMINGO                                +R$ 0    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │     Nenhuma transação neste dia.                         ││ ← empty day
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ▶ 12 JUL · SÁBADO                                 -R$ 85   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Padaria                       -R$ 35    08:00    ││ ← 2 linhas preview
│  │     📤  Restaurante                   -R$ 50    20:30    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ... scroll infinito (carrega mais dias sob demanda)        │
│                                                              │
│  ← 80px espaço (FAB + safe) →                               │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav 82px
│ Início   Finanças   Investir   Domus     Mais                │
│          [ATIVO]                                             │
└──────────────────────────────────────────────────────────────┘
│                                                       [⊕]   │ ← FAB Add 56px
└──────────────────────────────────────────────────────────────┘
```

## 3.2 Dia expandido (HOJE)

```
▼ HOJE · 15 JUL                                   +R$ 320
┌──────────────────────────────────────────────────────────┐
│ ┃ 📥  Salário                      +R$ 8.200   09:15    │ ← borda verde left
│ ┃     Conta Itaú PF · Recorrente                ▸      │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│     📤  Aluguel                     -R$ 2.200   10:30    │
│         Conta Itaú PF · Moradia                  ▸      │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│     📤  Supermercado                -R$ 320     14:00    │
│         Cartão Nubank · Alimentação             ▸      │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┘
│     📤  Uber                         -R$ 45     18:20    │
│         Cartão Nubank · Transporte              ▸      │
└──────────────────────────────────────────────────────────┘
│  ─── Totais do dia ─────────────────────────────────────│
│  Entradas: +R$ 8.200    Saídas: -R$ 2.565               │
│  1 receita · 3 despesas                                  │
└──────────────────────────────────────────────────────────┘
```

## 3.3 Dia colapsado (ONTEM + anteriores)

```
▶ ONTEM · 14 JUL                                  -R$ 120  ← tap expande
┌──────────────────────────────────────────────────────────┐
│     📤  Farmácia                     -R$ 120    19:45    │ ← só a primeira
└──────────────────────────────────────────────────────────┘
│  + mais 1 transação                                       │ ← indicador
```

Quando colapsado: mostra apenas a primeira transação. Se houver mais, indicador "+ mais N transações".

---

# 4. AGRUPAMENTO DA TIMELINE

## 4.1 Decisão: Agrupamento por DIA

Comparação:

| Agrupamento | Prós | Contras | Veredito |
|-------------|------|---------|:--------:|
| **Por dia** | Rápido de scan. Familiar (WhatsApp, extrato bancário). Fácil de localizar "o que fiz terça". | Scroll pode ser longo em meses cheios. | ✅ |
| Por semana | Compacto. Bom para visão semanal. | Perde granularidade. "Qual dia mesmo?" | ❌ |
| Por mês (flat) | Simples. | Difícil de escanear. Planilha. | ❌ |
| Por categoria | Útil para análise. | Confuso para registro. Não é temporal. | ❌ |

**Vencedor:** Agrupamento por dia, com **HOJE sempre expandido** e dias anteriores colapsados.

## 4.2 Regras de agrupamento

| Condição | Comportamento |
|----------|--------------|
| Hoje | Sempre expandido. Mostra todas as transações. |
| Ontem | Colapsado. Mostra 1ª transação + contagem. |
| Esta semana | Colapsado. Mostra 1ª transação + contagem. |
| Semanas anteriores | Colapsado. Mostra 1ª transação + contagem. |
| Dia sem transações | Header visível. "Nenhuma transação neste dia." |
| Dia com 1 transação | Mostra a transação diretamente. Sem indicador "+ mais". |

---

# 5. COMPONENTES

## 5.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início    Fluxo de Caixa                  [🔍] [📅] [···] │
└──────────────────────────────────────────────────────────────┘
```

| Ícone | Ação |
|:-----:|------|
| 🔍 | Abre campo de busca inline abaixo do header |
| 📅 | Abre DatePicker para saltar para uma data específica |
| ··· | Menu: Importar extrato, Exportar, Filtrar avançado |

## 5.2 Resumo do Dia (Compact)

```
┌──────────────────────────────────────────────────────────┐
│  Hoje · 15 de julho                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 📥 Ent   │  │ 📤 Sai   │  │ 💰 Saldo │              │
│  │ +R$ 500  │  │ -R$ 180  │  │ +R$ 320  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | ~60px |
| 3 colunas | Entradas · Saídas · Saldo |
| Touch | Não interativo (informativo) |
| Atualização | Em tempo real ao registrar nova transação |

## 5.3 Chips de Filtro Rápido

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│ Todos  │ │▶ Entr. │ │ Saídas │ │ Pend.  │ │ Categoria │
└────────┘ └────────┘ └────────┘ └────────┘ └──────────┘
```

| Chip | Filtro |
|------|--------|
| Todos | Sem filtro (default) |
| Entradas | `type === 'income'` |
| Saídas | `type === 'expense'` |
| Pendentes | Transações ainda não conciliadas |
| Categoria | Abre Bottom Sheet com lista de categorias |

Scroll horizontal. Chip ativo: `action-primary-soft` + `action-primary`. Inativo: `surface.raised`.

## 5.4 Transação (Timeline Item)

```
Formato completo (expandido):
┌──────────────────────────────────────────────────────────┐
│ ┃ 📥  Salário                      +R$ 8.200   09:15    │ ← 56px
│ ┃     Conta Itaú PF · Recorrente                ▸      │
└──────────────────────────────────────────────────────────┘

Formato compacto (dia colapsado):
┌──────────────────────────────────────────────────────────┐
│     📤  Farmácia                     -R$ 120    19:45    │ ← 44px
└──────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Borda esquerda | 2px. Verde para income. Sem borda para expense. Transfer: azul. Pendente: âmbar. |
| Ícone | 20px. Lucide: ArrowDownLeft (income), ArrowUpRight (expense), ArrowLeftRight (transfer) |
| Descrição | 14px · 600w · text-primary · Máx 1 linha com ellipsis |
| Linha 2 | 12px · 400w · text-secondary · "Conta · Categoria" |
| Valor | 14px · 600w · tabular-nums · alinhado à direita · `state-positive` (income), `text-primary` (expense) |
| Horário | 11px · text-tertiary · alinhado à direita |
| Touch | Card inteiro → Bottom Sheet de detalhe |
| Swipe left | Revela ação "Excluir" (vermelho, com confirmação) |
| Swipe right | Revela ação "Editar" (azul) |
| Long press | Menu contextual: Editar, Duplicar, Excluir, Categorizar |

## 5.5 Dia Header

```
▼ HOJE · 15 JUL                                   +R$ 320
▶ ONTEM · 14 JUL                                  -R$ 120
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | 40px |
| Label | Dia da semana + data · 14px · 600w · text-primary |
| Saldo do dia | 14px · 600w · tabular-nums · alinhado à direita |
| Ícone | ▼ (expandido) · ▶ (colapsado) |
| Touch | Card inteiro → expande/colapsa o dia |
| Cor do saldo | `state-positive` se >0, `state-negative` se <0 |

## 5.6 FAB — Nova Transação

```
┌──────────────────────────────────────────────────────────────┐
│                                                       [⊕]   │ ← 56px
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Tamanho | 56px circular |
| Cor | `action-primary` (#00B4D8) |
| Ícone | Plus (24px, branco) |
| Posição | Bottom: 100px, Right: 16px |
| Ação | Abre Bottom Sheet de registro rápido |

### Bottom Sheet — Registro Rápido

```
┌──────────────────────────────────────────────────────────┐
│                    [scrim escuro]                         │
├──────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                     │
│                                                          │
│  Nova transação                                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐                             │ ← Toggle
│  │▶ Entrada │  │  Saída   │                             │
│  └──────────┘  └──────────┘                             │
│                                                          │
│  Valor                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ R$ │ 0,00                                          ││ ← Input financeiro 44px
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Descrição                                                │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Ex: Supermercado                                    ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 📂 Categoria  ▸  │  │ 🏦 Conta     ▸  │             │ ← Chips de seleção
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 📅 Hoje      ▸  │  │ 🕐 Agora    ▸  │             │ ← Data/Hora
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Salvar                                  ││ ← 44px azul
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ← safe area →                                            │
└──────────────────────────────────────────────────────────┘
```

**Meta de toques:** 5 toques para registrar uma transação (Tipo → Valor → Descrição → Categoria → Salvar).

**Atalhos:** Se a categoria e conta já estiverem preenchidas do contexto (última usada), reduz para 3 toques.

## 5.7 Bottom Sheet — Detalhe da Transação

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │                                                      ││ ← Header do detalhe
│  │  📥  Salário                        +R$ 8.200        ││    ~80px
│  │      Conta Itaú PF · Recorrente                      ││
│  │      15 de julho de 2026 · 09:15                      ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── DETALHES ──────────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Categoria            Salário / Rendimentos          ││ ← 44px cada
│  │  Conta                Itaú PF                        ││
│  │  Status               Conciliado                     ││
│  │  Origem               Importação OFX                 ││
│  │  Parcelas             Não parcelado                  ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── AÇÕES ─────────────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  ✏️  Editar                                          ││ ← 44px
│  │  📋  Duplicar                                        ││
│  │  🗑  Excluir                                         ││ ← text state-negative
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ← safe area →                                            │
└──────────────────────────────────────────────────────────┘
```

---

# 6. CONCILIAÇÃO — Indicadores Visuais

## 6.1 Status da Transação

| Status | Indicador visual |
|--------|-----------------|
| **Conciliada** | Sem indicador (padrão). Texto normal. |
| **Pendente** | Borda esquerda âmbar (2px). |
| **Importada** | Ícone sutil de cloud (☁️) no canto. |
| **Manual** | Sem indicador. |
| **Duplicada** | Borda esquerda vermelha (2px). |
| **Ignorada** | Opacidade reduzida (0.4). |

## 6.2 Origem

| Origem | Como mostrar |
|--------|-------------|
| Manual | Sem indicador |
| OFX | Badge sutil "OFX" (10px, surface.raised) |
| PDF | Badge "PDF" |
| CSV | Badge "CSV" |
| Pluggy (futuro) | Badge "🏦" |

---

# 7. PESQUISA

## 7.1 Comportamento

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início    Fluxo de Caixa                                   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍  supermerc                                          ││ ← 44px, autofoco
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  3 resultados para "supermerc"                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Supermercado Extra       -R$ 320     15 jul     ││
│  │         Cartão Nubank                                    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Supermercado BH          -R$ 180     08 jul     ││
│  │         Cartão Nubank                                    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │     📤  Supermercado Online       -R$ 95      01 jul     ││
│  │         Conta Itaú PF                                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Busca por | Descrição, categoria, conta, valor (R$), tag, observação |
| Resultados | Ordenados por data (mais recente primeiro) |
| Tempo | Instantâneo (filtro local sobre dados carregados) |
| Vazio | "Nenhum resultado para 'termo'." |
| Cancelar | Ícone X limpa busca e retorna à timeline |

---

# 8. DOMUS NO FLUXO DE CAIXA

A Domus atua como **assistente operacional**:

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃                                                        │
│ ┃ Detectei 2 transações similares: "Uber" e             │
│ ┃ "Uber Eats" no mesmo dia. São a mesma?        ▸      │
└──────────────────────────────────────────────────────────┘
```

| Insight | Contexto |
|---------|----------|
| "Essa despesa parece recorrente." | 3+ transações com mesma descrição e valor em meses consecutivos |
| "Categoria provavelmente incorreta." | Transação em categoria atípica para aquela conta |
| "Detectei possível duplicidade." | Mesmo valor, mesma data, mesma conta |
| "Essa despesa aumentou 30%." | Comparação com média dos últimos 3 meses |
| "Recomendo criar despesa fixa." | Transação com mesmo valor e intervalo regular |

---

# 9. HIERARQUIA

```
1. RESUMO DO DIA              ← "Como está hoje?"
   Entradas + Saídas + Saldo. Sempre visível no topo.

2. HOJE (expandido)           ← "O que já aconteceu hoje?"
   Todas as transações do dia. Sempre expandido.

3. CHIPS DE FILTRO            ← "Quero ver só receitas."
   Acesso rápido a filtros comuns.

4. DIAS ANTERIORES            ← "O que fiz ontem?"
   Colapsados. Expansão sob demanda.
```

---

# 10. MICROINTERAÇÕES

| Gesto | Alvo | Ação |
|-------|------|------|
| Tap | Transação | Bottom Sheet de detalhe |
| Swipe left | Transação | Revela botão "Excluir" |
| Swipe right | Transação | Revela botão "Editar" |
| Long press | Transação | Menu contextual |
| Tap | Dia header | Expande/Colapsa o dia |
| Tap | FAB ⊕ | Bottom Sheet de registro rápido |
| Pull-to-refresh | Tela | Recarrega dados do Firestore |

## Animações

| Evento | Animação | Duração |
|--------|----------|:-------:|
| Expandir dia | max-height + fade-in dos itens | 250ms |
| Nova transação | Slide-in do topo (ou fade-in) | 200ms |
| Excluir transação | Slide-out + fade-out | 200ms |
| Registro rápido | Sheet: spring do bottom | 300ms |
| Alternar filtro | Fade-in dos resultados | 150ms |

---

# 11. ESTADOS

## 11.1 Loading

Skeleton: 3 blocos de dia (header + 3 ghost rows cada). animate-pulse. Header real visível.

## 11.2 Sem transações

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [ArrowLeftRight, 48px, text-tertiary]        │
│                                                          │
│         Nenhuma transação neste período                  │
│                                                          │
│   Registre sua primeira movimentação tocando no ⊕.       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 11.3 Pesquisa sem resultado

```
┌──────────────────────────────────────────────────────────┐
│  🔍  xyzabc                                             │
│                                                          │
│              Nenhum resultado para "xyzabc"              │
│                                                          │
│     Tente outro termo ou ajuste os filtros.              │
│                                                          │
│           ┌──────────────────────────────────────┐       │
│           │        Limpar busca                  │       │
│           └──────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

## 11.4 Offline

- Dados cacheados visíveis (último fetch).
- FAB: desabilitado. Label "Indisponível offline".
- Swipe actions: desabilitadas.
- Badge "Offline" no header.

---

# 12. PERFORMANCE

| Métrica | Alvo | Estratégia |
|---------|:----:|------------|
| Render inicial | < 500ms | Cache-first. Virtualização da timeline. |
| Registrar transação | < 2s | Firestore write + atualização local otimista. |
| Scroll com 1000+ transações | 60fps | Virtualização (react-window ou similar). Carregamento paginado. |
| Busca | < 50ms | Índice local em memória. Filtro sobre dados já carregados. |
| Troca de filtro | < 100ms | Filtro local. Sem nova consulta Firestore. |

## Estratégia de carregamento

```
1. Carregar últimos 30 dias (transações recentes)
2. Scroll → carregar +30 dias (paginado, 30 dias por página)
3. Datas sem transações não ocupam memória (dia colapsado sem fetch extra)
4. Virtualização: renderizar apenas dias visíveis + 2 acima/abaixo
```

---

# 13. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Transações (56px), FAB (56px), chips (32px + padding) |
| Safe areas | ✅ |
| Dynamic Type | ✅ Layout adapta para fontes maiores |
| Contraste AA | ✅ |
| Screen reader | ✅ "Entrada: Salário, 8.200 reais, Conta Itaú, 9:15" |
| Dark + Light | ✅ |
| Uso com uma mão | ✅ FAB e chips na metade inferior |

---

# 14. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Timeline agrupada por dia (Hoje expandido, demais colapsados)
- [ ] Resumo do dia: Entradas + Saídas + Saldo (3 colunas)
- [ ] Chips de filtro rápido (Todos, Entradas, Saídas, Pendentes, Categoria)
- [ ] Transação: 56px com ícone, descrição, categoria, conta, valor, horário
- [ ] Borda esquerda colorida: verde (income), sem (expense), âmbar (pendente)
- [ ] FAB ⊕ para registro rápido (Bottom Sheet, 3-5 toques)
- [ ] Bottom Sheet de detalhe ao tocar transação
- [ ] Swipe left = excluir, Swipe right = editar
- [ ] Busca inline: descrição, categoria, conta, valor
- [ ] Domus operacional: detecção de duplicidade, recorrência, categoria
- [ ] Componentes reutilizados: Insight Card, KPIs, lista
- [ ] FDL 1.0: cores, tipografia, grid

## Estados

- [ ] Loading: skeleton (3 dias × 3 ghost rows)
- [ ] Sem transações: empty state com CTA
- [ ] Pesquisa sem resultado: mensagem + limpar
- [ ] Offline: dados cacheados + FAB desabilitado
- [ ] Erro: mensagem + tentar novamente

## Interações

- [ ] Tap expande/colapsa dia
- [ ] Swipe left → excluir (com confirmação)
- [ ] Swipe right → editar
- [ ] Long press → menu contextual
- [ ] FAB → registro rápido (Bottom Sheet)
- [ ] Tap na transação → detalhe (Bottom Sheet)
- [ ] Pull-to-refresh

## Performance

- [ ] Virtualização para 1000+ transações
- [ ] Busca instantânea (filtro local)
- [ ] Scroll 60fps
- [ ] Registro com atualização otimista

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Contraste AA
- [ ] Screen reader
- [ ] Dark + Light

---

# 15. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Agrupamento | Por dia (Hoje expandido) | Familiar. Rápido de scan. |
| Nova transação | FAB ⊕ + Bottom Sheet | Acesso rápido. Não navega para outra tela. |
| Detalhe | Bottom Sheet (não tela dedicada) | Preserva contexto da timeline. |
| Swipe actions | Left=excluir, Right=editar | Padrão iOS. Consistente com Mail, Mensagens. |
| Busca | Inline no header | Sempre acessível. Filtro local instantâneo. |
| Virtualização | Sim | Essencial para performance com muitas transações. |
| Conciliação | Borda colorida + badge de origem | Sutil. Não polui a timeline. |
| Domus | Operacional (não analítica) | IA ajuda no registro e categorização. |

---

*FinDomus Fluxo de Caixa Mobile Homologation v1 · Fase M0.3 · PRONTO PARA HOMOLOGAÇÃO*
