# FINDOMUS MOBILE PWA — PLANEJAMENTO MODULE HOMOLOGATION v1

**Fase:** M0.5 — Homologação do Planejamento
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado
**Home / Dashboard / Fluxo de Caixa / Contas:** v1 homologados
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DO PLANEJAMENTO

O Planejamento responde a **três perguntas de futuro**:

```text
"Para onde estou indo?"
"Estou no caminho certo?"
"O que fazer agora para chegar lá?"
```

Não é um orçamento. Não é uma planilha. Não é um módulo burocrático. É um **copiloto de evolução financeira** — mostra progresso, projeta conquistas e aponta o próximo passo.

## Posicionamento no ecossistema

| Tela | Pergunta | Tom emocional |
|------|----------|:------------:|
| Home | "Como estou?" | Clareza |
| Dashboard | "Por que estou assim?" | Compreensão |
| Fluxo de Caixa | "O que aconteceu?" | Controle |
| Contas | "Onde está meu dinheiro?" | Organização |
| **Planejamento** | **"Para onde estou indo?"** | **Motivação** |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE PLANEJAMENTO
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. VÊ O PROGRESSO GERAL                                   │
│    → "3 de 5 metas · 60% concluído"                       │
│    → Barra de progresso global + tempo estimado           │
│                                                          │
│ 2. VÊ A LINHA DO TEMPO                                    │
│    → "Hoje → Reserva (3 meses) → Carro (14 meses)"       │
│    → Visão cronológica das conquistas                     │
│                                                          │
│ 3. SCROLLA PELAS METAS (cards)                            │
│    → Cada meta com barra de progresso e status            │
│    → Meta principal em destaque                           │
│                                                          │
│ 4. TOQUE EM UMA META                                      │
│    → Bottom Sheet: previsão, aportes, próximas etapas     │
│    → Domus analisa: "Se aumentar R$ 120/mês..."          │
│                                                          │
│ 5. CRIA NOVA META (FAB ou botão)                          │
│    → Nome, valor, prazo, categoria                        │
│    → Domus sugere valor mensal                            │
└──────────────────────────────────────────────────────────┘
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Início      Planejamento                [◈ Domus] [···]   │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Progresso Geral
│  │                                                          ││    ~100px
│  │  🎯  Progresso geral                                     ││
│  │                                                          ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱  60%                  ││ ← barra 8px
│  │                                                          ││
│  │  3 de 5 metas concluídas · Previsão: dez/2026            ││
│  │                                                          ││
│  │  Reserva de Emergência é sua prioridade atual.           ││ ← foco contextual
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Domus Coach
│  │ ┃ ◈ Domus                                               ││    ~70px
│  │ ┃                                                        ││
│  │ ┃ Você está 2 meses adiantado na meta do carro.         ││
│  │ ┃ Se mantiver R$ 800/mês, antecipa em 4 meses.  ▸      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── LINHA DO TEMPO ────────────────────────────────────────│
│                                                              │
│  ●━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━○                   │ ← Timeline
│  Hoje            ago/2026                dez/2026              │    horizontal
│  R$ 13.000       Reserva: R$ 18.000      Carro: R$ 40.000    │    scroll
│                                                              │
│  ─── METAS ─────────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Meta Card
│  │  🛡️  Reserva de Emergência     ▰▰▰▰▰▰▰▰▱▱ 72%    ▸    ││    ~90px
│  │       Meta: R$ 18.000 · Atual: R$ 13.000                 ││
│  │       Previsão: agosto/2026 · Faltam R$ 5.000            ││
│  │       Aporte sugerido: R$ 1.667/mês                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🚗  Entrada do Carro            ▰▰▰▰▱▱▱▱ 25%    ▸    ││
│  │       Meta: R$ 40.000 · Atual: R$ 10.000                 ││
│  │       Previsão: maio/2027 · Faltam R$ 30.000             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ✈️  Viagem 2027                  ▰▰▰▰▰▱▱▱ 38%    ▸    ││
│  │       Meta: R$ 8.000 · Atual: R$ 3.000                   ││
│  │       Previsão: março/2027 · No prazo                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Meta Concluída
│  │  ✅  Quitar Cartão Nubank         ▰▰▰▰▰▰▰▰▰▰ 100%  ▸  ││ ← fundo sutil
│  │       Concluída em 12/06/2026 · R$ 4.200                 ││    verde
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ⏸  Reforma Casa (pausada)       ▰▰▰▱▱▱▱▱ 15%    ▸    ││ ← opacidade
│  └──────────────────────────────────────────────────────────┘│    reduzida
│                                                              │
│  ← 80px espaço (FAB + safe) →                               │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav 82px
│ Início   Finanças   Investir   Domus     Mais                │
│          [ATIVO]                                             │
└──────────────────────────────────────────────────────────────┘
│                                                [+ Nova meta] │ ← FAB ou botão
└──────────────────────────────────────────────────────────────┘
```

## 3.2 Medidas

```
844px total
  - 54px  status bar
  - 48px  header
  - 82px  bottom nav
  = 660px conteúdo útil

