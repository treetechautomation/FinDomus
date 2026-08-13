# FINDOMUS MOBILE PWA — IMPLEMENTATION AUDIT v1

**Fase:** P1 — Auditoria Pré-Implementação
**Data:** Julho 2026
**Status:** AUDITADO

---

# 1. INVENTÁRIO DO PROJETO

## 1.1 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|:------:|
| Framework | Next.js (App Router) | 15.5 |
| Linguagem | TypeScript | 5.x |
| UI Kit | shadcn/ui + Radix Primitives | latest |
| Estilização | Tailwind CSS | 3.4 |
| Ícones | Lucide React | 0.475 |
| Gráficos | Recharts | 2.15 |
| Banco | Firebase Firestore | 11.10 |
| Auth | Firebase Auth | 11.10 |
| Admin | Firebase Admin | 13.9 |
| IA | Genkit (Gemini via Google AI) | 1.28 |
| Utilitários | date-fns, clsx, tailwind-merge, class-variance-authority | — |

## 1.2 Rotas de Página (25)

| Rota | Página | Linhas | Domínio Mobile |
|------|--------|:------:|:-------------:|
| `/` | Home (Dashboard Desktop) | 585 | ➡️ Refatorar para Home Mobile |
| `/planejamento` | Planejamento | 528 | ➡️ Refatorar |
| `/contas` | Contas | 390 | ➡️ Refatorar (pattern já definido) |
| `/console` | Console Admin | 328 | ❌ Desktop only |
| `/relatorios` | Relatórios | 256 | ❌ Desktop only |
| `/passivos` | Passivos | 204 | ➡️ Refatorar |
| `/imposto-de-renda` | IR | 137 | ➡️ Futuro |
| `/investimentos` | Investimentos | 93 | ➡️ Refatorar |
| `/importacoes` | Importações | 19 | ➡️ Refatorar |
| `/pessoal` | Pessoal (legacy) | 16 | ❌ Redireciona? |
| `/empresas` | Empresas | 16 | ➡️ Manter |
| `/configuracoes` | Configurações | 8 | ➡️ Refatorar |
| `/assinaturas` | Assinaturas | 19 | ➡️ Refatorar |
| `/lancamentos` | Lançamentos | 5 | ➡️ Fluxo de Caixa |
| `/parcelas` | Parcelas | 5 | ➡️ Futuro |
| `/fiscal-contabil` | Fiscal | 5 | ❌ Desktop only |
| `/cartoes` | Cartões (redirect) | 5 | ❌ Redireciona |
| `/importar` | Importar | 5 | ❌ Redireciona |
| `/investimentos/calculadoras/*` | 5 calculadoras | — | ➡️ Refatorar |
| `/login` | Login | — | ➡️ Manter |
| `/planos` | Planos | — | ➡️ Manter |
| `/termos` | Termos | — | ➡️ Manter |
| `/convite/[token]` | Convite | — | ➡️ Manter |

## 1.3 API Routes (55+)

Organizadas em: `ai`, `brazil`, `categories`, `chat`, `company`, `export`, `import`, `investments`, `kernel`, `market`, `onboarding`, `pluggy`, `public`, `stripe`, `user`, `whatsapp`, `address`.

**Impacto Mobile:** Todas as APIs são reutilizáveis. Nenhuma mudança necessária. O Mobile consumirá as mesmas APIs.

## 1.4 Componentes de Negócio (82)

