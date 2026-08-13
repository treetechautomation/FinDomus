'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useVisibility } from '@/providers/visibility-provider';

export interface ListItemCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  value?: string | number;
  badge?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

function ListItemCardContent({
  title,
  subtitle,
  description,
  icon,
  avatar,
  value,
  badge,
  showChevron,
  privacyActive,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  value?: string | number;
  badge?: React.ReactNode;
  showChevron?: boolean;
  privacyActive: boolean;
}) {
  const leadingSlot = icon || avatar;
  const hasLeading = !!leadingSlot;
  const hasTrailing = value !== undefined || badge !== undefined || showChevron;

  return (
    <>
      {hasLeading && (
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 'var(--fd-icon-lg)',
            height: 'var(--fd-icon-lg)',
            borderRadius: avatar ? 'var(--fd-radius-full)' : 'var(--fd-radius-sm)',
            backgroundColor: avatar ? 'var(--fd-color-border-subtle)' : 'transparent',
            color: 'var(--fd-color-text-secondary)',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {leadingSlot}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="fd-heading-3 truncate" style={{ color: 'var(--fd-color-text-primary)' }}>
          {title}
        </div>
        {subtitle && (
          <div className="fd-body mt-fd-1 truncate" style={{ color: 'var(--fd-color-text-secondary)' }}>
            {subtitle}
          </div>
        )}
        {description && (
          <div className="fd-supporting mt-fd-1" style={{ color: 'var(--fd-color-text-tertiary)' }}>
            {description}
          </div>
        )}
      </div>

      {hasTrailing && (
        <div className="shrink-0 flex items-center gap-fd-2">
          {value !== undefined && (
            <span
              className={cn('fd-heading-3 fd-tabular-nums', {
                'fd-privacy-hidden': privacyActive,
              })}
              style={{ color: 'var(--fd-color-text-primary)' }}
              aria-label={
                privacyActive ? 'Valor oculto por privacidade' : String(value)
              }
            >
              {privacyActive ? '••••••••••' : value}
            </span>
          )}
          {badge && <span aria-hidden="true">{badge}</span>}
          {showChevron && (
            <ChevronRight
              size={16}
              style={{ color: 'var(--fd-color-text-tertiary)' }}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </>
  );
}

export function ListItemCard({
  title,
  subtitle,
  description,
  icon,
  avatar,
  value,
  badge,
  showChevron = false,
  onClick,
  className,
  loading = false,
}: ListItemCardProps) {
  const { showFinancialValues, isMounted } = useVisibility();
  const privacyActive = isMounted && !showFinancialValues;

  if (loading || !isMounted) {
    return (
      <div
        className={cn(
          'fd-surface-raised p-fd-4 flex items-center gap-fd-3',
          className
        )}
        role="status"
        aria-label="Carregando item"
      >
        <Skeleton
          className="h-8 w-8 shrink-0 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
        <div className="flex-1 min-w-0 space-y-fd-2">
          <Skeleton
            className="h-4 w-2/3 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
          <Skeleton
            className="h-3 w-1/2 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
        </div>
        <Skeleton
          className="h-4 w-4 shrink-0 rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
      </div>
    );
  }

  const isInteractive = !!onClick;
  const Tag = isInteractive ? 'button' : 'div';

  const interactiveProps = isInteractive
    ? ({
        type: 'button' as const,
        onClick,
        role: undefined,
      } as const)
    : {};

  return (
    <Tag
      className={cn(
        'fd-surface-raised p-fd-4 flex items-center gap-fd-3 w-full text-left',
        isInteractive &&
          'cursor-pointer active:brightness-90 transition-[filter] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fdl-action-focus focus-visible:ring-offset-1 focus-visible:rounded-fd-sm',
        className
      )}
      style={isInteractive ? { minHeight: '44px' } : undefined}
      role={isInteractive ? undefined : 'region'}
      aria-label={isInteractive ? title : undefined}
      {...interactiveProps}
    >
      <ListItemCardContent
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
        avatar={avatar}
        value={value}
        badge={badge}
        showChevron={showChevron}
        privacyActive={privacyActive}
      />
    </Tag>
  );
}
