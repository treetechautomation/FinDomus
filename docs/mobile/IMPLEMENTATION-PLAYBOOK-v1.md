# FINDOMUS MOBILE PWA — IMPLEMENTATION PLAYBOOK v1

**Fase:** P2 — Playbook de Implementação
**Status:** HOMOLOGADO
**Última atualização:** Julho 2026

---

# CAPÍTULO 1 — FILOSOFIA DE IMPLEMENTAÇÃO

## 1.1 Princípios Fundamentais

```
1. MOBILE FIRST.       Toda feature é projetada para mobile. Desktop herda.
2. REUSO ANTES DE CRIAÇÃO.  Componente existente > refatoração > novo.
3. ZERO QUEBRA DE NEGÓCIO.  Financial Core, Kernel e engines NUNCA são alterados.
4. LAYOUT MUDA. NEGÓCIO PERMANECE.  Apenas a camada de apresentação é afetada.
5. UM MÓDULO POR VEZ.  Finalizar Home antes de começar Dashboard.
6. COMMITS PEQUENOS.   Cada commit entrega uma unidade coesa e reversível.
7. BUILD FREQUENTE.    Typecheck + build após cada sessão de desenvolvimento.
8. COMPONENTES ISOLADOS.  Cada componente é independente, testável e documentado.
9. DARK FIRST.         Todo componente funciona em Dark Mode primeiro. Light herda.
10. ACESSÍVEL SEMPRE.   Touch targets ≥ 44px, contraste AA, screen reader.
```

## 1.2 O que NUNCA muda

| Camada | Exemplos | Regra |
|--------|----------|-------|
| **Financial Core** | `calculateFinancialCore()`, `cashBalance`, `netWorth` | ❌ Intocável |
| **Kernel** | `runFinancialKernel()`, `KernelResult` | ❌ Intocável |
| **Engines** | Freedom, DRE, Cashflow, Simulation, Wealth | ❌ Intocável |
| **Firestore Services** | Todos os 22 serviços em `src/services/firestore/` | ❌ Intocável |
| **API Routes** | Todas as 55+ rotas em `src/app/api/` | ❌ Intocável |
| **AI (Genkit)** | Flows, agents, tools | ❌ Intocável |
| **Auth** | Provider, protected routes | ❌ Intocável |

## 1.3 O que muda

| Camada | O que muda | Como |
|--------|-----------|------|
| **Layout** | Sidebar → Bottom Nav | Novo `MobileLayout` |
| **Páginas** | Desktop → Mobile-first | Refatorar renderização |
| **Componentes** | Dialogs → Bottom Sheets | Wrapper `useResponsiveSheet` |
| **Navegação** | Sidebar links → Stack + Bottom Nav | Next.js router |
| **Tema** | Seguir FDL 1.0 | CSS variables + Tailwind |
| **PWA** | Novo | Manifest, Service Worker |

---

# CAPÍTULO 2 — PADRÃO DE DESENVOLVIMENTO

## 2.1 Regra de Ouro

```
NUNCA EDITAR VÁRIOS MÓDULOS SIMULTANEAMENTE.
```

Cada sessão de desenvolvimento foca em **um único módulo**. Exemplo:
- Sessão 1: apenas `HeroCard`
- Sessão 2: apenas `BottomNav`
- Sessão 3: apenas Home (consome HeroCard + BottomNav)

## 2.2 Ciclo de Desenvolvimento

```
1. LER O DOCUMENTO DE HOMOLOGAÇÃO DO MÓDULO
   ↓
2. CRIAR/REFATORAR COMPONENTES NECESSÁRIOS
   ↓
3. INTEGRAR NA PÁGINA
   ↓
4. TYPECHECK (npm run typecheck)
   ↓
5. BUILD (NODE_ENV=production npx next build)
   ↓
6. REVISÃO DO GIT DIFF
   ↓
7. HOMOLOGAÇÃO CONTRA O DOCUMENTO UX
   ↓
8. COMMIT
```

## 2.3 Regras de Edição de Arquivos

