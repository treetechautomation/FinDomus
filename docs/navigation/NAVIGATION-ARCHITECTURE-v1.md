# FINDOMUS MOBILE NAVIGATION ARCHITECTURE v1

**Fase:** 4 — Arquitetura de Navegação Mobile
**FDL:** 1.0 FROZEN
**Baseline funcional:** `bc19adb`
**Estado anterior:** Home homologada (ARCHITECTURE + WIREFRAME + MASTER VISUAL v1)

---

## 1. RESUMO EXECUTIVO

O FinDomus possui **23 rotas de página** e **30+ motores financeiros** no backend, mas atualmente depende de um **sidebar desktop de 13 itens** como única estrutura de navegação. No mobile, esta sidebar vira um hamburger drawer — o que apenas esconde o problema.

Esta arquitetura propõe um modelo de navegação mobile em 3 camadas:
- **Nível 1 — Bottom Navigation (4 destinos):** Home, Módulos, Domus, Perfil
- **Nível 2 — Descoberta de Módulos:** Organizada por categorias semânticas, com busca
- **Nível 3 — Navegação Interna:** Padrão universal de tabs + detalhe progressivo

O modelo escala para 100+ módulos sem alterar a Bottom Nav. A Domus ganha destaque como destino global de inteligência. O Context Switcher opera globalmente. A arquitetura é validada contra 20, 50 e 100 módulos, PF/PJ/Família, multiempresa, novo usuário e power user.

---

## 2. AUDITORIA DA NAVEGAÇÃO EXISTENTE

### 2.1 Estado atual

| Elemento | Implementação | Problema mobile |
|----------|--------------|-----------------|
| Navegação principal | Sidebar desktop (13 itens) + hamburger drawer no mobile | 13 itens em drawer = scroll longo, sem hierarquia |
| Contexto PF/PJ/Família | **Inexistente.** Usuário tem 1 household. Companies são separadas. | Sem distinção de contexto na UI |
| Domus | AI Chat Widget no rodapé da sidebar | Invisível no mobile, não é destino de primeira classe |
| Busca | **Inexistente** | Não há como encontrar módulos por busca |
| Bottom Nav | **Inexistente** | Apenas hamburger |
| FAB | **Inexistente** | — |
| Módulos | 23 rotas de página, 13 na sidebar | Excesso de itens, sem agrupamento semântico |
| Profundidade | `(main)/investimentos/calculadoras/` com 5 subcalculadoras | Aninhamento visível na sidebar mas sem breadcrumb |
| Back | Comportamento padrão do browser/Next.js | Sem previsibilidade definida |
| Deep link | Inexistente (exceto convite por token) | — |
| Persistência de estado | Sidebar state (cookie) | Scroll/filtros não persistem |

### 2.2 Itens da sidebar atual (13)

| # | Rota | Label | Ícone |
|---|------|-------|-------|
| 1 | `/` | Visão Geral | LayoutDashboard |
| 2 | `/planejamento` | Planejamento | Target |
| 3 | `/pessoal` | Pessoal | Users |
| 4 | `/empresas` | Empresas | Building2 |
| 5 | `/contas` | Contas | CreditCard |
| 6 | `/investimentos` | Investimentos | TrendingUp |
| 7 | `/passivos` | Passivos | ShieldAlert |
| 8 | `/assinaturas` | Despesas Fixas | Repeat2 |
| 9 | `/fiscal-contabil` | Fiscal & Contábil | BookCopy |
| 10 | `/importacoes` | Importações | Upload |
| 11 | `/relatorios` | Relatórios | BarChart3 |
| 12 | `/planos` | Planos | Crown |
| 13 | `/configuracoes` | Configurações | Settings |

---

## 3. INVENTÁRIO REAL DE ROTAS

### 3.1 Rotas de página (todas em `(main)`)

| # | Rota | Tipo | PF | Família | PJ | Admin |
|---|------|------|----|---------|-----|------|
| 1 | `/` (Visão Geral) | Home (Core) | ✅ | ✅ | ✅ | — |
| 2 | `/planejamento` | Módulo | ✅ | ✅ | — | — |
| 3 | `/pessoal` | Módulo | ✅ | ✅ | — | — |
| 4 | `/empresas` | Módulo/Contexto | — | — | ✅ | — |
| 5 | `/contas` | Módulo | ✅ | ✅ | ✅ | — |
| 6 | `/investimentos` | Módulo | ✅ | ✅ | ✅ | — |
| 7 | `/passivos` | Módulo | ✅ | ✅ | ✅ | — |
| 8 | `/assinaturas` | Módulo | ✅ | ✅ | ✅ | — |
| 9 | `/fiscal-contabil` | Módulo | — | — | ✅ | — |
| 10 | `/importacoes` | Ação | ✅ | ✅ | ✅ | — |
| 11 | `/importar` | Ação | ✅ | ✅ | ✅ | — |
| 12 | `/relatorios` | Módulo | ✅ | ✅ | ✅ | — |
| 13 | `/lancamentos` | Submódulo (Pessoal) | ✅ | — | — | — |
| 14 | `/parcelas` | Submódulo (Pessoal) | ✅ | — | — | — |
| 15 | `/cartoes` | Submódulo | ✅ | — | ✅ | — |
| 16 | `/imposto-de-renda` | Módulo especialista | ✅ | — | — | — |
| 17 | `/investimentos/calculadoras` | Submódulo (Investimentos) | ✅ | ✅ | ✅ | — |
| 18 | `/investimentos/calculadoras/aposentadoria` | Calculadora | ✅ | ✅ | — | — |
| 19 | `/investimentos/calculadoras/juros-compostos` | Calculadora | ✅ | ✅ | ✅ | — |
| 20 | `/investimentos/calculadoras/poupanca-selic` | Calculadora | ✅ | ✅ | ✅ | — |
| 21 | `/investimentos/calculadoras/primeiro-milhao` | Calculadora | ✅ | ✅ | ✅ | — |
| 22 | `/investimentos/calculadoras/reserva` | Calculadora | ✅ | ✅ | ✅ | — |
| 23 | `/configuracoes` | Configuração | ✅ | ✅ | ✅ | — |
| 24 | `/console` | Admin | — | — | — | ✅ |
| 25 | `/planos` | Configuração/Billing | ✅ | ✅ | ✅ | — |

### 3.2 Rotas públicas

| Rota | Tipo |
|------|------|
| `/login` | Autenticação |
| `/convite/[token]` | Convite (Household) |
| `/planos` (pode ser acessada pré-login) | Pricing |
| `/termos` | Termos de Uso |

### 3.3 Classificação semântica

| Classificação | Rotas |
|---------------|-------|
| **Core (Sempre visível)** | Home (`/`) |
| **Módulo Principal** | Planejamento, Pessoal, Contas, Investimentos, Passivos, Empresas, Relatórios |
| **Módulo Especialista** | Fiscal & Contábil, Imposto de Renda, Assinaturas |
| **Submódulo / Detalhe** | Lançamentos, Parcelas, Cartões, Calculadoras |
| **Ação** | Importações, Importar |
| **Configuração** | Configurações, Planos |
| **Admin** | Console |
| **Público** | Login, Convite, Termos |

