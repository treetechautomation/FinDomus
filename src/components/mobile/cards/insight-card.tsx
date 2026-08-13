'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export type InsightSeverity = 'info' | 'success' | 'warning' | 'negative';

export interface InsightCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  severity?: InsightSeverity;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
  loading?: boolean;
}

const severityConfig: Record<
  InsightSeverity,
  { color: string; softColor: string; defaultIcon: LucideIcon }
> = {
  info: {
    color: 'var(--fd-color-action-primary)',
    softColor: 'var(--fd-color-action-primary-soft)',
    defaultIcon: Info,
  },
  success: {
    color: 'var(--fd-color-state-positive)',
    softColor: 'var(--fd-color-state-positive-soft)',
    defaultIcon: Lightbulb,
  },
  warning: {
    color: 'var(--fd-color-state-warning)',
    softColor: 'var(--fd-color-state-warning-soft)',
    defaultIcon: AlertTriangle,
  },
  negative: {
    color: 'var(--fd-color-state-negative)',
    softColor: 'var(--fd-color-state-negative-soft)',
    defaultIcon: AlertCircle,
  },
};

export function InsightCard({
  title,
  description,
  icon: IconProp,
  severity = 'info',
  ctaLabel,
  onCtaClick,
  className,
  loading = false,
}: InsightCardProps) {
  const config = severityConfig[severity];
  const Icon = IconProp ?? config.defaultIcon;

  if (loading) {
    return (
      <div
        className={cn(
          'fd-surface-raised p-fd-4 flex flex-col gap-fd-3',
          className
        )}
        role="status"
        aria-label="Carregando insight"
      >
        <div className="flex items-start gap-fd-3">
          <Skeleton
            className="h-8 w-8 shrink-0 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <div className="flex-1 space-y-fd-2">
            <Skeleton
              className="h-4 w-3/4 rounded-fd-sm"
              style={{ background: 'var(--fd-color-border-subtle)' }}
            />
            <Skeleton
              className="h-3 w-full rounded-fd-sm"
              style={{ background: 'var(--fd-color-border-subtle)' }}
            />
            <Skeleton
              className="h-3 w-5/6 rounded-fd-sm"
              style={{ background: 'var(--fd-color-border-subtle)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('fd-surface-raised p-fd-4 flex flex-col gap-fd-3', className)}
      role="region"
      aria-label={`Insight: ${title}`}
    >
      <div className="flex items-start gap-fd-3">
        <div
          className="flex items-center justify-center shrink-0 rounded-fd-sm"
          style={{
            width: 'var(--fd-icon-lg)',
            height: 'var(--fd-icon-lg)',
            backgroundColor: config.softColor,
            color: config.color,
          }}
          aria-hidden="true"
        >
          <Icon size={16} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="fd-heading-3 truncate"
            style={{ color: 'var(--fd-color-text-primary)' }}
          >
            {title}
          </h3>
          <p
            className="fd-body mt-fd-1"
            style={{ color: 'var(--fd-color-text-secondary)' }}
          >
            {description}
          </p>
        </div>
      </div>

      {ctaLabel && onCtaClick && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCtaClick}
            className="fd-button-text h-auto py-fd-1 px-fd-2"
            style={{
              color: config.color,
              minHeight: '44px',
              minWidth: '44px',
            }}
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
