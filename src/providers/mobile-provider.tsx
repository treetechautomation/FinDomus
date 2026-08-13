'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';

import { useViewport } from '@/hooks/mobile/use-viewport';
import { useOrientation } from '@/hooks/mobile/use-orientation';
import { useVirtualKeyboard } from '@/hooks/mobile/use-virtual-keyboard';
import { useSafeArea } from '@/hooks/mobile/use-safe-area';
import { useBreakpoint } from '@/hooks/mobile/use-breakpoint';
import { useReducedMotion } from '@/hooks/mobile/use-reduced-motion';

import type { ViewportState } from '@/hooks/mobile/use-viewport';
import type { OrientationState } from '@/hooks/mobile/use-orientation';
import type { VirtualKeyboardState } from '@/hooks/mobile/use-virtual-keyboard';
import type { SafeAreaState } from '@/hooks/mobile/use-safe-area';
import type { Breakpoint } from '@/hooks/mobile/use-breakpoint';

export interface MobileContextValue {
  viewport: ViewportState;
  orientation: OrientationState;
  virtualKeyboard: VirtualKeyboardState;
  safeArea: SafeAreaState;
  breakpoint: Breakpoint;
  prefersReducedMotion: boolean;

  shell: {
    headerVisible: boolean;
    bottomNavVisible: boolean;
    fabVisible: boolean;
  };

  header: {
    title: string;
    subtitle: string;
    showBack: boolean;
  };

  setHeaderVisible: (visible: boolean) => void;
  setBottomNavVisible: (visible: boolean) => void;
  setFabVisible: (visible: boolean) => void;

  setHeaderTitle: (title: string) => void;
  setHeaderSubtitle: (subtitle: string) => void;
  setHeaderBack: (showBack: boolean) => void;
}

const MobileContext = createContext<MobileContextValue | undefined>(undefined);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const viewport = useViewport();
  const orientation = useOrientation();
  const virtualKeyboard = useVirtualKeyboard();
  const safeArea = useSafeArea();
  const breakpoint = useBreakpoint();
  const prefersReducedMotion = useReducedMotion();

  const [headerVisible, setHeaderVisible] = React.useState(true);
  const [bottomNavVisible, setBottomNavVisible] = React.useState(true);
  const [fabVisible, setFabVisible] = React.useState(true);

  const [headerTitle, setHeaderTitleState] = React.useState('Início');
  const [headerSubtitle, setHeaderSubtitleState] = React.useState('');
  const [headerShowBack, setHeaderShowBackState] = React.useState(false);

  const setHeaderVisibleCb = useCallback((visible: boolean) => {
    setHeaderVisible(visible);
  }, []);

  const setBottomNavVisibleCb = useCallback((visible: boolean) => {
    setBottomNavVisible(visible);
  }, []);

  const setFabVisibleCb = useCallback((visible: boolean) => {
    setFabVisible(visible);
  }, []);

  const setHeaderTitle = useCallback((title: string) => {
    setHeaderTitleState(title);
  }, []);

  const setHeaderSubtitle = useCallback((subtitle: string) => {
    setHeaderSubtitleState(subtitle);
  }, []);

  const setHeaderBack = useCallback((showBack: boolean) => {
    setHeaderShowBackState(showBack);
  }, []);

  const value = useMemo<MobileContextValue>(
    () => ({
      viewport,
      orientation,
      virtualKeyboard,
      safeArea,
      breakpoint,
      prefersReducedMotion,
      shell: {
        headerVisible,
        bottomNavVisible,
        fabVisible,
      },
      header: {
        title: headerTitle,
        subtitle: headerSubtitle,
        showBack: headerShowBack,
      },
      setHeaderVisible: setHeaderVisibleCb,
      setBottomNavVisible: setBottomNavVisibleCb,
      setFabVisible: setFabVisibleCb,
      setHeaderTitle,
      setHeaderSubtitle,
      setHeaderBack,
    }),
    [
      viewport,
      orientation,
      virtualKeyboard,
      safeArea,
      breakpoint,
      prefersReducedMotion,
      headerVisible,
      bottomNavVisible,
      fabVisible,
      headerTitle,
      headerSubtitle,
      headerShowBack,
      setHeaderVisibleCb,
      setBottomNavVisibleCb,
      setFabVisibleCb,
      setHeaderTitle,
      setHeaderSubtitle,
      setHeaderBack,
    ]
  );

  return (
    <MobileContext.Provider value={value}>{children}</MobileContext.Provider>
  );
}

export function useMobileContext(): MobileContextValue {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error(
      'useMobileContext deve ser usado dentro de um MobileProvider'
    );
  }
  return context;
}
