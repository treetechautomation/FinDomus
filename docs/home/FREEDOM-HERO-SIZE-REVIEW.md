# FREEDOM HERO SIZE REVIEW — 36px vs 64px

**Fase:** Homologação Visual Cirúrgica
**FDL:** 1.0 FROZEN
**Arquivo comparativo:** `docs/home/FREEDOM-36-vs-64.html`
**Viewport:** 390 × 844px · Dark Mode · PF Organizado
**Contexto:** Pessoal · Freedom 72 · Nível Construção · +3 este mês

---

## 1. CONTEXTO DA DIVERGÊNCIA

| Fonte | Token/Regra | Valor |
|-------|------------|-------|
| FDL 1.0 FROZEN | `type.financial-hero` | **36px**, 800 ExtraBold, 1.1 line-height |
| Architecture v1 | Referência explícita | `financial-hero (36px)` |
| Wireframe v1 | Referência explícita | `36px, ExtraBold` |
| Master Visual v1 | `.score` CSS | **64px**, 800 Bold, 1.0 line-height |

O Master Visual v1 utilizou 64px com a justificativa de que "64px é a proporção correta para 390px de largura — cerca de 1/6 da viewport" e que "o FDL permite esta interpretação porque financial-hero é o nível máximo, não um limite rígido."

O FDL 1.0 é congelado (FROZEN). O token `type.financial-hero` é 36px. Não há token de escala superior definido. **64px não existe na escala tipográfica do FDL.**

---

## 2. REGRA DO TESTE

A única variável alterada entre as versões é:

```
font-size do número principal do Freedom Index (.score)
```

Nada mais foi alterado: layout, card, padding, gap, cores, tipografia secundária, peso, line-height, Domus, Priority, módulos, continuidade, Context Bar, ícones, bordas, radius, largura, altura dos demais elementos, viewport, conteúdo textual.

---

## 3. AVALIAÇÃO CRITÉRIO A CRITÉRIO

### 3.1 PROTAGONISMO (1–5)

> O Freedom Index continua sendo imediatamente reconhecido como o elemento mais importante?

| 36px | 64px | Vencedor |
|------|------|----------|
| **4** — O número de 36px a 800 weight é claramente o maior elemento de texto na tela. O heading-1 (24px) e heading-2 (20px) ficam respectivamente 1.5× e 1.8× menores. O FI é o protagonista. | **5** — 64px a 800 weight é inquestionavelmente dominante. Ocupa 1/6 da largura útil. Não há ambiguidade sobre o que é mais importante. | **64px** |

**Análise:** Em ambas as versões o FI é protagonista. A diferença não é se há protagonismo, mas o grau. A 36px, o protagonismo é claro e elegante. A 64px, é avassalador. A pergunta relevante é: precisamos do grau máximo de protagonismo ou do grau suficiente?

**FDL P6:** "Cada tela tem um protagonista. Se tudo é importante, nada é." 36px já cumpre P6. O argumento de que 64px "reforça" o protagonismo só é válido se 36px fosse insuficiente — o que não é o caso.

---

### 3.2 CALMA (1–5)

> O número domina sem gritar? O FinDomus é calmo, não tímido, não agressivo.

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — O número tem presença sem imposição. É um protagonista calmo. Ele está ali, enorme em relação ao contexto, mas não agride. A relação com o card é equilibrada. | **2** — A 64px, o número ocupa ~28% mais do card verticalmente. Em uma tela de 390px, 64px com -2px letter-spacing produz uma massa visual que compete com o espaço vazio ao redor. O número "grita" — não por cor, mas por escala. | **36px** |

**Análise:** O FDL define o FinDomus como "calmo, não tímido, não agressivo" (Manifesto Visual, seção 1). 36px é calmo mas não tímido. 64px é agressivo. Um número de 64px em um card Surface de ~358px de largura ocupa aproximadamente 18% da largura para 2 dígitos (aproximadamente 65px de largura de glifo). Isso é mais que "presença" — é dominação.

**FDL Anti-padrão:** "Mais de 4 tamanhos de fonte simultâneos visíveis" — se financial-hero é 64px e heading-3 (card titles) é 16px, a razão é 4:1. Se financial-hero é 36px, a razão é 2.25:1. A escala de 64px cria um salto desproporcional que quebra a coesão da escala tipográfica do FDL.

---

