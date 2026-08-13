'use client';

import { useEffect, useRef } from 'react';
import { useMobileContext } from '@/providers/mobile-provider';

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function usePageHeader(config: PageHeaderConfig) {
  const stable = useRef(config);
  stable.current = config;

  try {
    const { setHeaderTitle, setHeaderSubtitle, setHeaderBack } = useMobileContext();

    useEffect(() => {
      setHeaderTitle(stable.current.title);
      setHeaderSubtitle(stable.current.subtitle || '');
      setHeaderBack(stable.current.showBack ?? false);
    }, [setHeaderTitle, setHeaderSubtitle, setHeaderBack]);
  } catch {
    // not inside MobileProvider (desktop) — silently no-op
  }
}
