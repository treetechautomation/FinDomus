import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
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

const now = new Date().toISOString();

const txs = [
  // PF MARÇO
  {
    owner: 'PF',
    type: 'income',
    category: 'Salário',
    description: 'Salário Março',
    amount: 8500,
    competenceMonthKey: '2026-03',
    monthKey: '2026-03',
    date: '2026-03-05',
  },
  {
    owner: 'PF',
    type: 'expense',
    category: 'Alimentação',
    description: 'Supermercado Março',
    amount: 1250,
    competenceMonthKey: '2026-03',
    monthKey: '2026-03',
    date: '2026-03-08',
  },
  {
    owner: 'PF',
    type: 'expense',
    category: 'Saúde',
    description: 'Academia Março',
    amount: 180,
    competenceMonthKey: '2026-03',
    monthKey: '2026-03',
    date: '2026-03-11',
  },

  // PF ABRIL
  {
    owner: 'PF',
    type: 'income',
    category: 'Salário',
    description: 'Salário Abril',
    amount: 9200,
    competenceMonthKey: '2026-04',
    monthKey: '2026-04',
    date: '2026-04-05',
  },
  {
    owner: 'PF',
    type: 'expense',
    category: 'Alimentação',
    description: 'iFood Abril',
    amount: 420,
    competenceMonthKey: '2026-04',
    monthKey: '2026-04',
    date: '2026-04-08',
  },
  {
    owner: 'PF',
    type: 'expense',
    category: 'Lazer',
    description: 'Cinema Abril',
    amount: 140,
    competenceMonthKey: '2026-04',
    monthKey: '2026-04',
    date: '2026-04-14',
  },

  // PJ MARÇO
  {
    owner: 'PJ',
    type: 'income',
    category: 'Receita',
    description: 'Receita SaaS Março',
    amount: 22000,
    companyId: 'empresa-demo',
    competenceMonthKey: '2026-03',
    monthKey: '2026-03',
    date: '2026-03-03',
  },
  {
    owner: 'PJ',
    type: 'expense',
    category: 'Marketing',
    description: 'Google Ads Março',
    amount: 3500,
    companyId: 'empresa-demo',
    competenceMonthKey: '2026-03',
    monthKey: '2026-03',
    date: '2026-03-14',
  },
  {
    owner: 'PJ',
    type: 'expense',
    category: 'Pró-labore',
    description: 'Pró-labore Março',
    amount: 6000,
    companyId: 'empresa-demo',
    competenceMonthKey: '2026-03',
    monthKey: '2026-03',
    date: '2026-03-21',
  },

  // PJ ABRIL
  {
    owner: 'PJ',
    type: 'income',
    category: 'Receita',
    description: 'Receita SaaS Abril',
    amount: 27000,
    companyId: 'empresa-demo',
    competenceMonthKey: '2026-04',
    monthKey: '2026-04',
    date: '2026-04-04',
  },
  {
    owner: 'PJ',
    type: 'expense',
    category: 'Infraestrutura',
    description: 'Servidor VPS Abril',
    amount: 800,
    companyId: 'empresa-demo',
    competenceMonthKey: '2026-04',
    monthKey: '2026-04',
    date: '2026-04-09',
  },
  {
    owner: 'PJ',
    type: 'expense',
    category: 'Impostos',
    description: 'Contabilidade Abril',
    amount: 1200,
    companyId: 'empresa-demo',
    competenceMonthKey: '2026-04',
    monthKey: '2026-04',
    date: '2026-04-17',
  },
];

for (const tx of txs) {
  await addDoc(collection(db, 'transactions'), {
    ...tx,
    createdAt: now,
    updatedAt: now,
  });
}

console.log(`OK: inserted ${txs.length} transactions`);