| Domínio | Componentes | Reutilizável? |
|---------|------------|:------------:|
| **academy** (10) | achievement-toast, avatar, confetti, feature-gate, launcher, overlay, panel, provider, renderer, timeline | ⚠️ Refatorar para mobile |
| **ai** (2) | chat-widget, usage-panel | ⚠️ Refatorar (Bottom Sheet) |
| **auth** (1) | protected-route | ✅ Reutilizar |
| **billing** (3) | plan-badge, trial-banner, upgrade-modal | ✅ Reutilizar |
| **categorias** (1) | categories-manager | ⚠️ Refatorar |
| **configuracoes** (1) | configuracoes-client | ⚠️ Refatorar |
| **contas** (2) | edit-account-dialog, new-account-dialog | ➡️ Converter Dialog→Sheet |
| **dashboard** (6) | freedom-index-explainer, freedom-timeline, insight-carousel, next-actions-list, next-best-action, recent-transactions | ⚠️ Refatorar |
| **empresas** (2) | company-filter, new-company-dialog | ⚠️ Refatorar |
| **fiscal** (2) | add-tax-obligation, tax-obligations-list | ❌ Desktop |
| **import** (4) | import-center, importer, b3-importer/preview, corretoras-importer/preview, review-table | ⚠️ Refatorar |
| **investimentos** (12) | wallet, ticker, new-investment, new-yield, 9 tabs | ⚠️ Refatorar (accordion) |
| **onboarding** (6) | CoachMark, FinancialSection, TourControls, TourOverlay, TourProgress, TourRenderer, VisibilityToggle | ⚠️ Refatorar |
| **overview** (4) | cashflow-chart, scenario-switcher, consolidated-balance, monthly-flow, networth-evolution-chart | ⚠️ Refatorar |
| **passivos** (1) | new-liability-dialog | ➡️ Converter Dialog→Sheet |
| **pessoal** (7) | category-spending-chart, edit-budget, edit-transaction, transaction-form, month-filter, new-transaction, revenue-chart-panel, personal-transactions-table | ⚠️ Refatorar |
| **planejamento** (2) | planning-goals-manager, planning-overview-cards | ⚠️ Refatorar |
| **simulations** (1) | scenario-comparator | ⚠️ Refatorar |
| **app-header** (1) | Desktop header | ❌ Descartar para mobile |
| **sidebar-nav** (1) | Desktop sidebar | ❌ Descartar para mobile |
| **scheduler-init** (1) | — | ✅ Reutilizar |

## 1.5 UI Kit (shadcn) — 35 componentes

| Componente | Mobile PWA útil? |
|------------|:---------------:|
| `button` | ✅ Essencial |
| `card` | ✅ Essencial (já existe, não listado mas usado) |
| `input` | ✅ Essencial |
| `select` | ✅ Essencial |
| `sheet` | ✅ Essencial (Bottom Sheet nativo) |
| `dialog` | ⚠️ Substituir por Sheet no mobile |
| `accordion` | ✅ Essencial (Investimentos, Carteira) |
| `progress` | ✅ Essencial (Metas, Freedom Index) |
| `skeleton` | ✅ Essencial (Loading states) |
| `badge` | ✅ Essencial (Status, Tags) |
| `avatar` | ✅ Essencial (Perfil) |
| `tabs` | ⚠️ Usar com moderação (máx 4) |
| `scroll-area` | ✅ Essencial (Scroll containers) |
| `separator` | ✅ Útil |
| `tooltip` | ⚠️ Mobile: substituir por Sheet explicativo |
| `popover` | ⚠️ Mobile: substituir por Sheet |
| `dropdown-menu` | ⚠️ Mobile: substituir por Bottom Sheet |
| `alert-dialog` | ✅ Essencial (Confirmações) |
| `collapsible` | ✅ Útil |
| `slider` | ⚠️ Útil para simulações |
| `switch` | ✅ Útil (Configurações) |
| `checkbox` | ✅ Útil (Formulários) |
| `calendar` | ⚠️ Substituir por DatePicker nativo ou Sheet |
| `carousel` | ❌ Não recomendado (FDL: evitar) |
| `table` | ❌ Não usar no mobile (FDL: lista de cards) |
| `menubar` | ❌ Desktop only |
| `sidebar` | ❌ Substituir por Bottom Nav |
| `radio-group` | ✅ Útil |
| `textarea` | ⚠️ Raro no mobile |
| `toast`/`toaster` | ✅ Essencial (Feedback) |
| `form` + `label` | ✅ Essencial (Formulários) |
| `chart` | ⚠️ Recharts wrapper. Usar com moderação. |

