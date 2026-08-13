# FINDOMUS DOMUS MOBILE ARCHITECTURE v1

**Fase:** 6 — Arquitetura da Domus Mobile
**FDL:** 1.0 FROZEN
**Navigation Architecture:** v1 homologada
**Navigation Wireframe:** v1 homologado
**Home:** Homologada (ARCHITECTURE + WIREFRAME + MASTER VISUAL v1)

---

## 1. RESUMO EXECUTIVO

A Domus é a camada de inteligência financeira do FinDomus. Ela transforma dados financeiros em entendimento, contexto, orientação, descoberta, simulação, prevenção e ação.

A auditoria do código real revelou que o FinDomus já possui uma base técnica sólida — kernel financeiro com 7 engines, sistema de snapshots pré-computados, Genkit + Gemini 2.5 Flash, rate limiting e um fluxo de assessor financeiro que executa simulações dinâmicas. Porém essa capacidade está confinada a um widget flutuante de sidebar desktop com respostas puramente textuais.

Esta arquitetura projeta a Domus Mobile como um destino global de primeira classe (Bottom Nav, slot 3), com 5 papéis bem definidos, respostas em formato de cards progressivos, contexto financeiro explícito, simulação interativa, e preservação de confiança através de limites claros de autonomia.

---

## 2. AUDITORIA TÉCNICA — O QUE EXISTE HOJE

### 2.1 Genkit Flow

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **financialAdvisorFlow** | `src/ai/flows/financial-advisor.ts` (167 linhas) | Flow principal. Recebe userId + question. Carrega snapshots ou kernel context. Roda `runFinancialKernel()`. Detecta keywords para simulações. Monta prompt com dados reais. Chama `ai.generate()`. Retorna answer + simulations + audit. |
| **classifyPixFlow** | `src/ai/flows/classify-pix.ts` | Classificação de transações PIX (não relacionado à Domus) |
| **extractTransactionsFromDocumentFlow** | `src/ai/flows/extract-transactions-from-document.ts` | Extração de transações de documentos (não relacionado à Domus) |
| **Genkit config** | `src/ai/genkit.ts` | `genkit({ plugins: [googleAI()], model: 'googleai/gemini-2.5-flash' })` |

### 2.2 API Endpoints

| Endpoint | Arquivo | Uso atual |
|----------|---------|-----------|
| `POST /api/chat/financial` | `src/app/api/chat/financial/route.ts` | Principal. Usado pelo AiChatWidget. Auth + rate limit + financialAdvisorFlow + registerAIUsage. ✅ |
| `POST /api/ai/chat` | `src/app/api/ai/chat/route.ts` | Duplicado. Mesma lógica mas sem `audit` no registerAIUsage. ⚠️ Redundante |
| `GET /api/ai/insights` | `src/app/api/ai/insights/route.ts` | Insights de IA (limit 200/mês). Usa `getFinancialAIDataAdmin`. |

### 2.3 Context Loading Pipeline

```
financialAdvisorFlow
  ├── input.contextData? → usa direto (preloaded_context)
  ├── loadSnapshotsForIA(userId) → 4 snapshots (dashboard, planning, investment, liability)
  │     ├── cacheHit → contexto leve com pre-computed values
  │     └── fallback → loadKernelContextAdmin(userId) → Firestore scan completo
  └── runFinancialKernel(context) → 7 engines → baseline data para o prompt
```

**Snapshots carregados (`src/ai/tools/load-snapshots.ts`):**
- `dashboard_snapshot` (READY status requerido)
- `planning_snapshot`
- `investment_snapshot`
- `liability_snapshot`

**Cache hit:** ≥1 snapshot → contexto leve. **Fallback:** 0 snapshots → scan completo via `loadKernelContextAdmin`.

### 2.4 Prompt atual

O prompt injeta no Gemini:

```text
Contexto atual: Freedom Index, Nível, Patrimônio, Gastos, Renda, Reserva
Simulações executadas: (se keyword match)
Pergunta do usuário: (raw text)
Diretrizes: baseie-se nos dados reais, comente simulações, seja profissional
```

**Problemas identificados:**
1. Prompt não tem proteção contra perguntas fora do escopo financeiro
2. Prompt não limita o tom de voz (pode variar entre respostas)
3. Prompt não instrui sobre dados insuficientes
4. Prompt não inclui contexto PJ ou Família
5. Sem system prompt separado do prompt dinâmico

### 2.5 Simulações automáticas

O flow atual faz keyword matching para decidir se executa simulações:

| Keyword | Simulação disparada |
|---------|---------------------|
| `quitar`, `amortizar`, `divida`, `pagar` | `payoff_debt` com 50% do saldo da primeira dívida ativa |
| `investir`, `aporte`, `investimento` | `new_investment` com R$ 500/mês |

**Limitações:**
- Apenas 2 tipos de simulação (de 6 disponíveis no engine)
- Keyword matching não captura intenção real ("devo parar de investir?" dispara simulação de investimento)
- Sempre usa parâmetros fixos (50% da dívida, R$ 500/mês)
- Não permite ao usuário ajustar parâmetros

### 2.6 Rate Limit

| Arquivo | Mecanismo |
|---------|-----------|
| `src/core/ai/usage.admin.ts` | `canUseAIAdmin(userId, limit=100)` — verifica `ai_usage` Firestore collection, doc key: `{userId}_{YYYY-MM}`, campo `calls`. Se atingiu limite → 403. |
| `src/lib/billing/usage-engine.ts` | `getAIUsagePercentage()` — calcula % de uso dos créditos mensais do plano |
| `src/lib/billing/capabilities-engine.ts` | `getUserCapabilities()` — AI tier: none / full / advanced. `monthlyCredits` do plano. |

**Limite padrão:** 100 chamadas/mês para `/api/chat/financial`, 200/mês para `/api/ai/insights`.

### 2.7 Financial AI Engine (rule-based, não LLM)

Arquivo `src/core/finance/financial-ai-engine.ts` (287 linhas) gera insights sem LLM:
- Detecção de recorrências (merchant fingerprinting)
- Detecção de assinaturas (Netflix, Spotify, etc.)
- Projeção de fluxo futuro (2 meses)
- Health score (herdado do Freedom Index quando disponível)
- 7 tipos de alertas proativos (reserva baixa, dívida alta, cash drag, diversificação, etc.)

**Este engine NÃO é usado pelo financialAdvisorFlow.** Opera independentemente via `/api/ai/insights`.

### 2.8 AI Chat Widget (atual)

Arquivo `src/components/ai/ai-chat-widget.tsx` (253 linhas):
- Botão flutuante (FAB) no canto inferior direito — **quebra regra FDL de não usar FAB**
- Abre painel 380×500px com chat bubbles
- Usa emoji de robô e "cérebro financeiro pensando..."
- Mostra badge "Gemini" — **quebra regra FDL de não expor provedor**
- Mensagem de boas-vindas fixa
- Input + botão enviar
- 3 sugestões de pergunta em chips
- Loading com 3 bolinhas animadas
- Erro: mensagem genérica

