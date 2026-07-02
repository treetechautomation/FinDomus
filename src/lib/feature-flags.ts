'use client';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from './logger';

export interface FeatureFlags {
  dashboardSnapshot: boolean;
  planningSnapshot: boolean;
  investmentSnapshot: boolean;
  liabilitySnapshot: boolean;
  reportsSnapshot: boolean;
  schedulerEnabled: boolean;
  useSnapshotsForIA: boolean;
}

const DEFAULTS: FeatureFlags = {
  dashboardSnapshot: false,
  planningSnapshot: false,
  investmentSnapshot: false,
  liabilitySnapshot: false,
  reportsSnapshot: false,
  schedulerEnabled: false,
  useSnapshotsForIA: false,
};

let memoryCache: FeatureFlags | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000; // 1 minuto

export function getDefaultFlags(): FeatureFlags {
  return { ...DEFAULTS };
}

export async function getFeatureFlags(userId?: string): Promise<FeatureFlags> {
  if (memoryCache && Date.now() < cacheExpiresAt) return { ...memoryCache };

  try {
    const globalRef = doc(db, 'feature_flags', 'global');
    const globalSnap = await getDoc(globalRef);
    const global = globalSnap.exists() ? (globalSnap.data() as Partial<FeatureFlags>) : {};

    let user: Partial<FeatureFlags> = {};
    if (userId) {
      const userRef = doc(db, 'feature_flags', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) user = userSnap.data() as Partial<FeatureFlags>;
    }

    memoryCache = { ...DEFAULTS, ...global, ...user };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    return { ...memoryCache };
  } catch (e) {
    logger.warn('feature_flags_load_failed', userId, { error: String(e) });
    return { ...DEFAULTS };
  }
}

export function setFeatureFlagsMemory(flags: Partial<FeatureFlags>): void {
  memoryCache = { ...DEFAULTS, ...memoryCache, ...flags };
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
}

export function invalidateFeatureFlagsCache(): void {
  memoryCache = null;
  cacheExpiresAt = 0;
}