| Regra | Detalhe |
|-------|---------|
| Backup antes de editar | `cp arquivo.ts /tmp/arquivo.ts.bak.MODULO` |
| Alteração mínima | Menor mudança que resolve o problema |
| Um conceito por arquivo | Componente = 1 responsabilidade |
| Sem `any` | Tipagem explícita sempre |
| Sem `@ts-ignore` | Resolver o tipo, não esconder |
| Sem console.log em produção | Usar logger |
| Imports organizados | React → Next → UI kit → negócio → tipos |

## 2.4 Ordem de Construção (Fases M1–M7)

```
M1 — FUNDAÇÃO
    Design Tokens → Mobile Layout → Bottom Nav → Componentes Base

M2 — HOME + DOMUS
    Home Page → HeroCard → KPIs → FI Card → Domus Sheet → FAB

M3 — FINANÇAS
    Fluxo de Caixa → Contas

M4 — PLANEJAMENTO + INVESTIMENTOS
    Metas → Carteira

M5 — DASHBOARD + FREEDOM INDEX
    Dashboard → FI

M6 — DOMUS + MAIS
    Domus Tela → Hub

M7 — PWA + POLIMENTO
    PWA → Animações → Testes → Produção
```

**NUNCA iniciar uma fase antes da anterior estar homologada.**

---

# CAPÍTULO 3 — PADRÃO DE COMPONENTES

## 3.1 Árvore de Decisão

```
Preciso de um componente?
    │
    ├── Já existe no UI kit (shadcn)?
    │   └── SIM → Reutilizar. Só customizar via className.
    │
    ├── Já existe nos componentes de negócio?
    │   └── SIM → Pode ser reutilizado?
    │       ├── SIM → Reutilizar.
    │       └── NÃO → Refatorar para mobile.
    │
    └── NÃO existe?
        └── Criar novo.
            ├── É específico de um módulo? → src/components/[modulo]/
            └── É compartilhado?           → src/components/ui/ (se for base)
                                            → src/components/shared/ (se for negócio)
```

## 3.2 Critérios para Componente Novo

| Critério | Pergunta |
|----------|----------|
| **Reuso** | Será usado em 2+ lugares? |
| **Isolamento** | Faz uma única coisa bem definida? |
| **Composição** | Pode ser composto com outros componentes? |
| **Testabilidade** | Pode ser testado isoladamente? |
| **Design** | Está definido no documento de homologação? |

Se NÃO atender a 3+ critérios: **não criar**. Resolver inline.

## 3.3 Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/              ← shadcn (não editar manualmente)
│   ├── mobile/           ← NOVO: componentes específicos mobile
│   │   ├── navigation/
│   │   │   ├── bottom-nav.tsx
│   │   │   └── mobile-header.tsx
│   │   ├── cards/
│   │   │   ├── hero-card.tsx
│   │   │   ├── insight-card.tsx
│   │   │   ├── progress-card.tsx
│   │   │   ├── metric-dual-card.tsx
│   │   │   └── action-card.tsx
│   │   ├── sheets/
│   │   │   └── bottom-sheet.tsx
│   │   ├── fab/
│   │   │   └── fab.tsx
│   │   ├── inputs/
│   │   │   ├── currency-input.tsx
│   │   │   └── chip-filter.tsx
│   │   ├── charts/
│   │   │   ├── sparkline.tsx
│   │   │   └── donut-chart.tsx
│   │   └── layout/
│   │       └── mobile-layout.tsx
│   ├── [modulo]/         ← componentes de domínio (existentes)
│   └── shared/           ← componentes de negócio reutilizáveis
├── hooks/
│   ├── use-responsive-sheet.ts
│   ├── use-safe-area.ts
│   └── use-gesture.ts
├── providers/
│   └── mobile-provider.tsx
└── app/
    └── (main)/
        └── layout.tsx   ← condicional: MobileLayout | DesktopLayout
