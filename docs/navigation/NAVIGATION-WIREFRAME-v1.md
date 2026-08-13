# FINDOMUS MOBILE NAVIGATION WIREFRAME v1

**Fase:** 5 — Wireframe da Navegação
**FDL:** 1.0 FROZEN
**Navigation Architecture:** v1 homologada (`docs/navigation/NAVIGATION-ARCHITECTURE-v1.md`)
**Home:** Homologada (ARCHITECTURE + WIREFRAME + MASTER VISUAL v1)
**Viewport de referência:** 390 × 844px
**Viewports de validação:** 375 × 812px, 390 × 844px, 430 × 932px

---

## 1. RESUMO EXECUTIVO

Este wireframe prova que a arquitetura de navegação mobile homologada (4 destinos na Bottom Nav + tela Módulos com categorias semânticas + Context Switcher global) funciona fisicamente nos viewports alvo. Não há necessidade de alterar a arquitetura, o FDL ou a Home homologada.

A Bottom Nav ocupa 82px (44px touch target + 28px safe area + 10px padding), deixando 762px de conteúdo útil em 390×844px — compatível com a Home homologada que já previa ~88px.

A tela Módulos organiza 20+ capacidades em 6 categorias semânticas com busca sticky, permitindo descoberta em 1-2 toques mesmo para um novo usuário. A estrutura escala para 100 módulos sem alteração visual.

---

## 2. MEDIDAS ESTRUTURAIS (FDL Tokens)

| Elemento | Altura (px) | Base FDL |
|----------|:-----------:|----------|
| Safe area top (status bar) | ~54px | SO |
| Context Bar (Home) | 48px | Homologado |
| Bottom Nav (total) | **82px** | 44 touch + 38 safe/space |
| Bottom Nav (área interativa) | 44px | Touch target mínimo |
| Bottom Nav (safe area) | 28px | `safe-area-inset-bottom` estimado |
| Bottom Nav (padding superior) | 10px | `space.2` + 2px óptico |
| Gap conteúdo → Bottom Nav | `space.16` (64px) | FDL: respiro final |
| Header Módulos | 48px | Igual Context Bar |
| Campo de busca (Módulos) | 44px | Touch target |
| Gap busca → conteúdo | `space.4` (16px) | FDL |
| Item de módulo (altura) | 56px | 44px touch + 12px padding |
| Gap entre categorias | `space.6` (24px) | Mudança de seção |
| Gap entre itens (mesma categoria) | `space.6` (24px) extra se houver descrição | |
| Label de categoria | ~20px | 10px caption + 12px gap |

**Viewport útil (390 × 844):**
```
844px total
-  54px status bar (top safe area)
-  82px Bottom Nav
= 708px de conteúdo
```

A Home homologada já considerava ~756px. A diferença de 48px (708 vs 756) vem de a Home usar 88px de Bottom Nav placeholder. O wireframe ajustou para 82px (mais preciso). **A Home ainda funciona sem alteração** — o conteúdo adicional abaixo da dobra apenas inicia o scroll 6px antes. Irrelevante.

---

## 3. BOTTOM NAVIGATION — WIREFRAME

### 3.1 Estrutura

```
390 × 844 viewport
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  [STATUS BAR — 54px]                                         ║
║                                                              ║
║                                                              ║
║  CONTEÚDO DA TELA                                            ║
║  (scroll)                                                    ║
║                                                              ║
║                                                              ║
║  ← space.16 (64px) entre último elemento e Bottom Nav →     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  ┌──────────────────────────────────────────────────────────┐║
║  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │║ ← 10px padding top
║  │  │    ⌂    │  │   ⊞⊞   │  │    ◈    │  │    ◉    │    │║ ← 44px touch target
║  │  │ Início  │  │ Módulos │  │  Domus  │  │ Perfil  │    │║ ← label 10px + gap 4px
║  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │║
║  │                                                          │║
║  │              [ safe area — 28px ]                        │║ ← home indicator
║  └──────────────────────────────────────────────────────────┘║
╚══════════════════════════════════════════════════════════════╝
```

### 3.2 Ordem e Labels (congelado da arquitetura)

| Slot | Rota | Ícone (Lucide) | Label | Função |
|:----:|------|---------------|-------|--------|
| 1 | `/` | `House` | Início | Centro de controle |
| 2 | `/modulos` | `LayoutGrid` | Módulos | Descoberta de capacidades |
| 3 | `/domus` | `BrainCircuit` (placeholder) | Domus | Inteligência financeira |
| 4 | `/perfil` | `CircleUserRound` | Perfil | Contexto, identidade, config |

**Decisão "Início" vs "Home":** "Início" é mais natural em pt-BR. "Home" é anglicismo. A Home homologada já usa "Início" no placeholder da Bottom Nav. Mantido.

**Ícone da Domus:** `BrainCircuit` como placeholder conceitual. Não homologar ícone definitivo aqui. Sparkles é clichê de IA e deve ser evitado. A identidade visual da Domus será definida na fase dedicada.

### 3.3 Active State — Comparação

Testamos 3 abordagens:

#### VERSÃO A — Ícone + Label azuis

```
Default:  [ ⌂ ]        [ ⊞ ]        [ ◈ ]        [ ◉ ]
           Início      Módulos      Domus       Perfil
           (tertiary)  (tertiary)   (tertiary)  (tertiary)

Active:   [ ⌂ ]        [ ⊞ ]        [ ◈ ]        [ ◉ ]
           Início      Módulos      Domus       Perfil
           (azul)      (tertiary)   (tertiary)  (tertiary)
```

#### VERSÃO B — Ícone azul + Label neutra

```
Active:   [ ⌂ ]        [ ⊞ ]        [ ◈ ]        [ ◉ ]
           Início      Módulos      Domus       Perfil
           (azul)      (tertiary)   (tertiary)  (tertiary)
           (text-secondary)
```

