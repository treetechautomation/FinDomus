# FINDOMUS MOBILE PWA — FREEDOM INDEX MODULE HOMOLOGATION v1

**Fase:** M0.7 — Homologação do Freedom Index
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado
**Home / Dashboard / Fluxo de Caixa / Contas / Planejamento / Investimentos:** v1 homologados
**Freedom Engine:** homologado (Fase 20.3)
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DO FREEDOM INDEX

O Freedom Index responde a **uma pergunta existencial**:

```text
"Quão perto estou da liberdade financeira?"
```

Não é uma nota. Não é um score. Não é um ranking. É uma **bússola** — orienta onde o usuário está, por que está ali, e qual o próximo passo para avançar.

## Posicionamento no ecossistema

| Tela | Pergunta | Tom |
|------|----------|:---:|
| Home | "Como estou?" | Clareza |
| Dashboard | "Por que estou assim?" | Compreensão |
| Fluxo de Caixa | "O que aconteceu?" | Controle |
| Contas | "Onde está meu dinheiro?" | Organização |
| Planejamento | "Para onde estou indo?" | Motivação |
| Investimentos | "Como meu patrimônio trabalha?" | Confiança |
| **Freedom Index** | **"Quão livre eu sou?"** | **Orientação** |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE O FREEDOM INDEX
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. VÊ O ÍNDICE (Hero)                                     │
│    → "67 pontos · Nível Construção · +4 pts este mês"    │
│                                                          │
│ 2. VÊ O GRÁFICO DE EVOLUÇÃO                               │
│    → Sparkline 6 meses: subindo                          │
│                                                          │
│ 3. ANALISA OS 7 PILARES (scroll)                          │
│    → "Reserva está fraca (58%). Patrimônio forte (72%)." │
│                                                          │
│ 4. VÊ AS AÇÕES PRIORITÁRIAS                               │
│    → "1. Completar reserva (+6 pts)"                     │
│    → "2. Aumentar aportes (+3 pts)"                      │
│                                                          │
│ 5. TOQUE EM UM PILAR                                      │
│    → Bottom Sheet: como é calculado, como melhorar       │
│                                                          │
│ 6. PERGUNTA À DOMUS                                       │
│    → "Por que meu índice caiu?" — explicação detalhada   │
└──────────────────────────────────────────────────────────┘
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Início    Freedom Index                  [◈ Domus] [❓]    │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Hero ~140px
│  │                                                          ││
│  │  🛡️  Freedom Index                                      ││ ← 10px tertiary
│  │                                                          ││
│  │         67                                                ││ ← 56px 800w hero
│  │                                                          ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱           ││ ← barra 6px
│  │                                                          ││
│  │  Construção                              ↑ +4 pts         ││ ← nível + delta
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Evolução ~80px
│  │  Evolução                                                ││
│  │       ▁         ▂        ▃          ▄         ▅          ││ ← sparkline
│  │      Jan       Fev      Mar        Abr       Mai    Jun  ││
│  │     48        52       55         58        63     67    ││ ← valores
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Domus ~60px
│  │ ┃ ◈ Domus                                               ││
│  │ ┃ Seu índice subiu 4 pontos. A reserva foi o      ▸    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── PILARES ───────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Pilar Card
│  │  💳  1. Quitação de Dívidas       ▰▰▰▰▰▰▰▰▰▰ 100%  ▸  ││   56px
│  │       Você está livre de dívidas. Sem pagamentos.        ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💰  2. Comprometimento de Renda  ▰▰▰▰▰▰▰▰▱▱ 62%   ▸  ││
│  │       38% da renda está comprometida.                    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│ ← pilar fraco
│  │  🛡️  3. Reserva de Emergência    ▰▰▰▰▰▰▰▰▱▱ 58%   ▸  ││   destaque
│  │       Cobre 3,8 de 6 meses. Prioridade.         ⚡     ││   âmbar
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🏛  4. Patrimônio Líquido        ▰▰▰▰▰▰▰▰▰▱ 72%   ▸  ││
│  │       R$ 2.500 de R$ 36.000 ideal.                      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📈  5. Taxa de Poupança          ▰▰▰▰▰▰▰▱▱▱ 50%   ▸  ││
│  │       Poupa 15% da renda. Meta: 30%.                    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💸  6. Renda Passiva             ▰▰▰▰▱▱▱▱▱▱ 28%   ▸  ││
│  │       Cobre 28% das despesas mensais.                    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🧩  7. Diversificação            ▰▰▰▰▰▰▱▱▱▱ 40%   ▸  ││
│  │       3 classes de ativo. Meta: 5+.                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── O QUE FAZER AGORA ─────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Ações
│  │  1. ⚡ Completar Reserva de Emergência     +6 pts   ▸   ││
│  │     Faltam R$ 5.000. Aporte sugerido: R$ 1.667/mês.     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  2. 📈 Aumentar aportes para 20%           +3 pts   ▸   ││
│  │     Hoje: 15%. Meta: 20%. Libera R$ 310/mês.            ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  3. 🧩 Adicionar nova classe de ativo      +2 pts   ▸   ││
│  │     Sua carteira tem 3 classes. Diversificar.           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── ENTENDA SEU ÍNDICE ────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ❓  Como o Freedom Index é calculado?            ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 80px espaço →                                             │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav
│ Início   Finanças   Investir   Domus     Mais                │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