---

## 4. INVENTÁRIO DE AÇÕES

Ações extraídas do código real (componentes e core engines):

| Ação | Componente/Engine | Contexto | Frequência estimada |
|------|-------------------|----------|---------------------|
| Nova transação | `new-transaction-dialog.tsx` | Pessoal | Alta |
| Importar extrato | `import-center.tsx`, OFX/PDF/B3 parsers | Global | Média (onboarding; ocasional depois) |
| Criar meta | `planning-goals-manager.tsx` | Planejamento | Média |
| Nova conta | `new-account-dialog.tsx` | Contas | Baixa (setup) |
| Novo investimento | `new-investment-dialog.tsx` | Investimentos | Média |
| Novo passivo | `new-liability-dialog.tsx` | Passivos | Baixa |
| Nova empresa | `new-company-dialog.tsx` | Empresas | Baixa |
| Falar com Domus | `ai-chat-widget.tsx` | Global | Alta |
| Simular cenário | `simulation-engine.ts` | Planejamento | Média |
| Conectar banco (Pluggy) | `pluggy/` API routes | Contas | Baixa (setup) |
| Calcular aposentadoria | `retirement.ts` | Calculadoras | Baixa |
| Exportar OFX/PDF | `export/` API routes | Relatórios | Baixa |

---

## 5. INFORMATION ARCHITECTURE MAP

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTEXT SWITCHER                              │
│                   Pessoal │ Família │ Empresa A │ Empresa B         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    NÍVEL 1 — GLOBAL                           │  │
│  │                                                               │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │  │
│  │  │  HOME  │  │MÓDULOS │  │ DOMUS  │  │ PERFIL │             │  │
│  │  │  ⌂     │  │  ⊞     │  │  ◈     │  │  ◉     │             │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘             │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    NÍVEL 2 — DESCOBERTA                       │  │
│  │                                                               │  │
│  │  MEU DINHEIRO          PLANEJAR          EMPRESA (se PJ)     │  │
│  │  ├ Contas              ├ Planejamento    ├ Empresas           │  │
│  │  ├ Pessoal             ├ Investimentos   ├ Fluxo Financeiro   │  │
│  │  ├ Lançamentos         ├ Calculadoras    ├ Fiscal & Contábil  │  │
│  │  ├ Cartões             └ Reserva         ├ DRE                │  │
│  │  └ Parcelas                               └ Relatórios        │  │
│  │                                                                 │  │
│  │  COMPROMISSOS          CONHECIMENTO      CONFIGURAÇÕES        │  │
│  │  ├ Passivos            ├ Academia        ├ Perfil             │  │
│  │  ├ Assinaturas         ├ Simulações      ├ Planos             │  │
│  │  └ Imposto de Renda    └ Aposentadoria   └ Configurações      │  │
│  │                                                                 │  │
│  │  [🔍 Buscar módulos, contas, metas...]                         │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                NÍVEL 3 — NAVEGAÇÃO DO MÓDULO                  │  │
│  │                                                               │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐              │  │
│  │  │ Overview │  Dados   │ Análise  │  Ações   │              │  │
│  │  └──────────┴──────────┴──────────┴──────────┘              │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                NÍVEL 4 — DETALHE / FLUXO                      │  │
│  │                                                               │  │
│  │  Item específico (transação, meta, ativo, conta...)           │  │
│  │  + Ações contextuais                                          │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                NÍVEL 5 — ESPECIALISTA                         │  │
│  │                                                               │  │
│  │  Calculadoras, Simulações, Relatórios avançados               │  │
│  │  Acessível via módulo ou descoberta                           │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. DESTINOS GLOBAIS

Definição: rotas que precisam estar acessíveis de qualquer lugar, com 1 toque.

| Destino | Justificativa |
|---------|---------------|
| **Home** | Centro de controle. O usuário sempre pode voltar. |
| **Módulos** | Descoberta. Acesso a todas as capacidades do produto. |
| **Domus** | Inteligência. Diferencial do produto. Precisa ser ubíqua. |
| **Perfil** | Contexto, configurações, plano, logout. |

---

## 7. DESTINOS CONTEXTUAIS

Definição: módulos cuja disponibilidade depende do contexto ativo.

| Módulo | PF | Família | PJ |
|--------|:--:|:-------:|:--:|
| Planejamento | ✅ | ✅ | — |
| Pessoal / Fluxo | ✅ | ✅ | — |
| Contas | ✅ | ✅ | ✅ |
| Investimentos | ✅ | ✅ | ✅ |
| Passivos | ✅ | ✅ | ✅ |
| Assinaturas | ✅ | ✅ | ✅ |
| Empresas | — | — | ✅ |
| Fiscal & Contábil | — | — | ✅ |
| Relatórios | ✅ | ✅ | ✅ |
| Imposto de Renda | ✅ | — | — |
| Academia | ✅ | ✅ | — |
| Importações | ✅ | ✅ | ✅ |

---

## 8. BOTTOM NAVIGATION — DECISÃO

### 8.1 SIM, o FinDomus precisa de Bottom Navigation

**Justificativa:**

1. **Frequência:** A Home é o destino mais acessado (centro de controle). Domus é o segundo (inteligência contextual). Módulos é o terceiro (descoberta). Perfil é menos frequente mas necessário para contexto e configuração.

2. **Ergonomia mobile:** Em dispositivo de 375-430px, o hamburger menu pune a descoberta e dificulta o acesso com uma mão. A Bottom Nav coloca os destinos mais importantes na zona do polegar.

3. **Memória espacial:** O usuário precisa saber onde está e como chegar a qualquer destino. A Bottom Nav fornece uma âncora espacial permanente.

4. **Escalabilidade:** Com 4 destinos fixos, a arquitetura não muda quando o produto cresce de 20 para 100 módulos. A descoberta escala na camada de Módulos (Nível 2).

5. **Identity:** Home homologada já reserva 88px para Bottom Nav placeholder.

### 8.2 Quantidade de destinos: 4

Testamos 3, 4 e 5 destinos:

| Quantidade | Itens possíveis | Avaliação |
|------------|-----------------|-----------|
| 3 | Home, Módulos, Domus | Perfil fica sem acesso rápido. Context Switcher precisaria caber em outro lugar. |
| **4** | **Home, Módulos, Domus, Perfil** | **Equilíbrio ideal. Cobre centro de controle, descoberta, inteligência e identidade.** |
| 5 | Home, Planejar, Módulos, Domus, Perfil | Planejar (ou similar) compete com Módulos. Redundante. 5 itens começam a poluir. |

**Decisão: 4 destinos.**

---

## 9. COMPARAÇÃO DE MODELOS CANDIDATOS

### MODELO A — Inteligência Central (RECOMENDADO)

