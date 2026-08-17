// OFX.4 — FASE B.2 — ETAPA 4 — Gateways/processadores de pagamento não devem
// decidir a categoria econômica sozinhos, mesmo quando o merchant real não é
// reconhecido. Reproduz o caso real (FOOD TO SAVE LTDA via PICPAY) e cobre os
// casos exigidos no briefing.
//
// Não depende de Firestore/rede.
//
// Execução: npx tsx scripts/test-payment-gateway-mechanism.ts

import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'Carteira digital', keywords: ['carteira digital', 'recargapay', 'picpay', 'mercado pago', 'pagbank', 'ame digital'], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Maquininha / Gateway', keywords: ['maquininha', 'gateway', 'stone', 'pagseguro', 'cielo', 'getnet', 'rede', 'asaas', 'stripe', 'mercadopago', 'taxa de antecipacao', 'taxa gateway', 'tarifa gateway'], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Vendas via Maquininha', keywords: ['venda maquininha', 'recebimento stone', 'recebimento cielo', 'pagseguro vendas', 'cielo vendas', 'credito maquininha'], categoryType: 'income', createdAt: '' } as Category,
  { name: 'Restaurante', keywords: ['restaurante'], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Transferência entre contas', keywords: ['transferencia', 'ted mesma titularidade'], categoryType: 'transfer', createdAt: '' } as Category,
];

function buildContext(): ClassificationContext {
  return { categories, accountIdentities: [], learningMap: new Map() };
}

type Case = {
  label: string;
  description: string;
  amount: number;
  expectCategory: string;
  expectType: 'income' | 'expense' | 'transfer';
};

const cases: Case[] = [
  {
    label: 'REPRODUÇÃO DO CASO REAL — FOOD TO SAVE LTDA via PICPAY não vira "Carteira digital"',
    description: 'Transferência enviada pelo Pix - FOOD TO SAVE LTDA - 41.643.020/0001-68 - PICPAY (0380) Agência: 1 Conta: 111450118-2',
    amount: -44.72,
    expectCategory: 'Outros',
    expectType: 'expense',
  },
  {
    label: 'Merchant reconhecido (RESTAURANTE) + gateway MERCADO PAGO — merchant vence, gateway não decide',
    description: 'Compra RESTAURANTE ABC via MERCADO PAGO',
    amount: -80,
    expectCategory: 'Restaurante',
    expectType: 'expense',
  },
  {
    label: 'Só o nome do gateway, sem merchant nem contexto — fallback conservador (Outros)',
    description: 'Pagamento via PAGSEGURO',
    amount: -30,
    expectCategory: 'Outros',
    expectType: 'expense',
  },
  {
    label: 'PicPay como contraparte bancária isolada (sem merchant) — comportamento conservador (Outros), não "Carteira digital"',
    description: 'Transferência enviada pelo Pix - PICPAY (0380) Agência: 1 Conta: 999999-9',
    amount: -50,
    expectCategory: 'Outros',
    expectType: 'expense',
  },
  {
    label: 'Keyword composta de gateway (taxa de antecipação) continua funcionando — não é mecanismo isolado',
    description: 'Taxa de antecipacao Stone referente a vendas de julho',
    amount: -25,
    expectCategory: 'Maquininha / Gateway',
    expectType: 'expense',
  },
  {
    label: 'Recebimento via maquininha (venda real) continua funcionando — keyword composta',
    description: 'Recebimento Stone - vendas do dia',
    amount: 500,
    expectCategory: 'Vendas via Maquininha',
    expectType: 'income',
  },
];

let failures = 0;

console.log('OFX.4 FASE B.2 — GATEWAY/PROCESSADOR NÃO É CATEGORIA ECONÔMICA\n');

for (const c of cases) {
  const result = classifyTransactionWithContext(c.description, c.amount, buildContext());
  const pass = result.category === c.expectCategory && result.type === c.expectType;
  if (pass) {
    console.log(`PASS — ${c.label}`);
    console.log(`       type=${result.type} category="${result.category}"`);
  } else {
    failures++;
    console.error(`FAIL — ${c.label}`);
    console.error(`       esperado: type=${c.expectType} category="${c.expectCategory}"`);
    console.error(`       obtido:   type=${result.type} category="${result.category}"`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures}/${cases.length} casos falharam.`);
  process.exit(1);
} else {
  console.log(`${cases.length}/${cases.length} casos passaram.`);
}