---

# 4. COMPONENTES

## 4.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início    Freedom Index                  [◈ Domus] [❓]    │
└──────────────────────────────────────────────────────────────┘
```

| Ícone | Ação |
|:-----:|------|
| ◈ Domus | Mentora: explica índice, pilar, ações |
| ❓ | Bottom Sheet: "Como o Freedom Index é calculado?" |

## 4.2 Hero Card

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  🛡️  Freedom Index                                      │
│                                                          │
│         67                                                │ ← 56px 800w
│                                                          │
│  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱           │
│                                                          │
│  Construção                              ↑ +4 pts         │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Altura | ~140px |
| Label | "🛡️ Freedom Index" · 10px tertiary |
| Pontuação | **56px** · 800w · tabular-nums · text-primary. Maior que o hero padrão (36px) — é o diferencial do FinDomus. |
| Barra | 6px altura · 100% largura · cor do nível |
| Nível | 16px · 600w · `action-primary` (ou cor do nível) |
| Delta | "↑ +4 pts" ou "↓ -2 pts". 13px · state-positive/negative |
| Touch | Não interativo |

### Níveis do Freedom Index

| Pontuação | Nível | Cor | Ícone |
|:---------:|-------|:---:|:-----:|
| 95–100 | Liberdade | `state-positive` (#22C55E) | 🏡 |
| 80–94 | Crescimento | Verde-azulado | 🌲 |
| 60–79 | Construção | `action-primary` (#00B4D8) | 🌳 |
| 40–59 | Estabilidade | `state-warning` (#F59E0B) | 🪴 |
| 20–39 | Organização | Âmbar claro | 🌿 |
| 0–19 | Sobrevivência | `text-secondary` | 🌱 |

## 4.3 Evolução (Sparkline)

```
┌──────────────────────────────────────────────────────────┐
│  Evolução                                                │
│       ▁         ▂        ▃          ▄         ▅          │
│      Jan       Fev      Mar        Abr       Mai    Jun  │
│     48        52       55         58        63     67    │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | ~80px |
| Sparkline | 120px largura × 40px altura. Cor: `action-primary`. |
| Pontos | 6 meses |
| Valores | Abaixo de cada ponto (11px tertiary) |
| Touch | Não interativo |

## 4.4 Pilar Card

