'use client';

import React from 'react';

interface TourProgressProps {
  current: number; // 1-indexed
  total: number;
}

export function TourProgress({ current, total }: TourProgressProps) {
  const filledCount = Math.min(Math.max(current, 0), total);
  const emptyCount = Math.max(total - filledCount, 0);

  const progressText = '█'.repeat(filledCount) + '░'.repeat(emptyCount);

  return (
    <div className="flex flex-col gap-1.5 select-none">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <span>Progresso</span>
        <span className="font-mono text-zinc-400">
          Passo {current} de {total}
        </span>
      </div>
      <div className="font-mono text-xs tracking-tight text-cyan-500/90 drop-shadow-[0_0_6px_rgba(6,182,212,0.2)]">
        {progressText}
      </div>
    </div>
  );
}