**Problemas com FDL:**
1. Usa FAB (anti-padrão FDL)
2. Exibe badge do provedor ("Gemini") — anti-padrão Domus
3. Ícone BrainCircuit + cor âmbar — identidade visual inconsistente
4. Linguagem: "Cérebro financeiro pensando..." — anti-padrão Domus
5. Emoji de robô — personalidade incorreta

---

## 3. MAPEAMENTO DE CAPACIDADES

### 3.1 Engine → Domus Capability

| Engine (real) | Domus Capability | Status |
|---------------|-----------------|:------:|
| `freedom-engine.ts` | Explicar Freedom Index, tendências, pilares | ✅ EXISTE |
| `kernel.ts` | Orquestrar todas as engines para diagnóstico completo | ✅ EXISTE |
| `dre-engine.ts` | Analisar fluxo mensal (PF e PJ) | ✅ EXISTE |
| `financial-core.ts` | Calcular patrimônio líquido, reserva, wealth score | ✅ EXISTE |
| `simulation-engine.ts` | Simular cenários (6 tipos) | ✅ EXISTE |
| `forecast-engine.ts` | Projetar fluxo de caixa futuro | ✅ EXISTE |
| `wealth-engine.ts` | Analisar distribuição de gastos vs metas | ✅ EXISTE |
| `liability-engine.ts` | Projetar amortização de dívidas | ✅ EXISTE |
| `financial-ai-engine.ts` | Insights proativos (rule-based) | ✅ EXISTE |
| `retirement.ts` | Simular aposentadoria | ✅ EXISTE |
| `million.ts` | Calcular caminho até primeiro milhão | ✅ EXISTE |
| `optimizer.ts` | Identificar oportunidades de otimização | ✅ EXISTE |
| `recurrence-engine.ts` | Detectar despesas recorrentes | ✅ EXISTE |
| `portfolio-analysis.ts` | Analisar concentração de carteira | ✅ EXISTE |
| `investment/analytics/*` | Analytics de investimentos (saúde, risco, dividendos) | ✅ EXISTE |
| `month-closure-engine.ts` | Dados históricos de fechamento mensal | ✅ EXISTE |
| `snapshot-engine.ts` | Dados pré-computados para performance | ✅ EXISTE |

### 3.2 Capacidades PARCIAIS

| Capacidade | Por que parcial | O que falta |
|------------|----------------|-------------|
| **Contexto PJ** | DRE PJ existe, mas financialAdvisorFlow não tem prompt para PJ | System prompt + dados PJ no contexto |
| **Contexto Família** | Households existem, mas flow não carrega dados de múltiplos membros | Agregar dados familiares no contexto |
| **Simulações interativas** | Engine suporta 6 tipos, mas flow só dispara 2 por keyword | UI para selecionar/ajustar parâmetros |
| **Streaming** | `ai.generate()` usado (não `generateStream()`) | Migrar para streaming |
| **Histórico de conversa** | Flow é stateless por request | Armazenar threads no Firestore |
| **Deep link para módulos** | Flow retorna texto puro | Estruturar output com actions navegáveis |
| **Respostas ricas** | Apenas texto | Cards, comparações, gráficos |

### 3.3 Capacidades FUTURAS (não existem)

| Capacidade | Prioridade |
|------------|:----------:|
| Execução de ações com confirmação (ex: criar meta) | Média |
| Notificações proativas da Domus | Baixa |
| Memória de preferências do usuário | Baixa |
| Integração com busca global | Média |
| Domus multimodal (análise de PDF, imagem de nota fiscal) | Baixa |
| Voz (speech-to-text) | Baixa |

---

## 4. OS 5 PAPÉIS DA DOMUS

### Papel 1 — EXPLICADORA

**Função:** Explicar o que os números significam.

**Exemplos:**
- "Por que meu Freedom Index caiu 3 pontos?"
- "O que significa 'Nível Construção'?"
- "Como minha reserva está distribuída?"

**Engines:** `freedom-engine.ts` (breakdown, trend), `wealth-engine.ts` (análise de pilares), `financial-ai-engine.ts` (alertas)

**Formato de resposta:** Explanation Card com breakdown visual + causas + ações sugeridas.

### Papel 2 — ANALISTA

**Função:** Analisar dados e identificar padrões.

**Exemplos:**
- "Como foi meu mês?"
- "Onde estou gastando mais?"
- "Minha renda está crescendo?"

**Engines:** `dre-engine.ts` (DRE PF/PJ), `financial-core.ts` (net worth), `forecast-engine.ts` (projeção)

**Formato de resposta:** Metric Cards + texto analítico + tendência.

### Papel 3 — PLANEJADORA

**Função:** Ajudar a planejar o futuro financeiro.

**Exemplos:**
- "Consigo viajar em dezembro?"
- "Quanto preciso guardar para comprar um carro?"
- "Como chegar a 80 pontos no Freedom Index?"

**Engines:** `simulation-engine.ts` (cenários), `freedom-engine.ts` (action plan), `retirement.ts`, `million.ts`

**Formato de resposta:** Simulation Card + Comparison Card + Action Card.

### Papel 4 — SIMULADORA

**Função:** Simular cenários hipotéticos.

**Exemplos:**
- "E se eu investir R$ 1.000 por mês?"
- "E se eu quitar o financiamento do carro?"
- "Qual o impacto de trocar de emprego com renda 20% menor?"

**Engines:** `simulation-engine.ts` (6 tipos), `forecast-engine.ts`

**Formato de resposta:** Simulation Card com parâmetros ajustáveis + diff antes/depois.

### Papel 5 — GUIA

**Função:** Orientar o usuário para módulos, ações e recursos.

**Exemplos:**
- "Quero organizar minhas finanças." → sugere Planejamento, Importações
- "Como começar a investir?" → sugere Academia, Investimentos
- "Preciso declarar imposto." → sugere Imposto de Renda, Importações

**Engines:** `optimizer.ts` (oportunidades), lógica de roteamento

**Formato de resposta:** Module Card com deep link para o módulo correspondente.

### Papel 6 — OBSERVADORA (Papel Secundário)

**Função:** Identificar mudanças relevantes sem o usuário perguntar.

**Quando atua:**
- Na Home: via Domus Insight (até 1 insight, posição fixa, homologado)
- Na tela Domus (estado inicial): 1 insight principal + sugestões contextuais

**Quando NÃO atua:**
- Durante uma conversa ativa (não interrompe)
- Quando não há mudança significativa (silêncio é comportamento válido)
- Se o insight já foi mostrado na Home (não repetir)

**Regra de ouro:** A Domus Observadora usa o `financial-ai-engine.ts` (rule-based) para identificar alertas. Ela NÃO chama o LLM proativamente (custo, latência). Apenas exibe insights já computados.

