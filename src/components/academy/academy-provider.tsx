'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AcademyLessons, getLessonById } from '@/academy/academy-lessons';
import { academyStorage, getOrCreateProgress, getLevel, getUnlockedFeatures, getTotalProgress, completeLesson } from '@/academy/academy-engine';
import { getNextMission, checkAchievements } from '@/academy/academy-events';
import { getLevelForLesson } from '@/academy/academy-levels';
import { financialEvents } from '@/core/finance/events';
import type { AcademyLevel, AcademyProgress, AcademyContext, FeatureGate, LessonStep } from '@/academy/academy-types';
import type { AcademyLesson } from '@/academy/academy-types';

const AcademyCtx = createContext<AcademyContext | undefined>(undefined);

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [progress, setProgress] = useState<AcademyProgress | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isReady, setIsReady] = useState(false);
  const retryRef = useRef<number>(0);

  const level: AcademyLevel = progress ? getLevel(progress) : 1;
  const currentLesson: AcademyLesson | null = progress
    ? getLessonById(progress.currentLesson) || null
    : null;
  const currentStep: LessonStep | null =
    currentLesson && currentLesson.steps[currentStepIdx]
      ? currentLesson.steps[currentStepIdx]
      : null;
  const unlockedFeatures: FeatureGate[] = progress ? getUnlockedFeatures(progress) : [];
  const totalProgress = progress ? getTotalProgress(progress.completedLessons) : 0;

  const syncProgress = useCallback(async () => {
    if (!user?.uid) return;
    const p = await getOrCreateProgress(user.uid);
    setProgress(p);
    if (p.currentStep) setCurrentStepIdx(p.currentStep);
  }, [user?.uid]);

  useEffect(() => {
    syncProgress().then(() => setIsReady(true));
  }, [user?.uid, syncProgress]);

  useEffect(() => {
    if (!user?.uid) return;
    academyStorage.saveLocal({ currentStep: currentStepIdx });
  }, [currentStepIdx, user?.uid]);

  // Listen for achievements
  useEffect(() => {
    if (!user?.uid || !progress) return;
    const handler = async (event: any) => {
      if (!user?.uid) return;
      const updated = await checkAchievements(user.uid, event);
      if (updated) setProgress(updated);
    };
    financialEvents.on('transaction:created', handler);
    financialEvents.on('account:updated', handler);
    financialEvents.on('liability:created', handler);
    financialEvents.on('investment:created', handler);
    financialEvents.on('investment:updated', handler);
    financialEvents.on('planning:updated', handler);
    financialEvents.on('recurring:updated', handler);
    return () => {
      financialEvents.off('transaction:created', handler);
      financialEvents.off('account:updated', handler);
      financialEvents.off('liability:created', handler);
      financialEvents.off('investment:created', handler);
      financialEvents.off('investment:updated', handler);
      financialEvents.off('planning:updated', handler);
      financialEvents.off('recurring:updated', handler);
    };
  }, [user?.uid, progress]);

  // Spotlight target detection
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      return;
    }
    if (currentStep.route && pathname !== currentStep.route) return;
    if (!currentStep.target) {
      setTargetRect(null);
      return;
    }

    let cancelled = false;
    retryRef.current = 0;

    function find() {
      if (cancelled || !currentStep?.target) return;
      const el = document.querySelector(currentStep.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (cancelled) return;
          setTargetRect(el.getBoundingClientRect());
        }, 150);
      } else if (retryRef.current < 40) {
        retryRef.current++;
        requestAnimationFrame(() => setTimeout(find, 200));
      }
    }
    find();
    return () => { cancelled = true; };
  }, [isActive, currentStep, pathname]);

  // Resize/scroll spotlight update
  useEffect(() => {
    if (!currentStep || !isActive) return;
    const update = () => {
      if (currentStep.target) {
        const el = document.querySelector(currentStep.target);
        if (el) setTargetRect(el.getBoundingClientRect());
      }
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [currentStep, isActive]);

  const startAcademy = useCallback(async () => {
    if (!user?.uid) return;
    const p = await getOrCreateProgress(user.uid);
    setProgress(p);
    setCurrentStepIdx(0);
    setIsActive(true);

    const lesson = getLessonById(p.currentLesson);
    if (lesson) {
      const step = lesson.steps[0];
      if (step.route && pathname !== step.route) {
        router.push(step.route);
      }
    }
  }, [user?.uid, pathname, router]);

  const nextStep = useCallback(async () => {
    if (!currentLesson || !user?.uid) return;
    if (currentStepIdx < currentLesson.steps.length - 1) {
      const next = currentStepIdx + 1;
      const step = currentLesson.steps[next];
      if (step.route && pathname !== step.route) router.push(step.route);
      setCurrentStepIdx(next);
    } else {
      await completeLesson(user.uid, currentLesson.id);
      const p = await academyStorage.load(user.uid);
      setProgress(p);
      setCurrentStepIdx(0);
      setIsActive(false);
    }
  }, [currentLesson, currentStepIdx, pathname, router, user?.uid]);

  const prevStep = useCallback(() => {
    if (!currentLesson) return;
    if (currentStepIdx > 0) {
      const prev = currentStepIdx - 1;
      const step = currentLesson.steps[prev];
      if (step.route && pathname !== step.route) router.push(step.route);
      setCurrentStepIdx(prev);
    }
  }, [currentLesson, currentStepIdx, pathname, router]);

  const pauseAcademy = useCallback(async () => {
    setIsActive(false);
    if (user?.uid && progress) {
      await academyStorage.save(user.uid, { pausedAt: new Date().toISOString() });
    }
  }, [user?.uid, progress]);

  const resumeAcademy = useCallback(() => {
    setIsActive(true);
  }, []);

  const resetAcademy = useCallback(async () => {
    if (!user?.uid) return;
    await academyStorage.reset(user.uid);
    setProgress(null);
    setIsActive(false);
    setCurrentStepIdx(0);
    await syncProgress();
  }, [user?.uid, syncProgress]);

  const [nextMission, setNextMission] = useState<{ lessonId: number; mission: string; lessonTitle: string } | null>(null);

  useEffect(() => {
    if (!progress) return;
    getNextMission(progress).then((m) => setNextMission(m));
  }, [progress]);

  return (
    <AcademyCtx.Provider
      value={{
        progress,
        currentLesson,
        currentStep,
        currentStepIdx,
        isActive,
        targetRect,
        level,
        unlockedFeatures,
        nextMission,
        startAcademy,
        nextStep,
        prevStep,
        pauseAcademy,
        resumeAcademy,
        resetAcademy,
        isReady,
      }}
    >
      {children}
    </AcademyCtx.Provider>
  );
}

export function useAcademy() {
  const ctx = useContext(AcademyCtx);
  if (!ctx) throw new Error('useAcademy deve ser usado dentro de AcademyProvider');
  return ctx;
}
