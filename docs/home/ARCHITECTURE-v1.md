# HOME MOBILE FINDOMUS — ARCHITECTURE v1

**Fase:** 1 — Arquitetura (pré-wireframe)
**FDL:** 1.0 FROZEN
**Baseline funcional:** `bc19adb`

---

## 1. PRINCÍPIO CENTRAL

> A Home não mostra tudo que o FinDomus sabe fazer. Mostra o que o usuário precisa saber agora.

Ela é um centro de controle financeiro, não um dashboard. Sua função é orientar — não listar, não exibir, não impressionar.

A pergunta que governa cada decisão é:

**"Se removermos isto, o usuário perde alguma decisão importante?"**

Se a resposta for não, o elemento não pertence à Home.

---

## 2. FUNÇÃO DA HOME

A Home responde a 4 perguntas, nesta ordem:

```
1. COMO ESTOU?     → Estado financeiro sintetizado
2. O QUE MUDOU?    → Tendência, variação, insight
3. O QUE IMPORTA?  → Prioridade ou atenção necessária
4. O QUE FAÇO?     → Próximo passo acionável
```

Tudo que não serve a uma dessas 4 perguntas é navegação, especialista ou configuração — e pertence a outra superfície.

---

## 3. O QUE A HOME NÃO É

- ❌ Um índice de módulos
- ❌ Um dashboard com KPIs lado a lado
- ❌ Uma coleção de gráficos
- ❌ Um feed de notícias financeiras
- ❌ Um chat com a Domus
- ❌ Uma lista de tarefas
- ❌ Um relatório mensal
- ❌ Uma vitrine de conquistas
- ❌ Uma landing page de produto

---

## 4. HIERARQUIA DE ATENÇÃO

A Home possui 4 níveis de atenção, com um único protagonista.

| Nível | Função | Elemento |
|-------|--------|----------|
| **1 — Dominante** | Como estou? | Freedom Index (síntese do estado) |
| **2 — Interpretação** | O que mudou? | Domus Insight (0-1 insights) |
| **3 — Ação** | O que fazer? | Priority Action Card (0-1 ações) |
| **4 — Exploração** | O que mais? | Módulos relevantes + continuidade |

**Regra de concorrência:** no máximo 1 elemento pedindo atenção em cada nível. Nível 4 pode ter múltiplos elementos, mas nenhum deles compete com os níveis acima.

---

## 5. CAMADAS DEFINITIVAS

```
┌─────────────────────────────────┐
│ CONTEXT BAR                     │  Privacidade · Contexto PF/PJ/Família
├─────────────────────────────────┤
│                                 │
│ FREEDOM INDEX                   │  Estado financeiro sintetizado
│                                 │  Número dominante + nível + tendência
│                                 │
├─────────────────────────────────┤
│ DOMUS                           │  0-1 insight contextual
│                                 │  Silenciosa se nada relevante
├─────────────────────────────────┤
│ PRIORITY ACTION                 │  0-1 ação prioritária
│                                 │  Ausente se tudo está bem
├─────────────────────────────────┤
│ MÓDULOS RELEVANTES              │  3-5 Summary Cards adaptativos
│                                 │
├─────────────────────────────────┤
│ CONTINUIDADE                    │  0-1 atividade em andamento
│                                 │  Ausente se nada ativo
└─────────────────────────────────┘
```

### Justificativa de cada camada

**Context Bar** — O usuário precisa saber em qual contexto está (PF, Família, Empresa X) e ter acesso rápido à privacidade. Sem esta camada, a Home inteira perde referência.

**Freedom Index** — É a única métrica que sintetiza saúde financeira em um número. Patrimônio, saldo e DRE são componentes — o índice é o resultado. Além disso, é o diferencial estratégico do produto. A decisão de torná-lo protagonista é fundamentada: nenhuma outra métrica responde "como estou?" com a mesma abrangência.

**Domus** — É o cérebro do produto. Mas na Home ela não conversa — ela observa. Um insight por vez. Se não há insight relevante, ela se cala. Isso a diferencia de um chatbot e a posiciona como inteligência contextual.

**Priority Action** — Se há algo urgente ou de alto impacto, o usuário precisa ver. Se não há, esta camada some. Isso evita que a Home seja uma lista de tarefas.

**Módulos Relevantes** — Permitem acesso rápido às áreas mais usadas ou mais relevantes no momento. Não são um índice — são um atalho contextual.