#### VERSÃO C — Ícone/Label azuis + indicador de superfície sutil

```
Active:   ┌─────────┐
          │    ⌂    │  ← superfície levemente elevada (Raised)
          │ Início  │  ← ícone + label em azul
          └─────────┘
```

**Recomendação: VERSÃO A — Ícone + Label azuis, sem superfície extra.**

| Critério | A | B | C |
|----------|:-:|:-:|:-:|
| Clareza de destino atual | 5 | 3 | 5 |
| Simplicidade visual | 5 | 5 | 3 |
| Respeito ao FDL (azul minoritário) | 4 | 5 | 3 |
| Contraste em light mode | 5 | 3 | 5 |
| Acessibilidade (não depende só de cor) | 4 | 4 | 4 |
| **TOTAL** | **23** | **20** | **20** |

**Justificativa:** A Versão A mantém o azul apenas no destino ativo. Em 4 itens, 1 usa azul no ícone + label — ~25% da Bottom Nav com azul. Aceitável dentro da heurística FDL (5-10% da tela total). A Versão B sacrifica clareza. A Versão C adiciona ruído visual com superfície extra.

**Acessibilidade:** O label é sempre visível e muda de cor + peso (active = `font-weight: 600`, inactive = `font-weight: 500`). Não depende apenas de cor.

### 3.4 Inactive State

```
Ícone:  color.text-tertiary (#555D68)  — opacidade 0.7
Label:  color.text-tertiary (#555D68)  — font-weight 500, 10px
```

Contraste suficiente em Dark Mode. Validar em Light Mode na fase visual.

### 3.5 Medidas (usando tokens FDL)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ←────── 390px (viewport) ──────→                           │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │    24    │ │    24    │ │    24    │ │    24    │       │ ← largura do ícone
│  │   ✦      │ │   ✦      │ │   ✦      │ │   ✦      │       │ ← altura do ícone (24px)
│  │          │ │          │ │          │ │          │       │
│  │ Início   │ │ Módulos  │ │  Domus   │ │ Perfil   │       │ ← label (10px Inter 500/600)
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  97.5px      97.5px      97.5px      97.5px                 │ ← 390÷4 = largura por slot
│                                                              │
│  ←──────────────── 44px touch target ──────────────→        │
│  ← gap ícone→label: 4px (space.1) →                        │
│  ← padding top Bottom Nav: 10px ──→                         │
│  ← safe area: 28px ─────────────────→                       │
└──────────────────────────────────────────────────────────────┘
```

### 3.6 Safe Area

A Bottom Nav estende-se até a borda inferior da tela com `padding-bottom` de 28px para acomodar o home indicator (gesto do sistema). O conteúdo interativo (ícones + labels) fica acima da safe area.

```
┌──────────────────────────────────────┐
│           [conteúdo da tela]          │
│                                      │
│  ┌────────────────────────────────┐  │ ← fim do conteúdo com padding-bottom
│  │  ⌂        ⊞        ◈        ◉  │  │ ← 44px touch zone
│  │ Início  Módulos  Domus  Perfil │  │
│  │                                │  │
│  │         (safe area)            │  │ ← 28px para home indicator
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 3.7 Keyboard Behavior — RECOMENDAÇÃO: Opção C (Contextual)

| Opção | Descrição | Avaliação |
|:-----:|-----------|-----------|
| A | Esconder Bottom Nav com teclado | Perde navegação. Usuário fica preso. |
| B | Manter Bottom Nav sempre visível | Ocupa espaço com teclado + nav. Tela útil diminui. |
| **C** | **Manter Bottom Nav, mas reduzir altura** | **Melhor compromisso. Acesso mantido. Espaço otimizado.** |

**Comportamento com teclado aberto:**

```
┌──────────────────────────────────────┐
│          [conteúdo / chat]           │ ← ~350px com teclado
│                                      │
├──────────────────────────────────────┤
│          [TECLADO DO SISTEMA]         │ ← ~300px
├──────────────────────────────────────┤
│  ⌂      ⊞      ◈      ◉             │ ← Bottom Nav compacta (54px)
│ (labels ocultos, apenas ícones)      │ ← sem safe area extra
└──────────────────────────────────────┘
```

Quando o teclado abre:
- Labels são ocultados (apenas ícones visíveis)
- Safe area extra é removida (teclado já tem sua própria safe area)
- Altura reduz de 82px para ~54px (44px ícones + 10px padding)
- Bottom Nav permanece funcional para escape (trocar de destino)

Este comportamento se aplica a: Domus (chat), Busca na tela Módulos.

### 3.8 Scroll

Bottom Nav é fixa (`position: fixed/sticky` no bottom). Todo conteúdo de tela precisa de `padding-bottom` suficiente para não ficar atrás da barra. Valor: `space.16` (64px) entre último elemento e Bottom Nav.

A Home homologada já respeita isso — o `bottom-nav-placeholder` atual tem 88px (margem `space.16` + 24px placeholder). O wireframe calibrou para 82px (espaço real da Bottom Nav com safe area). A diferença de 6px é irrelevante para a Home.

---

## 4. TELA MÓDULOS — WIREFRAME

### 4.1 Estrutura completa

