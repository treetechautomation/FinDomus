import { getDashboardSummary } from '../src/ai/tools/get-dashboard-summary';

const ANDERSON_UID = 'NRQYH7BbZXb1USX6GxtJqItNDUF3';

async function testTool() {
  console.log('--- Testando AI Tool: get_dashboard_summary ---');
  console.log(`UID Alvo: ${ANDERSON_UID}\n`);

  try {
    const summary = await getDashboardSummary(ANDERSON_UID);
    console.log('✅ Resumo obtido com sucesso:');
    console.log(JSON.stringify(summary, null, 2));
  } catch (error: any) {
    console.error('❌ Erro no teste da tool:', error.message);
  }
}

testTool();
