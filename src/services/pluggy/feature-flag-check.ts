import { adminDb } from '@/lib/firebase-admin';

/**
 * Verifica no Firestore (usando o SDK Admin) se a integração da Pluggy está ativa.
 * Checa a flag global e, opcionalmente, a flag específica do usuário.
 */
export async function isPluggyEnabledAdmin(userId?: string): Promise<boolean> {
  try {
    // 1. Verificar feature flag global
    const globalRef = adminDb.collection('feature_flags').doc('global');
    const globalSnap = await globalRef.get();
    
    if (globalSnap.exists) {
      const globalData = globalSnap.data();
      if (globalData?.pluggyEnabled === true) {
        return true;
      }
    }

    // 2. Se não estiver ativa globalmente, verificar para o usuário específico
    if (userId) {
      const userRef = adminDb.collection('feature_flags').doc(userId);
      const userSnap = await userRef.get();
      
      if (userSnap.exists) {
        const userData = userSnap.data();
        if (userData?.pluggyEnabled === true) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('[Feature Flag Check Admin] Error checking pluggyEnabled:', error);
    return false;
  }
}