---

## 5. HOME DOMUS INSIGHT VS DOMUS FULL

| Dimensão | Home Insight | Domus Full (Bottom Nav) |
|----------|-------------|------------------------|
| **Posição** | Camada fixa na Home (entre FI e Priority) | Tela dedicada (Bottom Nav slot 3) |
| **Quantidade** | 0-1 insight | Conversa completa |
| **Iniciativa** | Passiva (Domus fala se tem algo relevante) | Ativa (usuário pergunta) |
| **Profundidade** | Superfície: título + descrição + [Entender] CTA | Completa: análise, simulação, ações |
| **Formato** | Insight Card compacto | Mix de texto + cards + simulações |
| **Contexto** | Contexto global (PF/Família/PJ atual) | Contexto global + módulo de origem (se aplicável) |
| **Interação** | Apenas leitura + toque para expandir | Conversa bidirecional |
| **Silêncio** | Sim (colapsa se nada relevante) | Não (sempre disponível como destino) |

### Contrato Home → Domus

Quando o usuário toca [Entender] no Insight da Home:

1. Navega para a tela Domus
2. A Domus carrega com o insight expandido em detalhes
3. Abaixo do insight expandido: input pronto para follow-up
4. Contexto: "Pessoal · Home Insight"
5. A Domus NÃO repete o insight como mensagem de boas-vindas — ela já está no contexto da conversa

---

## 6. ENTRADAS PARA A DOMUS

| # | Entrada | Contexto recebido | Comportamento |
|---|---------|-------------------|---------------|
| A | **Bottom Nav (slot 3)** | Contexto financeiro global (PF/Família/PJ atual). Sem módulo de origem. | Abre estado inicial: insight principal + sugestões contextuais + input. |
| B | **Home Insight → [Entender]** | Contexto global + insight específico. | Abre com insight expandido + input para follow-up. |
| C | **Priority Action → [Revisar]** | Contexto global + ação prioritária. | Abre com ação explicada + opções. Se a ação for melhor resolvida no módulo, sugere navegação. |
| D | **Dentro de módulo → Domus (futuro)** | Módulo de origem + contexto. Ex: Investimentos. | Abre com contexto "Investimentos". Sugestões contextualizadas. |
| E | **Deep link gerado pela Domus** | Destino específico. Ex: "Ver análise" em recomendação. | Abre Domus com o tópico já em contexto. |
| F | **Notificação (futuro)** | Tópico da notificação. | Abre Domus com análise correspondente. |

---

## 7. ESTADO INICIAL DA DOMUS (Primeira Tela)

**Decisão: Opção D — Resumo + Insight + Sugestões + Input (híbrido contextual)**

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│  Domus                                        [ 👤 avatar   ]│ ← Header (48px)
│  Pessoal                                                      │ ← Contexto sutil
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Insight Principal (se existir)
│  │ ◈  Sua reserva cobre 2,3 dos 6 meses                     ││
│  │     recomendados. Mantendo o ritmo atual,                 ││
│  │     você completa em 8 meses.                             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Sugestões                                                    │ ← Seção de chips
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Como foi meu mês?                                        ││ ← Chip de sugestão
│  │ Onde estou gastando mais?                                ││
│  │ Como melhorar meu índice?                                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← espaço flexível →                                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                      ││ ← Input fixo no bottom
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Elementos do estado inicial:**

| Elemento | Descrição |
|----------|-----------|
| Header | "Domus" + avatar (abre Context Sheet) |
| Contexto | Indicador sutil do contexto atual (ex: "Pessoal") |
| Insight | 0-1 insight principal. Usa dados do `financial-ai-engine.ts`. Se nada relevante, não aparece. |
| Sugestões | 3 chips contextuais. Variam por contexto (PF, PJ, Família) e por dados disponíveis. |
| Input | Fixo no bottom, sempre visível. Placeholder: "Pergunte sobre suas finanças..." |

**Por que esta arquitetura e não outras:**

| Alternativa | Problema |
|-------------|----------|
| A — Chat vazio | Desperdiça dados que a Domus já possui |
| B — Última conversa | Confunde. Contexto pode ter mudado. Dados estão desatualizados. |
| C — Dashboard de métricas | Duplica a Home. Conflito de propósito. |
| E — Histórico de conversas | Complexo. Domus não é mensageiro. |

---

## 8. SUGESTÕES CONTEXTUAIS

As sugestões mudam conforme o contexto financeiro e disponibilidade de dados.

### PF (Pessoal)

```
Como foi meu mês?
Onde estou gastando mais?
Como melhorar meu índice?
```

### Família

```
Como estão nossos gastos?
Quanto conseguimos poupar?
Nossa reserva está no caminho certo?
```

### PJ (Empresa)

```
Como está o caixa da empresa?
Minha margem melhorou?
Quais obrigações fiscais estão próximas?
```

### Sem dados (primeiro acesso)

```
O que é o Freedom Index?
Como o FinDomus me ajuda?
Por onde começar?
```

**Limite: 3 sugestões.** Máximo de 3 chips visíveis. Rotacionar se houver mais possibilidades. Evitar poluição visual.

---

## 9. ANATOMIA DA CONVERSA

**Decisão: Opção D — Híbrido (texto + cards conversacionais)**

A Domus não usa apenas bolhas de chat. Ela alterna entre texto e cards estruturados conforme o tipo de resposta.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────────────────────────┐                    │ ← Bolha do usuário
│  │ Você                         agora  │                    │
│  │ Posso comprar um carro              │                    │
│  │ de R$ 80.000?                       │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Resposta Domus (texto)
│  │ ◈ Domus                                                  ││
│  │                                                          ││
│  │ Você tem R$ 52.000 disponíveis em conta.                 ││
│  │ Comprar à vista reduziria sua reserva de                 ││
│  │ emergência de 4,2 para 2,1 meses.                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Comparison Card
│  │               À vista         Financiado                  ││
│  │               ───────         ──────────                  ││
│  │ Entrada       R$ 80.000       R$ 32.000                   ││
│  │ Parcelas      —               48x R$ 1.420                ││
│  │ Custo total   R$ 80.000       R$ 100.160                  ││
│  │ Reserva após  2,1 meses       5,8 meses                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Action Card
│  │ 💡  O financiamento preserva sua reserva                  ││
│  │      mas custa R$ 20.160 a mais.                          ││
│  │                                                          ││
│  │      [Simular com outros valores]                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Input
│  │ ⌨️  Pergunte sobre suas finanças...                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. TAXONOMIA DE CARDS DA DOMUS

