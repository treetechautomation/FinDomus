'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export type BottomSheetMaxHeight = 'auto' | 'medium' | 'large' | 'full';

const maxHeightMap: Record<BottomSheetMaxHeight, string> = {
  auto: 'fit-content',
  medium: '50dvh',
  large: '75dvh',
  full: '92dvh',
};

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: BottomSheetMaxHeight | string;
  loading?: boolean;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxHeight = 'auto',
  loading = false,
  className,
}: BottomSheetProps) {
  const resolvedMaxHeight =
    maxHeight in maxHeightMap ? maxHeightMap[maxHeight as BottomSheetMaxHeight] : maxHeight;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
          style={{ backgroundColor: 'var(--fd-color-overlay-scrim)' }}
        />

        <DialogPrimitive.Content
          className={cn(
            'fixed z-50 flex flex-col',
            'inset-x-0 bottom-0',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'data-[state=closed]:duration-200 data-[state=open]:duration-300',
            'focus-visible:outline-none',
            className
          )}
          style={{
            backgroundColor: 'var(--fd-color-surface-floating)',
            borderTopLeftRadius: 'var(--fd-radius-lg)',
            borderTopRightRadius: 'var(--fd-radius-lg)',
            maxHeight: resolvedMaxHeight,
            boxShadow: 'var(--fd-shadow-overlay)',
          }}
          aria-labelledby={title ? 'fd-bottomsheet-title' : undefined}
          aria-describedby={description ? 'fd-bottomsheet-description' : undefined}
          aria-modal="true"
        >
          <div
            className="flex justify-center pt-fd-3 pb-fd-2 shrink-0"
            aria-hidden="true"
          >
            <div
              style={{
                width: '36px',
                height: '5px',
                borderRadius: '2.5px',
                backgroundColor: 'var(--fd-color-border-emphasis)',
              }}
            />
          </div>

          <div className="px-fd-4 shrink-0">
            {loading ? (
              <div className="flex flex-col gap-fd-2 py-fd-2">
                <Skeleton
                  className="h-5 w-1/3 rounded-fd-sm"
                  style={{ background: 'var(--fd-color-border-subtle)' }}
                />
                <Skeleton
                  className="h-3 w-2/3 rounded-fd-sm"
                  style={{ background: 'var(--fd-color-border-subtle)' }}
                />
              </div>
            ) : (
              <>
                {title && (
                  <DialogPrimitive.Title
                    id="fd-bottomsheet-title"
                    className="fd-heading-3"
                    style={{ color: 'var(--fd-color-text-primary)' }}
                  >
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description
                    id="fd-bottomsheet-description"
                    className="fd-supporting mt-fd-1"
                    style={{ color: 'var(--fd-color-text-secondary)' }}
                  >
                    {description}
                  </DialogPrimitive.Description>
                )}
              </>
            )}
          </div>

          <div className="flex-1 min-h-0 mt-fd-3">
            {loading ? (
              <div className="px-fd-4 space-y-fd-3">
                <Skeleton
                  className="h-4 w-full rounded-fd-sm"
                  style={{ background: 'var(--fd-color-border-subtle)' }}
                />
                <Skeleton
                  className="h-4 w-5/6 rounded-fd-sm"
                  style={{ background: 'var(--fd-color-border-subtle)' }}
                />
                <Skeleton
                  className="h-4 w-4/6 rounded-fd-sm"
                  style={{ background: 'var(--fd-color-border-subtle)' }}
                />
                <Skeleton
                  className="h-4 w-3/6 rounded-fd-sm"
                  style={{ background: 'var(--fd-color-border-subtle)' }}
                />
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="px-fd-4">{children}</div>
              </ScrollArea>
            )}
          </div>

          {footer && !loading && (
            <div
              className="shrink-0 px-fd-4 py-fd-3"
              style={{
                borderTop: '1px solid var(--fd-color-border-subtle)',
              }}
            >
              {footer}
            </div>
          )}

          <div
            className="shrink-0"
            style={{
              height: 'var(--fd-safe-area-bottom)',
              minHeight: 'var(--fd-space-2)',
            }}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
