'use client';

import { useAcademy } from '@/components/academy/academy-provider';
import { AcademyLevels } from '@/academy/academy-levels';
import { calculateTotalXP, getXPLevelProgress, getNextLevelXP, getRankName } from '@/academy/academy-xp';
import { Trophy, Zap } from 'lucide-react';

export function AcademyAvatar() {
  const { progress, level } = useAcademy();
  if (!progress) return null;

  const def = AcademyLevels[level];
  const xp = calculateTotalXP(progress.completedLessons, progress.achievements);
  const pct = getXPLevelProgress(xp);
  const nextXP = getNextLevelXP(xp);
  const rank = getRankName(progress.completedLessons.length);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* Avatar */}
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 border-cyan-500/30 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/10">
          {def?.icon || '🌱'}
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-950 border-2 border-cyan-500/50 flex items-center justify-center text-[10px] font-bold text-cyan-400">
          {level}
        </div>
      </div>

      {/* Name + Rank */}
      <div className="text-center">
        <p className="text-sm font-bold text-white">{def?.name}</p>
        <p className="text-[10px] text-zinc-500">{rank}</p>
      </div>

      {/* XP Bar */}
      <div className="w-full space-y-1">
        <div className="flex justify-between text-[9px] text-zinc-500">
          <span className="flex items-center gap-0.5"><Zap className="h-2.5 w-2.5 text-amber-400" />{xp} XP</span>
          {nextXP > 0 && <span>Nv.{level + 1} em {nextXP - xp} XP</span>}
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Achievements count */}
      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
        <Trophy className="h-3 w-3 text-amber-400" />
        <span>{progress.achievements.length} conquistas</span>
      </div>
    </div>
  );
}
