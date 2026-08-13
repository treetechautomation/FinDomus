# FINDOMUS DOMUS MOBILE WIREFRAME v1

**Fase:** 7 — Wireframe da Domus Mobile
**FDL:** 1.0 FROZEN
**Domus Architecture:** v1 homologada (`docs/domus/DOMUS-MOBILE-ARCHITECTURE-v1.md`)
**Navigation Wireframe:** v1 homologado
**Home:** Homologada
**Viewport de referência:** 390 × 844px

---

## 1. RESUMO EXECUTIVO

Este wireframe prova que a Domus Mobile funciona como produto de inteligência financeira — não como chatbot. A arquitetura homologada (estado inicial com insight + 3 sugestões + input, conversa híbrida com texto + cards, 5 papéis de atuação) é fisicamente viável em todos os viewports alvo.

A taxonomia de cards foi consolidada de 8 para **6 tipos** — removendo redundâncias entre Insight/Metric e Action/Module. O keyboard test confirmou que o modo compacto (54px, apenas ícones) é o melhor compromisso entre espaço útil e navegação — sem divergir do Navigation Wireframe.

A Domus responde em 3 níveis de profundidade progressiva: Resposta Principal → Evidência/Dados → Ação. Nunca gera parede de texto. Nunca usa emojis. Nunca expõe o provedor de IA.

---

## 2. MEDIDAS (FDL Tokens)

| Elemento | Medida | Token FDL |
|----------|:------:|-----------|
| Header Domus | 48px | Igual Context Bar |
| Indicador de contexto | 10px caption | `type.caption` |
| Insight Card (estado inicial) | Variável (~80-100px) | `space.4` padding |
| Chip de sugestão | 32px altura | `space.8` (8px padding v) |
| Gap entre sugestões | 8px | `space.2` |
| Input | 44px | Touch target |
| Gap input → Bottom Nav | 12px | `space.3` |
| Mensagem do usuário (bubble) | padding 12px | `space.3` |
| Texto da Domus | 15px, line-height 1.5 | `type.body` |
| Card | `space.4` padding | Padrão |
| Gap entre cards na resposta | 12px | `space.3` |
| Bottom Nav (normal) | 82px | Navigation Wireframe |
| Bottom Nav (teclado) | 54px | Navigation Wireframe |
| Área útil (390×844, sem teclado) | 708px | 844 − 54 − 82 |
| Área útil (390×844, com teclado) | ~408px | 844 − 54 − 82 − 300 (teclado) |

---

## 3. HEADER DA DOMUS

**Decisão: Header de 2 linhas — "Domus" + contexto financeiro.**

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│ ← 48px total
│  Pessoal                                                      │ ← 10px, text-tertiary
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Título | "Domus", 16px, 600 weight, `text-primary` |
| Contexto | "Pessoal", "Família", "Empresa A", etc. 10px, 500 weight, `text-tertiary` |
| Avatar | À direita, 32px. Toque abre Context Switcher Sheet (já homologado) |
| Módulo de origem | Se aplicável (ex: veio de Investimentos), aparece como tag abaixo do contexto: `[Investimentos]` — 10px, `action-primary-soft` background |

**Por que 2 linhas e não linha única ou chip:**
- Linha única "Domus · Pessoal" — polui o título, mistura hierarquia
- Chip lateral "[Pessoal]" — ocupa espaço horizontal desnecessário
- 2 linhas: hierarquia clara. Título Domus é o foco. Contexto é informação secundária.

---

## 4. ESTADO INICIAL — COM INSIGHT (DOMUS-WF-01)

```
390 × 844px · Contexto: Pessoal

┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR (54px)                        │
├──────────────────────────────────────────────────────────────┤
│  Domus                                        [ 👤 avatar   ]│ ← Header (48px)
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight Card
│  │ ◈  Domus                                      agora      ││ ← 80-100px
│  │                                                          ││
│  │  Sua despesa com alimentação caiu 23%                    ││
│  │  este mês. Você economizou cerca de                       ││
│  │  R$ 320 em supermercado e delivery.                      ││
│  │                                                          ││
│  │  [Entender melhor]                                       ││ ← CTA text, azul
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Seção de sugestões
│  │ Você também pode perguntar:                              ││ ← label 10px, tertiary
│  │                                                          ││
│  │ ┌─────────────────────────┐ ┌──────────────────────────┐ ││ ← Chips (32px)
│  │ │ Como foi meu mês?       │ │ Onde estou gastando mais?│ ││
│  │ └─────────────────────────┘ └──────────────────────────┘ ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ Como melhorar meu índice?                             │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│                                                              │ ← espaço flexível
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│ ← Input (44px)
│  │ ⌨️  Pergunte sobre suas finanças...                     ││ ← placeholder
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⌂         ⊞⊞         ◈         ◉                            │ ← Bottom Nav (82px)
│ Início   Módulos    Domus    Perfil                          │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
```

### Formato das sugestões — DECISÃO: Chips (Versão A)

| Formato | Avaliação |
|---------|-----------|
| **A — Chips horizontais** | ✅ Compacto, escaneável, sem confundir com conversa. Recomendado. |
| B — Lista de perguntas | Parece conversa iniciada. Confunde. |
| C — Cards pequenos | Ocupa muito espaço. Concorre com Insight Card. |
| D — Híbrido | Inconsistente. |

**Chips:** 32px altura, `space.2` padding horizontal, `radius.sm` (8px), fundo `surface.raised`, texto 13px `text-secondary`. Ao toque: preenche o input com a pergunta (não envia automaticamente).

### Input — DECISÃO

