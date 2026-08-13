# FINDOMUS MOBILE PWA — DESIGN SPECIFICATION v1

**Status:** DESIGN · Não implementado
**FDL:** 1.0 FROZEN
**Base:** Financial Core consolidado · Kernel consolidado
**Viewport primário:** 390 × 844px (iPhone 14)
**Viewports de validação:** 375 × 812px · 430 × 932px

---

# PARTE 1 — ARQUITETURA DA EXPERIÊNCIA

## 1.1 Filosofia Mobile

```
Desktop = ferramenta de análise (power user, tela grande, multitarefa)
Mobile  = companheiro diário  (rápido, uma mão, decisões instantâneas)
```

O FinDomus Mobile NÃO é uma versão reduzida do Desktop. É um produto diferente — focado em acompanhamento, decisões rápidas e interação com a Domus IA.

**Regra de ouro:** Se uma informação não ajuda o usuário a tomar uma decisão financeira nos próximos 60 segundos, ela não aparece na tela principal.

## 1.2 Jornada do Usuário

```
ABERTURA DO APP (manhã)
    │
    ▼
HOME — "Como estou hoje?"
    │
    ├── Saldo disponível
    ├── Receitas/Despesas do mês
    ├── Freedom Index (expansível)
    ├── Insight Domus (0-1)
    └── Próximas contas a pagar
    │
    ▼
NAVEGAÇÃO (durante o dia)
    │
    ├── 🏠 Home ............. visão geral
    ├── 💰 Finanças ......... fluxo de caixa, contas, planejamento
    ├── 📈 Investimentos ... carteira, rentabilidade
    ├── 🤖 Domus ........... IA conversacional
    └── ☰ Mais ............ perfil, configurações, academia
```

## 1.3 Princípios de Navegação

| Princípio | Aplicação |
|-----------|-----------|
| **Polegar primeiro** | Ações principais na metade inferior da tela |
| **Uma mão** | Navegação inferior com 5 destinos, alcançáveis com o polegar |
| **Zero scroll desnecessário** | Cada tela responde uma pergunta em ≤ 1.5 viewports |
| **Profundidade progressiva** | Superfície → Toque → Detalhe → Ação |
| **Domus sempre presente** | FAB persistente para acesso instantâneo à IA |
| **Offline first** | Dados cacheados. Ações que exigem rede desabilitadas, não escondidas |

## 1.4 Arquitetura de Telas

```
NÍVEL 0 — BOTTOM NAV (sempre visível)
    ├── Home       (/)
    ├── Finanças   (/financas)
    ├── Investir   (/investimentos)
    ├── Domus      (/domus)
    └── Perfil     (/perfil)

NÍVEL 1 — MÓDULOS (Drill-down a partir da Home ou Bottom Nav)
    ├── Fluxo de Caixa    (/financas/fluxo)
    ├── Contas            (/financas/contas)
    ├── Planejamento      (/financas/planejamento)
    ├── Passivos          (/financas/passivos)
    ├── Carteira          (/investimentos/carteira)
    ├── Importações       (/importacoes)
    └── Academia          (/academia)

NÍVEL 2 — DETALHE (a partir de itens de lista)
    ├── Conta Detail
    ├── Investimento Detail
    ├── Passivo Detail
    └── Transação Detail

NÍVEL 3 — AÇÃO (Bottom Sheets)
    ├── Add/Edit/Delete (entidades)
    ├── Domus Chat (FAB)
    └── Filtros / Busca
```

---

# PARTE 2 — SISTEMA DE NAVEGAÇÃO

## 2.1 Bottom Navigation Bar

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────┐│
│  │    ⌂    │  │    💰   │  │    📈   │  │    ◈    │  │ ☰ ││
│  │ Início  │  │Finanças │  │Investir │  │  Domus  │  │Mais││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────┘│
│                                                              │
│              [ safe area — 28px ]                            │
└──────────────────────────────────────────────────────────────┘
```

### Especificações

| Parâmetro | Valor |
|-----------|:-----:|
| Altura total | 82px (44px touch + 10px padding + 28px safe area) |
| Destinos | 5 (Início, Finanças, Investir, Domus, Mais) |
| Ícones | Lucide, 24px |
| Labels | 10px, Inter, 500w (inactive) / 600w (active) |
| Active state | Ícone + label em `#00B4D8` (azul FinDomus) |
| Inactive state | Ícone + label em `#555D68` (text-tertiary) |
| Background | `rgba(10,14,20,0.85)` + `backdrop-filter: blur(8px)` |
| Divisor superior | `border-subtle` (1px, 6% white) |
| Teclado aberto | Modo compacto: 54px, apenas ícones, sem labels |