Acima da dobra:
  ✅ Progresso Geral       (~100px)
  ✅ Domus Coach           (~70px)
  ✅ Timeline              (~60px)
  ✅ 1ª Meta Card          (~90px)
  ─── dobra aproximada ───
  ⬜ Demais metas (scroll)
```

---

# 4. COMPONENTES

## 4.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início      Planejamento                [◈ Domus] [···]   │
└──────────────────────────────────────────────────────────────┘
```

| Ícone | Ação |
|:-----:|------|
| ◈ Domus | Coach financeiro contextual |
| ··· | Menu: Filtrar por status, Ordenar, Simular cenário |

## 4.2 Progresso Geral (Hero Card)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  🎯  Progresso geral                                     │
│                                                          │
│  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱  60%                  │ ← 8px bar
│                                                          │
│  3 de 5 metas concluídas · Previsão: dez/2026            │
│                                                          │
│  Reserva de Emergência é sua prioridade atual.           │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Altura | ~100px |
| Barra | 8px altura · radius 4px · cor: gradiente do nível |
| Label | 10px · tertiary uppercase |
| Métrica | 13px · secondary |
| Prioridade | "X é sua prioridade atual." — identificado pela Domus. Meta mais próxima do vencimento ou com menor progresso. |

### Cor da barra por progresso

