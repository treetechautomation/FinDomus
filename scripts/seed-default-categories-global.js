require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: String(process.env.FIREBASE_CLIENT_EMAIL || '').replace(/['",]+/g, '').trim(),
      privateKey: String(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const { DEFAULT_CATEGORY_CATALOG } = require('../src/core/finance/default-category-catalog');

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

async function run() {
  const now = new Date().toISOString();

  const before = await db.collection('categories').get();
  console.log('BEFORE_CATEGORIES=', before.size);
  console.log('CATALOG_CATEGORIES=', DEFAULT_CATEGORY_CATALOG.length);

  const existingByName = new Map();
  before.docs.forEach((doc) => {
    const data = doc.data();
    const key = normalize(data.name);
    if (key) existingByName.set(key, { id: doc.id, data });
  });

  let created = 0;
  let updated = 0;

  for (const item of DEFAULT_CATEGORY_CATALOG) {
    const key = normalize(item.name);
    const existing = existingByName.get(key);

    const itemKeywords = Array.isArray(item.keywords) ? item.keywords : [];

    if (!existing) {
      await db.collection('categories').add({
        name: item.name,
        keywords: itemKeywords.map(normalize).filter(Boolean),
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
      created++;
      continue;
    }

    const current = Array.isArray(existing.data.keywords) ? existing.data.keywords : [];
    const merged = Array.from(new Set([...current, ...itemKeywords].map(normalize).filter(Boolean)));

    await db.collection('categories').doc(existing.id).update({
      keywords: merged,
      isDefault: existing.data.isDefault ?? true,
      updatedAt: now,
    });
    updated++;
  }

  const after = await db.collection('categories').get();

  console.log('CREATED=', created);
  console.log('UPDATED=', updated);
  console.log('AFTER_CATEGORIES=', after.size);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('SEED_ERROR=', err);
    process.exit(1);
  });
