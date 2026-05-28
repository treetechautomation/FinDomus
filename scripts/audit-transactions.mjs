import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
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

const rows = snap.docs.map((d) => ({
  id: d.id,
  ...d.data(),
}));

const byOwner = rows.reduce((acc, t) => {
  const key = t.owner || 'SEM_OWNER';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const byType = rows.reduce((acc, t) => {
  const key = t.type || 'SEM_TYPE';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const byMonth = rows.reduce((acc, t) => {
  const key = String(t.date || 'SEM_DATA').slice(0, 7);
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const withImportHash = rows.filter((t) => t.importHash).length;
const withoutImportHash = rows.length - withImportHash;

console.log('TOTAL_TRANSACTIONS=', rows.length);
console.log('BY_OWNER=', JSON.stringify(byOwner, null, 2));
console.log('BY_TYPE=', JSON.stringify(byType, null, 2));
console.log('WITH_IMPORT_HASH=', withImportHash);
console.log('WITHOUT_IMPORT_HASH=', withoutImportHash);
console.log('BY_MONTH=', JSON.stringify(byMonth, null, 2));

console.log('SAMPLE_10=');
console.log(JSON.stringify(rows.slice(0, 10), null, 2));