| # | Card | Função | Quando usar |
|---|------|--------|-------------|
| 1 | **Text Response** | Resposta textual da Domus | Toda resposta começa com texto |
| 2 | **Insight Card** | Observação/alerta sobre dados | Estado inicial, alertas proativos |
| 3 | **Metric Card** | Número com contexto mínimo | "Quanto gastei?" → valor + tendência |
| 4 | **Comparison Card** | Comparação lado a lado | Decisões financeiras (à vista vs financiado) |
| 5 | **Simulation Card** | Resultado de simulação com diff | Perguntas com "e se" |
| 6 | **Explanation Card** | Explicação de conceito ou cálculo | "Por que meu índice caiu?" |
| 7 | **Action Card** | Recomendação com CTA | "Reduza assinaturas" → [Ver assinaturas] |
| 8 | **Module Card** | Deep link para módulo | "Invista melhor" → [Ver investimentos] |

**Regras:**
- Text Response é obrigatório. Cards são opcionais e complementam.
- Máximo 1 Comparison ou Simulation Card por resposta.
- Máximo 1 Action Card por resposta (ação principal).
- Máximo 1 Module Card por resposta.
- Explanation Card pode conter collapsible "Ver dados considerados".
- A ordem é: Text → Supporting Cards → Action.

---

## 11. CONTEXTO DA CONVERSA

### 11.1 Dimensões de contexto

| Dimensão | Exemplo | Persiste? |
|----------|---------|:---------:|
| `financialContext` | PF, Família, Empresa A | ✅ Sim (global) |
| `moduleContext` | Investimentos, Planejamento | ✅ Sim (origem) |
| `entityContext` | Conta "Itaú PF", Meta "Reserva" | 🔄 Durante a sessão |
| `timeContext` | Último mês, últimos 12 meses | 🔄 Durante a sessão |
| `conversationContext` | Thread ID, últimas mensagens | 🔄 Durante a sessão |
| `simulationContext` | Parâmetros da última simulação | 🔄 Durante a sessão |

### 11.2 Indicador de contexto (visível ao usuário)

O header da Domus mostra contexto de forma sutil:

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │ ← Contexto financeiro
│  [Investimentos] (se veio de módulo)                          │ ← Opcional, origem
└──────────────────────────────────────────────────────────────┘
```

**Decisão:** Mostrar apenas o contexto financeiro no header. O módulo de origem aparece como chip/tag opcional abaixo. Evitar poluir o header.

### 11.3 Troca de contexto durante conversa

**Decisão: Opção B — Separar histórico por contexto.**

Se o usuário está em "Pessoal" e troca para "Empresa A":
1. A conversa atual (PF) é salva no histórico de PF
2. A Domus carrega o estado inicial de PJ (nova sessão)
3. Se havia conversa anterior em PJ, restaura a última (continuidade)
4. NUNCA misturar dados PF em contexto PJ

**Não usar Opção A (nova conversa automática sem preservar):** perderia continuidade.
**Não usar Opção C (manter thread com boundary):** complexo, confunde o modelo.

---

## 12. HISTÓRICO

**Decisão: Opção D — Histórico contextual por PF/Família/PJ, sem expor threads como lista de chats.**

| Aspecto | Decisão |
|---------|---------|
| Armazenamento | Firestore: `domus_threads/{userId}_{context}` |
| Estrutura | Array de mensagens + metadata (createdAt, context, summary) |
| Exposição ao usuário | NÃO como lista de "conversas". Acesso via continuidade. |
| Limpeza | Threads expiram após 30 dias de inatividade |
| Privacidade | Threads PF nunca visíveis em PJ e vice-versa |

**Por que não lista de threads (estilo ChatGPT):**
1. FinDomus não é app de mensagens
2. Lista de conversas pressiona o usuário a "gerenciar chats"
3. A continuidade contextual é mais natural: "Continuar análise do carro" vs "Chat #7"

---

## 13. CONTINUIDADE

Quando o usuário abre a Domus e existe uma conversa relevante:

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                        [ 👤 avatar   ]│
│  Pessoal                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Continuity Card
│  │ ↩  Você estava analisando a compra de um carro.          ││
│  │     Continuar de onde parou?                              ││
│  │                                                          ││
│  │     [Continuar]    [Começar novo]                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈  Sua reserva cobre 2,3 dos 6 meses...                 ││ ← Insight
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Sugestões                                                    │
│  [Como foi meu mês?] [Onde estou gastando mais?] ...         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Pergunte sobre suas finanças...                      ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Regras de continuidade:**
- Aparece apenas se: thread tem ≤24h OU foi a última interação do usuário
- Se o usuário escolhe "Começar novo", a thread anterior é arquivada
- Máximo 1 Continuity Card visível

---

## 14. NÍVEIS DE AUTONOMIA

| Nível | Descrição | Domus v1 |
|:-----:|-----------|:--------:|
| 0 | Somente leitura — a Domus apenas informa | ✅ Padrão |
| 1 | Leitura + navegação — a Domus sugere módulos/atalhos | ✅ Permitido |
| 2 | Simulação — a Domus executa simulações e mostra resultados | ✅ Permitido |
| 3 | Preparar ação — a Domus prepara uma ação para confirmação | ⚠️ v1 futuro |
| 4 | Executar — a Domus executa ações diretamente | ❌ Bloqueado |

**Decisão para v1:** Níveis 0-2 são permitidos. Nível 3 (preparar ação como "Criar meta de R$ 20.000") é reservado para versão futura com confirmação explícita do usuário. Nível 4 nunca será implementado sem supervisão humana.

---

## 15. PRINCÍPIO DE SEGURANÇA

1. **Nunca executar operações financeiras sem confirmação explícita.**
2. **Sempre mostrar os dados considerados antes de recomendar.**
3. **Nunca recomendar produtos financeiros específicos** ("Compre ação X").
4. **Nunca afirmar retorno futuro como garantia.**
5. **Sempre indicar limitações dos dados** ("Com os dados que tenho até agora...").
6. **Nunca expor dados de outro contexto.**
7. **Nunca expor o provedor de IA** ("Gemini", "GPT").

---

## 16. TOM DE VOZ E PERSONALIDADE

### Princípios

| Característica | Manifestação |
|----------------|-------------|
| **Calma** | Sem urgência artificial. Sem "⚠️ ALERTA!" em caixa alta. |
| **Clara** | Linguagem direta. Sem jargão financeiro desnecessário. |
| **Precisa** | Números exatos quando disponíveis. "R$ 4.280", não "cerca de 4 mil". |
| **Confiável** | Admite limitações. "Com os dados disponíveis até 28 de julho..." |
| **Respeitosa** | Não infantiliza. Não dá parabéns por ações triviais. |
| **Inteligente** | Conecta informações. "Isso representa 12% da sua renda mensal." |

### Anti-padrões de linguagem

| ❌ Proibido | ✅ Alternativa |
|------------|---------------|
| "Parabéns! 🎉 Você está arrasando!" | "Sua reserva cresceu pelo terceiro mês seguido." |
| "Cuidado! ⚠️ Suas finanças estão um desastre!" | "Suas despesas superaram sua receita em R$ 1.200 este mês. Isso reduziu sua reserva." |
| "Eu acho que você deveria..." | "Com base nos seus dados, você conseguiria..." |
| "Seu dinheiro está parado! 😱" | "R$ 8.500 em conta corrente não estão rendendo. Sua carteira de investimentos tem rentabilidade média de 11,4% ao ano." |
| "Cérebro financeiro pensando..." | "Analisando seus dados..." |

### Emojis

**Política: NUNCA usar emojis.**

A Domus não é informal. Ícones do sistema (Lucide) são suficientes para comunicação visual. Emojis infantilizam a experiência financeira.

### Nomes técnicos

**NUNCA expor:**
- Nomes de arquivos (`kernel.ts`, `freedom-engine.ts`)
- Nomes de provedores (`Gemini`, `Google AI`)
- Termos de engenharia (`cache hit`, `fallback`, `snapshot`)

**SEMPRE traduzir:**
- "financial kernel" → "análise financeira"
- "freedom index" → "Índice de Liberdade Financeira" (nome próprio do produto)
- "DRE" → "seu fluxo de receitas e despesas"
- "snapshot" → "dados mais recentes"

---

## 17. PROGRESSIVE DISCLOSURE

Para respostas complexas, a Domus usa o padrão:

```
1. Resposta principal (1-3 linhas)     ← sempre visível
2. Evidência / dados considerados       ← collapsible "Ver dados"
3. Comparação ou simulação              ← se aplicável
4. Ação recomendada                     ← 1 CTA principal
5. Detalhes adicionais                  ← "Ver análise completa"
```

**Regras:**
- Nunca gerar parede de texto
- Nunca exigir scroll para entender a resposta principal
- "Ver mais" deve ser específico: "Ver cálculo", "Ver composição", "Comparar cenários"

---

## 18. EXPLICABILIDADE

Quando o usuário pergunta "Como você chegou nisso?", a Domus revela:

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Seu Freedom Index de 67 é calculado a partir de 7 pilares:  │
│                                                              │
│  Quitação de dívidas       ▰▰▰▰▰▰▰▰▰▰ 85%  (bom)           │
│  Liberdade de renda        ▰▰▰▰▰▰▱▱▱▱ 62%  (regular)       │
│  Reserva de emergência     ▰▰▰▱▱▱▱▱▱▱ 38%  (atenção)       │
│  Patrimônio líquido        ▰▰▰▰▰▰▰▰▱▱ 75%  (bom)            │
│  Taxa de investimento      ▰▰▰▰▱▱▱▱▱▱ 41%  (regular)        │
│  Renda passiva             ▰▱▱▱▱▱▱▱▱▱ 12%  (iniciante)      │
│  Diversificação            ▰▰▰▰▰▰▰▰▰▱ 90%  (ótimo)           │
│                                                              │
│  O que mais limita seu índice: Reserva de emergência.        │
│                                                              │
│  [Ver como melhorar]                                          │
└──────────────────────────────────────────────────────────────┘
```