### Por que 5 destinos (não 4)?

O Navigation Wireframe original definiu 4 destinos (Início, Módulos, Domus, Perfil). A evolução para Mobile PWA justifica 5:

- **Finanças** separa o que antes era "Módulos → Meu Dinheiro" em um destino próprio. É a seção mais acessada (fluxo de caixa, contas).
- **Investir** é aspiracional. Separar investimentos de finanças operacionais cria uma distinção mental clara: "dinheiro que uso" vs "dinheiro que cresce".
- **Mais** substitui "Perfil" como destino de baixa frequência. Agrupa perfil, configurações, planos e academia.

## 2.2 Gestos e Transições

| Gesto | Ação |
|-------|------|
| Swipe right → | Voltar (equivalente a ← no header) |
| Swipe down (no topo) | Pull-to-refresh |
| Long press (lista) | Context menu (editar, excluir) |
| Swipe left (item) | Ação rápida (excluir, arquivar) |
| Tap (FAB) | Abrir Domus Chat (Bottom Sheet) |
| Double tap (Home) | Scroll para o topo |

## 2.3 Safe Areas

```
iPhone (notch/dynamic island):
    Top: 54px (status bar)
    Bottom: 28px (home indicator)

Android (gesture navigation):
    Top: 24px (status bar)
    Bottom: 16px (gesture bar)
```

Todo conteúdo com padding respeitando `env(safe-area-inset-*)`.

---

# PARTE 3 — HOME · WIREFRAME TEXTUAL

## 3.1 Estado Inicial (com dados)

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                               │
├──────────────────────────────────────────────────────────────┤
│  Olá, Anderson                                   👤 [avatar] │
│  Seu mês está indo bem.                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Saldo disponível                                        ││
│  │                                                          ││
│  │  R$ 9.500                                                ││ ← 36px financial-hero
│  │                                                          ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰   +R$ 620 este mês   ↑           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Receitas        │  │  Despesas        │                 │
│  │  R$ 8.200        │  │  R$ 4.280        │                 │
│  │  +12% vs mês ant │  │  -8% vs mês ant  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🛡️ Freedom Index                             67 pts  ▸ ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱            Construção        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ◈ Domus                                                 ││
│  │  Sua reserva cobre 4,2 meses. O ideal são 6.            ││
│  │  Com R$ 620/mês, você chega lá em 3 meses.       ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── PRÓXIMAS ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📅  Aluguel                     R$ 2.200    15 ago  →  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📅  Financiamento Carro         R$ 1.000    20 ago  →  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CARTEIRA ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📈  Investimentos               R$ 15.000   +R$ 420 →  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              💰 Ver finanças                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 64px espaço →                                             │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │
│ Início   Finanças   Investir   Domus     Mais                │
└──────────────────────────────────────────────────────────────┘
│                                                              │
│              [FAB ◈] ← Domus flutuante                       │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Hierarquia da Home

| Posição | Elemento | Justificativa |
|:-------:|----------|---------------|
| 1 | Saudação + avatar | Conexão humana. Acesso ao contexto. |
| 2 | **Saldo disponível** | Protagonista. Responde "quanto tenho?". |
| 3 | Receitas / Despesas | Par Dual. Entrada vs saída do mês. |
| 4 | Freedom Index (card) | Visão expandível do índice de liberdade. |
| 5 | Insight Domus (0-1) | IA proativa com recomendação contextual. |
| 6 | Próximas contas | Até 3 itens. O que precisa de atenção agora. |
| 7 | Carteira resumo | Link rápido para investimentos. |

### 3.3 O que NÃO está na Home

| ❌ Removido | Motivo |
|------------|--------|
| 3-4 KPI Cards | Poluição visual. Só 1 protagonista: saldo disponível. |
| Gráfico de pizza | Pertence ao detalhe. Home é overview. |
| Lista de transações recentes | Pertence ao Fluxo de Caixa. |
| Múltiplos insights | Máximo 1 insight da Domus. |
| Freedom Index completo | Expansível. Home mostra score + nível apenas. |
| Anúncios / upsell | Nunca. |

---

# PARTE 4 — MÓDULOS · WIREFRAMES TEXTUAIS