| Elemento | Especificação |
|----------|--------------|
| Placeholder | "Pergunte sobre suas finanças..." — natural, convida à ação sem ser marketing |
| Altura | 44px |
| Botão enviar | Ícone `ArrowUp` ou `Send`, 24px, cor `action-primary` quando input tem texto, `text-disabled` quando vazio |
| Touch target | 44×44px |
| Comportamento | Enter envia. Shift+Enter para nova linha (se necessário no futuro) |

---

## 5. ESTADO INICIAL — SEM INSIGHT (DOMUS-WF-02)

Quando não há insight relevante:

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Orientação
│  │ ◈  Domus                                                 ││
│  │                                                          ││
│  │  Posso analisar seus dados financeiros,                  ││
│  │  explicar seu índice de liberdade, simular               ││
│  │  cenários e ajudar em decisões.                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Comece perguntando:                                      ││
│  │                                                          ││
│  │ ┌─────────────────────────┐ ┌──────────────────────────┐ ││
│  │ │ Como foi meu mês?       │ │ Onde estou gastando mais?│ ││
│  │ └─────────────────────────┘ └──────────────────────────┘ ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ Como melhorar meu índice?                             │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Regra:** Sem insight = orientação curta no lugar. Nunca "Olá! Como posso ajudar?" vazio. A Domus sempre mostra algo útil.

---

## 6. CONVERSA — MODELO HÍBRIDO (DOMUS-WF-03)

### 6.1 Pergunta simples: "Quanto gastei este mês?"

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────┐                    │ ← Mensagem do usuário
│  │ Você                         09:41  │                    │ ← alinhada à direita
│  │                                    │                    │
│  │ Quanto gastei este mês?            │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resposta Domus
│  │ ◈  Domus                                      agora      ││
│  │                                                          ││
│  │  Você gastou R$ 4.280 este mês.                          ││ ← 36px financial-hero
│  │                                                          ││
│  │  12% abaixo do mês passado.              ↓ tendência     ││ ← 13px, state-positive
│  │                                                          ││
│  │  Principais categorias:                                   ││
│  │  ┌──────────────────────────────────────────────────────┐││
│  │  │ Alimentação     R$ 1.240    ↓ 23%  ▰▰▰▰▰▱▱▱▱       │││ ← mini-barras
│  │  │ Moradia         R$ 1.100    —      ▰▰▰▰▰▱▱▱▱       │││
│  │  │ Transporte      R$   840    ↑  8%  ▰▰▰▰▱▱▱▱▱       │││
│  │  │ Lazer           R$   580    ↓ 15%  ▰▰▰▱▱▱▱▱▱       │││
│  │  │ Outros          R$   520    ↓  5%  ▰▰▰▱▱▱▱▱▱       │││
│  │  └──────────────────────────────────────────────────────┘││
│  │                                                          ││
│  │  Dados até 28 de julho.                   [Ver detalhes] ││ ← freshness + CTA
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Estrutura da resposta:**
1. Valor principal: `financial-hero` (36px), tabular nums
2. Tendência: 13px, cor de estado (verde/âmbar/neutro)
3. Breakdown: mini-lista com barras de proporção (compacto, 4-5 itens)
4. Freshness + CTA opcional

### 6.2 Resposta analítica: "Por que gastei mais?" (DOMUS-WF-04)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                      agora         │
│                                                              │
│  Seus gastos subiram R$ 840 em relação ao                    │ ← Texto principal
│  mês passado. Três fatores explicam:                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Breakdown
│  │ 1. Lazer                                               ││
│  │    R$ 1.240 (+R$ 380)                                   ││
│  │    Viagem de fim de semana e dois jantares.             ││
│  │                                                         ││
│  │ 2. Transporte                                           ││
│  │    R$ 840 (+R$ 260)                                     ││
│  │    Revisão do carro + aumento de combustível.           ││
│  │                                                         ││
│  │ 3. Saúde                                                ││
│  │    R$ 420 (+R$ 200)                                     ││
│  │    Consulta oftalmologista + exames.                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Explanation
│  │ Os itens 2 e 3 são pontuais. O item 1 (lazer)            ││
│  │ representa 45% do aumento total.                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Dados até 28 jul.             [Ver todas as categorias →]   │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Freedom Index: "Por que meu índice caiu?" (DOMUS-WF-05)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                      agora         │
│                                                              │
│  Seu Índice de Liberdade Financeira caiu                     │
│  4 pontos neste mês.                                         │
│                                                              │
│  67                                                          │ ← 36px financial-hero
│  Nível Construção                ↓ 4 pts                    │
│                                                              │
│  O que mais impactou:                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Reserva de emergência     ▰▰▰▱▱▱▱▱▱▱  38%  −2 pts    ││ ← maior impacto
│  │ Liberdade de renda        ▰▰▰▰▰▰▱▱▱▱  62%  −1 pt     ││
│  │ Taxa de investimento      ▰▰▰▰▱▱▱▱▱▱  41%  −1 pt     ││
│  │ Demais pilares                                   estáveis ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Explanation Card
│  │ Sua reserva caiu porque você usou parte dela             ││
│  │ para a revisão do carro (R$ 1.800).                      ││
│  │                                                          ││
│  │ Para recuperar, mantendo seu ritmo de economia           ││
│  │ atual de R$ 620/mês, levaria 3 meses.                    ││
│  │                                                          ││
│  │                          [Simular recuperação da reserva] ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Dados até 28 jul.         [Ver composição completa do índice]│
└──────────────────────────────────────────────────────────────┘
```

**Regra:** Freedom Index é mostrado com `financial-hero` (36px). Breakdown usa mini-barras com o pilar de maior impacto destacado. Explanation Card abaixo com causa + projeção.

---

## 7. SIMULATION CARD (DOMUS-WF-06)

"E se eu investir R$ 1.000 por mês?"

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                      agora         │
│                                                              │
│  Investindo R$ 1.000 por mês, em 10 anos você               │
│  acumularia cerca de R$ 187.420.                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Simulation Card
│  │ SIMULAÇÃO                                                ││
│  │                                                          ││
│  │ Aporte mensal                                            ││
│  │ R$ 1.000                                                 ││
│  │                                                          ││
│  │ Horizonte                                                ││
│  │ 10 anos                                                  ││
│  │                                                          ││
│  │ Resultado estimado                                       ││
│  │ R$ 187.420                                               ││
│  │                                                          ││
│  │ ─────────────────────────────────────                    ││
│  │                                                          ││
│  │ Impacto no Freedom Index                                 ││
│  │ 67  →  74           +7 pontos                            ││
│  │                                                          ││
│  │ Tempo até liberdade financeira                           ││
│  │ 14 anos  →  11 anos           −3 anos                   ││
│  │                                                          ││
│  │ [Alterar valores]                                        ││ ← CTA secundário
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Esta é uma projeção baseada em rentabilidade                │ ← Disclaimer sutil
│  média de mercado. Ela não garante resultado futuro.         │
│                                                              │
│  [Criar meta de investimento]                                │ ← Nível 3 (futuro)
│  (breve)                                                     │
└──────────────────────────────────────────────────────────────┘
```

