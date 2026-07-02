'use client';

import { useAcademy } from './academy-provider';
import { AcademyLevels } from '@/academy/academy-levels';
import { X, ChevronRight, ChevronLeft, GraduationCap, Trophy } from 'lucide-react';

export function AcademyCard() {
  const {
    currentLesson,
    currentStep,
    currentStepIdx,
    nextStep,
    prevStep,
    pauseAcademy,
    progress,
    level,
  } = useAcademy();

  if (!currentLesson || !currentStep) return null;

  const totalSteps = currentLesson.steps.length;
  const stepNum = currentStepIdx + 1;
  const pct = Math.round((stepNum / totalSteps) * 100);
  const levelDef = AcademyLevels[level];
  const isLastStep = stepNum === totalSteps;
  const completed = progress?.completedLessons?.length || 0;

  const placementClass =
    currentStep.placement === 'bottom' ? 'bottom-4 left-1/2 -translate-x-1/2' :
    currentStep.placement === 'top' ? 'top-20 left-1/2 -translate-x-1/2' :
    currentStep.placement === 'left' ? 'left-4 top-1/2 -translate-y-1/2' :
    currentStep.placement === 'right' ? 'right-4 top-1/2 -translate-y-1/2' :
    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

  return (
    <div className={`fixed z-[1000] w-[340px] sm:w-[400px] ${placementClass}`}>
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentLesson.icon}</span>
            <div>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {levelDef?.icon} Nível {level} — {levelDef?.name}
              </p>
              <p className="text-xs text-zinc-300 font-semibold truncate max-w-[200px]">
                {currentLesson.title}
              </p>
            </div>
          </div>
          <button onClick={pauseAcademy} className="text-zinc-500 hover:text-zinc-300 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-white leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Passo {stepNum} de {totalSteps}</span>
              <span>{completed}/12 aulas</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/30">
          <button
            onClick={prevStep}
            disabled={currentStepIdx <= 0}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </button>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <GraduationCap className="h-3 w-3" />
            {completed}/12
          </div>

          <button
            onClick={nextStep}
            className="flex items-center gap-1 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-3 py-1.5 transition-all"
          >
            {isLastStep ? (
              <>
                <Trophy className="h-3.5 w-3.5" /> Concluir
              </>
            ) : (
              <>
                Próximo <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