```
┌──────────┬──────────┬──────────┬──────────┐
│   ⌂      │   ⊞      │   ◈      │   ◉      │
│  Home    │ Módulos  │  Domus   │  Perfil  │
└──────────┴──────────┴──────────┴──────────┘
```

**Descrição:** Home como centro de controle. Módulos como descoberta organizada. Domus como interface de inteligência ubíqua. Perfil como identidade, contexto e configurações.

**Pontuação:**

| Critério | Nota | Justificativa |
|----------|:----:|---------------|
| Simplicidade | 5 | 4 destinos, sem ambiguidade |
| Frequência | 5 | Home e Domus são os mais acessados |
| Descoberta | 5 | Módulos é o portal para todas as capacidades |
| Escalabilidade | 5 | 100 módulos — Bottom Nav não muda |
| Domus | 5 | Destino de primeira classe |
| PF/PJ/Família | 4 | Context Switcher no Perfil |
| Ergonomia | 5 | 4 itens cabem em qualquer viewport |
| Memória espacial | 5 | Posições fixas, nunca mudam |
| 100 módulos | 5 | Aprovado |
| Novo usuário | 5 | Home guia, Módulos revela, Domus orienta |
| Power User | 4 | Precisa de atalhos adicionais (busca/favoritos) |
| **TOTAL** | **53/55** | |

---

### MODELO B — Jornada Financeira

```
┌──────────┬──────────┬──────────┬──────────┐
│   ⌂      │   🎯     │   ◈      │   ◉      │
│  Home    │ Planejar │  Domus   │  Perfil  │
└──────────┴──────────┴──────────┴──────────┘
```

**Descrição:** Substitui Módulos por Planejar como jornada principal. Demais módulos acessíveis via Perfil ou submenu.

**Pontuação:**

| Critério | Nota | Justificativa |
|----------|:----:|---------------|
| Simplicidade | 5 | 4 destinos |
| Frequência | 3 | Planejar é usado, mas não mais que Módulos |
| Descoberta | 2 | Módulos não-Planejamento ficam escondidos |
| Escalabilidade | 3 | Não escala para módulos fora da jornada de planejamento |
| Domus | 5 | Mantém destaque |
| PF/PJ/Família | 4 | Igual ao Modelo A |
| Ergonomia | 5 | 4 itens |
| Memória espacial | 5 | Posições fixas |
| 100 módulos | 2 | Onde colocar os outros 99 módulos? |
| Novo usuário | 3 | Só descobre Planejamento, perde outros módulos |
| Power User | 3 | Precisa de caminho extra para módulos específicos |
| **TOTAL** | **40/55** | |

**Problema:** "Planejar" não é um destino universal. Um empresário em contexto PJ não quer "Planejar" — quer ver Empresas, DRE, Fiscal. O Modelo B confunde jornada de um perfil específico com navegação global.

---

### MODELO C — Minimalista

```
┌─────────────────┬─────────────────┬─────────────────┐
│       ⌂         │       ⊞         │       ◈         │
│      Home       │    Módulos      │     Domus       │
└─────────────────┴─────────────────┴─────────────────┘
```

**Descrição:** Apenas 3 destinos. Perfil/Configurações acessível via topo ou gesto.

**Pontuação:**

| Critério | Nota | Justificativa |
|----------|:----:|---------------|
| Simplicidade | 5 | Minimalista |
| Frequência | 5 | Home, Módulos, Domus cobrem os principais |
| Descoberta | 5 | Módulos presente |
| Escalabilidade | 5 | Escala bem |
| Domus | 5 | Destacada |
| PF/PJ/Família | **2** | Onde fica o Context Switcher? Sem lugar óbvio. |
| Ergonomia | 5 | 3 itens é o mais confortável |
| Memória espacial | 5 | Fixas |
| 100 módulos | 5 | Aprovado |
| Novo usuário | 4 | Perde visibilidade de Perfil/Config |
| Power User | 3 | Sem acesso rápido a perfil/contexto |
| **TOTAL** | **49/55** | |

**Problema:** O Context Switcher (PF/Família/PJ) precisa de um lugar. Sem o destino Perfil, ele teria que ocupar espaço na Home permanentemente (já está na Context Bar) ou ficar escondido. Modelo C é elegante mas sacrifica funcionalidade crítica.

---

### Comparativo final

| Critério | Modelo A | Modelo B | Modelo C |
|----------|:--------:|:--------:|:--------:|
| Simplicidade | 5 | 5 | 5 |
| Frequência | 5 | 3 | 5 |
| Descoberta | 5 | 2 | 5 |
| Escalabilidade | 5 | 3 | 5 |
| Domus | 5 | 5 | 5 |
| PF/PJ/Família | 4 | 4 | 2 |
| Ergonomia | 5 | 5 | 5 |
| Memória espacial | 5 | 5 | 5 |
| 100 módulos | 5 | 2 | 5 |
| Novo usuário | 5 | 3 | 4 |
| Power User | 4 | 3 | 3 |
| **TOTAL** | **53** | **40** | **49** |

**MODELO A VENCE.** Home + Módulos + Domus + Perfil.

---

## 10. MODELO RECOMENDADO — DETALHAMENTO

### 10.1 Bottom Navigation

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│   │    ⌂     │   │    ⊞     │   │    ◈     │   │    ◉     │ │
│   │  Início  │   │ Módulos  │   │  Domus   │   │  Perfil  │ │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Labels:** Curtas (máx 7 caracteres). Em português. Semântica clara.

| Posição | Ícone (Lucide) | Label | Função |
|---------|---------------|-------|--------|
| 1 | `House` (Home) | Início | Centro de controle. Home homologada. |
| 2 | `LayoutGrid` (Grid4x4) | Módulos | Descoberta de todas as capacidades. |
| 3 | `Sparkles` (ou `BrainCircuit`) | Domus | Interface de inteligência financeira. |
| 4 | `CircleUserRound` (UserCircle) | Perfil | Contexto, identidade, configurações. |

**Active state:** Apenas o item ativo usa azul FinDomus (`#00B4D8`). Demais itens usam `text-tertiary`. Sem preenchimento colorido nos itens inativos. Respeita FDL: azul é minoritário e direcional.

**Altura:** ~80px (incluindo safe area). Área de toque mínima: 44px.

### 10.2 Home (`/`)

- Mantém a Home homologada (ARCHITECTURE + WIREFRAME + MASTER VISUAL v1)
- Context Bar no topo com Context Switcher + Privacy Toggle
- Freedom Index, Domus Insight, Priority Action, Módulos Relevantes, Continuidade
- Ao tocar em "Início" na Bottom Nav quando já está na Home: scroll ao topo

### 10.3 Módulos (`/modulos`)

Nova rota. Substitui o drawer/hamburger como mecanismo de descoberta.

**Estrutura:**

