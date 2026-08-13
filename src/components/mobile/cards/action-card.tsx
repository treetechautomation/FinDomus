'use client';

import React from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export interface ActionCardProps {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryClick: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  secondaryDisabled?: boolean;
  className?: string;
  loading?: boolean;
}

export function ActionCard({
  title,
  description,
  primaryLabel,
  onPrimaryClick,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel,
  onSecondaryClick,
  secondaryDisabled = false,
  className,
  loading = false,
}: ActionCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'fd-surface-raised p-fd-4 flex flex-col gap-fd-3',
          className
        )}
        role="status"
        aria-label="Carregando ação"
      >
        <Skeleton
          className="h-4 w-2/3 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <Skeleton
          className="h-3 w-full rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <Skeleton
          className="h-3 w-1/2 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <div className="flex gap-fd-2 mt-fd-2">
          <Skeleton
            className="h-11 w-28 rounded-fd-control"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-11 w-20 rounded-fd-control"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('fd-surface-raised p-fd-4 flex flex-col gap-fd-3', className)}
      role="region"
      aria-label={`Ação: ${title}`}
    >
      <div className="flex-1">
        <h3
          className="fd-heading-3"
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

      <div className="flex items-center gap-fd-2">
        {secondaryLabel && onSecondaryClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSecondaryClick}
            disabled={secondaryDisabled}
            className="fd-button-text h-auto py-fd-2 px-fd-3"
            style={{
              color: 'var(--fd-color-text-secondary)',
              minHeight: '44px',
              minWidth: '44px',
            }}
            aria-label={secondaryLabel}
          >
            {secondaryLabel}
          </Button>
        )}

        <Button
          size="sm"
          onClick={onPrimaryClick}
          disabled={primaryDisabled || primaryLoading}
          className="fd-button-text h-auto py-fd-2 px-fd-4 gap-fd-2"
          style={{
            backgroundColor: 'var(--fd-color-action-primary)',
            color: '#FFFFFF',
            minHeight: '44px',
            minWidth: '44px',
            borderRadius: 'var(--fd-radius-control)',
          }}
          aria-label={primaryLabel}
          aria-busy={primaryLoading}
        >
          {primaryLoading && (
            <Loader2
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          )}
          {primaryLabel}
          {!primaryLoading && (
            <ChevronRight size={16} aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
