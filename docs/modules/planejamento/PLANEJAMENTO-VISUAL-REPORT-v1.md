# PLANEJAMENTO MOBILE MASTER VISUAL v1 — RELATÓRIO

**Fase:** 12 — Master Visual do Módulo Planejamento
**FDL:** 1.0 FROZEN
**Arquivo:** `docs/modules/planejamento/PLANEJAMENTO-MASTER-VISUAL-v1.html`
**Viewport:** 390 × 844px · Dark Mode · PF · Agosto 2026

---

## 1. RESUMO EXECUTIVO

O Master Visual do Planejamento Mobile materializa a arquitetura e o wireframe homologados em uma referência visual fiel ao FDL 1.0. O protótipo HTML contém 10 estados navegáveis e prova que o módulo funciona como experiência FinDomus — não como dashboard, planilha ou app genérico de orçamento.

A nomenclatura "Estratégia" substitui "Metas" em toda a interface. Os 3 KPIs são exibidos em superfície unificada. O orçamento usa cards verticais com barras finas. A estratégia é apresentada como barras horizontais com cores dos pilares. A Domus está presente como ação contextual no header. Nenhum emoji, badge de IA ou glow foi usado.

---

## 2. ESTADOS IMPLEMENTADOS

| # | Estado | Descrição |
|---|--------|-----------|
| 1 | **Visão Geral** | Summary + 3 KPIs unificados + Insight Domus + Recomendações + Simular cenário |
| 2 | **Orçamento** | Resumo do mês + 6 budget cards verticais com barras de progresso |
| 3 | **Estratégia** | 6 barras horizontais com cores dos pilares + Total 100% + Ações |
| 4 | **Editar Estratégia** | Accordion de pilares + Slider + Cores + Categorias vinculadas |
| 5 | **Detalhe do Pilar** | Alocação + Teto + Gasto + Categorias + Transações do mês |
| 6 | **Simulação** | Chips de tipo + Slider de parâmetro + Comparison (atual vs simulado) |
| 7 | **Primeiro acesso** | Empty state: "Você ainda não definiu sua estratégia" |
| 8 | **Privacidade** | Valores mascarados (R$ ••••••), análise qualitativa preservada |
| 9 | **Erro parcial** | Summary + KPIs preservados. Banner de erro apenas no bloco afetado |
| 10 | **Offline** | Banner informativo + dados cacheados. Ações desabilitadas. |

---

## 3. FDL COMPLIANCE

| Regra FDL | Aplicação | Status |
|-----------|-----------|:------:|
| Canvas `#0A0E14` | Background da tela | ✅ |
| Surface `#11161D` | Summary, KPIs, Insight, Budget cards, Strategy bars, Detail blocks | ✅ |
| Raised `#161C26` | Chips, Recomendações, Edit accordion, Input areas | ✅ |
| text-primary `#EDF0F5` | Títulos, números, nomes de pilares | ✅ |
| text-secondary `#8B949E` | Corpo de texto, descrições | ✅ |
| text-tertiary `#555D68` | Labels, metadados, freshness | ✅ |
| Azul `#00B4D8` | Tabs active, Insight borda, CTAs, Domus icon, send button | ✅ (~4% área) |
| Verde `#22C55E` | Status "Dentro", valores positivos, total 100% | ✅ |
| Vermelho `#EF4444` | Status "Acima", valores excedidos, erro banner | ✅ (<2% área) |
| Amarelo `#F59E0B` | Badge "Alta", offline banner, atenção | ✅ |
| Surface sem sombra | Todos os cards | ✅ |
| Radius MD 16px | Cards, blocos de detalhe | ✅ |
| Radius SM 8px | Chips, tabs, botões | ✅ |
| Inter font | Tipografia | ✅ |
| Tabular numbers | Valores financeiros e percentuais | ✅ |
| Touch ≥44px | Tabs, botões, ícones de header | ✅ |
| 36px financial-hero | NÃO usado — nenhum valor justifica protagonismo absoluto | ✅ |
| Sem emojis | Zero emojis em toda a interface | ✅ |
| Sem badge IA | Nenhuma exposição de provedor | ✅ |
| Sem avatar robô | Nenhum avatar antropomórfico | ✅ |

---

## 4. PALETA DE PILARES

As cores dos 6 pilares vêm do WealthProfile (`wealth-engine.ts`). São usadas APENAS nas barras horizontais da Estratégia e como indicadores de cor no editor. Não pintam cards inteiros, não decoram ícones, não competem com a semântica de estado (verde/vermelho/amarelo).

| Pilar | Cor | Hex |
|-------|-----|-----|
| Essenciais | Azul claro | `#38bdf8` |
| Qualidade de vida | Verde | `#34d399` |
| Construção patrimonial | Amarelo | `#facc15` |
| Estilo de vida | Roxo | `#e879f9` |
| Independência financeira | Azul | `#60a5fa` |
| Capital intelectual | Laranja | `#fb923c` |

**Decisão sobre cores:** Mantidas as cores do WealthProfile. Elas são funcionais (o usuário as personaliza) e oferecem diferenciação visual entre pilares sem poluição — aparecem apenas como barras finas de 6px. O FDL proíbe "carnaval cromático", mas estas cores não decoram — identificam.

---

## 5. TIPOGRAFIA

