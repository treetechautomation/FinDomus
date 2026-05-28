import { getTransactions } from '../src/ai/tools/get-transactions';

const ANDERSON_UID = 'NRQYH7BbZXb1USX6GxtJqItNDUF3';

async function testTool() {
  console.log('--- Testando AI Tool: get_transactions ---');
  console.log(`UID Alvo: ${ANDERSON_UID}\n`);

  try {
    // Teste 1: Buscar últimas 5 transações PJ
    console.log('🔍 Teste 1: Últimas 5 transações (PJ)...');
    const pjResult = await getTransactions({
      userId: ANDERSON_UID,
      owner: 'PJ',
      limit: 5
    });
    console.log(`✅ Sucesso! Total retornado: ${pjResult.total}`);
    console.log(`💰 Balanço do Lote: ${pjResult.balance}`);
    console.log('Amostra:', JSON.stringify(pjResult.recentTransactions[0], null, 2));

    // Teste 2: Buscar transações de uma categoria específica (ex: 'Receita')
    console.log('\n🔍 Teste 2: Filtrando por categoria (Vendas)...');
    const catResult = await getTransactions({
      userId: ANDERSON_UID,
      category: 'Vendas',
      limit: 3
    });
    console.log(`✅ Sucesso! Encontrados: ${catResult.total}`);
    
  } catch (error: any) {
    console.error('❌ Erro no teste da tool:', error.message);
  }
}

testTool();
