'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisibility } from '@/providers/visibility-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function VisibilityToggle() {
  const { showFinancialValues, toggleVisibility, isMounted } = useVisibility();

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0" disabled />
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            id="tour-step-visibility-toggle"
            variant="ghost"
            size="icon"
            onClick={toggleVisibility}
            className="h-9 w-9 rounded-xl border border-zinc-800/40 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 transition-all duration-200"
          >
            {showFinancialValues ? (
              <Eye className="h-[18px] w-[18px]" />
            ) : (
              <EyeOff className="h-[18px] w-[18px] text-zinc-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
          <p>{showFinancialValues ? 'Ocultar valores financeiros' : 'Mostrar valores financeiros'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
