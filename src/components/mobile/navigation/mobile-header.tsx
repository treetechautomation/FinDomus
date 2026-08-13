'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function MobileHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const hasBack = showBack || !!onBack;

  return (
    <header
      className="sticky top-0 z-30 flex items-center w-full backdrop-blur-fd-subtle"
      style={{
        height: 'var(--fd-mobile-header-height)',
        background: 'color-mix(in srgb, var(--fd-color-canvas) 85%, transparent)',
        borderBottom: '1px solid var(--fd-color-border-subtle)',
        WebkitBackdropFilter: 'var(--fd-blur-subtle)',
        paddingLeft: 'var(--fd-space-2)',
        paddingRight: 'var(--fd-space-3)',
      }}
    >
      {/* ── Back Button ── */}
      {hasBack && (
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            className="flex items-center justify-center rounded-fd-sm
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-fdl-action-focus
                       hover:opacity-80 active:opacity-60 transition-opacity"
            style={{
              width: '44px',
              height: '44px',
              color: 'var(--fd-color-text-primary)',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      )}

      {/* ── Title Area ── */}
      <div
        className="flex flex-col justify-center min-w-0 flex-1"
        style={{ paddingLeft: hasBack ? '0px' : 'var(--fd-space-3)' }}
      >
        <h1
          className="truncate fd-heading-3"
          style={{
            color: 'var(--fd-color-text-primary)',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="truncate fd-supporting"
            style={{
              color: 'var(--fd-color-text-secondary)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Actions ── */}
      {actions && (
        <div className="flex items-center shrink-0 gap-fd-2">
          {actions}
        </div>
      )}
    </header>
  );
}
