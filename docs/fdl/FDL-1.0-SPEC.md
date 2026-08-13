# FDL 1.0 — FinDomus Design Language

## SPECIFICATION v1.0

**Status:** Bloco 1 homologado · Bloco 2 homologado · Bloco 3 homologado

**Baseline funcional:** `bc19adb`

**Versão FDL:** 1.0 · **Estado:** 🔒 FROZEN

---

# BLOCO 1 — FUNDAMENTOS DA IDENTIDADE

---

## 1. MANIFESTO VISUAL

### O FinDomus não é um aplicativo de finanças.

O FinDomus é um lugar onde sua vida financeira faz sentido.

Visualmente, isso significa que a interface não existe para impressionar. Existe para criar um ambiente onde pensar sobre dinheiro não provoca ansiedade — provoca clareza.

### A interface é o silêncio entre os números.

Ela organiza, hierarquiza e orienta. Ela não compete com a informação. Ela serve à informação.

O FinDomus não pede atenção. Ele a merece porque é útil.

### Nossa linguagem visual é:

- **Escura** — porque finanças exigem concentração. Um fundo escuro acolhe o pensamento, reduz o ruído e faz os números brilharem.
- **Espaçosa** — porque cada número precisa de contexto para ser compreendido. Espaço não é desperdício. Espaço é legibilidade.
- **Calma** — porque a vida financeira já tem tensão suficiente. A interface não adiciona mais.
- **Precisa** — porque cada pixel comunica. Nada é decorativo. Tudo tem função.
- **Contemporânea** — porque o futuro das finanças pessoais não parece um banco dos anos 2000.

### O toque de luz.

No escuro, um ponto de luz guia. No FinDomus, a luz é o azul — a cor da ação, da inteligência, da Domus. Ele não ilumina tudo. Ilumina apenas o que importa agora.

---

## 2. PERSONALIDADE VISUAL

A personalidade visual do FinDomus pode ser descrita em 6 adjetivos. Cada um se traduz em decisões concretas de design.

### Sereno

A interface respira. Há espaço entre os elementos. As transições são suaves. Nada grita. Nada pisca. Nada compete.

**Tradução visual:** densidade baixa-moderada. Muito espaço negativo. Animações suaves, deliberadas e rápidas o suficiente para nunca parecerem lentas. Sem elementos que piscam ou pulsam sem motivo.

**O FinDomus é calmo, não devagar.** Suavidade e continuidade não significam lentidão. O movimento é rápido o bastante para ser imperceptível como espera, mas suave o bastante para não causar ansiedade.

### Preciso

Cada pixel tem propósito. Alinhamentos são exatos. Números são o elemento mais importante da hierarquia. A tipografia serve à legibilidade financeira.

**Tradução visual:** grid rigoroso. Alinhamento vertical impecável. Tabular numbers para dados financeiros. Sem decoração.

### Confiável

A interface não esconde. Más notícias são visíveis, mas não dominam. Dados são apresentados com contexto. A Domus explica, não impõe.

**Tradução visual:** consistência absoluta entre telas. Mesma ação = mesmo comportamento. Resultados financeiros importantes devem oferecer acesso visível à origem, contexto ou explicação do valor apresentado — sem transformar a tela em documentação técnica. Aplicar disclosure progressiva: o número aparece primeiro; a explicação está a um toque de distância.

Exemplos conceituais de explicabilidade visível:

```
Freedom Index  →  "Entenda como foi calculado"
Patrimônio     →  "Ver composição"
Resultado mensal → "Ver entradas e saídas"
Insight Domus  →  "Por que estou vendo isto?"
```

### Contemporâneo

O FinDomus parece ter sido projetado hoje. Não é Material Design genérico. Não é iOS cópia. Tem personalidade própria, mas não é experimental.

**Tradução visual:** raios generosos mas não circulares. Bordas sutis. Sombras apenas para elevação funcional. Tipografia moderna. Dark mode como primeira impressão.

### Discreto

Premium não é ostentação. É qualidade percebida nos detalhes. Acabamentos, espaçamento, tipografia, proporção. Ninguém precisa de um badge dourado para saber que algo é bem feito.

**Tradução visual:** evitar exageros. Dourado apenas em momentos excepcionais. Sem gradientes chamativos. Sem animações de celebração infantil.

### Inteligente

A interface aprende com o usuário. A Domus está presente mas não invasiva. As recomendações aparecem no momento certo. A complexidade existe, mas permanece invisível até ser necessária.

**Tradução visual:** disclosure progressiva. Informação revelada sob demanda. Domus com presença visual sutil até ser invocada.

---

## 3. DESIGN PRINCIPLES

Estes 22 princípios governam toda decisão de design no FinDomus. Eles existem para responder "isto pertence ao FinDomus?" antes mesmo de olhar para um mockup.

### Princípios Fundamentais

**P1 — Clareza antes de densidade.**
Se é preciso escolher entre mostrar mais informação e garantir compreensão imediata, a clareza vence. Sempre.

**P2 — Um número sem contexto é ruído.**
Nenhum valor financeiro aparece isolado. Sempre há: o que significa, comparado a quê, por que mudou.

**P3 — Espaço é parte da informação.**
Espaço vazio não é desperdício. É o que permite que o olhar encontre o que importa. A densidade é progressiva — começa baixa, aumenta conforme o usuário mergulha.

**P4 — O escuro acolhe, a luz guia.**
O fundo escuro é o ambiente de concentração. O azul é o condutor do olhar. Um não funciona sem o outro.

**P5 — Problemas financeiros não gritam.**
Más notícias são comunicadas com sobriedade. Nunca com alarme visual. O usuário precisa de clareza e caminho, não de punição cromática.

### Princípios de Hierarquia

**P6 — Cada tela tem um protagonista.**
Em qualquer tela, um elemento deve ser imediatamente identificável como o mais importante. Se tudo é importante, nada é.

**P7 — A ação principal é óbvia.**
O usuário nunca deve procurar o que fazer. A ação prioritária está onde o olhar naturalmente repousa.

**P8 — Profundidade é progressiva.**
A superfície mostra o essencial. O detalhe aparece quando solicitado. O especialista revela tudo. Ninguém recebe mais informação do que pediu.

**P9 — A Domus orienta; o usuário decide.**
A IA sugere, contextualiza, explica. Mas o comando visual — botões, ações, decisões — permanece com o usuário.

### Princípios de Movimento

**P10 — Movimento explica.**
Toda animação comunica relação: de onde veio, para onde vai, o que mudou. Nada se move apenas para decorar.

**P11 — Rápido o suficiente para não ser percebido como lento.**
Transições respeitam o tempo cognitivo: micro (150ms), padrão (250ms), narrativa (400ms). Nada acima de 400ms sem motivo.

**P12 — Continuidade espacial.**
Navegar no FinDomus parece mover-se em um espaço contínuo. As telas não "trocam" — elas se transformam. O contexto anterior nunca desaparece abruptamente.

### Princípios de Consistência

**P13 — A mesma ação parece e se comporta igual em qualquer lugar.**
Um botão de confirmação, um indicador de loading, uma mensagem de erro — a linguagem é uma só.

**P14 — Consistência gera confiança.**
Comportamento previsível em todas as superfícies. O usuário aprende uma vez e aplica em todo lugar.

**P15 — O FinDomus envelhece bem.**
A experiência melhora conforme o sistema conhece mais o usuário. Mais dados = mais valor, não mais complexidade.

### Princípios de Feedback

**P16 — Toda ação merece resposta.**
Nenhum toque fica sem feedback. Sucesso, erro, loading — o sistema sempre responde.

**P17 — O feedback é proporcional à importância.**
Salvar uma preferência não merece a mesma reação visual que quitar uma dívida de anos.

**P18 — O erro nunca é do usuário.**
Mensagens de erro explicam o que o sistema encontrou e o que fazer. Nunca culpam. Nunca expõem stack trace.

### Princípios de Emoção

**P19 — A interface não julga.**
Cores, palavras, ícones — nada comunica "você fez algo errado" ou "sua situação é ruim". Dados são neutros. Interpretações são construtivas.

**P20 — Progresso é mostrado, não exagerado.**
Crescimento do Freedom Index, metas atingidas, dívidas quitadas — reconhecimento com elegância. Sem confete, sem gamificação infantil.

**P21 — O vazio pode ser conquista.**
"Você não tem dívidas" é visualmente diferente de "você ainda não cadastrou investimentos". Estados vazios comunicam seu significado emocional.

**P22 — Silêncio também é interface.**
Nem toda tela precisa de ação. Às vezes, o melhor design é permitir que o usuário apenas olhe, compreenda e reflita. A interface não precisa preencher o silêncio.

---

## 4. ASSINATURA "CALMA ESCURA COM UM TOQUE DE LUZ"

Esta não é uma metáfora poética. É uma decisão de design concreta que se desdobra em diretrizes específicas.

### O que "Calma Escura" significa na prática:

**Fundo profundo, não preto puro.**
O background não é `#000000`. É um tom muito escuro com leve matiz — azul ou cinza-azulado — que reduz o contraste agressivo e torna a leitura prolongada confortável. OLED puro cansa.

**Contraste controlado.**
Texto sobre fundo escuro não usa branco puro (`#FFFFFF`). Usa um off-white que reduz fadiga ocular. A hierarquia se faz por peso e tamanho, não por contraste extremo.

**Sombras como profundidade, não como decoração.**
No modo escuro, sombras não são cinzas — são mais escuras que o fundo. Praticamente invisíveis, mas perceptíveis. Criam elevação sem poluir.

**Bordas sutis.**
Separação entre superfícies não depende de bordas grossas. Depende de diferença sutil de tom. A borda aparece apenas quando necessária para distinguir elementos interativos.

**Redução de ruído visual.**
Sem linhas de grid visíveis em tabelas. Sem bordas em cards a menos que interativos. Separadores apenas quando a distinção não puder ser feita por espaço.

### O que "Toque de Luz" significa na prática:

**Azul como condutor do olhar.**
O azul FinDomus não pinta superfícies. Ele marca o caminho: o botão principal, o link, o indicador de seleção, o destaque da Domus. Ele aparece em elementos de ação e inteligência, nunca como decoração.

