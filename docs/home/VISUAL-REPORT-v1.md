# HOME MOBILE MASTER VISUAL v1 — RELATÓRIO

**Fase:** 3 — Imagem Visual
**FDL:** 1.0 FROZEN
**Arquivo:** `docs/home/MASTER-VISUAL-v1.html`
**Viewport:** 390 × 844px · Dark Mode · PF organizado

---

## 1. DECISÕES VISUAIS

### Freedom Index — Surface Card

- **Tratamento:** Card Surface (`#11161D`), sem borda, sem sombra
- **Eyebrow:** 10px, 600 weight, uppercase, `text-tertiary` (`#555D68`)
- **Número:** 36px, 800 weight, `text-primary` (`#EDF0F5`), letter-spacing -2px, line-height 1.1
- **Nível + tendência:** 13px, 500 weight. Tendência positiva em `state-positive` (`#22C55E`)
- **Affordance:** O card inteiro é tocável. Nenhum botão "Ver detalhes". O toque é implícito.

**Por que 36px?** O FDL 1.0 FROZEN define `type.financial-hero = 36px`. Este token foi homologado como a escala correta para o número protagonista da Home. O tamanho de 36px a 800 weight em uma tela de 390px produz protagonismo claro sem comprometer a densidade Calm, a hierarquia com Domus e Priority, nem a identidade visual do FinDomus. Ver relatório completo: `docs/home/FREEDOM-HERO-SIZE-REVIEW.md`.

### Domus — Tratamento de Presença

- **Tratamento:** Card Surface com borda esquerda de 2px em azul FinDomus
- **Identificador:** Ponto azul (`#00B4D8`) + label "Domus" em azul, 10px uppercase
- **Corpo:** 14px, 400 weight, `text-secondary` (`#8B949E`)
- **CTA:** "Entender" em azul, sem botão — apenas texto acionável

**Por que borda esquerda?** Cria identidade visual sem avatar, sem gradiente, sem glow. A Domus "entra" pela esquerda — como uma presença que se manifesta. É sutil o suficiente para não dominar e distinto o suficiente para ser reconhecível.

### Priority Action — Raised Card

- **Tratamento:** Card Raised (`#161C26`), borda `border-default`
- **Prioridade:** Âmbar (`#F59E0B`) apenas no indicador (ponto + label)
- **Título:** 16px, 600 weight, `text-primary`
- **Descrição:** 13px, 400 weight, `text-secondary`
- **Botão:** Full-width, 44px altura, fundo azul, texto escuro

**Por que âmbar e não vermelho?** "Completar reserva" é uma oportunidade, não um risco. O âmbar sinaliza atenção sem alarme.

### Módulos — Full-Width Raised Cards

- **Tratamento:** Card Raised, borda `border-subtle`
- **Ícone:** 36px container em Surface, ícone Lucide 18px
- **Layout:** Horizontal — ícone + info à esquerda, valor + chevron à direita
- **Nome:** 14px, 600 weight
- **Valor:** 18px, 700 weight, tabular-nums
- **Meta:** 12px, 400 weight. Positiva em verde.

**Por que layout horizontal?** O wireframe mostrava vertical. O layout horizontal é mais compacto (96px → ~68px por card), permitindo 4 módulos sem competir com o scroll. Mantém a identidade de Summary Card — não é app grid, é informação financeira contextual.

### Continuidade — Compacto

- **Tratamento:** Card Raised, borda `border-subtle`
- **Barra de progresso:** 3px altura, preenchimento azul 62%
- **Layout:** Horizontal com título + barra à esquerda, chevron à direita

---

## 2. VALIDAÇÃO FDL