## 4.1 💰 Finanças (Hub)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Home      Finanças                          [🔍] [···]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Saldo disponível              R$ 9.500                  ││
│  │  Receitas R$ 8.200 · Despesas R$ 4.280                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── MEU DINHEIRO ──────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💳  Contas                          R$ 9.500     →     ││ ← 2 contas · Pessoal
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📊  Fluxo de Caixa                  +R$ 3.920    →     ││ ← Resultado do mês
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🎯  Planejamento                    3 metas      →     ││ ← Metas ativas
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🛡️  Passivos / Dívidas              R$ 22.000    →     ││ ← 2 ativos
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📥  Importações                      12 trans.    →     ││ ← Último mês
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── FERRAMENTAS ───────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🧮  Calculadoras                                       →││ ← Juros, reserva, etc.
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🔮  Simulações                                         →││ ← Cenários financeiros
│  └──────────────────────────────────────────────────────────┘│
```

### Fluxo de Caixa (submódulo)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Finanças   Fluxo de Caixa                  [📅 jul 2026]   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Resultado do mês                                        ││
│  │  +R$ 3.920                                               ││
│  │  Receitas R$ 8.200 · Despesas R$ 4.280                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── GRÁFICO ───────────────────────────────────────────────│
│  │     ▁     ▂     ▃     ▄     ▃     ▅                      ││ ← mini sparkline
│  │    Jan   Fev   Mar   Abr   Mai   Jun   Jul               ││ ← 6 meses
│                                                              │
│  ─── TRANSAÇÕES RECENTES ───────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📥  Salário                      +R$ 8.200    15 jul   ││ ← verde suave
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📤  Aluguel                      -R$ 2.200    10 jul   ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📤  Supermercado                 -R$ 580      08 jul   ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📤  Internet                     -R$ 120      05 jul   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Ver todas as transações                      ││
│  └──────────────────────────────────────────────────────────┘│
```

### Contas (submódulo)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Finanças   Contas                        [+ Adicionar]     │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Saldo em contas · Pessoal                               ││
│  │  R$ 9.500                                                ││
│  │  2 contas · 2 bancos                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  [IT]  Itaú PF                      R$ 8.200      →     ││
│  │        Conta Corrente                                    ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  [NU]  Nubank                       R$ 1.300      →     ││
│  │        Conta Corrente                                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Adicionar conta                            ││
│  └──────────────────────────────────────────────────────────┘│
```

### Planejamento (submódulo)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Finanças   Planejamento                                   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🎯  Metas ativas                        3 de 5          ││
│  │  ▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱  60% concluído            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🏡  Reserva de Emergência              ▰▰▰▰▰▰▱▱  72%  ││
│  │       Meta: R$ 18.000 · Atual: R$ 13.000                 ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🚗  Entrada do Carro                  ▰▰▱▱▱▱▱▱  25%   ││
│  │       Meta: R$ 40.000 · Atual: R$ 10.000                 ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ✈️  Viagem 2027                      ▰▰▰▱▱▱▱▱  38%   ││
│  │       Meta: R$ 8.000 · Atual: R$ 3.000                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Nova meta                                  ││
│  └──────────────────────────────────────────────────────────┘│
```

---

## 4.2 📈 Investir

```
┌──────────────────────────────────────────────────────────────┐
│ ← Home      Investir                        [🔍] [···]       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Patrimônio investido                                    ││
│  │  R$ 15.000                                               ││
│  │  +R$ 420 este mês · Rentabilidade: +2,8%                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CARTEIRA ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🏦  Renda Fixa                     R$ 10.000    ▸      ││ ← Expansível
│  │       +R$ 100/mês · 100% CDI                              ││
│  └──────────────────────────────────────────────────────────┘│
│     ┌────────────────────────────────────────────────────┐   │ ← Expandido
│     │  CDB Banco X                 R$ 6.000      →       │   │
│     │  Tesouro Selic               R$ 4.000      →       │   │
│     └────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📊  FIIs                           R$ 3.000     ▸      ││
│  │       +R$ 120/mês · DY: 0,8%                             ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📈  Ações                          R$ 2.000     ▸      ││
│  │       +R$ 200 este mês                                    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── ANÁLISE ───────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Alocação                                         ▸      ││
│  │  ▰▰▰▰▰▰▰ Renda Fixa 67%  ▰▰ FIIs 20%  ▰ Ações 13%     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Rentabilidade histórica                          ▸      ││
│  │  +11,4% em 12 meses                                      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              + Novo investimento                          ││
│  └──────────────────────────────────────────────────────────┘│
```