**Marcação de capacidade:**
- Simulation Card: ✅ EXISTE PARCIALMENTE (keyword matching, precisa evoluir para semântico)
- "Alterar valores": ⚠️ PRECISA SER IMPLEMENTADO (UI de ajuste de parâmetros)
- "Criar meta": ⚠️ FUTURO (Nível 3 de autonomia)

---

## 8. COMPARISON CARD (DOMUS-WF-07)

"Comprar carro à vista ou financiar?"

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                      agora         │
│                                                              │
│  Você tem R$ 52.000 em conta. Comprar à vista                │
│  reduziria sua reserva para 2,1 meses.                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Comparison Card
│  │                À vista         Financiado                 ││
│  │               ────────         ──────────                 ││
│  │                                                          ││
│  │ Entrada        R$ 80.000       R$ 32.000                 ││
│  │ Parcelas       —               48x R$ 1.420              ││
│  │ Custo total    R$ 80.000       R$ 100.160                ││
│  │ Reserva após   2,1 meses       5,8 meses                 ││
│  │                                                          ││
│  │ ─────────────────────────────────────                    ││
│  │ O financiamento preserva sua reserva de                  ││
│  │ emergência, mas custa R$ 20.160 a mais                   ││
│  │ no total.                                                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Action Card
│  │ Você também poderia juntar por 14 meses e                ││
│  │ pagar à vista sem afetar sua reserva atual.              ││
│  │                                                          ││
│  │              [Simular outros cenários]                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Regras:**
- Máximo 2-3 cenários por Comparison Card
- Sem tabela densa: cada linha é uma dimensão financeira relevante
- Conclusão textual abaixo da tabela (em português natural, não "Resultado: X vence")

---

## 9. ACTION CARD E MODULE CARD (DOMUS-WF-08)

### 9.1 Action Card (navegação)

```
┌──────────────────────────────────────────────────────────┐
│ 💡  Revisar 2 assinaturas pouco usadas poderia           │
│      liberar R$ 240 por mês.                             │
│                                                          │
│      [Ver assinaturas]                                    │ ← Nível 1: navegar
└──────────────────────────────────────────────────────────┘
```

### 9.2 Module Card (descoberta)

```
┌──────────────────────────────────────────────────────────┐
│ 📈  Investimentos                                        │
│      Carteira: R$ 42.800 · +R$ 1.200 no mês              │
│                                                          │
│      [Abrir Investimentos]                                │
└──────────────────────────────────────────────────────────┘
```

### 9.3 Ambos são o mesmo card — CONSOLIDAÇÃO

Os cards Action e Module foram consolidados em um único tipo: **Action Card**, com duas variantes:

| Variante | Quando usar | Exemplo |
|----------|------------|---------|
| **Navegação** | Domus aponta para módulo | "Ver assinaturas", "Abrir Investimentos" |
| **Ação** | Domus sugere próxima ação | "Simular outros cenários", "Criar meta" (futuro) |

A diferença é apenas semântica (rótulo do CTA). O componente é o mesmo.

---

## 10. TAXONOMIA FINAL DE CARDS (CONSOLIDADA)

| # | Card | Função | Regras |
|---|------|--------|--------|
| 1 | **Text Response** | Resposta textual da Domus | Obrigatório em toda resposta. 15px, 400w, line-height 1.5. |
| 2 | **Metric Card** | Número principal + contexto + tendência + breakdown | Absorveu Insight Card para métricas. Usa `financial-hero` quando valor principal é monetário/índice. |
| 3 | **Comparison Card** | Comparação lado a lado (2-3 cenários) | Máx 1 por resposta. 5-7 dimensões comparadas. |
| 4 | **Simulation Card** | Resultado de simulação com diff + parâmetros | Máx 1 por resposta. Sempre inclui disclaimer de projeção. |
| 5 | **Explanation Card** | Explicação de causa, conceito ou cálculo | Pode conter breakdown de pilares/barras. Collapsible "Ver dados considerados". |
| 6 | **Action Card** | Recomendação com CTA (navegar ou agir) | Máx 1 por resposta. 1 CTA principal + 0-1 secundário. |

**Total: 6 cards** (redução de 8 para 6: Insight → Metric, Module → Action).

---

## 11. ESTADOS

