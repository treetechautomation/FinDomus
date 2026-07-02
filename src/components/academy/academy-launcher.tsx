'use client';

import { useAcademy } from './academy-provider';
import { GraduationCap } from 'lucide-react';

export function AcademyLauncher() {
  const { isActive, startAcademy, pauseAcademy, progress, isReady } = useAcademy();

  if (!isReady) return null;

  const total = progress?.completedLessons?.length || 0;

  if (isActive) return null;

  return (
    <button
      onClick={startAcademy}
      className="fixed bottom-6 right-6 h-14 px-4 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 text-white flex items-center gap-2 border border-cyan-400/30 transition-all duration-300 hover:scale-105 z-50"
      title="Academia FinDomus"
    >
      <GraduationCap className="h-5 w-5" />
      <span className="text-xs font-bold whitespace-nowrap">
        {total > 0 ? `${total}/12` : 'Academia'}
      </span>
      {total > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">
          {total}
        </span>
      )}
    </button>
  );
}