**Continuidade** — Respeita a memória do usuário. Se ele estava no meio de algo, a Home lembra. Se não, desaparece.

---

## 6. ABOVE THE FOLD

Estimativa para 375px–430px de altura de viewport (mobile típico: ~600-700px):

| Elemento | Altura estimada | Acumulado |
|----------|----------------|-----------|
| Context Bar | ~48px | 48px |
| Freedom Index | ~160px | 208px |
| Domus Insight (se presente) | ~80px | 288px |
| Priority Action (se presente) | ~120px | 408px |

**Decisão:** Freedom Index SEMPRE visível acima da dobra. Domus e Priority Action visíveis acima da dobra se presentes. Módulos relevantes começam abaixo da dobra — o que é aceitável porque representam exploração, não orientação imediata.

O usuário vê, sem scroll:
1. Em qual contexto está
2. Seu estado financeiro (Freedom Index)
3. Se há algo relevante (Domus + Priority)

---

## 7. FREEDOM INDEX NA HOME

### O que mostrar

```
Nível: Construção
72 pontos
+3 este mês
```

Três elementos, hierarquia clara:
1. **Nível** (label do estágio: "Construção", "Estabilidade" etc.) — `type.caption`, `text.secondary`
2. **Pontuação** (72) — `type.financial-hero` (36px, ExtraBold). O número domina a Home.
3. **Tendência** (+3 este mês) — `type.supporting`, `state.positive` se subiu

### O que NÃO mostrar

- Os 7 pilares (Breakdown) — pertence ao toque/expansão
- Gráfico de evolução — pertence ao detalhe
- Timeline completa — pertence ao módulo Planejamento
- Explicação do cálculo — acessível via "Entenda o índice"

### Comportamento ao toque

Toque no Freedom Index → expande para resumo com 7 pilares + tendência histórica. Não navega para outra tela — é uma expansão inline ou sheet.

### Quando o índice é 0 (sem dados)

Não mostrar 0. Mostrar estado convidativo: "Sua jornada começa aqui" com ação de importar. Isso é tratado no Empty Home (seção 19).

---

## 8. DOMUS NA HOME

### Função

Observar, interpretar e orientar — sem dominar. A Domus na Home é uma presença silenciosa que fala apenas quando tem algo relevante a dizer.

### O que é um bom insight Domus

Um insight válido precisa de 3 componentes:

```
1. OBSERVAÇÃO   →  fato concreto baseado em dados
2. INTERPRETAÇÃO →  por que isso importa
3. ORIENTAÇÃO    →  o que fazer com isso (opcional, pode ser só compreensão)
```

**Exemplo bom:**
> Seu custo fixo caiu 8% este mês. Isso liberou aproximadamente R$ 420 que podem ir para sua reserva.
> [Ver planejamento]

**Exemplo bom:**
> Você está a R$ 680 de completar 3 meses de reserva. Mantendo o ritmo atual, chega lá em 2 semanas.
> [Continuar]

**Exemplo ruim (genérico):**
> Continue acompanhando suas finanças!
> — Não observa nada, não interpreta nada, não orienta nada.

**Exemplo ruim (técnico):**
> Sua taxa de poupança está em 15,3%.
> — Observa, mas não interpreta nem orienta.

### Regras

- **0 ou 1 insight por vez.** Nunca múltiplos.
- **Se não há insight válido, a Domus se cala.** A camada colapsa sem deixar espaço vazio.
- **O insight é descartável.** Não acumula. A cada abertura, um novo (ou nenhum).
- **Nunca genérico.** Se o algoritmo não gerou nada específico, silêncio.
- **Tom:** observação calma, sem urgência artificial, sem "Parabéns!", sem "Cuidado!".

### Comportamento ao toque

Toque no insight → expande para conversa com Domus (Bottom Sheet com contexto daquele insight). Isso permite aprofundar sem sair da Home.

---

## 9. PRIORITY ACTION

### Função

A ação mais importante que o usuário deveria considerar agora. Não é uma lista de tarefas — é o próximo passo de maior impacto.

### Regras

- **0 ou 1 por vez.** Se não há ação urgente, a camada colapsa.
- **Usa o Action Card do FDL.** Nível Raised, borda sutil, um CTA.
- **Prioridade é determinada por:** urgência financeira, impacto no Freedom Index, proximidade de prazo, valor envolvido, risco.

### Exemplos

