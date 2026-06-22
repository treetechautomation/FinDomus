require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: String(process.env.FIREBASE_CLIENT_EMAIL || '').replace(/['",]+/g, '').trim(),
      privateKey: String(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

async function run() {
  const db = getFirestore();
  const snap = await db.collection('categories')
    .where('isDefault', '==', true)
    .get();

  console.log('DEFAULT_CATEGORIES_FOUND=', snap.size);

  let updated = 0;
  const batch = db.batch();

  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      isGlobal: true,
      updatedAt: new Date().toISOString(),
    });
    updated++;
  });

  if (updated > 0) {
    await batch.commit();
  }

  const globalSnap = await db.collection('categories')
    .where('isGlobal', '==', true)
    .get();

  console.log('UPDATED=', updated);
  console.log('GLOBAL_CATEGORIES_NOW=', globalSnap.size);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FIX_ERROR=', err);
    process.exit(1);
  });
