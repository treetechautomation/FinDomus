# FINDOMUS MOBILE PWA — INVESTIMENTOS MODULE HOMOLOGATION v1

**Fase:** M0.6 — Homologação dos Investimentos
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado
**Home / Dashboard / Fluxo de Caixa / Contas / Planejamento:** v1 homologados
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DOS INVESTIMENTOS

O módulo Investimentos responde a **três perguntas de patrimônio**:

```text
"Quanto meu dinheiro está rendendo?"
"Onde ele está investido?"
"Minha carteira está saudável?"
```

Não é um home broker. Não é uma plataforma de trading. Não é uma corretora. É um **painel de evolução patrimonial** — mostra o que você tem, como está distribuído e quanto está crescendo.

## Posicionamento no ecossistema

| Tela | Pergunta | Tom |
|------|----------|:---:|
| Home | "Como estou?" | Clareza |
| Dashboard | "Por que estou assim?" | Compreensão |
| Fluxo de Caixa | "O que aconteceu?" | Controle |
| Contas | "Onde está meu dinheiro?" | Organização |
| Planejamento | "Para onde estou indo?" | Motivação |
| **Investimentos** | **"Como meu patrimônio trabalha?"** | **Confiança** |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE INVESTIMENTOS
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. VÊ O PATRIMÔNIO TOTAL                                  │
│    → "R$ 15.000 investidos. +R$ 420 este mês."           │
│                                                          │
│ 2. VÊ A RENTABILIDADE                                     │
│    → "+2,8% no mês. +11,4% em 12 meses."                 │
│                                                          │
│ 3. VÊ A DISTRIBUIÇÃO (alocação)                           │
│    → Donut: 67% Renda Fixa, 20% FIIs, 13% Ações         │
│                                                          │
│ 4. EXPLORA A CARTEIRA (accordion)                         │
│    → Expande Renda Fixa: CDB, Tesouro, LCI               │
│    → Expande FIIs: HGLG11, KNRI11                        │
│                                                          │
│ 5. TOQUE EM UM ATIVO                                      │
│    → Bottom Sheet: valor, rentabilidade, evolução        │
│                                                          │
│ 6. ADICIONA NOVO (FAB)                                    │
│    → Tipo, instituição, ticker, valor, data              │
└──────────────────────────────────────────────────────────┘
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Início     Investimentos               [◈ Domus] [···]    │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Hero
│  │                                                          ││   ~120px
│  │  Patrimônio investido                                    ││
│  │                                                          ││
│  │  R$ 15.000                                               ││ ← 36px hero
│  │                                                          ││
│  │  +R$ 420 este mês · +2,8%                                ││ ← 13px positive
│  │  Rentabilidade 12 meses: +11,4%                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Alocação
│  │                                                          ││   ~130px
│  │  Distribuição                                            ││
│  │                                                          ││
│  │  ┌──────────┐                                            ││ ← Donut 80px
│  │  │  ◉       │   ▰▰  Renda Fixa     R$ 10.000 · 67%     ││    + legenda
│  │  │ donut    │   ▰▰  FIIs            R$ 3.000  · 20%     ││    inline
│  │  │  80px    │   ▰▰  Ações           R$ 2.000  · 13%     ││
│  │  └──────────┘                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Domus
│  │ ┃ ◈ Domus                                               ││   ~60px
│  │ ┃ Sua carteira está concentrada em renda fixa.          ││
│  │ ┃ Para seu perfil, diversificar pode melhorar    ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CARTEIRA ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Accordion
│  │ 🏦  Renda Fixa                     R$ 10.000     ▾      ││   expandido
│  │     +R$ 100/mês · 100% CDI                               ││
│  ├──────────────────────────────────────────────────────────┤│
│  │  ┌────────────────────────────────────────────────────┐  ││ ← sub-item
│  │  │  CDB Banco X                R$ 6.000    +R$ 60  → │  ││   52px
│  │  │  110% CDI · Venc: mai/2028                        │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  │  ┌────────────────────────────────────────────────────┐  ││
│  │  │  Tesouro Selic 2027         R$ 4.000    +R$ 40  → │  ││
│  │  │  100% Selic · Venc: mar/2027                       │  ││
│  │  └────────────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Colapsado
│  │ 📊  FIIs                           R$ 3.000     ▸       ││
│  │     +R$ 120/mês · DY: 0,8%                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📈  Ações                          R$ 2.000     ▸       ││
│  │     +R$ 200 este mês                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 80px espaço (FAB + safe) →                               │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav 82px
│ Início   Finanças   Investir   Domus     Mais                │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
│                                                [+ Novo ativo]│ ← FAB
└──────────────────────────────────────────────────────────────┘
```

---

# 4. COMPONENTES

## 4.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início     Investimentos               [◈ Domus] [···]    │
└──────────────────────────────────────────────────────────────┘
```