```
┌──────────────────────────────────────┐
│ [🔍 Buscar módulos, contas, metas...]│  ← Busca universal
├──────────────────────────────────────┤
│                                      │
│ ⭐ Favoritos                          │
│ ┌──────────────────────────────────┐ │
│ │ 📊 Investimentos          R$42k  │ │
│ │ 🎯 Planejamento        3 metas   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ MEU DINHEIRO                         │
│ ┌──────────────────────────────────┐ │
│ │ 💳 Contas               R$12k   │ │
│ │ 👤 Pessoal           +R$3.240  │ │
│ │ 📋 Lançamentos        42 trans  │ │
│ │ 💳 Cartões           2 ativos   │ │
│ │ 📦 Parcelas          5 abertas  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ PLANEJAR                             │
│ ┌──────────────────────────────────┐ │
│ │ 🎯 Planejamento        3 metas   │ │
│ │ 📈 Investimentos       R$42k    │ │
│ │ 🧮 Calculadoras        5 calc    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ COMPROMISSOS                         │
│ ┌──────────────────────────────────┐ │
│ │ 🛡️ Passivos          R$8.400   │ │
│ │ 🔁 Assinaturas       R$320/mês  │ │
│ │ 📄 Imposto de Renda  2025       │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [se contexto PJ]                     │
│ EMPRESA                              │
│ ┌──────────────────────────────────┐ │
│ │ 🏢 Empresas          2 ativas    │ │
│ │ 📊 Fluxo Financeiro  +R$18k     │ │
│ │ 📋 Fiscal & Contábil  2 obrig.  │ │
│ │ 📈 Relatórios PJ       3 rel.    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ CONHECIMENTO                         │
│ ┌──────────────────────────────────┐ │
│ │ 📚 Academia         Aula 4 de 8  │ │
│ │ 🔮 Simulações       2 cenários   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ⚙️ Configurações >                   │
│ 💎 Planos >                          │
│                                      │
└──────────────────────────────────────┘
```

**Regras:**

- **Favoritos (⭐):** Até 4 módulos fixados pelo usuário. Aparecem no topo. Ordem definida pelo usuário (drag ou long-press).
- **Categorias semânticas:** Agrupam módulos por função, não por implementação. Linguagem humana.
- **Categorias contextuais:** A categoria "Empresa" só aparece em contexto PJ.
- **Cada item:** Ícone + nome + métrica resumida (Summary Card compacto). Tocável — navega para o módulo.
- **Scroll:** Vertical. Categorias colapsáveis? Não. Manter tudo visível. A categorização já é a estrutura de baixa densidade.
- **Home × Módulos:** A Home mostra 3-5 módulos relevantes contextualmente. A tela Módulos mostra TODOS os módulos disponíveis, organizados. Não há redundância — a Home é curadoria; Módulos é catálogo.

### 10.4 Domus (`/domus`)

**Decisão estratégica: SIM, Domus na Bottom Nav.**

A Domus é o diferencial central do produto. Atualmente está escondida no rodapé da sidebar. Na arquitetura mobile, ela precisa ser ubíqua.

**O que a Domus não é:**
- Não é apenas um chat
- Não transforma o FinDomus em app de conversação
- Não compete com o insight contextual da Home (a Home já tem seu próprio espaço Domus)

**O que a Domus é na navegação:**
- Interface de inteligência financeira
- Pode ser invocada de qualquer lugar com 1 toque
- Mantém contexto da tela atual
- Responde perguntas, analisa dados, recomenda ações, executa fluxos permitidos
- Acesso rápido sem precisar voltar para Home

**Layout conceitual (NÃO desenhar agora):**
```
┌──────────────────────────────────────┐
│ ← Domus                              │
├──────────────────────────────────────┤
│                                      │
│ [Contexto: Investimentos]            │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Domus                             │ │
│ │ Sua carteira está concentrada     │ │
│ │ em renda fixa (72%). Isso é       │ │
│ │ conservador para seu perfil.      │ │
│ │                                  │ │
│ │ [Sugerir diversificação]          │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Você                               │ │
│ │ Qual o rendimento da minha        │ │
│ │ carteira nos últimos 12 meses?    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Domus                             │ │
│ │ Sua carteira rendeu 11,4% nos     │ │
│ │ últimos 12 meses. Acima do CDI    │ │
│ │ (10,1%) e do IPCA (4,8%).         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [⌨️ Perguntar à Domus...            ] │
│                                      │
└──────────────────────────────────────┘
```

**Princípios:**
- Domus mantém contexto da tela de origem (se veio de Investimentos, sabe disso)
- Não substitui a navegação — complementa
- Pode sugerir navegação ("Ver investimentos")
- Deep link para destinos específicos
- Sem avatar humanoide, sem "pensando...", sem glow

**Risco mitigado:** A Domus na Bottom Nav não transforma o app em chat porque:
1. A Home já tem Domus Insight (contextual, passiva)
2. O usuário escolhe ativamente abrir a Domus
3. A Domus como destino não compete com a Home — são funções diferentes
4. O ícone não será sparkles genérico — será um ícone distintivo da identidade FinDomus

### 10.5 Perfil (`/perfil`)

**Funções:**
- Context Switcher (PF / Família / Empresa A / Empresa B)
- Dados do usuário (nome, email, foto)
- Plano atual e uso
- Configurações rápidas (privacidade, tema)
- Acesso a Configurações completas
- Logout

A tela de Perfil também pode ser acessada via:
- Avatar no canto superior (Context Bar)
- Sheet ao tocar no avatar

---

## 11. PAPEL DA HOME

A Home permanece como definida na arquitetura homologada:

- **Centro de controle:** O usuário sempre pode voltar para Home
- **Não é um índice de módulos:** A Home não lista todos os módulos — apenas 3-5 relevantes
- **Acesso rápido:** A Home é o primeiro destino da Bottom Nav
- **Contexto ativo:** A Home sempre opera no contexto selecionado (PF, Família, PJ)
- **Domus Insight:** O insight contextual da Home é independente da Domus como destino global

---

## 12. PAPEL DA DOMUS

| Contexto | Comportamento |
|----------|---------------|
| **Home (Insight)** | 0-1 insight passivo. Observa, não conversa. Posição fixa. |
| **Bottom Nav (Destino)** | Interface de inteligência ativa. Conversa, analisa, recomenda. Contexto preservado da tela de origem. |
| **Dentro de módulos** | Pode ser invocada contextualmente (ex: "Explicar este gráfico") |

A Domus não compete consigo mesma. O insight na Home é passivo e efêmero. O destino na Bottom Nav é ativo e sob demanda.

---

## 13. DESCOBERTA DE MÓDULOS

### 13.1 Três caminhos para descoberta

| Caminho | Mecanismo | Quando usar |
|---------|-----------|-------------|
| **Home contextual** | Summary Cards relevantes (3-5) | "O que é relevante agora?" |
| **Tela Módulos** | Catálogo completo com categorias | "Quero encontrar algo específico" |
| **Busca** | Campo de busca na tela Módulos | "Sei o nome mas não sei onde está" |

### 13.2 Busca

