'use client';

import { useAuth } from '@/providers/auth-provider';
import { useScheduler } from '@/hooks/use-scheduler';

export function SchedulerInit(): null {
  const { user } = useAuth();
  useScheduler(user?.uid);
  return null;
}
