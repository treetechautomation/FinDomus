'use client';

import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from './logger';

export type MetricName =
  | 'firestore_reads'
  | 'firestore_writes'
  | 'cache_hits'
  | 'snapshot_hits'
  | 'scheduler_jobs'
  | 'snapshot_build_time_ms'
  | 'ai_calls'
  | 'ai_tokens'
  | 'ai_execution_time_ms'
  | 'estimated_cost';

interface MetricPayload {
  userId?: string;
  metric: MetricName;
  value: number;
  domain?: string;
  extra?: Record<string, unknown>;
}

let buffer: MetricPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL_MS = 30_000;

function flush(): void {
  if (buffer.length === 0) return;

  const batch = [...buffer];
  buffer = [];

  batch.forEach((m) => {
    try {
      addDoc(collection(db, 'system_metrics'), {
        userId: m.userId || 'anonymous',
        metric: m.metric,
        value: m.value,
        domain: m.domain || 'global',
        extra: m.extra || {},
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    } catch {
      /* fire-and-forget */
    }
  });

  logger.info('system_metrics_flushed', undefined, { count: batch.length });
}

export const metrics = {
  track(userId: string | undefined, metric: MetricName, value: number, domain?: string, extra?: Record<string, unknown>): void {
    buffer.push({ userId, metric, value, domain, extra });

    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        flush();
        flushTimer = null;
      }, FLUSH_INTERVAL_MS);
    }

    if (buffer.length >= 50) {
      if (flushTimer) clearTimeout(flushTimer);
      flush();
      flushTimer = null;
    }
  },

  increment(userId: string | undefined, metric: MetricName, by = 1, domain?: string): void {
    this.track(userId, metric, by, domain);
  },

  flushNow(): void {
    if (flushTimer) clearTimeout(flushTimer);
    flush();
    flushTimer = null;
  },
};

export type { MetricPayload };