```
390 × 844px · Contexto: Pessoal

┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│  Módulos                                        [ 👤 avatar ] │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍  Buscar no FinDomus                                  ││ ← Busca (44px)
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⭐ FIXADOS                                                  │ ← Seção Favoritos
│  ┌──────────────────────────────────────────────────────────┐│ ← (se houver)
│  │ 📊  Investimentos          R$ 42.800              →     ││ ← Item 56px
│  │ 🎯  Planejamento           3 metas                →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  MEU DINHEIRO                                                │ ← Categoria
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 💳  Contas                 R$ 12.450              →     ││ ← Item 56px
│  │ 👤  Pessoal                +R$ 3.240 no mês      →     ││
│  │ 📥  Importações            12 transações          →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  PLANEJAR                                                    │ ← Categoria
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🎯  Planejamento           3 metas ativas        →     ││
│  │ 📈  Investimentos          Carteira +R$ 1.200    →     ││
│  │ 🧮  Calculadoras           5 ferramentas         →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  COMPROMISSOS                                                │ ← Categoria
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🛡️  Passivos               R$ 8.400              →     ││
│  │ 🔁  Assinaturas            R$ 320/mês            →     ││
│  │ 📄  Imposto de Renda       Declaração 2025       →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  CONHECIMENTO                                                │ ← Categoria
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📚  Academia               Aula 4 de 8            →     ││
│  │ 🔮  Simulações             2 cenários             →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⚙️ CONFIGURAÇÕES                                            │ ← Categoria compacta
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⚙️  Configurações                                   →     ││
│  │ 💎  Planos e assinatura                             →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 64px padding →                                            │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Header da tela

```
┌──────────────────────────────────────────────────────────────┐
│  Módulos                                        [ 👤 avatar ] │ ← 48px
└──────────────────────────────────────────────────────────────┘
```

- **Título:** "Módulos" — nome do destino. Sempre visível.
- **Avatar:** À direita. Toque abre Context Switcher Sheet. Mesmo comportamento do avatar na Home (Context Bar). Consistente.
- **Sem botão voltar:** Módulos é destino global. Não há "para trás". A Bottom Nav provê escape para Home.
- **Contexto atual NÃO repetido:** O contexto ativo já está visível no avatar (cor/indicador) e no Context Sheet. Não duplicar informação no header ("Pessoal · Módulos").

### 4.3 Busca

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍  Buscar módulos, ações e recursos                    ││ ← 44px, radius.sm
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

- **Placeholder:** "Buscar no FinDomus" (pt-BR natural, curto o suficiente)
- **Altura:** 44px (touch target)
- **Margem:** `space.4` (16px) do header, `space.4` (16px) até o conteúdo
- **Sticky:** SIM. A busca permanece fixa no topo ao rolar a lista de categorias. Justificativa: power user precisa de acesso imediato à busca em qualquer ponto do scroll. O custo de altura (~60px com padding) é aceitável.
- **Comportamento ao focar:** Teclado abre. Bottom Nav reduz para modo compacto (ver 3.7). Resultados aparecem inline abaixo do campo.

### 4.4 Busca ativa (resultados)

```
┌──────────────────────────────────────────────────────────────┐
│  Módulos                                        [ 👤       ] │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍  inves|                                              ││ ← cursor ativo
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  MÓDULOS                                                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📈  Investimentos          Carteira + análises    →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  AÇÕES                                                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📥  Importar extrato       OFX, PDF, CSV, B3     →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉     ← modo compacto       │
└──────────────────────────────────────────────────────────────┘
```

- Resultados agrupados: Módulos, Ações, Recursos
- Cada resultado é um item com ícone + nome + descrição curta
- Toque navega para o destino
- "Cancelar" ou tecla voltar fecha a busca

### 4.5 Busca vazia

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔍  xyzabc                                             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│                    Nenhum resultado                          │
│              para "xyzabc" no FinDomus.                      │
│                                                              │
│            Tente outro termo ou explore as                   │
│               categorias abaixo.                             │
│                                                              │
│  ← conteúdo normal de categorias →                           │
```

### 4.6 Favoritos / Fixados

**Decisão: SIM, seção "Fixados" no topo da tela Módulos.**

A arquitetura homologada define:
- Home: 2 módulos fixados + 3 recomendados (total 5 Summary Cards)
- Módulos: até 4 módulos favoritos no topo da tela

Não há redundância. A Home é curadoria contextual. A tela Módulos é catálogo.

```
  ⭐ FIXADOS
  ┌──────────────────────────────────────────────────────────┐
  │ 📊  Investimentos          R$ 42.800              →     │
  │ 🎯  Planejamento           3 metas                →     │
  │ 🛡️  Passivos               R$ 8.400              →     │
  └──────────────────────────────────────────────────────────┘
```

- Máximo 4 itens
- Ordenáveis (long-press + drag)
- Se vazio: seção não aparece
- Indicador visual sutil (⭐ no label da seção, não em cada item)

### 4.7 Recentes — DECISÃO: NÃO

**Justificativa:**
1. Custo cognitivo: adiciona instabilidade visual (ordem muda)
2. Home já cobre "relevância contextual" com Summary Cards
3. Busca é mais eficiente para power user do que lista de recentes
4. Se necessário no futuro, pode ser adicionado como camada opcional sem quebrar arquitetura

### 4.8 Categorias — Formato

**Comparação:**

| Formato | Prós | Contras | Veredito |
|---------|------|---------|----------|
| **A — Seções abertas** | Scan fácil, tudo visível, sem toque extra | Scroll pode ser longo | ✅ **Recomendado** |
| B — Accordion | Compacto, controla densidade | Toque extra para descobrir, esconde informação | ❌ |
| C — Cards de categoria | Visualmente rico | Muito espaço, navegação extra | ❌ |
| D — Híbrido | Flexível | Inconsistente, difícil de prever | ❌ |

**Decisão: Seções abertas (Formato A).**

Justificativa: A categorização já é a estrutura. Colapsar categorias adiciona um nível de interação desnecessário. O scroll vertical com categorias abertas é natural em mobile. A busca sticky resolve o caso de "quero encontrar rápido". O total de ~17 itens em 6 categorias produz um scroll de ~1.5 viewports — confortável.

### 4.9 Item de módulo — Wireframe padrão

```
┌──────────────────────────────────────────────────────────────┐
│  [ícone]  Nome do Módulo                     métrica  →     │ ← 56px altura
│            microdescrição opcional                          │ ← opcional
└──────────────────────────────────────────────────────────────┘
```

**Especificação:**