| Ícone | Ação |
|:-----:|------|
| ◈ Domus | Consultora patrimonial |
| ··· | Menu: Ordenar, Filtrar por classe, Exportar |

## 4.2 Hero Card (Patrimônio)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Patrimônio investido                                    │ ← 10px tertiary
│                                                          │
│  R$ 15.000                                               │ ← 36px hero
│                                                          │
│  +R$ 420 este mês · +2,8%                                │ ← 13px positive
│  Rentabilidade 12 meses: +11,4%                          │ ← 13px secondary
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Label | "Patrimônio investido" — distingue de "Saldo disponível" (contas) |
| Valor | `financial-hero` 36px |
| Variação mensal | `state-positive` se >0 |
| Rentabilidade 12m | Opcional. Só se houver dados. |

### Cor da variação

| Variação | Cor |
|:--------:|-----|
| > 0 | `state-positive` (#22C55E) |
| = 0 | `text-secondary` |
| < 0 | `state-negative` (#EF4444) — sutil, sem alarme |

## 4.3 Alocação (Donut + Legenda)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Distribuição                                            │
│                                                          │
│  ┌──────────┐                                            │
│  │  ◉       │   ▰▰  Renda Fixa     R$ 10.000 · 67%     │
│  │ donut    │   ▰▰  FIIs            R$ 3.000  · 20%     │
│  │  80px    │   ▰▰  Ações           R$ 2.000  · 13%     │
│  └──────────┘                                            │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Tamanho do donut | 80px diâmetro · 12px espessura do anel |
| Segmentos | Máximo 5 (agrupar "Outros" se houver mais) |
| Cores | Paleta FDL: azul, verde, âmbar, violeta, cinza |
| Legenda | À direita do donut. 3 colunas: cor, nome, valor, % |
| Layout | Donut à esquerda, legenda à direita |
| Touch | Não interativo (informativo). Tap no card não faz nada. |

### Por que donut e não lista de barras?

| Abordagem | Prós | Contras | Veredito |
|-----------|------|---------|:--------:|
| **Donut** | Percepção visual instantânea. Elegante. Compacto. | Limitado a 5 segmentos. | ✅ |
| Barras horizontais | Fácil de comparar valores. | Ocupa mais espaço. Menos impacto visual. | ❌ |
| TreeMap | Mostra hierarquia. | Complexo. Poluído no mobile. | ❌ |
| Tabela | Preciso. | Planilha. | ❌ |

## 4.4 Accordion — Classe de Ativo

```
Expandido:
┌──────────────────────────────────────────────────────────┐
│ 🏦  Renda Fixa                     R$ 10.000     ▾      │ ← 56px header
│     +R$ 100/mês · 100% CDI                               │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │ ← sub-itens
│  │  CDB Banco X                R$ 6.000    +R$ 60  → │  │   52px
│  │  110% CDI · Venc: mai/2028                        │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Tesouro Selic 2027         R$ 4.000    +R$ 40  → │  │
│  │  100% Selic · Venc: mar/2027                       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Colapsado:
┌──────────────────────────────────────────────────────────┐
│ 📊  FIIs                           R$ 3.000     ▸       │ ← 56px
│     +R$ 120/mês · DY: 0,8%                              │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Header altura | 56px |
| Animação | max-height transition · 250ms ease-out |
| Ícone | ChevronDown (expandido) / ChevronRight (colapsado) |
| Sub-item altura | 52px |
| Sub-item info | Nome + ticker, valor, variação, índice/vencimento |
| Nesting máximo | 3 níveis (Classe → Ativo → Detalhe no Sheet) |
| Ordem padrão | Maior valor primeiro |

### Classes de ativo padrão

| Ícone | Classe | O que inclui |
|:-----:|--------|-------------|
| 🏦 | Renda Fixa | CDB, Tesouro, LCI, LCA, CRI, Debêntures |
| 📊 | FIIs | Fundos Imobiliários |
| 📈 | Ações | Ações BR, BDRs |
| 🌎 | Exterior | Stocks, ETFs, REITs |
| ₿ | Cripto | Bitcoin, Ethereum, stablecoins |
| 🔮 | Previdência | PGBL, VGBL |
| 📦 | Outros | Fundos multimercado, COE, private equity |

## 4.5 Bottom Sheet — Detalhe do Ativo

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│ ← Summary
│  │                                                      ││   ~80px
│  │  CDB Banco X · Renda Fixa                            ││
│  │                                                      ││
│  │  Valor atual                                         ││
│  │  R$ 6.000                    +R$ 60 (+1,0%)          ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── INFORMAÇÕES ───────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Instituição          Banco X                        ││
│  │  Indexador            110% CDI                       ││
│  │  Valor aplicado       R$ 5.500                       ││
│  │  Rentabilidade total   +R$ 500 (+9,1%)               ││
│  │  Data aplicação       10/01/2026                     ││
│  │  Vencimento           maio/2028                      ││
│  │  Liquidez             D+1                             ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── AÇÕES ─────────────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  ✏️  Editar ativo                                    ││
│  │  🗑  Excluir ativo                                   ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 4.6 Bottom Sheet — Novo Ativo

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  Novo investimento                                        │
│                                                          │
│  Nome / Ticker                                            │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Ex: CDB Banco X ou HGLG11                           ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Classe                                                   │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Renda Fixa                                    ▾     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Instituição                                              │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Banco X                                       ▾     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Valor aplicado  │  │  Valor atual     │             │
│  │  R$ 5.500        │  │  R$ 6.000        │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Salvar                                  ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

# 5. HIERARQUIA

```
1. PATRIMÔNIO INVESTIDO     ← "Quanto tenho investido?"
   Hero 36px. Sempre visível.

2. RENTABILIDADE            ← "Quanto rendeu?"
   Variação mensal + 12 meses. Abaixo do valor principal.

3. ALOCAÇÃO (donut)         ← "Onde está distribuído?"
   Percepção visual instantânea da carteira.

4. DOMUS                    ← "O que a IA observa?"
   Concentração, diversificação, vencimentos.

5. CARTEIRA (accordion)     ← "Quais ativos?"
   Expansível por classe. Detalhe sob demanda.
```

---

# 6. MICROINTERAÇÕES

| Gesto | Alvo | Ação |
|-------|------|------|
| Tap | Accordion header | Expande/colapsa classe |
| Tap | Ativo (sub-item) | Bottom Sheet de detalhe |
| Swipe left | Ativo | Revela "Excluir" |
| Tap | FAB "+" | Bottom Sheet Novo Ativo |
| Pull-to-refresh | Tela | Atualiza cotações (se disponível) |

---

# 7. ESTADOS

## 7.1 Sem investimentos (Empty)

```
┌──────────────────────────────────────────────────────────┐
│              [TrendingUp, 48px, text-tertiary]            │
│                                                          │
│         Nenhum investimento cadastrado                   │
│                                                          │
│   Registre seus investimentos para acompanhar            │
│   a evolução do seu patrimônio.                          │
│                                                          │
│     ┌──────────────────────────────────────┐             │
│     │        + Registrar investimento      │             │
│     └──────────────────────────────────────┘             │
│                                                          │
│  ◈ Domus: "Que tal começar com renda fixa?"             │
└──────────────────────────────────────────────────────────┘
```

## 7.2 Loading

Skeleton: Hero (2 linhas) + donut (círculo fantasma 80px) + 3 accordion headers.

## 7.3 Carteira em queda

Valor em `state-negative`. Sem card vermelho. Sem alarme. A Domus contextualiza: "Oscilações são normais no longo prazo."

## 7.4 Offline

Dados cacheados. Cotações podem estar desatualizadas (indicador sutil). Novo ativo desabilitado.

---

# 8. DOMUS CONSULTORA PATRIMONIAL

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃                                                        │
│ ┃ Sua carteira está 67% em renda fixa.                  │
│ ┃ Para seu perfil (34 anos), diversificar         ▸     │
└──────────────────────────────────────────────────────────┘
```

| Insight | Gatilho |
|---------|---------|
| "X% concentrado em renda fixa." | Alocação > 60% em uma classe |
| "Y% em uma única instituição." | Instituição > 50% |
| "Ativo Z vence em N dias." | Vencimento < 30 dias |
| "Carteira cresceu X% em 12 meses." | Rentabilidade positiva |
| "Você já tem reserva de emergência." | cashBalance + RF > 6 × despesas |
| "Considere diversificar." | < 3 classes de ativo |

### O que a Domus NUNCA faz

- ❌ Recomendar compra de ativo específico
- ❌ Recomendar venda de ativo específico
- ❌ Prever rentabilidade futura
- ❌ Comparar ativos ("X é melhor que Y")
- ❌ Emitir recomendação financeira regulada
- ❌ Usar linguagem de urgência ("Não perca!", "Aproveite!")

---

# 9. PERFORMANCE

| Métrica | Alvo |
|---------|:----:|
| Render | < 500ms |
| Accordion expandir | < 16ms (60fps) |
| Até 50 ativos | Scroll 60fps |
| Donut | SVG inline, sem lib externa |

---

# 10. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Accordion (56px), ativos (52px), FAB |
| Contraste AA | ✅ |
| Screen reader | ✅ "Renda Fixa, 10.000 reais, expandido. CDB Banco X, 6.000 reais." |
| Donut acessível | ✅ Legenda textual ao lado (não depende só de cor) |
| Dark + Light | ✅ |
| Uso com uma mão | ✅ |

---

# 11. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Hero: "Patrimônio investido" + valor 36px + variação + rentabilidade 12m
- [ ] Alocação: donut 80px + legenda inline (máx 5 segmentos)
- [ ] Accordion por classe: expandido mostra ativos, colapsado esconde
- [ ] Sub-itens: nome, ticker, valor, variação, info extra (índice/vencimento)
- [ ] Bottom Sheet do ativo: resumo + info + ações
- [ ] Novo ativo: nome/ticker, classe, instituição, valores
- [ ] Domus consultora: insights de concentração, vencimento, rentabilidade
- [ ] Domus NUNCA recomenda compra/venda de ativos
- [ ] Sem gráficos de trading (candles, RSI, MACD)
- [ ] Componentes reutilizados: Insight Card, Accordion, Bottom Sheet, FAB
- [ ] FDL 1.0

## Estados

- [ ] Empty: mensagem + CTA + sugestão Domus
- [ ] Loading: skeleton (Hero + donut ghost + 3 headers)
- [ ] Carteira em queda: state-negative sutil, Domus contextualiza
- [ ] Offline: dados cacheados + indicador de desatualização

## Interações

- [ ] Tap accordion → expande/colapsa
- [ ] Tap ativo → Bottom Sheet de detalhe
- [ ] Swipe left → excluir
- [ ] FAB → novo ativo
- [ ] Pull-to-refresh

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Donut com legenda textual
- [ ] Screen reader
- [ ] Dark + Light

---

# 12. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Protagonista | Patrimônio investido (Hero 36px) | Consistente com Home e Contas |
| Alocação | Donut 80px + legenda inline | Compacto. Elegante. Máx 5 segmentos. |
| Carteira | Accordion por classe | Profundidade progressiva. Não lista 20 ativos de uma vez. |
| Detalhe | Bottom Sheet (não tela dedicada) | Preserva contexto da carteira |
| Domus | Consultora (não recomenda ativos) | Compliance. Segurança regulatória. |
| Gráficos | Nenhum além do donut | Sem candles, sem RSI, sem trading. |
| Sub-item | 52px | Mais compacto que Standard (56px). Muitos ativos. |

---

*FinDomus Investimentos Mobile Homologation v1 · Fase M0.6 · PRONTO PARA HOMOLOGAÇÃO*