| Uso | Tamanho | Peso | Token FDL |
|-----|:-------:|:----:|-----------|
| Título do módulo | 16px | 600 | heading-3 |
| Nome da tab ativa | 13px | 600 | — |
| Valor de KPI | 20px | 700 | (entre heading-2 e heading-3) |
| Nome de pilar | 14px | 600 | — |
| Percentual de pilar | 14px | 700 | — |
| Corpo de texto | 13px | 400 | supporting |
| Labels/captions | 10px | 600 | caption |

**Nota:** O valor 20px para KPIs não existe na escala FDL (que tem 16px heading-3 e 20px heading-2). 20px é usado como `heading-2` do FDL. Consistente.

---

## 6. COLOR BUDGET APROXIMADO

| Cor | % da tela |
|-----|:--------:|
| Canvas (`#0A0E14`) | ~55% |
| Surface (`#11161D`) | ~20% |
| Raised (`#161C26`) | ~18% |
| Azul (`#00B4D8`) | ~4% |
| Verde (`#22C55E`) | ~1% |
| Vermelho (`#EF4444`) | <1% |
| Amarelo (`#F59E0B`) | <1% |
| Cores de pilares (barras) | <1% |

---

## 7. TESTES DE IDENTIDADE

| Teste | Resultado |
|-------|:---------:|
| **Sem nome:** Remover "FinDomus" → ainda parece FinDomus? | ✅ Sim. Canvas escuro, tipografia Inter, spacing FDL, bordas sutis. |
| **Sem azul:** Remover azul → ainda reconhecível? | ✅ Sim. Estrutura sobrevive. |
| **Fintech genérica:** Trocar nome por banco → parece banco? | ✅ Não. Sem branding bancário. Sem cores institucionais. |
| **Dashboard:** Visão Geral parece dashboard? | ✅ Não. 1 superfície com 3 métricas, não grade de KPIs. |
| **Planilha:** Orçamento parece Excel? | ✅ Não. Cards verticais com barras, não tabela. |
| **Metas:** Estratégia parece goal tracking? | ✅ Não. Barras de distribuição percentual, sem target/date. |
| **Investimentos:** Estratégia parece asset allocation? | ✅ Não. É distribuição de renda, não alocação de carteira. |
| **Calculadora:** Simulação parece app isolado? | ✅ Não. Mantém header, contexto e Bottom Nav do Planejamento. |

---

## 8. TESTES 5 SEGUNDOS

| Tela | Percepção em 5s |
|------|----------------|
| **Visão Geral** | "Planejamento · agosto 2026 · R$ 6.200 receita · R$ 1.920 saldo · estratégia em 6 pilares" |
| **Orçamento** | "6 categorias · 4 dentro do teto · 1 acima (Estilo de vida) · barras de progresso" |
| **Estratégia** | "6 barras coloridas · Essenciais 30% é a maior · total 100% · posso ajustar" |
| **Simulação** | "Aporte de R$ 1.000/mês · comparação antes/depois · +7 pontos no índice" |

---

## 9. CONSISTÊNCIA MATEMÁTICA

```
Receita:  R$ 6.200
Despesas: R$ 4.280
Saldo:    R$ 1.920  ← 6.200 − 4.280 = 1.920 ✅

Orçamento:
  Essenciais:              teto R$ 1.860 → 6.200 × 30% = 1.860 ✅
  Qualidade de vida:       teto R$ 620   → 6.200 × 10% = 620   ✅
  Construção patrimonial:  teto R$ 1.240 → 6.200 × 20% = 1.240 ✅
  Estilo de vida:          teto R$ 620   → 6.200 × 10% = 620   ✅
  Independência financeira: teto R$ 1.550 → 6.200 × 25% = 1.550 ✅
  Capital intelectual:     teto R$ 310   → 6.200 × 5%  = 310   ✅

Estratégia:
  30 + 10 + 20 + 10 + 25 + 5 = 100% ✅
```

---

## 10. VIEWPORT VALIDATION

| Viewport | Resultado |
|----------|:---------:|
| **375 × 812** | Tabs cabem (3 × ~115px). KPIs em 3 colunas apertadas mas legíveis. Budget cards funcionam. Barras de estratégia OK. |
| **390 × 844** | Referência. Todos elementos com respiro confortável. |
| **430 × 932** | Mais espaço horizontal. Sem alteração estrutural. |

---

## 11. ACHADOS

| ID | Descrição | Classificação |
|----|-----------|:------------:|
| — | Nenhum achado bloqueador | — |

**PLANNING-VISUAL-P0: 0 · PLANNING-VISUAL-P1: 0 · PLANNING-VISUAL-P2: 1 · PLANNING-VISUAL-P3: 1**

### P2

| ID | Descrição |
|----|-----------|
| P2-01 | 6 cores de pilares nas barras: funcionais mas precisam ser validadas em light mode. |

### P3

| ID | Descrição |
|----|-----------|
| P3-01 | Google Fonts CDN para Inter (protótipo). Produção usará font local/self-hosted. |

---

## 12. CHANGE REQUESTS

Nenhum change request novo. O visual é compatível com FDL 1.0, Planejamento Architecture v1 e Planejamento Wireframe v1.

---

## 13. RECOMENDAÇÃO FINAL

O Planejamento Mobile Master Visual está pronto para homologação. O protótipo prova que o módulo funciona como experiência FinDomus — controle, clareza e direção, sem parecer dashboard, planilha, metas ou calculadora.

**Próximo módulo:** Após homologação visual do Planejamento, seguir para o próximo módulo na sequência do projeto.

---

*Planejamento Mobile Master Visual v1 · Fase 12 concluída · Aguardando homologação*