**Dados considerados (collapsible):**
```
Dados considerados nesta análise:                              ▾
• Contas: 3 (saldo total: R$ 12.450)
• Investimentos: 5 ativos (valor total: R$ 42.800)
• Dívidas: 2 ativas (saldo: R$ 8.400)
• Renda (últimos 3 meses): R$ 6.200/mês
• Despesas (último mês): R$ 4.280
• Dados atualizados até: 28 de julho de 2025
```

---

## 19. DATA FRESHNESS

A Domus deve saber e comunicar quando os dados foram atualizados pela última vez.

**Regras:**
- Mostrar freshness apenas quando relevante para a resposta
- Se dados têm >30 dias: incluir nota na resposta
- Se dados têm >60 dias: incluir alerta proativo
- Nunca expor "snapshot version" ou termos técnicos
- Dizer "Seus dados vão até 28 de julho", não "snapshot de 3 dias atrás"

**NÃO mencionar Open Finance, Pluggy, ou mecanismos de sincronização.**

---

## 20. DADOS INSUFICIENTES

### Cenário: Poucos dados

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Sobre sua pergunta "Quanto posso investir?":                │
│                                                              │
│  Com apenas 12 dias de transações registradas,               │
│  ainda não tenho um padrão confiável de receitas             │
│  e despesas para estimar sua capacidade mensal.              │
│                                                              │
│  Para uma análise mais precisa, importe pelo                 │
│  menos 3 meses de extratos.                                  │
│                                                              │
│  [Importar extratos]                                          │
└──────────────────────────────────────────────────────────────┘
```

### Cenário: Nenhum dado (primeiro acesso)

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Por enquanto, não tenho dados financeiros para              │
│  analisar no seu contexto Pessoal.                           │
│                                                              │
│  Posso te ajudar a:                                          │
│  • Explicar como o FinDomus funciona                         │
│  • Entender o Freedom Index                                  │
│  • Guiar seus primeiros passos                               │
│                                                              │
│  [Começar — importar extrato]                                 │
│                                                              │
│  [O que é o Freedom Index?]                                   │
│  [Como o FinDomus me ajuda?]                                  │
│  [Por onde começar?]                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 21. STATES

### 21.1 Loading States

| Duração | Estado | Comportamento |
|---------|--------|---------------|
| <1s (cache hit) | Invisível | Resposta instantânea |
| 1-3s (snapshot) | "Analisando..." | Texto sutil no lugar da resposta |
| 3-8s (kernel) | "Calculando seu cenário..." | Indicador de progresso |
| >8s (fallback) | "Isso está demorando mais que o esperado..." | Mensagem + opção de cancelar |

**NUNCA usar:**
- "Cérebro financeiro pensando..." (antropomorfização proibida)
- Spinner infinito sem contexto
- "Consultando a IA..." (exposição de implementação)

### 21.2 Erro

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Não foi possível processar sua pergunta neste               │
│  momento. Isso pode ser uma instabilidade temporária.        │
│                                                              │
│  Suas informações financeiras não foram afetadas.            │
│                                                              │
│  [Tentar novamente]                                           │
└──────────────────────────────────────────────────────────────┘
```

**Regras:**
- Nunca expor `error.message` técnico
- Nunca expor stack trace
- Sempre tranquilizar: "Suas informações financeiras não foram afetadas"
- Oferecer ação: "Tentar novamente"

### 21.3 Rate Limit

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Você atingiu o limite de consultas deste mês.               │
│  Seu limite será renovado em 1 de agosto.                    │
│                                                              │
│  Enquanto isso, você pode:                                   │
│  • Explorar seus módulos e relatórios                        │
│  • Ver os insights já calculados                             │
│                                                              │
│  [Ver módulos]    [Ver planejamento]                          │
└──────────────────────────────────────────────────────────────┘
```

**Regras:**
- Sempre informar quando renova
- Oferecer alternativas (módulos, relatórios)
- Nunca fazer upsell agressivo no momento do bloqueio
- O plano e upgrade são tratados em Perfil → Planos

### 21.4 Offline

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  A Domus precisa de conexão para analisar seus               │
│  dados e responder perguntas.                                │
│                                                              │
│  Você ainda pode:                                            │
│  • Navegar pelos módulos com dados cacheados                 │
│  • Ver a Home com seu último índice                          │
│                                                              │
│  [Ir para o Início]                                           │
└──────────────────────────────────────────────────────────────┘
```