```
┌──────────────────────────────────────────────────────────┐
│  💳  1. Quitação de Dívidas       ▰▰▰▰▰▰▰▰▰▰ 100%  ▸  │ ← 56px
│       Você está livre de dívidas. Sem pagamentos.        │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  🛡️  3. Reserva de Emergência    ▰▰▰▰▰▰▰▰▱▱ 58%   ▸  │
│       Cobre 3,8 de 6 meses. Prioridade.         ⚡     │ ← pilar crítico
└──────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Altura | 56px (Standard) |
| Ícone | Emoji + número do pilar · 14px |
| Nome | 14px · 600w · text-primary |
| Barra | 60px largura × 6px altura · inline à direita |
| Percentual | 14px · 700w · tabular-nums |
| Linha 2 | 12px · text-secondary · Máx 1 linha |
| Indicador ⚡ | Se o pilar for a prioridade atual (menor score) |
| Touch | Card inteiro → Bottom Sheet de detalhe do pilar |
| Cor da barra | Proporcional: verde (>80), azul (60-79), âmbar (40-59), cinza (<40) |

### Ordem dos pilares

Fixada pela fórmula do Freedom Index (engine homologado). Sempre:

1. Quitação de Dívidas (25%)
2. Comprometimento de Renda (20%)
3. Reserva de Emergência (15%)
4. Patrimônio Líquido (15%)
5. Taxa de Poupança (10%)
6. Renda Passiva (10%)
7. Diversificação (5%)

## 4.5 Bottom Sheet — Detalhe do Pilar

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  🛡️  Reserva de Emergência             58%              │
│                                                          │
│  ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱                                      │
│                                                          │
│  ─── COMO É CALCULADO ──────────────────────────────────│
│                                                          │
│  Este pilar mede quantos meses de despesas essenciais    │
│  você consegue cobrir com seu dinheiro líquido.          │
│                                                          │
│  Reserva atual:      R$ 13.000                           │
│  Despesas mensais:   R$ 3.420                            │
│  Cobertura:          3,8 meses                           │
│  Meta:               6 meses (R$ 20.520)                 │
│                                                          │
│  ─── O QUE AJUDOU ──────────────────────────────────────│
│  ↑ Aporte de R$ 500 na poupança                          │
│                                                          │
│  ─── O QUE PREJUDICOU ──────────────────────────────────│
│  ↓ Saque de R$ 1.800 para revisão do carro              │
│                                                          │
│  ─── COMO MELHORAR ─────────────────────────────────────│
│  • Aporte sugerido: R$ 1.667/mês por 3 meses.            │
│  • Ou aumente para R$ 2.500 e conclua em 2 meses.        │
│                                                          │
│  ─── HISTÓRICO ─────────────────────────────────────────│
│  Jan: 42%  Fev: 45%  Mar: 48%  Abr: 52%  Mai: 55%  Jun: 58%│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  🎯  Criar meta para este pilar                      ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 4.6 Ações Prioritárias

```
┌──────────────────────────────────────────────────────────┐
│  1. ⚡ Completar Reserva de Emergência     +6 pts   ▸   │
│     Faltam R$ 5.000. Aporte sugerido: R$ 1.667/mês.     │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | 68px (com descrição) |
| Rank | Número + ícone ⚡ se ação prioritária |
| Título | 14px · 600w · text-primary |
| Impacto | "+N pts" · 13px · `action-primary` · alinhado à direita |
| Descrição | 12px · text-secondary · Máx 2 linhas |
| Touch | Card inteiro → navega para a tela relevante (Planejamento, Contas, etc.) |
| Máximo | 5 ações (geradas pelo engine de ação) |

## 4.7 Bottom Sheet — Explicabilidade

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  ❓ Como o Freedom Index é calculado?                    │
│                                                          │
│  O Freedom Index combina 7 pilares da sua vida           │
│  financeira em uma pontuação de 0 a 100.                 │
│                                                          │
│  Cada pilar tem um peso:                                  │
│                                                          │
│  Quitação de Dívidas      25%  (dívidas quitadas)       │
│  Comprometimento de Renda 20%  (renda livre)             │
│  Reserva de Emergência    15%  (meses cobertos)          │
│  Patrimônio Líquido       15%  (ativos - dívidas)        │
│  Taxa de Poupança         10%  (% da renda poupada)      │
│  Renda Passiva            10%  (% das despesas cobertas) │
│  Diversificação            5%  (classes de ativo)         │
│                                                          │
│  A pontuação é recalculada automaticamente               │
│  sempre que seus dados são atualizados.                  │
│                                                          │
│  ◈  Perguntar à Domus sobre meu índice                   │
└──────────────────────────────────────────────────────────┘
```

---

# 5. HIERARQUIA

```
1. PONTUAÇÃO (Hero 56px)    ← "Qual é meu índice?"
   O número mais importante da tela. Maior que qualquer outro hero.

2. EVOLUÇÃO (sparkline)     ← "Estou melhorando?"
   Tendência visual em 6 meses.

3. DOMUS                     ← "Por que mudou?"
   Explicação contextual da variação.

4. PILARES (7 cards)        ← "O que compõe meu índice?"
   Ordem fixa. Pilar mais fraco destacado com ⚡.

5. AÇÕES PRIORITÁRIAS       ← "O que fazer agora?"
   Rankeadas por impacto. Máx 5.

6. EXPLICABILIDADE           ← "Como funciona?"
   Link "Entenda seu índice".