### 11.1 Sem dados — Primeiro acesso (DOMUS-WF-10)

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈  Domus                                                 ││
│  │                                                          ││
│  │  Ainda não conheço sua vida financeira.                  ││
│  │  Assim que você adicionar seus dados,                    ││
│  │  posso analisar, simular e orientar.                     ││
│  │                                                          ││
│  │  ┌──────────────────────────────────────────────────────┐││
│  │  │           ▶  Começar — Importar extrato               │││ ← CTA primário
│  │  └──────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Enquanto isso:                                           ││
│  │                                                          ││
│  │ ┌──────────────────────────┐ ┌─────────────────────────┐ ││
│  │ │ O que é o Freedom Index? │ │ Como o FinDomus ajuda?  │ ││
│  │ └──────────────────────────┘ └─────────────────────────┘ ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ Por onde começar?                                     │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                     ││ ← Input presente
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**O input permanece acessível** — o usuário pode perguntar coisas conceituais ("O que é o Freedom Index?") mesmo sem dados.

### 11.2 Dados insuficientes (DOMUS-WF-09)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Sobre "Quanto posso investir por mês?":                     │
│                                                              │
│  Com apenas 10 dias de transações, ainda não                 │
│  tenho um padrão confiável de receitas e despesas            │
│  para estimar sua capacidade mensal.                         │
│                                                              │
│  Para uma análise mais precisa, importe pelo                 │
│  menos 3 meses de extratos.                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │           ▶  Importar mais extratos                       ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 11.3 Privacy Mode (DOMUS-WF-11)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Seus gastos com alimentação representam                     │
│  ••••% da sua renda mensal.                                  │
│                                                              │
│  Essa proporção caiu em relação ao mês passado,              │
│  o que é positivo para sua margem.                           │
│                                                              │
│  Para ver os valores, desative o modo                        │
│  privacidade.                                                │
└──────────────────────────────────────────────────────────────┘
```

**Regras:** Valores monetários → `R$ ••••••`. Porcentagens → `••%`. Nomes de categorias/contas → visíveis. Análise qualitativa → preservada.

### 11.4 Offline (DOMUS-WF-12)

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                         ◈                                    │ ← Ícone Domus, text-tertiary
│                                                              │
│  A Domus precisa de conexão para analisar                    │
│  dados e responder perguntas.                                │
│                                                              │
│  Você ainda pode:                                            │
│  • Navegar pelos módulos                                     │
│  • Ver a Home com seu último índice                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                Ir para o Início                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
└──────────────────────────────────────────────────────────────┘
```

### 11.5 Rate Limit (DOMUS-WF-14)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Você atingiu o limite de consultas deste mês.               │
│                                                              │
│  Seu limite será renovado em 1 de agosto.                    │
│                                                              │
│  Enquanto isso:                                              │
│  • Explore seus módulos e relatórios                         │
│  • Veja os insights já calculados                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [Ver módulos]              [Ver planejamento]            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Seu plano atual: Essencial                                  │ ← sutil, informativo
│  82 de 100 consultas usadas                                  │
└──────────────────────────────────────────────────────────────┘
```

**Regras:** Sempre informar data de renovação. Oferecer alternativas (módulos). Nunca upsell agressivo. O plano e upgrade ficam em Perfil → Planos.

### 11.6 Error (DOMUS-WF-13)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Não foi possível processar sua pergunta                     │
│  neste momento.                                              │
│                                                              │
│  Isso pode ser uma instabilidade temporária.                 │
│  Suas informações financeiras não foram afetadas.            │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                Tentar novamente                           ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 11.7 Loading States (DOMUS-WF-15)

| Duração | Estado visual | O que o usuário vê |
|---------|--------------|-------------------|
| <1s | Invisível | Resposta aparece instantaneamente |
| 1-3s | "Analisando..." | Texto sutil abaixo da mensagem do usuário, cor `text-tertiary` |
| 3-8s | "Analisando seu fluxo financeiro..." | Texto + indicador de progresso sutil (3 pontos animados) |
| >8s | "Isso está demorando mais que o esperado..." | Texto + opção de cancelar |

**NUNCA usar:** "Cérebro financeiro pensando...", "Consultando a IA...", robô animado, spinner gigante.

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐                    │
│  │ Você                         09:41  │                    │
│  │ Quanto posso investir por mês?      │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈  Domus                                                 ││
│  │                                                          ││
│  │ Analisando seu fluxo financeiro...                       ││ ← Loading text
│  │ ∙ ∙ ∙                                                    ││ ← Indicador sutil
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 12. HISTÓRICO — FUTURO (DOMUS-WF-20)

Marcado como `⚠️ REQUIRES IMPLEMENTATION`. Arquitetura: Firestore `domus_threads/{userId}_{context}`, 30 dias expiração.

**Decisão de acesso: Opção A — Ícone no header.**

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                            [ 🕐 ]  [ 👤 avatar       ]│ ← Ícone histórico
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│  ...                                                          │
```

