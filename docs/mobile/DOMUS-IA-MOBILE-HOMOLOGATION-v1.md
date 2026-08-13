# FINDOMUS MOBILE PWA — DOMUS IA MODULE HOMOLOGATION v1

**Fase:** M0.8 — Homologação da Domus IA
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado
**Home / Dashboard / Fluxo / Contas / Planejamento / Investimentos / Freedom Index:** v1 homologados
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DA DOMUS

A Domus responde a **uma pergunta essencial**:

```text
"O que eu devo fazer agora?"
```

Não é um chatbot. Não é uma tela de perguntas. É o **copiloto financeiro permanente** do usuário — presente em todo o app via FAB, capaz de entender contexto, explicar indicadores, recomendar ações e conectar todos os módulos.

## Posicionamento no ecossistema

| Tela | Pergunta | Tom |
|------|----------|:---:|
| Home | "Como estou?" | Clareza |
| Dashboard | "Por que estou assim?" | Compreensão |
| Fluxo de Caixa | "O que aconteceu?" | Controle |
| Contas | "Onde está meu dinheiro?" | Organização |
| Planejamento | "Para onde estou indo?" | Motivação |
| Investimentos | "Como meu patrimônio trabalha?" | Confiança |
| Freedom Index | "Quão livre eu sou?" | Orientação |
| **Domus** | **"O que devo fazer?"** | **Decisão** |

## Os 5 papéis da Domus