```
⚠️ Atenção
Sua fatura do cartão aumentou 18% este mês
Impacto: R$ 340 acima da média
[Revisar gastos]
```

```
→ Próximo passo
Completar reserva de emergência
Faltam R$ 680 para 3 meses
[Fazer aporte]
```

### Quando não há ação

Se tudo está saudável, sem urgências, sem metas próximas do prazo — a camada desaparece. A Home fica mais leve. Isso é intencional.

---

## 10. MÓDULOS RELEVANTES

### Função

Acesso rápido às áreas mais relevantes para o usuário naquele momento. Não é um índice dos 20+ módulos — é uma curadoria de 3 a 5.

### Regras

- **Mínimo 3, máximo 5 Summary Cards.**
- **Cada card = 1 módulo.** Não agrupar múltiplos módulos em um card.
- **Formato:** Summary Card do FDL. Interativo (Raised), navega para o módulo.
- **Conteúdo do card:** título do módulo + 1 métrica principal + tendência (se relevante) + 0-1 insight curto.

### Exemplo de Summary Card

```
Investimentos
R$ 42.800
+R$ 1.200 no mês
```

```
Planejamento
3 metas ativas
Reserva: 68%
```

```
Academia
Liberdade Financeira
Aula 4 de 8
```

### Algoritmo de relevância (conceitual)

Os módulos são selecionados por:

| Sinal | Peso | Exemplo |
|-------|------|---------|
| Frequência de uso | Alto | Módulo mais acessado nos últimos 30 dias |
| Mudança significativa | Alto | Carteira variou +5% no mês |
| Meta ativa próxima | Alto | Meta com prazo em < 15 dias |
| Pendência ou alerta | Alto | Fatura alta, conta negativa |
| Continuidade | Médio | Simulação em andamento |
| Contexto (PF/PJ/Família) | Permanente | PJ vê Empresas; Família vê Planejamento |

### Estabilidade

- **Posição dos cards é fixa por sessão.** Não reorganizar a cada refresh.
- **Mudanças de relevância são graduais.** Um módulo não aparece e desaparece em horas.
- **Usuário pode fixar até 2 módulos.** Os demais são recomendados pela Domus.

---

## 11. CONTINUIDADE

### Função

Lembrar o usuário de atividades em andamento. Respeita o contexto interrompido.

### Regras

- **0 ou 1 item de continuidade.**
- **Aparece apenas se há atividade ativa:** simulação não concluída, aula da Academia em progresso, importação interrompida, configuração incompleta.
- **Formato:** compacto, abaixo dos módulos. Não compete visualmente.

### Exemplos

```
Continuar
Planejamento da aposentadoria
Simulação 62% concluída
[Continuar]
```

```
Continuar
Academia — Reserva de Emergência
Aula 4 de 8
[Continuar]
```

---

## 12. ACADEMIA

A Academia é um módulo como qualquer outro. Não possui botão flutuante, não possui destaque permanente.

- Na Home: aparece como Summary Card quando o usuário está no meio de uma trilha.
- Na continuidade: aparece se a última sessão foi interrompida.
- Quando concluída: não aparece — o usuário decide revisitá-la pela navegação.

**Decisão:** remover o botão flutuante da Academia (atualmente no código). Substituir por acesso via navegação + Summary Card contextual.

---

## 13. CONQUISTAS

Conquistas são reconhecimentos pontuais, não elementos permanentes da Home.

- Aparecem como um estado efêmero: "Você completou 6 meses de reserva" → some após ser visto.
- Não usam confete, animação de celebração ou gamificação.
- Podem ser acessadas permanentemente em tela dedicada (navegação).
- Na Home, uma conquista recente aparece como destaque sutil no Freedom Index (ex: mudança de nível).

---

## 14. CONTEXTOS PF / PJ / FAMÍLIA

A Home sempre opera em um contexto explícito. O usuário nunca deve duvidar se está vendo dados pessoais, familiares ou empresariais.

### Decisão: Context Switcher global

Adotamos um Context Switcher como parte da Context Bar, no topo da Home. Ele permite alternar entre:

```
Pessoal
Família
Empresa A
Empresa B
```

### Por que Context Switcher (Alternativa C)

Descartamos:
- **Alternativa A (Home muda de contexto):** confuso. O usuário não sabe "onde está".
- **Alternativa B (Home consolidada):** mistura PF/PJ, risco de confusão de propriedade.
- **Alternativa C (Context Switcher):** claro, explícito, escalável. Cada contexto tem sua própria Home. ✅

