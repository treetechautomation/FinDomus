# FINDOMUS UNIVERSAL MODULE PATTERN v1

**Fase:** 9 — Padrão Universal de Módulo Mobile
**FDL:** 1.0 FROZEN
**Navigation:** v1 homologada (arquitetura + wireframe)
**Domus:** v1 homologada (arquitetura + wireframe + visual)
**Home:** v1 homologada

---

## 1. RESUMO EXECUTIVO

O FinDomus possui 23 rotas de página mapeadas em 13+ módulos funcionais com naturezas radicalmente diferentes: transacional (Contas), analítico (DRE), planejamento (Planejamento), educacional (Academia), workflow (Importações), portfolio (Investimentos), config (Configurações).

A auditoria do código real revelou que cada módulo implementa seus próprios padrões de header, navegação interna, filtros, CRUD, loading, empty states e listas — sem contrato unificado. Isso é insustentável para mobile.

Este documento define um padrão universal de anatomia, comportamento e estados que se aplica a todos os módulos do FinDomus Mobile. Ele não força uniformidade visual — força previsibilidade de uso.

**O conteúdo muda. A linguagem não.**

---

## 2. AUDITORIA DOS MÓDULOS REAIS

### 2.1 Inventário

| # | Módulo | Rota | Tipo funcional | Navegação interna | Ações principais | Filtros | Complexidade |
|---|--------|------|:----:|--------|--------|--------|:---:|
| 1 | **Planejamento** | `/planejamento` | Planning | 3 Tabs + Month nav | Save, Reset, Add Goal | Month selector | Alta |
| 2 | **Investimentos** | `/investimentos` | Portfolio | Tabs (Wallet) + sub-tabs | New Investment, New Yield | — | Alta |
| 3 | **Contas** | `/contas` | Transactional | PF/PJ sections (list) | Add Account, Edit, Simulate | — | Média |
| 4 | **Passivos** | `/passivos` | Portfolio | Summary + List + Projection | Add Liability | Month (implícito) | Média |
| 5 | **Pessoal** | `/pessoal` | Transactional | Revenue + Spending tabs | Add Transaction, Edit | Month filter, Category | Alta |
| 6 | **Empresas** | `/empresas` | Admin/PJ | Company list | Add Company | Company filter | Média |
| 7 | **Importações** | `/importacoes` | Workflow | 5 Tabs (sources) | Upload file, Review | — | Alta |
| 8 | **Relatórios** | `/relatorios` | Analytical | — | Export, Filter | Period, Type | Baixa |
| 9 | **Assinaturas** | `/assinaturas` | Transactional | List | Add, Edit, Delete | — | Baixa |
| 10 | **Fiscal/Contábil** | `/fiscal-contabil` | Admin/PJ | Obligations list | Add Obligation | Period | Média |
| 11 | **Configurações** | `/configuracoes` | Admin | 6 Tabs | Save, Manage | — | Alta |
| 12 | **Cartões** | `/cartoes` | Transactional | List | Add, Edit | — | Baixa |
| 13 | **Parcelas** | `/parcelas` | Transactional | List | — | Month | Baixa |
| 14 | **Lançamentos** | `/lancamentos` | Transactional | List/Table | Edit | Month, Type | Baixa |
| 15 | **Imposto Renda** | `/imposto-de-renda` | Analytical | — | — | Year | Baixa |

### 2.2 Padrões descobertos na auditoria

| Padrão | Implementação atual | Problema |
|--------|-------------------|----------|
| Header | Título h1 + descrição p. Sem botão voltar. | Desktop-only. Mobile precisa de back. |
| Navegação interna | Tabs (Radix) em 4 módulos | Sem padrão de quantidade/tamanho. 6 tabs em 375px inviável. |
| CRUD | Dialog (Radix) para New/Edit em todos os módulos | Funciona, mas não há padrão de posicionamento do trigger. |
| Loading | Skeleton manual por módulo | Cada um implementa seu próprio skeleton. Sem componente compartilhado. |
| Empty state | Texto condicional inline | Sem padrão visual. Sem CTA padronizado. |
| Filtros | URL params (month) + state local | Fragmentado. Sem padrão de UI de filtro. |
| Listas | Cards/rows customizados por módulo | Sem densidade padronizada. Sem affordance consistente. |
| Detail | Dialogs, não telas dedicadas | Não escala para mobile. Dialog em tela pequena é ruim para informação densa. |
| Domus | Nenhum ponto de acesso | Domus não existe nos módulos hoje. |

---

## 3. TAXONOMIA DE MÓDULOS

Agrupamento funcional para definir variações permitidas do padrão universal:

