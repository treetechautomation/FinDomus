'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/layout/mobile-layout';
import { MobileHeader } from '@/components/mobile/navigation/mobile-header';
import { BottomNavigation } from '@/components/mobile/navigation/bottom-nav';
import { MobileProvider, useMobileContext } from '@/providers/mobile-provider';
import { PwaInstallButton } from '@/components/pwa/install-prompt';

const DesktopShell = dynamic(
  () =>
    import('@/app/(main)/desktop-shell').then((m) => ({
      default: m.DesktopShell,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: 'var(--fd-color-canvas, #0A0E14)',
        }}
      />
    ),
  }
);

export interface LayoutRouterProps {
  children: React.ReactNode;
}

function PageHeader() {
  const { header } = useMobileContext();
  return (
    <MobileHeader
      title={header.title}
      subtitle={header.subtitle || undefined}
      showBack={header.showBack}
    />
  );
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileProvider>
      <MobileLayout
        headerSlot={
          <PageHeader />
        }
        bottomNavSlot={<BottomNavigation />}
      >
        {children}
      </MobileLayout>
    </MobileProvider>
  );
}

export function LayoutRouter({ children }: LayoutRouterProps) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: 'var(--fd-color-canvas, #0A0E14)',
        }}
      />
    );
  }

  if (isMobile) {
    return <MobileShell>{children}</MobileShell>;
  }

  return <DesktopShell>{children}</DesktopShell>;
}