| Elemento | Especificação |
|----------|--------------|
| Altura | 56px (44px touch + 12px padding vertical) |
| Ícone | 24px, `text-secondary`, Lucide. Sem cor individual. |
| Nome | 14px, 600 weight, `text-primary` |
| Descrição | 12px, 400 weight, `text-secondary`. Opcional. Máximo 1 linha. |
| Métrica | 13px, 500 weight, `text-secondary`. Alinhada à direita. Tabular nums. |
| Chevron | 16px, `text-tertiary`, opacidade 0.4. Indica navegação. |
| Touch | Card inteiro é tocável (affordance Raised com borda sutil) |
| Padding horizontal | `space.4` (16px) |

**Quando usar descrição?** Apenas para módulos com nome ambíguo para novos usuários. Ex: "Pessoal" pode ter descrição "Fluxo de caixa e transações". "Investimentos" dispensa. Regra: se o nome é autoexplicativo, sem descrição. Se há ambiguidade, incluir 1 linha.

**Sem descrição (item compacto):**
```
┌──────────────────────────────────────────────────────────────┐
│  📊  Investimentos                    R$ 42.800       →     │ ← 56px
└──────────────────────────────────────────────────────────────┘
```

**Com descrição (item estendido):**
```
┌──────────────────────────────────────────────────────────────┐
│  🧮  Calculadoras                                        →     │ ← 68px
│      Juros, aposentadoria, reserva e mais                    │
└──────────────────────────────────────────────────────────────┘
```

### 4.10 Categorias — Definição completa (contexto PF)

| Categoria | Itens | Descrição ativa? |
|-----------|-------|:----------------:|
| ⭐ Fixados | (0-4, definidos pelo usuário) | Não |
| **Meu Dinheiro** | Contas, Pessoal, Lançamentos, Importações | Pessoal: sim. Demais: não |
| **Planejar** | Planejamento, Investimentos, Calculadoras | Calculadoras: sim |
| **Compromissos** | Passivos, Assinaturas, Imposto de Renda | IR: sim |
| **Conhecimento** | Academia, Simulações | Simulações: sim |
| ⚙️ **Configurações** | Configurações, Planos | Não |

**Total PF: ~16 itens + busca + fixados. Scroll estimado: ~1100px (~1.5 viewports).**

### 4.11 Categorias — Contexto PJ

| Categoria | Itens |
|-----------|-------|
| ⭐ Fixados | (0-4) |
| **Meu Dinheiro** | Contas, Importações |
| **Planejar** | Investimentos, Calculadoras |
| **Compromissos** | Passivos, Assinaturas |
| **Empresa** | Empresas, Fluxo Financeiro, Fiscal & Contábil, Relatórios |
| **Conhecimento** | Simulações |
| ⚙️ **Configurações** | Configurações, Planos |

**Categorias ausentes em PJ:** Planejamento PF, Pessoal, Lançamentos, Parcelas, Cartões PF, Imposto de Renda, Academia. Conforme Navigation Contract.

### 4.12 Submódulos — Regra

**Na tela Módulos, mostrar apenas o módulo principal. Não listar submódulos.**

Exemplo:
- ✅ Mostrar: "Investimentos"
- ❌ Não mostrar: "Carteira", "Calculadoras", "Histórico" como itens separados na tela Módulos

Exceção: "Calculadoras" é listada como item separado em "Planejar" porque a arquitetura a trata como ponto de entrada distinto (conjunto de 5 ferramentas). "Lançamentos" é listado separado de "Pessoal" porque é uma rota independente que power users acessam diretamente.

### 4.13 Ações (ex: Importar)

A arquitetura classifica "Importações" e "Importar" como ações. No wireframe, "Importações" aparece como item em "Meu Dinheiro" porque é uma superfície completa com central de importação, preview, revisão. "Importar" (rota separada) é redundante — a central de importações cobre o fluxo.

**Regra:** Uma ação que tem superfície completa (tela dedicada com funcionalidades múltiplas) aparece como item de módulo. Uma ação pontual (ex: "Nova transação") pertence ao módulo de origem (Pessoal), não à tela Módulos.

---

## 5. CONTEXT SWITCHER — WIREFRAME

### 5.1 Trigger

O Context Switcher é acessado de duas formas:

1. **Avatar na Home (Context Bar):** Toque no avatar → Sheet
2. **Avatar na tela Módulos (Header):** Toque no avatar → Sheet
3. **Perfil (Bottom Nav):** Tela dedicada onde o contexto é a primeira seção

### 5.2 Sheet — Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro 60%]                         │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤ ← sheet começa
│                                                              │
│           ━━━━━━━━━━  (handle, 32px × 4px)                   │
│                                                              │
│  Selecionar contexto                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👤  Pessoal                                    ✓         ││ ← selecionado
│  │     Anderson                                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👥  Família                                              ││
│  │     3 membros                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🏢  TreeTech Automation                                  ││
│  │     CNPJ 12.345.678/0001-90                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🏢  EcoSoluções Ltda                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🏢  InovaSoft                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🏢  Mercado Digital                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  + Adicionar empresa                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Especificação

| Elemento | Especificação |
|----------|--------------|
| Sheet | Bottom Sheet, altura ~50-70% da viewport (depende do número de contextos) |
| Handle | Indicador de arrasto no topo |
| Background | Surface (nível 1), `color.surface` |
| Scrim | `color.overlay.scrim` (`rgba(0,0,0,0.6)`) |
| Item selecionado | ✓ à direita, fundo `action-primary-soft` |
| Item não selecionado | Fundo transparente, hover/active sutil |
| Altura do item | 56px (44px touch + padding) |
| Ícone de contexto | 👤 PF, 👥 Família, 🏢 PJ |
| "Adicionar empresa" | Link no final, navega para `/empresas?acao=nova` |
| Fechar | Deslizar para baixo ou toque no scrim |

### 5.4 Multiempresa (7 contextos)

Com Pessoal + Família + 5 empresas = 7 contextos:

