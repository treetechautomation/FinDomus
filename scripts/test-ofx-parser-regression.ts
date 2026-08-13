// Suíte de regressão mínima e isolada para o patch OFX.2 (ofx-parser.ts).
// Não depende de Firestore/rede: constrói um ClassificationContext sintético
// e chama resolveOfxTransaction() diretamente — a mesma função usada por parseOFX().
//
// Execução: npx tsx scripts/test-ofx-parser-regression.ts

import { resolveOfxTransaction } from '../src/core/finance/ofx-parser';
import type { ClassificationContext } from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';
import type { AccountIdentity } from '../src/services/firestore/account-identities';

const categories: Category[] = [
  {
    name: 'Receita de Serviços',
    keywords: [
      'receita de servicos',
      'prestacao de servicos',
      'faturamento servicos',
      'servicos prestados',
    ],
    createdAt: new Date().toISOString(),
    categoryType: 'income',
  },
  {
    name: 'Salário',
    keywords: ['salario'],
    createdAt: new Date().toISOString(),
    categoryType: 'income',
  },
  {
    name: 'Supermercado',
    keywords: ['supermercado'],
    createdAt: new Date().toISOString(),
    categoryType: 'expense',
  },
];

function buildContext(accountIdentities: AccountIdentity[] = []): ClassificationContext {
  return {
    categories,
    accountIdentities,
    learningMap: new Map(),
  };
}

function block(fields: Record<string, string | undefined>) {
  return Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([tag, v]) => `<${tag}>${v}`)
    .join('\n');
}

type Case = {
  name: string;
  block: string;
  context: ClassificationContext;
  expect: (result: ReturnType<typeof resolveOfxTransaction>) => void;
};

function approxEqual(a: number, b: number, eps = 0.001) {
  return Math.abs(a - b) < eps;
}

const cases: Case[] = [
  {
    name: 'Caso A — CREDIT recebido de terceiro (Bug 1: FITID 600.803.400.049.800)',
    block: block({
      TRNTYPE: 'CREDIT',
      DTPOSTED: '20260803000000[-3:BRT]',
      TRNAMT: '10144.24',
      FITID: '600.803.400.049.800',
      NAME: 'Transferência recebida',
      MEMO: '03/08 10:38 MARINA DE SOUZA BURGOS',
    }),
    context: buildContext(),
    expect: (r) => {
      if (!r) throw new Error('esperado transação, veio null');
      if (!approxEqual(r.amount, 10144.24)) throw new Error(`amount incorreto: ${r.amount}`);
      if (r.type !== 'income') throw new Error(`type incorreto: ${r.type} (esperado income)`);
    },
  },
  {
    name: 'Caso B — DEBIT com NAME genérico + MEMO informativo (Bug 2: FITID 18.429, NIO FIBRA)',
    block: block({
      TRNTYPE: 'DEBIT',
      DTPOSTED: '20260807000000[-3:BRT]',
      TRNAMT: '-76.90',
      FITID: '18.429',
      NAME: 'Prestação de Serviços',
      MEMO: 'NIO FIBRA',
    }),
    context: buildContext(),
    expect: (r) => {
      if (!r) throw new Error('esperado transação, veio null');
      if (!approxEqual(r.amount, 76.9)) throw new Error(`amount incorreto: ${r.amount}`);
      if (r.type !== 'expense') throw new Error(`type incorreto: ${r.type} (esperado expense)`);
      if (r.category === 'Receita de Serviços')
        throw new Error(`categoria contradiz o type: ${r.category}`);
    },
  },
  {
    name: 'Caso C — DEBIT normal',
    block: block({
      TRNTYPE: 'DEBIT',
      DTPOSTED: '20260810000000[-3:BRT]',
      TRNAMT: '-50.00',
      FITID: '900.001',
      NAME: 'Compra em Supermercado ABC',
    }),
    context: buildContext(),
    expect: (r) => {
      if (!r) throw new Error('esperado transação, veio null');
      if (r.type !== 'expense') throw new Error(`type incorreto: ${r.type} (esperado expense)`);
    },
  },
  {
    name: 'Caso D — CREDIT normal',
    block: block({
      TRNTYPE: 'CREDIT',
      DTPOSTED: '20260810000000[-3:BRT]',
      TRNAMT: '200.00',
      FITID: '900.002',
      NAME: 'Salario recebido',
    }),
    context: buildContext(),
    expect: (r) => {
      if (!r) throw new Error('esperado transação, veio null');
      if (r.type !== 'income') throw new Error(`type incorreto: ${r.type} (esperado income)`);
    },
  },
  {
    name: 'Caso E — registro de saldo (deve ser descartado)',
    block: block({
      TRNTYPE: 'DEBIT',
      DTPOSTED: '20260810000000[-3:BRT]',
      TRNAMT: '1000.00',
      FITID: '900.003',
      NAME: 'SALDO DO DIA',
    }),
    context: buildContext(),
    expect: (r) => {
      if (r !== null) throw new Error(`esperado null (saldo descartado), veio ${JSON.stringify(r)}`);
    },
  },
  {
    name: 'Caso F — OFX sem TRNTYPE (fallback legado por sinal do amount)',
    block: block({
      DTPOSTED: '20260810000000[-3:BRT]',
      TRNAMT: '-30.00',
      FITID: '900.004',
      NAME: 'Compra sem trntype',
    }),
    context: buildContext(),
    expect: (r) => {
      if (!r) throw new Error('esperado transação, veio null');
      if (r.type !== 'expense') throw new Error(`type incorreto: ${r.type} (esperado expense, fallback por sinal)`);
    },
  },
  {
    name: 'Caso G (extra) — CREDIT com evidência de identidade interna deve continuar transfer',
    block: block({
      TRNTYPE: 'CREDIT',
      DTPOSTED: '20260810000000[-3:BRT]',
      TRNAMT: '500.00',
      FITID: '900.005',
      NAME: 'Transferência recebida - Joao da Silva',
    }),
    context: buildContext([
      {
        name: 'Joao da Silva',
        normalizedName: 'joao da silva',
        aliases: [],
        owner: 'PF',
        ruleType: 'own_account',
        targetType: 'transfer',
        isActive: true,
      },
    ]),
    expect: (r) => {
      if (!r) throw new Error('esperado transação, veio null');
      if (r.type !== 'transfer')
        throw new Error(`type incorreto: ${r.type} (esperado transfer — identidade interna comprovada)`);
    },
  },
];

let failures = 0;

for (const c of cases) {
  try {
    const result = resolveOfxTransaction(c.block, c.context);
    c.expect(result);
    console.log(`PASS — ${c.name}`);
  } catch (err) {
    failures++;
    console.error(`FAIL — ${c.name}`);
    console.error(`       ${(err as Error).message}`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures}/${cases.length} casos falharam.`);
  process.exit(1);
} else {
  console.log(`${cases.length}/${cases.length} casos passaram.`);
}
