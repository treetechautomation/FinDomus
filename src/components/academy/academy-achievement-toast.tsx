'use client';

import { useEffect, useState } from 'react';
import { useAcademy } from './academy-provider';
import { getAchievementById, getTierLabel } from '@/academy/academy-achievements';
import { Trophy, X } from 'lucide-react';
import type { Achievement } from '@/academy/academy-types';

export function AcademyAchievementToast() {
  const { progress } = useAcademy();
  const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);
  const [show, setShow] = useState(false);
  const prevLenRef = { current: progress?.achievements?.length || 0 };

  useEffect(() => {
    if (!progress) return;
    const current = progress.achievements.length;
    if (current > prevLenRef.current) {
      const last = progress.achievements[current - 1];
      const achievement = getAchievementById(last);
      if (achievement) {
        setLastAchievement(achievement);
        setShow(true);
        setTimeout(() => setShow(false), 5000);
      }
    }
    prevLenRef.current = current;
  }, [progress?.achievements]);

  if (!show || !lastAchievement) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1100] animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/95 to-yellow-950/95 backdrop-blur-xl shadow-2xl shadow-amber-500/10 px-5 py-3 flex items-center gap-3 min-w-[300px]">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Conquista Desbloqueada!</p>
          <p className="text-sm font-bold text-white">
            {lastAchievement.icon} {lastAchievement.title}
          </p>
          <p className="text-[10px] text-zinc-400">{getTierLabel(lastAchievement.tier)}</p>
        </div>
        <button onClick={() => setShow(false)} className="text-zinc-500 hover:text-zinc-300 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