| Tipo | Descrição | Módulos | Características obrigatórias |
|------|-----------|---------|------------------------------|
| **T — Transactional** | Lista de entidades (contas, transações, assinaturas) | Contas, Assinaturas, Cartões, Parcelas, Lançamentos | Header + Summary + List + Add action + Detail screen |
| **P — Portfolio** | Coleção de ativos/passivos com métricas | Investimentos, Passivos | Header + Summary KPIs + Tabs/List + Detail + Simulation |
| **A — Analytical** | Análise de dados, relatórios | DRE (implícito), Relatórios, Imposto Renda | Header + Period filter + Summary + Chart + Breakdown |
| **PL — Planning** | Planejamento e metas | Planejamento | Header + Month nav + Tabs + Charts + Forms |
| **W — Workflow** | Processo sequencial guiado | Importações | Header + Steps + Review + Confirm + History |
| **E — Educational** | Conteúdo educacional | Academia | Header + Progress + Content + Navigation |
| **AD — Admin** | Configuração e gestão | Configurações, Empresas, Fiscal/Contábil | Header + Tabs/Sections + Forms + Save |

---

## 4. ANATOMIA UNIVERSAL DO MÓDULO

```
┌──────────────────────────────────────────────────────────────┐
│                       STATUS BAR (54px)                       │
├──────────────────────────────────────────────────────────────┤
│ ← Origem     Nome do Módulo              [ação] [ação]       │ ← Header (48px)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              MODULE SUMMARY (Opcional)                    ││ ← Só se houver métrica
│  │  Valor principal  +  tendência  +  contexto               ││    principal
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              MODULE INSIGHT (Opcional)                    ││ ← 0-1 insight Domus
│  │  Observação contextual                                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              MODULE ACTIONS                              ││ ← 0-1 ação primária
│  │  [Ação principal]                    [secundária?]       ││    + 0-1 secundária
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              INTERNAL NAVIGATION (Opcional)               ││ ← Tabs, chips, ou segment
│  │  [Tab 1]  [Tab 2]  [Tab 3]  [Tab 4]                      ││    Máx 4 visíveis
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              FILTERS (Opcional)                           ││ ← Chips rápidos
│  │  [Este mês]  [3 meses]  [1 ano]  [+ Filtros]             ││    + Sheet complexo
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │              MAIN CONTENT                                ││ ← Lista, cards,
│  │              (scroll)                                    ││    gráfico, tabela,
│  │                                                          ││    formulário, ou
│  │                                                          ││    conteúdo educacional
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← space.16 (64px) padding antes da Bottom Nav →            │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │ ← Bottom Nav (82px)
│ Início   Módulos    Domus    Perfil                          │
│ [Active depende da origem]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Elementos obrigatórios em todos os módulos:** Header + Main Content + Bottom Nav.

**Elementos opcionais:** Summary, Insight, Actions, Internal Navigation, Filters. Cada tipo de módulo define quais são aplicáveis.

---

## 5. HEADER UNIVERSAL

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início     Nome do Módulo              [ação] [ação]       │ ← 48px
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Regra |
|----------|-------|
| **Back** | Seta + nome da origem ("← Início", "← Módulos", "← Domus"). Ausente se módulo é destino raiz da Bottom Nav (nunca ocorre — todos os módulos são acessados via origem). |
| **Título** | Nome do módulo. 16px, 600w, text-primary. Centralizado ou à esquerda. |
| **Ações (direita)** | Máximo **2 ícones** visíveis. Ex: busca, Domus contextual, adicionar. Overflow → Sheet "Mais". |
| **Origem dinâmica** | "← Início" se veio da Home. "← Módulos" se veio da tela Módulos. "← Domus" se veio de deep link da Domus. |

### Header Actions Budget

| Limite | Regra |
|--------|-------|
| Máximo de ações visíveis | **2 ícones** (24px, text-secondary, touch target 44px) |
| Ações comuns | Domus contextual, Search (se módulo tiver), Add (se tipo T) |
| Overflow | Se mais de 2: ícone `MoreHorizontal` → Sheet com lista de ações |
| Nunca no header | Filtros (ficam no conteúdo), Exportar (ação secundária), Config (no Perfil) |

---

## 6. MODULE SUMMARY

Opcional. Presente quando o módulo tem uma métrica principal que responde "como estou neste módulo?".

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Contas                                                   ││ ← label 10px, tertiary
│  │                                                          ││
│  │ R$ 12.450                                                ││ ← 36px financial-hero
│  │                                                          ││
│  │ 3 contas ativas · 2 bancos               ↓ tendência    ││ ← 13px, secondary
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

| Regra | Valor |
|-------|-------|
| **Quando usar** | Módulos T, P, PL, A (métrica principal existe) |
| **Quando NÃO usar** | Módulos W, E, AD (sem métrica principal clara) |
| **Valor** | 36px financial-hero, 800w, tabular-nums. 1 por módulo. |
| **Contexto** | 13px, 500w, text-secondary |
| **Tratamento** | Card Surface, radius-md, padding 16px |
| **Proibido** | Múltiplos KPIs lado a lado (isso é dashboard, não summary) |

---

## 7. MODULE INSIGHT

Opcional. 0-1 insight contextual da Domus sobre o módulo.

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ◈ Domus                                                  ││ ← label 10px, azul
│  │                                                          ││
│  │ Seus aportes em renda variável                            ││ ← corpo 13px, secondary
│  │ caíram 30% este mês.                                     ││
│  │                                                          ││
│  │ Entender                                                 ││ ← CTA 13px, azul
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

| Regra | Valor |
|-------|-------|
| **Quando usar** | Dados disponíveis + insight relevante. Módulos T, P, PL, A. |
| **Quando NÃO usar** | Módulos W, AD. Sem dados. Insight já mostrado na Home. |
| **Tratamento** | Mesmo padrão visual do Insight da Home e da Domus: Surface card + borda esquerda azul 2px + label "Domus" + ponto azul. |
| **Ação** | "Entender" → abre Domus com contexto do módulo. |
| **Proibido** | Múltiplos insights. Insights genéricos. |

---

## 8. MODULE ACTIONS

0-1 ação primária + 0-1 ação secundária.

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │              [Adicionar conta]                            ││ ← Ação primária
│  │              [Importar extrato]                           ││ ← Ação secundária (opcional)
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

| Regra | Valor |
|-------|-------|
| **Primária** | Botão full-width, 44px altura, fundo azul FinDomus, texto Canvas. 1 por módulo. |
| **Secundária** | Botão full-width, 44px, outline (border-default), texto text-primary. 0-1. |
| **Posição** | Acima do conteúdo principal. Abaixo do Summary/Insight. |
| **Sticky?** | NÃO. Ações rolam com o conteúdo. |
| **Tipo T (Transactional)** | Ação primária = "Adicionar X" |
| **Tipo P (Portfolio)** | Ação primária pode ser ação contextual ou nenhuma |
| **Tipo A (Analytical)** | Ação primária = "Exportar", "Filtrar", ou nenhuma |
| **Tipo W (Workflow)** | Ação primária = "Importar arquivo", "Começar" |
| **Tipo PL (Planning)** | Ação primária = "Nova meta", "Salvar" |
| **Tipo E (Educational)** | Ação primária = "Continuar" |
| **Tipo AD (Admin)** | Ação primária = "Salvar alterações" |

---

## 9. INTERNAL NAVIGATION (Tabs)

Opcional. Presente quando o módulo tem subseções.

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [ Overview ]  [ Carteira ]  [ Aportes ]  [ Análise ]     ││ ← Tabs
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Decisão: Formato A — Tabs horizontais (comprimido).**

| Formato | Avaliação |
|---------|-----------|
| **A — Tabs horizontais** | ✅ Natural em mobile. Scroll horizontal se ≥5. Recomendado. |
| B — Segmented control | Parece filtro, não navegação. |
| C — Subnavigation list | Ocupa muito espaço vertical. |
| D — Chips | Parece sugestão, não seção. |
| E — Dropdown | Esconde estrutura. |

### Tab Budget

| Limite | Regra |
|--------|-------|
| **Ideal** | 2-3 tabs |
| **Máximo visível** | **4 tabs** |
| **5+ tabs** | Scroll horizontal com indicador de overflow |
| **8+ tabs** | Reavaliar: módulo precisa ser dividido em sub-rotas |

### Especificação

| Elemento | Especificação |
|----------|--------------|
| Altura | 44px |
| Label | 13px, 500w |
| Active | text-primary, 600w, underline 2px azul FinDomus |
| Inactive | text-tertiary, 500w |
| Gap entre tabs | `space.3` (12px) |
| Sticky | Opcional. Sticky ao scroll se módulo tem conteúdo longo. |
| Scroll horizontal | Permitido. Com fade nas bordas (gradiente Canvas). |

---

## 10. FILTERS

Opcional. Padrão de 2 níveis: rápido (chips) + completo (Sheet).

### 10.1 Filtro rápido (chips)

```
┌──────────────────────────────────────────────────────────────┐
│  [Este mês]  [3 meses]  [6 meses]  [1 ano]  [Personalizado] │ ← Chips
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Altura | 32px |
| Label | 13px, 500w |
| Active | text-primary, fundo action-primary-soft, borda action-primary |
| Inactive | text-secondary, fundo Raised, borda border-subtle |
| Scroll | Horizontal, com fade nas bordas |
| "Personalizado" | Último chip, abre Filter Sheet |