## 1.6 Hooks (7)

| Hook | Reutilizável? |
|------|:------------:|
| `use-financial-kernel` | ✅ Essencial — consumir Kernel |
| `use-mobile` | ✅ Essencial — detectar viewport |
| `use-toast` | ✅ Essencial |
| `use-scheduler` | ✅ Reutilizar |
| `use-snapshot-cache` | ✅ Reutilizar |
| `use-investment-aporte` | ⚠️ Refatorar |
| `use-investment-metrics` | ⚠️ Refatorar |

## 1.7 Providers (3)

| Provider | Reutilizável? |
|----------|:------------:|
| `auth-provider` | ✅ Essencial |
| `snapshot-cache-provider` | ✅ Reutilizar |
| `visibility-provider` | ✅ Reutilizar |

## 1.8 Services — Firestore (22)

Todos são **100% reutilizáveis**. A camada de dados não muda com o Mobile.

`accounts, transactions, investments, liabilities, categories, households, users, planning, fiscal, monthly-closures, month-openings, dashboard.admin, kernel.admin, financial-ai, financial-ai.admin, plans, tour-progress, b3-investments, broker-investments, yields, account-identities`

## 1.9 Core Finance (37 módulos)

**100% reutilizáveis.** Financial Core, Kernel, Freedom Engine, DRE, Cashflow, Forecast, Simulation, Snapshot, Wealth — todos consolidados na Fase 20.5.

## 1.10 Genkit AI (9 módulos)

**100% reutilizáveis.** Flows, agents, tools. O Mobile consumirá as mesmas APIs.

---

# 2. MATRIZ DE REUTILIZAÇÃO — COMPONENTES DO DESIGN SYSTEM

## 2.1 Cards (6 tipos definidos no PWA Design)

| Card | Existe hoje? | Onde | Ação |
|------|:-----------:|------|------|
| **Hero Card** (saldo, 36px) | ❌ Não | — | 🆕 **Novo** |
| **Insight Card** (Domus, borda azul) | ⚠️ Parcial | `insight-carousel.tsx` | 🔧 **Refatorar** (70%) |
| **List Item Card** (56px Standard) | ⚠️ Parcial | Em tabelas e cards de conta | 🔧 **Refatorar** |
| **Action Card** (navegação) | ❌ Não | — | 🆕 **Novo** |
| **Progress Card** (metas) | ⚠️ Parcial | `progress.tsx` (shadcn) | 🔧 **Refatorar** |
| **Metric Dual Card** (2 KPIs lado a lado) | ❌ Não | — | 🆕 **Novo** |

## 2.2 Navegação

| Elemento | Existe hoje? | Ação |
|----------|:-----------:|------|
| **Bottom Nav (5 slots)** | ❌ Não | 🆕 **Novo** — componente principal |
| **Header Mobile (← título + 2 ações)** | ❌ Não | 🆕 **Novo** |
| **Context Switcher (Bottom Sheet)** | ❌ Não | 🆕 **Novo** |
| **Sidebar (Desktop)** | ✅ Sim | ❌ Descartar no Mobile |

## 2.3 Superfícies

| Elemento | Existe hoje? | Ação |
|----------|:-----------:|------|
| **Bottom Sheet** | ✅ Sim | `sheet.tsx` (shadcn) — ✅ Reutilizar |
| **FAB (56px circular)** | ❌ Não | 🆕 **Novo** |
| **Accordion** | ✅ Sim | `accordion.tsx` (shadcn) — ✅ Reutilizar |
| **Dialog (Desktop)** | ✅ Sim | Substituir por Sheet no Mobile |
| **Toast** | ✅ Sim | `toast.tsx` — ✅ Reutilizar |
| **Skeleton** | ✅ Sim | `skeleton.tsx` — ✅ Reutilizar |

## 2.4 Inputs

