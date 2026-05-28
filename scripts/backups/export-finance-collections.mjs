import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore';

import fs from 'fs';

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

const collections = [
  'transactions',
  'monthly_closures',
  'accounts',
  'companies',
  'categories',
  'investmentAssets',
  'tax_obligations',
  'liabilities'
];

const backup = {};

for (const name of collections) {
  const snap = await getDocs(collection(db, name));

  backup[name] = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  console.log(`OK: ${name} -> ${backup[name].length}`);
}

const file =
  `scripts/backups/finance-backup-${Date.now()}.json`;

fs.writeFileSync(
  file,
  JSON.stringify(backup, null, 2)
);

console.log(`\nBACKUP FILE: ${file}`);
