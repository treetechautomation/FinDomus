'use client';

import { useEffect } from 'react';
import { financialEvents } from '@/core/finance/events';
import { enqueueEvent, flushScheduler } from '@/lib/scheduler';

export function useScheduler(userId: string | undefined): void {
  useEffect(() => {
    if (!userId) return;

    const handler = (event: { type: string; payload?: any; source?: string }) => {
      enqueueEvent(userId, event.type);
    };

    financialEvents.on('transaction:created', handler);
    financialEvents.on('account:updated', handler);
    financialEvents.on('investment:created', handler);
    financialEvents.on('investment:updated', handler);
    financialEvents.on('investment:deleted', handler);
    financialEvents.on('liability:created', handler);
    financialEvents.on('liability:updated', handler);
    financialEvents.on('liability:deleted', handler);
    financialEvents.on('planning:updated', handler);
    financialEvents.on('recurring:updated', handler);
    financialEvents.on('month:closed', handler);
    financialEvents.on('month:reopened', handler);

    return () => {
      financialEvents.off('transaction:created', handler);
      financialEvents.off('account:updated', handler);
      financialEvents.off('investment:created', handler);
      financialEvents.off('investment:updated', handler);
      financialEvents.off('investment:deleted', handler);
      financialEvents.off('liability:created', handler);
      financialEvents.off('liability:updated', handler);
      financialEvents.off('liability:deleted', handler);
      financialEvents.off('planning:updated', handler);
      financialEvents.off('recurring:updated', handler);
      financialEvents.off('month:closed', handler);
      financialEvents.off('month:reopened', handler);
      flushScheduler();
    };
  }, [userId]);
}