Bottom Nav permanece 100% funcional. Domus mostra estado offline mas não bloqueia navegação.

### 21.5 Privacidade (valores ocultos)

Quando o modo privacidade está ativo (já existe `VisibilityProvider`):

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Seus gastos com alimentação representam                     │
│  ••••% da sua renda mensal.                                  │
│                                                              │
│  Para ver os valores, desative o modo                        │
│  privacidade no início.                                      │
└──────────────────────────────────────────────────────────────┘
```

A Domus preserva análises qualitativas mas oculta valores monetários.

---

## 22. STREAMING

**Status atual: NÃO suportado.**

O `financialAdvisorFlow` usa `ai.generate()` (não `generateStream()`). Respostas chegam completas após processamento total.

**Recomendação:** Implementar streaming como capacidade futura (DOMUS-P2). O streaming melhoraria significativamente a percepção de velocidade, especialmente em respostas analíticas. Porém NÃO é bloqueador para v1.

---

## 23. KEYBOARD BEHAVIOR

Quando o teclado abre (input focado):

- Bottom Nav reduz para modo compacto (54px, apenas ícones, sem labels) — conforme Navigation Wireframe
- Área de conversa ajusta para espaço entre header e input
- Scroll preserva posição (últimas mensagens visíveis)
- Ao fechar teclado, Bottom Nav restaura altura normal

**Sem change request necessário** — o Navigation Wireframe já prevê este comportamento.

---

## 24. DOMUS → MÓDULO → VOLTAR

Fluxo:

```
Domus
↓ toca [Ver investimentos]
↓ Investimentos (Bottom Nav: Domus ativo)
↓ Header: ← Domus
↓ analisa...
↓ toca ← Domus
↓ Domus restaurada (último estado visível)
```

**Preservação de estado:**
- A conversa na Domus é preservada em estado local (React state)
- Ao navegar para módulo e voltar, a Domus restaura scroll e mensagens
- Se o app for fechado e reaberto, a Domus carrega último estado da thread (Firestore)

---

## 25. DOMUS + PRIORITY ACTION

Quando a Home mostra Priority Action e o usuário toca:

| Tipo de Priority | Roteamento |
|------------------|------------|
| Ação resolvível em módulo específico | Abre o módulo diretamente (ex: "Completar reserva" → Planejamento) |
| Ação que precisa de análise | Abre Domus com contexto da ação (ex: "Revisar gastos" → Domus) |
| Ação que precisa de importação | Abre Importações (ex: "Importar extrato" → Importações) |

**Heurística:** Se a ação é "fazer algo" → módulo. Se a ação é "entender algo" → Domus.

---

## 26. DOMUS + ACADEMIA

Se o usuário pergunta algo que tem conteúdo educacional relevante:

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  ...resposta principal sobre reserva de emergência...        │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Module Card
│  │ 📚  Academia                                              ││
│  │     Aula: Reserva de Emergência                           ││
│  │     4 minutos • Aula 3 de 8                               ││
│  │                                                          ││
│  │     [Ver aula]                                            ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Regras:**
- Aparece APENAS após a resposta principal (não interrompe)
- Máximo 1 Module Card de Academia por resposta
- Não fazer upsell: "Assine o Premium para acessar" — isso é tratado no módulo Academia, não na Domus

---

## 27. DOMUS + CONTEXTOS

### PF (Pessoal)

Linguagem: "Você", "seu", "sua".
Dados disponíveis: todos os motores PF.

### Família

Linguagem: "Vocês", "sua família", "o grupo".
Dados disponíveis: agregados do household. Membros múltiplos.
Cuidado: permissões precisam ser respeitadas (owner vs member).

### PJ (Empresa)

Linguagem: "A empresa", "seu negócio", não "você".
Dados disponíveis: DRE PJ, contas PJ, fiscal, fluxo de caixa empresarial.
NÃO antropomorfizar: "A empresa está saudável", não "Você está indo bem".

### Multiempresa

Cada empresa é um contexto isolado. Ao trocar, a conversa é separada. Nenhum dado vaza entre empresas.

---

## 28. PERGUNTAS FORA DO ESCOPO

Quando o usuário pergunta algo não-financeiro:

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Meu foco é ajudar com sua vida financeira.                  │
│                                                              │
│  Posso te ajudar com:                                        │
│  • Análise de gastos e receitas                               │
│  • Planejamento financeiro                                    │
│  • Simulações e projeções                                     │
│  • Entender seu Freedom Index                                 │
│  • Encontrar módulos e recursos                               │
│                                                              │
│  No que mais posso ajudar?                                    │
└──────────────────────────────────────────────────────────────┘
```

**Proteção no prompt:** O system prompt deve incluir instrução explícita para recusar perguntas não-financeiras com educação.

---

## 29. PERGUNTAS EMOCIONAIS

```
Usuário: "Estou desesperado com minhas dívidas."
```

A Domus NÃO é terapeuta. Ela responde com dados e caminhos:

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Entendi. Vamos olhar para seus números com calma.           │
│                                                              │
│  Você tem 2 dívidas ativas:                                  │
│  • Cartão de crédito: R$ 4.200 (juros de 12% ao mês)        │
│  • Financiamento do carro: R$ 18.400 (24 parcelas restantes) │
│                                                              │
│  Se você priorizar o cartão (juros mais altos) e             │
│  direcionar R$ 800/mês, ele estará quitado em 6 meses.       │
│                                                              │
│  Isso liberaria R$ 800/mês para acelerar o financiamento.    │
│                                                              │
│  [Simular plano de quitação]                                  │
└──────────────────────────────────────────────────────────────┘
```

**Regras:**
- Validar o sentimento sem dramatizar ("Entendi", "Vamos olhar")
- Não fazer terapia ("Você não está sozinho", "Isso deve ser difícil")
- Focar em dados e caminhos acionáveis
- Tom calmo, sem urgência

---

## 30. CONSELHO FINANCEIRO ARRISCADO

```
Usuário: "Devo colocar todo meu dinheiro em Bitcoin?"
```

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Não posso recomendar concentrar todos os seus               │
│  recursos em um único ativo, especialmente um de              │
│  alta volatilidade.                                          │
│                                                              │
│  Sua carteira atual já tem diversificação moderada.          │
│  Se você quer explorar criptomoedas, o mais seguro           │
│  é limitar a um percentual pequeno do seu patrimônio.        │
│                                                              │
│  [Entender diversificação]    [Ver minha carteira]            │
└──────────────────────────────────────────────────────────────┘
```