A busca na tela Módulos encontra:
- Módulos (por nome)
- Contas (por nome)
- Metas (por nome)
- Empresas (por nome)
- Aulas da Academia (por título)
- Ações rápidas ("importar", "simular", "calcular")

**Não é uma busca universal completa nesta fase.** A implementação completa da busca (índice, resultados, navegação por teclado, comandos) será projetada em etapa futura. Aqui apenas definimos seu papel arquitetural.

### 13.3 Quantidade máxima por categoria

| Categoria | Máximo de itens |
|-----------|:---------------:|
| Favoritos | 4 |
| Meu Dinheiro | 5 |
| Planejar | 3 |
| Compromissos | 3 |
| Empresa | 4 |
| Conhecimento | 2 |

**Total máximo visível:** ~17 itens + busca. Escala para 100 módulos porque as categorias absorvem novos módulos sem aumentar a densidade visual.

---

## 14. FAB — DECISÃO

### NÃO usar FAB no FinDomus.

**Justificativa:**

1. **Frequência:** Nenhuma ação é tão frequente e universal que justifique um botão flutuante permanente.
2. **FDL Calm:** FAB compete visualmente com a densidade Calm. É um elemento agressivo.
3. **Bottom Nav:** Já temos 4 destinos de acesso rápido. Um FAB sobreposto criaria conflito visual e tátil.
4. **Academia:** Já decidido: sem FAB para Academia.
5. **Domus:** Já está na Bottom Nav. Não precisa de FAB.

Ações como "Nova transação" ou "Importar" pertencem ao contexto do módulo (Pessoal, Importações), não à navegação global.

---

## 15. CONTEXT SWITCHER

### 15.1 Decisão: CONTEXTO GLOBAL

O contexto selecionado (Pessoal, Família, Empresa X) é **global para todo o aplicativo**.

Ao trocar de "Pessoal" para "Empresa A":
- A Home recarrega com dados da Empresa A
- A tela Módulos mostra apenas módulos disponíveis para PJ
- Domus opera no contexto Empresa A
- Todos os dados exibidos pertencem à Empresa A
- Nenhum dado PF é visível enquanto estiver em contexto PJ

### 15.2 Onde fica o Context Switcher?

**Dois pontos de acesso:**

1. **Context Bar (Home):** Já homologado. Visível no topo da Home.
2. **Perfil:** Dentro da tela de Perfil, como controle principal de contexto. Também acessível via Sheet ao tocar no avatar no topo.

**Fluxo de troca:**

```
Home → Perfil (Bottom Nav) → Trocar contexto → Home recarregada
                                 ou
Qualquer tela → Sheet (toque no avatar) → Trocar contexto → Tela recarregada
```

### 15.3 Persistência

O contexto selecionado persiste entre sessões (localStorage + Firestore). Ao reabrir o app, o último contexto é restaurado.

### 15.4 Múltiplas empresas

Com 5 empresas:
```
Pessoal
Família
TreeTech Automation
EcoSoluções Ltda
InovaSoft
Mercado Digital
```

O Context Switcher usa lista vertical (não dropdown horizontal). Cada item mostra: nome + indicador de contexto (PF = pessoa, Família = grupo, PJ = prédio). Compacto. Rola se necessário.

### 15.5 Proteção contra mistura de dados

**Regra crítica:** Nunca navegar silenciosamente para outro contexto.

- Deep link que pertence a outro contexto → a interface avisa e pergunta se deseja trocar
- Ao trocar contexto, a tela atual é substituída (não empilhada)
- Dados PF nunca aparecem em contexto PJ e vice-versa

---

## 16. NAVEGAÇÃO INTERNA DOS MÓDULOS

### 16.1 Padrão universal

Cada módulo segue um padrão de navegação interna consistente:

```
┌──────────────────────────────────────┐
│ ← Voltar    Investimentos    [🔍?]   │  ← Header do módulo
├──────────────────────────────────────┤
│ [Overview] [Carteira] [Análise] [+] │  ← Tabs do módulo
├──────────────────────────────────────┤
│                                      │
│ Conteúdo da tab selecionada          │
│                                      │
└──────────────────────────────────────┘
```

### 16.2 Header do módulo

- **Voltar:** Comportamento previsível. Volta para a tela anterior (Home, Módulos, ou deep link).
- **Título:** Nome do módulo.
- **Ação contextual:** Ícone de busca, filtro, ou Domus contextual (opcional).

### 16.3 Tabs

Cada módulo define suas próprias tabs. Exemplo para Investimentos:
- Overview (resumo)
- Carteira (ativos)
- Análise (performance)
- Aportes (transações)
- + (mais opções: calculadoras, yields, etc.)

**Máximo de tabs visíveis:** 4. A 5ª+ vai em "Mais" (dropdown ou sheet).

### 16.4 Profundidade

| Nível | Exemplo |
|-------|---------|
| Home → | Nível 1 |
| Módulo → | Nível 2 |
| Detalhe → | Nível 3 |
| Calculadora → | Nível 4 (especialista) |

**Orçamento de profundidade:**
- Normal: ≤ 3 níveis (Home → Módulo → Detalhe)
- Especialista: ≤ 4 níveis (Home → Módulo → Detalhe → Calculadora)
- Máximo absoluto: 5 níveis (com justificativa)

---

## 17. BACK BEHAVIOR

### 17.1 Princípios

1. **Voltar dentro do módulo:** Navega para a tab/página anterior dentro do mesmo módulo.
2. **Voltar para origem:** Se o módulo foi acessado via Home (Summary Card), voltar retorna à Home. Se via Módulos, retorna à tela Módulos. Se via deep link, retorna à tela anterior.
3. **Fechar modal/sheet:** Gesto de deslizar para baixo ou botão fechar. Sempre consistente.
4. **Retornar à Home:** Toque em "Início" na Bottom Nav. Sempre disponível.
5. **Preservar scroll:** Ao voltar para Home ou Módulos, a posição de scroll é preservada.
6. **Preservar contexto:** O contexto ativo nunca muda durante navegação interna.

### 17.2 Implementação conceitual

- Next.js App Router com `router.back()` para navegação interna
- Bottom Nav itens usam `router.push()` (navegação explícita, sem empilhar)
- Sheets usam estado local + Radix Dialog/Sheet

---

## 18. DEEP LINKS

### 18.1 Arquitetura

A arquitetura suporta deep links para:

| Origem | Destino | Exemplo |
|--------|---------|---------|
| Notificação | Tela específica | "Sua meta 'Reserva' atingiu 80%" → `/planejamento?meta=reserva` |
| Domus | Ação ou tela | "Ver investimentos" → `/investimentos` |
| Home (Priority) | Ação | "Fazer aporte" → `/planejamento?acao=aporte` |
| Home (Summary Card) | Módulo | Toque em Investimentos → `/investimentos` |

### 18.2 Regras

- Deep links preservam o contexto ativo (não trocam para outro contexto)
- Se o destino pertence a outro contexto, a UI pergunta antes de trocar
- Deep links de notificações podem incluir parâmetros de query para posicionamento (tab, filtro, item)