| Progresso | Cor |
|:---------:|-----|
| ≥ 80% | `state-positive` (#22C55E) |
| 40–79% | `action-primary` (#00B4D8) |
| 20–39% | `state-warning` (#F59E0B) |
| < 20% | `text-secondary` (#8B949E) |

## 4.3 Domus Coach Card

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃                                                        │
│ ┃ Você está 2 meses adiantado na meta do carro.         │
│ ┃ Se mantiver R$ 800/mês, antecipa em 4 meses.  ▸      │
└──────────────────────────────────────────────────────────┘
```

Mesmo padrão do Insight Card. Borda azul esquerda (2px). Texto 13px.

| Insight | Gatilho |
|---------|---------|
| "Você está adiantado X meses." | Progresso > esperado para o período |
| "Se aumentar R$ X/mês, antecipa Y meses." | Simulação de aceleração |
| "Esta meta compete com [outra meta]." | 2 metas com prazos sobrepostos |
| "Priorize a reserva antes de [meta]." | Reserva < 6 meses e meta de consumo ativa |
| "Você já economizou R$ X este ano." | Soma de todos os aportes |
| "Que tal criar uma meta de [categoria]?" | Categoria sem meta ativa |

## 4.4 Timeline Horizontal

```
●━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━○
Hoje            ago/2026                dez/2026
R$ 13.000       Reserva: R$ 18.000      Carro: R$ 40.000
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | ~60px (com labels) |
| Scroll | Horizontal com snap |
| Bolas | ● (hoje, preenchida) · ○ (marco futuro, vazada) |
| Conexão | Linha de 2px, cor `action-primary` |
| Label | Mês/ano do marco + nome da meta |
| Valor | Acumulado esperado naquele ponto |
| Máximo de marcos | 5 (incluindo Hoje) |

## 4.5 Meta Card

```
┌──────────────────────────────────────────────────────────┐
│  🛡️  Reserva de Emergência     ▰▰▰▰▰▰▰▰▱▱ 72%    ▸    │ ← 90px
│       Meta: R$ 18.000 · Atual: R$ 13.000                 │
│       Previsão: agosto/2026 · Faltam R$ 5.000            │
│       Aporte sugerido: R$ 1.667/mês                      │
└──────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Superfície | `surface` |
| Altura | ~90px |
| Ícone | Emoji ou Lucide representando a categoria · 24px |
| Nome | 16px · 600w · text-primary |
| Barra | 6px altura · radius 3px · cor do status |
| Percentual | 13px · 700w · alinhado à direita |
| Linha 2 | "Meta: R$ X · Atual: R$ Y" · 12px · text-secondary |
| Linha 3 | "Previsão: mês/ano · Faltam R$ Z" · 12px · text-secondary |
| Linha 4 | "Aporte sugerido: R$ W/mês" · 12px · `action-primary` (apenas se meta ativa) |
| Touch | Card inteiro → Bottom Sheet de detalhe |
| Swipe left | Revela "Pausar" ou "Arquivar" |

### Status da meta — indicadores visuais

| Status | Cor da barra | Ícone extra | Opacidade |
|--------|:-----------:|:-----------:|:---------:|
| **Em andamento** | `action-primary` | — | 100% |
| **Adiantada** | `state-positive` | — | 100% |
| **Atrasada** | `state-warning` | ⚠️ sutil | 100% |
| **Concluída** | `state-positive` | ✅ (nome) | 100% + fundo levemente verde |
| **Pausada** | `text-tertiary` | ⏸ (nome) | 60% |
| **Arquivada** | `text-tertiary` | — | 40% |

## 4.6 Bottom Sheet — Detalhe da Meta

```
┌──────────────────────────────────────────────────────────┐
│                    [scrim escuro]                         │
├──────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│ ← Summary ~100px
│  │  🛡️  Reserva de Emergência                          ││
│  │                                                      ││
│  │  ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱  72%                           ││
│  │                                                      ││
│  │  Meta: R$ 18.000 · Atual: R$ 13.000                  ││
│  │  Previsão: agosto/2026 · Faltam R$ 5.000             ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── PREVISÃO ──────────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│ ← Simulador
│  │                                                      ││    ~120px
│  │  Se mantiver R$ 1.667/mês:                           ││
│  │    Conclusão em agosto/2026 (3 meses)                 ││
│  │                                                      ││
│  │  Se aumentar para R$ 2.500/mês:                      ││
│  │    Conclusão em junho/2026 (1 mês)   ⚡               ││
│  │                                                      ││
│  │  Se reduzir para R$ 1.000/mês:                       ││
│  │    Conclusão em novembro/2026 (5 meses)              ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─── AÇÕES ─────────────────────────────────────────────│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  ✏️  Editar meta                                     ││
│  │  ⏸  Pausar meta                                     ││
│  │  🗑  Arquivar meta                                   ││
│  │  📦  Concluir meta                                   ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ← safe area →                                            │
└──────────────────────────────────────────────────────────┘
```

## 4.7 Bottom Sheet — Nova Meta

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  Nova meta                                                │
│                                                          │
│  Nome da meta                                             │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Ex: Reserva de Emergência                           ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Categoria                                                │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Reserva de Emergência                         ▾     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Valor objetivo  │  │  Prazo           │             │ ← 2 colunas
│  │  R$ 18.000       │  │  6 meses    ▾   │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ───────────────────────────────────────                │
│  ◈ Domus sugere:                                         │
│  Aporte mensal ideal: R$ 3.000/mês                       │ ← cálculo IA
│  Mínimo para o prazo: R$ 2.500/mês                       │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Criar meta                              ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Categorias de meta

| Categoria | Ícone |
|-----------|:-----:|
| Reserva de Emergência | 🛡️ |
| Comprar Imóvel | 🏡 |
| Comprar Carro | 🚗 |
| Investimentos | 📈 |
| Aposentadoria | 🌅 |
| Viagem | ✈️ |
| Educação | 📚 |
| Liberdade Financeira | 🏆 |
| Quitar Dívida | 💳 |
| Personalizada | 🎯 |

---

# 5. HIERARQUIA

```
1. PROGRESSO GERAL          ← "Como estou indo no total?"
   Barra grande + % + prioridade. Sempre visível.

2. DOMUS COACH              ← "O que a IA recomenda?"
   Insight motivacional. 0-1.

3. LINHA DO TEMPO           ← "O que vem depois?"
   Visão cronológica. Scroll horizontal.

4. METAS ATIVAS             ← "Quais metas? Quanto falta?"
   Ordenadas: ativas primeiro → adiantadas → atrasadas → concluídas.
```

---

# 6. MICROINTERAÇÕES

| Gesto | Alvo | Ação |
|-------|------|------|
| Tap | Meta Card | Bottom Sheet de detalhe + previsão |
| Swipe left | Meta Card | Revela "Pausar" |
| Tap | Timeline (marco) | Scrolla para a meta correspondente |
| Tap | FAB "+" | Bottom Sheet Nova Meta |
| Pull-to-refresh | Tela | Atualiza progresso |

## Animações

| Evento | Animação | Duração |
|--------|----------|:-------:|
| Concluir meta | Barra preenche 100% + fade verde | 500ms (narrativa) |
| Nova meta | Fade-in + slide-up | 300ms |
| Expansão previsão | max-height | 250ms |

---

# 7. ESTADOS

## 7.1 Sem metas (Empty)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [Target, 48px, text-tertiary]                │
│                                                          │
│         Nenhuma meta definida                            │
│                                                          │
│   Crie sua primeira meta e comece a planejar             │
│   seu futuro financeiro com a Domus.                     │
│                                                          │
│     ┌──────────────────────────────────────┐             │
│     │        + Criar primeira meta         │             │
│     └──────────────────────────────────────┘             │
│                                                          │
│  ─── SUGESTÕES ─────────────────────────────────────────│
│                                                          │
│  ◈ "Que tal começar com uma Reserva de Emergência?"     │
│  ◈ "Meta sugerida: 6 meses de gastos essenciais."       │
└──────────────────────────────────────────────────────────┘
```

## 7.2 Meta concluída

Card com fundo `state-positive.soft` (verde muito sutil). Nome com ✅. Barra 100%. Movido para o final da lista (abaixo das ativas).

## 7.3 Meta atrasada

Barra em `state-warning` (âmbar). Sem alarde. Sem card vermelho. O insight da Domus sugere como recuperar.

## 7.4 Loading

Skeleton: 1 card grande (progresso geral) + 3 cards de meta (barra + linhas).

## 7.5 Offline

Dados cacheados. Nova meta desabilitada. Edição desabilitada.

---

# 8. PERFORMANCE

| Métrica | Alvo |
|---------|:----:|
| Render inicial | < 400ms |
| Cálculo de previsão | < 50ms (local, sem API) |
| Até 20 metas | Scroll 60fps sem virtualização |

---

# 9. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Cards (90px), botões, FAB |
| Contraste AA | ✅ |
| Screen reader | ✅ "Reserva de Emergência, 72 por cento concluída. Meta 18 mil reais, atual 13 mil." |
| Cores não são único indicador | ✅ Barra + percentual + label de status |
| Dark + Light | ✅ |
| Uso com uma mão | ✅ |

---

# 10. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Progresso geral: barra + percentual + prioridade + previsão
- [ ] Domus Coach: insight motivacional com borda azul
- [ ] Timeline horizontal: Hoje → marcos → meta final (scroll)
- [ ] Meta Cards: nome, barra, %, meta/atual, previsão, aporte sugerido
- [ ] Status visuais: adiantada (verde), atrasada (âmbar), concluída (verde + check), pausada (opacidade)
- [ ] Bottom Sheet da meta: previsão com 3 cenários (mantém, acelera, reduz)
- [ ] Nova meta: nome, categoria, valor, prazo. Domus sugere aporte.
- [ ] Componentes reutilizados: Insight Card, Progress Card, Bottom Sheet
- [ ] FDL 1.0: cores, tipografia, grid

## Tom emocional

- [ ] Nunca usar linguagem de culpa ou fracasso
- [ ] Meta atrasada: mostrar como recuperar, não punir
- [ ] Meta concluída: reconhecimento elegante, sem confete
- [ ] Domus sempre construtiva ("você pode", "que tal", "se mantiver")

## Estados

- [ ] Empty: sugestões da Domus + CTA
- [ ] Loading: skeleton
- [ ] Meta concluída: destaque verde sutil
- [ ] Meta atrasada: âmbar, sem alarme
- [ ] Offline: dados cacheados

## Interações

- [ ] Tap na meta → Bottom Sheet com previsão
- [ ] Swipe left → pausar
- [ ] FAB → nova meta
- [ ] Pull-to-refresh
- [ ] Timeline: tap no marco → scroll para meta

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Contraste AA
- [ ] Screen reader
- [ ] Dark + Light
- [ ] Cores não são único indicador

---

# 11. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Protagonista | Progresso geral (não uma meta específica) | Visão holística primeiro |
| Timeline | Horizontal com scroll | Compacta. Mostra jornada, não tabela. |
| Meta Cards | 90px com 4 linhas de contexto | Informação suficiente sem poluição |
| Previsão | 3 cenários (mantém, acelera, reduz) | Simples. Sem sliders complexos. |
| Domus | Coach (não analista) | Tom motivacional, não crítico |
| Nova meta | Domus sugere aporte | Reduz atrito. Usuário não precisa calcular. |
| Meta concluída | Fundo verde sutil + check | Reconhecimento elegante. Sem confete. |
| Meta atrasada | Âmbar na barra. Sem card vermelho. | FDL P5: "Problemas financeiros não gritam." |

---

*FinDomus Planejamento Mobile Homologation v1 · Fase M0.5 · PRONTO PARA HOMOLOGAÇÃO*