**Regras de proteção:**
- Nunca recomendar produtos específicos
- Nunca recomendar concentração de risco
- Sempre contextualizar com os dados reais do usuário
- Oferecer educação em vez de proibição

---

## 31. AMBIGUIDADE

```
Usuário: "Quanto eu tenho?"
```

A Domus resolve ambiguidade estruturalmente:

```
┌──────────────────────────────────────────────────────────────┐
│  ◈ Domus                                                     │
│                                                              │
│  Aqui está um resumo do seu patrimônio:                      │
│                                                              │
│  💳 Contas                     R$ 12.450                     │
│  📈 Investimentos              R$ 42.800                     │
│  🛡️ Dívidas                   -R$ 8.400                      │
│  ─────────────────────────────────────                       │
│  💰 Patrimônio líquido         R$ 46.850                     │
│                                                              │
│  [Ver detalhamento]                                           │
└──────────────────────────────────────────────────────────────┘
```

**Heurística:** Quando a pergunta é ambígua, mostrar uma resposta estruturada com múltiplas dimensões em vez de adivinhar ou perguntar "qual você quer?".

---

## 32. COMPLEXITY BUDGET

| Limite | Valor | Justificativa |
|--------|:-----:|---------------|
| Sugestões iniciais | **3** | Suficiente para orientar sem poluir |
| Ação principal por resposta | **1** | FDL: ≤1 CTA primário |
| Ação secundária por resposta | **0-1** | Opcional, navegação ou explicação |
| Cards visíveis por resposta | **≤3** (texto + 2 cards) | Evitar overload visual |
| Comparison/Simulation por resposta | **1** | Máximo 1 card complexo |
| Blocos antes de progressive disclosure | **3** | Resumo + evidência + ação |
| Linhas de texto sem quebra | **4** | Mobile: evitar parede de texto |
| Threads ativas por contexto | **1** | Uma conversa ativa por vez |
| Continuity Cards visíveis | **0-1** | Apenas se relevante |
| Tempo máximo de resposta sem indicação | **1s** | Abaixo disso, resposta instantânea |

---

## 33. DOMUS ARCHITECTURE CONTRACT v1

### Identity
```
Papel:         Camada de inteligência financeira do FinDomus
Personalidade: Calma, clara, precisa, confiável, respeitosa
Limites:       Apenas domínio financeiro. Sem terapia, sem entretenimento.
Emojis:        NUNCA.
Provedor:      NUNCA expor (Gemini, GPT, etc.).
Avatar:        Sem rosto, sem humanoide. Ícone do sistema (Lucide).
```

### Entry
```
Bottom Nav:      Estado inicial com insight + sugestões
Home Insight:    Insight expandido + input para follow-up
Priority:        Ação explicada + opções
Módulo (futuro): Contexto do módulo + sugestões contextualizadas
Deep Link:       Tópico específico em contexto
Notificação:     Análise correspondente (futuro)
```

### Context
```
financialContext:    PF | Família | PJ (global, persistente)
moduleContext:       Módulo de origem (se aplicável)
entityContext:       Conta, meta, investimento específico (durante sessão)
timeContext:         Período de análise (durante sessão)
conversationContext: Thread ID, histórico recente (durante sessão)
```

### Conversation
```
Session:       Thread única por contexto (1 ativa por vez)
History:       Firestore. Separado por contexto. Expira 30d inatividade.
Continuity:    Card opcional se thread ≤24h ou última interação.
Boundary:      Troca de contexto = nova sessão. Dados nunca se misturam.
```

### Response
```
Simple:        Texto + 0-1 Metric Card
Analytical:    Texto + Explanation Card + 0-1 Action Card
Simulation:    Texto + Simulation Card + Comparison Card + 0-1 Action Card
Comparison:    Texto + Comparison Card + 0-1 Action Card
Guiding:       Texto + Module Card
Progressive:   Principal → Evidência (collapsible) → Ação → Detalhes (collapsible)
```

### Cards
```
1. Text Response      — obrigatório em toda resposta
2. Insight Card       — estado inicial, alertas proativos
3. Metric Card        — número + contexto + tendência
4. Comparison Card    — lado a lado (decisões)
5. Simulation Card    — diff antes/depois com parâmetros
6. Explanation Card   — breakdown de cálculo
7. Action Card        — recomendação com CTA
8. Module Card        — deep link para módulo
```

### Actions
```
Read:        ✅ Padrão. Informar, analisar, explicar.
Navigate:    ✅ Module Card → deep link para módulo.
Simulate:    ✅ Simulation Card com parâmetros do engine real.
Prepare:     ⚠️ Futuro. Requer confirmação explícita.
Execute:     ❌ Bloqueado. Nunca sem supervisão humana.
```

### Safety
```
Confirmation:      Nunca executar ação financeira sem confirmar
Insufficient data: Admitir limitação + orientar importação
Freshness:         Indicar data dos dados quando >30 dias
Financial advice:  Nunca recomendar produtos específicos
Permissions:       Respeitar permissões do contexto (Família: owner vs member)
Offline:           Informar indisponibilidade + alternativas
```

### Navigation
```
Domus → Módulo:    Module Card → navega. Bottom Nav: Domus ativo. Header: ← Domus.
Módulo → Domus:    Bottom Nav slot 3. Contexto preservado.
Back:              Voltar para Domus preserva estado da conversa.
State restoration: React state (sessão) + Firestore (entre sessões).
```

### States
```
Empty (sem dados):        Orientação + sugestões para começar
Loading (<1s):            Invisível
Loading (1-3s):           "Analisando..."
Loading (3-8s):           "Calculando seu cenário..."
Loading (>8s):            "Isso está demorando..." + cancelar
Offline:                  Indisponível + alternativas de navegação
Error:                    Mensagem genérica + "Tentar novamente"
Rate limit:               Limite atingido + data de renovação + alternativas
Privacy:                  Valores ocultos, análises qualitativas preservadas
```

---

## 34. TESTES DE VALIDAÇÃO

### 34.1 Teste 5 Segundos

Usuário abre Domus pela primeira vez. Em 5 segundos percebe:
1. "Domus" no header — sei onde estou ✅
2. "Pessoal" — sei sobre qual contexto estou falando ✅
3. Insight ou sugestões — sei o que posso perguntar ✅
4. Input visível — sei como interagir ✅

### 34.2 Pergunta Simples

```
"Quanto gastei este mês?"
→ Resposta: R$ 4.280. 12% abaixo do mês passado. [Ver detalhes]
→ Compreensível em <3 segundos. ✅
```

### 34.3 Diagnóstico

```
"Por que meu Freedom Index caiu?"
→ Breakdown dos 7 pilares + pilar que mais caiu + ação sugerida.
→ Explicação causal, não apenas número. ✅
```

