import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFeatureFlags } from './feature-flags';
import { snapshotRegistry } from './snapshot-registry';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { PlanningSnapshot, PlanningSnapshotData } from './planning-snapshot-types';

interface PlanningSnapshotResult {
  data: PlanningSnapshotData | null;
  source: 'snapshot' | 'legacy';
}

export async function readPlanningSnapshot(userId: string): Promise<PlanningSnapshotResult> {
  if (!userId) return { data: null, source: 'legacy' };

  const flags = await getFeatureFlags(userId);
  if (!flags.planningSnapshot) return { data: null, source: 'legacy' };

  try {
    const ref = doc(db, 'planning_snapshot', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      logger.info('planning_snapshot_miss', userId);
      return { data: null, source: 'legacy' };
    }

    const snapshot = snap.data() as PlanningSnapshot;

    if (snapshot.status === 'READY') {
      logger.info('planning_snapshot_hit', userId, { version: snapshot.dataVersion });
      metrics.increment(userId, 'snapshot_hits', 1, 'planning');
      return { data: snapshot.data, source: 'snapshot' };
    }

    return { data: null, source: 'legacy' };
  } catch (e) {
    logger.error('planning_snapshot_read_error', userId, { error: String(e) });
    return { data: null, source: 'legacy' };
  }
}

export async function writePlanningSnapshot(userId: string, snapshot: PlanningSnapshot): Promise<void> {
  if (!userId) return;
  try {
    const ref = doc(db, 'planning_snapshot', userId);
    await setDoc(ref, snapshot, { merge: false });
    logger.info('planning_snapshot_written', userId, { version: snapshot.dataVersion });
  } catch (e) {
    logger.error('planning_snapshot_write_error', userId, { error: String(e) });
    throw e;
  }
}
