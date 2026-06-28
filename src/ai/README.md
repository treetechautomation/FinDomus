# Arquitetura e Integração de IA — FinDomus

Esta documentação detalha a estrutura de Inteligência Artificial do FinDomus, especificando o papel de cada arquivo e como os fluxos e provedores de IA estão configurados.

---

## 1. Organização de Arquivos (`src/ai/`)

O diretório de IA está estruturado da seguinte forma:

```
src/ai/
├── README.md               # Esta documentação
├── genkit.ts               # Inicialização central do Genkit com Gemini 2.5 Flash
│
├── agents/                 # Agentes inteligentes orquestradores (Genkit / LLM)
│   ├── index.ts            # Exposição dos agentes
│   └── financial-agent.ts  # Agente financeiro central (Tool Calling + Síntese)
│
├── flows/                  # Fluxos de IA definidos via Genkit (tipagem forte)
│   ├── classify-pix.ts     # Fluxo para classificar transferências PIX
│   └── extract-transactions-from-document.ts  # Extração multimodal de PDF/Imagens
│
├── providers/              # Abstração de LLMs (Routers de IA)
│   ├── index.ts            # Router central (aiChat)
│   └── gemini.ts           # Integração oficial do Gemini 2.5 Flash (via Genkit)
│
└── tools/                  # Ferramentas (Tools) que a IA pode invocar
    ├── index.ts            # Registro geral de tools
    ├── get-dashboard-summary.ts  # Tool para pegar patrimônio e saldos
    └── get-transactions.ts # Tool para puxar lista de transações reais
```

---

## 2. Tecnologias Utilizadas

1. **Google Genkit**: Framework oficial da Google para desenvolvimento de aplicações alimentadas por IA (TypeScript). Facilita o controle de fluxos (`defineFlow`), prompts (`definePrompt`) e forte validação de schemas de entrada e saída via `zod`.
2. **Gemini 2.5 Flash**: Modelo de linguagem multimodal oficial e único utilizado para classificação, processamento multimodal (PDFs/Imagens), agente e síntese de relatórios no FinDomus.

---

## 3. Fluxos de IA e Motores do FinDomus

### 3a. Classificação de PIX (`classifyPix`)
- **Arquivo**: [classify-pix.ts](file:///var/www/findomus/src/ai/flows/classify-pix.ts)
- **Como funciona**: Classifica transações PIX recebidas em tempo real como `income` (receita) ou `transfer` (movimentação interna) baseado no texto e valor.
- **Entrada**: `{ text: string, amount: number }`
- **Saída**: `{ type: 'income' | 'transfer', confidence: number, reason: string }`

### 3b. Extração de Comprovantes/Faturas (`extractTransactionsFromDocument`)
- **Arquivo**: [extract-transactions-from-document.ts](file:///var/www/findomus/src/ai/flows/extract-transactions-from-document.ts)
- **Como funciona**: Processa documentos multimodais (PDFs, imagens) convertidos em Data URIs Base64 e extrai um array estruturado contendo data, valor (negativo para despesa, positivo para receita), descrição, categoria sugerida e se é parcelado.
- **Entrada**: `{ documentDataUri: string }`
- **Saída**: `ExtractedTransaction[]`

### 3c. Agente Financeiro Orquestrador (`runFinancialAgent`)
- **Arquivo**: [financial-agent.ts](file:///var/www/findomus/src/ai/agents/financial-agent.ts)
- **Como funciona**: Orquestrador com seleção dinâmica de ferramentas e síntese final em três fases:
  1. **Tool Selection**: A IA analisa a pergunta do usuário e decide se precisa invocar ferramentas (`get_dashboard_summary`, `get_transactions`).
  2. **Tool Execution**: O sistema executa as funções no Firestore com base nas permissões e ID do usuário logado.
  3. **Synthesis**: O Gemini sintetiza a resposta final com dados consolidados e reais.

---

## 4. Segurança e Limites (Cotas de IA)

Para evitar abuso de custos de chamadas de LLM, todas as APIs públicas de IA estão protegidas:
1. **Autenticação**: Validação obrigatória de Firebase Auth ID Token (`verifyIdToken`).
2. **Cotas de Uso**: Execução condicionada a `canUseAIAdmin(userId)` (bloqueia o uso caso o limite do plano seja excedido) e registro posterior em `registerAIUsageAdmin(userId)`.