### Comportamento

- O contexto ativo é visível no topo.
- A troca de contexto recarrega a Home com os dados daquele contexto.
- O último contexto usado é lembrado entre sessões.
- Dados PF nunca aparecem no contexto PJ e vice-versa.

### Context Switcher visual (conceitual)

```
[◂ Pessoal ▾]              [👁]
```

Compacto. Não domina. À esquerda, próximo ao topo. Toque revela dropdown com opções.

---

## 15. CONTEXT BAR

A Context Bar é a faixa superior da Home. Contém:

| Elemento | Posição | Função |
|----------|---------|--------|
| Context Switcher | Esquerda | PF / Família / Empresa |
| Privacy Toggle | Direita | Mostrar/ocultar valores |
| Notifications (futuro) | Direita | Badge de alertas |

**O que NÃO vai na Context Bar:**
- Logo (a Home não precisa de branding interno — o usuário já sabe onde está)
- Saudação ("Bom dia, Anderson") — removida. Ocupa espaço sem valor funcional
- Foto do perfil — pertence a Configurações ou ao header de navegação global
- Botão de search — pertence à navegação

---

## 16. SAUDAÇÃO

### Decisão: REMOVER

"Bom dia, Anderson" não adiciona valor financeiro. Ocupa ~40-60px no topo da tela mais valiosa do produto. A personalização emocional virá da Domus, não de uma saudação genérica.

Se o usuário precisa de acolhimento, a Domus entrega:
> "Bom dia. Sua reserva cresceu 3% esta semana."

Isso é saudação + valor. Muito superior a "Bom dia, Anderson".

---

## 17. PRIVACIDADE

O toggle de privacidade fica na Context Bar, acessível com um toque.

- **Estado normal:** valores visíveis.
- **Estado privado:** todos os valores financeiros exibidos como `R$ ••••••`.
- **Labels, títulos e contexto NUNCA são ocultados.**
- **O Freedom Index também é ocultado:** `•• pontos` em vez de `72 pontos`.
- **A estrutura da Home não se altera** — apenas os números são mascarados.
- **A preferência não persiste entre sessões** (segurança).

---

## 18. PERSONALIZAÇÃO

### Modelo híbrido: Fixos + Recomendados

| Tipo | Quantidade | Quem decide |
|------|-----------|-------------|
| Fixados pelo usuário | Até 2 módulos | Usuário (em Configurações ou long-press) |
| Recomendados pela Domus | Até 3 módulos | Algoritmo de relevância |
| **Total** | **3-5 módulos** | Combinação |

### Regras

- Módulos fixados sempre aparecem, na ordem definida pelo usuário.
- Módulos recomendados aparecem abaixo dos fixados.
- Se o usuário não fixou nenhum, todos os 3-5 são recomendados.
- O usuário pode remover um recomendado (deslizar → "Não tenho interesse").
- A Domus aprende com a remoção e ajusta recomendações futuras.

---

## 19. ESTABILIDADE VS ADAPTAÇÃO

> **Estrutura permanece. Conteúdo muda.**

| Elemento | Estável? | Adapta? |
|----------|---------|---------|
| Context Bar | ✅ Sempre visível, mesma posição | ✅ Conteúdo do switcher |
| Freedom Index | ✅ Sempre visível, mesma posição | ✅ Pontuação, nível, tendência |
| Domus Insight | ✅ Sempre na mesma posição | ✅ Conteúdo do insight (ou ausente) |
| Priority Action | ✅ Sempre na mesma posição | ✅ Conteúdo da ação (ou ausente) |
| Módulos Relevantes | ✅ Sempre na mesma posição | ✅ Quais módulos, sua ordem |
| Continuidade | ✅ Sempre na mesma posição | ✅ Conteúdo (ou ausente) |

**Regra:** a posição de cada camada nunca muda. O usuário constrói memória espacial. O que está na posição 3 sempre será Priority Action — mesmo que vazio.

---

## 20. ESTADOS DA HOME

### Estado 1: Primeiro Acesso (nunca usou)

```
Context Bar: Pessoal ▾ | 👁

──── EMPTY HOME ────

🌳
Sua jornada de liberdade financeira
começa aqui.

1. Importe seu primeiro extrato
2. Cadastre suas contas
3. Veja seu Freedom Index

[Começar — importar extrato]
```

