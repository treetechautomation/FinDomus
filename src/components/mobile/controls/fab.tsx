'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FABProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
  position?: 'bottom-right' | 'bottom-center';
  className?: string;
}

export function FAB({
  icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  badge,
  position = 'bottom-right',
  className,
}: FABProps) {
  const hasLabel = !!label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-fd-2 fd-button-text',
        'active:scale-95 transition-transform duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        hasLabel ? 'px-fd-4' : 'px-0',
        className
      )}
      style={{
        height: 'var(--fd-fab-size)',
        minWidth: 'var(--fd-fab-size)',
        borderRadius: hasLabel ? 'var(--fd-radius-md)' : 'var(--fd-radius-full)',
        backgroundColor: disabled
          ? 'var(--fd-color-text-disabled)'
          : 'var(--fd-color-action-primary)',
        color: '#FFFFFF',
        boxShadow: 'var(--fd-shadow-float)',
        outlineColor: 'var(--fd-color-action-focus)',
        position: position === 'bottom-center' ? 'relative' : undefined,
        left: position === 'bottom-center' ? '50%' : undefined,
        transform: position === 'bottom-center' ? 'translateX(-50%)' : undefined,
      }}
      aria-label={label || 'Ação'}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      ) : (
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: 'var(--fd-icon-md)', height: 'var(--fd-icon-md)' }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {hasLabel && !loading && (
        <span className="truncate">{label}</span>
      )}

      {badge !== undefined && !loading && (
        <span
          className="absolute fd-supporting flex items-center justify-center"
          style={{
            top: '2px',
            right: '2px',
            minWidth: '20px',
            height: '20px',
            padding: '0 5px',
            borderRadius: 'var(--fd-radius-full)',
            backgroundColor: 'var(--fd-color-state-negative)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 600,
            lineHeight: 1,
          }}
          aria-label={`${badge} notificações`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