---

## 19. NOTIFICAÇÕES

Não projetadas nesta fase. Mas a arquitetura prevê:

- Badge na Bottom Nav (Perfil) para notificações não lidas
- Deep link da notificação para o destino relevante
- Central de notificações acessível via Perfil (futuro)

---

## 20. PERSISTÊNCIA DE ESTADO

| Estado | Persiste? | Onde? |
|--------|:---------:|-------|
| Contexto selecionado | ✅ Sim | localStorage + Firestore |
| Último módulo visitado | ❌ Não | Navegação explícita, sem "último estado" |
| Scroll da Home | ❌ Não | Sempre recarregar no topo |
| Scroll da tela Módulos | ✅ Sim | localStorage (sessão) |
| Tab ativa dentro do módulo | ❌ Não | Sempre abrir na tab Overview |
| Filtros aplicados | ❌ Não | Reset ao sair do módulo |
| Favoritos (Módulos) | ✅ Sim | Firestore (user profile) |
| Privacidade (mostrar/ocultar) | ✅ Sim | localStorage (sessão) |

**Princípio:** Estado que representa preferência do usuário persiste. Estado que representa navegação efêmera não persiste.

---

## 21. PERSONALIZAÇÃO

### 21.1 Favoritos na tela Módulos

O usuário pode fixar até 4 módulos como favoritos. Eles aparecem no topo da tela Módulos, acima das categorias.

**Não confundir com:**
- Fixados da Home (2 módulos) — são os que aparecem como Summary Cards na Home
- Favoritos da tela Módulos (4 módulos) — são atalhos no catálogo completo

Isso não é redundância. A Home é curadoria contextual (2 fixos + 3 recomendados). A tela Módulos é catálogo (4 favoritos + categorias completas). Funções diferentes, superfícies diferentes.

### 21.2 Ordenação

- Favoritos são ordenáveis via long-press + drag (mobile) ou drag handle
- Categorias têm ordem fixa (não personalizável)
- Dentro de cada categoria, a ordem é fixa (alfabética ou por importância)

---

## 22. MATRIZ DE DESTINOS

| Destino | Frequência | Importância | Global? | Contextual? | Bottom Nav? | Descoberta? |
|---------|:----------:|:-----------:|:-------:|:-----------:|:-----------:|:-----------:|
| Home | Alta (diária) | Máxima | ✅ Sim | — | ✅ Pos 1 | — |
| Módulos | Média (semanal) | Alta | ✅ Sim | — | ✅ Pos 2 | ✅ Catálogo |
| Domus | Alta (diária) | Máxima | ✅ Sim | — | ✅ Pos 3 | — |
| Perfil | Baixa (mensal) | Alta | ✅ Sim | — | ✅ Pos 4 | — |
| Planejamento | Média | Alta | — | PF, Família | — | ✅ Categoria |
| Pessoal | Alta | Alta | — | PF | — | ✅ Categoria |
| Contas | Média | Alta | — | Global | — | ✅ Categoria |
| Investimentos | Média | Alta | — | Global | — | ✅ Categoria |
| Passivos | Média | Alta | — | Global | — | ✅ Categoria |
| Empresas | Média (se PJ) | Alta (se PJ) | — | PJ | — | ✅ Categoria |
| Fiscal & Contábil | Média (se PJ) | Média | — | PJ | — | ✅ Categoria |
| Assinaturas | Baixa | Média | — | Global | — | ✅ Categoria |
| Relatórios | Baixa | Média | — | Global | — | ✅ Categoria |
| Imposto de Renda | Baixa (anual) | Baixa | — | PF | — | ✅ Categoria |
| Academia | Variável | Média | — | PF | — | ✅ Categoria |
| Configurações | Baixa | Média | ✅ Sim | — | — | ✅ Perfil |

---

## 23. MATRIZ DE AÇÕES

| Ação | Frequência | Contexto | Atalho necessário? |
|------|:----------:|----------|:------------------:|
| Falar com Domus | Alta | Global | ✅ Bottom Nav (1 toque) |
| Nova transação | Alta | Pessoal | No módulo Pessoal (1 toque) |
| Importar extrato | Média | Global | Na tela Módulos > Meu Dinheiro |
| Criar meta | Média | Planejamento | No módulo Planejamento |
| Nova conta | Baixa | Contas | No módulo Contas |
| Novo investimento | Média | Investimentos | No módulo Investimentos |
| Conectar banco (Pluggy) | Baixa | Contas | No módulo Contas |
| Simular cenário | Média | Planejamento | No módulo Planejamento |
| Ver planos | Baixa | Global | No Perfil |

---

## 24. MATRIZ DE PROFUNDIDADE

| Módulo | Nível 1 (Entry) | Nível 2 | Nível 3 (Detalhe) | Nível 4 (Especialista) |
|--------|-----------------|---------|-------------------|----------------------|
| **Planejamento** | Overview (metas ativas) | Meta específica | Editar meta | Simular cenário |
| **Investimentos** | Overview (carteira) | Ativo específico | Histórico do ativo | Calculadoras (5) |
| **Pessoal** | Dashboard mensal | Transação | Editar transação | — |
| **Contas** | Lista de contas | Conta específica | Histórico | Conectar banco |
| **Passivos** | Lista de dívidas | Dívida específica | Projeção | Amortização |
| **Empresas** | Lista de empresas | Empresa específica | DRE | Relatórios |
| **Academia** | Trilhas disponíveis | Aula específica | Conteúdo | — |
| **Importações** | Central de importação | Preview | Revisar item | — |

---

## 25. NAVIGATION COMPLEXITY BUDGET

| Limite | Valor | Justificativa |
|--------|:-----:|---------------|
| Bottom Nav destinos | **4** | Home + Módulos + Domus + Perfil. Cobertura completa. |
| Categorias na tela Módulos | **≤7** | Favoritos + 5 categorias semânticas + Configurações |
| Itens por categoria | **≤5** | Mantém densidade baixa. Scroll vertical se necessário. |
| Tabs por módulo | **≤4 visíveis** | +1 em "Mais" se necessário |
| Profundidade normal | **3 níveis** | Home → Módulo → Detalhe |
| Profundidade especialista | **4 níveis** | + Calculadora / Simulação |
| Profundidade máxima absoluta | **5 níveis** | Com justificativa explícita |
| Badges na Bottom Nav | **≤2** | Notificações e pendências. Sem árvore de Natal. |
| CTA dominante por tela | **1** | Regra FDL existente |

---

## 26. NAVIGATION CONTRACT v1

### SEMPRE VISÍVEL
- Bottom Navigation (4 destinos)
- Context Switcher (na Home via Context Bar; no Perfil; Sheet via avatar)

### GLOBAL (disponível em qualquer contexto)
- Home
- Módulos
- Domus
- Perfil
- Contas
- Investimentos
- Passivos
- Assinaturas
- Relatórios
- Importações
- Configurações
- Planos