- Sem Freedom Index (não há dados).
- Sem Domus (não há o que analisar).
- Sem módulos (não há histórico de uso).
- A ação é sempre: importar dados.

### Estado 2: Dados Parciais (tem contas, sem investimentos, sem metas)

- Freedom Index aparece com pontuação parcial (pode ser baixa).
- Domus pode sugerir próximos passos: "Cadastre seus investimentos para ver seu índice completo."
- Priority Action: "Criar primeira meta" ou "Iniciar reserva".
- Módulos: Contas, Planejamento, Importações.

### Estado 3: Normal (dados completos, uso regular)

- Funcionamento padrão conforme arquitetura.

### Estado 4: Atenção (algo requer ação)

- Freedom Index normal.
- Domus: insight sobre o problema.
- Priority Action: ação corretiva.
- Módulos: os mais relevantes + o módulo relacionado ao problema.

### Estado 5: Tudo Saudável (sem prioridades, sem alertas)

- Freedom Index normal.
- Domus: insight positivo ou silenciosa.
- **Sem Priority Action** (camada colapsa).
- Módulos: os mais usados.
- Continuidade: se houver.

### Estado 6: Privacidade Ativada

- Estrutura idêntica. Todos os valores mascarados.
- Freedom Index: `•• pontos`.
- Domus: pode mostrar insight sem valores específicos: "Sua reserva continua crescendo."

### Estado 7: Erro Parcial (ex: falha ao carregar investimentos)

- Freedom Index: mostra última pontuação conhecida com indicador "atualizado em [data]".
- Domus: silenciosa (não pode gerar insight com dados parciais).
- Módulos afetados: indicador de erro sutil no card.
- Nada bloqueia o uso do resto da Home.

### Estado 8: Offline

- última Home cached é exibida.
- Indicador sutil de offline no topo.
- Ações que exigem rede são desabilitadas.
- Nenhum erro agressivo.

---

## 21. COMPLEXITY BUDGET

| Recurso | Máximo | Justificativa |
|---------|--------|---------------|
| Blocos/camadas principais | 6 | Context Bar + FI + Domus + Priority + Módulos + Continuidade |
| Número dominante (financial-hero) | 1 | Apenas o Freedom Index usa 36px |
| CTAs primárias visíveis | 1 | Priority Action. Módulos e Domus usam secondary |
| CTAs totais visíveis | ~6 | 1 primary + até 5 secondary (módulos + Domus) |
| Summary Cards | 5 | Máximo na camada de módulos |
| Alertas simultâneos | 1 | Priority Action já cobre o caso mais urgente |
| Cores com significado | ≤3 | Azul (ação) + verde/âmbar/vermelho (1 por estado) |
| Ícones coloridos | 0 | Ícones usam `text.secondary`. Cor só em estado |
| Gráficos | 0 | Nenhum gráfico na Home |
| Tabelas | 0 | Nenhuma tabela na Home |
| Scroll estimado | ~2.5 viewports | Todo conteúdo essencial em 1 viewport |

---

## 22. MATRIZ DE CLASSIFICAÇÃO DOS MÓDULOS

| Módulo | Home Core | Home Contextual | Navegação | Especialista |
|--------|-----------|-----------------|-----------|-------------|
| Freedom Index | ✅ | — | — | — |
| Domus | ✅ | — | — | — |
| Planejamento | — | ✅ (metas ativas) | — | — |
| Pessoal (PF) | — | ✅ (mês ativo) | — | — |
| Empresas (PJ) | — | ✅ (se contexto PJ) | — | — |
| Contas | — | ✅ (saldo baixo, alerta) | — | — |
| Investimentos | — | ✅ (carteira ativa) | — | — |
| Passivos | — | ✅ (dívida ativa) | — | — |
| Cartões | — | — | ✅ | — |
| Parcelas | — | — | ✅ | — |
| Lançamentos | — | — | ✅ | — |
| Assinaturas | — | — | ✅ | — |
| Importações | — | ✅ (se dados parciais) | ✅ | — |
| Fiscal & Contábil | — | — | ✅ (PJ) | ✅ |
| Relatórios | — | — | — | ✅ |
| Configurações | — | — | ✅ | — |
| Academia | — | ✅ (em progresso) | ✅ | — |
| Metas | — | ✅ (ativas/atrasadas) | — | — |
| Patrimônio | — (integrado ao FI) | — | ✅ | ✅ |
| Fluxo Financeiro | — | — | ✅ | — |
| DRE | — | — | — | ✅ |

