import 'dotenv/config';
import { parseNubankCSV, isInvoicePaymentDescription } from '../src/core/finance/invoice-parser';
import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';

const mockCategories: Category[] = [
  { name: 'Juros / Multas', categoryType: 'expense', keywords: ['juros', 'multa'], createdAt: new Date().toISOString() } as Category,
  { name: 'Dívidas / Empréstimos', categoryType: 'expense', keywords: ['refinanciamento'], createdAt: new Date().toISOString() } as Category,
  { name: 'Estacionamento', categoryType: 'expense', keywords: ['estacionamento', 'rotativo'], createdAt: new Date().toISOString() } as Category,
  { name: 'Seguros', categoryType: 'expense', keywords: ['prudential', 'seguro'], createdAt: new Date().toISOString() } as Category,
  { name: 'Streaming / Assinaturas', categoryType: 'expense', keywords: ['netflix'], createdAt: new Date().toISOString() } as Category,
  { name: 'Pets', categoryType: 'expense', keywords: ['pet love'], createdAt: new Date().toISOString() } as Category,
  { name: 'Transferência', categoryType: 'transfer', keywords: ['pix', 'ted'], createdAt: new Date().toISOString() } as Category,
  { name: 'Rendimentos', categoryType: 'income', keywords: ['rendimentos'], createdAt: new Date().toISOString() } as Category,
  { name: 'Salário', categoryType: 'income', keywords: ['salario'], createdAt: new Date().toISOString() } as Category,
  { name: 'Outros', categoryType: 'expense', keywords: [], createdAt: new Date().toISOString() } as Category,
];

const context: ClassificationContext = {
  categories: mockCategories,
  accountIdentities: [],
  learningMap: new Map(),
};

async function main() {
  console.log('=== PESSOAL.3 — TESTE DA CORREÇÃO ESTRUTURAL DE FATURA DE CARTÃO ===\n');

  // CSV da fatura XP com exatamente as 10 linhas documentais
  const sampleXpCsv = [
    'data,descricao,valor',
    '13/07/2026,Pagamentos Validos Normais,-1380.90',
    '11/11/2025,PET LOVE*CLUBE KC - Parcela 9 de 12,9.99',
    '27/11/2025,IG*SUNORESEARCH - Parcela 9 de 12,20.90',
    '14/01/2026,CELLAIRIS PLAZA N - Parcela 7 de 10,32.98',
    '14/07/2026,PRUDENTIAL D*APOL00090041,1212.63',
    '20/07/2026,NETFLIX.COM,59.90',
    '03/08/2026,Encargos de Refinanciamento - Parcela de 1,17.94',
    '03/08/2026,Juros de Mora - Parcela de 1,1.38',
    '03/08/2026,IOF Rotativo - Parcela de 1,5.59',
    '03/08/2026,Multa Contratual - Parcela de 1,27.08',
  ].join('\n');

  const parsed = await parseNubankCSV(sampleXpCsv);

  console.log(`Linhas parseadas do CSV: ${parsed.length} (esperado: 9)\n`);

  let totalExpense = 0;
  let totalIncome = 0;
  let totalTransfer = 0;

  for (let i = 0; i < parsed.length; i++) {
    const t = parsed[i];
    console.log(`[#${i+1}] Data: ${t.date} | Desc: "${t.description}" | Type: ${t.type} | Valor: R$ ${t.amount.toFixed(2)} | Categoria: "${t.category}"`);
    if (t.type === 'expense') totalExpense += t.amount;
    else if (t.type === 'income') totalIncome += t.amount;
    else if (t.type === 'transfer') totalTransfer += t.amount;
  }

  console.log('\n--- TOTAIS PRODUZIDOS PELO PARSER CORRIGIDO ---');
  console.log(`Total Despesas: R$ ${totalExpense.toFixed(2)} (esperado: R$ 1388.39)`);
  console.log(`Total Receitas: R$ ${totalIncome.toFixed(2)} (esperado: R$ 0.00)`);
  console.log(`Total Transfer: R$ ${totalTransfer.toFixed(2)} (esperado: R$ 0.00)`);

  const paymentIncluded = parsed.some(t => t.description.includes('Pagamentos Validos Normais'));
  console.log(`\nPagamento da fatura anterior foi neutralizado/descartado? ${!paymentIncluded ? 'SIM (PASS)' : 'NÃO (FAIL)'}`);

  const assertExpenseCount = parsed.length === 9;
  const assertExpenseTotal = Math.abs(totalExpense - 1388.39) < 0.001;
  const assertIncomeTotal = Math.abs(totalIncome - 0.00) < 0.001;

  if (!assertExpenseCount || !assertExpenseTotal || !assertIncomeTotal || paymentIncluded) {
    console.error('\nERRO: Asserções da fatura XP falharam!');
    process.exit(1);
  }

  console.log('\n=== VALIDAÇÃO DA MATRIZ DE CASOS ANALÍTICOS (A a I) ===\n');

  const matrixTests = [
    { id: 'A', desc: 'PRUDENTIAL SEGUROS', rawAmt: 1212.63, expectedType: 'expense', expectSkip: false },
    { id: 'B', desc: 'Pagamentos Validos Normais', rawAmt: -1380.90, expectedType: null, expectSkip: true },
    { id: 'C', desc: 'Pagamento recebido - Obrigado', rawAmt: -500.00, expectedType: null, expectSkip: true },
    { id: 'D', desc: 'PGTO DE FATURA BRADESCO', rawAmt: -1000.00, expectedType: null, expectSkip: true },
    { id: 'E', desc: 'NETFLIX.COM', rawAmt: 59.90, expectedType: 'expense', expectSkip: false },
    { id: 'F', desc: 'Juros de Mora - Parcela de 1', rawAmt: 1.38, expectedType: 'expense', expectSkip: false },
    { id: 'G', desc: 'Multa Contratual - Parcela de 1', rawAmt: 27.08, expectedType: 'expense', expectSkip: false },
    { id: 'H', desc: 'IOF Rotativo - Parcela de 1', rawAmt: 5.59, expectedType: 'expense', expectSkip: false },
    { id: 'I', desc: 'CELLAIRIS PLAZA N - Parcela 7 de 10', rawAmt: 32.98, expectedType: 'expense', expectSkip: false },
  ];

  let matrixFailures = 0;
  for (const m of matrixTests) {
    const isPayment = isInvoicePaymentDescription(m.desc);
    if (m.expectSkip) {
      if (isPayment) {
        console.log(`[PASS] Caso ${m.id}: "${m.desc}" identificado como pagamento e neutralizado com sucesso.`);
      } else {
        console.error(`[FAIL] Caso ${m.id}: "${m.desc}" não foi identificado como pagamento.`);
        matrixFailures++;
      }
    } else {
      if (!isPayment) {
        console.log(`[PASS] Caso ${m.id}: "${m.desc}" compra/encargo legítimo não-pagamento.`);
      } else {
        console.error(`[FAIL] Caso ${m.id}: "${m.desc}" falsamente identificado como pagamento.`);
        matrixFailures++;
      }
    }
  }

  if (matrixFailures > 0) {
    console.error(`\nERRO: ${matrixFailures} casos da matriz falharam.`);
    process.exit(1);
  }

  console.log('\nSUCESSO: Todos os testes de cartão passaram com 100% de precisão.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
