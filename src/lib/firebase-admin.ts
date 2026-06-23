import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Limpa GOOGLE_APPLICATION_CREDENTIALS se o arquivo apontado não existir
const googleCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (googleCreds && !fs.existsSync(googleCreds)) {
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/['",]+/g, '')?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

function getCredential() {
  // 1. Usar variáveis de ambiente se todas existirem
  if (projectId && clientEmail && privateKey) {
    try {
      return cert({
        projectId,
        clientEmail,
        privateKey,
      });
    } catch (e) {
      console.warn('Falha ao inicializar credential cert com variáveis de ambiente:', e);
    }
  }

  // 2. Verificar se existe um arquivo local service-account.json na raiz do projeto
  const localServiceAccount = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(localServiceAccount)) {
    try {
      return cert(localServiceAccount);
    } catch (e) {
      console.warn('Falha ao inicializar cert com arquivo local service-account.json:', e);
    }
  }

  // 3. Tentar carregar do caminho do Firebase Studio apenas se o arquivo existir
  const studioServiceAccount = '/home/user/studio/service-account.json';
  if (fs.existsSync(studioServiceAccount)) {
    try {
      return cert(studioServiceAccount);
    } catch (e) {
      console.warn('Falha ao inicializar cert com arquivo studio service-account.json:', e);
    }
  }

  // 4. Se GOOGLE_APPLICATION_CREDENTIALS foi validado e mantido no env, retorna applicationDefault()
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return applicationDefault();
    } catch (e) {
      console.warn('Falha ao obter credential via GOOGLE_APPLICATION_CREDENTIALS:', e);
    }
  }

  return undefined;
}

if (!getApps().length) {
  try {
    const credential = getCredential();
    const config: any = {};
    if (credential) {
      config.credential = credential;
    }
    if (projectId) {
      config.projectId = projectId;
    }
    initializeApp(config);
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
