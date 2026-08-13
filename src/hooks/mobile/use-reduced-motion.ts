'use client';

import * as React from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    setPrefersReducedMotion(mql.matches);

    function onChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}