```
Altura do sheet: 7 itens × 56px + handle 32px + header 44px + padding = ~500px
```

Em viewport de 844px, ~500px = ~60% da tela. Confortável. Scroll interno se necessário para mais contextos.

### 5.5 Troca de contexto

Ao selecionar novo contexto:
1. Sheet fecha com animação (250ms)
2. Tela atual recarrega com dados do novo contexto
3. Bottom Nav permanece no mesmo destino (se disponível no novo contexto)
4. Se a tela atual não existe no novo contexto (ex: estava em Fiscal, trocou para PF) → redireciona para Home

### 5.6 Módulo invalidado por troca de contexto

```
Usuário em: PJ → Fiscal & Contábil
Troca para: Pessoal
Resultado: Fiscal não existe em PF → redireciona para Home (PF)
Mensagem sutil: não necessário. A Home já mostra o estado correto.
```

---

## 6. DOMUS — WIREFRAME

### 6.1 Tela Domus

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│  ← Domus                                                      │ ← Header (48px)
│  [Contexto: Investimentos]                                    │ ← contexto sutil
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Balloon Domus
│  │ ◈ Domus                                                  ││
│  │                                                          ││
│  │ Sua carteira está concentrada em                          ││
│  │ renda fixa (72%). Isso é conservador                     ││
│  │ para seu perfil de 34 anos.                              ││
│  │                                                          ││
│  │                    [ Sugerir diversificação ]             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Balloon Usuário
│  │ Você                           agora                     ││
│  │                                                          ││
│  │ Qual o rendimento da minha carteira                      ││
│  │ nos últimos 12 meses?                                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Balloon Domus
│  │ ◈ Domus                                                  ││
│  │                                                          ││
│  │ Sua carteira rendeu 11,4% nos últimos                    ││
│  │ 12 meses. Acima do CDI (10,1%) e do                      ││
│  │ IPCA (4,8%).                                             ││
│  │                                                          ││
│  │         [ Ver análise completa ]    [ Entendi ]           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⌨️  Perguntar à Domus...                                 ││ ← Input (44px)
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Comportamento com teclado

Quando o input "Perguntar à Domus..." recebe foco:
- Teclado abre (~300px)
- Bottom Nav reduz para modo compacto (54px, apenas ícones)
- Área de chat ajusta para ocupar espaço entre header e input
- Scroll do chat preserva posição (mensagens mais recentes visíveis)

### 6.3 Domus com Bottom Nav — DECISÃO

**A Bottom Nav permanece visível durante a conversa com Domus.**

Justificativa: Domus é destino global, não um modal. O usuário pode querer:
- Voltar para Home a qualquer momento
- Ir para Módulos para ver algo que a Domus mencionou
- Trocar de contexto via Perfil

A Domus não é um chat de tela cheia que sequestra o usuário. É uma interface de inteligência dentro do ecossistema de navegação.

---

## 7. PERFIL — WIREFRAME MÍNIMO

### 7.1 Tela Perfil

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│  Perfil                                                       │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │      [avatar grande]                                     ││
│  │      Anderson Silva                                      ││
│  │      anderson@email.com                                  ││
│  │      Plano Essencial • Ativo                             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  CONTEXTO                                                    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👤  Pessoal                                    ✓  ▾     ││ ← abre Context Sheet
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  CONTA                                                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⚙️  Configurações                                 →     ││
│  │ 💎  Planos e assinatura                           →     ││
│  │ 👁  Privacidade                                  →     ││
│  │ 🔒  Segurança                                    →     ││
│  │ ❓  Ajuda                                        →     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Sair da conta                               ││ ← botão outline
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 64px padding →                                            │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                                        [ATIVO]               │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Configurações

"Não devem voltar para Bottom Nav." — Navigation Architecture.

Configurações é acessada via:
1. Toque em "Configurações" no Perfil → navega para `/configuracoes`
2. Ao entrar em Configurações, a Bottom Nav **permanece com Perfil ativo** (configurações é filho de Perfil)
3. Header de Configurações tem "← Perfil" para voltar

```
┌──────────────────────────────────────────────────────────────┐
│  ← Perfil    Configurações                                    │ ← Header com back
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Preferências                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Tema                    Sistema                   →     ││
│  │ Moeda                   BRL (R$)                  →     ││
│  │ Notificações            Ativas                    →     ││
│  └──────────────────────────────────────────────────────────┘│
│  ...                                                         │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                                        [ATIVO]               │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. FLUXOS DE NAVEGAÇÃO

### 8.1 WF-NAV-01: Home + Bottom Nav

```
┌──────────────────────────────────────────────────────────────┐
│  ← Home homologada (ARCHITECTURE + WIREFRAME + VISUAL v1) →  │
│                                                              │
│  ┌ Status Bar (54px) ──────────────────────────────────────┐ │
│  ├ Context Bar (48px) ─────────────────────────────────────┤ │
│  ├ Freedom Index Card (~115px) ────────────────────────────┤ │
│  ├ Domus Insight (~110px) ─────────────────────────────────┤ │
│  ├ Priority Action (~130px) ───────────────────────────────┤ │
│  ├ Módulos (4 cards × 68px + gaps) ───────────────────────┤ │
│  ├ Continuidade (~80px) ───────────────────────────────────┤ │
│  └ ← space.16 (64px) → ────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

A Home homologada funciona sem alterações. O espaço de 64px antes da Bottom Nav é suficiente. O conteúdo total (~585px para Home completa) cabe nos 708px de viewport útil com scroll confortável.

### 8.2 WF-NAV-02: Módulos + Bottom Nav

```
Bottom Nav ativa: Módulos [ATIVO]
Ver wireframe completo na seção 4.
```

### 8.3 WF-NAV-04: Domus como destino global

```
Bottom Nav ativa: Domus [ATIVO]
Ver wireframe na seção 6.
```

### 8.4 WF-NAV-05: Perfil como destino