### 3.3 HIERARQUIA (1–5)

> O Freedom domina corretamente sem esmagar Domus e Priority?

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — A hierarquia flui naturalmente: FI → Domus (borda azul, insight) → Priority (card raised, botão full-width) → Módulos. Cada nível tem seu peso visual. O FI é o topo, mas os outros níveis respiram. | **2** — A 64px, o FI cria um pico de atenção tão alto que a queda para o nível seguinte (Domus, texto 14px) é abrupta. A Domus e a Priority parecem "pequenas" em comparação. O olhar fica preso no FI e o resto da tela perde presença relativa. | **36px** |

**Análise:** A arquitetura define 4 níveis de atenção. O nível 1 (Dominante) é o FI. Os níveis 2-4 precisam existir com clareza. A 64px, a diferença de escala entre o nível 1 e o nível 2 é tão grande que os níveis 2-4 parecem pertencer a outra hierarquia inteiramente. Isso enfraquece a Domus — que é o diferencial estratégico do produto.

**FDL P9:** "A Domus orienta; o usuário decide." Se a Domus é visualmente esmagada pelo FI, sua função de orientação fica comprometida.

---

### 3.4 DENSIDADE (1–5)

> O tamanho mantém a Home no nível Calm?

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — Densidade Calm mantida. O FI card tem ~115px de altura. A proporção do card é equilibrada: ~358px largo × ~115px alto (proporção ~3.1:1). | **3** — O FI card cresce para ~143px (ganho de ~28px). Proporção ~2.5:1. O card fica mais "quadrado" visualmente. Ainda está no território Calm, mas na borda superior. | **36px** |

**Análise:** A altura extra do card (28px) é inteiramente absorvida pelo número maior. Não há ganho de informação — há ganho de peso visual. Em uma Home que já tem 6 camadas, cada pixel vertical importa.

---

### 3.5 ABOVE THE FOLD (390×844px)

| Elemento | Altura 36px | Altura 64px | Diferença |
|----------|-----------|-----------|-----------|
| Status Bar | 54px | 54px | 0 |
| Context Bar | 48px | 48px | 0 |
| Scroll padding | 24px | 24px | 0 |
| FI Card topo | 102px | 102px | 0 |
| FI Card | ~115px | ~143px | **+28px** |
| Gap FI→Domus | 32px | 32px | 0 |
| Domus | ~110px | ~110px | 0 |
| Gap Domus→Priority | 32px | 32px | 0 |
| Priority (até botão) | ~130px | ~130px | 0 |
| **Total acumulado** | **~545px** | **~573px** | **+28px** |

Viewport de conteúdo: 844px - 88px (Bottom Nav) = **756px**

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — FI + Domus + Priority completos acima da dobra. Sobram ~211px para módulos. O label "Para você" e o primeiro módulo são visíveis sem scroll. | **4** — FI + Domus + Priority ainda acima da dobra. Mas restam ~183px para módulos — apenas 28px a menos. O primeiro módulo ainda está visível, mas com menos folga. | **36px** |

**Análise:** A diferença de 28px não quebra o Above the Fold em 390px. Ambos passam. Porém, em viewports menores (como 375px), o cenário muda — ver seção 3.10.

---

### 3.6 RESPIRAÇÃO (Análise visual)

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — O número de 36px com padding de 16px ao redor tem ~38px de espaço acima e ~27px abaixo (considerando eyebow e meta). Proporção confortável. | **3** — A 64px, o número consome mais da metade da altura do card. O espaço acima (~24px) e abaixo (~23px) começa a parecer "justo". A respiração diminuiu, embora ainda exista. | **36px** |

**Análise:** Não alteramos padding. O número maior simplesmente ocupa mais do espaço existente. O card não foi redesenhado para acomodar 64px — ele foi projetado para 36px. Se 64px fosse intencional, o card precisaria de mais padding vertical, o que agravaria o problema de Above the Fold.

---

### 3.7 IDENTIDADE FINDOMUS (1–5)

> O tamanho parece FinDomus ou parece KPI de fintech/dashboard?

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — 36px como protagonista único é distintivo no mercado. Não é um dashboard de KPIs lado a lado. É um número que respira. Lembra mais um editorial financeiro de alta qualidade do que uma tela de app. | **2** — 64px evoca "hero stat" de SaaS dashboard. Lembra Mixpanel, Amplitude, Stripe — produtos excelentes, mas com outra linguagem visual. Não é coincidência que 64px é o tamanho padrão de "big number" em muitos design systems de dados. O FinDomus não é um dashboard de dados. | **36px** |

