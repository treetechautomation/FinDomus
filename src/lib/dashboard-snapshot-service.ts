import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFeatureFlags } from './feature-flags';
import { snapshotRegistry } from './snapshot-registry';
import { logger } from './logger';
import { metrics } from './system-metrics';
import { isBrowserStorageAllowed } from './data-contract';
import type { DashboardSnapshot, DashboardSnapshotData } from './dashboard-snapshot-types';

interface DashboardSnapshotResult {
  data: DashboardSnapshotData | null;
  source: 'snapshot' | 'legacy';
  snapshotHealth?: string;
}

export async function readDashboardSnapshot(userId: string): Promise<DashboardSnapshotResult> {
  if (!userId) return { data: null, source: 'legacy' };

  const flags = await getFeatureFlags(userId);

  if (!flags.dashboardSnapshot) {
    return { data: null, source: 'legacy' };
  }

  try {
    const ref = doc(db, 'dashboard_snapshot', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      logger.info('dashboard_snapshot_miss', userId);
      metrics.increment(userId, 'snapshot_hits', 0, 'dashboard');
      return { data: null, source: 'legacy' };
    }

    const snapshot = snap.data() as DashboardSnapshot;

    // Security: ensure classification prevents browser storage
    if (!isBrowserStorageAllowed(snapshot.classification)) {
      await snapshotRegistry.markReady(userId, 'dashboard', snapshot.dataVersion, 0);
    }

    const health = snapshot.health;

    if (snapshot.status === 'READY') {
      logger.info('dashboard_snapshot_hit', userId, { health, version: snapshot.dataVersion });
      metrics.increment(userId, 'snapshot_hits', 1, 'dashboard');
      return { data: snapshot.data, source: 'snapshot', snapshotHealth: health };
    }

    if (snapshot.status === 'FAILED') {
      logger.warn('dashboard_snapshot_failed', userId);
      return { data: null, source: 'legacy' };
    }

    return { data: null, source: 'legacy' };
  } catch (e) {
    logger.error('dashboard_snapshot_read_error', userId, { error: String(e) });
    return { data: null, source: 'legacy' };
  }
}

export async function writeDashboardSnapshot(
  userId: string,
  snapshot: DashboardSnapshot,
): Promise<void> {
  if (!userId) return;
  try {
    const ref = doc(db, 'dashboard_snapshot', userId);
    await setDoc(ref, snapshot, { merge: false });
    logger.info('dashboard_snapshot_written', userId, { version: snapshot.dataVersion });
  } catch (e) {
    logger.error('dashboard_snapshot_write_error', userId, { error: String(e) });
    throw e;
  }
}
