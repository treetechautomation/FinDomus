import { adminAuth } from './firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export async function verifyIdToken(authHeader?: string | null): Promise<DecodedIdToken> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Unauthorized: Invalid token');
  }
}