```

---

# 6. MICROINTERAÇÕES

| Gesto | Alvo | Ação |
|-------|------|------|
| Tap | Pilar Card | Bottom Sheet com detalhe, cálculo, histórico |
| Tap | Ação prioritária | Navega para tela relevante (Planejamento, Contas) |
| Tap | "Entenda seu índice" | Bottom Sheet de explicabilidade |
| Tap | ◈ Domus (header) | Domus contextual sobre o índice |
| Pull-to-refresh | Tela | Recalcula índice via Kernel |

---

# 7. ESTADOS

## 7.1 Primeiro acesso (sem dados)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              [Shield, 48px, text-tertiary]                │
│                                                          │
│         Freedom Index indisponível                       │
│                                                          │
│   Cadastre seus dados financeiros para calcular           │
│   seu índice de liberdade financeira.                    │
│                                                          │
│     ┌──────────────────────────────────────┐             │
│     │        Começar — Importar extrato    │             │
│     └──────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

## 7.2 Sem histórico

Sparkline mostra apenas o ponto atual. Label: "Histórico disponível após 2 meses."

## 7.3 Loading

Skeleton: Hero (número fantasma 56px) + sparkline (linha fantasma) + 7 ghost rows de pilar.

## 7.4 Índice caindo

Delta negativo em `state-negative`. Domus explica o motivo. Tom construtivo: "Seu índice caiu 2 pontos porque sua reserva foi utilizada. Veja como recuperar."

---

# 8. DOMUS MENTORA

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃                                                        │
│ ┃ Seu índice subiu 4 pontos. A reserva cresceu           │
│ ┃ R$ 620 e isso impactou positivamente.          ▸      │
└──────────────────────────────────────────────────────────┘
```

| Pergunta do usuário | Resposta da Domus |
|---------------------|-------------------|
| "Por que meu índice caiu?" | Explica pilar por pilar o que mudou |
| "Como chegar a 80 pontos?" | Projeta ações e prazos |
| "Qual pilar devo focar?" | Identifica o de menor score |
| "Quanto tempo até a liberdade?" | Projeta com base na evolução atual |

---

# 9. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Pilares (56px), ações (68px) |
| Contraste AA | ✅ |
| Screen reader | ✅ "Freedom Index, 67 pontos, Nível Construção. Subiu 4 pontos." |
| Cores não são único indicador | ✅ Barras + percentuais + labels de nível |
| Dark + Light | ✅ |

---

# 10. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Hero: 56px (maior que qualquer outro número no app)
- [ ] Barra de progresso + nível + delta
- [ ] Sparkline 6 meses com valores
- [ ] 7 pilares em ordem fixa, cada um com barra + % + descrição
- [ ] Pilar mais fraco destacado com ⚡
- [ ] Ações prioritárias (máx 5) rankeadas por impacto (+N pts)
- [ ] Bottom Sheet do pilar: cálculo, o que ajudou, o que prejudicou, como melhorar, histórico
- [ ] Explicabilidade: linguagem simples, sem fórmulas
- [ ] Domus mentora: explica variações, sugere ações
- [ ] Nunca comparar com outras pessoas
- [ ] Componentes reutilizados: Insight Card, Progress Card, Bottom Sheet
- [ ] FDL 1.0

## Tom emocional

- [ ] Nunca usar linguagem de julgamento
- [ ] Índice caindo: explicar por que, mostrar como recuperar
- [ ] Índice subindo: reconhecimento elegante
- [ ] Sem gamificação, sem ranking, sem comparação social

## Estados

- [ ] Empty: explicação + CTA para começar
- [ ] Loading: skeleton
- [ ] Sem histórico: mensagem "disponível após 2 meses"
- [ ] Índice caindo: delta negativo + Domus construtiva

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Contraste AA
- [ ] Screen reader
- [ ] Dark + Light

---

# 11. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Tamanho do hero | **56px** (não 36px) | Diferencial do FinDomus. É O número mais importante. |
| Pilares | 7 cards de 56px em ordem fixa | Consistente com a fórmula. Ordem fixa = previsível. |
| Pilar crítico | ⚡ no pilar de menor score | Guia o olhar para a prioridade. |
| Ações | Rankeadas por impacto (+N pts) | Acionável. Mostra o benefício concreto. |
| Explicabilidade | Bottom Sheet dedicado | Transparência. Constrói confiança. |
| Comparação | Apenas consigo mesmo | Nunca comparar com outros. FDL. Behavioral finance. |
| Domus | Mentora (explica + orienta) | Consistente com o papel de cada módulo. |

---

*FinDomus Freedom Index Mobile Homologation v1 · Fase M0.7 · PRONTO PARA HOMOLOGAÇÃO*