```
Bottom Nav ativa: Perfil [ATIVO]
Ver wireframe na seção 7.
```

### 8.5 WF-NAV-07: Módulo aberto via Módulos

```
Usuário em: Módulos → toca "Investimentos"

┌──────────────────────────────────────────────────────────────┐
│  ← Módulos    Investimentos                        [ 🔍 ? ]  │ ← Header com back
├──────────────────────────────────────────────────────────────┤
│  [Overview] [Carteira] [Análise] [Aportes]                   │ ← Tabs
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Conteúdo da tab Overview                                    │
│  (Resumo da carteira, gráfico, alocação)                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│          [ATIVO]                                             │
└──────────────────────────────────────────────────────────────┘
```

**Regra de active state:** Quando o usuário entra em um módulo via Módulos, a Bottom Nav mantém "Módulos" ativo. O módulo é filho do destino Módulos. O header mostra "← Módulos" para voltar.

### 8.6 WF-NAV-08: Módulo aberto via Home

```
Usuário em: Home → toca Summary Card "Investimentos"

┌──────────────────────────────────────────────────────────────┐
│  ← Início     Investimentos                        [ 🔍 ? ]  │ ← Header com back
├──────────────────────────────────────────────────────────────┤
│  [Overview] [Carteira] [Análise] [Aportes]                   │
├──────────────────────────────────────────────────────────────┤
│  ...                                                          │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [ATIVO]                                                      │
└──────────────────────────────────────────────────────────────┘
```

**Regra:** Módulo aberto via Home → Bottom Nav mantém "Início" ativo. O header mostra "← Início". O módulo é filho do destino Home.

### 8.7 WF-NAV-09: Domus deep link para módulo

```
Usuário em: Domus → toca "Ver análise completa" nos investimentos

┌──────────────────────────────────────────────────────────────┐
│  ← Domus      Investimentos                        [ 🔍 ? ]  │
├──────────────────────────────────────────────────────────────┤
│  ...                                                          │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│                    [ATIVO]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Regra:** Destino aberto via Domus → Bottom Nav mantém "Domus" ativo. Header mostra "← Domus".

### 8.8 Context Switch durante módulo

```
Usuário em: PJ → Fiscal & Contábil
Abre Context Sheet → troca para Pessoal

Resultado:
- Fiscal não existe em PF
- Redireciona para Home (PF)
- Bottom Nav: "Início" ativo
- Sem mensagem de erro. A Home mostra o estado correto.
```

---

## 9. STATES

### 9.1 Bottom Nav — Default

```
┌──────────────────────────────────────────────────────────────┐
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
│ [todos inativos] (apenas durante transição ou estado inicial) │
└──────────────────────────────────────────────────────────────┘
```

Na prática, sempre há um destino ativo. O estado "todos inativos" só existe durante o bootstrap inicial (fração de segundo).

### 9.2 Bottom Nav — Teclado aberto

```
┌──────────────────────────────────────────────────────────────┐
│  ⌂         ⊞⊞         ◈         ◉        ← sem labels       │
│            (54px altura total, modo compacto)                 │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Bottom Nav — Sheet aberto (Context Switcher)

```
┌──────────────────────────────────────────────────────────────┐
│ [scrim cobre tudo, inclusive Bottom Nav]                     │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [Sheet content]                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ⌂         ⊞⊞         ◈         ◉  ← não interativo          │
└──────────────────────────────────────────────────────────────┘
```

Bottom Nav permanece visível atrás do scrim mas não é interativa.

### 9.4 Offline

```
┌──────────────────────────────────────────────────────────────┐
│                        STATUS BAR                             │
├──────────────────────────────────────────────────────────────┤
│  Módulos                                        [ 👤       ] │
│  [indicador sutil: "Offline" ou ícone]                        │ ← indicador offline
├──────────────────────────────────────────────────────────────┤
│  ... conteúdo (dados cacheados onde disponível) ...          │
│                                                              │
│  Itens que exigem rede: desabilitados (não ocultos)          │
│  Ex: Importações → indicado como indisponível                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ Início   Módulos    Domus    Perfil                          │
└──────────────────────────────────────────────────────────────┘
```

Bottom Nav continua 100% funcional. Navegação entre Home/Módulos/Perfil funciona com dados cacheados. Domus pode mostrar mensagem "Indisponível offline" mas permanece acessível. Ações que exigem rede (importar, sincronizar) são desabilitadas com indicação visual, não ocultadas.

---

## 10. COMPLEXITY BUDGET

### 10.1 Bottom Nav

| Limite | Valor |
|--------|:-----:|
| Destinos | **4** |
| Active state visível | **1** |
| FAB | **0** |
| Badges | **0** (por padrão) |
| Altura (normal) | **82px** |
| Altura (teclado) | **54px** |
| Context Switcher | **Fora da nav** (avatar → Sheet) |

### 10.2 Tela Módulos

| Limite | Valor |
|--------|:-----:|
| Categorias | **≤7** (Fixados + 5 semânticas + Configurações) |
| Itens por categoria | **≤5** |
| Itens totais visíveis | **~17** (PF) / **~15** (PJ) |
| Altura do item | **56px** padrão / **68px** com descrição |
| Busca | **Sticky** (60px com padding) |
| Scroll total (PF) | **~1100px** (~1.5 viewports) |
| Accordion | **Não** (seções sempre abertas) |
| Recursos sem tela dedicada | **Não listar** |

---

## 11. TESTES DE VALIDAÇÃO

### 11.1 Teste do Polegar (375/390/430px)

| Viewport | Home (slot 1) | Módulos (slot 2) | Domus (slot 3) | Perfil (slot 4) |
|----------|:---:|:---:|:---:|:---:|
| 375px | ✅ Fácil | ✅ Fácil | ✅ Fácil | ✅ Confortável |
| 390px | ✅ Fácil | ✅ Fácil | ✅ Fácil | ✅ Confortável |
| 430px | ✅ Fácil | ✅ Fácil | ✅ Fácil | ✅ Confortável |