```

---

# CAPÍTULO 4 — PADRÃO DE COMMITS

## 4.1 Formato

```
<tipo>(<escopo>): <descrição curta em português>
```

## 4.2 Tipos

| Tipo | Quando usar |
|------|------------|
| `feat` | Novo componente, página ou funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Melhoria de código sem alterar comportamento |
| `style` | CSS, formatação, espaçamento |
| `docs` | Documentação |
| `test` | Testes |
| `chore` | Configuração, build, dependencies |

## 4.3 Escopos

| Escopo | Exemplos |
|--------|----------|
| `mobile` | Componentes mobile |
| `home` | Tela Home |
| `dashboard` | Tela Dashboard |
| `fluxo` | Fluxo de Caixa |
| `contas` | Módulo Contas |
| `planejamento` | Planejamento |
| `investimentos` | Investimentos |
| `fi` | Freedom Index |
| `domus` | Domus IA |
| `mais` | Hub Mais |
| `pwa` | PWA, Service Worker |
| `cards` | Sistema de cards |
| `nav` | Navegação |
| `theme` | Tema, cores |

## 4.4 Exemplos

```
feat(mobile): cria BottomNav com 5 slots
feat(home): implementa HeroCard com saldo disponível
fix(cards): corrige alinhamento do InsightCard em 375px
refactor(sheets): unifica BottomSheet com variante de altura
style(theme): aplica tokens de cor FDL no Dark Mode
docs(playbook): atualiza checklist de homologação
chore(pwa): adiciona manifest.json e ícones
```

## 4.5 Boas Práticas

- **Uma coisa por commit.** Não misturar feat com fix.
- **Descrição em português.** Projeto é pt-BR.
- **Máximo 72 caracteres** na linha de descrição.
- **Corpo opcional** para explicar o "porquê" se necessário.
- **Nunca commitar segredos.** Verificar `git diff --staged` antes.

---

# CAPÍTULO 5 — PADRÃO DE BRANCHES

## 5.1 Branches Principais

```
main        ← produção. Código homologado e publicado.
develop     ← integração. Features são mergeadas aqui.
```

## 5.2 Branches de Trabalho

```
feature/m1-foundation      ← Fase M1: Fundação Mobile
feature/m2-home-domus      ← Fase M2: Home + Domus
feature/m3-financas        ← Fase M3: Finanças
feature/m4-planej-invest   ← Fase M4: Planejamento + Investimentos
feature/m5-dash-fi         ← Fase M5: Dashboard + FI
feature/m6-domus-mais      ← Fase M6: Domus + Mais
feature/m7-pwa-polish      ← Fase M7: PWA + Polimento
```

## 5.3 Fluxo

```
feature/m1-foundation
    │
    ├── M1.1 (tokens)       → commit → push
    ├── M1.2 (layout)       → commit → push
    ├── M1.3 (componentes)  → commit → push
    │
    ├── Homologação M1 completa
    │
    ▼
    merge → develop
    │
    ▼
    feature/m2-home-domus (cria a partir de develop)
    │
    ... (repete)
    │
    ▼
    develop → main (quando todas as fases concluídas)
```

## 5.4 Hotfix

```
main ←── hotfix/nome-do-fix
        │
        ├── corrige bug crítico em produção
        ├── merge → main (deploy imediato)
        └── merge → develop (sincroniza)
```

## 5.5 Regras

- **Nunca commitar direto na `main`.**
- **Nunca commitar direto na `develop`.**
- **Feature branches são efêmeras.** Deletar após merge.
- **Sempre criar feature a partir da `develop` atualizada.**

---

# CAPÍTULO 6 — PADRÃO DE HOMOLOGAÇÃO

## 6.1 Checklist por Módulo

Cada módulo só é considerado **HOMOLOGADO** quando:

### Design
- [ ] Corresponde ao wireframe do documento de homologação
- [ ] Cores, tipografia e espaçamento seguem FDL 1.0
- [ ] Componentes reutilizados onde possível
- [ ] Dark Mode funcional e revisado

### Funcionalidade
- [ ] Typecheck: `npm run typecheck` → 0 erros
- [ ] Build: `NODE_ENV=production npx next build` → OK
- [ ] Dados carregam do Firestore corretamente
- [ ] Estados: loading, empty, error, offline
- [ ] Navegação: rotas funcionam, back button correto

### Responsividade
- [ ] 375px (iPhone SE): sem scroll horizontal
- [ ] 390px (iPhone 14): referência principal
- [ ] 430px (iPhone 14 Pro Max): espaçamento adequado

### Performance
- [ ] Sem layout shift durante carregamento
- [ ] Skeleton visível em < 200ms
- [ ] Scroll suave (60fps)

### Acessibilidade
- [ ] Touch targets ≥ 44px
- [ ] Contraste AA (texto primário sobre fundo)
- [ ] Screen reader: labels descritivos

### Regressão
- [ ] Financial Core inalterado
- [ ] Kernel inalterado
- [ ] Dashboard Desktop não quebrou
- [ ] Nenhum `console.error` novo

## 6.2 Exemplo de Homologação — Home

```
MÓDULO: Home
DATA: __/__/____
RESPONSÁVEL: ________