### CONTEXTUAL (disponível apenas em contextos específicos)
- Planejamento: PF e Família
- Pessoal: PF
- Lançamentos: PF
- Parcelas: PF
- Cartões: PF e PJ
- Imposto de Renda: PF
- Empresas: PJ
- Fiscal & Contábil: PJ
- Academia: PF e Família

### DESCOBERTA
- Tela Módulos com categorias semânticas + busca + favoritos
- Home com Summary Cards contextuais (3-5)

### AÇÕES
- Domus: Bottom Nav (1 toque)
- Nova transação: dentro de Pessoal
- Importar: tela Módulos ou Home (se onboarding)
- Demais ações: dentro de seus respectivos módulos

### ESPECIALISTA
- Calculadoras: via Investimentos ou tela Módulos
- Simulações: via Planejamento
- Relatórios avançados: via Relatórios

### ADMIN
- Console: rota direta (não aparece na navegação principal)
- Feature flags: via Firestore (não exposto na UI)

### CONTEXTO
- Global. Selecionado via Context Switcher.
- Persiste entre sessões.
- Afeta: Home, Módulos, Domus, dados de todas as telas.

### BACK
- Previsível: volta para a origem (Home, Módulos, ou deep link)
- Bottom Nav: sempre disponível para escape para Home
- Scroll preservado na Home e Módulos
- Contexto nunca muda durante back

### DEEP LINK
- Suportado para: módulos, ações, itens específicos
- Parâmetros de query para posicionamento (tab, filtro, item)
- Proteção: nunca troca de contexto silenciosamente

---

## 27. FINANCIAL CONTEXT CONTRACT v1

### CONTEXTO ATUAL
- O usuário sempre opera em um contexto explícito: Pessoal, Família, ou Empresa X.
- O contexto é visível no Context Bar (Home) e na tela de Perfil.
- O contexto é global — todas as telas e dados refletem o contexto ativo.

### PERSISTÊNCIA
- O contexto selecionado persiste entre sessões (localStorage + Firestore).
- Ao reabrir o app, o último contexto é restaurado.
- Se o contexto salvo não existir mais (ex: empresa removida), fallback para Pessoal.

### TROCA
- O usuário pode trocar de contexto a qualquer momento via Perfil ou Sheet (avatar).
- Ao trocar, a tela atual é substituída pela Home do novo contexto.
- A troca é comunicada visualmente (transição sutil, indicador de contexto).

### MÚLTIPLAS EMPRESAS
- O Context Switcher lista todas as empresas do usuário.
- Cada empresa opera com dados isolados.
- Empresas podem ser adicionadas/removidas (via módulo Empresas).

### FAMÍLIA
- Família é um contexto distinto de Pessoal.
- Dados da Família são compartilhados entre membros do household.
- Membros podem ter permissões diferentes (owner, admin, member).

### DEEP LINKS
- Deep links operam no contexto ativo.
- Se um deep link referencia dados de outro contexto, a UI oferece trocar de contexto.
- Nunca trocar de contexto automaticamente.

### MÓDULOS DISPONÍVEIS
- A tela Módulos mostra apenas módulos relevantes para o contexto ativo.
- PF vê Planejamento, Pessoal, IR, Academia. Não vê Fiscal, Empresas.
- PJ vê Empresas, Fiscal, DRE. Não vê Planejamento PF, Pessoal, IR.
- Família vê Planejamento, mas não Pessoal individual.

### PROTEÇÃO CONTRA MISTURA DE DADOS
- Nenhum dado de um contexto aparece em outro.
- Nenhuma navegação silenciosa entre contextos.
- Nenhuma ação em um contexto afeta dados de outro.
- Deep links cross-context exigem confirmação explícita.

---

## 28. TESTES DE VALIDAÇÃO

### 28.1 TESTE DE 20 MÓDULOS (Estado atual)

**Módulos reais:** Planejamento, Pessoal, Contas, Investimentos, Passivos, Empresas, Fiscal/Contábil, Assinaturas, Relatórios, Importações, Imposto de Renda, Lançamentos, Parcelas, Cartões, Calculadoras (5), Academia, Simulações, Configurações, Planos.

**Resultado:** Todos cabem em 6 categorias com ≤5 itens por categoria. Bottom Nav permanece com 4 itens. ✅

### 28.2 TESTE DE 50 MÓDULOS

**Adicionar conceitualmente:** Cartões Corporativos, Fluxo de Caixa Projetado, Conciliação Bancária, Rateio de Despesas, Centro de Custos, Departamento Pessoal, Provisões, Contratos, Garantias, Seguros, Consórcios, Previdência Privada, Criptomoedas, Renda Fixa, Renda Variável, Fundos Imobiliários, Day Trade, Nota Fiscal, SPED, Pró-labore, Dividendos, Inventário, Herança, Holdings, Trusts...

**Resultado:** As categorias existentes absorvem a maioria. Novas categorias podem surgir (ex: "Patrimonial" para seguros, previdência, herança) sem mexer na Bottom Nav. ✅

### 28.3 TESTE DE 100 MÓDULOS

**Resultado:** A Bottom Nav permanece com 4 itens. As categorias podem ser expandidas (scroll vertical). A busca se torna mais importante. O modelo de categorias semânticas escala sem poluir a navegação principal. ✅

### 28.4 TESTE DE NOVO USUÁRIO

**Cenário:** Usuário acabou de criar conta. Nunca usou o app.

1. Vê a Empty Home (importar extrato) — sabe o que fazer
2. Bottom Nav mostra 4 itens — não intimida
3. Abre Módulos por curiosidade — vê categorias organizadas
4. Cada categoria tem 2-5 itens com nomes em português claro
5. Domus está visível — pode perguntar o que quiser

**Resultado:** 4 destinos + categorias semânticas + Domus como guia. O usuário não se sente perdido. ✅

### 28.5 TESTE DE POWER USER

**Cenário:** Usuário experiente quer acessar "Amortização de dívida" rapidamente.

1. Bottom Nav → Módulos → Compromissos → Passivos → Dívida específica → Amortização
2. Ou: Busca "amortização" na tela Módulos
3. Ou: Pergunta à Domus "simular amortização da dívida do carro"

**Profundidade:** 4 níveis (Módulos → Passivos → Dívida → Amortização). Aceitável para especialista.

**Otimização:** O power user pode fixar Passivos nos Favoritos (1 nível a menos). ✅

### 28.6 TESTE DE PJ

**Cenário:** Usuário trocou para "TreeTech Automation".

1. Home mostra dados da empresa
2. Módulos mostra: Empresa (categoria com Empresas, Fluxo, Fiscal, Relatórios PJ), Meu Dinheiro (Contas, Investimentos), Compromissos (Passivos, Assinaturas)
3. NÃO mostra: Planejamento PF, Pessoal, IR, Academia
4. Bottom Nav permanece igual

**Resultado:** A navegação se adapta ao contexto sem mudar de estrutura. ✅