Toque no ícone 🕐 (ou `Clock` Lucide) → abre Sheet com threads recentes (últimas 5, contexto atual):

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro]                             │
├──────────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                         │
│                                                              │
│  Histórico · Pessoal                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Ontem                                                     ││
│  │ Compra do carro — à vista vs financiado                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 3 dias atrás                                              ││
│  │ Por que meu Freedom Index caiu?                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 1 semana atrás                                            ││
│  │ Revisão de assinaturas                                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [Nova análise]                                              │
└──────────────────────────────────────────────────────────────┘
```

**Por que Sheet e não tela secundária:** O histórico é acessório, não destino. Sheet preserva contexto da conversa atual e permite retorno imediato.

### Continuidade (thread ≤24h)

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Continuity Card
│  │ ↩  Você estava analisando a compra de um carro           ││
│  │     ontem. Continuar de onde parou?                       ││
│  │                                                          ││
│  │     [Continuar]               [Começar novo]              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [Insight ou orientação abaixo]                               │
│  [Sugestões abaixo]                                           │
│  [Input abaixo]                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. KEYBOARD — COMPARAÇÃO OBRIGATÓRIA (DOMUS-WF-19)

### 13.1 Três cenários testados

| Cenário | Bottom Nav | Altura Nav | Viewport útil (390×844) |
|---------|-----------|:----------:|:------------------------:|
| **A — Compacta** | Ícones, sem labels | 54px | ~490px (844 − 54 − 300) |
| B — Escondida | Nenhuma | 0px | ~544px |
| C — Completa | Ícones + labels | 82px | ~462px |

### 13.2 Avaliação

| Critério | A — Compacta | B — Escondida | C — Completa |
|----------|:-----------:|:------------:|:------------:|
| Espaço útil para conversa | 4 | **5** | 2 |
| Acessibilidade (escape) | **5** | 1 | **5** |
| Memória espacial | **5** | 2 | **5** |
| Clareza de destino atual | 4 | 1 | **5** |
| 375px (menor viewport) | **5** | **5** | 2 |
| 390px | **5** | **5** | 3 |
| Conflito com teclado | 4 | **5** | 2 |
| **TOTAL** | **32** | 24 | 24 |

### 13.3 Decisão: VERSÃO A — Compacta

**Recomendação mantida.** Sem divergência do Navigation Wireframe. Sem Change Request.

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────┐                    │
│  │ Você                                │                    │
│  │ Quanto gastei este mês?             │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈  Domus                                                 ││
│  │ Analisando...                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                      ││ ← Input com foco
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │              [ TECLADO DO SISTEMA ]                      ││ ← ~300px
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⌂         ⊞⊞         ◈         ◉        ← 54px, só ícones  │
└──────────────────────────────────────────────────────────────┘
```

**Comportamento:**
- Quando teclado abre → labels ocultos, altura reduz para 54px
- Quando teclado fecha → labels restaurados, altura volta para 82px
- Transição: 200ms ease (acompanha animação do teclado)
- Escape: toque em qualquer destino da Bottom Nav funciona (teclado fecha, navegação executa)

---

## 14. CONTEXT SWITCH (DOMUS-WF-16)

```
Usuário em: Domus · Pessoal
Ação: toca avatar → Context Sheet → seleciona "TreeTech Automation"

Resultado esperado:
1. Sheet fecha
2. Conversa PF salva (thread PF)
3. Domus recarrega com estado inicial PJ
4. Se havia thread PJ ≤24h → Continuity Card
5. Se não → Insight ou orientação PJ + sugestões PJ
```

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  TreeTech Automation                                          │ ← Contexto mudou
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Orientação PJ
│  │ ◈  Domus                                                 ││
│  │                                                          ││
│  │  Posso analisar os dados da TreeTech                     ││
│  │  Automation. Aqui estão algumas perguntas                ││
│  │  que posso responder:                                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ┌──────────────────────────┐ ┌─────────────────────────┐ ││ ← Sugestões PJ
│  │ │ Como está o caixa?       │ │ Minha margem melhorou?  │ ││
│  │ └──────────────────────────┘ └─────────────────────────┘ ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ Quais obrigações fiscais estão próximas?              │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre as finanças da empresa...            ││ ← Placeholder PJ
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 15. PJ (DOMUS-WF-17)

Resposta para "Como está o caixa da empresa?":

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  A TreeTech Automation tem R$ 18.420 em caixa.               │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Este mês                                                 ││
│  │                                                          ││
│  │ Receitas             R$ 52.000                           ││
│  │ Despesas             R$ 33.580                           ││
│  │ ─────────────────────────────────────                    ││
│  │ Resultado            R$ 18.420                           ││
│  │                                                          ││
│  │ Comparado ao mês anterior:  +8%                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Próximas obrigações:                                     ││
│  │ • DAS — vence em 5 dias (R$ 2.340)                       ││
│  │ • ISS — vence em 12 dias (R$ 480)                        ││
│  │                                                          ││
│  │                 [Ver obrigações fiscais]                  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Linguagem PJ:** "A empresa", "a TreeTech", nunca "você". Dados de DRE PJ (engine real existe). Obrigações fiscais (taxObligations do kernel).

---

## 16. FAMÍLIA — FUTURO (DOMUS-WF-18)

Marcado como `⚠️ FUTURE — CONTEXT ENGINE REQUIRED`. O flow atual não carrega dados de múltiplos membros.

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Família                                                      │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈  Domus                                                 ││
│  │                                                          ││
│  │  A análise familiar completa estará disponível           ││
│  │  em breve. Por enquanto, posso responder                 ││
│  │  perguntas gerais sobre planejamento.                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ┌──────────────────────────┐ ┌─────────────────────────┐ ││
│  │ │ Como criar metas juntos? │ │ Como funciona a Família?│ ││
│  │ └──────────────────────────┘ └─────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 17. PERGUNTAS ESPECIAIS

### 17.1 Ambigua — "Quanto eu tenho?" (DOMUS-WF-23)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Aqui está um resumo do seu patrimônio:                      │
│                                                              │
│  💳 Contas                     R$ 12.450                     │ ← Metric Cards
│  📈 Investimentos              R$ 42.800                     │
│  🛡️ Dívidas ativas           −R$  8.400                     │
│  ─────────────────────────────────────                       │
│  💰 Patrimônio líquido         R$ 46.850                     │ ← financial-hero
│                                                              │
│  Sua reserva cobre 4,2 meses dos 6 recomendados.            │
│                                                              │
│  [Ver composição completa]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Heurística:** Pergunta ambígua → resposta estruturada com múltiplas dimensões. Nunca perguntar "qual você quer saber?".