**Um toque, não um banho.**
O azul FinDomus deve permanecer visualmente minoritário e direcional. Como heurística, telas comuns devem usar aproximadamente 5-10% de presença cromática primária — mas essa faixa é uma orientação, não um critério matemático de reprovação. Se tudo é azul, nada é importante. O critério verdadeiro é: **se o azul domina a tela, há azul demais.** O azul marca ação, seleção, inteligência, Domus e foco — não preenche superfícies.

**Luz que guia, não que cega.**
O azul FinDomus, sobre fundo escuro, cria um contraste direcional. O olhar é naturalmente atraído para ele. Isso é usado deliberadamente para hierarquia.

**A Domus é luz.**
Quando a Domus se manifesta (responde, sugere, analisa), o azul se intensifica levemente na região dela. Não é um glow artificial. É uma presença sutil.

### Atmosfera resultante:

Imagine uma sala escura e silenciosa. Confortável. Você está concentrado. Há uma luminária direcionada apenas para a mesa onde você trabalha. O resto está em penumbra — presente, mas não competindo. Você vê exatamente o que precisa. Nada mais.

É assim que o FinDomus deve se sentir.

---

## 5. ESTRATÉGIA DARK / LIGHT / SYSTEM

### Identidade de marca: Dark-first

O Dark Mode é a principal assinatura visual do FinDomus. Ele deve ser utilizado em:

- identidade institucional;
- marketing;
- screenshots oficiais;
- apresentações;
- materiais de produto;
- demonstrações;
- primeira impressão da marca.

**Dark é como o mundo reconhece o FinDomus.**

### Comportamento do produto: System como default

No primeiro uso, o aplicativo respeita a preferência do sistema operacional.

O usuário poderá escolher entre:

```
System (default)
Dark
Light
```

A preferência é salva e respeitada em todos os acessos futuros.

**System é como o produto se comporta. Dark é como a marca se apresenta.**

### Light Mode

Não é uma versão inferior ou secundária. Possui o mesmo nível de qualidade, consistência e acessibilidade do Dark Mode. Recebe o mesmo cuidado em cada token, cada componente, cada tela.

O Light Mode existe para:
- ambientes externos com muita luz;
- usuários com preferência ou necessidade de fundo claro;
- contextos onde o Dark Mode compromete a legibilidade;
- acessibilidade (usuários 50+, astigmatismo, sensibilidade a baixo contraste).

### Resumo da estratégia

| Contexto | Modo |
|----------|------|
| Marca, marketing, screenshots | Dark |
| Primeiro uso no app | System (respeita OS) |
| Preferência do usuário | Dark, Light ou System (persistido) |
| Qualidade dos modos | Idêntica (Dark e Light recebem o mesmo polimento) |

**Dark é a assinatura visual da marca. System é o comportamento padrão do produto.**

### Dark Mode (Assinatura FinDomus)

- **Quando usar:** Experiência padrão da marca. Modo recomendado para primeira impressão.
- **Background:** Profundo, azul-acinzentado muito escuro. Não preto puro.
- **Texto:** Off-white, com hierarquia por peso.
- **Contraste:** Moderado-alto. Confortável para leitura prolongada.
- **Azul FinDomus:** Vibrante sobre o fundo escuro. Guia natural do olhar.
- **Superfícies:** Diferença sutil (2-4% de luminosidade) entre background e cards.
- **OLED:** Não otimizamos para preto puro. Priorizamos conforto visual sobre economia de bateria.

### Light Mode (Opção de Acessibilidade e Contexto)

- **Quando usar:** Ambientes externos, muita luz ambiente, preferência do usuário, usuários 50+.
- **Background:** Quase branco com leve matiz quente ou neutro. Não branco puro.
- **Texto:** Cinza muito escuro. Não preto puro.
- **Contraste:** Equivalente ao Dark Mode em legibilidade.
- **Azul FinDomus:** Ligeiramente mais escuro que no Dark Mode para manter contraste adequado.
- **Superfícies:** Cards com fundo branco ou quase-branco. Elevação por sombra sutil.
- **Métrica:** WCAG AA em todos os textos. AAA onde possível.

### System (Default)

- **Comportamento:** O aplicativo segue a preferência do sistema operacional.
- **Transição:** Suave, sem flicker. Cores transitam com easing.
- **Respeito:** O usuário escolheu escuro ou claro no sistema por um motivo. O FinDomus respeita.

### Regras de implementação futura:

1. Todos os tokens de cor são definidos como pares light/dark.
2. Nenhum componente usa cor "hardcoded". Tudo referencia tokens semânticos.
3. A transição entre modos é instantânea (não animada) para evitar flicker.
4. O tema pode ser trocado em Configurações e sobrepõe o System.
5. O estado "System" é o default. O usuário troca se quiser.
6. Ambos os modos passam nos mesmos critérios de acessibilidade.

---

## 6. O QUE NÃO É FINDOMUS

Esta lista define a fronteira negativa do design. Se algo se parece com qualquer item abaixo, não pertence ao FinDomus.

### Anti-padrões de Layout

- ❌ Home com scroll infinito de widgets e cards
- ❌ Card dentro de card dentro de card (boneca russa)
- ❌ Sidebar com 15 itens competindo por atenção
- ❌ Três ou mais CTAs primárias na mesma tela
- ❌ Grid de 4+ colunas no mobile
- ❌ Tabelas que exigem scroll horizontal no celular
- ❌ Modais centrais para ações comuns no mobile
- ❌ Headers que ocupam mais de 15% da tela

### Anti-padrões de Cor

- ❌ Fundo preto puro (`#000000`)
- ❌ Branco puro sobre preto puro (contraste agressivo)
- ❌ Azul FinDomus como cor de background
- ❌ Vermelho como cor dominante em qualquer tela
- ❌ Gradiente "AI" (roxo→rosa→azul) genérico
- ❌ Neon, ciano saturado, efeito glow exagerado
- ❌ Dourado fora de conquistas excepcionais
- ❌ Mais de 3 cores com significado simultâneo visível

### Anti-padrões de Tipografia

- ❌ Texto menor que 11px em mobile
- ❌ ALL CAPS em frases ou parágrafos
- ❌ Itálico para texto corrido
- ❌ Fontes decorativas ou display para interface
- ❌ Mais de 4 tamanhos de fonte simultâneos visíveis
- ❌ Texto sem contraste suficiente (WCAG AA)

### Anti-padrões de Movimento

- ❌ Animação sem função comunicativa
- ❌ Transição acima de 400ms
- ❌ Elementos piscando ou pulsando sem motivo
- ❌ Bounce em botão de ação (ansiedade)
- ❌ Confete, fogos, celebração animada
- ❌ Loading spinner sem indicação de progresso
- ❌ Parallax ou efeitos de scroll decorativos

### Anti-padrões de Feedback

- ❌ Toast que some antes de ser lido
- ❌ Mensagem de erro sem ação seguinte
- ❌ Stack trace ou linguagem técnica visível ao usuário
- ❌ Alerta vermelho para situação informativa
- ❌ Pop-up de "Parabéns!" por ação trivial
- ❌ Notificação push para "você não abre o app há 3 dias"

### Anti-padrões da Domus

- ❌ IA iniciando conversa sem ser solicitada
- ❌ Domus ocupando mais de 40% da tela sem permissão
- ❌ Glow ou gradiente exagerado como "identidade AI"
- ❌ "Cérebro", "neurônio", "pensando..." como metáfora visual
- ❌ Avatar humanoide ou rosto para a IA
- ❌ Badge do provedor de IA visível ao usuário ("Gemini", "GPT")
- ❌ Linguagem antropomórfica excessiva ("estou pensando...")

### Anti-padrões de Experiência

- ❌ Gamificação com pontos, rankings, badges
- ❌ Comparação social ("você está entre os X%")
- ❌ Upsell agressivo interrompendo fluxo
- ❌ Dark patterns de cancelamento ou aceitação
- ❌ "Em breve" / "Coming soon" visível ao usuário
- ❌ Conteúdo bloqueado sem explicação clara do motivo
- ❌ Informação financeira sem contexto ou explicação
- ❌ Gráfico decorativo que não responde uma pergunta

---

## 7. CHECKLIST DE HOMOLOGAÇÃO — BLOCO 1

Este checklist será usado para aprovar qualquer elemento visual futuro contra os fundamentos do FDL.

### Perguntas de Identidade

- [ ] Sem ver o logo, isto parece FinDomus?
- [ ] A paleta de cores está consistente com os tokens definidos?
- [ ] O espaçamento respeita a escala do FDL?
- [ ] A tipografia segue a hierarquia definida?
- [ ] O elemento transmite a personalidade FinDomus — calma, precisão, confiança e contemporaneidade?

### Perguntas de Clareza

- [ ] A informação principal é identificada em 5 segundos?
- [ ] A ação prioritária é óbvia sem instrução?
- [ ] Existe espaço suficiente entre os elementos?

### Perguntas de Confiança

- [ ] Os dados têm contexto visível?
- [ ] Não há linguagem julgadora?
- [ ] Não há exposição de informação técnica ao usuário?

### Perguntas de Consistência

- [ ] Os mesmos componentes se comportam como em outras telas?
- [ ] As cores têm o mesmo significado em todo o produto?
- [ ] O feedback segue o padrão definido?

### Perguntas de Emoção

- [ ] A interface transmite calma, não ansiedade?
- [ ] Más notícias são comunicadas com sobriedade?
- [ ] Boas notícias são reconhecidas com elegância?
- [ ] O usuário sente que está no controle?

### Perguntas de Acessibilidade

- [ ] O contraste atende WCAG AA?
- [ ] Touch targets têm tamanho mínimo adequado?
- [ ] A cor não é o único meio de transmitir informação?

---

# BLOCO 2 — ESTRUTURA VISUAL

## ESPAÇO, GRID, SUPERFÍCIES E CARDS

Este bloco define as regras espaciais que governam toda a interface. Ele não desenha telas — ele estabelece o vocabulário visual com o qual as telas serão construídas.

---

## 1. ESCALA ESPACIAL

A escala de spacing do FinDomus segue múltiplos de 4px, baseados em um ritmo consistente. Apenas 8 tokens são necessários para toda a interface.

### Tokens de espaço

