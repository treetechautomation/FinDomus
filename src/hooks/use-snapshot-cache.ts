'use client';

import { useSnapshotCache } from '@/providers/snapshot-cache-provider';
import { readDashboardSnapshot } from '@/lib/dashboard-snapshot-service';
import { readPlanningSnapshot } from '@/lib/planning-snapshot-service';
import { readInvestmentSnapshot } from '@/lib/investment-snapshot-service';
import { readLiabilitySnapshot } from '@/lib/liability-snapshot-service';
import { readReportsSnapshot } from '@/lib/reports-snapshot-service';
import { getFeatureFlags } from '@/lib/feature-flags';

function cacheKey(domain: string, userId: string, extra?: string): string {
  return extra ? `${domain}:${userId}:${extra}` : `${domain}:${userId}`;
}

export function useDashboardSnapshot() {
  const cache = useSnapshotCache();

  return async (userId: string) => {
    const key = cacheKey('dashboard', userId);
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await readDashboardSnapshot(userId);
    if (result.data && result.source === 'snapshot') {
      cache.set(key, { ...result, _cached: true });
    }
    return result;
  };
}

export function usePlanningSnapshot() {
  const cache = useSnapshotCache();

  return async (userId: string) => {
    const key = cacheKey('planning', userId);
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await readPlanningSnapshot(userId);
    if (result.data && result.source === 'snapshot') {
      cache.set(key, { ...result, _cached: true });
    }
    return result;
  };
}

export function useInvestmentSnapshot() {
  const cache = useSnapshotCache();

  return async (userId: string) => {
    const key = cacheKey('investment', userId);
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await readInvestmentSnapshot(userId);
    if (result.data && result.source === 'snapshot') {
      cache.set(key, { ...result, _cached: true });
    }
    return result;
  };
}

export function useLiabilitySnapshot() {
  const cache = useSnapshotCache();

  return async (userId: string) => {
    const key = cacheKey('liability', userId);
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await readLiabilitySnapshot(userId);
    if (result.data && result.source === 'snapshot') {
      cache.set(key, { ...result, _cached: true });
    }
    return result;
  };
}

export function useReportsSnapshot() {
  const cache = useSnapshotCache();

  return async (userId: string, owner: string, monthKey: string) => {
    const key = cacheKey('reports', userId, `${owner}_${monthKey}`);
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await readReportsSnapshot(userId, owner, monthKey);
    if (result.data && result.source === 'snapshot') {
      cache.set(key, { ...result, _cached: true });
    }
    return result;
  };
}

export function useCachedFeatureFlags() {
  const cache = useSnapshotCache();

  return async (userId?: string) => {
    const key = cacheKey('feature_flags', userId || 'global');
    const cached = cache.get(key);
    if (cached) return cached;

    const flags = await getFeatureFlags(userId);
    cache.set(key, flags);
    return flags;
  };
}

export function useInvalidateSnapshot() {
  const cache = useSnapshotCache();

  return (domain: string, userId: string) => {
    cache.del(cacheKey(domain, userId));
  };
}
