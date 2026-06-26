'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TourControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function TourControls({
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onComplete
}: TourControlsProps) {
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800/40 mt-4 select-none">
      {!isLast ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 h-8 px-2.5 rounded-lg"
        >
          Pular
        </Button>
      ) : (
        <div /> // Spacer
      )}

      <div className="flex items-center gap-2">
        {!isFirst && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            className="h-8 text-xs px-3 border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 rounded-lg"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Anterior
          </Button>
        )}

        {isLast ? (
          <Button
            size="sm"
            onClick={onComplete}
            className="h-8 text-xs px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded-lg"
          >
            Concluir 🚀
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onNext}
            className="h-8 text-xs px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-1 rounded-lg"
          >
            Próximo
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
