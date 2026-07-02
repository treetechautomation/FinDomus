import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from './logger';
import type { SnapshotStatus, SnapshotHealth } from './data-contract';

export interface DomainSnapshotEntry {
  status: SnapshotStatus;
  health: SnapshotHealth;
  version: number;
  updatedAt: string;
  buildTimeMs: number;
  lastReadAt: string | null;
  lastAccessedBy: string | null;
}

export interface SnapshotRegistry {
  userId: string;
  lastDirtyAt: string | null;
  lastBuild: string | null;
  kernelVersion: number;
  domains: {
    dashboard: DomainSnapshotEntry;
    planning: DomainSnapshotEntry;
    investment: DomainSnapshotEntry;
    liability: DomainSnapshotEntry;
    reports: DomainSnapshotEntry;
  };
  scheduler: {
    queueSize: number;
    running: boolean;
    retryCount: number;
    lastRunAt: string | null;
  };
}

const DEFAULT_ENTRY: DomainSnapshotEntry = {
  status: 'DIRTY',
  health: 'STALE',
  version: 0,
  updatedAt: '',
  buildTimeMs: 0,
  lastReadAt: null,
  lastAccessedBy: null,
};

function createDefaultRegistry(userId: string): SnapshotRegistry {
  return {
    userId,
    lastDirtyAt: null,
    lastBuild: null,
    kernelVersion: 1,
    domains: {
      dashboard: { ...DEFAULT_ENTRY },
      planning: { ...DEFAULT_ENTRY },
      investment: { ...DEFAULT_ENTRY },
      liability: { ...DEFAULT_ENTRY },
      reports: { ...DEFAULT_ENTRY },
    },
    scheduler: {
      queueSize: 0,
      running: false,
      retryCount: 0,
      lastRunAt: null,
    },
  };
}

export const snapshotRegistry = {
  async get(userId: string): Promise<SnapshotRegistry | null> {
    if (!userId) return null;
    try {
      const ref = doc(db, 'snapshot_registry', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) return snap.data() as SnapshotRegistry;
      return null;
    } catch (e) {
      logger.error('snapshot_registry_load_failed', userId, { error: String(e) });
      return null;
    }
  },

  async getOrCreate(userId: string): Promise<SnapshotRegistry> {
    const existing = await this.get(userId);
    if (existing) return existing;
    const fresh = createDefaultRegistry(userId);
    await this.save(userId, fresh);
    return fresh;
  },

  async save(userId: string, data: SnapshotRegistry): Promise<void> {
    if (!userId) return;
    try {
      const ref = doc(db, 'snapshot_registry', userId);
      await setDoc(ref, data, { merge: true });
    } catch (e) {
      logger.error('snapshot_registry_save_failed', userId, { error: String(e) });
    }
  },

  async updateDomain(
    userId: string,
    domain: keyof SnapshotRegistry['domains'],
    patch: Partial<DomainSnapshotEntry>,
  ): Promise<void> {
    if (!userId) return;
    try {
      const ref = doc(db, 'snapshot_registry', userId);
      await updateDoc(ref, {
        [`domains.${domain}.status`]: patch.status,
        [`domains.${domain}.health`]: patch.health,
        [`domains.${domain}.version`]: patch.version,
        [`domains.${domain}.updatedAt`]: patch.updatedAt,
        [`domains.${domain}.buildTimeMs`]: patch.buildTimeMs,
        [`domains.${domain}.lastReadAt`]: patch.lastReadAt,
        [`domains.${domain}.lastAccessedBy`]: patch.lastAccessedBy,
      });
    } catch (e) {
      logger.error('snapshot_registry_update_failed', userId, { domain, error: String(e) });
    }
  },

  async markDirty(userId: string, domain: keyof SnapshotRegistry['domains']): Promise<void> {
    return this.updateDomain(userId, domain, {
      status: 'DIRTY',
      health: 'STALE',
      updatedAt: new Date().toISOString(),
    });
  },

  async markBuilding(userId: string, domain: keyof SnapshotRegistry['domains']): Promise<void> {
    return this.updateDomain(userId, domain, {
      status: 'BUILDING',
      health: 'BUILDING',
      updatedAt: new Date().toISOString(),
    });
  },

  async markReady(userId: string, domain: keyof SnapshotRegistry['domains'], version: number, buildTimeMs: number): Promise<void> {
    return this.updateDomain(userId, domain, {
      status: 'READY',
      health: 'GOOD',
      version,
      buildTimeMs,
      updatedAt: new Date().toISOString(),
    });
  },

  async markFailed(userId: string, domain: keyof SnapshotRegistry['domains']): Promise<void> {
    return this.updateDomain(userId, domain, {
      status: 'FAILED',
      health: 'FAILED',
      updatedAt: new Date().toISOString(),
    });
  },

  async updateScheduler(userId: string, patch: Partial<SnapshotRegistry['scheduler']>): Promise<void> {
    if (!userId) return;
    try {
      const ref = doc(db, 'snapshot_registry', userId);
      const updates: Record<string, unknown> = {};
      if (patch.queueSize !== undefined) updates['scheduler.queueSize'] = patch.queueSize;
      if (patch.running !== undefined) updates['scheduler.running'] = patch.running;
      if (patch.retryCount !== undefined) updates['scheduler.retryCount'] = patch.retryCount;
      if (patch.lastRunAt !== undefined) updates['scheduler.lastRunAt'] = patch.lastRunAt;
      if (Object.keys(updates).length > 0) {
        await updateDoc(ref, updates);
      }
    } catch (e) {
      logger.error('snapshot_registry_scheduler_update_failed', userId, { error: String(e) });
    }
  },
};