| Elemento | Existe hoje? | Ação |
|----------|:-----------:|------|
| Input texto | ✅ | `input.tsx` — ✅ Reutilizar |
| Input financeiro (R$) | ❌ Não | 🆕 **Novo** |
| Select | ✅ | `select.tsx` — ✅ Reutilizar |
| Chips (filtro) | ❌ Não | 🆕 **Novo** |
| Search bar | ❌ Não | 🆕 **Novo** |

## 2.5 Gráficos

| Elemento | Existe hoje? | Ação |
|----------|:-----------:|------|
| Sparkline | ❌ Não | 🆕 **Novo** (SVG simples) |
| Donut | ⚠️ Parcial | Recharts — 🔧 Adaptar |
| Barra de progresso | ✅ Sim | `progress.tsx` — ✅ Reutilizar |

## 2.6 Indicadores

| Elemento | Existe hoje? | Ação |
|----------|:-----------:|------|
| Badge | ✅ Sim | `badge.tsx` — ✅ Reutilizar |
| Status (conciliado/pendente) | ❌ Não | 🆕 **Novo** |
| Borda colorida (transações) | ❌ Não | 🆕 **Novo** |

---

# 3. GAP ANALYSIS

## 3.1 Componentes existentes: 117 (82 negócio + 35 UI kit)

## 3.2 Matriz de ação

| Ação | Quantidade | % |
|------|:----------:|:--:|
| ✅ Reutilizar como está | ~55 | 47% |
| 🔧 Refatorar (adaptar para mobile) | ~35 | 30% |
| 🆕 Criar novo | ~20 | 17% |
| ❌ Descartar no Mobile | ~7 | 6% |

## 3.3 Novos componentes a criar

```
MOBILE-SPECIFIC:
├── BottomNav             (5 slots, blur, safe area)
├── MobileHeader          (← título + até 2 ações)
├── FAB                   (56px circular, posição fixa)
├── HeroCard              (saldo 36px, variação)
├── InsightCard           (borda azul esquerda)
├── ProgressCard          (meta + barra + %)
├── MetricDualCard        (2 KPIs lado a lado)
├── TransactionItem       (timeline, swipe actions)
├── AccountItem           (iniciais + nome + saldo)
├── ChipFilter            (filtro horizontal)
├── SearchBar             (busca inline)
├── Sparkline             (SVG mini-gráfico)
├── DonutChart            (alocação 5 segmentos)
├── CurrencyInput         (R$ formatado)
├── ContextSwitcher       (Bottom Sheet avatar)
├── DayHeader             (timeline agrupamento)
├── AccordionGroup        (carteira investimentos)
└── StatusBadge           (conciliado/pendente/legado)
```

## 3.4 Infraestrutura Mobile a criar

```
PWA:
├── manifest.json
├── service-worker.ts
├── icons (192px, 512px, maskable)
└── splash screen

LAYOUT:
├── mobile-layout.tsx      (Bottom Nav + Safe Areas)
├── mobile-provider.tsx    (contexto mobile: tema, navegação)
└── safe-area.css          (variáveis CSS env())

HOOKS:
├── use-bottom-nav.ts      (estado da navegação)
├── use-safe-area.ts       (insets)
└── use-gesture.ts         (swipe, long press)
```

---

# 4. MAPA DE IMPLEMENTAÇÃO (ROADMAP)

## Fase M1 — Fundação Mobile (2-3 semanas)

```
M1.1 — Design Tokens Mobile
    ├── Cores (Dark/Light conforme FDL)
    ├── Tipografia (escala Inter)
    ├── Espaçamento (8 tokens)
    ├── Safe Area CSS
    └── Tema (next-themes)

M1.2 — Layout Mobile
    ├── Mobile Layout (substitui sidebar)
    ├── Bottom Nav (5 slots)
    ├── Mobile Header
    ├── Safe Areas (iOS + Android)
    └── Mobile Provider

M1.3 — Componentes Base
    ├── HeroCard
    ├── InsightCard
    ├── ProgressCard
    ├── MetricDualCard
    ├── ListItemCard
    ├── ActionCard
    ├── FAB
    ├── ChipFilter
    ├── SearchBar
    ├── CurrencyInput
    └── Sparkline
```

