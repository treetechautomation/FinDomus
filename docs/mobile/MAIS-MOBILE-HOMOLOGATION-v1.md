# FINDOMUS MOBILE PWA — MAIS (HUB) MODULE HOMOLOGATION v1

**Fase:** M0.9 — Homologação do Módulo Mais
**FDL:** 1.0 FROZEN
**PWA Design:** v1 homologado
**Home / Dashboard / Fluxo / Contas / Planejamento / Investimentos / FI / Domus:** v1 homologados
**Viewport primário:** 390 × 844px
**Status:** PRONTO PARA HOMOLOGAÇÃO

---

# 1. OBJETIVO DO MÓDULO MAIS

O módulo Mais responde a **uma pergunta de descoberta**:

```text
"Que outras ferramentas estão disponíveis para mim?"
```

Não é uma tela de configurações. Não é um menu. É o **Hub Inteligente de Recursos** — organiza ferramentas complementares, destaca funcionalidades não utilizadas, mostra progresso na Academia e recomenda ações via Domus.

## Posicionamento no ecossistema

| Tela | Pergunta | Frequência |
|------|----------|:----------:|
| Home | "Como estou?" | 5-10×/dia |
| Mais | **"O que mais posso fazer?"** | **1-2×/semana** |

É o destino de menor frequência — e por isso mesmo precisa ser organizado e memorável quando acessado.

---

# 2. FLUXO DO USUÁRIO

```
USUÁRIO ABRE "MAIS"
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ 1. VÊ SEU PERFIL + FREEDOM INDEX                          │
│    → "Anderson · Plano Essencial · 67 pts"               │
│                                                          │
│ 2. VÊ RECOMENDAÇÕES DA DOMUS (se houver)                  │
│    → "Você ainda não configurou categorias automáticas." │
│                                                          │
│ 3. NAVEGA PELAS SEÇÕES                                    │
│    → Minha Conta, Empresas, Ferramentas, Academia        │
│                                                          │
│ 4. BUSCA ALGO ESPECÍFICO                                  │
│    → Campo de busca: "categorias" → resultado            │
│                                                          │
│ 5. EXPLORA NOVIDADES                                      │
│    → "Novo: Simulador de aposentadoria"                  │
└──────────────────────────────────────────────────────────┘
```

---

# 3. WIREFRAME TEXTUAL COMPLETO

## 3.1 Viewport: 390 × 844px

```
┌──────────────────────────────────────────────────────────────┐
│                      STATUS BAR                    54px       │
├──────────────────────────────────────────────────────────────┤
│ ← Home      Mais                             [🔍] [···]     │ ← Header 48px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Perfil ~80px
│  │  ┌────┐                                                 ││
│  │  │ 👤 │  Anderson Silva                          ▸     ││ ← 48px avatar
│  │  └────┘  Plano Essencial · Ativo                         ││
│  │                                                          ││
│  │  🛡️ Freedom Index · 67 pts · Construção          ▸     ││ ← atalho FI
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← Domus Rec ~60px
│  │ ┃ ◈ Domus                                               ││
│  │ ┃ Você ainda não configurou categorias           ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── MINHA CONTA ───────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 56px cada
│  │  ⚙️  Configurações                               ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🔒  Segurança e privacidade                     ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💎  Planos e assinatura                         ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🔔  Notificações                                ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── CONTEXTO ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← badge "2"
│  │  👥  Família                               2 membros ▸  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🏢  Empresas                       TreeTech + 3 mais ▸ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── FERRAMENTAS ───────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  📥  Importações                           12 trans. ▸  ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🏷️  Categorias e tags                          ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  🧮  Calculadoras financeiras                   ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│ ← badge "NOVO"
│  │  🔮  Simuladores                              NOVO  ▸  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── ACADEMIA ──────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│ ← 68px
│  │  📚  Academia Financeira                                 ││
│  │       Liberdade Financeira · Aula 4 de 8 · 50%   ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ─── SUPORTE ───────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ❓  Central de ajuda                            ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  💬  Enviar feedback                            ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ℹ️  Sobre o FinDomus                            ▸     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ← 64px espaço →                                             │
├──────────────────────────────────────────────────────────────┤
│  ⌂         💰         📈         ◈         ☰                 │ ← Bottom Nav
│ Início   Finanças   Investir   Domus     Mais                │
│                                                  [ATIVO]     │
└──────────────────────────────────────────────────────────────┘
```

---

# 4. COMPONENTES

## 4.1 Header

```
┌──────────────────────────────────────────────────────────────┐
│ ← Home      Mais                             [🔍] [···]     │
└──────────────────────────────────────────────────────────────┘
```