### 17.2 Fora do escopo — "Quem ganhou o jogo?" (DOMUS-WF-24)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Meu foco é sua vida financeira.                             │
│                                                              │
│  Posso ajudar com:                                           │
│  • Análise de gastos e receitas                              │
│  • Planejamento financeiro                                   │
│  • Simulações e projeções                                    │
│  • Entender seu Freedom Index                                │
│                                                              │
│  No que mais posso ajudar?                                   │
└──────────────────────────────────────────────────────────────┘
```

### 17.3 Risco — "Devo colocar tudo em Bitcoin?" (DOMUS-WF-25)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Concentrar todos os recursos em um único ativo,             │
│  especialmente de alta volatilidade, não é uma               │
│  estratégia recomendada.                                     │
│                                                              │
│  Sua carteira atual já tem diversificação moderada.          │
│  Se você quer explorar criptomoedas, o mais seguro           │
│  é limitar a um percentual pequeno do patrimônio.            │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📚  Academia                                             ││
│  │      Aula: Diversificação de Investimentos                ││
│  │      6 minutos · Aula 2 de 8                              ││
│  │                                                          ││
│  │      [Ver aula]                                           ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 17.4 Pressão emocional (DOMUS-WF-22)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Domus                                                    │
│                                                              │
│  Entendi. Vamos olhar seus números com calma.                │
│                                                              │
│  Você tem 2 dívidas ativas:                                  │
│                                                              │
│  Cartão de crédito    R$ 4.200    juros 12% ao mês          │
│  Financiamento carro  R$ 18.400   24 parcelas restantes      │
│                                                              │
│  Se você priorizar o cartão (juros mais altos)               │
│  e direcionar R$ 800 por mês, ele estará quitado             │
│  em 6 meses. Isso liberaria esse valor para                  │
│  acelerar o financiamento.                                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Simular plano de quitação                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Regras:** Validar sem dramatizar. Focar em dados. Oferecer caminho acionável. Sem emojis. Sem "você não está sozinho". Sem terapia.

---

## 18. FLUXOS DE NAVEGAÇÃO

### 18.1 Deep Link: Home Insight → Domus → Módulo → Voltar (DOMUS-WF-21)

```
ETAPA 1: Home
┌──────────────────────────────────────────┐
│ Domus Insight                            │
│ Sua reserva caiu abaixo de 4 meses.      │
│                               [Entender] │ ← toque
└──────────────────────────────────────────┘

ETAPA 2: Domus (com insight expandido)
┌──────────────────────────────────────────────────────────────┐
│  ← Início    Domus                             [ 👤 avatar ]│ ← Header: back para Home
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈  Domus · Sua reserva                                   ││ ← Insight expandido
│  │                                                          ││
│  │ Sua reserva atual cobre 3,8 meses.                       ││
│  │ O ideal são 6 meses.                                     ││
│  │                                                          ││
│  │ Isso aconteceu porque você usou R$ 1.800                 ││
│  │ da reserva para a revisão do carro.                      ││
│  │                                                          ││
│  │ Para recuperar:                                           ││
│  │ • Mantendo R$ 620/mês → 4 meses                          ││
│  │ • Aumentando para R$ 1.000/mês → 2 meses                 ││
│  │                                                          ││
│  │              [Ver planejamento]                           ││ ← Module Card
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                      ││
│  └──────────────────────────────────────────────────────────┘│
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │ ← Domus ATIVO
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘

ETAPA 3: Planejamento (via Module Card)
┌──────────────────────────────────────────────────────────────┐
│  ← Domus     Planejamento                      [ 🔍 ?     ]│ ← Header: back para Domus
│  [Overview] [Metas] [Orçamento]                               │
├──────────────────────────────────────────────────────────────┤
│  ...                                                          │
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │ ← Domus ATIVO
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘

ETAPA 4: Voltar (← Domus)
┌──────────────────────────────────────────────────────────────┐
│  ← Início    Domus                             [ 👤 avatar ]│
│  [Restaurado: Insight expandido visível, scroll preservado]  │
└──────────────────────────────────────────────────────────────┘
```

### 18.2 Interrupção (envia pergunta, navega para Módulos)

**Cenário:** Usuário envia pergunta → loading inicia → toca "Módulos" na Bottom Nav.

**Comportamento v1 (realista, sem streaming/histórico persistente):**

1. Navegação para Módulos é executada
2. A requisição ao endpoint continua processando (não cancela — limite técnico)
3. Ao voltar para Domus: se resposta chegou → exibida. Se ainda processando → loading retomado.
4. Se o componente foi desmontado: estado perdido. Ao retornar, estado inicial da Domus.

**Marcação:** ⚠️ COMPORTAMENTO V1 REALISTA. Melhorias futuras com histórico persistente permitirão restaurar conversa exata.

---

## 19. VIEWPORT TESTS

### 19.1 375 × 812px (DOMUS-WF-19-375)

```
Área útil sem teclado: 812 − 54 − 82 = 676px
Área útil com teclado: 812 − 54 − 82 − 300 = 376px

