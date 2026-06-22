import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/['",]+/g, '')?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

function getCredential() {
  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }
  return applicationDefault();
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: getCredential(),
      projectId,
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