## Fase M2 — Home + Domus (1-2 semanas)

```
M2.1 — Home Mobile
    ├── Hero (saldo disponível)
    ├── KPIs (receitas + despesas)
    ├── Freedom Index Card
    ├── Domus Insight
    ├── Próximas Contas
    ├── Carteira Resumo
    └── Skeleton + Estados

M2.2 — FAB + Domus Chat
    ├── FAB (posição fixa, animação)
    ├── Domus Sheet (70% viewport)
    ├── Sugestões contextuais
    └── Estados (loading, erro, offline)
```

## Fase M3 — Finanças (2 semanas)

```
M3.1 — Fluxo de Caixa
    ├── Resumo do dia (3 colunas)
    ├── Timeline (agrupamento por dia)
    ├── TransactionItem (swipe actions)
    ├── FAB registro rápido
    ├── Bottom Sheet detalhe
    └── Busca + Filtros

M3.2 — Contas
    ├── Summary (saldo + mini-barras)
    ├── AccountItem (avatar + tipo + saldo)
    ├── Bottom Sheet detalhe
    ├── Add/Edit/Delete Sheets
    └── Legado (credit_card/investment)
```

## Fase M4 — Planejamento + Investimentos (2 semanas)

```
M4.1 — Planejamento
    ├── Progresso geral (Hero)
    ├── Timeline horizontal
    ├── Meta Cards (ProgressCard)
    ├── Bottom Sheet detalhe + previsão
    └── Nova meta (Sheet)

M4.2 — Investimentos
    ├── Hero (patrimônio investido)
    ├── Donut (alocação)
    ├── Accordion (classes de ativo)
    ├── Sub-items (52px)
    └── Bottom Sheet ativo
```

## Fase M5 — Dashboard + FI (1-2 semanas)

```
M5.1 — Dashboard
    ├── Chips de período
    ├── Resultado do mês
    ├── Top 5 categorias
    ├── Sparkline evolução
    ├── Insights ("O que mudou")
    └── Patrimônio (expansível)

M5.2 — Freedom Index
    ├── Hero 56px (maior número do app)
    ├── Sparkline 6 meses
    ├── 7 Pilar Cards
    ├── Bottom Sheet pilar (explicabilidade)
    └── Ações prioritárias
```

## Fase M6 — Domus + Mais (1 semana)

```
M6.1 — Domus (tela dedicada)
    ├── Boas-vindas dinâmicas
    ├── Conversa (bolhas)
    ├── Cards contextuais (reuso)
    ├── Histórico
    └── Simulações

M6.2 — Mais (Hub)
    ├── Perfil (avatar + FI)
    ├── Seções agrupadas
    ├── Busca global
    └── Academia
```

## Fase M7 — PWA + Polimento (2 semanas)

```
M7.1 — PWA
    ├── Manifest
    ├── Service Worker
    ├── Ícones + Splash
    ├── Instalação
    └── Offline completo

M7.2 — Polimento
    ├── Animações
    ├── Microinterações
    ├── Acessibilidade
    ├── Performance
    └── Testes
```

---

# 5. RISK MATRIX

## P0 — Bloqueadores

| Risco | Descrição | Mitigação |
|-------|-----------|-----------|
| Layout Desktop vs Mobile | Layout atual é sidebar Desktop-first. Precisa de Mobile Layout condicional. | Criar `MobileLayout` que substitui `SidebarProvider` quando `use-mobile` detecta viewport < 768px. |
| Bottom Nav vs Sidebar | Todas as páginas atuais renderizam dentro do Sidebar. Mobile não tem sidebar. | Middleware ou layout condicional. Não duplicar páginas. |
| shadcn Sheet como Bottom Sheet | Sheet atual é genérico. Precisa de variante "bottom" com handle, altura 70%, blur. | Configurar Sheet com `side="bottom"`. Criar wrapper `BottomSheet`. |

