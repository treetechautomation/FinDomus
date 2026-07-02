import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFeatureFlags } from './feature-flags';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { InvestmentSnapshot, InvestmentSnapshotData } from './investment-snapshot-types';

interface InvestmentSnapshotResult {
  data: InvestmentSnapshotData | null;
  source: 'snapshot' | 'legacy';
}

export async function readInvestmentSnapshot(userId: string): Promise<InvestmentSnapshotResult> {
  if (!userId) return { data: null, source: 'legacy' };

  const flags = await getFeatureFlags(userId);
  if (!flags.investmentSnapshot) return { data: null, source: 'legacy' };

  try {
    const ref = doc(db, 'investment_snapshot', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { data: null, source: 'legacy' };

    const snapshot = snap.data() as InvestmentSnapshot;
    if (snapshot.status === 'READY') {
      metrics.increment(userId, 'snapshot_hits', 1, 'investment');
      return { data: snapshot.data, source: 'snapshot' };
    }

    return { data: null, source: 'legacy' };
  } catch (e) {
    logger.error('investment_snapshot_read_error', userId, { error: String(e) });
    return { data: null, source: 'legacy' };
  }
}

export async function writeInvestmentSnapshot(userId: string, snapshot: InvestmentSnapshot): Promise<void> {
  if (!userId) return;
  try {
    const ref = doc(db, 'investment_snapshot', userId);
    await setDoc(ref, snapshot, { merge: false });
  } catch (e) {
    logger.error('investment_snapshot_write_error', userId, { error: String(e) });
    throw e;
  }
}