| Ícone | Ação |
|:-----:|------|
| 🔍 | Busca global (módulos, ferramentas, configurações) |
| ··· | Menu: compartilhar app, avaliar na loja |

## 4.2 Perfil Card

```
┌──────────────────────────────────────────────────────────┐
│  ┌────┐                                                 │
│  │ 👤 │  Anderson Silva                          ▸     │
│  └────┘  Plano Essencial · Ativo                         │
│                                                          │
│  🛡️ Freedom Index · 67 pts · Construção          ▸     │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Superfície | `surface` |
| Altura | ~80px |
| Avatar | 48px circular. Foto ou iniciais. Touch abre Perfil completo. |
| Nome | 16px · 600w · text-primary |
| Plano | 12px · text-secondary · "Plano X · Status" |
| Freedom Index | 13px · 500w · `action-primary` · Atalho para tela FI |
| Touch | Card inteiro → Perfil completo. Toque no FI → tela Freedom Index. |

## 4.3 Domus — Recomendação de features

```
┌──────────────────────────────────────────────────────────┐
│ ┃ ◈ Domus                                               │
│ ┃ Você ainda não configurou categorias           ▸     │
└──────────────────────────────────────────────────────────┘
```

| Insight | Gatilho |
|---------|---------|
| "Você ainda não configurou categorias." | 0 categorias personalizadas |
| "X funcionalidades Premium disponíveis." | Plano Essencial com recursos bloqueados |
| "Você tem 3 importações pendentes." | Importações não finalizadas |
| "Sua Academia está em 50%." | Progresso na Academia |
| "Novo: Simulador de aposentadoria." | Feature lançada recentemente |

## 4.4 Seções e Itens

```
─── MINHA CONTA ───────────────────────────────────────────
┌──────────────────────────────────────────────────────────┐
│  ⚙️  Configurações                               ▸     │ ← 56px Standard
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  🔒  Segurança e privacidade                     ▸     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  💎  Planos e assinatura                         ▸     │
│       Plano Essencial · 3 de 5 recursos Premium         │ ← 12px opcional
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Section label | 10px · tertiary · uppercase · 12px gap acima |
| Item altura | 56px (Standard) |
| Ícone | 24px Lucide, text-secondary |
| Nome | 14px · 600w · text-primary |
| Meta info | 12px · 400w · text-secondary (opcional, linha 2) |
| Badge | "NOVO", "2", "Premium" — chips de 18px altura |
| Touch | Card inteiro → navega para a feature |

### Seções e ordem

| # | Seção | Itens | Badges possíveis |
|:-:|-------|-------|-----------------|
| 1 | **Minha Conta** | Configurações, Segurança, Planos, Notificações | "Premium" |
| 2 | **Contexto** | Família, Empresas | Contagem de membros/empresas |
| 3 | **Ferramentas** | Importações, Categorias, Calculadoras, Simuladores | "NOVO", contagem de transações |
| 4 | **Academia** | Academia Financeira | Progresso |
| 5 | **Suporte** | Ajuda, Feedback, Sobre | — |

## 4.5 Academia — Item com progresso

```
┌──────────────────────────────────────────────────────────┐
│  📚  Academia Financeira                                 │ ← 68px
│       Liberdade Financeira · Aula 4 de 8 · 50%   ▸     │
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Altura | 68px (com descrição) |
| Ícone | 24px |
| Nome | 14px · 600w |
| Linha 2 | Trilha atual · Aula · Percentual · 12px · text-secondary |
| Touch | Navega para Academia |

## 4.6 Busca Global

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐│
│  │ 🔍  categ                                            ││ ← 44px, autofoco
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  CONFIGURAÇÕES                                            │
│  ┌──────────────────────────────────────────────────────┐│
│  │  🏷️  Categorias e tags                       ▸     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ACADEMIA                                                 │
│  ┌──────────────────────────────────────────────────────┐│
│  │  📚  Aula: Como categorizar despesas          ▸     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  DOMUS                                                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │  ◈  Perguntar sobre categorias                ▸     ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

| Parâmetro | Valor |
|-----------|-------|
| Escopo | Global: ferramentas, configurações, academia, domus |
| Resultados | Agrupados por seção |
| Tempo | Instantâneo (índice local) |
| Vazio | "Nenhum resultado para 'termo'. Tente outro termo." |

---

# 5. HIERARQUIA

```
1. PERFIL + FREEDOM INDEX   ← "Quem sou? Como estou?"
   Topo da tela. Conexão pessoal + métrica principal.

