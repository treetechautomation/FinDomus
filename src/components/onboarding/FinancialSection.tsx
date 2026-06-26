'use client';

import React from 'react';
import { EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisibility } from '@/providers/visibility-provider';

interface FinancialSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function FinancialSection({ children, fallback, className }: FinancialSectionProps) {
  const { showFinancialValues, toggleVisibility, isMounted } = useVisibility();

  if (!isMounted) {
    return <div className="animate-pulse rounded-2xl bg-zinc-900/40 min-h-[200px]" />;
  }

  if (showFinancialValues) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`relative group ${className || ''}`}>
      <div className="blur-md select-none pointer-events-none filter scale-[0.99] transition-all duration-300">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[3px] rounded-2xl border border-zinc-800/10 transition-all duration-300">
        <div className="flex flex-col items-center p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 shadow-2xl text-center max-w-[280px]">
          <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
            <EyeOff className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200">Dados Ocultos</h4>
          <p className="text-xs text-zinc-500 mt-1 mb-4 leading-relaxed">
            Ative a exibição global de valores financeiros para visualizar este conteúdo.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVisibility}
            className="h-8 text-xs px-4 border-zinc-800 hover:bg-zinc-900 text-zinc-300"
          >
            Revelar Valores
          </Button>
        </div>
      </div>
    </div>
  );
}