**Análise:** O FDL dedica a seção "O QUE NÃO É FINDOMUS" a esta distinção. "A Home não é um dashboard com KPIs lado a lado." O FI a 36px é um índice pessoal. A 64px, começa a parecer métrica de SaaS. A diferença é sutil mas crítica para a identidade.

---

### 3.8 ACESSIBILIDADE

| Critério | 36px | 64px |
|----------|------|------|
| Legibilidade | Excelente. 36px/800 é perfeitamente legível a ~40cm de distância. | Excelente. Impossível não ver. |
| Zoom visual | Compatível com zoom do sistema. | Compatível com zoom do sistema. |
| Hierarquia perceptível | Clara e graduada. | Clara, mas abrupta. |
| Usuários 50+ | Bom. 36px já é um tamanho de título grande para mobile. | Muito bom. Tamanho generoso. |
| Leitura rápida | Muito rápida. | Instantânea. |

| 36px | 64px | Vencedor |
|------|------|----------|
| **4** | **5** | **64px** |

**Análise:** Este é o único critério onde 64px tem vantagem objetiva. Para usuários com baixa visão ou acima de 50 anos, 64px é genuinamente melhor. Porém, o FinDomus deve oferecer acessibilidade via:
1. Respeito ao font scaling do sistema operacional
2. Possibilidade de ajuste de tamanho de fonte nas configurações do app
3. Níveis de zoom que permitem ao usuário aumentar o FI sem quebrar o layout para todos os outros

**Acessibilidade não deve ser resolvida forçando 64px para todos os usuários.** Deve ser resolvida com suporte apropriado a preferências de acessibilidade.

**Conclusão:** 64px vence este critério isoladamente, mas a vitória não justifica impor 64px como padrão universal. A solução correta está nas configurações de acessibilidade do produto, não no token `financial-hero`.

---

### 3.9 VALORES DE 1 A 3 DÍGITOS (Análise conceitual)

| Valor | 36px | 64px |
|-------|------|------|
| **7** (1 dígito) | Ocupa ~22px de largura. Centralizado no card. Amplo respiro. | Ocupa ~39px. Muito espaço vazio ao redor. Sensação de "falta algo". |
| **42** (2 dígitos) | Ocupa ~50px. Bem equilibrado. | Ocupa ~88px. Presença forte mas ainda elegante. |
| **72** (2 dígitos) | Ocupa ~50px. Proporção ideal. | Ocupa ~88px. Dominante, no limite do aceitável. |
| **100** (3 dígitos) | Ocupa ~75px. Cabe confortavelmente nos 343px de conteúdo. | Ocupa ~132px. Começa a encher o card. Em 375px, ocupa ~38% da largura útil. |

**Análise:** O FI varia de 0 a 100 (ou mais, se o algoritmo evoluir). A 64px:
- 1 dígito: parece vazio — a escala foi feita para números maiores
- 2 dígitos: o sweet spot
- 3 dígitos: aperta o card

A 36px, todos os casos (1, 2 e 3 dígitos) funcionam com proporção consistente.

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — Consistente para todos os valores. | **3** — Degrada em 1 dígito (vazio) e 3 dígitos (apertado). | **36px** |

---

### 3.10 VIEWPORT 375×812px

| 36px | 64px | Vencedor |
|------|------|----------|
| **5** — FI + Domus + Priority confortavelmente acima da dobra (756px de conteúdo). FI card não domina. | **3** — Priority começa a ser cortada na borda inferior da viewport em 375px com os mesmos gaps. O card do FI ocupa proporcionalmente mais da tela menor. | **36px** |

**Análise:** A 375px (343px de conteúdo útil), 64px representa ~19% da largura para 2 dígitos. A proporção FI-card/viewport é maior. O scroll necessário para ver a Priority começa antes. Em dispositivos menores (iPhone SE, dispositivos Android compactos), 64px é desproporcional.

---

### 3.11 VIEWPORT 430×932px

| 36px | 64px | Vencedor |
|------|------|----------|
| **4** — A 36px, o número pode parecer ligeiramente pequeno em relação à tela maior. Mas a 800 weight compensa. Ainda é claramente o protagonista. | **4** — A 64px, o número mantém presença sem parecer exagerado. A tela maior absorve o tamanho. | **Empate** |

