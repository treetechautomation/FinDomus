'use client';

import React, { useEffect, useState } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useVisibility } from '@/providers/visibility-provider';

export type ProgressStatus = 'positive' | 'warning' | 'negative' | 'neutral';

export interface ProgressCardProps {
  title: string;
  value: string | number;
  percent: number;
  supportingText?: string;
  status?: ProgressStatus;
  className?: string;
  loading?: boolean;
}

const statusConfig: Record<ProgressStatus, { color: string; softColor: string }> = {
  positive: {
    color: 'var(--fd-color-state-positive)',
    softColor: 'var(--fd-color-state-positive-soft)',
  },
  warning: {
    color: 'var(--fd-color-state-warning)',
    softColor: 'var(--fd-color-state-warning-soft)',
  },
  negative: {
    color: 'var(--fd-color-state-negative)',
    softColor: 'var(--fd-color-state-negative-soft)',
  },
  neutral: {
    color: 'var(--fd-color-action-primary)',
    softColor: 'var(--fd-color-action-primary-soft)',
  },
};

export function ProgressCard({
  title,
  value,
  percent,
  supportingText,
  status = 'neutral',
  className,
  loading = false,
}: ProgressCardProps) {
  const { showFinancialValues, isMounted } = useVisibility();
  const privacyActive = isMounted && !showFinancialValues;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    if (!loading && isMounted) {
      const raf = requestAnimationFrame(() => {
        setAnimatedPercent(Math.min(100, Math.max(0, percent)));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimatedPercent(0);
    }
  }, [percent, loading, isMounted]);

  const config = statusConfig[status];
  const clampedPercent = Math.min(100, Math.max(0, percent));

  if (loading || !isMounted) {
    return (
      <div
        className={cn(
          'fd-surface-raised p-fd-4 flex flex-col gap-fd-3',
          className
        )}
        role="status"
        aria-label="Carregando progresso"
      >
        <Skeleton
          className="h-3 w-16 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <div className="flex items-baseline gap-fd-2">
          <Skeleton
            className="h-6 w-24 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-3 w-10 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
        </div>
        <Skeleton
          className="h-2 w-full rounded-fd-full"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <Skeleton
          className="h-3 w-28 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fd-surface-raised p-fd-4 flex flex-col gap-fd-3',
        className
      )}
      role="region"
      aria-label={`Progresso: ${title}`}
    >
      <span
        className="fd-caption"
        style={{ color: 'var(--fd-color-text-secondary)' }}
      >
        {title}
      </span>

      <div className="flex items-baseline gap-fd-2">
        <span
          className={cn('fd-heading-2 fd-tabular-nums', {
            'fd-privacy-hidden': privacyActive,
          })}
          style={{ color: 'var(--fd-color-text-primary)' }}
          aria-label={
            privacyActive ? 'Valor oculto por privacidade' : `${title}: ${value}`
          }
        >
          {privacyActive ? '••••••••••' : value}
        </span>
        <span
          className={cn('fd-supporting fd-tabular-nums', {
            'fd-privacy-hidden': privacyActive,
          })}
          style={{ color: config.color }}
          aria-label={
            privacyActive
              ? 'Percentual oculto por privacidade'
              : `${clampedPercent}%`
          }
        >
          {privacyActive ? '••••••••••' : `${clampedPercent}%`}
        </span>
      </div>

      <ProgressPrimitive.Root
        className="relative h-2 w-full overflow-hidden rounded-fd-full"
        style={{ backgroundColor: config.softColor }}
        value={animatedPercent}
        aria-label={`Progresso: ${clampedPercent}%`}
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 rounded-fd-full"
          style={{
            backgroundColor: config.color,
            transform: `translateX(-${100 - animatedPercent}%)`,
            transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
          }}
        />
      </ProgressPrimitive.Root>

      {supportingText && (
        <span
          className={cn('fd-supporting', {
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
