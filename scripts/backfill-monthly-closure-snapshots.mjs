import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function buildDRE(transactions) {
  let receitaBruta = 0;
  let impostos = 0;
  let despesas = 0;
  let pessoas = 0;
  let proLabore = 0;
  let outros = 0;

  for (const t of transactions) {
    const amount = Math.abs(Number(t.amount || 0));
    const category = String(t.category || '');

    if (t.type === 'income') {
      receitaBruta += amount;
      continue;
    }

    if (category.toLowerCase().includes('imposto')) impostos += amount;
    else if (category === 'Pró-labore') proLabore += amount;
    else despesas += amount;
  }

  const receitaLiquida = receitaBruta - impostos;
  const lucroBruto = receitaLiquida - despesas;
  const lucroOperacional = lucroBruto - pessoas;
  const lucroLiquido = lucroOperacional - proLabore - outros;

  return {
    receitaBruta,
    impostos,
    receitaLiquida,
    despesas,
    pessoas,
    proLabore,
    outros,
    lucroBruto,
    lucroOperacional,
    lucroLiquido,
  };
}

function buildSnapshot({ owner, month, transactions, accounts, liabilities, obligations }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

  const accountBalance = accounts
    .filter((a) => a.owner === owner)
    .reduce((sum, a) => sum + Number(a.balance || 0), 0);

  const liabilitiesBalance = liabilities
    .filter((l) => l.owner === owner)
    .reduce((sum, l) => sum + Number(l.remainingAmount || l.amount || 0), 0);

  const pendingObligations = obligations
    .filter((o) => o.owner === owner && o.status === 'pending')
    .reduce((sum, o) => sum + Number(o.value || 0), 0);

  return {
    owner,
    month,
    generatedAt: new Date().toISOString(),
    kpis: {
      income,
      expenses,
      balance: income - expenses,
      transactionsCount: transactions.length,
    },
    dre: owner === 'PJ' ? buildDRE(transactions) : null,
    patrimony: {
      accounts: accountBalance,
      liabilities: liabilitiesBalance,
      netWorth: accountBalance - liabilitiesBalance,
    },
    fiscal: {
      pendingObligations,
      obligationsCount: obligations.filter((o) => o.owner === owner).length,
    },
    metadata: {
      snapshotVersion: 1,
      engine: 'snapshot-engine-backfill',
    },
  };
}

const [
  closuresSnap,
  txSnap,
  accountsSnap,
  liabilitiesSnap,
  obligationsSnap,
] = await Promise.all([
  getDocs(collection(db, 'monthly_closures')),
  getDocs(collection(db, 'transactions')),
  getDocs(collection(db, 'accounts')),
  getDocs(collection(db, 'liabilities')),
  getDocs(collection(db, 'tax_obligations')),
]);

const transactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const accounts = accountsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const liabilities = liabilitiesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const obligations = obligationsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

let updated = 0;

for (const closureDoc of closuresSnap.docs) {
  const closure = closureDoc.data();
  const owner = closure.owner;
  const month = closure.month;

  const monthTransactions = transactions.filter((t) => {
    return t.owner === owner && (t.competenceMonthKey || t.monthKey) === month;
  });

  const snapshot = buildSnapshot({
    owner,
    month,
    transactions: monthTransactions,
    accounts,
    liabilities,
    obligations,
  });

  await updateDoc(doc(db, 'monthly_closures', closureDoc.id), {
    snapshot,
    updatedAt: new Date().toISOString(),
  });

  updated++;
}

console.log({ updated });