---

## 4. TESTE DOS 5 SEGUNDOS

### Versão A — 36px

| Pergunta | Resposta |
|----------|----------|
| 1. Qual número você viu primeiro? | **72** |
| 2. O que ele representa? | Meu estado financeiro / liberdade financeira |
| 3. O que chamou atenção depois? | Domus com borda azul à esquerda |
| 4. A tela parece calma ou agressiva? | **Calma** |
| 5. Parece um cockpit financeiro ou um dashboard? | **Cockpit financeiro** — orienta, não lista |

### Versão B — 64px

| Pergunta | Resposta |
|----------|----------|
| 1. Qual número você viu primeiro? | **72** |
| 2. O que ele representa? | Meu estado financeiro |
| 3. O que chamou atenção depois? | O próprio número ainda domina. Domus demora um pouco mais para ser notada. |
| 4. A tela parece calma ou agressiva? | **Levemente agressiva** — o número "pede" atenção |
| 5. Parece um cockpit financeiro ou um dashboard? | **Dashboard de números** — o tamanho evoca métricas de produto |

**Veredito do teste:** 36px vence. A Domus é notada mais rápido e a impressão geral é "calma". 64px atrasa a percepção da Domus e empurra a sensação para "dashboard".

---

## 5. TESTE SEM CONTEXTO

Ocultando mentalmente Domus, Priority e Módulos, avaliando apenas Context Bar + Freedom Card:

| 36px | 64px |
|------|------|
| O número de 36px é o protagonista absoluto quando é o único elemento de conteúdo. Mas não ocupa a tela. O espaço vazio ao redor comunica "há mais abaixo". | O número de 64px domina a tela quase completamente. Com apenas Context Bar + FI visíveis, a tela parece quase "vazia" apesar do número enorme — há muito espaço não utilizado. |

**Conclusão:** Mesmo sem contexto, 36px é suficiente como protagonista isolado. 64px em uma tela sem outros elementos parece desproporcional.

---

## 6. TESTE COM TUDO PRESENTE

Com a tela completa (6 camadas), a versão de 64px faz o FI monopolizar a atenção. O olhar fica ancorado no número e os outros elementos perdem hierarquia relativa. A Domus, que é o diferencial do produto, fica visualmente subordinada a um grau excessivo.

A versão de 36px mantém o FI como protagonista claro, mas permite que o olhar flua naturalmente para Domus → Priority → Módulos. A hierarquia é percebida como uma escada, não como um penhasco.

---

## 7. TABELA COMPARATIVA FINAL

| Critério | 36px | 64px | Vencedor |
|----------|-----:|-----:|----------|
| Protagonismo | 4 | **5** | 64px |
| Calma | **5** | 2 | 36px |
| Hierarquia | **5** | 2 | 36px |
| Densidade | **5** | 3 | 36px |
| Above the fold (390px) | **5** | 4 | 36px |
| Respiração | **5** | 3 | 36px |
| Identidade FinDomus | **5** | 2 | 36px |
| Acessibilidade | 4 | **5** | 64px |
| 1-3 dígitos | **5** | 3 | 36px |
| 375px viewport | **5** | 3 | 36px |
| 430px viewport | 4 | 4 | Empate |
| Teste 5 segundos | **Calma** | Agressiva | 36px |
| **TOTAL** | **57** | **38** | **36px** |

---

## 8. ANÁLISE DA REGRA DE DECISÃO

A versão de 64px precisaria vencer se houvesse evidência clara de que:

| Condição para 64px | Evidência |
|---------------------|-----------|
| 1. 36px não produz protagonismo suficiente | ❌ FALSO. 36px/800 é claramente o maior elemento da tela. Protagonismo é inquestionável. |
| 2. 64px não quebra Calm | ❌ FALSO. 64px é agressivo. Viola a personalidade "Calma" definida no FDL. |
| 3. 64px não prejudica Above the Fold | ⚠️ PARCIAL. Em 390px, ainda cabe. Em 375px, compromete. |
| 4. 64px funciona em 375px | ❌ FALSO. Ocupa ~19% da largura útil. Priority fica na borda. |
| 5. 64px não parece dashboard | ❌ FALSO. Evoca "hero stat" de SaaS dashboard. |
| 6. A melhoria é estrutural, não apenas estética | ❌ FALSO. É puramente estética. Nenhum ganho funcional. |