### 34.4 Decisão

```
"Posso comprar um carro de R$ 80.000?"
→ Análise de reserva + comparação à vista vs financiado + simulação.
→ Dados reais do kernel. Sem opinião pessoal. ✅
```

### 34.5 Simulação

```
"E se eu investir R$ 1.000 por mês?"
→ Simulation Card com diff: Freedom Index +2pts, patrimônio +R$ 12.000/ano.
→ Usa simulation-engine.ts real. ✅
```

### 34.6 Planejamento

```
"Quero juntar R$ 30.000 até dezembro."
→ Análise de capacidade mensal + cenário de aportes + Module Card para Planejamento.
→ Exequível com dados reais. ✅
```

### 34.7 Dívidas

```
"Qual dívida devo priorizar?"
→ Ordenação por juros/impacto + simulação de quitação.
→ Linguagem: "priorizar", não "recomendo". ✅
```

### 34.8 PJ

```
"Como está o caixa da empresa?"
→ DRE PJ: receita, despesas, lucro. Comparação com mês anterior.
→ Linguagem empresarial, não pessoal. ✅
```

### 34.9 Família

```
"Quanto nossa família gastou com alimentação?"
→ Dados agregados do household. ✅
→ Precisa respeitar permissões (owner vs member). Validar implementação futura. ⚠️
```

### 34.10 Dados Parciais

```
"Quanto posso investir?" (com 10 dias de dados)
→ "Ainda não tenho histórico suficiente..." + orientação para importar. ✅
```

### 34.11 Sem Dados

```
Primeiro acesso. Domus mostra orientação + sugestões + [Começar].
→ Não finge que tem dados. Não mostra "0". ✅
```

### 34.12 Privacidade

```
Valores ocultos. "Quanto gastei?" → "Seus gastos com alimentação representam ••••%."
→ Preserva análise qualitativa. ✅
```

### 34.13 Offline

```
Domus: "Preciso de conexão..." + [Ir para Início].
→ Bottom Nav funcional. ✅
```

### 34.14 Rate Limit

```
Domus: "Limite atingido..." + data renovação + [Ver módulos].
→ Sem pânico. Sem upsell agressivo. ✅
```

### 34.15 Troca de Contexto

```
PF → PJ durante conversa. Conversa PF salva. PJ carrega nova (ou última).
→ Dados nunca se misturam. ✅
```

### 34.16 Deep Link

```
Home Insight "Reserva baixa" → Domus expandido → follow-up → [Ver planejamento] → ← Domus.
→ Estado preservado. Fluxo completo. ✅
```

### 34.17 Usuário Leigo

```
"Meu dinheiro está bom?"
→ Resumo estruturado: patrimônio + reserva + dívidas + tendência.
→ Sem jargão. Sem julgamento. ✅
```

### 34.18 Power User

```
"Compare minha taxa de acumulação dos últimos seis meses."
→ Dados do DRE engine. Série temporal.
→ Precisão técnica sem complexidade visual. ✅
```

### 34.19 Ambiguidade

```
"Quanto eu tenho?" → Resumo estruturado com múltiplas dimensões.
→ Sem adivinhar. Sem perguntar "qual você quer?". ✅
```

### 34.20 Fora do Escopo

```
"Quem ganhou o jogo ontem?" → "Meu foco é ajudar com sua vida financeira."
→ Educado, claro, redireciona. ✅
```

### 34.21 Conselho Arriscado

```
"Devo colocar tudo em Bitcoin?" → "Não posso recomendar concentrar..."
→ Proteção + educação. ✅
```

### 34.22 Pressão Emocional

```
"Estou desesperado com minhas dívidas." → Dados + caminhos. Sem terapia.
→ Calmo, focado, acionável. ✅
```

### 34.23 20 Módulos

Domus consegue sugerir navegação para qualquer módulo via Module Card sem conhecer a UI manualmente — usa o mapeamento de rotas do sistema. ✅

### 34.24 100 Módulos

Mesmo mecanismo. Module Card referencia rota. Sistema de rotas escala independentemente. ✅

---

## 35. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**DOMUS-P0: 0 · DOMUS-P1: 0 · DOMUS-P2: 2 · DOMUS-P3: 3**

### DOMUS-P2 (melhorias recomendadas para v1)

| ID | Descrição |
|----|-----------|
| P2-01 | Streaming de respostas (`generateStream`) não implementado. Usar `ai.generate()` no v1. |
| P2-02 | Simulações atuais usam keyword matching. Evoluir para detecção semântica de intenção de simulação. |

### DOMUS-P3 (editoriais / futuros)

| ID | Descrição |
|----|-----------|
| P3-01 | AI Chat Widget atual (desktop) precisa ser substituído pela Domus Mobile. O widget atual viola múltiplas regras FDL (FAB, badge Gemini, emoji de robô, "cérebro financeiro"). |
| P3-02 | Suporte a Domus multimodal (análise de imagem de nota fiscal, PDF). |
| P3-03 | Voz (speech-to-text) para perguntas. |

---

## 36. CHANGE REQUESTS

### Navigation Change Request

**Nenhum.** O Navigation Wireframe homologado (Bottom Nav presente na Domus, modo compacto com teclado) é compatível com esta arquitetura.

### FDL Change Request

**Nenhum.** O FDL 1.0 FROZEN já fornece todos os tokens necessários (tipografia, cores, spacing, cards).

### Architecture Change Request

**Nenhum.** A Home Architecture v1 (Domus Insight como camada de 0-1 insight) é compatível com a Domus Full como destino global. São papéis complementares, não conflitantes.

---

## 37. RECOMENDAÇÃO FINAL

A Domus Mobile está pronta para ser projetada como destino global de inteligência financeira. A base técnica existente (kernel com 7 engines, snapshots, Genkit + Gemini 2.5 Flash, rate limiting) é sólida e cobre a maioria das capacidades necessárias.

**Próximos passos técnicos (NÃO agora):**
1. Evoluir `financialAdvisorFlow` com system prompt refinado (tom de voz, limites, contexto PJ/Família)
2. Criar endpoint com suporte a histórico de conversa (thread_id)
3. Adicionar detecção semântica de intenção de simulação (substituir keyword matching)
4. Projetar UI da Domus Mobile com cards estruturados
5. Migrar de `ai.generate()` para `generateStream()` (P2)

**Próxima etapa do projeto:**
Com DOMUS-P0 = 0 e DOMUS-P1 = 0:

→ **DOMUS MOBILE WIREFRAME v1** (desenho das telas da Domus como wireframe)

---

## 38. ARQUIVOS GERADOS

| Arquivo | Conteúdo |
|---------|----------|
| `docs/domus/DOMUS-MOBILE-ARCHITECTURE-v1.md` | Este documento |

---

*FinDomus Domus Mobile Architecture v1 · Fase 6 concluída · Aguardando homologação*