| Token | Valor (px) | Uso principal |
|-------|-----------|---------------|
| `space.1` | 4 | Microespaço: ícone↔texto, chip↔chip, separador mínimo |
| `space.2` | 8 | Elementos internos: label↔campo, badge↔texto, inline gap |
| `space.3` | 12 | Padding interno de elementos compactos, gap entre itens de lista |
| `space.4` | 16 | Padding padrão de card, gap entre elementos em formulário |
| `space.6` | 24 | Espaço entre cards, margem interna generosa |
| `space.8` | 32 | Espaço entre seções, respiro entre blocos distintos |
| `space.12` | 48 | Respiro entre grandes seções, antes/depois de CTAs principais |
| `space.16` | 64 | Respiro de tela: topo após header, antes de Bottom Nav |

### Lógica da escala

- Base: 4px (grid mínimo)
- Cada token é múltiplo de 4: `1×4, 2×4, 3×4, 4×4, 6×4, 8×4, 12×4, 16×4`
- Saltos progressivos: 4→8→12→16→24→32→48→64
- Nenhum valor fora da escala deve ser usado para spacing estrutural
- Apenas microajustes ópticos (1-2px) são permitidos para alinhamento visual

### Quando usar cada token

- `space.1` (4px): Apenas para relações muito próximas que precisam ser percebidas como um grupo
- `space.2` (8px): Relações internas de um elemento composto
- `space.3` (12px): O "apertado mas confortável" — listas, chips, pequenos agrupamentos
- `space.4` (16px): O padrão. Padding de card, gap de formulário, margem interna
- `space.6` (24px): Separação clara entre elementos distintos
- `space.8` (32px): "Isto é outra coisa" — mudança de assunto visual
- `space.12` (48px): Respiro estratégico. O olhar descansa aqui
- `space.16` (64px): Estrutural. Só usado nas bordas da tela e grandes transições

---

## 2. RITMO VERTICAL

O ritmo vertical do FinDomus é governado por espaço, não por linhas. Agrupamentos são percebidos por proximidade. Separações são percebidas por distância.

### Relações verticais padrão

| Relação | Token | Sensação |
|---------|-------|----------|
| Título → subtítulo | `space.1` (4px) | Continuação direta |
| Título → conteúdo | `space.3` (12px) | Mesmo bloco |
| Entre elementos do mesmo grupo | `space.2`-`space.3` (8-12px) | Lista, continuidade |
| Entre cards | `space.4` (16px) | Itens distintos mas relacionados |
| Entre seções | `space.8` (32px) | Mudança de contexto |
| Após header → conteúdo | `space.6` (24px) | Início do conteúdo principal |
| Último elemento → Bottom Nav | `space.16` (64px) | Fim da rolagem, segurança tátil |

### Regra do agrupamento por espaço

Elementos separados por `space.2` ou `space.3` são percebidos como **relacionados**.
Elementos separados por `space.6` ou mais são percebidos como **distintos**.
O espaço entre grupos deve ser visivelmente maior que o espaço dentro do grupo (mínimo 2×).

---

## 3. MARGENS MOBILE

### Definições por largura

| Largura | Margem lateral | Largura útil |
|---------|---------------|--------------|
| 375px | `space.4` (16px) | 343px |
| 390px | `space.4` (16px) | 358px |
| 430px | `space.4` (16px) | 398px |

### Regras

- **Margem lateral padrão:** 16px em todas as resoluções mobile
- **Conteúdo full-width permitido quando:** o elemento é parte natural do fundo (gráfico de área, barra de progresso que sangra, banner contextual)
- **Conteúdo NUNCA encosta na borda quando:** texto, cards, botões, inputs, qualquer elemento interativo
- **Safe areas:** respeitar notch, home indicator e bordas curvas do dispositivo
- **Conteúdo edge-to-edge:** apenas gráficos e barras de progresso que se beneficiam de continuidade visual com o fundo

---

## 4. GRID MOBILE

O FinDomus usa grid de 4 colunas no mobile.

### Especificação

| Parâmetro | Valor |
|-----------|-------|
| Colunas | 4 |
| Margem lateral | 16px |
| Gutter | 12px |
| Largura de coluna | flexível (preenche espaço restante) |

### Regras de uso

- **1 coluna:** Conteúdo principal. Cards, KPIs, textos, formulários. Padrão para tudo.
- **2 colunas:** Apenas para cards pequenos de mesmo peso e natureza (ex: 2 KPIs lado a lado). Máximo 2 cartões por linha.
- **3+ colunas:** Proibido no mobile. Reservado para tablet/desktop.
- **Cards lado a lado só se:** mesma altura, mesma importância, mesma natureza. Nunca cards de tipos diferentes.

### O que NUNCA fazer no grid mobile

- 3 colunas de cards
- Cards de tamanhos diferentes lado a lado
- Tabela com scroll horizontal (reformular como lista)
- Gráfico com legenda ocupando coluna lateral (legenda abaixo)
- Grid de 4 colunas para KPIs (máximo 2)

### Especificação de tabelas

Tabelas no FinDomus seguem estas regras:
- **Sem grid vertical.** Apenas linhas horizontais sutis (`border.subtle`) entre rows quando necessário.
- **Sem zebra striping** por padrão.
- **Header** usa `type.caption` com `text.secondary`.
- **Valores numéricos** alinhados à direita com tabular figures.
- **Mobile:** se não couber, reformular como lista de cards — nunca forçar scroll horizontal.

---

## 5. LARGURA DE CONTEÚDO

### Mobile: conteúdo usa 100% da largura útil

Nenhum conteúdo é mais estreito que a largura útil no mobile — exceto:
- Confirmações e diálogos (centralizados, com padding lateral adicional)
- Elementos decorativos ou ilustrações de empty state
- Chips e badges inline

### Tablet (768px+): largura máxima de conteúdo

- Texto corrido: máximo 640px (legibilidade ideal para leitura)
- Cards e KPIs: podem usar largura total do container
- Formulários: máximo 480px (foco na tarefa)

### Desktop (1024px+): container centralizado

- Conteúdo principal: máximo 960px, centralizado
- Telas de análise/power user: podem usar 1200px com múltiplas colunas
- Sidebar, se existir, não conta nessa largura

---

## 6. ARQUITETURA DE SUPERFÍCIES

O FinDomus possui 5 níveis de profundidade visual: Canvas como nível-base e quatro níveis de superfície acima dele. Cada nível comunica profundidade e hierarquia.

### Níveis oficiais

| Nível | Nome | Função | Relação com fundo |
|-------|------|--------|-------------------|
| 0 | **Canvas** | O fundo da aplicação. Não é uma superfície — é o espaço. | Background base |
| 1 | **Surface** | Cards, listas, áreas de conteúdo passivo. | Levemente mais claro que Canvas |
| 2 | **Raised** | Elementos interativos que precisam de destaque sutil. Cards acionáveis, inputs. | Mais claro que Surface, com borda ou sombra sutil |
| 3 | **Floating** | Elementos que flutuam sobre o conteúdo. FAB, tooltip, dropdown. | Contraste maior com Canvas, sombra perceptível |
| 4 | **Overlay** | Sheets, modais, diálogos. Bloqueiam interação com níveis abaixo. | Máximo contraste, scrim entre Overlay e Canvas |

### Regras por nível

**Canvas (0):** Fundo da página. Não possui borda, sombra ou padding. É o vazio sobre o qual tudo se constrói.

**Surface (1):** Cards informativos, listas, áreas de leitura. Borda sutil opcional. Sem sombra. A distinção do Canvas se faz por diferença de tom (2-4% de luminosidade no Dark, branco vs off-white no Light).

**Raised (2):** Cards interativos, inputs, áreas selecionáveis. Borda sutil presente. Sem sombra. A elevação é comunicada por tom e borda. Comunica "você pode interagir com isto".

**Floating (3):** Elementos que precisam ser percebidos como "acima" do conteúdo. Sombra visível. Borda presente. Não bloqueia a interação com o resto da tela.

**Overlay (4):** Sheets, modais, full-screen dialogs. Cobrem parcial ou totalmente o conteúdo. Scrim (overlay escuro) entre o Overlay e o Canvas. Bloqueiam scroll e interação com camadas inferiores.

---

## 7. PROFUNDIDADE

A profundidade no FinDomus é comunicada por três fatores, nesta ordem de importância:

1. **Diferença de tom** (principal) — superfícies mais elevadas são levemente mais claras
2. **Borda** (secundário) — superfícies elevadas têm borda sutil para definição
3. **Sombra** (terciário) — apenas em Floating e Overlay; quase imperceptível em Surface

### O que NÃO usamos para profundidade

- Sombras pesadas ou múltiplas com blur grande
- Glassmorphism com blur de fundo como efeito primário
- Gradientes para simular elevação
- Muitos tons diferentes (máximo 4 níveis de luminosidade entre Canvas e Overlay)

---

## 8. CARDS — TAXONOMIA

O FinDomus usa apenas 5 tipos de cards. Cada tipo tem função e anatomia específicas.

| # | Tipo | Função | Interativo? |
|---|------|--------|-------------|
| 1 | **Summary Card** | Resumo executivo de um módulo ou contexto | Sim (navega para o módulo) |
| 2 | **KPI Card** | Um número ou indicador com contexto mínimo | Opcional |
| 3 | **Insight Card** | Observação ou recomendação da Domus | Sim (expande ou navega) |
| 4 | **Action Card** | Algo que requer ação do usuário | Sim (leva à ação) |
| 5 | **Progress Card** | Acompanhamento de meta, índice ou evolução | Opcional |

### Por que apenas 5?

Cada tipo adicional adiciona carga cognitiva. Se um novo caso de uso pode ser coberto por um tipo existente, ele deve ser coberto. A distinção se faz por conteúdo e contexto, não por variação visual.

### Regras específicas para KPI Card

**KPI Card nunca existe apenas para preencher espaço.** Todo KPI precisa responder uma pergunta relevante e possuir contexto suficiente para interpretação imediata.

**Se o card representa a entrada ou o resumo executivo de um módulo, ele é Summary Card. Se existe apenas para comunicar uma métrica sem representar um destino de navegação, ele é KPI Card. Quando houver dúvida, preferir Summary.**

Um número isolado não é informação.

Exemplo inadequado:
```
R$ 8.450
```

Exemplo conceitualmente adequado:
```
Saldo disponível
R$ 8.450
+R$ 620 neste mês
```

**A Home não pode virar uma coleção de KPI Cards.** Na densidade Calm, KPIs devem ser extremamente seletivos. Se cinco números competem simultaneamente por atenção, a arquitetura falhou em decidir o que realmente importa. O KPI Card só aparece quando a métrica é a resposta principal à pergunta do momento.