**Legenda:**
- **Home Core:** Sempre presente na Home, independente de contexto
- **Home Contextual:** Aparece na Home quando relevante (algoritmo)
- **Navegação:** Acessível via Bottom Navigation ou menu
- **Especialista:** Acessível via módulo ou configuração avançada

---

## 23. MATRIZ POR PERSONA / CONTEXTO

| Área | PF Iniciante | PF Organizado | PF Endividado | Família | PJ | Power User |
|------|-------------|---------------|---------------|---------|-----|-----------|
| Freedom Index | ✅ (parcial) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Domus | ✅ (onboarding) | ✅ | ✅ (foco em dívidas) | ✅ | ✅ (fluxo) | ✅ |
| Planejamento | ✅ | ✅ | ✅ (metas de quitação) | ✅ | — | ✅ |
| Investimentos | — | ✅ | — | ✅ | — | ✅ |
| Contas | ✅ (poucas) | ✅ | ✅ (atenção) | ✅ | ✅ | ✅ |
| Passivos | — | — | ✅ (foco) | — | — | ✅ |
| Empresas | — | — | — | — | ✅ | ✅ |
| Academia | ✅ (iniciante) | ✅ | ✅ | ✅ | — | ✅ |
| Importações | ✅ (destaque) | — | — | — | ✅ | — |

**Regra:** a Home é uma só. Esta matriz informa o algoritmo de relevância, não cria 6 layouts diferentes.

---

## 24. HOME ARCHITECTURE CONTRACT v1

### O que SEMPRE existe

- Context Bar (switcher + privacidade)
- Freedom Index (protagonista, acima da dobra)
- Camada de Módulos Relevantes (posição fixa, 3-5 cards)

### O que PODE existir

- Domus Insight (0-1, posição fixa)
- Priority Action (0-1, posição fixa)
- Continuidade (0-1, posição fixa)

### O que NUNCA existe

- Gráficos de qualquer tipo
- Tabelas
- Lista de transações
- Feed de notícias ou dicas
- Grade de KPIs (3+ cards de métrica)
- Banner de upgrade de plano
- Saudação genérica ("Bom dia, Fulano")
- Botão flutuante (FAB)
- Chat aberto da Domus
- Mais de 1 CTA primário

### O que é ESTÁVEL (posição nunca muda)

- Todas as 6 camadas têm posição fixa na ordem vertical
- A estrutura não se reorganiza entre sessões

### O que é ADAPTATIVO (conteúdo muda)

- Quais módulos aparecem na camada de Módulos Relevantes
- O conteúdo do insight da Domus
- A prioridade da ação
- O estado de cada camada (presente/ausente)

### O que é CONTEXTUAL (depende de PF/PJ/Família)

- Dados do Freedom Index
- Módulos disponíveis no switcher
- Módulos relevantes (PJ não vê Planejamento PF)

### O que pode DESAPARECER

- Domus Insight (se nada relevante)
- Priority Action (se tudo saudável)
- Continuidade (se nada em andamento)
- Módulo específico (se removido pelo usuário ou irrelevante)

### O que NUNCA pode DOMINAR

- Domus (não vira chat na Home)
- Priority Action (não vira lista de tarefas)
- Módulos (não viram dashboard)
- Conquistas (não viram gamificação)
- Academia (não vira FAB)

---

## 25. TESTES DE CENÁRIO

### Cenário A — Novo usuário (sem dados)

| Pergunta | Resposta |
|----------|----------|
| Como estou? | "Sua jornada começa aqui" — sem índice |
| O que mudou? | Nada ainda |
| O que importa? | Começar — importar dados |
| O que faço? | [Importar extrato] |
| 5 segundos? | ✅ Compreende que precisa importar dados |
| Calm? | ✅ Home vazia, mas acolhedora |

### Cenário B — PF organizado (contas + investimentos + metas)

| Pergunta | Resposta |
|----------|----------|
| Como estou? | Freedom 68 — "Construção" |
| O que mudou? | Domus: "Sua reserva cresceu 12% este mês" |
| O que importa? | Continuar aportes |
| O que faço? | Módulos: Investimentos, Planejamento, Contas |
| 5 segundos? | ✅ Sabe que está bem e o que fazer |
| Calm? | ✅ 3 módulos, sem alertas |

### Cenário C — Endividado (passivos relevantes)

