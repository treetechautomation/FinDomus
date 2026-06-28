import { aiChat } from '../providers';
import { getDashboardSummary, getTransactions } from '../tools';

export type AgentResponse = {
  answer: string;
  toolsUsed: string[];
  contextSize: number;
};

/**
 * Agente Financeiro Inteligente - Orquestrador de Tools e LLM
 */
export async function runFinancialAgent(userId: string, userQuery: string): Promise<AgentResponse> {
  if (!userId) throw new Error('userId é obrigatório para o agente.');

  console.log(`[AGENT] Analisando query: "${userQuery}"`);

  // --- FASE 1: Seleção de Ferramentas (Tool Selection) ---
  const toolSelectionPrompt = `
    Você é um seletor de ferramentas financeiras. 
    Analise a pergunta do usuário e decida quais ferramentas você precisa para responder.
    
    FERRAMENTAS DISPONÍVEIS:
    1. get_dashboard_summary: Retorna o patrimônio total, saldos PF/PJ e resumo mensal (receitas/despesas).
    2. get_transactions: Retorna a lista detalhada de transações recentes. Permite filtrar por owner (PF/PJ), monthKey, type ou category.

    REGRAS:
    - Responda APENAS com uma lista separada por vírgula dos nomes das ferramentas necessárias.
    - Se a pergunta for geral, use ambas.
    - Se for sobre gastos específicos ou categorias, você PRECISA de get_transactions.
    - Se for sobre saldo total ou situação geral, use get_dashboard_summary.

    PERGUNTA DO USUÁRIO: "${userQuery}"
  `;

  const selectedToolsRaw = await aiChat('gemini', toolSelectionPrompt);
  const toolsToUse = selectedToolsRaw.toLowerCase().split(',').map(t => t.trim());
  const toolsUsed: string[] = [];

  // --- FASE 2: Execução de Ferramentas (Tool Execution) ---
  let contextData: any = {};

  if (toolsToUse.includes('get_dashboard_summary')) {
    console.log('[AGENT] Executando get_dashboard_summary...');
    contextData.dashboard = await getDashboardSummary(userId);
    toolsUsed.push('get_dashboard_summary');
  }

  if (toolsToUse.includes('get_transactions')) {
    console.log('[AGENT] Executando get_transactions...');
    // Tentativa inteligente de extrair filtros básicos
    const owner = userQuery.toUpperCase().includes('PJ') ? 'PJ' : userQuery.toUpperCase().includes('PF') ? 'PF' : undefined;
    
    contextData.transactions = await getTransactions({ 
      userId, 
      owner,
      limit: 20 
    });
    toolsUsed.push('get_transactions');
  }

  // --- FASE 3: Síntese Final (Synthesis) ---
  const synthesisPrompt = `
    Você é o Cérebro Financeiro do FinDomus. 
    Sua missão é analisar os dados reais do usuário e fornecer uma resposta estratégica, clara e profissional.

    DADOS RECUPERADOS:
    ${JSON.stringify(contextData, null, 2)}

    PERGUNTA DO USUÁRIO:
    "${userQuery}"

    REGRAS DE RESPOSTA:
    - Responda em Português do Brasil.
    - Seja direto e use números reais dos dados.
    - Se houver prejuízo ou gastos altos, aponte-os.
    - Nunca invente transações que não estão nos dados.
    - Mantenha um tom de consultor de Wealth Management.
  `;

  const finalAnswer = await aiChat('gemini', synthesisPrompt);

  return {
    answer: finalAnswer,
    toolsUsed,
    contextSize: JSON.stringify(contextData).length
  };
}