| Regra FDL | Aplicação | Status |
|-----------|-----------|--------|
| Canvas `#0A0E14` (não preto puro) | Body background | ✅ |
| Surface `#11161D` | Freedom, Domus | ✅ |
| Raised `#161C26` | Priority, Módulos, Continuidade | ✅ |
| `text-primary` `#EDF0F5` | Todos os títulos e números | ✅ |
| `text-secondary` `#8B949E` | Descrições e metadados | ✅ |
| `text-tertiary` `#555D68` | Eyebrows e labels secundários | ✅ |
| Azul `#00B4D8` minoritário | Botão + Domus borda + nav ativo + CTA | ✅ (~6% área) |
| Verde `#22C55E` só evolução | Tendência FI, meta módulo | ✅ |
| Vermelho `#EF4444` | Não usado nesta tela | ✅ |
| Dourado `#C8A951` | Não usado nesta tela | ✅ |
| Surface/Raised sem sombra | Nenhum box-shadow em cards | ✅ |
| `radius.md` 16px | Todos os cards | ✅ |
| `radius.sm` 8px | Botão, ícones de módulo | ✅ |
| Inter font | Família tipográfica | ✅ |
| Margem 16px | Padding lateral | ✅ |
| 5 níveis de profundidade | Canvas→Surface→Raised usados | ✅ |
| Densidade Calm | ~6 blocos, muito respiro | ✅ |
| Tabular numbers | `font-variant-numeric: tabular-nums` | ✅ |
| pt-BR | `R$ 42.800` (não 42,800.00) | ✅ |
| Cor não é info única | Estados têm ícone + texto + cor | ✅ |
| Touch ≥44px | Botão (44px), cards (~68px), nav items | ✅ |
| Sem card dentro de card | Estrutura plana | ✅ |

---

## 3. ABOVE THE FOLD (390×844)

| Elemento | Acumulado | Na primeira viewport? |
|----------|-----------|----------------------|
| Status Bar | 54px | ✅ |
| Context Bar | 102px | ✅ |
| Freedom Index | ~222px | ✅ |
| Domus | ~342px | ✅ |
| Priority (até metade do botão) | ~482px | ✅ Parcial |

**FI + Domus + Priority visíveis sem scroll.** ✅

---

## 4. COLOR BUDGET

| Cor | Onde | % aproximado da tela |
|-----|------|---------------------|
| Canvas (`#0A0E14`) | Fundo | ~60% |
| Surface (`#11161D`) | FI + Domus | ~18% |
| Raised (`#161C26`) | Priority + Módulos + Continuidade | ~18% |
| Azul (`#00B4D8`) | Botão, borda Domus, nav ativo, CTAs | ~4% |
| Verde (`#22C55E`) | 2 indicadores de tendência | <1% |
| Âmbar (`#F59E0B`) | Indicador de Priority | <0.5% |

**Azul permanece visualmente minoritário (~4%).** ✅ Abaixo da heurística de 5-10%.

---

## 5. TESTE DOS 5 SEGUNDOS

Ao abrir a tela, em 5 segundos o observador percebe:

1. **Contexto:** "Pessoal" — sei onde estou ✅
2. **Estado:** "72" grande no centro — sei como estou ✅
3. **Evolução:** "+3 este mês" verde — estou melhorando ✅
4. **Domus:** Borda azul à esquerda — há uma inteligência presente ✅
5. **Ação:** Botão azul "Fazer aporte" — sei o que fazer ✅

---

## 6. DIVERGÊNCIAS DO WIREFRAME

| Elemento | Wireframe | Visual | Justificativa |
|----------|-----------|--------|---------------|
| Número FI | 36px financial-hero | 36px financial-hero | Aderente ao FDL 1.0. Homologado após revisão comparativa 36px vs 64px (ver FREEDOM-HERO-SIZE-REVIEW.md) |
| Layout módulos | Vertical (nome→valor→meta) | Horizontal (ícone+nome+meta | valor) | Mais compacto (68px vs 96px). Mantém hierarquia. Facilita scan |
| Módulos: valor à direita | Centralizado/empilhado | Alinhado à direita | Convenção financeira. Números alinhados à direita facilitam comparação |

Nenhuma divergência estrutural. Mesmas 6 camadas, mesma ordem, mesmos gaps. ✅

---

## 7. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|---------------|
| — | Nenhum achado bloqueador | — |
| P3-01 | Google Fonts CDN para Inter | VISUAL-P3 |

**VISUAL-P0: 0 · VISUAL-P1: 0 · VISUAL-P2: 0 · VISUAL-P3: 1**

Nota VISUAL-P3: O protótipo usa Inter via Google Fonts CDN — aceitável para prototipação. A implementação PWA exigirá estratégia de font self-hosted/local para offline, cache, performance e privacidade. Ver FREEDOM-HERO-SIZE-REVIEW.md seção 11.

---

## 8. RECOMENDAÇÃO

A imagem visual está homologada. Abrir `docs/home/MASTER-VISUAL-v1.html` em qualquer navegador para avaliação. A divergência do Freedom Index (64px vs 36px) foi resolvida em favor de 36px — ver `docs/home/FREEDOM-HERO-SIZE-REVIEW.md` para o relatório completo da comparação cirúrgica.

---

*Home Mobile Master Visual v1 · Fase 3 concluída · Homologado*
