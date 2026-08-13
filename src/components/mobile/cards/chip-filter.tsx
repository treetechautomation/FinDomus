'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChipFilterProps {
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChipFilter({
  label,
  active = false,
  icon,
  count,
  disabled = false,
  loading = false,
  onClick,
  className,
}: ChipFilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-fd-1 fd-button-text px-fd-3 py-fd-1 transition-colors duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        active
          ? 'text-white'
          : 'text-fd-text-secondary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        borderRadius: 'var(--fd-radius-full)',
        minHeight: '44px',
        minWidth: '44px',
        backgroundColor: active
          ? 'var(--fd-color-action-primary)'
          : 'var(--fd-color-border-subtle)',
        color: active ? '#FFFFFF' : undefined,
        outlineColor: 'var(--fd-color-action-focus)',
        outlineOffset: '1px',
      }}
      role="checkbox"
      aria-checked={active}
      aria-label={`${label}${count !== undefined ? ` (${count})` : ''}`}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}

      <span className="truncate">{label}</span>

      {count !== undefined && !loading && (
        <span
          className="fd-supporting shrink-0"
          style={{
            color: active
              ? 'rgba(255,255,255,0.7)'
              : 'var(--fd-color-text-tertiary)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
