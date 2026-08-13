'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  showDot?: boolean;
  dotSize?: number;
  animate?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  'aria-label'?: string;
}

function buildPath(
  points: { x: number; y: number }[]
): { d: string; areaD: string; length: number } {
  if (points.length === 0) return { d: '', areaD: '', length: 0 };
  if (points.length === 1) {
    const { x, y } = points[0];
    return {
      d: `M ${x.toFixed(1)} ${y.toFixed(1)}`,
      areaD: `M ${x.toFixed(1)} ${y.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`,
      length: 0,
    };
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  let len = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    d += ` L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    len += Math.sqrt(dx * dx + dy * dy);
  }

  const last = points[points.length - 1];
  const first = points[0];
  const areaD = `${d} L ${last.x.toFixed(1)} ${first.y.toFixed(1)} L ${first.x.toFixed(1)} ${first.y.toFixed(1)} Z`;

  return { d, areaD, length: Math.ceil(len) };
}

function normalizePoints(
  data: number[],
  width: number,
  height: number,
  paddingX: number,
  paddingY: number
): { x: number; y: number }[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  return data.map((val, i) => ({
    x: paddingX + (data.length <= 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: paddingY + chartH - ((val - min) / range) * chartH,
  }));
}

const ANIMATION_ID = 'sparkline-draw';

export function Sparkline({
  data,
  width = 160,
  height = 56,
  strokeWidth = 1.5,
  color = 'var(--fd-color-action-primary)',
  fillColor,
  fillOpacity = 0.12,
  showDot = false,
  dotSize = 4,
  animate = false,
  loading = false,
  emptyMessage = 'Sem dados',
  className,
  'aria-label': ariaLabel = 'Gráfico de tendência',
}: SparklineProps) {
  const paddingX = 2;
  const paddingY = strokeWidth * 3;

  const points = useMemo(
    () => normalizePoints(data, width, height, paddingX, paddingY),
    [data, width, height, paddingX, paddingY]
  );

  const { d, areaD, length } = useMemo(
    () => buildPath(points),
    [points]
  );

  // ─── loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        role="status"
        aria-label="Carregando gráfico"
        style={{ width, height }}
      >
        <Skeleton
          className="w-full h-full rounded-fd-sm"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
      </div>
    );
  }

  // ─── empty ──────────────────────────────────────────────────────────

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'fd-surface-raised flex items-center justify-center rounded-fd-md',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={emptyMessage}
      >
        <span
          className="fd-caption"
          style={{ color: 'var(--fd-color-text-disabled)' }}
        >
          {emptyMessage}
        </span>
      </div>
    );
  }

  // ─── render ─────────────────────────────────────────────────────────

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className={cn('overflow-visible', className)}
      style={{ display: 'block' }}
    >
      <defs>
        {fillColor && (
          <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={fillOpacity * 1.6} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={fillOpacity * 0.3} />
          </linearGradient>
        )}
        {animate && (
          <style>
            {`@keyframes ${ANIMATION_ID} { from { stroke-dashoffset: ${length}; } to { stroke-dashoffset: 0; } }`}
          </style>
        )}
      </defs>

      {fillColor && areaD && (
        <path
          d={areaD}
          fill={fillColor ? 'url(#sparkline-fill)' : 'none'}
          stroke="none"
        />
      )}

      {d && (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            animate
              ? {
                  strokeDasharray: length,
                  strokeDashoffset: 0,
                  animation: `${ANIMATION_ID} 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                }
              : undefined
          }
        />
      )}

      {showDot && points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={dotSize}
          fill={color}
          stroke="var(--fd-color-canvas)"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}