| Pergunta | Resposta |
|----------|----------|
| Como estou? | Freedom 34 — "Organização" |
| O que mudou? | Domus: "Seu cartão consome 22% da renda em juros" |
| O que importa? | Priority: "Quitar cartão — economia de R$ 1.200/ano" |
| O que faço? | [Ver passivos] |
| 5 segundos? | ✅ Vê o problema e a ação |
| Calm? | ✅ Alerta sem pânico. Caminho claro |

### Cenário D — Família (dados compartilhados)

| Pergunta | Resposta |
|----------|----------|
| Como estou? | Freedom 55 — "Estabilidade" (consolidado) |
| O que mudou? | Domus: meta compartilhada |
| O que importa? | Planejamento familiar |
| O que faço? | Módulos: Planejamento, Contas, Investimentos |
| Contexto claro? | ✅ Context Switcher: "Família" |
| 5 segundos? | ✅ Sabe que está no contexto Família |

### Cenário E — Empresário (PF + 2 empresas)

| Pergunta | Resposta |
|----------|----------|
| Contexto PJ? | ✅ Switcher: "Empresa A" |
| Como estou? | DRE simplificado no FI (ou FI + resumo) |
| O que mudou? | Domus: "Seu lucro operacional caiu 8%" |
| O que faço? | Módulos: Empresas, Fiscal, Contas PJ |
| Troca de contexto? | ✅ "Empresa B" — Home recarrega |
| 5 segundos? | ✅ Contexto claro. Estado visível |

### Cenário F — Power User (muitos módulos ativos)

| Pergunta | Resposta |
|----------|----------|
| Quantos módulos visíveis? | 5 (máximo) |
| O resto onde está? | Navegação + busca futura |
| Home poluída? | ❌ Não. 5 cards é o teto |
| Sente falta de algo? | Os 5 já cobrem o mais relevante |
| Escala? | ✅ Mesma estrutura com 100 módulos |

### Cenário G — Tudo saudável (sem urgências)

| Pergunta | Resposta |
|----------|----------|
| Priority Action? | Ausente (camada colapsa) |
| Domus? | Silenciosa ou insight positivo sutil |
| Home vazia? | ❌ Não. FI + Módulos mantêm utilidade |
| 5 segundos? | ✅ "Estou bem. Nada urgente." |
| Calm? | ✅ Mais leve que o normal — por design |

### Cenário H — Privacidade ativada

| Pergunta | Resposta |
|----------|----------|
| Estrutura igual? | ✅ Idêntica |
| Valores visíveis? | ❌ Todos mascarados |
| Ainda útil? | ✅ Labels, contexto, ações permanecem |
| 5 segundos? | ✅ Sabe o contexto e ações, sem expor valores |

---

## 26. TESTE DE 100 MÓDULOS

**Premissa:** O FinDomus cresce para 100 módulos.

**Resultado:** A Home continua exibindo de 3 a 5 módulos relevantes. O algoritmo de relevância seleciona os 5 mais importantes. Os outros 95 permanecem acessíveis via navegação e busca.

**A arquitetura não escala com o número de módulos — escala com a atenção do usuário.**

---

## 27. TESTE DE SILÊNCIO

**Cenário:** Tudo está bem. Nenhuma urgência. Nenhum insight excepcional.

**Resultado:**
- Freedom Index visível (sempre útil).
- Domus silenciosa (camada colapsa).
- Priority Action ausente (camada colapsa).
- Módulos: os 3-5 mais usados.

**A Home não quebra.** Fica mais limpa, não mais vazia. O usuário ainda vê seu estado e tem acesso aos módulos.

---

## 28. TESTE DE INSTABILIDADE

**Cenário:** Domus gera recomendações diferentes todos os dias.

**Resultado:**
- A posição das camadas nunca muda.
- O conteúdo da Domus pode variar — mas como a posição é fixa, o usuário sabe onde olhar.
- Módulos mudam gradualmente, não abruptamente.
- Módulos fixados pelo usuário nunca mudam.

**A estrutura é o âncora. O conteúdo pode dançar sem derrubar a experiência.**

---

## 29. TESTE DE REDUNDÂNCIA

| Informação | Freedom Index | Domus | Priority | Módulos | Redundante? |
|-----------|---------------|-------|----------|---------|-------------|
| Estado financeiro | ✅ Síntese | — | — | — | Único |
| Interpretação | — | ✅ Contexto | — | — | Único |
| Ação | — | ✅ (link) | ✅ (principal) | ✅ (navegação) | ⚠️ Ver abaixo |
| Exploração | — | — | — | ✅ | Único |

