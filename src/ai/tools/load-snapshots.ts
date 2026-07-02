import { adminDb } from '@/lib/firebase-admin';
import type { DashboardSnapshot } from '@/lib/dashboard-snapshot-types';
import type { PlanningSnapshot } from '@/lib/planning-snapshot-types';
import type { InvestmentSnapshot } from '@/lib/investment-snapshot-types';
import type { LiabilitySnapshot } from '@/lib/liability-snapshot-types';
import { logger } from '@/lib/logger';

interface SnapshotContext {
  dashboard: DashboardSnapshot | null;
  planning: PlanningSnapshot | null;
  investment: InvestmentSnapshot | null;
  liability: LiabilitySnapshot | null;
  sourcesUsed: string[];
  snapshotVersions: Record<string, number>;
  cacheHit: boolean;
  fallbackReason: string | null;
}

export async function loadSnapshotsForIA(userId: string): Promise<SnapshotContext> {
  const result: SnapshotContext = {
    dashboard: null,
    planning: null,
    investment: null,
    liability: null,
    sourcesUsed: [],
    snapshotVersions: {},
    cacheHit: false,
    fallbackReason: null,
  };

  try {
    const [dashSnap, planSnap, invSnap, liabSnap] = await Promise.all([
      adminDb.collection('dashboard_snapshot').doc(userId).get(),
      adminDb.collection('planning_snapshot').doc(userId).get(),
      adminDb.collection('investment_snapshot').doc(userId).get(),
      adminDb.collection('liability_snapshot').doc(userId).get(),
    ]);

    let hitCount = 0;

    if (dashSnap.exists) {
      const d = dashSnap.data() as DashboardSnapshot;
      if (d.status === 'READY') {
        result.dashboard = d;
        result.sourcesUsed.push('dashboard_snapshot');
        result.snapshotVersions.dashboard = d.dataVersion;
        hitCount++;
      }
    }

    if (planSnap.exists) {
      const p = planSnap.data() as PlanningSnapshot;
      if (p.status === 'READY') {
        result.planning = p;
        result.sourcesUsed.push('planning_snapshot');
        result.snapshotVersions.planning = p.dataVersion;
        hitCount++;
      }
    }

    if (invSnap.exists) {
      const i = invSnap.data() as InvestmentSnapshot;
      if (i.status === 'READY') {
        result.investment = i;
        result.sourcesUsed.push('investment_snapshot');
        result.snapshotVersions.investment = i.dataVersion;
        hitCount++;
      }
    }

    if (liabSnap.exists) {
      const l = liabSnap.data() as LiabilitySnapshot;
      if (l.status === 'READY') {
        result.liability = l;
        result.sourcesUsed.push('liability_snapshot');
        result.snapshotVersions.liability = l.dataVersion;
        hitCount++;
      }
    }

    result.cacheHit = hitCount > 0;

    if (hitCount === 0) {
      result.fallbackReason = 'no_snapshots_available';
    } else if (hitCount < 3) {
      result.fallbackReason = `partial_snapshots_${hitCount}_of_4`;
    }

    logger.info('ia_snapshots_loaded', userId, {
      hitCount,
      sourcesUsed: result.sourcesUsed,
      fallbackReason: result.fallbackReason,
    });

    return result;
  } catch (e) {
    logger.error('ia_snapshots_load_failed', userId, { error: String(e) });
    result.fallbackReason = 'snapshot_load_error';
    return result;
  }
}
