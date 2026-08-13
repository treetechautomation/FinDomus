# HOME MOBILE WIREFRAME v1

**Fase:** 2 — Wireframe (pré-imagem visual)
**FDL:** 1.0 FROZEN
**Arquitetura:** `docs/home/ARCHITECTURE-v1.md` homologada

---

## 1. RESUMO EXECUTIVO

Wireframe estrutural em ASCII da Home Mobile. Valida se a arquitetura homologada funciona fisicamente em uma tela de 375px sem comprimir, poluir ou perder hierarquia.

**Viewport primária:** 375 × 812 (mais restritiva)
**Viewport de referência:** 390 × 844
**Grid:** 4 colunas, 16px margens, 12px gutter
**Densidade:** Calm (FDL)

---

## 2. MEDIDAS ESTRUTURAIS

Todas as alturas são estimativas baseadas no FDL. Valores exatos serão refinados na fase visual.

| Elemento | Altura | Base FDL |
|----------|--------|----------|
| Safe area top (status bar) | ~47px | SO |
| Context Bar | 48px | touch target mínimo + padding |
| Gap Context → Freedom | 24px | `space.6` |
| Freedom Index Card | ~120px | padding 16 + eyebow 11 + gap 8 + hero 40 + gap 8 + trend 20 + padding 16 |
| Gap Freedom → Domus | 32px | `space.8` |
| Domus Insight | ~110px | padding 16 + 2-3 linhas body + gap + CTA opcional |
| Gap Domus → Priority | 32px | `space.8` |
| Priority Action | ~130px | padding 16 + header + body + CTA button |
| Gap Priority → Módulos | 32px | `space.8` |
| "Para você" label | ~28px | caption 11px + gap 16 |
| Summary Card (cada) | ~96px | padding 16 + title 20 + gap 4 + value 24 + gap 4 + trend 18 |
| Gap entre módulos | 16px | `space.4` |
| Gap Módulos → Continuidade | 32px | `space.8` |
| Continuidade | ~90px | padding 16 + title + progress + CTA |
| Gap final → Bottom Nav | 64px | `space.16` |
| Bottom Nav placeholder | 80px | touch targets + safe area bottom |

---

## 3. WIREFRAME PRINCIPAL — HOME NORMAL (375 × 812)

