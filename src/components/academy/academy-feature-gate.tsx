'use client';

import { useAcademy } from './academy-provider';
import type { FeatureGate } from '@/academy/academy-types';

export function AcademyFeatureGate({
  gate,
  children,
  fallback = null,
}: {
  gate: FeatureGate;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { unlockedFeatures } = useAcademy();
  if (unlockedFeatures.includes(gate)) return <>{children}</>;
  return <>{fallback}</>;
}
