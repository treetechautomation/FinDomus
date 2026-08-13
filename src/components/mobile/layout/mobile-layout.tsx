'use client';

import React from 'react';

export interface MobileLayoutProps {
  children: React.ReactNode;
  headerSlot?: React.ReactNode;
  bottomNavSlot?: React.ReactNode;
  fabSlot?: React.ReactNode;
}

export function MobileLayout({
  children,
  headerSlot,
  bottomNavSlot,
  fabSlot,
}: MobileLayoutProps) {
  return (
    <div
      className="fd-surface-canvas relative flex flex-col min-h-dvh w-full overflow-hidden"
      style={{
        paddingTop: 'var(--fd-safe-area-top)',
        paddingBottom: 'var(--fd-safe-area-bottom)',
        paddingLeft: 'var(--fd-safe-area-left)',
        paddingRight: 'var(--fd-safe-area-right)',
      }}
    >
      {/* ── HEADER SLOT ── */}
      <div className="shrink-0 z-30">
        {headerSlot ?? (
          <PlaceholderHeader />
        )}
      </div>

      {/* ── CONTENT SLOT (scrollable) ── */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="px-fd-4 pb-fd-16">
          {children}
        </div>
      </main>

      {/* ── BOTTOM NAV SLOT ── */}
      <div className="shrink-0 z-30">
        {bottomNavSlot ?? (
          <PlaceholderBottomNav />
        )}
      </div>

      {/* ── FAB SLOT ── */}
      {fabSlot !== undefined && (
        <div
          className="absolute z-40"
          style={{
            right: 'var(--fd-fab-margin)',
            bottom: 'calc(var(--fd-bottom-nav-height) + var(--fd-fab-margin) + var(--fd-safe-area-bottom))',
          }}
        >
          {fabSlot}
        </div>
      )}

      {/* ── KEYBOARD SPACER (virtual keyboard support) ── */}
      <div id="fd-keyboard-spacer" className="shrink-0 hidden" />
    </div>
  );
}

/* ─── Placeholders ──────────────────────────────────────────────────────── */

function PlaceholderHeader() {
  return (
    <div
      className="flex items-center px-fd-4"
      style={{ height: 'var(--fd-mobile-header-height)' }}
    >
      <div className="flex items-center gap-fd-2 w-full">
        <div className="w-fd-8 h-fd-8 rounded-fd-sm" style={{ background: 'var(--fd-color-surface-raised)' }} />
        <div
          className="flex-1 h-fd-4 rounded-fd-sm"
          style={{ background: 'var(--fd-color-surface-raised)' }}
        />
        <div className="w-fd-8 h-fd-8 rounded-full" style={{ background: 'var(--fd-color-surface-raised)' }} />
      </div>
    </div>
  );
}

function PlaceholderBottomNav() {
  const slots = 5;

  return (
    <div
      className="flex items-center justify-around px-fd-4"
      style={{
        height: 'var(--fd-bottom-nav-height)',
        background: 'var(--fd-color-surface-raised)',
        borderTop: '1px solid var(--fd-color-border-subtle)',
        backdropFilter: 'var(--fd-blur-subtle)',
        WebkitBackdropFilter: 'var(--fd-blur-subtle)',
      }}
    >
      {Array.from({ length: slots }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-fd-1"
        >
          <div
            className="w-fd-6 h-fd-6 rounded-fd-sm"
            style={{ background: 'var(--fd-color-surface-floating)' }}
          />
          <div
            className="w-fd-8 h-fd-2 rounded-full"
            style={{ background: 'var(--fd-color-surface-floating)' }}
          />
        </div>
      ))}
    </div>
  );
}