Design:
  [ ] Hero Card (36px) corresponde ao wireframe
  [ ] KPIs (Receitas/Despesas) em 2 colunas
  [ ] Freedom Index Card colapsado com expansão
  [ ] Domus Insight com borda azul
  [ ] Próximas Contas: máx 3 itens
  [ ] Carteira + Planejamento: cards resumo
  [ ] FAB visível (56px, canto inferior direito)
  [ ] Bottom Nav: 5 slots, active state azul

Funcionalidade:
  [ ] Typecheck 0 erros
  [ ] Build OK
  [ ] Saldo carrega do Firestore (cache-first)
  [ ] Loading: skeleton por seção
  [ ] Empty: mensagem + CTAs de onboarding
  [ ] Erro: mensagem + botão tentar novamente
  [ ] Offline: badge + dados cacheados
  [ ] Pull-to-refresh funcional

Responsividade:
  [ ] 375px OK
  [ ] 390px OK
  [ ] 430px OK

Acessibilidade:
  [ ] Touch targets ≥ 44px
  [ ] Contraste AA
  [ ] Screen reader testado

STATUS: [ ] HOMOLOGADO  [ ] PENDENTE (itens: ___)
```

---

# CAPÍTULO 7 — TESTES

## 7.1 Estratégia

| Camada | O que testar | Como |
|--------|-------------|------|
| **Visual** | Cada componente renderiza corretamente em 3 viewports | Inspeção manual no devtools + device mode |
| **Funcional** | Estados: loading, empty, error, offline, dados | Alternar estados mockados |
| **Integração** | Navegação entre telas, Bottom Nav, back button | Fluxo completo do usuário |
| **Regressão** | Financial Core, Kernel, Dashboard Desktop | Rodar typecheck + build. Verificar git diff. |
| **Acessibilidade** | Contraste, touch targets, screen reader | Lighthouse + inspeção manual |

## 7.2 Smoke Test (antes de cada homologação)

```
1. Abrir app → Home carrega sem erros
2. Saldo aparece (do Firestore)
3. Bottom Nav: tocar cada destino → navega
4. FAB visível → abre Domus Sheet
5. Dark Mode: tudo legível
6. 375px: sem scroll horizontal
7. Pull-to-refresh: funcional
8. Typecheck: 0 erros
9. Build: OK
10. Nenhum console.error
```

## 7.3 Check de Regressão (após cada módulo)

```
1. git diff --stat → apenas arquivos esperados
2. Financial Core: nenhuma linha alterada
3. Kernel: nenhuma linha alterada
4. Dashboard Desktop: carrega sem erro
5. Freedom Index Desktop: carrega sem erro
6. npm run typecheck → 0 erros
7. NODE_ENV=production npx next build → OK
```

---

# CAPÍTULO 8 — PADRÃO DE REVISÃO

## 8.1 Template de Pull Request

```markdown
## O que mudou?
[Descrição clara em português]

## Por que mudou?
[Referência ao documento de homologação: fase Mx.x, seção y]

## Arquivos alterados
- src/components/mobile/cards/hero-card.tsx (novo)
- src/app/(main)/page.tsx (refatorado)

## Screenshots
| 390px | 375px | Dark |
|-------|-------|------|
| [img] | [img] | [img] |

## Impacto
- [ ] Financial Core: inalterado
- [ ] Kernel: inalterado
- [ ] Dashboard Desktop: inalterado
- [ ] Novas dependências: nenhuma

## Validações
- [ ] Typecheck: 0 erros
- [ ] Build: OK
- [ ] 375px: OK
- [ ] 390px: OK
- [ ] Dark Mode: OK
- [ ] Touch targets: ≥ 44px