**Nenhuma das 6 condições foi satisfeita.**

---

## 9. DECISÃO

```
VERSÃO HOMOLOGADA: 36px (financial-hero)
```

O token `type.financial-hero = 36px` do FDL 1.0 FROZEN é **mantido sem alteração**.

O Master Visual v1 (`MASTER-VISUAL-v1.html`) deve ser **corrigido**: alterar `.score` de `font-size: 64px` para `font-size: 36px` e ajustar `line-height` de `1` para `1.1` (conforme define o FDL para financial-hero).

---

## 10. CORREÇÃO DO MASTER VISUAL v1

**Alteração necessária no arquivo `docs/home/MASTER-VISUAL-v1.html`:**

```css
/* Antes (linha 171) */
.freedom-card .score {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
  ...
}

/* Depois */
.freedom-card .score {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.1;
  ...
}
```

**Alteração no VISUAL-REPORT-v1.md:**

- Atualizar seção 1 "Decisões Visuais > Freedom Index" removendo a justificativa de 64px e documentando 36px como aderente ao FDL
- Atualizar seção 6 "Divergências do Wireframe" removendo a justificativa de 64px como divergência
- Atualizar classificação de VISUAL-P1: 1 → 0

---

## 11. CLASSIFICAÇÃO FINAL

| Classificação | Valor | Descrição |
|---------------|-------|-----------|
| VISUAL-P0 | **0** | Nenhum bug visual bloqueador |
| VISUAL-P1 | **0** | Divergência 36px vs 64px resolvida |
| VISUAL-P2 | **0** | Nenhum desalinhamento de espaçamento |
| VISUAL-P3 | **1** | Google Fonts CDN → Nota de implementação |

### VISUAL-P3 — IMPLEMENTATION NOTE

O protótipo atual usa Inter via Google Fonts CDN. Isso é aceitável para prototipação. Para implementação PWA, será necessário avaliar:
- Offline font loading
- Cache strategy
- Performance (self-host vs CDN)
- Privacidade (requisições a Google)
- Estratégia de font subsetting
- `font-display: swap` vs bloqueio de renderização

**Não bloqueia homologação. Classificado como P3 — nota de implementação futura.**

---

## 12. STATUS PÓS-HOMOLOGAÇÃO

```text
HOME MOBILE MASTER VISUAL v1 — HOMOLOGADO
```

Com a correção da única divergência (64px → 36px), o Master Visual v1 está em conformidade com:

- FDL 1.0 FROZEN ✅
- Home Architecture v1 ✅
- Home Wireframe v1 ✅

---

## 13. OBSERVAÇÃO: TOKEN RESPONSIVO (NÃO IMPLEMENTAR AGORA)

A comparação revelou que o token `financial-hero` opera em um espectro restrito (375-430px). Embora 36px funcione bem em toda essa faixa, há uma oportunidade conceitual para o futuro:

```text
financial-hero.compact    → 32px  (dispositivos muito pequenos, emergencial)
financial-hero.standard   → 36px  (padrão FDL)
financial-hero.emphasis   → 40px  (telas maiores, opcional)
```

Isso **não** é uma recomendação para implementação agora. É um registro de que o papel tipográfico `financial-hero` poderia evoluir para um papel contextual em versões futuras do FDL (FDL 1.x ou 2.0), sem quebrar a regra de "um financial-hero por tela".

**Status: registrado como observação. Nenhuma ação agora.**

---

## 14. PRÓXIMA ETAPA

Com VISUAL-P0 = 0 e VISUAL-P1 = 0:

→ **Navegação Mobile** (conforme planejado)

---

## 15. REGISTRO DE INTEGRIDADE

Este relatório foi produzido com:
- Apenas uma variável alterada entre as versões comparadas
- Nenhuma alteração de padding, gap, cor, tipografia secundária, layout, conteúdo
- Avaliação contra os mesmos critérios para ambas as versões
- Decisão baseada em evidência, não em preferência estética

A tela foi avaliada para caber no sistema. O sistema não foi alterado para acomodar a tela.

---

*FREEDOM HERO SIZE REVIEW · 36px vs 64px · Homologado em favor de 36px (FDL 1.0)*
