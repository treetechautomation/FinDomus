import { adminDb } from '../../src/lib/firebase-admin';

async function testAdmin() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'Not set in env';
    console.log(`[TEST] Project ID: ${projectId}`);
    
    if (adminDb) {
      console.log('[TEST] Admin initialized: OK');
    }

    console.log('[TEST] Attempting Firestore read...');
    const snapshot = await adminDb.collection('transactions').limit(1).get();
    
    console.log('[TEST] Firestore read OK');
    console.log(`[TEST] Docs found: ${snapshot.size}`);
    
  } catch (error) {
    console.error('[TEST] Error during Firestore read:', (error as Error).message);
    process.exit(1);
  }
}

testAdmin();
