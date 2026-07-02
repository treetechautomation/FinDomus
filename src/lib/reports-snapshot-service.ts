import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFeatureFlags } from './feature-flags';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { ReportsSnapshot, ReportsSnapshotData } from './reports-snapshot-types';

export function reportsSnapshotDocId(userId: string, owner: string, monthKey: string): string {
  return `${userId}_${owner}_${monthKey}`;
}

export async function readReportsSnapshot(
  userId: string, owner: string, monthKey: string,
): Promise<{ data: ReportsSnapshotData | null; source: 'snapshot' | 'legacy' }> {
  if (!userId) return { data: null, source: 'legacy' };
  const flags = await getFeatureFlags(userId);
  if (!flags.reportsSnapshot) return { data: null, source: 'legacy' };
  try {
    const snap = await getDoc(doc(db, 'reports_snapshot', reportsSnapshotDocId(userId, owner, monthKey)));
    if (!snap.exists()) return { data: null, source: 'legacy' };
    const s = snap.data() as ReportsSnapshot;
    if (s.status === 'READY') { metrics.increment(userId, 'snapshot_hits', 1, 'reports'); return { data: s.data, source: 'snapshot' }; }
    return { data: null, source: 'legacy' };
  } catch (e) { logger.error('reports_snapshot_read_error', userId, { error: String(e) }); return { data: null, source: 'legacy' }; }
}

export async function writeReportsSnapshot(snapshot: ReportsSnapshot): Promise<void> {
  if (!snapshot.userId) return;
  const id = reportsSnapshotDocId(snapshot.userId, snapshot.owner, snapshot.monthKey);
  await setDoc(doc(db, 'reports_snapshot', id), snapshot, { merge: false });
}
