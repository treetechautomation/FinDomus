'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AcademyProgress } from './academy-types';

const STORAGE_KEY = 'findomus.academy.progress';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getLocalProgress(): Partial<AcademyProgress> | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalProgress(data: Partial<AcademyProgress>): void {
  if (!isClient()) return;
  try {
    const existing = getLocalProgress() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    /* quota exceeded — fail silently */
  }
}

function clearLocalProgress(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const academyStorage = {

  async load(userId: string): Promise<AcademyProgress | null> {
    if (!userId) return null;

    try {
      const ref = doc(db, 'academy_progress', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const raw = snap.data() as Partial<AcademyProgress>;
        const data: AcademyProgress = {
          ...raw,
          userId,
          currentLesson: raw.currentLesson ?? 1,
          currentStep: raw.currentStep ?? 0,
          achievements: raw.achievements ?? [],
          completedLessons: raw.completedLessons ?? [],
          knowledge: raw.knowledge ?? [],
          history: raw.history ?? [],
        } as AcademyProgress;
        setLocalProgress(data);
        return data;
      }
    } catch (e) {
      console.error('[AcademyStorage] Erro ao carregar do Firestore:', e);
    }

    const local = getLocalProgress();
    if (local) {
      return {
        ...local,
        userId,
        currentLesson: local.currentLesson ?? 1,
        currentStep: local.currentStep ?? 0,
        achievements: local.achievements ?? [],
        completedLessons: local.completedLessons ?? [],
        knowledge: local.knowledge ?? [],
        history: local.history ?? [],
      } as AcademyProgress;
    }
    return null;
  },

  async save(userId: string, data: Partial<AcademyProgress>): Promise<void> {
    if (!userId) return;
    setLocalProgress(data);

    try {
      const ref = doc(db, 'academy_progress', userId);
      await setDoc(ref, { ...data, userId }, { merge: true });
    } catch (e) {
      console.error('[AcademyStorage] Erro ao salvar no Firestore:', e);
    }
  },

  saveLocal(data: Partial<AcademyProgress>): void {
    setLocalProgress(data);
  },

  async reset(userId: string): Promise<void> {
    if (!userId) return;
    clearLocalProgress();
    try {
      const ref = doc(db, 'academy_progress', userId);
      await setDoc(ref, {
        userId,
        currentLesson: 1,
        currentStep: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
        pausedAt: null,
        achievements: [],
        completedLessons: [],
        knowledge: [],
        history: [],
      });
    } catch (e) {
      console.error('[AcademyStorage] Erro ao resetar:', e);
    }
  },
};
