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

export async function registerAIUsageAdmin(userId: string) {
  const ref = adminDb.collection('ai_usage').doc(`${userId}_${getMonthKey()}`);
  const snap = await ref.get();

  if (!snap.exists) return;

  await ref.update({
    calls: (snap.data()?.calls || 0) + 1
  });
}
