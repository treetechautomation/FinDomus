import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
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

const snap = await getDocs(collection(db, 'transactions'));

let updated = 0;
let batch = writeBatch(db);
let batchCount = 0;

for (const item of snap.docs) {
  const data = item.data();

  if (data.competenceMonthKey) continue;

  const competenceMonthKey = data.monthKey || String(data.dateISO || '').slice(0, 7);

  if (!competenceMonthKey) continue;

  batch.update(doc(db, 'transactions', item.id), {
    competenceMonthKey,
  });

  updated++;
  batchCount++;

  if (batchCount >= 450) {
    await batch.commit();
    batch = writeBatch(db);
    batchCount = 0;
  }
}

if (batchCount > 0) {
  await batch.commit();
}

console.log({
  total: snap.size,
  updated,
});
