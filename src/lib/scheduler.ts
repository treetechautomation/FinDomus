import { logger } from './logger';
import { snapshotRegistry } from './snapshot-registry';
import { getFeatureFlags } from './feature-flags';
import { metrics } from './system-metrics';
import type { SnapshotRegistry } from './snapshot-registry';

type EventPriority = 'HIGH' | 'NORMAL' | 'LOW';

interface QueuedEvent {
  userId: string;
  type: string;
  priority: EventPriority;
  timestamp: number;
}

const PRIORITY_MAP: Record<string, EventPriority> = {
  'transaction:created': 'HIGH',
  'account:updated': 'HIGH',
  'investment:created': 'NORMAL',
  'investment:updated': 'NORMAL',
  'investment:deleted': 'NORMAL',
  'liability:created': 'NORMAL',
  'liability:updated': 'NORMAL',
  'liability:deleted': 'NORMAL',
  'planning:updated': 'NORMAL',
  'recurring:updated': 'LOW',
  'month:closed': 'LOW',
  'month:reopened': 'LOW',
  'data:changed': 'NORMAL',
};

const queue: Map<string, QueuedEvent> = new Map();
let workerTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 1000;
const LOCK_TTL_MS = 30_000;

function getPriority(type: string): EventPriority {
  return PRIORITY_MAP[type] || 'NORMAL';
}

export function enqueueEvent(userId: string, eventType: string): void {
  if (!userId) return;

  const key = `${userId}:${eventType}`;
  const existing = queue.get(key);

  if (existing) {
    existing.timestamp = Date.now();
  } else {
    queue.set(key, {
      userId,
      type: eventType,
      priority: getPriority(eventType),
      timestamp: Date.now(),
    });
  }

  resetTimer();

  logger.info('scheduler_event_queued', userId, {
    eventType,
    queueSize: queue.size,
  });
}

function resetTimer(): void {
  if (workerTimer) clearTimeout(workerTimer);
  workerTimer = setTimeout(() => processQueue(), DEBOUNCE_MS);
}

async function processQueue(): Promise<void> {
  if (queue.size === 0) return;

  const events = Array.from(queue.values());
  queue.clear();

  const eventsByUser = new Map<string, QueuedEvent[]>();
  for (const ev of events) {
    const list = eventsByUser.get(ev.userId) || [];
    list.push(ev);
    eventsByUser.set(ev.userId, list);
  }

  for (const [userId, userEvents] of eventsByUser) {
    await processUserEvents(userId, userEvents);
  }

  workerTimer = null;
}

async function processUserEvents(userId: string, events: QueuedEvent[]): Promise<void> {
  const flags = await getFeatureFlags(userId);
  if (!flags.schedulerEnabled) {
    logger.info('scheduler_disabled', userId);
    return;
  }

  const registry = await snapshotRegistry.getOrCreate(userId);
  const dirtyDomains: (keyof SnapshotRegistry['domains'])[] = [];

  for (const ev of events) {
    const type = ev.type;
    if (type === 'transaction:created' || type === 'account:updated' || type === 'data:changed') {
      if (!dirtyDomains.includes('dashboard')) dirtyDomains.push('dashboard');
      if (!dirtyDomains.includes('planning')) dirtyDomains.push('planning');
    }
    if (type.startsWith('investment:')) {
      if (!dirtyDomains.includes('investment')) dirtyDomains.push('investment');
    }
    if (type.startsWith('liability:')) {
      if (!dirtyDomains.includes('liability')) dirtyDomains.push('liability');
    }
    if (type === 'planning:updated') {
      if (!dirtyDomains.includes('planning')) dirtyDomains.push('planning');
    }
    if (type === 'month:closed') {
      if (!dirtyDomains.includes('reports')) dirtyDomains.push('reports');
    }
  }

  for (const domain of dirtyDomains) {
    if (flags[`${domain}Snapshot` as keyof typeof flags] !== true) continue;

    const entry = registry.domains[domain];
    if (entry.status === 'BUILDING') {
      const lockAge = entry.updatedAt ? Date.now() - new Date(entry.updatedAt).getTime() : Infinity;
      if (lockAge < LOCK_TTL_MS) {
        logger.info('scheduler_skip_locked', userId, { domain, lockAge });
        continue;
      }
    }

    await snapshotRegistry.markBuilding(userId, domain);

    try {
      if (domain === 'dashboard') {
        const { buildDashboardSnapshot } = await import('./dashboard-snapshot-builder');
        const { writeDashboardSnapshot } = await import('./dashboard-snapshot-service');
        const { snapshot, sourceReads } = await buildDashboardSnapshot(userId, entry.version);
        await writeDashboardSnapshot(userId, snapshot);
        await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        metrics.increment(userId, 'firestore_reads', sourceReads, domain);
      }
      if (domain === 'planning') {
        const { buildPlanningSnapshot } = await import('./planning-snapshot-builder');
        const { writePlanningSnapshot } = await import('./planning-snapshot-service');
        const { snapshot, sourceReads } = await buildPlanningSnapshot(userId, entry.version);
        await writePlanningSnapshot(userId, snapshot);
        await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        metrics.increment(userId, 'firestore_reads', sourceReads, domain);
      }
      if (domain === 'investment') {
        const { buildInvestmentSnapshot } = await import('./investment-snapshot-builder');
        const { writeInvestmentSnapshot } = await import('./investment-snapshot-service');
        const { snapshot, sourceReads } = await buildInvestmentSnapshot(userId, entry.version);
        await writeInvestmentSnapshot(userId, snapshot);
        await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        metrics.increment(userId, 'firestore_reads', sourceReads, domain);
      }
      if (domain === 'liability') {
        const { buildLiabilitySnapshot } = await import('./liability-snapshot-builder');
        const { writeLiabilitySnapshot } = await import('./liability-snapshot-service');
        const { snapshot, sourceReads } = await buildLiabilitySnapshot(userId, entry.version);
        await writeLiabilitySnapshot(userId, snapshot);
        await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        metrics.increment(userId, 'firestore_reads', sourceReads, domain);
      }
      if (domain === 'reports') {
        const { getCurrentMonthKey } = await import('@/core/finance/financial-period-engine');
        const { buildReportsSnapshot } = await import('./reports-snapshot-builder');
        const { writeReportsSnapshot } = await import('./reports-snapshot-service');
        const monthKey = getCurrentMonthKey();
        for (const owner of ['PF', 'PJ'] as const) {
          const { snapshot, sourceReads } = await buildReportsSnapshot(userId, owner, monthKey, entry.version);
          await writeReportsSnapshot(snapshot);
          metrics.increment(userId, 'firestore_reads', sourceReads, 'reports');
        }
        await snapshotRegistry.markReady(userId, domain, 1, 0);
      }
    } catch (err) {
      logger.error('snapshot_build_failed', userId, { domain, error: String(err) });
      await snapshotRegistry.markFailed(userId, domain);
    }

    metrics.increment(userId, 'scheduler_jobs', 1, domain);
  }

  await snapshotRegistry.updateScheduler(userId, {
    queueSize: 0,
    running: false,
    retryCount: registry.scheduler.retryCount,
    lastRunAt: new Date().toISOString(),
  });

  logger.info('scheduler_user_processed', userId, {
    events: events.length,
    dirtyDomains: dirtyDomains.length,
  });
}

export function flushScheduler(): void {
  if (workerTimer) {
    clearTimeout(workerTimer);
    workerTimer = null;
  }
  processQueue();
}