2. DOMUS (recomendações)    ← "O que devo descobrir?"
   Features não usadas, novidades, progresso pendente.

3. MINHA CONTA              ← "Onde gerencio minha conta?"
   Configurações, segurança, plano.

4. CONTEXTO                 ← "Família e empresas."
   Gerenciamento de múltiplos contextos.

5. FERRAMENTAS              ← "O que mais posso fazer?"
   Importações, categorias, calculadoras.

6. ACADEMIA                 ← "Como estou aprendendo?"
   Progresso educacional.

7. SUPORTE                  ← "Preciso de ajuda?"
   Ajuda, feedback, sobre.
```

---

# 6. MICROINTERAÇÕES

| Gesto | Alvo | Ação |
|-------|------|------|
| Tap | Item de seção | Navega para feature |
| Tap | Perfil | Abre Perfil completo |
| Tap | Freedom Index | Navega para tela FI |
| Tap | 🔍 | Abre busca global |
| Pull-to-refresh | Tela | Atualiza progresso da Academia, badges |

---

# 7. ESTADOS

## 7.1 Plano gratuito

Badge "Premium" em itens bloqueados. Touch abre Sheet explicando o benefício e CTA "Ver planos". Sem bloqueio agressivo.

## 7.2 Sem empresas

Seção "Contexto" mostra apenas Família (se configurada) ou não aparece. Botão "Adicionar empresa" no final da seção.

## 7.3 Sem Academia

Seção mostra "Começar Academia" como CTA. Sem progresso.

## 7.4 Offline

Dados de perfil e Freedom Index cacheados. Itens navegáveis (telas estáticas). Ações que exigem rede: desabilitadas.

## 7.5 Loading

Skeleton: perfil (avatar + 2 linhas) + 6 ghost rows de seção.

---

# 8. DOMUS CONTEXTUAL

Além do card de recomendação no topo, a Domus pode aparecer contextualmente:

| Contexto | Insight |
|----------|---------|
| Usuário com muitas importações pendentes | "Você tem 3 importações aguardando revisão." |
| Plano Essencial próximo do limite | "Seu plano está com 82% de uso." |
| Feature Premium não experimentada | "O simulador de aposentadoria está disponível." |

---

# 9. ACESSIBILIDADE

| Requisito | Status |
|-----------|:------:|
| Touch targets ≥ 44px | ✅ Itens (56px), avatar (48px) |
| Contraste AA | ✅ |
| Screen reader | ✅ "Minha Conta, Configurações. Planos e assinatura, Plano Essencial." |
| Dynamic Type | ✅ |
| Dark + Light | ✅ |
| Uso com uma mão | ✅ Seções superiores alcançáveis |

---

# 10. CHECKLIST DE HOMOLOGAÇÃO

## Design

- [ ] Perfil: avatar + nome + plano + Freedom Index (atalho)
- [ ] Domus: recomendação de features não utilizadas
- [ ] 5 seções: Minha Conta, Contexto, Ferramentas, Academia, Suporte
- [ ] Itens padrão: 56px com ícone, nome, meta info opcional
- [ ] Badges: "NOVO", "Premium", contagem
- [ ] Academia: item de 68px com progresso
- [ ] Busca global: resultados agrupados por seção
- [ ] Componentes reutilizados: Insight Card, List Item
- [ ] FDL 1.0

## Estados

- [ ] Loading: skeleton (perfil + 6 rows)
- [ ] Plano gratuito: itens Premium com badge + explicação
- [ ] Sem empresas/família: seção adaptada
- [ ] Offline: dados cacheados

## Acessibilidade

- [ ] Touch targets ≥ 44px
- [ ] Contraste AA
- [ ] Screen reader
- [ ] Dark + Light

---

# 11. DECISÕES TOMADAS

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Estrutura | Seções agrupadas (não lista plana) | Organização. Escaneável. |
| Perfil no topo | Com Freedom Index como atalho | Conexão pessoal + métrica principal. |
| Domus | Recomendação de features | Superfície de descoberta. |
| Busca | Global (não apenas no Mais) | Acesso rápido a qualquer funcionalidade. |
| Badges | "NOVO", "Premium", contagem | Informação sem poluição. |
| Academia | Item expandido com progresso | Incentiva engajamento educacional. |
| Tom | Hub de recursos, não configurações | Diferenciado de apps tradicionais. |

---

*FinDomus Mais (Hub) Mobile Homologation v1 · Fase M0.9 · PRONTO PARA HOMOLOGAÇÃO*