Estado: PF organizado, Freedom 72, Domus ativa, Priority presente, 4 módulos, continuidade.

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │  ← Context Bar (48px)
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│                                                               │  ← space.6 (24px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │                                                         │  │
│ │  LIBERDADE FINANCEIRA                                   │  │  ← type.caption, text.secondary
│ │                                                         │  │
│ │        72                                               │  │  ← type.financial-hero, 36px, ExtraBold
│ │                                                         │  │
│ │  Nível Construção           +3 este mês                 │  │  ← type.supporting
│ │                                                         │  │
│ └─────────────────────────────────────────────────────────┘  │  ← Surface card, radius.md
│                                                               │
│                                                               │  ← space.8 (32px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │                                                         │  │
│ │  Seu custo fixo caiu 8% este mês. Isso                  │  │  ← type.body
│ │  liberou aproximadamente R$ 420 para                     │  │
│ │  suas metas.                                             │  │
│ │                                                         │  │
│ │  Entender                                                │  │  ← CTA, action.secondary
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│                                                               │  ← space.8 (32px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ⚡ PRÓXIMO PASSO                                       │  │
│ │                                                         │  │
│ │  Complete sua reserva de emergência                     │  │  ← type.heading-3
│ │  Faltam R$ 680 para 3 meses de cobertura                │  │  ← type.supporting
│ │                                                         │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │              Fazer aporte                        │    │  │  ← action.primary
│ │  └─────────────────────────────────────────────────┘    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│                                                               │  ← space.8 (32px)
│  Para você                                                   │  ← type.caption, text.tertiary
│                                                               │  ← space.3 (12px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📊  Investimentos                          →           │  │  ← Summary Card (Raised)
│ │  R$ 42.800                                               │  │  ← type.heading-2
│ │  +R$ 1.200 no mês                                        │  │  ← type.supporting, state.positive
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │  ← space.4 (16px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🎯  Planejamento                            →           │  │
│ │  3 metas ativas                                          │  │
│ │  Reserva: 68%                                            │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │  ← space.4 (16px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  💳  Contas                                  →           │  │
│ │  R$ 12.450                                               │  │
│ │  3 contas ativas                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │  ← space.4 (16px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📚  Academia                                →           │  │
│ │  Liberdade Financeira                                     │  │
│ │  Aula 4 de 8                                             │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│                                                               │  ← space.8 (32px)
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  CONTINUAR                                              │  │
│ │  Planejamento da aposentadoria                           │  │
│ │  ▰▰▰▰▰▰▱▱▱▱  62% concluído                    →         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│                                                               │  ← space.16 (64px)
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║  [ ⌂ Home ]    [ ⊕ Módulos ]   [ ◈ Domus ]   [ ⚙ Ajustes ]  ║ │  ← Bottom Nav (placeholder, 80px)
│ ╚═══════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘
```

### Above the fold (375×812, ~651px de conteúdo acima da Bottom Nav):

| Elemento | Altura acumulada | Visível? |
|----------|-----------------|----------|
| Context Bar | 48px | ✅ |
| Freedom Index | 192px (48+24+120) | ✅ |
| Domus Insight | 334px (192+32+110) | ✅ |
| Priority Action (início) | ~496px | ✅ Parcial |
| Priority Action (fim) | ~528px | ⚠️ Corte no botão se viewport = 651px |

**Acima da dobra:** Context + FI + Domus completos. Priority visível até o botão de ação. ✅ O usuário vê estado + insight + ação prioritária antes de qualquer scroll.

### Scroll total estimado:

- Conteúdo: ~1195px
- Com Bottom Nav: ~1275px
- Scroll além da primeira viewport (651px): ~624px
- **~1.9 viewports de scroll** — dentro do budget de ~2.5 viewports ✅

---

## 4. HOMES CONDICIONAIS (MESMAS POSIÇÕES)

### 4A — Home sem Domus (Domus silenciosa)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        72                                               │  │
│ │  Nível Construção           +3 este mês                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ⚡ PRÓXIMO PASSO                                       │  │  ← Priority sobe para a posição da Domus
│ │  Complete sua reserva de emergência                     │  │
│ │  Faltam R$ 680                                          │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │              Fazer aporte                        │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📊  Investimentos                          →           │  │
│ │  R$ 42.800                                               │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Comportamento:** Quando Domus está ausente, Priority sobe para o espaço da Domus. O gap FI→Priority é `space.8` (32px). A estrutura de posições é preservada — a camada Domus simplesmente colapsa com altura zero. Priority não "pula" para posição diferente; ela está na mesma posição, apenas sem Domus antes dela.

---

### 4B — Home sem Priority (tudo saudável)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        85                                               │  │
│ │  Nível Crescimento          +2 este mês                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Sua disciplina está funcionando. Este é                 │  │
│ │  seu 4º mês consecutivo de superávit.                    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │  ← Priority ausente. Módulos sobem.
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📊  Investimentos                          →           │  │
│ │  R$ 48.200                                               │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Comportamento:** Priority colapsa. Domus permanece (ou também colapsa se sem insight). Módulos sobem. A Home fica mais compacta naturalmente — sem preencher o vazio com conteúdo artificial.

---

### 4C — Home sem Domus e sem Priority (silêncio total)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        85                                               │  │
│ │  Nível Crescimento          +2 este mês                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📊  Investimentos                          →           │  │
│ │  R$ 48.200                                               │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Comportamento:** A Home mínima funcional. Ainda útil — o usuário vê seu estado (FI) e tem acesso aos módulos. ~735px de altura total. Quase inteira acima da dobra. ✅

---

### 4D — Home Endividado

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        34                                               │  │
│ │  Nível Organização          -2 este mês                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Seu cartão de crédito consome 22% da sua                │  │
│ │  renda mensal em juros. Quitar esta dívida               │  │
│ │  liberaria R$ 1.200 por ano.                             │  │
│ │  Entender                                                │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ⚠️ PRIORIDADE                                         │  │  ← state.warning (âmbar)
│ │                                                         │  │
│ │  Quitar cartão de crédito                               │  │
│ │  Economia estimada: R$ 1.200/ano                        │  │
│ │                                                         │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │              Ver passivos                        │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🛡️  Passivos                                →           │  │
│ │  R$ 8.400 restantes                                      │  │
│ │  3 dívidas ativas                                        │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  💳  Contas                                  →           │  │
│ │  R$ 1.250                                                │  │
│ │  Atenção: saldo baixo                                    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🎯  Planejamento                            →           │  │
│ │  1 meta: Quitar dívidas                                  │  │
│ │  Progresso: 42%                                          │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Validação emocional:** Freedom 34 não usa vermelho. A cor do número permanece `text.primary`. O nível "Organização" é neutro. A tendência "-2" usa `state.warning` (âmbar), não vermelho. A Priority usa warning para atenção — não para pânico. Nenhum elemento grita. ✅ (FDL P5: "Problemas financeiros não gritam")

---

## 5. WIREFRAME DE VARIANTES

### 5A — Primeiro Acesso (Empty Home)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│                                                               │
│                                                               │
│                         🌳                                    │  ← Ícone grande, text.secondary
│                                                               │
│           Sua jornada de liberdade                            │  ← type.heading-1
│           financeira começa aqui.                             │
│                                                               │
│                                                               │
│     1.  Importe seus extratos                                 │  ← type.body, text.secondary
│     2.  Cadastre suas contas                                  │
│     3.  Conheça seu Freedom Index                             │
│                                                               │
│                                                               │
│     ┌─────────────────────────────────────────────────┐       │
│     │           ▶  Começar — Importar extrato          │       │  ← action.primary
│     └─────────────────────────────────────────────────┘       │
│                                                               │
│                                                               │
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║  [ ⌂ Home ]    [ ⊕ Módulos ]   [ ◈ Domus ]   [ ⚙ Ajustes ]  ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘
```

**Sem FI (não há dados). Sem Domus (não há o que analisar). Sem módulos (não há histórico).** Um CTA primário: importar. A Home não mente — não mostra "0" como se fosse avaliação.

---

### 5B — Dados Parciais

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │                                                         │  │
│ │        —                                                │  │  ← placeholder, não "0"
│ │                                                         │  │
│ │  Adicione investimentos e metas                         │  │
│ │  para calcular seu índice completo                      │  │
│ │                                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Você já cadastrou suas contas. Para ver                 │  │
│ │  seu índice completo, adicione investimentos             │  │
│ │  e crie sua primeira meta.                               │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  💳  Contas                                  →           │  │
│ │  R$ 5.430                                                │  │
│ │  2 contas ativas                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📥  Importações                             →           │  │
│ │  12 transações                                           │  │
│ │  Última: 15 Jan                                          │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**FI não finge precisão.** Mostra que está incompleto. Domus orienta sobre o que falta. Módulos mostram o que já existe.

---

### 5C — Tudo Saudável (Home Leve)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        85                                               │  │
│ │  Nível Crescimento          +2 este mês                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Este é seu 4º mês consecutivo com                       │  │
│ │  superávit. Sua reserva já cobre 5 meses.                │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │  ← Priority ausente — nada urgente
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📊  Investimentos                          →           │  │
│ │  R$ 52.800                                               │  │
│ │  +R$ 2.100 no mês                                        │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🎯  Planejamento                            →           │  │
│ │  3 metas em dia                                          │  │
│ │  Todas acima de 70%                                      │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📚  Academia                                →           │  │
│ │  Investimentos — Aula 2 de 6                             │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Priority ausente = a Home fica menor, não vazia.** Nenhum card "Tudo bem!" artificial. A calma é o estado natural. ✅

---

### 5D — Família

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Família ▾                                   👁          ║ │  ← Context Switcher: "Família"
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        58                                               │  │  ← Consolidado familiar
│ │  Nível Estabilidade        +1 este mês                  │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  A meta "Viagem em família" está 72%                     │  │
│ │  concluída. Mantendo os aportes atuais,                  │  │
│ │  vocês chegam lá em 3 meses.                             │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ⚡ PRÓXIMO PASSO                                       │  │
│ │  Meta compartilhada: Reserva familiar                    │  │
│ │  Faltam R$ 2.400                                         │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │              Contribuir                          │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🎯  Planejamento                            →           │  │
│ │  2 metas da família                                      │  │
│ │  Viagem: 72% · Reserva: 45%                              │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Mesma estrutura, contexto claro.** Context Switcher mostra "Família". FI consolidado. Metas compartilhadas.

---

### 5E — PJ (Empresa)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Empresa A ▾                                👁          ║ │  ← Context Switcher: "Empresa A"
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  RESULTADO DO MÊS                                       │  │  ← Em PJ, pode adaptar o protagonista
│ │                                                         │  │
│ │    R$ 18.420                                            │  │
│ │                                                         │  │
│ │  Lucro líquido             +8% vs mês anterior          │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Seu lucro líquido cresceu 8%. A margem                  │  │
│ │  operacional está em 32%, acima da média                 │  │
│ │  do seu setor.                                           │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ⚠️ ATENÇÃO                                            │  │
│ │  DAS com vencimento em 5 dias                            │  │
│ │  R$ 2.340 — provisionado: R$ 2.000                       │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │              Ver obrigações                      │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🏢  Empresas                                →           │  │
│ │  DRE disponível                                          │  │
│ │  Receita: R$ 52.000                                      │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📋  Fiscal & Contábil                       →           │  │
│ │  2 obrigações este mês                                   │  │
│ │  Próximo vencimento: dia 20                              │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Nota sobre o protagonista PJ:** A arquitetura usa Freedom Index como padrão. Para PJ, o indicador principal pode ser adaptado para Resultado do Mês (lucro líquido ou DRE simplificado). Isso será decidido na fase visual. O wireframe mostra ambas as possibilidades — a estrutura da camada é a mesma, o conteúdo se adapta.

---

### 5F — Privacy Mode

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁‍🗨         ║ │  ← Ícone de privacidade ativo
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        ••                                               │  │  ← Número mascarado
│ │  Nível Construção           •• este mês                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Seu custo fixo teve redução este mês.                   │  │  ← Insight sem valores específicos
│ │  Isso pode liberar recursos para suas metas.             │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Para você                                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  📊  Investimentos                          →           │  │
│ │  R$ ••••••                                               │  │  ← Valor mascarado
│ │  +R$ •••• no mês                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  🎯  Planejamento                            →           │  │
│ │  3 metas ativas                                          │  │  ← Label preservado
│ │  Reserva: ••%                                            │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Estrutura idêntica.** Apenas valores são mascarados. Labels, títulos e contexto permanecem. A Home não quebra. ✅

---

### 5G — Offline

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                     ◉ Offline          👁   ║ │  ← Indicador offline sutil
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │        72                                               │  │
│ │  Nível Construção           +3 este mês                 │  │
│ │  atualizado em 22 Jul, 18:14                              │  │  ← Timestamp do cache
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  Você está offline. Os dados são do último               │  │  ← Explicação, não alerta
│ │  acesso. A Domus estará disponível quando                │  │
│ │  a conexão voltar.                                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Offline não é erro.** É um estado informativo. O indicador no Context Bar é sutil. Os dados em cache são exibidos com timestamp. Ações que dependem de rede (importar, sincronizar) são desabilitadas.

---

### 5H — Loading (Skeleton)

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ ▸ Pessoal ▾                                  👁          ║ │  ← Context Bar carrega imediatamente
│ ╚═══════════════════════════════════════════════════════════╝ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  LIBERDADE FINANCEIRA                                   │  │
│ │                                                         │  │
│ │       ████                                              │  │  ← Skeleton para número (36px altura)
│ │                                                         │  │
│ │  ██████████            ████████                         │  │  ← Skeletons para texto
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ◈  DOMUS                                               │  │
│ │  ████████████████████████████                            │  │  ← Skeleton 2 linhas
│ │  ████████████████████                                    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ⚡                                                      │  │
│ │  ██████████████████                                      │  │  ← Priority skeleton
│ │  ████████████████████████                                │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │              ██████████                          │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ████████                                                    │  ← Skeleton label
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │  ██████████████                              →           │  │  ← 4 skeleton cards
│ │  ████████                                                 │  │
│ │  ██████████████                                           │  │
│ └─────────────────────────────────────────────────────────┘  │
│  ...                                                         │
```

**Cada camada carrega independentemente.** O Context Bar aparece instantaneamente. As demais camadas usam skeletons que respeitam a altura real do conteúdo (evitando layout shift). Nenhum spinner central bloqueia a tela inteira.

---

## 6. COMPARAÇÃO: FORMATO DOS MÓDULOS

### Opção A — Full Width (Recomendada)

```
┌──────────────────────────────────────┐
│  📊  Investimentos          →        │
│  R$ 42.800                           │
│  +R$ 1.200 no mês                    │
└──────────────────────────────────────┘
```

**Prós:** Máximo espaço para números. Leitura vertical natural. Consistente em qualquer quantidade de módulos. Respeita Calm. Nunca parece app grid.
**Contra:** Mais scroll vertical com 5 módulos (aceitável no budget).
**375px:** 343px de largura. `R$ 9.999.999,90` cabe em 36px? → ~280px. Cabe com folga. ✅

### Opção B — 2 Colunas

```
┌─────────────────┐ ┌─────────────────┐
│ 📊 Investimentos│ │ 🎯 Planejamento │
│ R$ 42.800       │ │ 3 metas         │
└─────────────────┘ └─────────────────┘
```

**Prós:** Menos scroll. 5 módulos em ~2.5 linhas.
**Contra:** Parece app grid. Números comprimidos em ~165px. `R$ 9.999.999,90` em 165px → quebra ou reduz fonte. Viola Calm. Viola regra "não é launcher de aplicativos". ❌

### Opção C — Híbrido

Primeiro módulo full-width, demais em 2 colunas.

**Contra:** Inconsistente. O usuário precisa entender dois layouts diferentes para a mesma função. Viola P13 (consistência).

### Decisão: **Opção A — Full Width**

A Home é Calm. Módulos são portas de entrada, não atalhos compactos. O scroll adicional é mínimo (1 módulo extra = ~112px) e aceitável dentro do budget de ~2.5 viewports.

---

## 7. COMPARAÇÃO: FORMATO DO FREEDOM INDEX

### Opção A — Hero Aberto (sem card)

```
       LIBERDADE FINANCEIRA

              72

   Nível Construção    +3 este mês
```

**Prós:** Máximo respiro. O número flutua no espaço.
**Contra:** Falta definição espacial. O olhar não tem borda para ancorar. Pode parecer desconectado dos cards abaixo.

### Opção B — Surface Card (Recomendada)

```
┌──────────────────────────────────────┐
│  LIBERDADE FINANCEIRA                │
│                                      │
│         72                           │
│                                      │
│  Nível Construção    +3 este mês     │
└──────────────────────────────────────┘
```

**Prós:** O número tem um lar. A superfície cria hierarquia clara (Surface nível 1 — informativo). Separação natural dos outros elementos. Touch target bem definido.
**Contra:** O card adiciona ~32px de padding. Mínimo.

### Decisão: **Opção B — Surface Card**

O Freedom Index merece uma superfície que o contenha. Isso não conflita com Calm — o card é o que permite que o número respire sem se perder no canvas. A diferença tonal sutil (Surface vs Canvas) cria hierarquia sem peso visual.

---

## 8. VALIDAÇÃO 390 × 844

Largura útil: 390 - 16 - 16 = **358px** (+15px vs 375).

| Elemento | 375px | 390px | Diferença |
|----------|-------|-------|-----------|
| Largura de card | 343px | 358px | +15px respiro |
| Número FI 36px | ~280px | ~280px | Sem alteração |
| 2 colunas (se usado) | 165px | 173px | +8px |

**O wireframe não muda estruturalmente.** Apenas ganha respiro horizontal. Nenhum elemento é reposicionado ou redimensionado. ✅

---

## 9. VERIFICAÇÃO 430PX

Largura útil: 430 - 16 - 16 = **398px** (+55px vs 375).

Mesmo com largura extra, a Home NÃO adiciona mais cards ou colunas. **Mais largura = mais respiro, não mais conteúdo.** ✅

---

## 10. TOUCH TARGETS

| Elemento | Largura | Altura | ≥44×44? |
|----------|---------|--------|---------|
| Context Switcher | ~120px (texto) | 48px (bar) | ✅ (48px altura) |
| Privacy Toggle | ~44px | 48px (bar) | ✅ |
| Freedom Index Card | 343px (full card) | ~120px | ✅ (card inteiro é tocável) |
| Domus CTA "Entender" | ~80px | ~44px | ✅ |
| Priority Button | 343px (full width) | ~48px | ✅ |
| Summary Card | 343px (full card) | ~96px | ✅ (card inteiro é tocável) |
| Continuidade | 343px | ~90px | ✅ |

Todos os touch targets críticos excedem 44×44px. ✅

---

## 11. TEXT OVERFLOW — TESTE

| Texto | Largura máx (343px) | Caberia? |
|-------|---------------------|----------|
| "Planejamento" | ~90px em 16px | ✅ |
| "Investimentos" | ~110px em 16px | ✅ |
| "Fiscal & Contábil" | ~115px em 16px | ✅ |
| "Manutenção de Patrimônio" | ~210px em 16px | ✅ |
| `R$ 9.999.999,90` (FI, 36px) | ~280px | ✅ |
| `R$ 999.999,90` (Summary, 20px) | ~160px | ✅ |
| `R$ 9.999.999,90` (Summary, 20px) | ~190px | ✅ |

Nenhum overflow com os tamanhos de fonte definidos. ✅

---

## 12. ABOVE THE FOLD — ANÁLISE FINAL

**375 × 812, ~651px de conteúdo acima da Bottom Nav:**

| Estado da Home | Acima da dobra |
|---------------|----------------|
| Normal (FI + Domus + Priority) | FI + Domus + Priority (botão visível) ✅ |
| Sem Domus | FI + Priority completa ✅ |
| Sem Priority | FI + Domus + início dos módulos ✅ |
| Tudo saudável | FI + Domus + 1-2 módulos ✅ |
| Primeiro acesso | Conteúdo inteiro (centralizado) ✅ |
| Privacy | Idêntico ao Normal ✅ |

**O usuário SEMPRE vê seu estado financeiro e a ação/orientação principal antes de qualquer scroll.** ✅

---

## 13. COMPLEXITY BUDGET — VALIDAÇÃO

| Recurso | Máximo FDL/Arquitetura | Wireframe | OK? |
|---------|------------------------|-----------|-----|
| Blocos principais | 6 | 6 (Context, FI, Domus, Priority, Módulos, Continuidade) | ✅ |
| Número financial-hero | 1 | 1 (FI: 72) | ✅ |
| CTAs primárias | 1 | 1 (Priority button) | ✅ |
| CTAs totais | ~6 | ~6 (Priority + Domus + 4 módulos + Continuidade) | ✅ |
| Summary Cards | 5 | 3-5 | ✅ |
| Cores com significado | ≤3 | Verde (trend) + Âmbar (priority se endividado) + Azul (FI, CTAs) | ✅ |
| Gráficos | 0 | 0 | ✅ |
| Tabelas | 0 | 0 | ✅ |
| Scroll | ~2.5 viewports | ~1.9 (normal), ~1.0 (mínima) | ✅ |

---

## 14. HOME WIREFRAME CONTRACT v1

### Estrutura fixa

```
1. Context Bar          — 48px, sempre visível, fundo Canvas (nível 0)
2. Freedom Index        — ~120px, Surface card, sempre visível
3. Domus               — ~110px, Surface card, 0-1 (colapsa se ausente)
4. Priority Action     — ~130px, Raised card, 0-1 (colapsa se ausente)
5. Módulos Relevantes  — 3-5 Summary Cards (Raised), 96px cada
6. Continuidade        — ~90px, Raised card, 0-1 (colapsa se ausente)

Gap Context→FI:        space.6 (24px)
Gap FI→Domus:          space.8 (32px)
Gap Domus→Priority:    space.8 (32px)
Gap Priority→Módulos:  space.8 (32px)
Label "Para você":     type.caption (11px), text.tertiary
Gap label→módulos:     space.3 (12px)
Gap entre módulos:     space.4 (16px)
Gap Módulos→Cont.:     space.8 (32px)
Gap final→Bottom Nav:  space.16 (64px)
Bottom Nav:            80px (placeholder)
```

### Formato dos elementos

- **Freedom Index:** Surface card (nível 1). Padding 16px. Eyebrow + financial-hero (36px) + nível + tendência.
- **Domus:** Surface card. Delimitador visual sutil (ícone ◈ ou tratamento próprio). 2-3 linhas body + CTA opcional.
- **Priority:** Raised card (nível 2). Borda sutil presente. Header + descrição + 1 CTA button.
- **Módulos:** Summary Cards (Raised). Full-width (343px). Ícone + nome + 1 valor + 1 contexto. Card inteiro tocável.
- **Continuidade:** Card compacto. Título + indicador de progresso + CTA.

### Comportamento condicional

- Domus ausente → colapsa (0px). Priority sobe (gap FI→Priority = space.8).
- Priority ausente → colapsa (0px). Módulos sobem (gap Domus→Módulos = space.8).
- Ambos ausentes → Módulos sobem (gap FI→Módulos = space.8).
- Continuidade ausente → Home termina nos módulos (gap final→Bottom Nav = space.16).
- Privacy ativo → valores mascarados com `•••`. Estrutura idêntica.
- Offline → indicador sutil no Context Bar. Dados em cache com timestamp.
- Loading → skeletons por camada. Context Bar carrega imediatamente.

---

## 15. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|---------------|
| — | Nenhum achado bloqueador | — |

**WF-P0: 0 · WF-P1: 0**

---

## 16. ARQUITETURA — VALIDAÇÃO

O wireframe não revelou conflitos com a arquitetura homologada. Nenhuma Architecture Change Request necessária.

- A ordem das 6 camadas é viável em 375px ✅
- O above the fold entrega estado + insight + ação ✅
- O colapso condicional funciona sem quebrar a estrutura ✅
- O módulo full-width é a melhor escolha para Calm ✅
- O Freedom Index em Surface card cria hierarquia sem peso ✅
- Os touch targets são adequados ✅
- O budget de complexidade é respeitado ✅

---

## 17. RECOMENDAÇÃO FINAL

O wireframe valida que a arquitetura funciona em uma tela real de 375px sem comprimir, poluir ou perder hierarquia. Nenhum ajuste de arquitetura é necessário.

**A Home Mobile está pronta para avançar para a fase de imagem visual.**

---

*Home Mobile Wireframe v1 · Fase 2 concluída · Aguardando homologação para imagem visual*
