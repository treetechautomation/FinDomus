'use client';

import { useViewport } from './use-viewport';
import { BREAKPOINTS } from '@/constants/breakpoints';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

function resolveBreakpoint(width: number): Breakpoint {
  let bp: Breakpoint = 'xs';
  for (const entry of BREAKPOINTS) {
    if (width >= entry.min) bp = entry.key;
  }
  return bp;
}

export function useBreakpoint(): Breakpoint {
  const { width } = useViewport();
  return resolveBreakpoint(width);
}