### 10.2 Filtro completo (Sheet)

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro]                             │
├──────────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                         │
│                                                              │
│  Filtrar                                                     │
│                                                              │
│  Período                                                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ De: [ 01/07/2026 ]                                      ││
│  │ Até: [ 31/07/2026 ]                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Categoria                                                   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ☐ Alimentação    ☐ Moradia    ☐ Transporte              ││
│  │ ☐ Lazer          ☐ Saúde      ☐ Investimentos           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Aplicar filtros                              ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Limpar filtros                               ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Filtro ativo — indicação

Quando há filtros aplicados, o chip "Personalizado" ou o ícone de filtro mostra um indicador:

```
[Filtros ●]  ← ponto azul indica filtros ativos
```

Não depender apenas de cor. O ponto + mudança de label (ex: "Filtros (2)") resolve acessibilidade.

---

## 11. PERÍODO (MONTH NAVIGATION)

Padrão para módulos que trabalham com mês de referência.

```
┌──────────────────────────────────────────────────────────────┐
│           ← julho 2026 →                                     │ ← Month nav
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| Layout | ← [mês ano] →, 3 elementos horizontais |
| Seta esquerda | Mês anterior. 44px touch target. |
| Seta direita | Mês seguinte. 44px touch target. Desabilitada se mês futuro sem dados. |
| Label | "julho 2026", 16px, 600w, text-primary, centralizado |
| Sticky | Não. Rola com conteúdo. |

---

## 12. SEARCH DENTRO DO MÓDULO

Opcional. Ícone de busca no header (slot de ação).

```
┌──────────────────────────────────────────────────────────────┐
│ ← Início     Contas                            🔍  [  +  ]  │ ← Search no header
└──────────────────────────────────────────────────────────────┘
```

| Regra | Valor |
|-------|-------|
| Quando usar | Listas com >10 itens. Módulos T, P. |
| Quando NÃO usar | Módulos W, E, AD. Módulos com <10 itens. |
| Comportamento | Toque → expande campo de busca inline abaixo do header. Foco → teclado. |
| Escopo | Apenas o conteúdo do módulo atual. Não é busca global. |

---

## 13. MAIN CONTENT — LISTAS

Padrão universal de list item.

### 13.1 List Item Standard (56px)

```
┌──────────────────────────────────────────────────────────────┐
│  [ícone]  Nome do item                       valor  →       │ ← 56px
│            meta/secundário                                  │ ← 12px, secondary
└──────────────────────────────────────────────────────────────┘
```

### 13.2 List Item with Status (56px)

```
┌──────────────────────────────────────────────────────────────┐
│  [ícone]  Nome do item                       [status]       │ ← 56px
│            meta/secundário                     →            │
└──────────────────────────────────────────────────────────────┘
```

### 13.3 List Item Compact (44px)

```
┌──────────────────────────────────────────────────────────────┐
│  Nome do item                                  valor  →     │ ← 44px
└──────────────────────────────────────────────────────────────┘
```

### Especificação

| Elemento | Standard (56px) | Compact (44px) |
|----------|:---:|:---:|
| Altura | 56px | 44px |
| Ícone | 36px container, 24px ícone | Sem ícone |
| Nome | 14px, 600w, text-primary | 14px, 500w, text-primary |
| Meta | 12px, 400w, text-secondary | — |
| Valor | 14px, 600w, tabular-nums, text-primary, alinhado à direita | 14px, 500w, tabular-nums |
| Status/Badge | 10px, posição do valor | — |
| Chevron | 16px, text-tertiary, opacidade 0.4 | 16px |
| Touch | Card inteiro, affordance Raised + borda border-subtle | Row inteira |
| Gap vertical | `space.2` (8px) entre itens | `space.1` (4px) |

---

## 14. TABELAS NO MOBILE

FDL: sem grid vertical, sem zebra, header secundário, números à direita.

**Regra mobile:** Se a tabela tem >3 colunas, reformular como lista de cards. Se tem ≤3 colunas, tabela compacta pode ser usada.

```
Tabela 3 colunas:                     Lista equivalente:

Data        Cat.     Valor            ┌──────────────────────────┐
─────       ────     ─────            │ 15/07  Alimentação       │
15/07       Alim.    R$ 120           │        R$ 120     →     │
16/07       Transp.  R$ 45            └──────────────────────────┘
                                      ┌──────────────────────────┐
                                      │ 16/07  Transporte        │
                                      │        R$ 45      →     │
                                      └──────────────────────────┘
```

---

## 15. GRÁFICOS

Módulo pode ter maior densidade visual que a Home (densidade Standard vs Calm).

| Regra | Valor |
|-------|-------|
| Máximo por viewport | **1 gráfico principal** |
| Cores | Máximo 5. Paleta FDL (chart colors do globals.css) |
| Altura máxima | 260px |
| Legenda | Abaixo do gráfico. Não ocupar coluna lateral. |
| Interação | Toque no gráfico → tooltip/detalhe. |
| Domus | "Entender este gráfico" → Domus contextual (ação terciária, texto) |

---

## 16. DETAIL SCREEN

Quando o usuário toca um item de lista, abre uma tela de detalhe dedicada (não dialog).

```
┌──────────────────────────────────────────────────────────────┐
│ ← Módulo      Nome do Item                  [editar] [···]  │ ← Header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              DETAIL SUMMARY                               ││ ← Valor principal
│  │  R$ 4.200                                                ││    + status
│  │  Cartão de crédito · Ativo                               ││    + contexto
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              DETAIL INFO                                  ││ ← Campos
│  │  Instituição: Nubank                                     ││
│  │  Parcelas: 8/12                                          ││
│  │  Vencimento: 15/08/2026                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              DETAIL ACTIONS                               ││
│  │  [Editar]    [Simular quitação]    [Excluir]              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ⌂         ⊞⊞         ◈         ◉                            │
│ [Active = mesmo do módulo pai]                               │
└──────────────────────────────────────────────────────────────┘
```

### Detail Screen Contract

| Elemento | Especificação |
|----------|--------------|
| **Header** | ← Nome do módulo pai + nome do item. Ações: editar (ícone lápis), mais (··· Sheet). |
| **Summary** | Card Surface. Valor principal (28px, 700w), status (badge), contexto (13px). |
| **Info** | Card Surface. Campos label:value. Label 10px tertiary, value 13px primary. |
| **Actions** | Máximo 3 ações. Primária: botão full-width azul. Secundárias: outline. Destrutiva: outline + texto state-negative. |
| **Bottom Nav** | Mesmo active state do módulo pai. |
| **Back** | ← Nome do módulo. Restaura scroll e tab do módulo pai. |

---

## 17. CRUD — CRIAÇÃO E EDIÇÃO

### 17.1 Criação (Add)

**Decisão: Bottom Sheet para formulários simples, tela dedicada para formulários complexos.**

| Complexidade | Mecanismo | Exemplo |
|:-----------:|-----------|---------|
| **Simples (≤5 campos)** | Bottom Sheet | Nova conta, Nova assinatura, Novo passivo simples |
| **Complexo (>5 campos)** | Tela dedicada | Novo investimento (classe, ticker, preço, quantidade, data), Nova empresa |

### 17.2 Edição

**Decisão: Bottom Sheet padrão.**

Edição geralmente tem os mesmos campos da criação. Usar o mesmo componente.

### 17.3 Exclusão (Delete)

```
┌──────────────────────────────────────────────────────────────┐
│                    [scrim escuro]                             │
├──────────────────────────────────────────────────────────────┤
│           ━━━━━━━━━━                                         │
│                                                              │
│  Excluir conta?                                              │
│                                                              │
│  Itaú PF — Conta Corrente                                    │
│  Saldo: R$ 4.200                                             │
│                                                              │
│  Esta ação não pode ser desfeita. Os dados                   │
│  históricos de transações serão preservados.                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Excluir conta                               ││ ← Botão vermelho
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Cancelar                                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Confirmação:** Bottom Sheet para ações destrutivas. Exibe nome do item + consequência. Botão destrutivo usa `state-negative` (#EF4444) apenas no botão, não na tela inteira.

---

## 18. FORMULÁRIOS

Padrão universal mobile.

```
┌──────────────────────────────────────────────────────────────┐
│  ← Voltar       Nova Conta                                   │ ← Header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nome da conta                                               │ ← Label (10px, tertiary)
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Itaú Conta Corrente                                     ││ ← Input (44px, Raised)
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Tipo                                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Conta Corrente                                    ▾     ││ ← Select (44px)
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Saldo inicial                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ R$ 0,00                                                 ││ ← Input financeiro
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Salvar conta                                 ││ ← Botão full-width
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|--------------|
| **Label** | 10px, 600w, text-tertiary. SEMPRE acima do campo. NUNCA placeholder como label. |
| **Input** | 44px altura, Raised, border-subtle. Focus: border-emphasis. |
| **Input financeiro** | Prefixo "R$". Teclado numérico. Formatação pt-BR. |
| **Select** | 44px. Toque → Bottom Sheet com lista de opções (se >5 opções). |
| **Date** | 44px. Toque → Date Picker nativo ou Sheet com calendário simplificado. |
| **Helper** | 11px, text-tertiary. Abaixo do input. |
| **Error** | 11px, state-negative. Abaixo do input. Borda do input muda para border-error. |
| **Save** | Full-width, 44px, azul FinDomus. Posição: abaixo dos campos. Sticky? Apenas se formulário longo (>2 viewports). |

---

## 19. ESTADOS DO MÓDULO

### 19.1 Empty State

#### Vazio inicial (sem dados)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    [ícone do módulo, 48px]                    │
│                                                              │
│              Nenhuma conta cadastrada                        │
│                                                              │
│     Conecte suas contas para controlar saldos                │
│     e monitorar sua liquidez.                                │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Adicionar conta               │           │
│           └──────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Vazio positivo (ex: sem dívidas)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    [ícone shield-check, 48px]                 │
│                                                              │
│              Você não possui dívidas ativas                  │
│                                                              │
│     Sua saúde financeira está preservada.                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Vazio filtrado

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              Nenhum resultado neste período                  │
│                                                              │
│           Tente ajustar os filtros ou limpar.                │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Limpar filtros                │           │
│           └──────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 19.2 Loading

**Skeleton por bloco, não spinner de página inteira.**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Início     Contas                                        │ ← Header normal
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ████████████████                                        ││ ← Summary skeleton
│  │ ████████████                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ██████████████                    ██████          →     ││ ← List skeleton
│  │ ██████████                                              ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ██████████████                    ██████          →     ││
│  │ ██████████                                              ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Especificação do skeleton:** `animate-pulse`, fundo `Raised` ou `Surface`, radius consistente com o elemento real. 3-5 linhas de skeleton para listas.

### 19.3 Error

```
┌──────────────────────────────────────────────────────────────┐
│  ← Início     Contas                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    [AlertCircle, 48px, state-negative]        │
│                                                              │
│              Não foi possível carregar                       │
│                                                              │
│     Verifique sua conexão e tente novamente.                 │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Tentar novamente              │           │
│           └──────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Regra:** Erro parcial (ex: falhou lista, mas summary carregou) → preservar o que carregou. Erro total → tela de erro.

### 19.4 Offline

Módulo funciona com dados cacheados quando disponíveis.

```
┌──────────────────────────────────────────────────────────────┐
│  ← Início     Contas                        [ offline ]     │ ← Indicador sutil
├──────────────────────────────────────────────────────────────┤
│  [Conteúdo cacheado visível]                                 │
│                                                              │
│  Ações que exigem rede: desabilitadas com label "Offline"   │
└──────────────────────────────────────────────────────────────┘
```

### 19.5 Privacy Mode

Valores mascarados (`R$ ••••••`). Estrutura e labels preservadas. Nomes de contas, categorias e status visíveis.

### 19.6 Read-Only

Quando o usuário não tem permissão de edição (Família: member, PJ: viewer):
- Ações de create/edit/delete → ocultas (não desabilitadas)
- Module Summary → visível
- Listas → visíveis
- Detail → visível, sem botões de ação
- Insight Domus → visível

---

## 20. DOMUS NO MÓDULO

Todo módulo deve oferecer acesso contextual à Domus.

### 20.1 Ponto de acesso

| Local | Quando usar |
|-------|------------|
| **Header (ícone)** | Sempre. Ícone Domus (BrainCircuit placeholder) no slot de ação à direita. |
| **Module Insight** | Se existir insight, o CTA "Entender" já leva à Domus. |
| **Gráfico** | "Entender este gráfico" → link terciário. |

### 20.2 Contexto enviado

Ao abrir Domus de dentro de um módulo:

```js
{
  financialContext: "PF" | "Família" | "Empresa X",
  moduleContext: "investimentos" | "contas" | ...,
  subSection: "carteira" | null,
  entityContext: { id, type, name } | null,  // se veio de detail
  period: "2026-07" | null,
  activeFilters: { ... } | null
}
```

### 20.3 Retorno da Domus

Ao voltar da Domus para o módulo:
- Scroll preservado
- Tab ativa preservada
- Filtros preservados
- Detail screen: se estava em detail, volta para o detail

---

## 21. BOTTOM NAV NO MÓDULO

Bottom Nav sempre visível. Active state segue Navigation Contract:

| Origem | Active state |
|--------|:-----------:|
| Home → Módulo | Início |
| Módulos → Módulo | Módulos |
| Domus → Módulo | Domus |

---

## 22. BACK BEHAVIOR

| Ação | Comportamento |
|------|--------------|
| ← no header | `router.back()`. Restaura estado da tela anterior. |
| Bottom Nav | Navegação explícita. Não empilha. |
| Detail → Módulo | ← volta para lista do módulo. Scroll e tab preservados. |
| Form → Módulo | Se criou/editou → recarrega lista. Se cancelou → restaura. |

---

## 23. DEEP LINKS

Módulo pode ser aberto diretamente em:

| Deep link | Comportamento |
|-----------|--------------|
| `/contas` | Abre módulo. Tab Overview. |
| `/contas?tab=pj` | Abre módulo. Tab PJ section. |
| `/investimentos?id=abc123` | Abre detail do investimento. Back → lista de investimentos. |
| `/planejamento?acao=nova-meta` | Abre módulo, dispara sheet de nova meta. |

---

## 24. WORKFLOW (MÓDULOS TIPO W)

Padrão para módulos com processo sequencial.

```
┌──────────────────────────────────────────────────────────────┐
│  ← Módulos     Importações                                   │
├──────────────────────────────────────────────────────────────┤
│  ● Selecionar ──○ Revisar ──○ Confirmar ──○ Concluído       │ ← Steps (32px)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Conteúdo da etapa atual]                                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Continuar                                   ││ ← Próxima etapa
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Voltar                                      ││ ← Etapa anterior
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

| Regra | Valor |
|-------|-------|
| Steps | Indicador de progresso: ●○○○. Máximo 5 etapas. |
| Navegação | Linear. Botão "Continuar" (primário) + "Voltar" (secundário). |
| Cancelar | Header: ícone X. Sheet de confirmação se houve progresso. |
| Concluído | Última etapa mostra resultado + ação "Concluir" ou "Ver X". |

---

## 25. PREMIUM GATE

Alguns recursos exigem plano superior.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    [ícone Crown, 48px, premium]               │
│                                                              │
│              Recurso Premium                                 │
│                                                              │
│     Este relatório está disponível nos planos                │
│     Essencial Plus e Premium.                                │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Ver planos                    │           │ ← Navega para Perfil → Planos
│           └──────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Regras:**
- Premium Gate aparece APENAS no ponto de acesso ao recurso, não polui o módulo inteiro
- "Ver planos" leva a Perfil → Planos
- NUNCA upsell agressivo no meio de tarefa financeira
- Módulo continua funcional para recursos disponíveis no plano atual

---

## 26. STATUS INDICATORS

| Status | Cor | Ícone (Lucide) | Exemplo |
|--------|-----|----------------|---------|
| Ativo | text-primary | — | Conta ativa |
| Concluído | state-positive | `CheckCircle` | Meta atingida |
| Atrasado | state-warning | `AlertCircle` | Pagamento vencido |
| Pendente | text-tertiary | `Clock` | Em análise |
| Pago | state-positive | `Check` | Parcela paga |
| Crítico | state-negative | `AlertTriangle` | Saldo negativo |
| Premium | premium (#C8A951) | `Crown` | Recurso exclusivo |

**Sempre usar texto + cor.** Nunca cor sozinha.

---

## 27. MODULE TYPE CONTRACTS

### T — Transactional (Contas, Assinaturas, Cartões, Parcelas, Lançamentos)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ |
| Module Summary | ✅ (métrica principal: saldo total) |
| Module Insight | Opcional |
| Primary Action | ✅ "Adicionar X" |
| Internal Navigation | Opcional (tabs se PF/PJ) |
| Filters | Opcional |
| Main Content | ✅ Lista de itens |
| Detail Screen | ✅ |
| Bottom Nav | ✅ |

### P — Portfolio (Investimentos, Passivos)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ |
| Module Summary | ✅ (KPIs: valor total, rentabilidade, projeção) |
| Module Insight | ✅ Recomendado |
| Primary Action | Opcional |
| Internal Navigation | ✅ Tabs |
| Filters | Opcional |
| Main Content | ✅ Lista + Charts |
| Detail Screen | ✅ (com Simulation opcional) |
| Bottom Nav | ✅ |

### A — Analytical (DRE, Relatórios, Imposto Renda)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ |
| Module Summary | ✅ |
| Module Insight | Opcional |
| Primary Action | Opcional (Exportar) |
| Internal Navigation | Opcional |
| Filters | ✅ Período |
| Main Content | ✅ Chart + Breakdown + Tabela |
| Detail Screen | — (Analítico já é o detalhe) |
| Bottom Nav | ✅ |

### PL — Planning (Planejamento)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ |
| Module Summary | ✅ |
| Module Insight | ✅ Recomendado |
| Primary Action | ✅ "Salvar metas" |
| Internal Navigation | ✅ Tabs (Visão geral, Orçamento, Metas) |
| Filters | ✅ Month navigator |
| Main Content | ✅ Charts + Forms + Cards |
| Detail Screen | — |
| Bottom Nav | ✅ |

### W — Workflow (Importações)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ (com X para cancelar) |
| Module Summary | — |
| Module Insight | — |
| Primary Action | ✅ "Continuar" (contextual por etapa) |
| Internal Navigation | — (Steps substituem tabs) |
| Filters | — |
| Main Content | ✅ Upload / Review / Confirm |
| Detail Screen | — |
| Bottom Nav | ✅ |

### E — Educational (Academia)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ |
| Module Summary | ✅ "Trilha: Liberdade Financeira · 50% concluído" |
| Module Insight | Opcional |
| Primary Action | ✅ "Continuar aula" |
| Internal Navigation | — (Conteúdo sequencial) |
| Filters | — |
| Main Content | ✅ Aulas, progresso |
| Detail Screen | ✅ Tela de aula (conteúdo) |
| Bottom Nav | ✅ |

### AD — Admin (Configurações, Empresas, Fiscal/Contábil)

| Elemento | Obrigatório? |
|----------|:-----------:|
| Header | ✅ |
| Module Summary | — |
| Module Insight | — |
| Primary Action | ✅ "Salvar" (contextual) |
| Internal Navigation | ✅ Tabs ou seções |
| Filters | Opcional (Empresas: filtro de empresa) |
| Main Content | ✅ Forms, listas, controles |
| Detail Screen | Opcional |
| Bottom Nav | ✅ |

---

## 28. MODULE COMPLEXITY BUDGET

| Limite | Valor |
|--------|:-----:|
| **Summary KPIs** | 1 protagonista (36px financial-hero) |
| **Insights** | 0-1 |
| **Primary Actions** | 1 |
| **Secondary Actions** | 0-1 |
| **Tabs** | 2-4 visíveis |
| **Filters rápidos** | ≤5 chips |
| **Gráficos por viewport** | 1 |
| **List items por tela (sem scroll)** | ~6 (390px) |
| **Detail actions** | ≤3 |
| **Form fields visíveis sem scroll** | ~6 (390px) |
| **Workflow steps** | ≤5 |
| **Status colors simultâneas** | ≤3 |
| **Header action icons** | ≤2 |
| **Emojis** | 0 |
| **Provider AI badges** | 0 |

---

## 29. TESTES DE VALIDAÇÃO

### 29.1 Teste módulo simples (T — Assinaturas)

```
Header: ← Módulos  Assinaturas              [+]
Summary: R$ 320/mês · 4 ativas
Lista: [Netflix R$ 55,90 →] [Spotify R$ 21,90 →] ...
✅ Padrão T aplicado. Simples. Previsível.
```

### 29.2 Teste transacional (T — Contas)

```
Header: ← Início    Contas              🔍  [+]
Summary: R$ 12.450 · 3 contas · 2 bancos
Lista (PF/PJ sections): [Itaú PF R$ 4.200 →] [Nubank PJ R$ 8.250 →]
Detail: header + summary + info + [Editar] [Excluir]
✅ Padrão T com tabs implícitas (PF/PJ). Detail screen dedicado.
```

### 29.3 Teste portfolio (P — Investimentos)

```
Header: ← Módulos   Investimentos       ◈  [+]
Summary: R$ 42.800 · +R$ 1.200 no mês
Insight: Seus aportes em renda variável caíram 30%.
Tabs: [Overview] [Carteira] [Aportes] [Análise]
Lista/Chart: Conteúdo da tab ativa
Detail: Ativo específico com simulation opcional
✅ Padrão P. Complexidade gerenciada por tabs.
```

### 29.4 Teste analítico (A — Relatórios)

```
Header: ← Módulos   Relatórios              [◈]
Summary: Resultado do mês: R$ 18.420
Filters: [Este mês] [3 meses] [6 meses] [1 ano]
Chart: Gráfico de barras (260px)
Breakdown: Tabela/lista de categorias
✅ Padrão A. Filtro + chart + breakdown.
```

### 29.5 Teste planejamento (PL — Planejamento)

```
Header: ← Início    Planejamento            [◈]
Summary: Renda: R$ 6.200 · Despesas: R$ 4.280
Month nav: ← julho 2026 →
Tabs: [Visão geral] [Orçamento] [Metas]
Content: Charts, cards, goal manager
Action: [Salvar metas] (sticky)
✅ Padrão PL. Month nav + tabs + forms.
```

### 29.6 Teste workflow (W — Importações)

```
Header: ← Módulos   Importações              [✕]
Steps: ● Arquivo ──○ Revisar ──○ Confirmar ──○ Concluído
Content: Upload area + file selector
Actions: [Continuar] [Voltar]
✅ Padrão W. Steps + linear flow.
```

### 29.7 Teste educacional (E — Academia)

```
Header: ← Módulos   Academia                 [◈]
Summary: Liberdade Financeira · Aula 4 de 8 · 50%
Content: Aulas em grade/lista
Action: [Continuar aula]
Detail: Tela de aula com conteúdo
✅ Padrão E. Summary de progresso + conteúdo sequencial.
```

### 29.8 Teste admin (AD — Configurações)

```
Header: ← Perfil    Configurações
Tabs: [Perfil] [Família] [Categorias] [Backup] [IA] [Preferências]
Content: Forms e controles
Action: [Salvar alterações]
✅ Padrão AD. Tabs + forms + save.
```

### 29.9 Teste Academia (confirmação E)

Academia funciona com padrão E sem parecer "módulo financeiro artificial". O Summary é o progresso da trilha. O conteúdo é educacional, não financeiro. O padrão acomoda. ✅

### 29.10 Teste DRE (confirmação A)

DRE não tem rota dedicada hoje, mas pertence ao tipo A. Summary com resultado do período. Chart + breakdown. Filtro de período. ✅

### 29.11 Teste PJ (Empresas)

Empresas é tipo AD (admin de empresas). Lista de empresas + filtro + ações de create/edit. Sem summary financeiro. ✅

### 29.12 Teste 100 módulos

Se 100 novos módulos forem adicionados, cada um se encaixa em um dos 7 tipos (T, P, A, PL, W, E, AD). Nenhum tipo novo é necessário. O padrão universal escala. ✅

### 29.13 Teste 375px

- Tabs: 4 tabs a 375px → ~94px por tab com padding. Cabem sem scroll. ✅
- Filtro chips: 4-5 chips. Scroll horizontal. ✅
- List items 56px: ~6 itens visíveis sem scroll. ✅
- Detail: summary + info + actions. Tudo cabe com scroll. ✅

### 29.14 Teste empty/offline/privacy/permissions

- Empty: 3 variantes definidas (inicial, positivo, filtrado). ✅
- Offline: dados cacheados + ações desabilitadas. ✅
- Privacy: valores mascarados, estrutura preservada. ✅
- Read-only: ações ocultas, dados visíveis. ✅

---

## 30. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**MODULE-P0: 0 · MODULE-P1: 0 · MODULE-P2: 2 · MODULE-P3: 1**

### MODULE-P2

| ID | Descrição |
|----|-----------|
| P2-01 | Módulos existentes precisam ser migrados para o padrão universal (header padrão, detail screens dedicados, empty states padronizados). |
| P2-02 | Domus contextual: ícone no header de cada módulo precisa ser implementado. |

### MODULE-P3

| ID | Descrição |
|----|-----------|
| P3-01 | Skeleton component compartilhado entre módulos. Hoje cada módulo implementa seu próprio skeleton manual. |

---

## 31. CHANGE REQUESTS

Nenhum change request necessário. O padrão universal é compatível com FDL 1.0, Navigation v1 e Domus v1.

---

## 32. RECOMENDAÇÃO FINAL

O Universal Module Pattern v1 define um contrato de anatomia e comportamento que se aplica a todos os 15+ módulos do FinDomus Mobile, organizados em 7 tipos funcionais. O padrão garante previsibilidade de uso sem forçar uniformidade visual.

**Próximo passo:** Com MODULE-P0 = 0 e MODULE-P1 = 0:

→ **TELAS DOS MÓDULOS** — um módulo por vez, começando pelos de maior complexidade (Planejamento, Investimentos, Contas).

---

*FinDomus Universal Module Pattern v1 · Fase 9 concluída · Aguardando homologação*