---

## 4.3 🤖 Domus (IA)

### Estado Inicial

```
┌──────────────────────────────────────────────────────────────┐
│  Domus                                                       │
│  Pessoal                                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ◈  Domus                                     agora      ││
│  │                                                          ││
│  │  Seu Freedom Index está em 67 pontos.                    ││
│  │  A reserva de emergência é sua principal                 ││
│  │  oportunidade de melhoria agora.                         ││
│  │                                                          ││
│  │  [Entender]              [Criar meta de reserva]         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Perguntas sugeridas:                                    ││
│  │                                                          ││
│  │  ┌─────────────────────┐ ┌─────────────────────────────┐ ││
│  │  │ Como foi meu mês?   │ │ Onde posso economizar?      │ ││
│  │  └─────────────────────┘ └─────────────────────────────┘ ││
│  │  ┌──────────────────────────────────────────────────────┐ ││
│  │  │ Como está minha carteira?                             │ ││
│  │  └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ⌨️  Pergunte sobre suas finanças...                     ││
│  └──────────────────────────────────────────────────────────┘│
```

### FAB — Acesso Rápido

```
┌──────────────────────────────────────────────────────────────┐
│  [conteúdo de qualquer tela]                                 │
│                                                              │
│                                                       [◈]   │ ← FAB 56px
│                                                              │ ← 16px da borda
├──────────────────────────────────────────────────────────────┤
│  Bottom Nav                                                   │
└──────────────────────────────────────────────────────────────┘
```

O FAB da Domus:
- **Sempre visível** (exceto durante teclado aberto)
- **Posição:** canto inferior direito, 16px das bordas
- **Tamanho:** 56px (circular)
- **Cor:** `#00B4D8` (azul FinDomus)
- **Ícone:** BrainCircuit (24px, branco)
- **Ação:** Abre Bottom Sheet com chat da Domus
- **Comportamento:** Sheet ocupa 70% da viewport

---

## 4.4 ☰ Mais

```
┌──────────────────────────────────────────────────────────────┐
│ ← Home      Mais                                             │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │  👤  Anderson Silva                              ▸      ││
│  │       Plano Essencial · Ativo                             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CONFIGURAÇÕES ─────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ⚙️  Preferências                                 ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🔒  Segurança                                    ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  👁  Privacidade                                  ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💎  Planos e assinatura                         ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📚  Academia Financeira                         ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ❓  Ajuda                                        ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📤  Compartilhar app                            ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Sair da conta                                ││
│  └──────────────────────────────────────────────────────────┘│
```

---

# PARTE 5 — COMPONENTES REUTILIZÁVEIS

## 5.1 Card System

```
┌─────────────────────────── CARD TYPES ───────────────────────┐

1. HERO CARD (saldo, patrimônio)
   ┌──────────────────────────────────────────────────────┐
   │  LABEL (10px, tertiary, uppercase)                   │
   │                                                      │
   │  R$ XX.XXX                                           │ ← 36px, 800w
   │                                                      │
   │  contexto · tendência                                │ ← 13px, secondary
   └──────────────────────────────────────────────────────┘
   Background: surface (nível 1)
   Radius: 16px
   Padding: 16px

2. INSIGHT CARD (Domus)
   ┌──────────────────────────────────────────────────────┐
   │ ┃ ◈ Domus                                  agora     │ ← borda azul 2px left
   │ ┃                                                    │
   │ ┃ Observação contextual                               │ ← 13px, secondary
   │ ┃                                                    │
   │ ┃ [CTA]                                              │ ← 13px, azul
   └──────────────────────────────────────────────────────┘

3. LIST ITEM CARD (contas, investimentos, passivos)
   ┌──────────────────────────────────────────────────────┐
   │  [XX] Nome do item                    VALOR    →     │ ← 56px
   │       subtítulo / metadado                           │ ← 12px
   └──────────────────────────────────────────────────────┘
   Touch target: card inteiro
   Gap entre itens: 8px
   Affordance: Raised (nível 2) + borda sutil + chevron

4. ACTION CARD (navegação entre módulos)
   ┌──────────────────────────────────────────────────────┐
   │  Ícone  Nome do Módulo             métrica    →      │ ← 56px
   │         breve descrição                              │ ← 12px (opcional)
   └──────────────────────────────────────────────────────┘

5. PROGRESS CARD (metas, reserva)
   ┌──────────────────────────────────────────────────────┐
   │  🎯 Nome da meta                                     │
   │  ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱  60%                        │
   │  Meta: R$ XX · Atual: R$ YY                          │
   └──────────────────────────────────────────────────────┘

6. METRIC DUAL CARD (KPIs lado a lado)
   ┌──────────────────┐  ┌──────────────────┐
   │  Receitas        │  │  Despesas        │
   │  R$ 8.200        │  │  R$ 4.280        │
   │  ↑ 12%           │  │  ↓ 8%            │
   └──────────────────┘  └──────────────────┘
   Máximo: 2 cards por linha. Nunca 3+ no mobile.
```