## Rollback
`git revert <commit>`
```

---

# CAPÍTULO 9 — ROLLBACK

## 9.1 Quando fazer rollback

| Situação | Ação |
|----------|------|
| Build de produção quebra | Rollback imediato |
| Regressão no Financial Core | Rollback imediato |
| Bug visual grave (tela ilegível) | Rollback imediato |
| Bug funcional menor | Corrigir no próximo commit. Sem rollback. |
| Performance degradada (< 20%) | Avaliar. Rollback se impacto significativo. |

## 9.2 Como fazer rollback

```
1. Identificar o commit problemático:  git log --oneline -5
2. Reverter:                           git revert <commit>
3. Verificar:                          npm run typecheck && npm run build
4. Commit do revert:                    git commit -m "revert: <motivo>"
5. Push:                               git push origin <branch>
```

## 9.3 Documentação do Rollback

```markdown
## Rollback — [DATA]

**Commit revertido:** `abc123`
**Motivo:** [descrição]
**Impacto:** [telas/módulos afetados]
**Ação corretiva:** [o que será feito para corrigir e re-aplicar]
```

---

# CAPÍTULO 10 — QUALIDADE

## 10.1 Critérios Mínimos

| Critério | Alvo | Como verificar |
|----------|:----:|----------------|
| TypeScript | 0 erros | `npm run typecheck` |
| ESLint | 0 warnings | `npm run lint` |
| Build | OK | `NODE_ENV=production npx next build` |
| Lighthouse Performance | ≥ 90 | Chrome DevTools |
| Lighthouse Accessibility | ≥ 95 | Chrome DevTools |
| Lighthouse PWA | ≥ 90 | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| Touch targets | ≥ 44px | Inspeção manual |
| Contraste | AA | Inspeção manual |

## 10.2 Antes de cada commit

```
[ ] Typecheck passa
[ ] Build passa
[ ] git diff revisado (sem arquivos acidentais)
[ ] Sem console.log
[ ] Sem @ts-ignore
[ ] Sem any novo
[ ] Sem comentários de debug
```

---

# CAPÍTULO 11 — CRITÉRIOS PARA PRODUÇÃO

## 11.1 Checklist de Deploy

```
PRÉ-DEPLOY:
  [ ] Todas as fases (M1-M7) homologadas
  [ ] Build de produção: OK
  [ ] Typecheck: 0 erros
  [ ] Lighthouse: ≥ 90 em todos os critérios
  [ ] Teste em dispositivo real (iOS + Android)
  [ ] Service Worker registrado e funcional
  [ ] Manifest válido
  [ ] Ícones PWA em todos os tamanhos
  [ ] Splash screen testada
  [ ] Offline: dados cacheados visíveis
  [ ] Firebase: regras de segurança revisadas
  [ ] Backup: snapshot do Firestore (se migração)
  [ ] Changelog atualizado
  [ ] Aprovação do CTO/Product Owner

DEPLOY:
  [ ] Merge develop → main
  [ ] Deploy (Vercel/Firebase Hosting)
  [ ] Verificar produção: Home carrega, login funciona

PÓS-DEPLOY:
  [ ] Monitorar erros (30 min)
  [ ] Verificar analytics (1h, 24h)
  [ ] Rollback disponível se necessário
```

---

# CAPÍTULO 12 — CRITÉRIOS PARA CADA SPRINT

## 12.1 Template de Sprint

```markdown
## Sprint Mx — [NOME DA FASE]

**Objetivo:** [1 frase]

**Escopo:**
- [ ] [Item 1]
- [ ] [Item 2]
- [ ] [Item 3]

**Dependências:**
- [ ] Fase anterior homologada

**Riscos:**
- [Risco 1] — mitigação:
- [Risco 2] — mitigação:

**Checklist de conclusão:**
- [ ] Typecheck: 0 erros
- [ ] Build: OK
- [ ] Todos os estados testados (loading, empty, error, offline)
- [ ] 3 viewports validados
- [ ] Dark Mode testado
- [ ] Sem regressão no Desktop
- [ ] Homologação UX aprovada