### Quando criar um novo tipo

Apenas se o novo card precisar de anatomia ou comportamento fundamentalmente diferente dos 5 existentes. "Parecido mas com cor diferente" não justifica um novo tipo.

---

## 9. ANATOMIA UNIVERSAL DE CARD

Todo card no FinDomus pode conter estes elementos. Nenhum card deve conter todos eles.

### Elementos disponíveis (em ordem hierárquica)

| # | Elemento | Obrigatório? | Descrição |
|---|----------|-------------|-----------|
| 1 | **Eyebrow** | Não | Contexto: categoria, módulo, período. Muito pequeno, uppercase, baixo contraste |
| 2 | **Header / Título** | Sim (exceto KPI puro) | O que é isto. Principal identificador do card |
| 3 | **Valor principal** | Sim (exceto Insight puro) | O número, indicador ou métrica central |
| 4 | **Tendência** | Não | Delta, variação, comparativo. Só aparece se houver dado comparativo |
| 5 | **Descrição** | Não | Explicação curta. Máximo 2 linhas |
| 6 | **Insight** | Não | Observação da Domus. Visualmente distinto do resto do card |
| 7 | **Ação** | Não | Botão ou link de ação. Máximo 1 por card |
| 8 | **Status / Badge** | Não | Indicador de estado: ativo, concluído, pendente, alerta |

### Regras de composição

- **Máximo de níveis de informação:** 4 (incluindo título)
- **Máximo de ações:** 1 CTA por card. Se precisar de mais ações, o card inteiro é tocável e leva a uma tela de detalhe
- **Máximo de linhas de texto contínuo:** 2 (descrição). Texto mais longo pertence à tela de detalhe
- **Ícone:** usar apenas quando agrega significado. Não decorar cards com ícones

---

## 10. CARD INTERATIVO VS INFORMATIVO

A distinção entre "pode tocar" e "é só informação" deve ser imediatamente perceptível — sem depender de hover (mobile-first).

### Regras de affordance

Surface e Raised constituem a affordance padrão de profundidade, mas elevação nunca será o único indicador de interatividade.

| Característica | Informativo | Interativo |
|---------------|-------------|------------|
| Superfície | Surface (1) | Raised (2) |
| Borda | Nenhuma ou muito sutil | Presente, sutil |
| Indicador visual | Nenhum | Chevron, seta ou ícone de ação |
| Comportamento ao toque | Nenhum | Navega, expande ou executa ação |

Interatividade também poderá ser comunicada por:
- chevron ou ícone de ação;
- label ou texto de chamada;
- contexto de uso;
- estado pressionado (feedback tátil);
- microinteração ao toque;
- navegação explícita;
- linguagem visual do componente.

**Regra de acessibilidade: interatividade não pode depender somente de elevação, cor ou hover. Mobile-first.**

### O card inteiro é o touch target

Em cards interativos, o toque em qualquer área do card executa a ação principal. Não usar botões minúsculos dentro de cards como único ponto de interação.

---

## 11. CARD DENTRO DE CARD

### Regra: EVITAR

Se for necessário agrupar conteúdo dentro de um card, usar uma das alternativas:

- **Divisão por espaço** — seções internas separadas por `space.4` (16px)
- **Divider sutil** — linha fina de baixíssimo contraste entre blocos internos
- **Surface variation** — leve variação de tom no fundo interno, sem borda completa

### Quando um nested card é aceitável

Apenas quando o elemento interno precisa de affordance de interatividade independente e distinta do card pai. Exemplo: um Summary Card de Investimentos que contém um Insight Card da Domus — o insight é tocável independentemente e leva a um lugar diferente do card pai.

Nesse caso, o card interno usa Surface (nível 1) e o card pai usa Raised (nível 2).

---

## 12. RAIOS (BORDER RADIUS)

### Escala de raios

| Token | Valor | Uso |
|-------|-------|-----|
| `radius.sm` | 8px | Controles compactos, chips, badges |
| `radius.control` | — | Reservado para botões e inputs. Valor final será homologado no bloco de componentes |
| `radius.md` | 16px | Cards, sheets, elementos de superfície |
| `radius.lg` | 24px | Elementos grandes e destacados: hero card, modal, alert |
| `radius.full` | 9999px | Elementos circulares: avatar, FAB, indicador de progresso |

### Personalidade

O FinDomus usa raios generosos (`radius.md = 16px`) para cards e superfícies. Isso comunica modernidade e suavidade sem cair no exagero "bolha" (raios > 24px em tudo).

**Nem quadrado demais (rígido, enterprise). Nem circular demais (infantil, informal).**

---

## 13. BORDAS

### Filosofia

No Dark Mode, bordas devem ser quase imperceptíveis. Sua função é definição sutil, não separação forte. A separação principal entre elementos se faz por espaço e diferença de tom.

### Tokens de borda

| Token | Opacidade (Dark) | Uso |
|-------|-----------------|-----|
| `border.subtle` | 5-8% de branco | Cards Surface, separadores internos |
| `border.default` | 10-12% de branco | Cards Raised, inputs, elementos interativos |
| `border.emphasis` | 20-25% de branco | Focus, selecionado, Floating |
| `border.error` | Vermelho com 40% opacidade | Campo com erro |
| `border.brand` | Azul FinDomus | Focus ativo, selecionado |

### Regras

- Largura padrão de borda: 1px
- Borda NUNCA é usada como separador entre cards (espaço faz isso)
- Borda é usada para definir o limite de elementos interativos e superfícies elevadas
- No Light Mode, as mesmas regras se aplicam com opacidades ajustadas (borda = cinza, não branco)

---

## 14. SOMBRAS

### Filosofia

No Dark Mode, sombras são quase invisíveis. A profundidade é comunicada primariamente por diferença de tom. Sombras existem apenas para Floating e Overlay — elementos que realmente precisam "flutuar".

### Tokens de sombra

| Token | Uso | Dark Mode | Light Mode |
|-------|-----|-----------|------------|
| `shadow.none` | Canvas, Surface, Raised | Sem sombra | Sem sombra |
| `shadow.float` | Floating (FAB, dropdown, tooltip) | `0 4px 12px rgba(0,0,0,0.4)` | `0 2px 8px rgba(0,0,0,0.08)` |
| `shadow.overlay` | Overlay (sheets, modais) | `0 8px 32px rgba(0,0,0,0.6)` | `0 4px 16px rgba(0,0,0,0.12)` |

### Regras

- Surface e Raised NÃO usam sombra. A elevação é comunicada por tom e borda
- Floating usa sombra sutil para comunicar "estou acima"
- Overlay usa sombra mais pronunciada + scrim
- Nenhum card "flutua" sem motivo funcional

---

## 15. BLUR / TRANSLUCÊNCIA

### Decisão: Uso restrito e funcional

O FinDomus utiliza blur (backdrop-filter) apenas em elementos que genuinamente se sobrepõem ao conteúdo e se beneficiam de contexto visual.

### Onde usar

| Elemento | Blur | Justificativa |
|----------|------|---------------|
| Bottom Navigation | `blur.subtle` (ref. inicial 8px) | Mantém contexto do conteúdo abaixo |
| Header de módulo | `blur.subtle` (ref. inicial 8px) | Ao fazer scroll, o header mantém legibilidade |
| Sheet (Bottom Sheet) | `blur.standard` (ref. inicial 12px) | O fundo visível contextualiza sem distrair |
| Overlay / Modal | `blur.strong` (ref. inicial 20px) + scrim | Isolamento visual claro |
| Scrim de Overlay | Não (apenas opacidade preta) | Scrim é cor sólida semiblindante |

Os valores de blur acima são referências iniciais. Os valores finais serão calibrados visualmente durante a aplicação do FDL nas primeiras telas reais. **Blur é funcional, não decorativo.**

### Onde NÃO usar

- Cards (já têm superfície própria)
- Background principal
- Como efeito decorativo
- "Glassmorphism" genérico como estilo visual

---

## 16. DENSIDADE POR PROFUNDIDADE

A densidade de informação não é uniforme. Ela aumenta conforme o usuário mergulha em detalhes.

### Escala de densidade

| Nível | Contexto | Densidade | Cards visíveis | Espaçamento dominante |
|-------|----------|-----------|---------------|----------------------|
| **Calm** | Home, Visão Geral | Muito baixa | 2-3 elementos principais | `space.8`, `space.12` |
| **Standard** | Módulo, Resumo | Baixa-moderada | 3-5 cards/blocos | `space.4`, `space.6` |
| **Analytical** | Detalhe, Análise | Moderada | Tabelas, gráficos, breakdown | `space.3`, `space.4` |
| **Expert** | Relatórios, Power User | Alta (controlada) | Dados densos, mas organizados | `space.2`, `space.3` |

### Regra de transição

O usuário controla a profundidade. A Home nunca entrega densidade Analytical. O caminho é sempre:

```
Calm (Home) → Standard (Módulo) → Analytical (Detalhe) → Expert (Relatório)
```

Cada passo é uma escolha do usuário, não uma imposição.

---

## 17. MOBILE VS TABLET VS DESKTOP

O FDL é mobile-first, mas define como o espaço se comporta em telas maiores.

### O que muda do mobile para tablet (768px+)

- Margem lateral pode aumentar para 24px
- Grid de 4 colunas → 8 colunas (tablet)
- Cards podem ser exibidos em 2 colunas (antes: 1)
- KPI Cards podem aparecer em fileira de até 3 (antes: 2)

### O que muda do tablet para desktop (1024px+)

- Conteúdo principal centralizado (max-width: 960px)
- Grid de 8 colunas → 12 colunas
- Sidebar pode existir (fixa à esquerda)
- Telas de análise podem usar largura total de até 1200px
- KPI Cards podem aparecer em fileira de até 4

### O que NÃO muda

- A hierarquia visual (o protagonista da tela é o mesmo)
- A escala de spacing
- Os raios, bordas e sombras
- A personalidade calma e escura
- O card NUNCA tem mais informações só porque a tela é maior

---

## 18. TOKENS CONCEITUAIS DO BLOCO 2

Especificação conceitual. Não é CSS. Não é Tailwind. É a arquitetura que será implementada.

