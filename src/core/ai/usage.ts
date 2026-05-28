import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

export async function canUseAI(userId: string, limit = 100) {
  const ref = doc(db, 'ai_usage', `${userId}_${getMonthKey()}`);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      month: getMonthKey(),
      calls: 0,
      limit
    });
    return true;
  }

  const data = snap.data();
  return data.calls < data.limit;
}

export async function registerAIUsage(userId: string) {
  const ref = doc(db, 'ai_usage', `${userId}_${getMonthKey()}`);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  await updateDoc(ref, {
    calls: (snap.data().calls || 0) + 1
  });
}