## 5.2 Bottom Sheets

```
Tipos de Sheet:
    ├── Modal Sheet (Add/Edit/Delete)
    ├── Chat Sheet (Domus)
    ├── Filter Sheet (filtros)
    ├── Context Sheet (trocar empresa/contexto)
    └── Action Sheet (opções/menu)

Especificações:
    Handle: 32px × 4px, radius 2px, cor text-tertiary
    Altura máxima: 70% da viewport
    Scrim: rgba(0,0,0,0.6)
    Animação: spring, 300ms
    Fechamento: swipe down ou tap no scrim
    Safe area: padding-bottom respeita home indicator
```

## 5.3 FAB (Floating Action Button)

```
Especificações:
    Tamanho: 56px × 56px (circular)
    Cor: #00B4D8
    Ícone: BrainCircuit (24px, branco)
    Sombra: shadow.float (0 4px 12px rgba(0,0,0,0.4))
    Posição: bottom: 100px, right: 16px (acima da Bottom Nav)
    Animação: scale + fade, 200ms ease-out
    Scroll: esconde no scroll-down, mostra no scroll-up
    Teclado: esconde quando teclado abre
```

## 5.4 Accordion (listas expansíveis)

```
┌──────────────────────────────────────────────────────────┐
│  🏦  Renda Fixa                     R$ 10.000    ▾      │ ← Expandido
│       +R$ 100/mês · 100% CDI                              │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │  CDB Banco X                 R$ 6.000      →       │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Tesouro Selic               R$ 4.000      →       │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  📊  FIIs                           R$ 3.000     ▸      │ ← Colapsado
└──────────────────────────────────────────────────────────┘

Regras:
    - Altura do header: 56px
    - Animação: max-height transition, 250ms
    - Ícone: ChevronDown (colapsado) / ChevronUp (expandido)
    - Máximo 3 níveis de nesting
```

## 5.5 KPIs e Valores

```
Formatos:
    Monetário:    R$ 1.245.930,82     (36px hero)
                  R$ 12.450           (28px section)
                  R$ 8.200            (14px list item)

    Percentual:   +12,4%              (positivo, verde)
                  -8,3%               (negativo, vermelho)
                  67 pts              (Freedom Index)

    Tendência:    ↑ +R$ 620           (subida, verde suave)
                  ↓ -R$ 180           (queda, vermelho suave)
                  → estável           (neutro)

Regras:
    - Tabular figures (font-variant-numeric: tabular-nums)
    - Alinhamento à direita para valores
    - Nunca usar verde para saldo positivo inerte
    - Nunca usar vermelho para despesa normal
```

## 5.6 Gráficos

```
Tipos permitidos no Mobile:
    1. Sparkline     — tendência (mini, sem eixos)
    2. Barra simples  — progresso de meta
    3. Donut/Ring     — alocação (máx 5 segmentos)
    4. Linha simples  — evolução temporal (máx 6 pontos)

Proibido no Mobile:
    ❌ Tabela com scroll horizontal
    ❌ Gráfico de barras agrupadas
    ❌ Pizza com 8+ fatias
    ❌ Radar/spider
    ❌ Candlestick
    ❌ 2+ gráficos na mesma viewport

Especificações:
    Altura máxima: 200px
    Cores: paleta FDL (5 cores)
    Tooltip: tap no gráfico, não hover
    Legenda: abaixo do gráfico
    Animações: desabilitadas por padrão (performance)
```

## 5.7 Inputs e Formulários

