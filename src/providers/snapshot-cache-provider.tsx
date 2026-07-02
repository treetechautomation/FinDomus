'use client';

import React, { createContext, useContext, useRef, useCallback } from 'react';

const TTL_MAP: Record<string, number> = {
  dashboard: 30_000,
  planning: 120_000,
  investment: 300_000,
  liability: 300_000,
  reports: Infinity,
  feature_flags: 60_000,
};

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface SnapshotCacheContextType {
  get: (key: string) => any | null;
  set: (key: string, data: any) => void;
  has: (key: string) => boolean;
  del: (key: string) => void;
  clear: () => void;
}

const SnapshotCacheCtx = createContext<SnapshotCacheContextType | undefined>(undefined);

export function SnapshotCacheProvider({ children }: { children: React.ReactNode }) {
  const store = useRef(new Map<string, CacheEntry>());

  const get = useCallback((key: string) => {
    const entry = store.current.get(key);
    if (!entry) return null;

    const domain = key.split(':')[0];
    const ttl = TTL_MAP[domain] ?? 30_000;

    if (ttl !== Infinity && Date.now() - entry.timestamp > ttl) {
      store.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: any) => {
    store.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const has = useCallback((key: string) => {
    return get(key) !== null;
  }, [get]);

  const del = useCallback((key: string) => {
    store.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    store.current.clear();
  }, []);

  return (
    <SnapshotCacheCtx.Provider value={{ get, set, has, del, clear }}>
      {children}
    </SnapshotCacheCtx.Provider>
  );
}

export function useSnapshotCache() {
  const ctx = useContext(SnapshotCacheCtx);
  if (!ctx) throw new Error('useSnapshotCache deve ser usado dentro de SnapshotCacheProvider');
  return ctx;
}

export { TTL_MAP };