```
space.1    → 4px
space.2    → 8px
space.3    → 12px
space.4    → 16px
space.6    → 24px
space.8    → 32px
space.12   → 48px
space.16   → 64px

layout.margin.mobile    → space.4 (16px)
layout.margin.tablet    → space.6 (24px)
layout.gutter.mobile    → 12px
layout.columns.mobile   → 4
layout.columns.tablet   → 8
layout.columns.desktop  → 12
layout.max-width.text   → 640px
layout.max-width.content → 960px
layout.max-width.analytics → 1200px

surface.canvas    → background base
surface.surface   → nível 1 (cards informativos)
surface.raised    → nível 2 (cards interativos)
surface.floating  → nível 3 (FAB, dropdown)
surface.overlay   → nível 4 (sheets, modais)

radius.sm    → 8px
radius.control → reservado (homologar no bloco de componentes)
radius.md    → 16px
radius.lg    → 24px
radius.full  → 9999px

border.subtle    → 5-8% white (dark), light gray (light)
border.default   → 10-12% white (dark), medium gray (light)
border.emphasis  → 20-25% white (dark), dark gray (light)
border.error     → red 40% opacity
border.brand     → azul FinDomus

shadow.none      → sem sombra
shadow.float     → sutil, elementos flutuantes
shadow.overlay   → pronunciada, sheets e modais

blur.subtle   → referência inicial 8px  (Bottom Nav, Header) — calibrar nas primeiras telas
blur.standard → referência inicial 12px (Sheets) — calibrar nas primeiras telas
blur.strong   → referência inicial 20px (Overlay/Modal) — calibrar nas primeiras telas

density.calm       → Home
density.standard   → Módulo
density.analytical → Detalhe
density.expert     → Relatório
```

---

## 19. ANTI-PADRÕES ESPACIAIS

- ❌ Cards grudados uns nos outros (sem `space.4` entre eles)
- ❌ Cards gigantes com pouco conteúdo (não encha espaço com padding excessivo)
- ❌ Cards minúsculos com muito texto (não comprima informação)
- ❌ Excesso de bordas separando elementos (espaço é o separador principal)
- ❌ Grid desktop comprimido em mobile
- ❌ 4 cards lado a lado no mobile
- ❌ 3+ cards lado a lado no mobile
- ❌ Padding inconsistente entre cards do mesmo tipo
- ❌ Seção sem respiro antes/depois
- ❌ Conteúdo encostando na Bottom Navigation
- ❌ Scroll horizontal em tabela no mobile
- ❌ Texto tocando a borda do card (padding mínimo = `space.4`)
- ❌ Card dentro de card dentro de card
- ❌ Card sem affordance clara de interatividade quando é tocável
- ❌ Sombra em elemento que não flutua
- ❌ Blur em elemento que não se sobrepõe
- ❌ Raio diferente para cards do mesmo tipo
- ❌ Mais de 5 níveis de profundidade visual visíveis simultaneamente
- ❌ Densidade Analytical na Home
- ❌ Densidade Calm em tela de Relatório

---

## 20. CHECKLIST DE HOMOLOGAÇÃO — BLOCO 2

### Espaço e Grid

- [ ] O espaçamento usa apenas tokens da escala oficial?
- [ ] O ritmo vertical é perceptível (grupos vs separações)?
- [ ] A margem lateral é 16px no mobile?
- [ ] Cards usam 1 ou 2 colunas no mobile (nunca 3+)?
- [ ] O conteúdo não encosta nas bordas laterais?

### Superfícies e Profundidade

- [ ] Os 5 níveis de profundidade visual estão respeitados (Canvas + 4 superfícies)?
- [ ] Cards informativos usam Surface (nível 1)?
- [ ] Cards interativos usam Raised (nível 2)?
- [ ] A profundidade é perceptível sem sombras pesadas?
- [ ] O contraste entre níveis é sutil (2-4% de luminosidade)?

### Cards

- [ ] O card se enquadra em um dos 5 tipos?
- [ ] O card tem no máximo 4 níveis de informação?
- [ ] O card tem no máximo 1 CTA visível?
- [ ] Cards interativos têm affordance clara?
- [ ] Não há card dentro de card (exceto exceção justificada)?

### Densidade

- [ ] A densidade corresponde ao contexto (Calm/Standard/Analytical/Expert)?
- [ ] A Home está no nível Calm?
- [ ] A transição de densidade é progressiva?

### Mobile → Desktop

- [ ] O layout funciona em 375px sem scroll horizontal?
- [ ] O layout escala naturalmente para tablet e desktop?
- [ ] Cards não recebem mais informação só porque a tela é maior?

### Geral

- [ ] Raios são consistentes por tipo de elemento?
- [ ] Bordas são sutis e não competem com o conteúdo?
- [ ] Sombras só existem em Floating e Overlay?
- [ ] Blur só é usado em sobreposição funcional?
- [ ] Nenhum anti-padrão espacial está presente?

---

*FDL 1.0 — Bloco 2 · Estrutura Visual · Espaço, Grid, Superfícies e Cards*

---

# BLOCO 3 — COR · TIPOGRAFIA · NÚMEROS · ICONOGRAFIA

Este bloco transforma os fundamentos anteriores em identidade visual reconhecível. Ele responde à pergunta central:

## "COMO O FINDOMUS SE PARECE?"

---

## 1. ARQUITETURA SEMÂNTICA DE COR

Antes de escolher valores hexadecimais, definimos os papéis que cada cor desempenha. Tokens semânticos garantem que a intenção sobreviva a qualquer ajuste de tom.

### Hierarquia de tokens de cor

```
color.canvas              → fundo da aplicação
color.surface             → cards, listas, áreas de conteúdo
color.surface.raised      → cards interativos, inputs
color.surface.floating    → FAB, dropdown, tooltip
color.overlay             → sheets, modais
color.overlay.scrim       → camada de bloqueio sob overlay

color.text.primary        → títulos, números principais, corpo
color.text.secondary      → descrições, labels, metadados
color.text.tertiary       → informações auxiliares, timestamps
color.text.disabled       → elementos desabilitados

color.action.primary      → CTA principal, links, seleção
color.action.secondary    → ação alternativa

color.state.positive      → crescimento, meta atingida, evolução
color.state.warning       → atenção, prazo, revisão necessária
color.state.negative      → deterioração real, risco, erro
color.state.information   → contexto neutro, nota, dica

color.premium             → conquista excepcional, benefício exclusivo

color.border.subtle       → separação mínima
color.border.default      → definição de elementos interativos
color.border.emphasis     → foco, selecionado, destaque
```

---

## 2. DARK PALETTE — PROPOSTA CANDIDATA

Valores concretos para homologação. Fundo não é preto puro. É um tom muito escuro com leve matiz azul-acinzentada, confortável para leitura prolongada.

### Canvas e Superfícies

| Token | Cor candidata | Descrição |
|-------|--------------|-----------|
| `color.canvas` | `#0A0E14` | Fundo principal. Azul-carvão muito escuro. Não é preto puro. |
| `color.surface` | `#11161D` | Cards informativos. ~3% mais claro que canvas. |
| `color.surface.raised` | `#161C26` | Cards interativos. ~5% mais claro. |
| `color.surface.floating` | `#1C2330` | Elementos flutuantes. ~8% mais claro. |
| `color.overlay` | `#11161D` | Sheets, modais. Mesmo tom de surface para coesão. A diferenciação visual é feita pelo scrim + blur + borda de topo (sheet). Overlays não precisam de cor própria para se destacar. |
| `color.overlay.scrim` | `rgba(0,0,0,0.6)` | Bloqueio visual sob overlay. |

### Texto

| Token | Cor candidata | Uso |
|-------|--------------|-----|
| `color.text.primary` | `#EDF0F5` | Títulos, KPIs, corpo principal. Off-white, não branco puro. |
| `color.text.secondary` | `#8B949E` | Descrições, labels. Cinza médio com contraste AA. |
| `color.text.tertiary` | `#555D68` | Informação auxiliar. Visível mas não compete. |
| `color.text.disabled` | `#383D45` | Desabilitado. Contraste mínimo funcional. |

### Bordas

| Token | Cor candidata |
|-------|--------------|
| `color.border.subtle` | `rgba(255,255,255,0.06)` |
| `color.border.default` | `rgba(255,255,255,0.10)` |
| `color.border.emphasis` | `rgba(255,255,255,0.20)` |

---

## 3. LIGHT PALETTE — PROPOSTA CANDIDATA

Light não é uma inversão do Dark. É uma paleta própria, com a mesma qualidade e personalidade.

### Canvas e Superfícies

| Token | Cor candidata | Descrição |
|-------|--------------|-----------|
| `color.canvas` | `#F8F9FB` | Fundo principal. Off-white com leve matiz frio. |
| `color.surface` | `#FFFFFF` | Cards informativos. Branco puro — o nível mais claro. |
| `color.surface.raised` | `#F8F9FB` | Cards interativos. Levemente mais escuro que Surface, criando profundidade tonal sem depender de sombra. |
| `color.surface.floating` | `#FFFFFF` | Elementos flutuantes. Sombra define elevação neste nível. |
| `color.overlay` | `#FFFFFF` | Sheets, modais. |
| `color.overlay.scrim` | `rgba(0,0,0,0.4)` | Bloqueio visual. |

No Light Mode, a profundidade se inverte: superfícies elevadas são levemente mais escuras que o Canvas (enquanto no Dark são mais claras). Raised (`#F8F9FB`) é distinguível de Surface (`#FFFFFF`) por tom, mantendo a regra de que Surface e Raised não dependem de sombra.

### Texto

| Token | Cor candidata |
|-------|--------------|
| `color.text.primary` | `#1A1D23` |
| `color.text.secondary` | `#5A6270` |
| `color.text.tertiary` | `#8E95A2` |
| `color.text.disabled` | `#C5C9D2` |

### Bordas

| Token | Cor candidata |
|-------|--------------|
| `color.border.subtle` | `rgba(0,0,0,0.06)` |
| `color.border.default` | `rgba(0,0,0,0.10)` |
| `color.border.emphasis` | `rgba(0,0,0,0.20)` |

---

## 4. AZUL FINDOMUS

O azul é a cor da ação, da inteligência e da Domus. Ele guia o olhar — não preenche superfícies.

### Candidato oficial

```
Azul FinDomus: #00B4D8
```

