'use client';

import * as React from 'react';

export interface SafeAreaState {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const SSR_STATE: SafeAreaState = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

function parseToken(value: string): number {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : 0;
}

export function useSafeArea(): SafeAreaState {
  const [safeArea, setSafeArea] = React.useState<SafeAreaState>(SSR_STATE);

  React.useEffect(() => {
    const style = getComputedStyle(document.documentElement);

    setSafeArea({
      top: parseToken(style.getPropertyValue('--fd-safe-area-top')),
      bottom: parseToken(style.getPropertyValue('--fd-safe-area-bottom')),
      left: parseToken(style.getPropertyValue('--fd-safe-area-left')),
      right: parseToken(style.getPropertyValue('--fd-safe-area-right')),
    });
  }, []);

  return safeArea;
}