**Possível redundância:** Domus e Priority Action podem sugerir ações relacionadas. Ex: Domus menciona reserva; Priority Action sugere completar reserva. Isso é coerência, não redundância — a Domus observa, a Priority direciona.

**Mitigação:** se a Priority Action é exatamente o que a Domus sugeriu, a Domus mostra o insight sem o CTA — e a Priority Action carrega o botão. Um complementa o outro.

---

## 30. DECISÕES AINDA ABERTAS

Estas questões não bloqueiam a arquitetura, mas precisam ser decididas antes do wireframe:

| # | Questão | Impacto |
|---|---------|---------|
| 1 | Freedom Index no contexto PJ: manter o FI ou mostrar DRE simplificado como métrica principal? | Médio |
| 2 | O Context Switcher deve mostrar "Pessoal" mesmo quando é o único contexto? Ou some? | Baixo |
| 3 | Módulos: 3, 4 ou 5 como padrão? (o contrato permite 3-5 — precisamos decidir o default) | Baixo |
| 4 | O toque no Freedom Index expande inline (accordion) ou abre Bottom Sheet? | Médio |
| 5 | Continuidade: aparece acima ou abaixo dos módulos? | Baixo |

---

## 31. RISCOS

| Risco | Probabilidade | Mitigação |
|-------|-------------|-----------|
| Freedom Index ser percebido como "nota" e gerar ansiedade | Média | Comunicação por nível (Construção), não só número. Sem cor vermelha para scores baixos. |
| Usuário sentir falta de módulos não visíveis | Média | Navegação global resolve descoberta. Fixação de módulos dá controle. |
| Domus não gerar insights bons no início (dados frios) | Alta | Silêncio é melhor que insight ruim. A Domus não é obrigada a falar. |
| Usuário PJ querer ver DRE, não Freedom Index | Média | Decisão aberta #1. Podemos adaptar o protagonista por contexto. |
| Context Switcher sobrecarregar a Context Bar | Baixa | Apenas 3-5 opções. Dropdown, não tabs horizontais. |

---

## 32. RECOMENDAÇÃO FINAL

A arquitetura proposta atende a todos os cenários testados. Ela:

- ✅ Respeita o FDL 1.0 (Calm, 5 níveis de superfície, 5 tipos de card, escala tipográfica, paleta)
- ✅ Passa no teste dos 5 segundos em todos os cenários
- ✅ Escala para 100 módulos sem aumentar complexidade
- ✅ Funciona com a Home em silêncio (sem insights, sem ações)
- ✅ Mantém estrutura estável com conteúdo adaptativo
- ✅ Separa claramente PF/PJ/Família via Context Switcher
- ✅ Dá controle ao usuário (fixação de módulos, privacidade)
- ✅ Não repete informação entre camadas

### Pontos de atenção para o wireframe:

1. O Freedom Index Card precisa ser o elemento visualmente mais pesado da Home — `financial-hero` (36px) + nível + tendência.
2. A Domus precisa de um tratamento visual que a diferencie de um card comum, sem usar gradiente AI genérico. O azul FinDomus + tipografia de conversa (`type.body`) em superfície sutil.
3. A Priority Action não pode gritar. Usar `state.warning` (âmbar) para atenção, `state.negative` (vermelho) apenas para deterioração real.
4. A Context Bar deve ser a camada mais leve visualmente — `text.secondary`, sem fundo próprio.
5. O espaço entre camadas segue `space.8` (32px) — mudança de contexto visual.

---

## 33. HOMOLOGAÇÃO

| Critério | Status |
|----------|--------|
| HOME-P0 | 0 |
| HOME-P1 | 0 |
| 5 segundos | ✅ |
| Novo usuário | ✅ |
| Usuário maduro | ✅ |
| PF | ✅ |
| Família | ✅ |
| PJ | ✅ |
| Power User | ✅ |
| Privacidade | ✅ |
| 100 módulos | ✅ |
| Home silenciosa | ✅ |
| Estrutura estável | ✅ |
| FDL 1.0 respeitado | ✅ |

**A arquitetura está pronta para avançar para a fase de wireframe.**

---

*Home Mobile Architecture v1 · Fase 1 concluída · Aguardando homologação para wireframe*