Estado inicial: Insight + 3 sugestões + input + Bottom Nav = ~380px. ✅ Cabe.
Conversa com resposta: Espaço para ~3 trocas visíveis sem scroll. Aceitável.
Keyboard: ~376px útil. Input + teclado + nav compacta. Apertado mas funcional.
Sugestões (chips): Precisam quebrar linha. 2 chips por linha em 343px úteis. ✅
```

### 19.2 390 × 844px (referência)

```
Área útil sem teclado: 708px. Confortável.
Área útil com teclado: ~408px. Funcional.
Sugestões: 2 chips por linha (358px úteis). ✅
Todos os cards cabem sem truncamento. ✅
```

### 19.3 430 × 932px

```
Área útil sem teclado: 932 − 54 − 82 = 796px. Amplo.
Sugestões: 3 chips podem caber em 1 linha (398px úteis). ✅
Mais respiro para Comparison Card (colunas mais largas). ✅
```

---

## 20. TESTES DE USUÁRIO

| Teste | Resultado |
|-------|:---------:|
| 5 segundos — estado inicial | ✅ "Domus", "Pessoal", insight/sugestões, input |
| 5 segundos — resposta | ✅ Valor principal, tendência, ação quando presente |
| Leigo: "Meu dinheiro está bom?" | ✅ Resposta estruturada com múltiplas dimensões |
| Power User: "Compare taxa de acumulação 6 meses" | ✅ Resposta analítica com série temporal |
| Ambiguidade: "Quanto eu tenho?" | ✅ Estruturada, sem adivinhar |
| Fora do escopo: "Quem ganhou o jogo?" | ✅ Recusa educada com redirecionamento |
| Risco: "Tudo em Bitcoin?" | ✅ Proteção + educação |
| Dívida: "Qual priorizar?" | ✅ Baseado em critérios, sem autoridade absoluta |
| Pressão emocional: "Estou desesperado" | ✅ Dados + caminho, sem terapia |
| PJ: "Como está meu caixa?" | ✅ Linguagem empresarial |
| Família: "Gastos com alimentação?" | ⚠️ FUTURO — engine necessário |
| Contexto errado: pergunta PJ em PF | ✅ Esclarece, sugere trocar |
| 20 módulos | ✅ Module Card referencia qualquer módulo |
| 100 módulos | ✅ Mesmo mecanismo, escala independente |
| Sem insight | ✅ Orientação substitui insight |
| Sem histórico | ✅ Arquitetura atual funciona |

---

## 21. COMPLEXITY BUDGET

| Limite | Valor | Validado |
|--------|:-----:|:--------:|
| Sugestões no estado inicial | **3** | ✅ Chips, 1-2 por linha |
| Insight no estado inicial | **0-1** | ✅ Sem insight = orientação |
| Texto principal da resposta | **≤4 linhas** | ✅ 390px, 15px fonte, ~55 chars/linha |
| Cards por resposta | **≤2** (texto + 1-2 cards) | ✅ |
| Comparison/Simulation | **1** por resposta | ✅ |
| Action Card | **1** principal + 0-1 secundário | ✅ |
| Blocos antes de progressive disclosure | **3** (principal + evidência + ação) | ✅ |
| Gráfico simples por resposta | **≤1** (mini-barras, tendência) | ✅ |
| Emojis | **0** | ✅ |
| Exposição de provedor IA | **NUNCA** | ✅ |
| Mensagens "cérebro/pensando" | **0** | ✅ |

---

## 22. DOMUS CARD CONTRACT

| Card | Objetivo | Conteúdo máx | Ações | Quando usar | Quando NÃO usar |
|------|----------|-------------|-------|-------------|-----------------|
| **Text Response** | Resposta principal | 4 linhas, 15px, pt-BR natural | Nenhuma (texto puro) | Toda resposta | — |
| **Metric Card** | Número + contexto + tendência | 1 métrica principal (36px) + até 5 breakdowns | "Ver detalhes" | Perguntas de valor | Quando a pergunta é binária (sim/não) |
| **Comparison Card** | Comparar 2-3 cenários | 5-7 dimensões, máx 3 cenários | "Alterar valores" | Decisões financeiras | Cenários hipotéticos sem dados (→ Simulation) |
| **Simulation Card** | Resultado de simulação | Parâmetros + resultado + diff + disclaimer | "Alterar valores" | Perguntas com "e se" | Quando não há engine de simulação |
| **Explanation Card** | Explicar causa/conceito | Breakdown + collapsible "Ver dados" | "Ver composição" | "Por que", "Como" | Respostas factuais simples |
| **Action Card** | Recomendar próximo passo | 1 CTA principal + 0-1 secundário | CTA de navegação ou ação (futuro) | Quando há ação clara | Quando a resposta é informativa |

---

## 23. DOMUS RESPONSE CONTRACT

| Formato | Estrutura | Exemplo |
|---------|-----------|---------|
| **Simple** | Text + 0-1 Metric Card | "Quanto gastei?" |
| **Analytical** | Text + Explanation Card + 0-1 Action | "Por que gastei mais?" |
| **Diagnostic** | Text + Metric (Freedom) + Explanation (breakdown) | "Por que meu índice caiu?" |
| **Simulation** | Text + Simulation Card + 0-1 Action | "E se eu investir R$ 1.000?" |
| **Comparison** | Text + Comparison Card + 0-1 Action | "À vista ou financiado?" |
| **Guiding** | Text + Action Card (Module) | "Onde invisto melhor?" |
| **Insufficient** | Text + Action (importar) | 10 dias de dados |
| **No Data** | Text + Action (começar) + sugestões | Primeiro acesso |
| **Error** | Text + Action (tentar novamente) | Falha técnica |
| **Off-topic** | Text + redirecionamento | "Quem ganhou o jogo?" |
| **Risk** | Text + Explanation + Module (Academia) | "Tudo em Bitcoin?" |

---

## 24. DOMUS INPUT CONTRACT

```
Posição:       Fixo acima da Bottom Nav (não flutua no meio da conversa)
Altura:        44px (touch target)
Placeholder:   "Pergunte sobre suas finanças..." (PF)
               "Pergunte sobre as finanças da empresa..." (PJ)
