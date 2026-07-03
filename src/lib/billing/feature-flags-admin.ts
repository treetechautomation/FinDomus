import { adminDb } from '@/lib/firebase-admin';

export async function isMonetizationEnabled(userId?: string): Promise<boolean> {
  return checkFlag('monetizationEnabled', userId);
}

export async function isTrialEnabled(userId?: string): Promise<boolean> {
  return checkFlag('trialEnabled', userId);
}

export async function isCampaignEnabled(userId?: string): Promise<boolean> {
  return checkFlag('campaignEnabled', userId);
}

export async function isWhatsappOtpEnabled(userId?: string): Promise<boolean> {
  return checkFlag('whatsappOtpEnabled', userId);
}

export async function isPluggyEnabled(userId?: string): Promise<boolean> {
  return checkFlag('pluggyEnabled', userId);
}

async function checkFlag(flag: string, userId?: string): Promise<boolean> {
  try {
    const globalRef = adminDb.collection('feature_flags').doc('global');
    const globalSnap = await globalRef.get();
    if (globalSnap.exists) {
      const data = globalSnap.data();
      if (data?.[flag] === true) return true;
    }
    if (userId) {
      const userRef = adminDb.collection('feature_flags').doc(userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const data = userSnap.data();
        if (data?.[flag] === true) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
