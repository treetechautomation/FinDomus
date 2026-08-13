'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerText?: string;
  centerSubtext?: string;
  showLegend?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  'aria-label'?: string;
}

function polar(
  cx: number,
  cy: number,
  r: number,
  angle: number
): { x: number; y: number } {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeSegment(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const sweepAngle = endAngle - startAngle;
  const largeArc = sweepAngle > Math.PI ? 1 : 0;

  const outerStart = polar(cx, cy, outerR, startAngle);
  const outerEnd = polar(cx, cy, outerR, endAngle);
  const innerEnd = polar(cx, cy, innerR, endAngle);
  const innerStart = polar(cx, cy, innerR, startAngle);

  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function describeFullRing(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number
): string {
  const half = Math.PI;

  const o1 = polar(cx, cy, outerR, -Math.PI / 2);
  const o2 = polar(cx, cy, outerR, Math.PI / 2);
  const i2 = polar(cx, cy, innerR, Math.PI / 2);
  const i1 = polar(cx, cy, innerR, -Math.PI / 2);

  const firstHalf = [
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 1 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 1 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    'Z',
  ].join(' ');

  const o3 = polar(cx, cy, outerR, Math.PI / 2);
  const o4 = polar(cx, cy, outerR, 3 * Math.PI / 2);
  const i4 = polar(cx, cy, innerR, 3 * Math.PI / 2);
  const i3 = polar(cx, cy, innerR, Math.PI / 2);

  const secondHalf = [
    `M ${o3.x.toFixed(2)} ${o3.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 1 1 ${o4.x.toFixed(2)} ${o4.y.toFixed(2)}`,
    `L ${i4.x.toFixed(2)} ${i4.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 1 0 ${i3.x.toFixed(2)} ${i3.y.toFixed(2)}`,
    'Z',
  ].join(' ');

  return `${firstHalf} ${secondHalf}`;
}

const RING_ANIMATION_ID = 'donut-grow';

export function DonutChart({
  segments,
  size = 160,
  thickness = 20,
  centerText,
  centerSubtext,
  showLegend = false,
  loading = false,
  emptyMessage = 'Sem dados',
  className,
  'aria-label': ariaLabel = 'Gráfico de distribuição',
}: DonutChartProps) {
  const total = useMemo(
    () => segments.reduce((sum, s) => sum + (s.value > 0 ? s.value : 0), 0),
    [segments]
  );

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const innerR = outerR - thickness;

  const hasSegments = segments.length > 0 && total > 0;
  const singleFull = segments.length === 1 && segments[0].value > 0;

  const segmentPaths = useMemo(() => {
    if (!hasSegments) return [];
    if (singleFull) {
      return [
        {
          path: describeFullRing(cx, cy, outerR, innerR),
          color: segments[0].color,
          label: segments[0].label,
          value: segments[0].value,
        },
      ];
    }

    let angle = -Math.PI / 2;
    return segments
      .filter((s) => s.value > 0)
      .map((s) => {
        const sweep = (s.value / total) * 2 * Math.PI;
        const endAngle = angle + sweep;
        const path = describeSegment(
          cx,
          cy,
          outerR,
          innerR,
          angle,
          endAngle
        );
        angle = endAngle;
        return {
          path,
          color: s.color,
          label: s.label,
          value: s.value,
        };
      });
  }, [hasSegments, singleFull, segments, total, cx, cy, outerR, innerR]);

  // ─── loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className={cn('flex flex-col items-center gap-fd-3', className)}
        role="status"
        aria-label="Carregando gráfico"
      >
        <Skeleton
          className="rounded-full"
          style={{
            width: size,
            height: size,
            background: 'var(--fd-color-border-subtle)',
          }}
        />
        {showLegend && (
          <div className="flex flex-col gap-fd-1 w-full max-w-[200px]">
            <Skeleton
              className="h-3 w-full rounded-fd-sm"
              style={{ background: 'var(--fd-color-border-subtle)' }}
            />
            <Skeleton
              className="h-3 w-3/4 rounded-fd-sm"
              style={{ background: 'var(--fd-color-border-subtle)' }}
            />
          </div>
        )}
      </div>
    );
  }

  // ─── empty ──────────────────────────────────────────────────────────

  if (!hasSegments) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center gap-fd-2', className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={emptyMessage}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke="var(--fd-color-border-subtle)"
            strokeWidth={thickness}
          />
        </svg>
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
    <div
      className={cn('flex flex-col items-center gap-fd-3', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <style>
            {`@keyframes ${RING_ANIMATION_ID} { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }`}
          </style>
        </defs>

        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: `${RING_ANIMATION_ID} 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          }}
        >
          {segmentPaths.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill={seg.color}
              stroke="var(--fd-color-canvas)"
              strokeWidth={1}
            />
          ))}
        </g>

        {centerText && (
          <text
            x={cx}
            y={centerSubtext ? cy - 4 : cy}
            textAnchor="middle"
            dominantBaseline={centerSubtext ? 'auto' : 'central'}
            className="fd-heading-3 fd-tabular-nums"
            style={{
              fill: 'var(--fd-color-text-primary)',
              fontSize: centerSubtext ? undefined : 'var(--fd-type-heading-2-size)',
              fontWeight: centerSubtext ? undefined : 'var(--fd-type-heading-2-weight)',
            }}
          >
            {centerText}
          </text>
        )}

        {centerSubtext && (
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            dominantBaseline="auto"
            className="fd-caption"
            style={{ fill: 'var(--fd-color-text-tertiary)' }}
          >
            {centerSubtext}
          </text>
        )}
      </svg>

      {showLegend && (
        <ul className="flex flex-wrap justify-center gap-fd-2 max-w-[240px]" aria-hidden="true">
          {segmentPaths.map((seg, i) => (
            <li key={i} className="flex items-center gap-fd-1">
              <span
                className="shrink-0 rounded-fd-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: seg.color,
                }}
              />
              <span
                className="fd-supporting truncate max-w-[100px]"
                style={{ color: 'var(--fd-color-text-secondary)' }}
              >
                {seg.label || `Segmento ${i + 1}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
