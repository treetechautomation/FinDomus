import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFeatureFlags } from './feature-flags';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { LiabilitySnapshot, LiabilitySnapshotData } from './liability-snapshot-types';

interface LiabilitySnapshotResult {
  data: LiabilitySnapshotData | null;
  source: 'snapshot' | 'legacy';
}

export async function readLiabilitySnapshot(userId: string): Promise<LiabilitySnapshotResult> {
  if (!userId) return { data: null, source: 'legacy' };
  const flags = await getFeatureFlags(userId);
  if (!flags.liabilitySnapshot) return { data: null, source: 'legacy' };
  try {
    const snap = await getDoc(doc(db, 'liability_snapshot', userId));
    if (!snap.exists()) return { data: null, source: 'legacy' };
    const s = snap.data() as LiabilitySnapshot;
    if (s.status === 'READY') { metrics.increment(userId, 'snapshot_hits', 1, 'liability'); return { data: s.data, source: 'snapshot' }; }
    return { data: null, source: 'legacy' };
  } catch (e) { logger.error('liability_snapshot_read_error', userId, { error: String(e) }); return { data: null, source: 'legacy' }; }
}

export async function writeLiabilitySnapshot(userId: string, snapshot: LiabilitySnapshot): Promise<void> {
  if (!userId) return;
  await setDoc(doc(db, 'liability_snapshot', userId), snapshot, { merge: false });
}