```
┌──────────────────────────────────────────────────────────┐
│  Label                                           10px    │ ← tertiary, 600w
│  ┌──────────────────────────────────────────────────────┐│
│  │ valor                                             ││ ← 44px, Raised
│  └──────────────────────────────────────────────────────┘│
│  helper text                                     11px    │ ← tertiary
└──────────────────────────────────────────────────────────┘

Financeiro:
┌──────────────────────────────────────────────────────────┐
│  Saldo                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ R$ │ 1.250,00                                     ││ ← prefixo "R$"
│  └──────────────────────────────────────────────────────┘│
│  O saldo é mantido manualmente no FinDomus.              │
└──────────────────────────────────────────────────────────┘

Regras:
    - Label sempre acima (nunca placeholder como label)
    - Altura: 44px (touch target mínimo)
    - Focus: borda azul FinDomus
    - Erro: borda vermelha + helper text abaixo
    - Teclado: numérico para valores financeiros
    - Select: Bottom Sheet com lista (se >5 opções)
```

---

# PARTE 6 — DESIGN SYSTEM MOBILE

## 6.1 Sistema de Cores (Dark Mode · Assinatura FinDomus)

```
Canvas (fundo):         #0A0E14
Surface (cards):        #11161D
Raised (interativos):   #161C26
Floating (FAB, tooltip):#1C2330
Overlay (sheets):       #11161D + scrim rgba(0,0,0,0.6)

Texto primário:         #EDF0F5
Texto secundário:       #8B949E
Texto terciário:        #555D68

Ação primária:          #00B4D8 (azul FinDomus)
Positivo:               #22C55E (verde)
Atenção:                #F59E0B (âmbar)
Negativo:               #EF4444 (vermelho)
Premium:                #C8A951 (dourado)

Borda sutil:            rgba(255,255,255,0.06)
Borda padrão:           rgba(255,255,255,0.10)
Borda ênfase:           rgba(255,255,255,0.20)
```

## 6.2 Tipografia

```
Escala:
    hero:           Inter 36px · 800w · tabular-nums · letter-spacing: -0.5px
    h1:             Inter 24px · 700w
    h2:             Inter 20px · 600w
    section-title:  Inter 16px · 600w
    body:           Inter 15px · 400w · line-height: 1.5
    supporting:     Inter 13px · 400w
    caption:        Inter 11px · 500w · uppercase · letter-spacing: 0.5px
    label:          Inter 10px · 600w · uppercase · letter-spacing: 1px
    button:         Inter 15px · 600w

Regras:
    - Máximo 4 tamanhos simultâneos visíveis
    - Nunca usar ALL CAPS em frases
    - Nunca itálico para texto corrido
    - Nunca fonte menor que 11px
```

## 6.3 Espaçamento (Escala FDL)

```
space.1  =  4px   (ícone ↔ texto, micro-gap)
space.2  =  8px   (elementos internos, gap de lista)
space.3  = 12px   (padding interno compacto)
space.4  = 16px   (padding padrão de card, margem lateral)
space.6  = 24px   (gap entre cards)
space.8  = 32px   (gap entre seções)
space.12 = 48px   (respiro antes de CTAs principais)
space.16 = 64px   (antes da Bottom Nav)

Margem lateral mobile: 16px (todas as resoluções)
```

## 6.4 Grid Mobile

```
Colunas: 4
Margem: 16px cada lado
Gutter: 12px
Largura de coluna: flexível

Uso:
    1 coluna → conteúdo principal (padrão)
    2 colunas → KPIs lado a lado (máx 2)
    3+ colunas → PROIBIDO no mobile
```

## 6.5 Ícones (Lucide)

```
Tamanhos:
    sm: 16px  (chevrons, indicadores)
    md: 20px  (ícones em cards pequenos)
    lg: 24px  (ícones de navegação, header)
    xl: 32px  (empty states, features)

Estilo:
    - Outline (stroke-width: 1.5-2px)
    - Cantos levemente arredondados
    - Cor: text-secondary (padrão), action-primary (ativo/selecionado)
    - Nunca colorir ícones individualmente por módulo
```

## 6.6 Estados e Feedback

```
Estados de superfície:
    Default:   surface (nível 1)
    Hover:     surface.raised (nível 2) — sutil
    Pressed:   scale(0.98) + opacidade 0.9
    Focus:     border-emphasis (azul, 2px)
    Disabled:  opacidade 0.4, text-disabled
    Loading:   skeleton com animate-pulse
    Error:     borda vermelha + helper text
    Success:   sem celebração visual. Feedback sutil.

Microinterações:
    Tap:      escala 0.97, 100ms
    Swipe:    translação + opacidade
    Scroll:   parallax sutil no hero (opcional)
    Refresh:  indicador nativo (pull-to-refresh)
    Toast:    duração mínima 4s, com ação de desfazer quando aplicável
    Haptic:   confirmação tátil para ações destrutivas (delete)
```