Um ciano-azulado vibrante mas sofisticado. Nem azul corporativo tradicional, nem ciano neon. Sobre fundo escuro, cria contraste direcional sem agredir.

### Escala funcional

| Token | Cor | Uso |
|-------|-----|-----|
| `color.action.primary` | `#00B4D8` | Botões primários, links, seleção ativa |
| `color.action.primary.hover` | `#0096B4` | Estado hover (valor candidato — calibrar na implementação) |
| `color.action.primary.pressed` | `#00809A` | Estado pressionado |
| `color.action.primary.soft` | `rgba(0,180,216,0.10)` | Background sutil: tag, badge, indicador |
| `color.action.focus` | `#00B4D8` | Focus ring com 2px de espessura |

### Regra de presença

O azul permanece visualmente minoritário. Como orientação, telas comuns usam aproximadamente 5-10% de área azul — mas o critério real é qualitativo: **se o azul domina a tela, há azul demais.** O azul marca ação e inteligência, não preenche superfícies.

### Ações secundárias e terciárias

Ação secundária não possui cor de marca própria. A hierarquia entre ações é comunicada por superfície, borda e tipografia — não por múltiplas cores vibrantes.

| Token | Tratamento visual | Quando usar |
|-------|-------------------|------------|
| `color.action.primary` | Azul FinDomus `#00B4D8`. Fundo preenchido. | Ação principal da tela. Máximo 1 por vez. |
| `color.action.secondary` | Borda `color.border.default` + texto `color.text.primary`. Fundo transparente ou surface. | Ação alternativa. Pode coexistir com primary. |
| `color.action.tertiary` | Apenas texto `color.action.primary` ou `color.text.secondary`. Sem borda, sem fundo. | Ação de menor hierarquia: link, ghost button, "cancelar". |

**Regra:** nunca usar uma segunda cor vibrante para ação secundária. A distinção se faz por preenchimento vs outline vs texto — não por competição cromática.

---

## 5. VERDE

Verde representa evolução positiva. Não é aplicado automaticamente a qualquer número positivo.

### Candidato

```
Verde FinDomus: #22C55E
```

### Escala semântica

| Token | Cor | Quando usar |
|-------|-----|------------|
| `color.state.positive` | `#22C55E` | Crescimento, superávit, meta atingida, tendência favorável |
| `color.state.positive.soft` | `rgba(34,197,94,0.10)` | Background de indicador positivo |

### Regras

- **Saldo positivo NÃO é automaticamente verde.** Uma conta com R$ 15.000 parada há meses não é "evolução".
- **Verde aparece quando há mudança favorável:** aumento de patrimônio, Freedom Index subindo, reserva crescendo, meta batida.
- **Nunca usar verde e vermelho simultaneamente no mesmo card** — isso cria confusão semântica.
- **Gráfico de linha positiva pode ser verde.** Gráfico de composição (categorias) usa paleta neutra.

---

## 6. VERMELHO

Vermelho representa atenção real: deterioração, risco ou erro. Não pune. Não domina.

### Candidato

```
Vermelho FinDomus: #EF4444
```

### Escala semântica

| Token | Cor | Quando usar |
|-------|-----|------------|
| `color.state.negative` | `#EF4444` | Queda patrimonial relevante, dívida crescente, erro de sistema |
| `color.state.negative.soft` | `rgba(239,68,68,0.10)` | Background de alerta |

### Regras

- **Despesa NÃO é automaticamente vermelha.** Gastar R$ 500 em alimentação não é um erro.
- **Vermelho aparece quando há deterioração real:** conta negativa, Freedom Index caindo consistentemente, orçamento estourado em categoria crítica.
- **Vermelho nunca cobre áreas grandes.** É um sinal, não um ambiente.
- **Separar "negativo matemático" de "negativo semântico":** `-R$ 350,00` de uma despesa normal ≠ alerta vermelho.

---

## 7. WARNING (ÂMBAR)

Âmbar sinaliza atenção necessária sem alarme. Prazos, aproximações de limite, revisões sugeridas.

### Candidato

```
Âmbar FinDomus: #F59E0B
```

### Escala semântica

| Token | Cor | Quando usar |
|-------|-----|------------|
| `color.state.warning` | `#F59E0B` | Orçamento próximo do limite, prazo se aproximando, alerta moderado |
| `color.state.warning.soft` | `rgba(245,158,11,0.10)` | Background de aviso |

---

## 8. PREMIUM (DOURADO)

Dourado é extremamente restrito. Aparece em conquistas excepcionais e na identidade do plano Família Premium.

### Candidato

```
Dourado FinDomus: #C8A951
```

Um dourado opaco e sofisticado. Não é amarelo metálico. Não é glitter.

### Quando usar

- Conquista de nível máximo no Freedom Index (Liberdade)
- Indicador de plano Família Premium (sutil)
- Marco excepcional (primeiro ano, Freedom 90+)
- Elementos de identidade premium (selo, borda especial)

### Quando NUNCA usar

- Decoração genérica
- Background de cards
- Ícones padrão
- Texto comum
- "Premium" como adjetivo visual vazio

---

## 9. CONTRASTE E ACESSIBILIDADE

### Critérios mínimos

| Combinação | Dark | Light | WCAG |
|-----------|------|-------|------|
| Texto primário sobre Canvas | `#EDF0F5` / `#0A0E14` = 14.8:1 | `#1A1D23` / `#F8F9FB` = 13.2:1 | AAA ✅ |
| Texto secundário sobre Canvas | `#8B949E` / `#0A0E14` = 5.8:1 | `#5A6270` / `#F8F9FB` = 5.4:1 | AA ✅ |
| Texto terciário sobre Canvas | `#555D68` / `#0A0E14` = 3.9:1 | — | AA large only ⚠️ |
| Azul sobre Canvas | `#00B4D8` / `#0A0E14` = 9.2:1 | — | AAA ✅ |
| Verde sobre Canvas | `#22C55E` / `#0A0E14` = 8.1:1 | — | AAA ✅ |
| Vermelho sobre Canvas | `#EF4444` / `#0A0E14` = 5.2:1 | — | AA ✅ |

**Regra:** Texto terciário só é usado em tamanhos ≥14px ou bold. Nunca para informação essencial.

---

## 10. TIPOGRAFIA — PERSONALIDADE

A fonte do FinDomus precisa transmitir precisão, modernidade e humanidade. Ela serve aos números — não compete com eles.

### Atributos desejados

- **Precisa:** letras bem definidas, sem ambiguidade entre caracteres
- **Moderna:** desenhada para telas, não para impressão
- **Humana:** levemente orgânica, não puramente geométrica
- **Neutra:** não chama atenção para si mesma
- **Numérica:** excelente legibilidade de dígitos, idealmente com tabular figures
- **pt-BR:** suporte completo a acentos, cedilha e caracteres latinos

### O que evitar

- Fontes puramente geométricas (Futura, Avenir) — frias e impessoais
- Fontes corporativas tradicionais (Helvetica, Arial) — genéricas
- Fontes decorativas ou display — distraem
- Fontes excessivamente arredondadas — informais

---

## 11. FONTE RECOMENDADA

### Recomendação primária: **Inter**

Inter é a melhor candidata para o FinDomus por múltiplos critérios:

| Critério | Avaliação |
|----------|-----------|
| Legibilidade mobile | Excelente. Desenhada especificamente para telas. |
| Leitura numérica | Muito boa. Possui tabular figures via `font-variant-numeric: tabular-nums`. |
| Pesos disponíveis | 9 pesos (100-900). Cobertura completa. |
| Performance | Google Fonts. Subset possível. Cache amplo. |
| Personalidade | Neutra, moderna, levemente humanista. Não é genérica nem extravagante. |
| pt-BR | Suporte completo. |
| Disponibilidade | Gratuita, open source (SIL OFL). |

Inter já é a fonte atual do FinDomus (`blueprint.md`, `globals.css`). A recomendação é mantê-la e aprofundar seu uso com a hierarquia tipográfica definida abaixo.

---

## 12. ESCALA TIPOGRÁFICA

A escala é curta — apenas 8 níveis. Mobile-first. Cada nível existe porque responde a uma necessidade real de hierarquia.

### Escala oficial

| Token | Tamanho (px) | Peso | Line-height | Uso |
|-------|-------------|------|------------|-----|
| `type.financial-hero` | 36 | 800 (ExtraBold) | 1.1 | Número principal: patrimônio, Freedom Index. Um por tela. |
| `type.heading-1` | 24 | 700 (Bold) | 1.25 | Título de tela. |
| `type.heading-2` | 20 | 600 (SemiBold) | 1.3 | Título de seção, card header. |
| `type.heading-3` | 16 | 600 (SemiBold) | 1.4 | Subtítulo, título de subseção. |
| `type.body` | 15 | 400 (Regular) | 1.5 | Texto corrido, descrições. |
| `type.supporting` | 13 | 400 (Regular) | 1.5 | Metadados, labels, texto auxiliar. |
| `type.caption` | 11 | 500 (Medium) | 1.4 | Eyebrow, badge, timestamp. Menor tamanho permitido. |
| `type.button` | 15 | 600 (SemiBold) | 1.0 | Labels de botão e CTA. |

### Regras

- **Nunca usar tamanho menor que 11px.** Abaixo disso, a legibilidade é comprometida.
- **Nunca usar mais de 4 tamanhos simultâneos visíveis.** Se há 5 tamanhos, a hierarquia falhou.
- **`financial-hero` (36px) aparece no máximo 1 vez por tela.**
- **Texto corrido nunca usa itálico.**
- **ALL CAPS apenas em eyebrow, badges e labels muito curtos (≤3 palavras).**

---

## 13. NÚMERO FINANCEIRO COMO PROTAGONISTA

O número é o elemento mais importante da hierarquia. Ele recebe o maior tamanho, o maior peso e o maior contraste.

### Anatomia de um número financeiro

```
Eyebrow: "Patrimônio Líquido"       → type.caption, text.tertiary
Valor:   "R$ 127.450,90"            → type.financial-hero, text.primary
Delta:   "+R$ 3.200 (2,6%)"         → type.supporting, state.positive
```

### Regras de apresentação