**Resultado esperado:**
[Descrição do que o usuário verá ao final]
```

---

# CAPÍTULO 13 — MATRIZ DE PRIORIDADE

## 13.1 Classificação

| Nível | Significado | Resposta |
|:-----:|------------|----------|
| **P0** | Bloqueia implementação ou produção | Resolver antes de qualquer avanço |
| **P1** | Degrada experiência significativamente | Resolver na sprint atual |
| **P2** | Impacto moderado | Planejar para próxima sprint |
| **P3** | Cosmético ou melhoria futura | Backlog |

## 13.2 Exemplos

| Exemplo | Classificação |
|---------|:------------:|
| Financial Core retornando valores incorretos | P0 |
| Bottom Nav não funciona em iOS | P0 |
| Cor de texto não atende contraste AA | P1 |
| Animação de transição muito lenta | P2 |
| Ícone poderia ser mais bonito | P3 |

---

# CAPÍTULO 14 — MÉTRICAS

## 14.1 Indicadores de Progresso

| Métrica | Como medir | Frequência |
|---------|-----------|:----------:|
| Módulos homologados | Contagem de checklists completos | Por sprint |
| Componentes criados | `find src/components/mobile -name "*.tsx" \| wc -l` | Por sprint |
| Componentes reutilizados | % de componentes existentes vs novos | Por sprint |
| Typecheck | `npm run typecheck` (0 erros = 100%) | Por commit |
| Build | `npm run build` (OK/Fail) | Por commit |
| Regressões | Bugs encontrados pós-homologação | Por sprint |
| Cobertura PWA | Lighthouse PWA score | Por fase |

## 14.2 Dashboard de Progresso

```
FASE     MÓDULOS              STATUS    COMPONENTES
──────────────────────────────────────────────────
M1       Fundação             [   ]     0/18
M2       Home + Domus         [   ]     0/18
M3       Finanças             [   ]     0/18
M4       Planej + Invest      [   ]     0/18
M5       Dashboard + FI       [   ]     0/18
M6       Domus + Mais         [   ]     0/18
M7       PWA + Polimento      [   ]     0/18
──────────────────────────────────────────────────
TOTAL                         0/7       0/18
```

---

# CAPÍTULO 15 — DOCUMENTAÇÃO

## 15.1 Documentos Obrigatórios

| Documento | Quando atualizar |
|-----------|-----------------|
| FDL 1.0 | Apenas se design system mudar (raro) |
| PWA Design v1 | Apenas se arquitetura de navegação mudar |
| Homologações (M0.1–M0.9) | **NUNCA.** Congelados. |
| Implementation Audit | Após cada fase concluída |
| **Este Playbook** | Quando processo de desenvolvimento mudar |

## 15.2 Versionamento de Documentos

```
Formato: <NOME>-v<MAJOR>.<MINOR>.md

MAJOR: mudança estrutural (ex: novo módulo, nova arquitetura)
MINOR: ajuste, correção, clarificação

Exemplo:
HOME-MOBILE-HOMOLOGATION-v1.0.md  ← versão inicial homologada
HOME-MOBILE-HOMOLOGATION-v1.1.md  ← ajuste de contraste
HOME-MOBILE-HOMOLOGATION-v2.0.md  ← redesign estrutural
```

## 15.3 Quando Congelar

Um documento é congelado quando:
- Todos os stakeholders aprovaram
- Nenhuma ambiguidade permanece
- O código pode ser escrito a partir dele sem decisões adicionais

Documentos congelados **NUNCA** são alterados sem Change Request formal.

---

# CAPÍTULO 16 — GOVERNANÇA TÉCNICA

## 16.1 Responsabilidades

| Papel | Responsável por |
|-------|----------------|
| **Arquitetura** | Financial Core, Kernel, estrutura de pastas, contratos |
| **UX** | Design System, homologações, consistência visual |
| **Código** | Implementação, typecheck, build, performance |
| **Produção** | Deploy, monitoramento, rollback |
| **Qualidade** | Testes, acessibilidade, Lighthouse, regressão |

## 16.2 Registro de Decisões Técnicas

Formato para Architecture Decision Records (ADR):

```markdown
## ADR-001: Mobile Layout condicional

**Data:** __/__/____
**Status:** Aprovado

**Contexto:**
O layout atual usa Sidebar (Desktop). Mobile precisa de Bottom Nav.

**Decisão:**
Criar `MobileLayout` que substitui `SidebarProvider` quando viewport < 768px.
Usar `use-mobile` hook para detecção.

**Alternativas consideradas:**
1. Layout separado por subdomínio (m.findomus.com) — complexo, rejeitado.
2. CSS media queries para esconder/mostrar — frágil, rejeitado.

