import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';

function normalizeTransactionDate(input) {
  if (!input) {
    const now = new Date();
    const iso = now.toISOString().slice(0, 10);

    return {
      date: now.toLocaleDateString('pt-BR'),
      dateISO: iso,
      monthKey: iso.slice(0, 7),
    };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return {
      date: new Date(input).toLocaleDateString('pt-BR'),
      dateISO: input,
      monthKey: input.slice(0, 7),
    };
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [dd, mm, yyyy] = input.split('/');
    const iso = `${yyyy}-${mm}-${dd}`;

    return {
      date: input,
      dateISO: iso,
      monthKey: iso.slice(0, 7),
    };
  }

  const parsed = new Date(input);

  if (!Number.isNaN(parsed.getTime())) {
    const iso = parsed.toISOString().slice(0, 10);

    return {
      date: parsed.toLocaleDateString('pt-BR'),
      dateISO: iso,
      monthKey: iso.slice(0, 7),
    };
  }

  return {
    date: input,
    dateISO: '',
    monthKey: '',
  };
}

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

const snap = await getDocs(collection(db, 'transactions'));

const batch = writeBatch(db);

let updated = 0;

for (const item of snap.docs) {
  const data = item.data();

  if (data.dateISO && data.monthKey) {
    continue;
  }

  const normalized = normalizeTransactionDate(data.date);

  batch.update(doc(db, 'transactions', item.id), {
    dateISO: normalized.dateISO,
    monthKey: normalized.monthKey,
  });

  updated++;
}

if (updated > 0) {
  await batch.commit();
}

console.log({
  total: snap.size,
  updated,
});