### 28.7 TESTE DE FAMÍLIA

**Cenário:** Usuário trocou para "Família".

1. Home mostra dados consolidados da família
2. Módulos mostra: Planejar (Planejamento familiar), Meu Dinheiro (Contas, Investimentos familiares), Compromissos
3. NÃO mostra: Pessoal individual, IR individual
4. Bottom Nav permanece igual

**Resultado:** Família opera como contexto distinto sem confusão com Pessoal. ✅

### 28.8 TESTE MULTIEMPRESA

**Cenário:** Usuário tem Pessoal + 5 empresas.

1. Abre Perfil → vê lista de contextos: Pessoal, Família, Empresa A, B, C, D, E
2. Seleciona Empresa C → Home recarrega com dados da Empresa C
3. Layout, Bottom Nav, estrutura — tudo igual
4. Apenas os dados e módulos disponíveis mudam

**Resultado:** 7 contextos no switcher. Lista vertical com scroll. Nome + ícone de contexto. Simples. ✅

### 28.9 TESTE DOMUS

**Cenário:** Usuário pensa "Onde está meu maior gasto deste mês?"

**Caminho 1:** Bottom Nav → Domus → Perguntar → Resposta imediata (1 toque até a Domus + digitação)
**Caminho 2:** Home → Domus Insight pode já ter isso (0 toques se visível)
**Caminho 3:** Módulos → Meu Dinheiro → Pessoal → Dashboard (3 toques)

**Resultado:** Domus na Bottom Nav reduz o caminho para 1 toque. ✅

### 28.10 TESTE IMPORTAÇÃO

**Cenário:** Usuário quer importar extrato.

1. **Novo usuário:** Home → "Importar extrato" (Empty Home CTA)
2. **Usuário existente:** Módulos → Meu Dinheiro → Importações (2 toques)
3. **Power user:** Fixar Importações nos favoritos (1 toque)

**Resultado:** 1-2 toques dependendo do perfil. ✅

### 28.11 TESTE DESCOBERTA

**Cenário:** Usuário ouviu falar de "Academia Financeira" mas nunca abriu.

1. Bottom Nav → Módulos → Categoria "Conhecimento" → "Academia" (2 toques)
2. Ou: Busca "academia" (1 toque + digitação)
3. Ou: Home pode recomendar Academia se relevante (0 toques)

**Resultado:** A Academia é descobrível sem poluir a navegação principal. ✅

### 28.12 TESTE DE RETORNO

**Cenário:** Usuário está em Investimentos → Calculadoras → Juros Compostos.

1. Botão Voltar → Calculadoras → Voltar → Investimentos → Voltar → Home/Módulos
2. Bottom Nav "Início" → Home (escape rápido, 1 toque)

**Resultado:** Comportamento previsível. Escape sempre disponível via Bottom Nav. ✅

### 28.13 TESTE DE DEEP LINK

**Cenário:** Domus recomenda "Revisar assinatura do Spotify".

1. Toque no link → abre `/assinaturas?item=spotify`
2. Se contexto é PJ e assinatura é PF → UI avisa: "Esta assinatura está no contexto Pessoal. Deseja trocar?"
3. Se contexto é PF → abre direto

**Resultado:** Deep link funcionam com proteção de contexto. ✅

### 28.14 TESTE DE INTERRUPÇÃO

**Cenário:** Usuário em Investimentos → abre Domus → volta.

1. Domus abre (Bottom Nav) — contexto "Investimentos" preservado
2. Usuário pergunta algo → Domus responde
3. Usuário volta para Módulos ou Home → Investimentos perde estado (não persiste tab)
4. Usuário volta para Investimentos → abre na tab Overview (padrão)

**Resultado:** A interrupção é limpa. Domus não bloqueia. Bottom Nav sempre disponível. ✅

---

## 29. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**NAV-P0: 0 · NAV-P1: 0 · NAV-P2: 0 · NAV-P3: 0**

---

## 30. ARCHITECTURE / FDL CHANGE REQUESTS

Nenhum change request necessário.

- A Home Architecture v1 permanece inalterada (Context Bar, FI, Domus Insight, Priority, Módulos, Continuidade)
- O FDL 1.0 permanece congelado
- O Wireframe v1 permanece homologado
- O Master Visual v1 permanece homologado

A navegação complementa as camadas existentes sem alterá-las.

---

## 31. DECISÕES ABERTAS

| # | Questão | Impacto | Recomendação |
|---|---------|---------|-------------|
| 1 | Ícone da Domus: Sparkles, BrainCircuit, ou outro? | Médio | Homologar na fase visual da Domus, não agora |
| 2 | Busca universal: escopo completo (transações, metas, etc.) ou apenas módulos? | Médio | Começar com busca de módulos. Expandir na fase de implementação |
| 3 | A tela Módulos substitui completamente a sidebar desktop ou ambas coexistem? | Alto | Mobile usa Módulos. Desktop mantém sidebar como acesso rápido, mas também tem a tela Módulos. Coexistência. |
| 4 | Tab "Overview" padrão em todos os módulos ou cada módulo define sua tab inicial? | Baixo | Padrão: Overview. Módulo pode customizar. |
| 5 | A Domus como destino deve abrir com contexto da tela anterior ou sempre "em branco"? | Médio | Abre com contexto da tela de origem. Se veio da Home, contexto genérico. |

---

## 32. RECOMENDAÇÃO FINAL

A arquitetura proposta atende a todos os requisitos:

- ✅ 4 destinos na Bottom Nav (Home, Módulos, Domus, Perfil)
- ✅ Escala para 100+ módulos sem alterar a navegação principal
- ✅ Domus como destino de primeira classe
- ✅ Descoberta por categorias semânticas + busca + favoritos
- ✅ Context Switcher global (PF, Família, PJ, multiempresa)
- ✅ Proteção contra mistura de dados entre contextos
- ✅ Padrão universal de navegação interna (tabs + detalhe progressivo)
- ✅ Back behavior previsível com escape via Bottom Nav
- ✅ Deep link com proteção de contexto
- ✅ Passa em todos os testes (20/50/100 módulos, PF/PJ/Família, multiempresa, novo usuário, power user)
- ✅ Não altera FDL, Home Architecture, Wireframe ou Master Visual homologados
- ✅ Respeita densidade Calm, identidade FinDomus e princípios FDL

---

## 33. PRÓXIMA ETAPA

Com NAV-P0 = 0 e NAV-P1 = 0, a arquitetura de navegação está pronta para homologação.

**Próximo passo:** Wireframe de navegação (Bottom Nav + tela Módulos) — NÃO implementar código ainda.

---

## 34. ARQUIVOS GERADOS

| Arquivo | Conteúdo |
|---------|----------|
| `docs/navigation/NAVIGATION-ARCHITECTURE-v1.md` | Este documento |
| `docs/navigation/` (diretório novo) | Pasta de navegação mobile |

---

*FinDomus Mobile Navigation Architecture v1 · Fase 4 concluída · Aguardando homologação*