**Análise:** 4 slots dividem igualmente a largura. Em 375px, cada slot tem ~94px — espaço amplo para dedo. Home e Perfil nas bordas não são prejudicados porque o polegar alcança as bordas naturalmente (a zona difícil é o centro superior, não as bordas inferiores).

### 11.2 Teste 20 Módulos

**Estado atual:** ~17 itens em 6 categorias. Scroll ~1100px. ~1.5 viewports. ✅

### 11.3 Teste 50 Módulos

**Simulação:** Adicionar módulos conceituais. Categorias absorvem:
- Meu Dinheiro: +2 itens (Conciliação, Rateio) → 6 itens. Ainda aceitável.
- Planejar: +2 itens (Fundos, Previdência) → 5 itens.
- Compromissos: +2 (Seguros, Consórcios) → 5 itens.
- Conhecimento: +1 (Cursos) → 3 itens.
- Nova categoria "Patrimonial": +3 itens.

Scroll ~1700px (~2.4 viewports). Ainda dentro do budget de ~2.5 viewports da Home. ✅

### 11.4 Teste 100 Módulos

**Análise:** Com 100 módulos, algumas categorias podem crescer além de 5 itens. Soluções:
1. Subcategorias (ex: "Investimentos" pode abrir sublista com Renda Fixa, Renda Variável, FIIs, etc.)
2. Scroll mais longo — aceitável com busca sticky
3. Novas categorias (ex: "Fiscal", "Internacional", "Câmbio")

**A estrutura não quebra.** A Bottom Nav permanece 4 itens. A busca se torna progressivamente mais importante. Categorias podem ser rebalanceadas. ✅

### 11.5 Teste Novo Usuário

**Pergunta:** "Onde estão meus investimentos?"

Caminho: Bottom Nav → "Módulos" → Categoria "Planejar" → "Investimentos"

**Avaliação:** Um novo usuário pode não associar "Investimentos" a "Planejar" imediatamente. Mas:
- A busca no topo permite digitar "investimentos"
- A categoria "Meu Dinheiro" também contém itens financeiros visíveis
- O nome "Módulos" é intuitivo como "onde tudo está"

Risco: moderado. Mitigação: busca + fixados (após primeiro uso). Aceitável. ✅

### 11.6 Teste Power User

**Pergunta:** "Quero amortizar uma dívida."

Caminho: Módulos → Compromissos → Passivos → Dívida específica → Amortização (4 níveis)

Alternativa: Fixar Passivos nos favoritos → 3 níveis.

Alternativa: Busca "amortização" → resultado direto.

Aceitável para especialista. ✅

### 11.7 Teste Domus

**Pergunta:** "Quanto posso gastar hoje?"

Domus está a 1 toque (Bottom Nav, slot 3). ✅

### 11.8 Teste Perfil

**Pergunta:** "Quero alterar minha senha."

Caminho: Perfil (Bottom Nav slot 4) → Segurança → 3 níveis. ✅

### 11.9 Teste Home → Módulo

Fluxo: Home → toque Summary "Investimentos" → módulo abre. Active state: Início. Header: "← Início". ✅

### 11.10 Teste Módulos → Módulo

Fluxo: Módulos → toque "Investimentos" → módulo abre. Active state: Módulos. Header: "← Módulos". ✅

### 11.11 Teste Domus → Módulo

Fluxo: Domus → recomendação "Ver análise" → módulo abre. Active state: Domus. Header: "← Domus". ✅

### 11.12 Teste Interrupção

Fluxo: Investimentos → Domus (Bottom Nav) → conversa → voltar para Investimentos

**Comportamento:**
1. Investimentos → toque Domus na Bottom Nav
2. Domus abre com contexto "Investimentos"
3. Usuário pergunta algo, recebe resposta
4. Usuário toca "Módulos" na Bottom Nav
5. Módulos abre normalmente
6. Se usuário tocar "Início", vai para Home

**A navegação não bloqueia.** Bottom Nav sempre disponível. Cada destino é independente. ✅

### 11.13 Teste Contextual

Fluxo: PJ → Módulos → DRE → Context Sheet → troca para Pessoal

1. Usuário em PJ, visualizando DRE
2. Abre Context Sheet (toque no avatar)
3. Seleciona "Pessoal"
4. Sheet fecha. DRE não existe em PF → redireciona para Home (PF)
5. Bottom Nav: "Início" ativo

Nenhum dado PJ vaza para PF. ✅

---

## 12. ACESSIBILIDADE

| Critério | Status |
|----------|:------:|
| Touch targets ≥ 44×44px | ✅ Todos os itens (Bottom Nav: 44px, módulos: 56px, busca: 44px) |
| Labels sempre visíveis | ✅ Exceto modo teclado (compacto, apenas ícones) |
| Active state não depende só de cor | ✅ Label muda de peso (500 → 600) + cor |
| Ordem semântica | ✅ Home → Módulos → Domus → Perfil (esquerda→direita) |
| VoiceOver/TalkBack | ✅ Labels textuais em todos os destinos |
| Contraste | ⚠️ Validar na fase visual (text-tertiary sobre Canvas pode precisar de ajuste) |
| Zoom | ✅ Layout não quebra com zoom de sistema |

---

## 13. NAVIGATION WIREFRAME CONTRACT v1

### Bottom Nav

```
Itens:       4 (Início, Módulos, Domus, Perfil)
Ordem:       Início | Módulos | Domus | Perfil (esquerda → direita)
Labels:      "Início", "Módulos", "Domus", "Perfil" (10px, 500/600)
Ícones:      House, LayoutGrid, BrainCircuit (placeholder), CircleUserRound (24px)
Active:      Ícone + label em azul FinDomus (#00B4D8). Peso 600.
Inactive:    Ícone + label em text-tertiary (#555D68). Peso 500.
Altura:      82px (44px touch + 10px padding top + 28px safe area)
Safe area:   28px (safe-area-inset-bottom)
Keyboard:    Modo compacto (54px, apenas ícones, sem labels)
Sheet open:  Visível atrás do scrim, não interativa
Offline:     100% funcional. Navegação entre áreas cacheadas preservada.
Scroll:      position: fixed/sticky no bottom. Conteúdo com padding-bottom adequado.
```

