import { adminDb } from '@/lib/firebase-admin';

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

export async function canUseAIAdmin(userId: string, limit = 100) {
  const ref = adminDb.collection('ai_usage').doc(`${userId}_${getMonthKey()}`);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({
      userId,
      month: getMonthKey(),
      calls: 0,
      limit
    });
    return true;
  }

  const data = snap.data();
  return (data?.calls || 0) < (data?.limit || limit);
}

export async function registerAIUsageAdmin(
  userId: string,
  audit?: {
    sourcesUsed?: string[];
    snapshotVersions?: Record<string, number>;
    cacheHit?: boolean;
    fallbackReason?: string | null;
  },
) {
  const ref = adminDb.collection('ai_usage').doc(`${userId}_${getMonthKey()}`);
  const snap = await ref.get();

  if (!snap.exists) return;

  const update: Record<string, any> = {
    calls: (snap.data()?.calls || 0) + 1,
  };

  if (audit) {
    update.lastSourcesUsed = audit.sourcesUsed || [];
    update.lastSnapshotVersions = audit.snapshotVersions || {};
    update.lastCacheHit = audit.cacheHit ?? false;
    update.lastFallbackReason = audit.fallbackReason || null;
    update.lastUsedAt = new Date().toISOString();
  }

  await ref.update(update);
}
