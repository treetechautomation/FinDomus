'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useVisibility } from '@/providers/visibility-provider';

export interface MetricDualCardProps {
  leftLabel: string;
  leftValue: string | number;
  rightLabel: string;
  rightValue: string | number;
  leftSupportingText?: string;
  rightSupportingText?: string;
  className?: string;
  loading?: boolean;
}

function MetricColumn({
  label,
  value,
  supportingText,
  privacyActive,
  align,
}: {
  label: string;
  value: string | number;
  supportingText?: string;
  privacyActive: boolean;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={cn('flex flex-col min-w-0 flex-1', {
        'items-start text-left': align === 'left',
        'items-end text-right': align === 'right',
      })}
    >
      <span
        className="fd-caption"
        style={{ color: 'var(--fd-color-text-secondary)' }}
      >
        {label}
      </span>

      <span
        className={cn('fd-heading-2 fd-tabular-nums mt-fd-1', {
          'fd-privacy-hidden': privacyActive,
        })}
        style={{ color: 'var(--fd-color-text-primary)' }}
        aria-label={
          privacyActive ? 'Valor oculto por privacidade' : `${label}: ${value}`
        }
      >
        {privacyActive ? '••••••••••' : value}
      </span>

      {supportingText && (
        <span
          className={cn('fd-supporting mt-fd-1', {
            'fd-privacy-hidden': privacyActive,
          })}
          style={{ color: 'var(--fd-color-text-tertiary)' }}
        >
          {privacyActive ? '••••••••••' : supportingText}
        </span>
      )}
    </div>
  );
}

export function MetricDualCard({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftSupportingText,
  rightSupportingText,
  className,
  loading = false,
}: MetricDualCardProps) {
  const { showFinancialValues, isMounted } = useVisibility();
  const privacyActive = isMounted && !showFinancialValues;

  if (loading || !isMounted) {
    return (
      <div
        className={cn(
          'fd-surface-raised p-fd-4 flex items-stretch gap-fd-4',
          className
        )}
        role="status"
        aria-label="Carregando métricas"
      >
        <div className="flex flex-col gap-fd-2 flex-1">
          <Skeleton
            className="h-3 w-16 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-6 w-24 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-3 w-20 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
        </div>
        <div
          className="shrink-0 w-px"
          style={{ backgroundColor: 'var(--fd-color-border-subtle)' }}
        />
        <div className="flex flex-col gap-fd-2 flex-1 items-end">
          <Skeleton
            className="h-3 w-16 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-6 w-24 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-3 w-20 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fd-surface-raised p-fd-4 flex items-stretch gap-fd-4',
        className
      )}
      role="region"
      aria-label={`Métricas: ${leftLabel} e ${rightLabel}`}
    >
      <MetricColumn
        label={leftLabel}
        value={leftValue}
        supportingText={leftSupportingText}
        privacyActive={privacyActive}
        align="left"
      />

      <div
        className="shrink-0 w-px"
        style={{ backgroundColor: 'var(--fd-color-border-default)' }}
        aria-hidden="true"
      />

      <MetricColumn
        label={rightLabel}
        value={rightValue}
        supportingText={rightSupportingText}
        privacyActive={privacyActive}
        align="right"
      />
    </div>
  );
}