## 6.7 Animações

```
Durações:
    micro:  150ms  (hover, press, feedback imediato)
    padrão: 250ms  (transição entre telas, sheets)
    narrativa: 400ms (máximo; onboarding, empty → data)

Curvas:
    ease-out   → abertura de sheets, expansão
    ease-in    → fechamento de sheets
    ease-in-out → transição entre telas

Regras:
    - NUNCA animar só para decorar
    - Sempre respeitar prefers-reduced-motion
    - Sem bounce, sem elastic, sem spring exagerado
    - Loading: skeleton com pulse (nunca spinner gigante)
```

---

# PARTE 7 — ESTADOS GLOBAIS

## 7.1 Empty States

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    [ícone do módulo, 48px]                    │
│                                                              │
│              Nenhum dado encontrado                          │
│                                                              │
│     Descrição contextual do que o usuário pode fazer.        │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Ação principal                │           │
│           └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

## 7.2 Loading

```
Skeleton pattern:
    - 1 bloco hero (2 linhas: larga + curta)
    - 2-3 blocos de lista (ícone + 2 linhas de texto)
    - animate-pulse com opacidade reduzida
    - Cores: surface.raised para o skeleton
    - Nunca spinner de página inteira
```

## 7.3 Error

```
┌──────────────────────────────────────────────────────────────┐
│                    [AlertCircle, 48px, state-negative]        │
│                                                              │
│              Não foi possível carregar                       │
│                                                              │
│     Mensagem orientativa. Nunca expor stack trace.           │
│                                                              │
│           ┌──────────────────────────────────────┐           │
│           │        Tentar novamente              │           │
│           └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘

Erro parcial: Preservar o que carregou. Indicar apenas a seção que falhou.
```

## 7.4 Offline

```
Indicador sutil: badge "Offline" abaixo do status bar.
Dados cacheados: visíveis normalmente.
Ações bloqueadas: desabilitadas (não ocultas), com label "Indisponível offline".
Bottom Nav: 100% funcional.
Domus: mensagem "Preciso de conexão para analisar seus dados."
```

## 7.5 Privacy Mode

```
Valores: mascarados com • (R$ ••••••).
Labels: sempre visíveis.
Nomes: sempre visíveis.
Toggle: acesso rápido no header ou perfil.
```

---

# PARTE 8 — PWA SPECIFICATION

## 8.1 Instalação

```
Manifest:
    name: "FinDomus"
    short_name: "FinDomus"
    theme_color: "#0A0E14"
    background_color: "#0A0E14"
    display: "standalone"
    orientation: "portrait"
    start_url: "/"

Ícones:
    192×192  (Android launcher)
    512×512  (Android splash / PWA install)
    SVG maskable (adaptive icons)

Splash Screen:
    Fundo: #0A0E14
    Logo centralizado (120×120)
    Nome do app abaixo
```

## 8.2 Offline Strategy

```
Estratégia: Cache-first com network update.

Service Worker:
    - Precache: shell (HTML, CSS, JS core)
    - Runtime cache: dados do Firestore (último fetch)
    - Stale-while-revalidate: imagens, fontes
    - Network-first: ações de escrita (Add/Edit/Delete)

Indicadores:
    - Badge "Offline" quando sem conexão
    - Dados cacheados com indicador visual sutil
    - Ações de rede: desabilitadas com feedback
```

## 8.3 Push Notifications

```
Tipos:
    1. Alerta financeiro: "Sua fatura do cartão vence em 3 dias."
    2. Insight Domus: "Sua reserva caiu abaixo de 4 meses."
    3. Meta: "Você atingiu 80% da sua meta de reserva!"
    4. Lembrete: "Hora de registrar suas despesas de hoje."

Regras:
    - Máximo 1 notificação por dia (evitar spam)
    - Silenciosas fora do horário comercial (22h-8h)
    - Com ação direta: toque abre a tela relevante
    - Opt-in no onboarding, configurável em Preferências
```

## 8.4 Atualizações

```
Estratégia: Silenciosa + prompt opcional.

Fluxo:
    1. SW detecta nova versão
    2. Download em background
    3. Notificação sutil: "Nova versão disponível. Atualizar?"
    4. Usuário decide quando aplicar
    5. Nunca forçar atualização durante uso ativo
```

---

# PARTE 9 — ACESSIBILIDADE

