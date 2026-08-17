// CLASSIFIER.3 — FASE B — Suíte determinística da barreira central (somente leitura).
//
// Verifica a barreira category.categoryType × transaction.type implementada em
// transaction-classifier.ts (classifyTransactionWithContext).
//
// Não depende de Firestore/rede: constrói um ClassificationContext sintético
// e chama classifyTransactionWithContext() diretamente — a mesma função síncrona
// usada por OFX/CSV/PDF/Pluggy.
//
// CASOS (matriz homologada):
//   A) income  × categoryType=income    -> mantém
//   B) income  × categoryType=expense   -> BLOQUEIA (fallback 'Outros')
//   C) expense × categoryType=expense   -> mantém
//   D) expense × categoryType=income    -> BLOQUEIA (fallback 'Outros')
//   E) transfer com identidade comprovada -> mantém
//      [OFX.4 Fase B: type='transfer' só nasce de identidade de conta (etapa 1
//      de classifyTransactionWithContext) — texto genérico de "transferência"/
//      "ted"/"pix" deixou de decidir type sozinho. Caso E agora testa o único
//      caminho legítimo para transfer: identidade cadastrada.]
//   F) expense × categoryType=transfer  -> BLOQUEIA (fallback 'Outros')  [residual OFX.3-R,
//      agora também o resultado padrão para "ted mesma titularidade" SEM identidade]
//   G) categoryType ausente             -> comportamento legado (mantém)
//   H) categoria custom sem categoryType-> comportamento legado (mantém)
//   I) investment                       -> DEFER (sem asserção, apenas registro)
//
// Execução: npx tsx scripts/test-transaction-classifier-category-type.ts

import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';
import type { AccountIdentity } from '../src/services/firestore/account-identities';

type CatType = 'income' | 'expense' | 'transfer' | 'investment';

type SyntheticCategory = {
  name: string;
  keywords: string[];
  categoryType?: CatType;
};

const syntheticCategories: SyntheticCategory[] = [
  { name: 'Salário', keywords: ['salario mensal'], categoryType: 'income' },
  { name: 'Supermercado', keywords: ['supermercado'], categoryType: 'expense' },
  { name: 'Transferência entre contas', keywords: ['ted mesma titularidade'], categoryType: 'transfer' },
  { name: 'Custom Sem Tipo', keywords: ['customkey'], categoryType: undefined },
  { name: 'Aporte investimento', keywords: ['aporte investimento'], categoryType: 'investment' },
];

const syntheticIdentity: AccountIdentity = {
  name: 'Joao Titular',
  normalizedName: 'joao titular',
  aliases: [],
  owner: 'PF',
  ruleType: 'own_account',
  targetType: 'transfer',
  isActive: true,
};

function buildContext(withIdentity = false): ClassificationContext {
  return {
    categories: syntheticCategories as unknown as Category[],
    accountIdentities: withIdentity ? [syntheticIdentity] : [],
    learningMap: new Map(),
  };
}

type Case = {
  id: string;
  label: string;
  description: string;
  amount: number;
  expectType?: 'income' | 'expense' | 'transfer';
  expectCategory?: string;
  // Se true, o caso DESEJA que a categoria seja barrada para o fallback 'Outros'.
  expectBlocked?: boolean;
  defer?: boolean;
  withIdentity?: boolean;
};

const cases: Case[] = [
  {
    id: 'A',
    label: 'income × categoryType=income',
    description: 'Salário mensal de janeiro',
    amount: 5000,
    expectType: 'income',
    expectCategory: 'Salário',
  },
  {
    id: 'B',
    label: 'income × categoryType=expense',
    description: 'Supermercado do bairro',
    amount: 100,
    expectType: 'income',
    expectBlocked: true,
  },
  {
    id: 'C',
    label: 'expense × categoryType=expense',
    description: 'Supermercado do bairro',
    amount: -100,
    expectType: 'expense',
    expectCategory: 'Supermercado',
  },
  {
    id: 'D',
    label: 'expense × categoryType=income',
    description: 'Salário mensal de janeiro',
    amount: -5000,
    expectType: 'expense',
    expectBlocked: true,
  },
  {
    id: 'E',
    label: 'transfer com identidade comprovada (único caminho válido para transfer)',
    description: 'TED mesma titularidade - Joao Titular',
    amount: -500,
    expectType: 'transfer',
    withIdentity: true,
  },
  {
    id: 'F',
    label: 'expense × categoryType=transfer, SEM identidade (residual OFX.3-R + OFX.4 Fase B)',
    description: 'TED mesma titularidade',
    amount: -500,
    expectType: 'expense',
    expectBlocked: true,
  },
  {
    id: 'F2',
    label: 'texto genérico "transferência" sem identidade/aprendizado/keyword específica -> não decide type sozinho (OFX.4 Fase B)',
    description: 'Transferência entre contas própria',
    amount: -500,
    expectType: 'expense',
    expectBlocked: true,
  },
  {
    id: 'G',
    label: 'categoryType ausente (legado)',
    description: 'Customkey despesa qualquer',
    amount: -100,
    expectType: 'expense',
    expectCategory: 'Custom Sem Tipo',
  },
  {
    id: 'H',
    label: 'categoria custom sem categoryType (legado)',
    description: 'Customkey recebimento',
    amount: 100,
    expectType: 'income',
    expectCategory: 'Custom Sem Tipo',
  },
  {
    id: 'I',
    label: 'investment (DEFER — sem asserção)',
    description: 'Aporte investimento',
    amount: -1000,
    defer: true,
  },
];

let failures = 0;

console.log('CLASSIFIER.3 — TESTE DA BARREIRA CENTRAL (pós-patch)\n');

for (const c of cases) {
  const result = classifyTransactionWithContext(c.description, c.amount, buildContext(c.withIdentity));
  const observed = `type=${result.type} category="${result.category}"`;

  if (c.defer) {
    console.log(`DEFER — ${c.id} ${c.label}: ${observed} (sem asserção — ver FASE A §11)`);
    continue;
  }

  try {
    if (c.expectType && result.type !== c.expectType) {
      throw new Error(`type incorreto: esperado ${c.expectType}, veio ${result.type}`);
    }
    if (c.expectBlocked) {
      if (result.category === 'Outros') {
        console.log(`PASS — ${c.id} ${c.label}: bloqueado para fallback (${observed})`);
      } else {
        throw new Error(
          `esperado bloqueio para "Outros", mas categoria permaneceu "${result.category}" (${observed})`
        );
      }
    } else if (c.expectCategory && result.category !== c.expectCategory) {
      throw new Error(
        `categoria incorreta: esperado "${c.expectCategory}", veio "${result.category}" (${observed})`
      );
    } else {
      console.log(`PASS — ${c.id} ${c.label}: ${observed}`);
    }
  } catch (err) {
    failures++;
    console.error(`FAIL — ${c.id} ${c.label}: ${(err as Error).message}`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures}/${cases.length} casos falharam. A barreira central não está se comportando conforme a matriz homologada.`);
  process.exit(1);
} else {
  console.log(`${cases.length}/${cases.length} casos passaram (matriz homologada validada).`);
}