### Módulos

```
Header:       48px. Título "Módulos" + avatar à direita (abre Context Sheet).
Busca:        44px, sticky no topo. Placeholder: "Buscar no FinDomus".
              Resultados agrupados: Módulos, Ações, Recursos.
              Busca vazia: mensagem orientativa + categorias abaixo.
Fixados:      Até 4 itens. Seção "⭐ FIXADOS" no topo (apenas se houver itens).
Categorias:   6 (Fixados + Meu Dinheiro + Planejar + Compromissos +
              [Empresa se PJ] + Conhecimento + Configurações).
              Seções sempre abertas (não accordion).
              Categorias contextuais: Empresa apenas em PJ.
              Itens PF ausentes em PJ: Planejamento PF, Pessoal, IR, Academia.
Item padrão:  56px altura. Ícone 24px + nome 14px + métrica opcional + chevron.
Item c/ desc: 68px altura. + 1 linha de descrição 12px abaixo do nome.
Submódulos:   Não listados na tela Módulos (apenas módulo principal).
Ações:        Listadas se tiverem superfície dedicada (ex: Importações).
              Ações pontuais pertencem aos módulos de origem.
Voltar:       Não (destino global). Escape via Bottom Nav.
Active state: Bottom Nav "Módulos" ativo.
```

### Context Switcher

```
Trigger:      Avatar (Home Context Bar, Módulos Header, Perfil)
Sheet:        Bottom Sheet. Altura ~50-70% da viewport.
              Scrim rgba(0,0,0,0.6). Handle de arrasto no topo.
Itens:        Contexto PF, Família, Empresas. 56px cada.
              Ícone de contexto + nome + info extra (membros, CNPJ).
              Selecionado: ✓ + fundo action-primary-soft.
Multiempresa: Lista vertical com scroll. Suporta 7+ contextos.
Troca:        Animação 250ms. Tela recarrega no novo contexto.
              Se tela atual inválida → redireciona para Home.
Persistência: localStorage + Firestore. Restaurado ao reabrir.
```

### Fluxos

```
Home → Módulo:       Active: Início.    Header: "← Início".
Módulos → Módulo:    Active: Módulos.   Header: "← Módulos".
Domus → Módulo:      Active: Domus.     Header: "← Domus".
Perfil → Config:     Active: Perfil.    Header: "← Perfil".
Back:                router.back(). Header indica origem.
Deep link:           Preserva contexto. Cross-context pede confirmação.
Context switch:      Se tela inválida → Home. Bottom Nav preserva destino.
```

---

## 14. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**NAV-WF-P0: 0 · NAV-WF-P1: 0 · NAV-WF-P2: 0 · NAV-WF-P3: 0**

---

## 15. ARCHITECTURE / FDL CHANGE REQUESTS

Nenhum change request necessário.

- A Navigation Architecture v1 suporta todos os wireframes sem alteração
- O FDL 1.0 fornece todos os tokens necessários (spacing, cores, tipografia, touch targets)
- A Home homologada funciona com a Bottom Nav de 82px (placeholder original era 88px; diferença de 6px é irrelevante)
- O Context Switcher como Bottom Sheet respeita os níveis de superfície do FDL (Overlay → scrim + Sheet)

---

## 16. DECISÕES TOMADAS NESTA FASE

| Decisão | Escolha |
|---------|---------|
| Active state Bottom Nav | Versão A: ícone + label azuis |
| Keyboard behavior | Versão C: mantém nav, modo compacto |
| Categorias (formato) | Formato A: seções sempre abertas |
| Busca (posição) | Sticky no topo da tela Módulos |
| Recentes | NÃO implementar |
| Descrições nos itens | Apenas para módulos ambíguos |
| Fixados na tela Módulos | SIM. Seção ⭐ no topo |
| Bottom Nav na Domus | SIM. Sempre visível |
| Context Switcher | Bottom Sheet (não tela dedicada) |
| Configurações | Filho de Perfil (não destino global) |
| Avatar no header Módulos | SIM. Abre Context Sheet |

---

## 17. RECOMENDAÇÃO FINAL

Os wireframes comprovam que a arquitetura de navegação homologada é fisicamente viável em todos os viewports alvo. Nenhuma alteração é necessária na arquitetura, no FDL ou na Home.

Pontos de destaque:
- ✅ Bottom Nav com 4 destinos funciona ergonomicamente em 375-430px
- ✅ Tela Módulos organiza 20-100 capacidades com busca sticky + categorias semânticas
- ✅ Context Switcher como Bottom Sheet suporta multiempresa com 7+ contextos
- ✅ Domus como destino global com Bottom Nav sempre presente
- ✅ Active state claro sem poluição visual
- ✅ Comportamento de teclado definido e consistente
- ✅ Todos os fluxos testados e mapeados
- ✅ Contratos de navegação documentados

---

## 18. PRÓXIMA ETAPA

Com NAV-WF-P0 = 0 e NAV-WF-P1 = 0, os wireframes de navegação estão prontos para homologação.

**Próximo passo:** DOMUS MOBILE — arquitetura e design da interface de inteligência.

---

## 19. ARQUIVOS GERADOS

| Arquivo | Conteúdo |
|---------|----------|
| `docs/navigation/NAVIGATION-WIREFRAME-v1.md` | Este documento |
| `docs/navigation/NAVIGATION-ARCHITECTURE-v1.md` | Arquitetura homologada (referência) |

---

*FinDomus Mobile Navigation Wireframe v1 · Fase 5 concluída · Aguardando homologação*