Envio:         Ícone ArrowUp/Send, 24px, action-primary quando tem texto
Teclado:       Abre abaixo do input. Bottom Nav → modo compacto (54px)
Loading:       Input desabilitado durante processamento
Draft:         Texto preservado se usuário navega para outro destino e volta
Disabled:      Offline, rate limit atingido
```

---

## 25. DOMUS HEADER CONTRACT

```
Título:          "Domus" (16px, 600w, text-primary)
Contexto:        Linha 2 (10px, 500w, text-tertiary): "Pessoal", "Família", "Empresa X"
Avatar:          À direita, 32px. Toque → Context Switcher Sheet
Módulo origem:   Tag opcional abaixo do contexto (se veio de módulo específico)
Histórico:       Ícone Clock (futuro, à esquerda do avatar)
Back:            Seta + nome do destino de origem (se veio de Home, Módulo, etc.)
                 Se entrada foi Bottom Nav → sem back (destino raiz)
```

---

## 26. DOMUS NAVIGATION CONTRACT

```
Bottom Nav:         Sempre visível. Domus ativo (slot 3).
                    Teclado → modo compacto 54px.
Domus → Módulo:    Action Card → navega. Bottom Nav: Domus ativo. Header: ← Domus.
Módulo → Domus:    Voltar (← Domus no header) → restaura estado.
Home → Domus:      Home Insight → Domus com insight expandido. Header: ← Início.
Context Switch:    Avatar → Sheet → selecionar → recarrega Domus no novo contexto.
                    Conversa anterior salva. Dados nunca misturados.
Deep Link:         Domus recebe tópico como contexto inicial.
State Restoration: React state durante sessão. Firestore threads entre sessões (futuro).
Interrupção:       Navegação para outro destino não bloqueia. Estado pode ser perdido (v1 realista).
```

---

## 27. DOMUS STATE CONTRACT

| Estado | Header | Conteúdo | Input | Bottom Nav |
|--------|:------:|----------|:-----:|:----------:|
| **Initial (com insight)** | Domus + contexto | Insight Card + 3 sugestões | Ativo | Normal |
| **Initial (sem insight)** | Domus + contexto | Orientação + 3 sugestões | Ativo | Normal |
| **Initial (continuidade)** | Domus + contexto | Continuity Card + Insight + sugestões | Ativo | Normal |
| **Conversation** | Domus + contexto | Mensagens + respostas com cards | Ativo | Normal |
| **Loading (<8s)** | Domus + contexto | Última mensagem + indicador de loading | Desabilitado | Normal |
| **Loading (>8s)** | Domus + contexto | Última mensagem + "demorando" + cancelar | Desabilitado | Normal |
| **No Data** | Domus + contexto | Orientação + CTA começar + sugestões | Ativo | Normal |
| **Insufficient Data** | Domus + contexto | Explicação + CTA importar | Ativo | Normal |
| **Privacy** | Domus + contexto | Resposta com valores ocultos | Ativo | Normal |
| **Offline** | Domus + contexto | Ícone + mensagem + CTA Início | Desabilitado | Normal |
| **Rate Limit** | Domus + contexto | Mensagem + data renovação + CTAs módulos | Desabilitado | Normal |
| **Error** | Domus + contexto | Mensagem + CTA tentar novamente | Ativo | Normal |

---

## 28. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**DOMUS-WF-P0: 0 · DOMUS-WF-P1: 0 · DOMUS-WF-P2: 2 · DOMUS-WF-P3: 2**

### DOMUS-WF-P2

| ID | Descrição |
|----|-----------|
| P2-01 | Histórico de conversas (threads) requer implementação de Firestore + endpoint. Wireframe já prevê UX. |
| P2-02 | Interrupção durante processamento: sem streaming/histórico, estado pode ser perdido ao navegar. Comportamento v1 documentado. |

### DOMUS-WF-P3

| ID | Descrição |
|----|-----------|
| P3-01 | Contexto Família: wireframe UX definido, mas flow atual não carrega dados de múltiplos membros. |
| P3-02 | Placeholder do input varia por contexto (PF vs PJ). Implementar sistema de placeholders contextuais. |

---

## 29. CHANGE REQUESTS

### Navigation Change Request

**Nenhum.** O teste de keyboard (A/B/C) confirmou a recomendação do Navigation Wireframe (modo compacto, 54px, apenas ícones). Sem divergência.

### FDL Change Request

**Nenhum.** O FDL 1.0 fornece todos os tokens necessários.

### Domus Architecture Change Request

**Nenhum.** A arquitetura suporta todos os wireframes sem alteração.

---

## 30. RECOMENDAÇÃO FINAL

A Domus Mobile, como definida por estes wireframes, funciona como produto de inteligência financeira — não como chatbot. A combinação de texto estruturado + 6 tipos de cards + progressive disclosure + contexto explícito + navegação integrada prova que é possível:

- Responder perguntas simples em <3 segundos de leitura
- Explicar causas com breakdown visual dos 7 pilares do Freedom Index
- Simular cenários com dados reais do kernel financeiro
- Comparar decisões lado a lado com métricas financeiras
- Navegar para módulos com 1 toque
- Operar em PF, PJ e Família sem misturar dados
- Funcionar com dados insuficientes, sem dados, offline, privacidade ativa
- Manter calma, clareza e confiança em todas as interações

**Próximo passo:** Com DOMUS-WF-P0 = 0 e DOMUS-WF-P1 = 0:

→ **DOMUS MOBILE MASTER VISUAL v1** (imagem visual da interface de inteligência)

---

## 31. ARQUIVOS GERADOS

| Arquivo | Conteúdo |
|---------|----------|
| `docs/domus/DOMUS-MOBILE-WIREFRAME-v1.md` | Este documento |
| `docs/domus/DOMUS-MOBILE-ARCHITECTURE-v1.md` | Arquitetura homologada (referência) |

---

*FinDomus Domus Mobile Wireframe v1 · Fase 7 concluída · Aguardando homologação*
