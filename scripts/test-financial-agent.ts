import { runFinancialAgent } from '../src/ai/agents/financial-agent';

const ANDERSON_UID = 'NRQYH7BbZXb1USX6GxtJqItNDUF3';

async function testAgent() {
  console.log('--- Testando Financial Agent: "Onde estou gastando mais no PJ?" ---');
  console.log(`UID: ${ANDERSON_UID}\n`);

  try {
    const response = await runFinancialAgent(ANDERSON_UID, 'Onde estou gastando mais no PJ?');
    
    console.log('\n--- RESPOSTA DO AGENTE ---');
    console.log(response.answer);
    
    console.log('\n--- METADADOS ---');
    console.log(`Tools Utilizadas: ${response.toolsUsed.join(', ')}`);
    console.log(`Tamanho do Contexto: ${response.contextSize} caracteres`);
    
  } catch (error: any) {
    console.error('❌ Erro no teste do agente:', error.message);
  }
}

testAgent();