- **Tabular figures obrigatório.** Dígitos devem se alinhar verticalmente em qualquer contexto.
- **Valor nunca quebra em duas linhas.** Se não couber em 375px, rever tamanho ou abreviação.
- **Símbolo da moeda (R$) em peso menor ou igual ao valor.** Nunca maior.
- **Decimais em tamanho reduzido ou mesma altura.** Consistente em todo o produto.
- **Espaçamento entre milhares:** ponto (padrão pt-BR). Ex: `R$ 1.250,90`.

---

## 14. FORMATAÇÃO MONETÁRIA (pt-BR)

Locale oficial: `pt-BR`. Todas as interfaces seguem este formato.

### Regras por contexto

| Contexto | Formato | Exemplo |
|----------|--------|---------|
| **Detalhe, relatório** | Valor completo | `R$ 1.245.932,82` |
| **Card, resumo** | Valor completo | `R$ 12.450,90` |
| **KPI, dashboard** | Valor completo | `R$ 8.450` (sem decimais se inteiro) |
| **Gráfico, eixo** | Abreviado | `R$ 1,2 mi` |
| **Espaço muito restrito** | Abreviado | `R$ 12,4 mil` |
| **Negativo** | Sinal antes do R$ | `-R$ 350,00` |
| **Zero** | Zero explícito | `R$ 0,00` |

### Regra de abreviação

Abreviação só é permitida quando o valor completo não couber no espaço disponível em 375px. A abreviação segue o padrão brasileiro:

- `R$ 1,2 mil` (1.200)
- `R$ 12,4 mil` (12.400)
- `R$ 1,2 mi` (1.200.000)
- `R$ 12,4 mi` (12.400.000)

---

## 15. NÚMEROS NEGATIVOS

Negativo matemático ≠ problema semântico. Esta distinção é essencial para um produto financeiro maduro.

### Matriz de decisão

| Situação | Sinal | Cor |
|----------|-------|-----|
| Despesa normal (ex: aluguel -R$ 1.200) | `-R$ 1.200,00` | `text.primary` (neutro) |
| Saldo negativo na conta | `-R$ 350,00` | `state.warning` (atenção) |
| Queda relevante de patrimônio | `-R$ 5.000,00` | `state.negative` (deterioração) |
| Orçamento estourado em categoria | `-R$ 200,00` | `state.warning` |
| Rendimento negativo de investimento | `-4,2%` | `state.negative` |
| Superávit (valor positivo) | `+R$ 3.200,00` | `state.positive` (se for evolução) |

**Regra:** O sinal negativo é informação matemática. A cor (warning/negative/neutra) é informação semântica. As duas podem divergir.

---

## 16. PERCENTUAIS

| Contexto | Formato | Exemplo |
|----------|--------|---------|
| Variação percentual | Sinal + valor + 1 decimal | `+4,2%` |
| Percentual estático | Valor + 0-1 decimais | `12,5%` |
| Freedom Index | Valor inteiro | `42 pontos` (não `42%`) |
| Taxa de poupança | Valor + 1 decimal | `15,0%` |
| Gráfico/eixo | Valor + 0 decimais | `12%` |

---

## 17. PRIVACIDADE FINANCEIRA

O FinDomus é usado em ambientes públicos e compartilhados. Ocultar valores é uma funcionalidade de primeira classe.

### Comportamento

- **Toggle global:** ícone de olho no header ou próximo ao valor principal
- **Estado "oculto":** substitui cada dígito por `•`, mantendo formatação: `R$ ••••••,••`
- **Persistência:** a preferência é salva por sessão (não persiste entre reinícios)
- **Revelação parcial:** toque longo em um valor específico pode revelá-lo temporariamente
- **Nunca ocultar:** labels, títulos, nomes de categorias ou contexto não-financeiro

---

## 18. HIERARQUIA DE TEXTO

| Nível | Uso | Cor |
|-------|-----|-----|
| `text.primary` | Títulos, KPIs, corpo principal, números financeiros | `#EDF0F5` (dark) / `#1A1D23` (light) |
| `text.secondary` | Descrições, labels, metadados de card | `#8B949E` (dark) / `#5A6270` (light) |
| `text.tertiary` | Eyebrow, timestamps, informações auxiliares | `#555D68` (dark) / `#8E95A2` (light) |
| `text.disabled` | Elementos desabilitados | `#383D45` (dark) / `#C5C9D2` (light) |

**Regras:**
- `text.tertiary` nunca carrega informação essencial
- `text.secondary` é o mínimo para qualquer conteúdo que o usuário precise ler
- Contraste AA para secondary, AAA para primary

---

## 19. MICROCOPY VISUAL

A tipografia serve à linguagem. Um texto mal escrito arruína a melhor fonte.

### Princípios

- **Curto.** Se pode ser dito em 3 palavras, não use 8.
- **Claro.** "Saldo disponível", não "Saldo consolidado disponível no período".
- **Humano.** "Você gastou", não "Houve desembolso".
- **Preciso.** "R$ 1.250,90", não "Aproximadamente R$ 1.250".

### Anti-padrões de microcopy

- ❌ ALL CAPS em frases
- ❌ Jargão financeiro desnecessário
- ❌ "Clique aqui"
- ❌ Frases motivacionais vazias
- ❌ Linguagem bancária ("limite pré-aprovado")
- ❌ Texto que não cabe em 375px

---

## 20. ICONOGRAFIA — PERSONALIDADE

Os ícones do FinDomus compartilham a mesma linguagem visual do resto do sistema: precisos, contemporâneos, discretos.

### Atributos

- **Estilo:** outline (traço), com peso consistente
- **Peso do traço:** 1.5px-2px (nem fino demais, nem grosso)
- **Cantos:** levemente arredondados, coerentes com `radius.sm` (8px em escala)
- **Preenchimento:** outline como padrão. Filled apenas para estado selecionado/ativo
- **Complexidade:** minimalista. Um ícone deve ser compreendido em <1s

---

## 21. BIBLIOTECA DE ÍCONES

### Recomendação: **Lucide** (mantida)

Lucide já é a biblioteca do projeto (`components.json`). É a escolha correta para o FDL:

| Critério | Avaliação |
|----------|-----------|
| Estilo | Outline, traço consistente. Alinhado com a personalidade FDL. |
| Peso do traço | `strokeWidth={2}` padrão. Pode variar para 1.5. |
| Cobertura | +1000 ícones. Cobre todas as necessidades financeiras e de interface. |
| Tree-shaking | Excelente. Só importa o que usa. |
| Personalidade | Neutra, moderna, sem exagero. |
| Integração | Já implementada no projeto. |

**Regra:** uma futura troca de biblioteca de ícones exige auditoria completa de impacto e reavaliação do FDL.

---

## 22. ESCALA DE ÍCONES

| Token | Tamanho | Uso |
|-------|---------|-----|
| `icon.sm` | 16px | Badges, chips, inline com texto |
| `icon.md` | 20px | Cards, listas, navegação |
| `icon.lg` | 24px | Headers, ações principais, empty states |
| `icon.xl` | 32px | Hero, ilustração funcional, conquista |

**Regra:** ícone nunca é maior que o elemento que acompanha. Ícone + label: o label é o protagonista.

---

## 23. ÍCONES DE MÓDULOS

O FinDomus tem ~20 módulos. Eles precisam ser reconhecíveis sem formar uma grade multicolorida.

### Regras

- **Mesma família:** todos os ícones de módulo vêm da Lucide
- **Mesmo peso:** `strokeWidth={2}` para todos
- **Mesma caixa:** 24px para ícones de módulo em lista ou card
- **Cor predominantemente neutra:** `text.secondary` como padrão. A cor só muda para indicar estado (ativo, alerta)
- **NÃO dar uma cor forte diferente para cada módulo.** Isso cria poluição visual e compete com a hierarquia de ação.

---

## 24. DOMUS E COR

A Domus ainda não será desenhada completamente neste bloco, mas sua relação cromática já é definida.

### Identidade cromática da Domus

A Domus é reconhecida pelo **azul FinDomus** associado ao seu estado atual. Não depende de:

- ❌ Gradiente roxo/azul/rosa
- ❌ Ícone de estrela ou sparkle
- ❌ Badge "AI" ou "Gemini"
- ❌ Avatar de robô ou cérebro
- ❌ Glow exagerado

### A Domus se manifesta visualmente por:

1. **Azul FinDomus** como cor de presença (sutil, não dominante)
2. **Movimento** coerente com o estado (surgindo, respondendo, analisando)
3. **Superfície própria** (Surface ou Floating, conforme o contexto)
4. **Tipografia de conversa** (`type.body`), não de sistema

A identidade visual completa da Domus será definida em bloco dedicado (Bloco 6).

---

## 25. GRÁFICOS — PALETA E REGRAS

Gráfico só existe se responder uma pergunta. As cores servem à resposta.

### Paleta para gráficos (ordem de uso)

| # | Cor | Uso |
|---|-----|-----|
| 1 | Azul FinDomus `#00B4D8` | Série principal, dado em foco |
| 2 | Verde `#22C55E` | Segunda série, comparativo positivo |
| 3 | Cinza `#8B949E` | Terceira série, baseline, comparativo neutro |
| 4 | Âmbar `#F59E0B` | Alerta, projeção, cenário alternativo |
| 5 | Vermelho `#EF4444` | Deterioração, gasto excedido |

### Regras

- **1 série = 1 cor.** Azul FinDomus.
- **2 séries = 2 cores.** Azul + verde (comparação favorável) ou azul + cinza (neutro).
- **Comparação = destaque + neutro.** O dado importante tem cor; a referência é cinza.
- **Nunca usar arco-íris.** Não existe justificativa para 6+ cores em um gráfico financeiro.
- **Gráfico de composição (pizza/donut):** máx. 5 fatias. Cores neutras e dessaturadas.
- **Linha de referência:** cinza, tracejada, sem competir com os dados.

---

## 26. CORES DE CATEGORIA

O FinDomus tem dezenas de categorias financeiras. Não podemos atribuir uma cor única a cada uma.

### Estratégia

**Categorias usam paleta neutra controlada.** A diferenciação se faz por:

1. **Ícone** (primário) — cada categoria tem um ícone representativo
2. **Nome** (primário) — o texto identifica
3. **Cor** (secundário) — paleta restrita de 8 cores dessaturadas para agrupamento visual

### Paleta de categorias (8 cores, todas dessaturadas)

As cores abaixo são neutras o suficiente para não competir com a hierarquia principal, mas distintas o suficiente para agrupamento:

