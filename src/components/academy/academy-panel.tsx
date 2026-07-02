'use client';

import { useState } from 'react';
import { useAcademy } from './academy-provider';
import { AcademyLevels } from '@/academy/academy-levels';
import { AcademyAchievements, getTierLabel } from '@/academy/academy-achievements';
import { AcademyLessons } from '@/academy/academy-lessons';
import { getTotalProgress } from '@/academy/academy-engine';
import { X, Trophy, Play, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { AcademyAvatar } from './academy-avatar';
import { AcademyTimeline } from './academy-timeline';

export function AcademyPanel() {
  const { progress, startAcademy, resetAcademy, level } = useAcademy();
  const [isOpen, setIsOpen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  if (!progress) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 h-10 px-3 rounded-full bg-slate-900/90 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-semibold flex items-center gap-1.5 z-40 transition-all"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          Academia
        </button>
      );
    }
    return null;
  }

  const completed = progress.completedLessons.length;
  const total = AcademyLessons.length;
  const pct = getTotalProgress(progress.completedLessons);
  const levelDef = AcademyLevels[level];
  const nextLesson = AcademyLessons.find((l) => !progress.completedLessons.includes(l.id));

  const unlocked = AcademyAchievements.filter((a) => progress.achievements.includes(a.id));
  const locked = AcademyAchievements.filter((a) => !progress.achievements.includes(a.id));

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 h-10 px-3 rounded-full bg-slate-900/90 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-semibold flex items-center gap-1.5 z-40 transition-all"
      >
        <Trophy className="h-3.5 w-3.5 text-amber-400" />
        {unlocked.length} conquistas
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 max-h-[500px] rounded-2xl border border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header + Avatar */}
      <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-b border-cyan-500/20 px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Academia FinDomus</p>
          <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        <AcademyAvatar />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Aulas concluídas</span>
            <span className="font-bold text-zinc-300">{completed}/{total} ({pct}%)</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Next lesson */}
        {nextLesson && (
          <button
            onClick={() => { startAcademy(); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            {progress.currentLesson > 1 ? 'Continuar Aula ' + progress.currentLesson : 'Começar Academia'}
          </button>
        )}

        {/* Lessons checklist */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Aulas</p>
          {AcademyLessons.map((lesson) => {
            const done = progress.completedLessons.includes(lesson.id);
            return (
              <div key={lesson.id} className="flex items-center gap-2 text-xs py-0.5">
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                )}
                <span className={done ? 'text-zinc-400 line-through' : 'text-zinc-300'}>
                  {lesson.icon} {lesson.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <AcademyTimeline completedLessons={progress.completedLessons} />

        {/* Achievements toggle */}
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          className="w-full text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 hover:text-cyan-300"
        >
          <Trophy className="h-3 w-3" />
          Conquistas ({unlocked.length}/{AcademyAchievements.length})
        </button>

        {showAchievements && (
          <div className="space-y-1.5">
            {unlocked.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-base">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-zinc-200 font-semibold truncate">{a.title}</p>
                  <p className="text-[9px] text-zinc-500">{getTierLabel(a.tier)}</p>
                </div>
              </div>
            ))}
            {locked.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-zinc-900/30 border border-zinc-800/30 opacity-40">
                <span className="text-base grayscale">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-zinc-500 font-semibold truncate">???</p>
                  <p className="text-[9px] text-zinc-600">Bloqueada</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Journey history */}
        {progress.history.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sua jornada</p>
            {progress.history.slice(-5).reverse().map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span>{entry.icon}</span>
                <span className="truncate">{entry.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/50 px-4 py-2 flex justify-end">
        <button onClick={resetAcademy} className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors">
          <RotateCcw className="h-3 w-3" /> Resetar
        </button>
      </div>
    </div>
  );
}