## P1 — Alto impacto

| Risco | Descrição | Mitigação |
|-------|-----------|-----------|
| Dialog → Sheet | ~15 Dialogs existentes precisam virar Sheets no mobile. | Criar hook `useResponsiveSheet` que renderiza Dialog no Desktop e Sheet no Mobile. |
| Tabelas → Listas | Várias tabelas (Recharts, transações). Mobile usa lista de cards. | Criar componentes de lista que substituem tabelas quando `isMobile`. |
| Performance com muitas transações | Scroll com 1000+ itens sem virtualização. | Usar `react-window` ou scroll nativo com Intersection Observer. |

## P2 — Médio impacto

| Risco | Descrição |
|-------|-----------|
| Gráficos Recharts | Recharts é pesado para mobile. Sparklines e donuts devem ser SVG puro. |
| PWA Service Worker | Caching strategy precisa ser definida. Firebase offline vs SW cache. |
| Context Switcher | Lógica de troca PF/PJ precisa ser adaptada para Mobile. |

## P3 — Baixo impacto

| Risco | Descrição |
|-------|-----------|
| Animações | Framer Motion ou CSS transitions? CSS é mais leve. |
| Temas | next-themes já presente? Verificar. |
| Testes | Cobertura de testes atual. |

---

# 6. O QUE NÃO MUDAR

```
✅ Financial Core      — consolidado, canônico
✅ Kernel              — orquestrador, cache
✅ Freedom Engine      — cálculo do índice
✅ DRE Engine          — receitas/despesas
✅ Cashflow Engine     — projeções
✅ Simulation Engine   — cenários
✅ Snapshot Engine     — persistência
✅ AI (Genkit)         — flows, agents, tools
✅ Firestore Services  — TODOS (22 serviços)
✅ Auth Provider       — autenticação
✅ API Routes          — TODAS (55+)
✅ Billing             — planos, trial
✅ Imports             — OFX, PDF, CSV, B3
✅ Market Data         — cotações, tickers
```

Toda a camada de dados, negócio e IA é reutilizada sem alterações. O Mobile é puramente uma nova camada de **apresentação**.

---

# 7. DECISÕES ARQUITETURAIS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Layout condicional | `MobileLayout` vs `DesktopLayout` baseado em breakpoint | Não duplicar páginas |
| Navegação | Bottom Nav (5 slots) + Stack (Next.js router) | Padrão mobile |
| Sheets | shadcn Sheet com `side="bottom"` | Já instalado. Customizar wrapper. |
| Gráficos | SVG puro para sparklines/donuts. Recharts apenas para tela cheia. | Performance mobile |
| Temas | next-themes (se instalado) ou CSS variables | Dark-first FDL |
| Estado global | React Context para: tema, navegação, contexto PF/PJ | Simplicidade |
| Cache | SW para shell. Firestore cache para dados. | Offline-first |
| Gestos | CSS + touch events. Sem lib extra. | Performance |

---

# 8. CHECKLIST PARA INÍCIO DA IMPLEMENTAÇÃO

- [ ] Audit document homologado ✅ (este documento)
- [ ] Design tokens definidos (cores, typografia, spacing)
- [ ] Mobile Layout criado (substitui sidebar)
- [ ] Bottom Nav funcional (5 slots)
- [ ] Safe Areas testadas (iOS + Android)
- [ ] Sheet wrapper "BottomSheet" criado
- [ ] Componentes base criados (HeroCard, InsightCard, etc.)
- [ ] FAB criado
- [ ] Primeiro módulo (Home) implementado
- [ ] Typecheck limpo após cada fase
- [ ] Build produção OK após cada fase

---

*FinDomus Mobile PWA Implementation Audit v1 · Fase P1 · AUDITADO*
