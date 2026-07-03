import { adminDb } from '@/lib/firebase-admin';
import type { TrialStatus, Subscription } from '@/lib/billing/billing-types';

export async function getTrialStatus(householdId: string): Promise<TrialStatus> {
  const snap = await adminDb
    .collection('subscriptions')
    .where('householdId', '==', householdId)
    .limit(1)
    .get();

  if (snap.empty) {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: null,
      hoursRemaining: null,
      endsAt: null,
      startedAt: null,
      used: false,
    };
  }

  const sub = snap.docs[0].data() as Subscription;
  const now = Date.now();

  if (sub.status === 'trialing' && sub.trialEndsAt) {
    const endsAt = new Date(sub.trialEndsAt).getTime();
    const remainingMs = endsAt - now;

    if (remainingMs <= 0) {
      await checkAndExpireTrial(householdId, snap.docs[0].id);
      return {
        isActive: false,
        isExpired: true,
        daysRemaining: 0,
        hoursRemaining: 0,
        endsAt: sub.trialEndsAt,
        startedAt: sub.trialStartedAt,
        used: sub.trialUsed,
      };
    }

    const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil(remainingMs / (1000 * 60 * 60));

    return {
      isActive: true,
      isExpired: false,
      daysRemaining,
      hoursRemaining,
      endsAt: sub.trialEndsAt,
      startedAt: sub.trialStartedAt,
      used: sub.trialUsed,
    };
  }

  return {
    isActive: false,
    isExpired: sub.status === 'expired',
    daysRemaining: null,
    hoursRemaining: null,
    endsAt: sub.trialEndsAt,
    startedAt: sub.trialStartedAt,
    used: sub.trialUsed,
  };
}

export async function initializeTrial(
  householdId: string,
  trialDays: number
): Promise<{ trialStartedAt: string; trialEndsAt: string; trialUsed: boolean }> {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  return {
    trialStartedAt: now.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    trialUsed: true,
  };
}

export async function checkAndExpireTrial(
  householdId: string,
  subscriptionId?: string
): Promise<void> {
  const docId = subscriptionId ?? await resolveSubscriptionId(householdId);
  if (!docId) return;

  await adminDb.collection('subscriptions').doc(docId).update({
    status: 'expired',
    updatedAt: new Date().toISOString(),
  } as any);
}

async function resolveSubscriptionId(householdId: string): Promise<string | null> {
  const snap = await adminDb
    .collection('subscriptions')
    .where('householdId', '==', householdId)
    .limit(1)
    .get();

  return snap.empty ? null : snap.docs[0].id;
}
