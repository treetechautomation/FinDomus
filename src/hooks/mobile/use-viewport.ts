'use client';

import * as React from 'react';
import { MOBILE_MAX, LG } from '@/constants/breakpoints';

const TABLET_MAX = LG - 1;

export interface ViewportState {
  width: number;
  height: number;
  dpr: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const SSR_STATE: ViewportState = {
  width: 0,
  height: 0,
  dpr: 1,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

export function useViewport(): ViewportState {
  const [viewport, setViewport] = React.useState<ViewportState>(SSR_STATE);

  React.useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewport({
        width: w,
        height: h,
        dpr: window.devicePixelRatio || 1,
        isMobile: w <= MOBILE_MAX,
        isTablet: w > MOBILE_MAX && w <= TABLET_MAX,
        isDesktop: w > TABLET_MAX,
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