## 9.1 Requisitos

```
Touch targets:        ≥ 44×44px (WCAG 2.5.5)
Contraste texto:     AA (4.5:1 para corpo, 3:1 para large text)
Foco visível:        border 2px azul FinDomus
Zoom:                suportar até 200% sem quebra de layout
Reduced motion:      prefers-reduced-motion desabilita animações
Screen reader:       labels semânticos em todos os elementos interativos
```

## 9.2 Uso com uma mão

```
Zona do polegar (destro):
    ┌──────────────────────────────┐
    │        DIFÍCIL               │ ← topo da tela
    │        (header)              │
    ├──────────────────────────────┤
    │        MÉDIO                 │ ← meio da tela
    │        (conteúdo)            │
    ├──────────────────────────────┤
    │        FÁCIL                 │ ← metade inferior
    │        Bottom Nav · FAB      │
    └──────────────────────────────┘

Ações no topo: apenas navegação (← voltar) e título.
Ações principais: metade inferior (FAB, CTA, Bottom Nav).
```

---

# PARTE 10 — ROADMAP DE IMPLEMENTAÇÃO

## Fase 1 — Fundação (PWA Core)

```
1. PWA Shell + Service Worker + Manifest
2. Sistema de navegação (Bottom Nav + Stack)
3. Design System Mobile (cores, tipografia, grid, componentes)
4. Tema Dark/Light/System
5. Safe Areas + Gestos
6. Empty/Loading/Error/Offline states globais
```

## Fase 2 — Home + Domus

```
7. Home Screen (Hero + KPIs + Insight + Próximas + Carteira)
8. Domus: FAB + Chat Sheet + Sugestões
9. Context Switcher (avatar → Bottom Sheet)
```

## Fase 3 — Finanças

```
10. Finanças Hub (cards de acesso aos submódulos)
11. Fluxo de Caixa (sparkline + transações recentes)
12. Contas (lista + Detail + Add/Edit Sheet)
13. Planejamento (metas + progresso)
14. Passivos (lista + Detail)
```

## Fase 4 — Investimentos

```
15. Investir Hub (carteira + rentabilidade)
16. Lista expansível (Renda Fixa, FIIs, Ações)
17. Detalhe do ativo
18. Alocação (gráfico donut)
```

## Fase 5 — Perfil + Configurações

```
19. Mais (menu de configurações)
20. Perfil (dados do usuário)
21. Preferências (tema, moeda, notificações)
22. Planos e assinatura
23. Academia Financeira
```

## Fase 6 — Polimento

```
24. Importações Mobile
25. Push Notifications
26. Offline completo (cache inteligente)
27. Animações e microinterações
28. Testes de acessibilidade
29. Performance audit (Lighthouse PWA 100)
```

---

# PARTE 11 — PRINCÍPIOS FINAIS

```
1.  MOBILE FIRST — não é adaptação, é produto novo.
2.  POLEGAR PRIMEIRO — ações na metade inferior.
3.  ZERO POLUIÇÃO — cada tela responde 1 pergunta.
4.  DOMUS SEMPRE PRESENTE — FAB persistente.
5.  OFFLINE FIRST — o app funciona sem internet.
6.  CALMA ESCURA — fundo escuro acolhe, azul guia.
7.  PROFUNDIDADE PROGRESSIVA — superfície → detalhe → ação.
8.  CONSISTÊNCIA ABSOLUTA — mesmo padrão em todos os módulos.
9.  ACESSIBILIDADE — uso com uma mão, contraste, screen reader.
10. PREMIUM SEM OSTENTAÇÃO — qualidade nos detalhes, não em badges.
```

---

*FinDomus Mobile PWA Design v1 · Aguardando homologação*

---

## Apêndice: Diferenças Desktop → Mobile

| Desktop | Mobile |
|---------|--------|
| 3-4 KPI cards lado a lado | 1 Hero + 1 Dual Card |
| Tabelas com 5+ colunas | Lista de cards |
| Sidebar com 15 itens | Bottom Nav com 5 destinos |
| Gráficos grandes e detalhados | Sparklines + donuts simples |
| Filtros avançados | Chips rápidos + Sheet |
| Modais centrais | Bottom Sheets |
| Drag and drop | Swipe actions |
| Exportação | Compartilhar nativo |
| Múltiplas abas | Accordion + Drill-down |
| Breadcrumbs | ← Header com back |
| Context Switcher proeminente | Avatar → Bottom Sheet |