**Consequências:**
- Todas as páginas existentes precisam de MobileLayout wrapper.
- Sidebar continua funcionando no Desktop sem alteração.
```

---

# CAPÍTULO 17 — CHECKLIST MESTRE DE IMPLEMENTAÇÃO

```
FASE M1 — FUNDAÇÃO
  [ ] M1.1 — Design Tokens Mobile
      [ ] Cores Dark (FDL)
      [ ] Cores Light (FDL)
      [ ] Tipografia (Inter)
      [ ] Espaçamento (8 tokens)
      [ ] Safe Area CSS
      [ ] Tema (next-themes ou CSS vars)
  [ ] M1.2 — Layout Mobile
      [ ] MobileLayout (substitui SidebarProvider)
      [ ] MobileProvider (contexto: tema, navegação)
  [ ] M1.3 — Navegação
      [ ] BottomNav (5 slots)
      [ ] MobileHeader
      [ ] Stack navigation (Next.js router)
  [ ] M1.4 — Componentes Base
      [ ] HeroCard
      [ ] InsightCard
      [ ] ProgressCard
      [ ] MetricDualCard
      [ ] ListItemCard
      [ ] ActionCard
      [ ] FAB
      [ ] ChipFilter
      [ ] SearchBar
      [ ] CurrencyInput
      [ ] Sparkline
      [ ] DonutChart
      [ ] BottomSheet wrapper
  [ ] M1.5 — Homologação
      [ ] Typecheck
      [ ] Build
      [ ] 3 viewports
      [ ] Dark/Light

FASE M2 — HOME + DOMUS
  [ ] M2.1 — Home
      [ ] Hero (saldo disponível)
      [ ] KPIs (Receitas/Despesas) Dual Card
      [ ] KPIs (Investimentos/Patrimônio) Dual Card
      [ ] Freedom Index Card (colapsado)
      [ ] Domus Insight Card (0-1)
      [ ] Próximas Contas (máx 3)
      [ ] Carteira Resumo
      [ ] Planejamento Resumo
      [ ] Estados: loading, empty, error, offline, privacy
      [ ] Pull-to-refresh
  [ ] M2.2 — Domus FAB + Chat
      [ ] FAB (posição fixa, animação scroll)
      [ ] Domus Sheet (70% viewport)
      [ ] Sugestões contextuais
      [ ] Respostas (3 níveis)
      [ ] Estados: loading, offline, erro
  [ ] M2.3 — Homologação Home
      [ ] Checklist completo do Capítulo 6

FASE M3 — FINANÇAS
  [ ] M3.1 — Fluxo de Caixa
      [ ] Resumo do dia (3 colunas)
      [ ] Timeline (agrupamento por dia)
      [ ] TransactionItem (56px, swipe actions)
      [ ] FAB registro rápido (Bottom Sheet)
      [ ] Bottom Sheet detalhe transação
      [ ] Chips de filtro (Todos, Entradas, Saídas)
      [ ] Busca inline
      [ ] Domus operacional
      [ ] Estados: loading, empty, erro, offline
  [ ] M3.2 — Contas
      [ ] Summary (saldo + mini-barras)
      [ ] AccountItem (avatar + nome + tipo + saldo)
      [ ] Bottom Sheet detalhe
      [ ] Add Account Sheet
      [ ] Edit Account Sheet
      [ ] Delete Confirmation Sheet
      [ ] Context Switcher (avatar → Sheet)
      [ ] Legado (credit_card/investment)
      [ ] Domus contextual
      [ ] Estados: loading, empty, erro, offline, privacy
  [ ] M3.3 — Homologação
      [ ] Fluxo de Caixa
      [ ] Contas

FASE M4 — PLANEJAMENTO + INVESTIMENTOS
  [ ] M4.1 — Planejamento
      [ ] Progresso geral (Hero)
      [ ] Domus Coach Card
      [ ] Timeline horizontal (scroll)
      [ ] Meta Cards (ProgressCard)
      [ ] Bottom Sheet detalhe + previsão (3 cenários)
      [ ] Nova meta Sheet
      [ ] Estados: loading, empty, erro
  [ ] M4.2 — Investimentos
      [ ] Hero (patrimônio investido)
      [ ] Donut (alocação 5 segmentos)
      [ ] Accordion (classes de ativo)
      [ ] Sub-items (52px)
      [ ] Bottom Sheet ativo
      [ ] Novo ativo Sheet
      [ ] Domus consultora
      [ ] Estados: loading, empty, erro, offline
  [ ] M4.3 — Homologação
      [ ] Planejamento
      [ ] Investimentos

