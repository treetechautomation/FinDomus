'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useVisibility } from '@/providers/visibility-provider';

export interface HeroCardProps {
  value: string | number;
  label: string;
  variation?: {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
  };
  supportingText?: string;
  className?: string;
  loading?: boolean;
}

function VariationIndicator({
  direction,
  children,
}: {
  direction?: 'up' | 'down' | 'neutral';
  children: React.ReactNode;
}) {
  const iconMap = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };
  const colorMap = {
    up: 'var(--fd-color-state-positive)',
    down: 'var(--fd-color-state-negative)',
    neutral: 'var(--fd-color-text-tertiary)',
  };
  const Icon = iconMap[direction ?? 'neutral'];

  return (
    <span
      className="inline-flex items-center gap-fd-1 fd-supporting"
      style={{ color: colorMap[direction ?? 'neutral'] }}
      role="status"
      aria-label={`Variação: ${direction === 'up' ? 'positiva' : direction === 'down' ? 'negativa' : 'neutra'}`}
    >
      <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
      {children}
    </span>
  );
}

export function HeroCard({
  value,
  label,
  variation,
  supportingText,
  className,
  loading = false,
}: HeroCardProps) {
  const { showFinancialValues, isMounted } = useVisibility();
  const privacyActive = isMounted && !showFinancialValues;

  if (loading || !isMounted) {
    return (
      <div
        className={cn(
          'fd-surface-raised p-fd-4 flex flex-col gap-fd-3',
          className
        )}
        role="status"
        aria-label="Carregando valor principal"
      >
        <Skeleton
          className="h-3 w-20 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <Skeleton
          className="h-9 w-40 rounded-fd-sm"
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
        'fd-surface-raised p-fd-4 flex flex-col gap-fd-2',
        className
      )}
      role="region"
      aria-label={label}
    >
      <span
        className="fd-caption"
        style={{ color: 'var(--fd-color-text-secondary)' }}
      >
        {label}
      </span>

      <span
        className={cn('fd-financial-hero fd-tabular-nums', {
          'fd-privacy-hidden': privacyActive,
        })}
        style={{ color: 'var(--fd-color-text-primary)' }}
        aria-label={
          privacyActive ? 'Valor oculto por privacidade' : `${label}: ${value}`
        }
      >
        {privacyActive ? '••••••••••' : value}
      </span>

      <div className="flex items-center gap-fd-3">
        {variation && !privacyActive && (
          <VariationIndicator direction={variation.direction}>
            {variation.value}
          </VariationIndicator>
        )}
        {supportingText && (
          <span
            className="fd-supporting"
            style={{ color: 'var(--fd-color-text-tertiary)' }}
          >
            {supportingText}
          </span>
        )}
      </div>
    </div>
  );
}