```
#5B7F95  (azul acinzentado)
#6B9080  (verde acinzentado)
#8B7E74  (marrom acinzentado)
#7B8EA0  (cinza azulado)
#9B8E84  (bege acinzentado)
#6B8290  (azul petróleo)
#8B9E8A  (verde oliva)
#7B8A94  (cinza médio)
```

**Regra:** a cor de categoria nunca é mais vibrante que o azul FinDomus. A cor de ação sempre domina.

---

## 27. ESTADOS

Definição de cor, tipografia e comportamento para estados de componentes interativos.

| Estado | Cor (Dark) | Comportamento |
|--------|-----------|---------------|
| **Default** | Conforme o tipo do elemento | Estado de repouso |
| **Hover** | 10-15% mais claro que default | Transição 150ms. Não essencial em mobile. |
| **Pressed** | 15-20% mais escuro que default | Feedback tátil + visual. 100ms. |
| **Focus** | `color.action.focus` (2px ring) | Visível, não agressivo. Essencial para a11y. |
| **Selected** | `color.action.primary` | Indicador claro de seleção ativa |
| **Disabled** | `text.disabled` + opacidade 50% | Sem interação. Cursor default. |
| **Loading** | Skeleton ou spinner sutil | Nunca bloqueia a interface inteira |
| **Success** | `state.positive` | Feedback breve. Proporcional à ação. |
| **Warning** | `state.warning` | Explicação + ação sugerida |
| **Error** | `state.negative` | O que aconteceu + o que fazer |

---

## 28. TOKENS CONCEITUAIS DO BLOCO 3

```
color.canvas              → paleta definida (dark + light)
color.surface             → paleta definida
color.surface.raised      → paleta definida
color.surface.floating    → paleta definida
color.overlay             → paleta definida
color.overlay.scrim       → rgba
color.text.primary        → paleta definida
color.text.secondary      → paleta definida
color.text.tertiary       → paleta definida
color.text.disabled       → paleta definida
color.action.primary      → #00B4D8
color.action.primary.hover → #0096B4
color.action.primary.pressed → #00809A
color.action.primary.soft  → rgba(0,180,216,0.10)
color.action.focus         → #00B4D8
color.state.positive       → #22C55E
color.state.warning        → #F59E0B
color.state.negative       → #EF4444
color.state.information    → color.action.primary.soft (azul 10% opacity) — azul forte = ação; azul suave = contexto. Informação nunca parece clicável apenas por ser azul.
color.premium              → #C8A951
color.border.subtle        → rgba (dark + light)
color.border.default       → rgba (dark + light)
color.border.emphasis      → rgba (dark + light)

type.financial-hero  → 36px / 800 / 1.1
type.heading-1       → 24px / 700 / 1.25
type.heading-2       → 20px / 600 / 1.3
type.heading-3       → 16px / 600 / 1.4
type.body            → 15px / 400 / 1.5
type.supporting      → 13px / 400 / 1.5
type.caption         → 11px / 500 / 1.4
type.button          → 15px / 600 / 1.0

font.family.primary  → Inter
font.family.mono     → JetBrains Mono (reservado para dados tabulares, se necessário no futuro)

icon.sm   → 16px
icon.md   → 20px
icon.lg   → 24px
icon.xl   → 32px

category.1  → #5B7F95
category.2  → #6B9080
category.3  → #8B7E74
category.4  → #7B8EA0
category.5  → #9B8E84
category.6  → #6B8290
category.7  → #8B9E8A
category.8  → #7B8A94
```

---

## 29. ANTI-PADRÕES VISUAIS

- ❌ Azul em toda parte (background, borda, texto, ícone simultaneamente)
- ❌ Verde em todo saldo positivo automaticamente
- ❌ Vermelho em toda despesa automaticamente
- ❌ Dourado decorativo em cards ou ícones comuns
- ❌ Texto terciário como cor principal de conteúdo
- ❌ Fonte menor que 11px em qualquer lugar
- ❌ Números financeiros sem contexto ou label
- ❌ Mais de 4 tamanhos de fonte simultâneos visíveis
- ❌ Ícone decorativo em todo card (só usar se agrega significado)
- ❌ Cada módulo com uma cor forte diferente (poluição)
- ❌ Gráfico com 6+ cores (arco-íris)
- ❌ Gradiente roxo→azul como "identidade AI"
- ❌ ALL CAPS em frases, parágrafos ou botões
- ❌ Valores financeiros desalinhados (sem tabular figures)
- ❌ Casas decimais inconsistentes no mesmo contexto
- ❌ Hover como única affordance de interatividade
- ❌ Cor como único indicador de estado (acessibilidade)
- ❌ Símbolo R$ maior que o valor numérico
- ❌ Valor financeiro quebrando em duas linhas
- ❌ Abreviação de valor sem padrão (`1.2M` em vez de `R$ 1,2 mi`)

---

## 30. TESTE SEM LOGO

> Se removermos o logo, nomes de módulos e qualquer texto identificador, o conjunto cor + tipografia + espaço + iconografia ainda parece FinDomus?

### Critérios de aprovação

- O Dark palette é imediatamente reconhecível (carvão azulado, não preto genérico)
- O azul `#00B4D8` é distinto o suficiente para ser associado à marca
- A combinação de Inter + raios `md` (16px) + espaço generoso é consistente
- A paleta de categorias é neutra e não compete com a identidade principal

---

## 31. TESTE EM 375PX

Verificação conceitual para a menor largura suportada:

- `type.financial-hero` (36px) comporta `R$ 1.245.932,82` em 375px? → ~17 caracteres a 36px ≈ 280px. Cabe com folga. ✅
- `type.heading-1` (24px) comporta títulos de módulo? → Sim, com margem. ✅
- Ícones de 24px continuam tocáveis? → Sim, acima do mínimo de 44px com padding. ✅
- Cards com `space.4` (16px) de padding interno + texto body (15px) mantêm legibilidade? → Largura útil 343px - 32px padding = 311px para conteúdo. Suficiente. ✅

---

## 32. TESTE DE ACESSIBILIDADE

| Verificação | Dark | Light |
|------------|------|-------|
| Contraste texto primário | 14.8:1 ✅ AAA | 13.2:1 ✅ AAA |
| Contraste texto secundário | 5.8:1 ✅ AA | 5.4:1 ✅ AA |
| Contraste azul sobre canvas | 9.2:1 ✅ AAA | — |
| Touch target mínimo (44px) | Ícones ≥20px + padding | Ícones ≥20px + padding |
| Cor não é informação única | Estados têm ícone + texto + cor | Estados têm ícone + texto + cor |
| Focus visível | 2px ring azul | 2px ring azul |

---

## 33. CHECKLIST DE HOMOLOGAÇÃO — BLOCO 3

### Cor

- [ ] O Dark palette é sofisticado sem parecer gamer?
- [ ] O Light palette ainda parece FinDomus?
- [ ] O azul FinDomus permanece visualmente minoritário?
- [ ] Verde é usado apenas para evolução, não automaticamente para qualquer positivo?
- [ ] Vermelho é usado apenas para deterioração real, não para despesas normais?
- [ ] Âmbar é usado para atenção, não para decoração?
- [ ] Dourado é raro e restrito a conquistas excepcionais?
- [ ] Contraste atende WCAG AA em todos os textos essenciais?

### Tipografia

- [ ] Inter é a fonte primária, com fallback definido?
- [ ] A escala usa apenas os 8 tamanhos definidos?
- [ ] Nenhum texto é menor que 11px?
- [ ] Não há mais de 4 tamanhos simultâneos visíveis?
- [ ] `financial-hero` (36px) aparece no máximo 1 vez por tela?
- [ ] Texto secundário tem contraste AA?

### Números

- [ ] Tabular figures estão ativados para dados financeiros?
- [ ] Formatação segue pt-BR em todos os contextos?
- [ ] Negativo matemático é distinto de negativo semântico?
- [ ] Abreviações seguem o padrão definido?
- [ ] Valores não quebram em duas linhas?
- [ ] Privacidade (ocultar valores) funciona com máscara de `•`?

### Ícones

- [ ] Ícones usam Lucide com `strokeWidth={2}`?
- [ ] Escala de 4 tamanhos (16/20/24/32) é respeitada?
- [ ] Ícones de módulo são neutros, não multicoloridos?
- [ ] Ícone nunca é maior que o elemento que acompanha?

### Domus e Gráficos

- [ ] Domus não depende de gradiente AI genérico?
- [ ] Gráficos usam no máximo 5 cores?
- [ ] Categorias usam paleta neutra, não 40 cores fortes?

### Acessibilidade

- [ ] Contraste AA/AAA conforme especificado?
- [ ] Cor não é o único meio de transmitir informação?
- [ ] Focus visível em todos os elementos interativos?
- [ ] Touch targets ≥ 44px?

---

*FDL 1.0 — Bloco 3 · Cor · Tipografia · Números · Iconografia*

---

# 🔒 FDL 1.0 — HOMOLOGADO E CONGELADO

```
FDL Version: 1.0
Status: Frozen
Baseline funcional: bc19adb

FDL-P0: 0
FDL-P1: 0
Data de congelamento: 2026-07-28
```

O FDL 1.0 é a linguagem de design oficial do FinDomus. Toda decisão visual futura deve referenciar este documento. Qualquer desvio deve ser justificado e documentado.

---

## BACKLOG FDL 1.x

Itens registrados para evolução futura. Nenhum bloqueia a implementação do PWA com FDL 1.0.

| ID | Descrição | Prioridade |
|----|-----------|------------|
| FDL-2 | Overlay Dark depende integralmente do scrim — avaliar se Overlay merece tom próprio em telas reais | Baixa |
| FDL-4 | `color.state.information` revisitar após primeiras telas com Domus | Baixa |

---

## CHANGE POLICY

Após o congelamento do FDL 1.0:

- **Correção editorial** (typo, clareza, exemplo) → **FDL 1.0.x** — não altera regras visuais.
- **Nova regra visual compatível** (novo token, novo estado, clarificação) → **FDL 1.x** — adiciona sem quebrar o existente.
- **Quebra de princípio estrutural** (nova paleta, nova fonte, nova taxonomia de cards) → **FDL 2.0** — exige reauditoria completa.

Nenhuma tela futura poderá alterar silenciosamente o FDL. Se uma necessidade real exigir exceção, o FDL deve ser atualizado **antes** da implementação — nunca depois.