FASE M5 — DASHBOARD + FREEDOM INDEX
  [ ] M5.1 — Dashboard
      [ ] Chips de período (scroll horizontal)
      [ ] Resultado do mês (Summary Card)
      [ ] Top 5 categorias (mini-barras)
      [ ] Sparkline (evolução 6 meses)
      [ ] Insights "O que mudou" (3-5)
      [ ] Patrimônio (expansível)
      [ ] Domus analítico
      [ ] Estados: loading, empty, erro, offline
  [ ] M5.2 — Freedom Index
      [ ] Hero 56px (maior do app)
      [ ] Sparkline 6 meses
      [ ] 7 Pilar Cards (56px, ordem fixa)
      [ ] Bottom Sheet pilar (cálculo, histórico, como melhorar)
      [ ] Ações prioritárias (máx 5, rankeadas)
      [ ] Explicabilidade (Bottom Sheet)
      [ ] Domus mentora
      [ ] Estados: loading, empty, erro
  [ ] M5.3 — Homologação
      [ ] Dashboard
      [ ] Freedom Index

FASE M6 — DOMUS + MAIS
  [ ] M6.1 — Domus (tela dedicada)
      [ ] Boas-vindas dinâmicas (baseadas no FI)
      [ ] Sugestões contextuais (chips)
      [ ] Conversa (bolhas usuário + Domus)
      [ ] Cards contextuais (reuso)
      [ ] Ações (CTAs)
      [ ] Simulações
      [ ] Histórico (Bottom Sheet)
      [ ] Estados: primeiro acesso, loading, erro, offline
  [ ] M6.2 — Mais (Hub)
      [ ] Perfil Card (avatar + nome + plano + FI)
      [ ] Domus recomendação de features
      [ ] Seções: Minha Conta, Contexto, Ferramentas, Academia, Suporte
      [ ] Item padrão (56px)
      [ ] Academia (68px com progresso)
      [ ] Busca global
      [ ] Estados: loading, offline
  [ ] M6.3 — Homologação
      [ ] Domus
      [ ] Mais

FASE M7 — PWA + POLIMENTO
  [ ] M7.1 — PWA
      [ ] Manifest.json
      [ ] Service Worker (precache + runtime)
      [ ] Ícones (192px, 512px, maskable)
      [ ] Splash screen
      [ ] Instalação (prompt)
      [ ] Offline completo
      [ ] Push notifications (opt-in)
      [ ] Atualizações silenciosas
  [ ] M7.2 — Polimento
      [ ] Animações (entrada, transição, sheets)
      [ ] Microinterações (haptic, scale)
      [ ] prefers-reduced-motion
      [ ] Pull-to-refresh em todas as telas
      [ ] Performance audit (Lighthouse ≥ 90)
      [ ] Accessibility audit (Lighthouse ≥ 95)
      [ ] Teste em dispositivo real (iOS + Android)
  [ ] M7.3 — Produção
      [ ] Checklist de deploy (Capítulo 11)
      [ ] Deploy produção
      [ ] Monitoramento 24h
      [ ] Changelog público
```

---

# APÊNDICE A — COMANDOS DE REFERÊNCIA

```bash
# Desenvolvimento
npm run dev                  # Iniciar servidor de desenvolvimento
npm run typecheck            # Verificar tipos TypeScript
npm run lint                 # Verificar ESLint
NODE_ENV=production npx next build  # Build de produção

# Git
git status --short           # Verificar working tree
git diff --stat              # Verificar arquivos alterados
git diff -- src/             # Verificar diff do código
git log --oneline -10        # Últimos 10 commits

# Auditoria
find src -name "*.tsx" | wc -l     # Contar componentes
grep -rn "TODO\|FIXME" src/        # Encontrar pendências
grep -rn "any" src/components/     # Encontrar any em componentes
```

---

*FinDomus Implementation Playbook v1 · Fase P2 · HOMOLOGADO*