| Papel | Onde atua | Exemplo |
|-------|-----------|---------|
| **Coach** | Planejamento | "Se aumentar R$ 120/mês, antecipa em 4 meses." |
| **Analista** | Dashboard | "Alimentação caiu 23%. Transporte subiu 15%." |
| **Consultora** | Investimentos | "67% em renda fixa. Para seu perfil, diversificar." |
| **Mentora** | Freedom Index | "Seu índice caiu porque a reserva foi utilizada." |
| **Assistente** | Fluxo de Caixa | "Essa despesa parece recorrente. Quer categorizar?" |

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ACESSA A DOMUS
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ CAMINHO A: FAB (de qualquer tela)                         │
│    → Bottom Sheet com chat. Contexto da tela atual.       │
│    → Sugestões contextuais.                               │
│                                                          │
│ CAMINHO B: Bottom Nav → Domus (tela dedicada)             │
│    → Tela cheia. Conversa mais longa. Histórico.         │
│                                                          │
│ CAMINHO C: Card Insight (Home, Dashboard, etc.)           │
│    → "Entender" → abre Domus com o insight expandido     │
└──────────────────────────────────────────────────────────┘
```

---

# 3. ARQUITETURA DE ACESSO

## 3.1 FAB (acesso rápido — qualquer tela)

```
┌──────────────────────────────────────────────────────────┐
│  [qualquer tela do app]                                  │
│                                                          │
│                                                          │
│                                                          │
│                                                       ◈  │ ← FAB 56px
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Bottom Nav                                               │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Visibilidade | Todas as telas (exceto durante teclado aberto) |
| Posição | Fixa: bottom 100px, right 16px |
| Tamanho | 56px circular |
| Cor | `action-primary` (#00B4D8) |
| Ícone | BrainCircuit (24px, branco) |
| Comportamento | Abre Bottom Sheet (70% viewport) |
| Contexto | Herda o contexto da tela atual + entidade ativa |
| Scroll | Esconde ao descer, mostra ao subir |

## 3.2 Tela dedicada (Bottom Nav slot 4)

Acesso via Bottom Nav para conversas mais longas, histórico e simulações complexas.

## 3.3 Cards Insight (acesso contextual)

Presentes na Home, Dashboard, Contas e outros módulos. O CTA "Entender" ou "▸" abre a Domus com o insight expandido e contexto preservado.

---

# 4. WIREFRAME — TELA DEDICADA

## 4.1 Viewport: 390 × 844px · Estado: Com conversa

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│  Domus · Pessoal                          [🕐] [👤] [···]   │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Boas-vindas
│  │ ◈  Domus                                     agora       ││
│  │                                                          ││
│  │  Bom dia, Anderson.                                      ││
│  │                                                          ││
│  │  Seu Freedom Index está em 67 pontos.                    ││
│  │  A reserva de emergência é sua principal                 ││
│  │  oportunidade de melhoria agora.                         ││
│  │                                                          ││
│  │  ┌──────────────────────────────────────────────────────┐││ ← Sugestões
│  │  │ Por que meu índice caiu?                             │││
│  │  │ Como melhorar minha reserva?                         │││
│  │  │ Quanto posso investir por mês?                       │││
│  │  └──────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────┐                    │ ← Usuário
│  │ Como melhorar minha reserva?        │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resposta
│  │ ◈  Domus                                     agora       ││
│  │                                                          ││
│  │ Sua reserva atual cobre 3,8 meses.                       ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││ ← Card FI
│  │ │ 🛡️  Reserva de Emergência    ▰▰▰▰▰▰▰▰▱▱ 58%        │ ││
│  │ │ Cobre 3,8 de 6 meses                                 │ ││
│  │ │ Meta: R$ 18.000 · Atual: R$ 13.000                   │ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  │ Para atingir 6 meses em 3 meses, você precisaria         ││
│  │ aportar R$ 1.667 por mês.                                ││
│  │                                                          ││
│  │ Com seu ritmo atual de R$ 620/mês, levaria 8 meses.     ││
│  │                                                          ││
│  │ ┌──────────────────────────────────────────────────────┐ ││ ← Ação
│  │ │  🎯  Criar meta de reserva                           │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Input
│  │ ⌨️  Pergunte sobre suas finanças...                  ◈  ││   44px
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← safe area →                                               │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav
│ Início   Finanças   Investir   Domus     Mais                │
│                              [ATIVO]                         │
└──────────────────────────────────────────────────────────────┘
```

## 4.2 Bottom Sheet (via FAB)

Mesmo conteúdo da tela dedicada, mas em altura de 70% da viewport com handle de arrasto. O input fica fixo acima do teclado. Ideal para conversas rápidas.

---

# 5. COMPONENTES DA CONVERSA

## 5.1 Mensagem da Domus (Resposta)

```
┌──────────────────────────────────────────────────────────┐
│ ◈  Domus                                     agora       │
│                                                          │
│  Texto principal (15px, 400w, text-primary).             │
│  Máximo 4 linhas antes de quebrar com card ou ação.      │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│ ← Card contextual
│  │  [card reutilizado de outro módulo]                  ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│ ← Ação
│  │  🎯  Ação recomendada                                ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Estrutura da resposta (3 níveis progressivos)

```
Nível 1 — Resumo (obrigatório)
    "Sua reserva cobre 3,8 meses."

Nível 2 — Evidência (quando relevante)
    Card do Freedom Index, Planejamento ou Dashboard.

Nível 3 — Ação (quando houver)
    Botão: "Criar meta", "Ver planejamento", "Abrir contas".
```

## 5.2 Mensagem do Usuário

```
┌─────────────────────────────────────┐
│ Como melhorar minha reserva?        │
└─────────────────────────────────────┘
```

Alinhada à direita. Fundo `surface.raised`. 15px, 400w. Radius 16px. Padding 12px.

## 5.3 Sugestões (Chips)

```
┌───────────────────────────────────────┐
│ Por que meu índice caiu?              │
│ Como melhorar minha reserva?          │
│ Quanto posso investir por mês?        │
└───────────────────────────────────────┘
```

### Sugestões por contexto

| Contexto | Sugestões |
|----------|-----------|
| **Home** | "Como foi meu mês?", "Quanto posso gastar?", "Meu saldo está ok?" |
| **Dashboard** | "Por que gastei mais?", "Qual categoria subiu?", "Comparar com mês passado" |
| **Fluxo de Caixa** | "Registrar despesa recorrente", "Categorizar transações", "Essa despesa é fixa?" |
| **Contas** | "Distribuir melhor o saldo", "Qual banco concentra mais?", "Ocultar conta?" |
| **Planejamento** | "Acelerar meta", "Criar nova meta", "Simular cenário" |
| **Investimentos** | "Diversificar carteira", "Rentabilidade 12 meses", "Alocação ideal?" |
| **Freedom Index** | "Melhorar pilar X", "Como chegar a 80 pts?", "O que reduz meu índice?" |

## 5.4 Cards Contextuais (reuso)

A Domus reutiliza cards existentes de outros módulos:

| Card | Origem | Quando usar |
|------|--------|-------------|
| **Freedom Index Card** | Módulo FI | Perguntas sobre o índice |
| **Progress Card** (meta) | Planejamento | Metas, projeções |
| **Summary Card** (contas) | Contas | Saldo, distribuição |
| **Hero Card** (patrimônio) | Investimentos | Carteira, rentabilidade |
| **Insight Card** | Home | Observações, alertas |
| **Action Card** | — | Recomendações com CTA |

## 5.5 Ações

A Domus pode oferecer ações navegáveis:

```
┌──────────────────────────────────────────────────────┐
│  🎯  Criar meta de reserva                           │ ← Navega para Planejamento
│  📊  Ver relatório completo                          │ ← Navega para Dashboard
│  💳  Abrir conta Itaú PF                             │ ← Navega para Contas Detail
└──────────────────────────────────────────────────────┘
```

Cada ação é um botão de 44px, full-width, outline. Ícone à esquerda, label no centro.

---

# 6. ESTADOS

## 6.1 Primeiro acesso (sem dados)

```
┌──────────────────────────────────────────────────────────┐
│ ◈  Domus                                                 │
│                                                          │
│  Ainda não conheço sua vida financeira.                  │
│  Assim que você adicionar seus dados,                    │
│  posso analisar, simular e orientar.                     │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  📥  Começar — Importar extrato                      ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Enquanto isso, posso responder:                         │
│  ┌──────────────────────────────────────────────────────┐│
│  │ O que é o Freedom Index?                             ││
│  │ Como o FinDomus funciona?                            ││
│  │ Por onde começar?                                    ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 6.2 Loading / Pensando

```
┌──────────────────────────────────────────────────────────┐
│ ◈  Domus                                                 │
│                                                          │
│  Analisando seus dados...                                │
│  ∙ ∙ ∙                                                   │
└──────────────────────────────────────────────────────────┘
```

Três estágios de loading:

| Duração | Texto |
|:-------:|-------|
| < 1s | (invisível — resposta aparece instantaneamente) |
| 1–3s | "Analisando..." |
| 3–8s | "Analisando seu fluxo financeiro..." + ∙ ∙ ∙ |
| > 8s | "Isso está demorando mais que o esperado..." + opção Cancelar |

**NUNCA usar:** "Cérebro financeiro pensando...", "Consultando IA...", robô animado, spinner gigante, emojis.

## 6.3 Erro

```
┌──────────────────────────────────────────────────────────┐
│ ◈  Domus                                                 │
│                                                          │
│  Não foi possível processar sua pergunta                 │
│  neste momento.                                          │
│                                                          │
│  Isso pode ser uma instabilidade temporária.             │
│  Suas informações não foram afetadas.                    │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Tentar novamente                                    ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 6.4 Offline

```
┌──────────────────────────────────────────────────────────┐
│                      ◈                                    │ ← ícone opaco
│                                                          │
│  A Domus precisa de conexão para analisar                │
│  dados e responder perguntas.                            │
│                                                          │
│  Você ainda pode:                                        │
│  • Navegar pelos módulos                                 │
│  • Ver sua Home com o último índice                      │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Ir para o Início                                    ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 6.5 Fora do escopo

```
┌──────────────────────────────────────────────────────────┐
│ ◈  Domus                                                 │
│                                                          │
│  Meu foco é sua vida financeira.                         │
│                                                          │
│  Posso ajudar com:                                       │
│  • Análise de gastos e receitas                          │
│  • Planejamento financeiro                               │
│  • Simulações e projeções                                │
│  • Entender seu Freedom Index                            │
└──────────────────────────────────────────────────────────┘
```

---

# 7. HISTÓRICO

```
┌──────────────────────────────────────────────────────────┐
│           ━━━━━━━━━━                                     │
│                                                          │
│  Histórico · Pessoal                                     │
│                                                          │
│  Hoje                                                     │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Como melhorar minha reserva?                         ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Ontem                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Por que gastei mais este mês?                        ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  3 dias atrás                                             │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Simular compra do carro                              ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Nova análise                                        ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

Acessível via ícone 🕐 no header. Bottom Sheet. Até 10 conversas recentes. Separadas por contexto (PF/PJ).

---

# 8. SIMULAÇÕES

## 8.1 Exemplo: "E se eu guardar R$ 1.000 por mês?"

```
┌──────────────────────────────────────────────────────────┐
│ ◈  Domus                                                 │
│                                                          │
│  Investindo R$ 1.000 por mês, em 10 anos você            │
│  acumularia cerca de R$ 187.420.                         │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ SIMULAÇÃO                                            ││
│  │                                                      ││
│  │ Aporte mensal            R$ 1.000                    ││
│  │ Horizonte                10 anos                      ││
│  │ Resultado estimado       R$ 187.420                  ││
│  │                                                      ││
│  │ Impacto no Freedom Index                              ││
│  │ 67  →  74               +7 pontos                    ││
│  │                                                      ││
│  │ Tempo até liberdade                                   ││
│  │ 14 anos  →  11 anos     -3 anos                     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Esta é uma projeção baseada em rentabilidade            │
│  média de mercado. Ela não garante resultado futuro.     │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  🎯  Criar meta de investimento                      ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

# 9. DOMUS PROATIVA

A Domus pode iniciar conversas quando relevante:

| Gatilho | Mensagem |
|---------|----------|
| Reserva < 4 meses | "Sua reserva caiu. Quer ver como recuperar?" |
| Cartão próximo do vencimento | "Seu cartão Nubank vence em 3 dias." |
| Recorde de patrimônio | "Seu patrimônio bateu R$ 50.000 pela primeira vez." |
| Meta concluída | "Parabéns! Sua reserva de emergência foi concluída." |
| 3 meses sem investir | "Faz 3 meses que você não faz um aporte." |

### Regras de proatividade

- Máximo 1 notificação proativa por dia.
- Silenciosa entre 22h e 8h.
- Sempre com ação concreta (nunca "parabéns" vazio).
- Usuário pode desabilitar em Preferências.

---

# 10. MEMÓRIA E CONTEXTO

```
┌──────────────────────────────────────────────────────────┐
│ A Domus mantém contexto durante a sessão:                 │
│                                                          │
│ Usuário: "Como está minha reserva?"                       │
│ Domus:   [mostra card da reserva com 58%]                │
│                                                          │
│ Usuário: "E como posso melhorar?"                         │
│ Domus:   [entende que é sobre a reserva]                 │
│          "Aportando R$ 1.667/mês..."                     │
│                                                          │
│ Usuário: "E se eu aumentar para R$ 2.500?"                │
│ Domus:   [mantém contexto da reserva]                    │
│          [mostra simulação atualizada]                   │
└──────────────────────────────────────────────────────────┘
```

Indicador sutil de contexto ativo: "Domus · Falando sobre: Reserva de Emergência" (10px, tertiary, abaixo do header).

---

# 11. MICROINTERAÇÕES

| Evento | Comportamento |
|--------|--------------|
| Abrir FAB | Sheet com spring do bottom, 300ms. Scroll do chat preservado. |
| Enviar pergunta | Bolha do usuário aparece instantaneamente. Input desabilitado durante loading. |
| Resposta chega | Fade-in da bolha da Domus. Scroll automático para o final. |
| Chip de sugestão | Preenche o input (não envia automaticamente). |
| Ação (CTA) | Navega para o módulo. Sheet fecha se via FAB. |

---

# 12. VOZ (Futuro)

Preparar arquitetura para:

- Toast com ícone de microfone (ao lado do input).
- Transcrição em tempo real.
- Resposta em voz (TTS) opcional.
- Push-to-talk em vez de always-listening.

**Marcação:** `⚠️ FUTURO — não implementar agora.`

---

# 13. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Chips (44px), input (44px), ações (44px) |
| Screen reader | ✅ Cada mensagem com role="article". Leitura sequencial. |
| Contraste AA | ✅ |
| Dark + Light | ✅ |
| Teclado | ✅ Bottom Nav reduz para modo compacto (54px) |
| Uso com uma mão | ✅ Input na metade inferior. FAB acessível. |

---

# 14. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] FAB persistente em todas as telas (56px, azul)
- [ ] Tela dedicada acessível via Bottom Nav (slot 4)
- [ ] Bottom Sheet via FAB (70% viewport)
- [ ] Boas-vindas dinâmicas baseadas no Freedom Index
- [ ] Sugestões contextuais (chips) variam por módulo
- [ ] Respostas em 3 níveis: resumo → evidência → ação
- [ ] Cards reutilizados de outros módulos
- [ ] Ações navegáveis (CTA)
- [ ] Simulações com impacto no Freedom Index
- [ ] Loading: "Analisando..." (nunca robô ou spinner)
- [ ] Histórico acessível via ícone 🕐
- [ ] Domus proativa: máx 1/dia, com ação concreta
- [ ] Contexto visível: "Falando sobre: X"
- [ ] Nunca recomendar ativos específicos
- [ ] Nunca usar emojis na resposta
- [ ] Nunca expor provedor de IA (Gemini, GPT)
- [ ] Componentes reutilizados de todos os módulos
- [ ] FDL 1.0

## Estados

- [ ] Primeiro acesso: orientação + CTA importar
- [ ] Loading: estágios por duração
- [ ] Erro: mensagem + tentar novamente
- [ ] Offline: mensagem + CTA Início
- [ ] Fora do escopo: redirecionamento educado
- [ ] Dados insuficientes: explicação + sugestão

## Tom

- [ ] Nunca julga ou culpa
- [ ] Nunca usa linguagem de alarme
- [ ] Sempre orienta com ação concreta
- [ ] Linguagem natural (pt-BR)
- [ ] Sem "cérebro", "neurônio", "pensando..."
- [ ] Sem avatar humanoide

## Acessibilidade

- [ ] Screen reader compatível
- [ ] Teclado: Bottom Nav modo compacto
- [ ] Dark + Light

---

# 15. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Acesso primário | **FAB persistente** (não apenas tela dedicada) | IA sempre a 1 toque. Diferencial competitivo. |
| Acesso secundário | Bottom Nav slot 4 (tela dedicada) | Conversas longas, histórico, simulações. |
| Formato | **Bottom Sheet via FAB**, tela cheia via Nav | Sheet = rápido (consulta). Tela = profundo (análise). |
| Respostas | 3 níveis: resumo → evidência → ação | Clareza progressiva. Nunca parede de texto. |
| Cards | **Reuso** dos cards existentes | Consistência visual. Não reinventar componentes. |
| Sugestões | Chips contextuais (variam por módulo) | Relevantes. Não genéricas. |
| Loading | Texto progressivo (não spinner) | Transmite progresso. Menos ansiedade. |
| Proatividade | Máx 1/dia, com ação concreta | Útil sem ser invasiva. |
| Voz | Arquitetura futura (push-to-talk) | Preparar sem implementar. |
| Domus no Freedom Index | Mentora (explica + orienta) | Cada módulo tem um tom de Domus. |

---

*FinDomus Domus IA Mobile Homologation v1 · Fase M0.8 · PRONTO PARA HOMOLOGAÇÃO*
