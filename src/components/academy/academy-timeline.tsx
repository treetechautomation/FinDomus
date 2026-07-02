'use client';

import { AcademyLevels } from '@/academy/academy-levels';
import { AcademyLessons } from '@/academy/academy-lessons';

export function AcademyTimeline({ completedLessons }: { completedLessons: number[] }) {
  const total = AcademyLessons.length;
  const levels = [1, 2, 3, 4, 5] as const;

  return (
    <div className="space-y-2 p-2">
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">Jornada</p>
      {levels.map((lvl) => {
        const def = AcademyLevels[lvl];
        const lessonIds = def.lessons;
        const completed = lessonIds.filter((id) => completedLessons.includes(id)).length;
        const total = lessonIds.length;
        const pct = Math.round((completed / total) * 100);
        const isCurrentLevel = completed > 0 && completed < total;
        const isComplete = completed === total;

        return (
          <div key={lvl} className="flex items-center gap-2">
            <span className="text-sm w-6 text-center">{def.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[9px] mb-0.5">
                <span className={`font-semibold ${isComplete ? 'text-emerald-400' : isCurrentLevel ? 'text-cyan-400' : 'text-zinc-500'}`}>
                  {def.name}
                </span>
                <span className="text-zinc-600">{completed}/{total}</span>
              </div>
              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isComplete ? 'bg-emerald-500' : isCurrentLevel ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-zinc-700'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
