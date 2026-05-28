type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const _store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): { data: T; stale: boolean } | null {
  const entry = _store.get(key);
  if (!entry) return null;
  return {
    data: entry.data as T,
    stale: Date.now() > entry.expiresAt,
  };
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  _store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function cacheClear(): void {
  _store.clear();
}
