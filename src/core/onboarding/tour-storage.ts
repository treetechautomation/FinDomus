'use client';

import { getTourProgress, saveTourProgress } from '@/services/firestore/tour-progress';

const KEY_COMPLETED = 'findomus.tours.completed';
const KEY_DISMISSED = 'findomus.tours.dismissed';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export const tourStorage = {
  getCompletedTours(): string[] {
    if (!isClient()) return [];
    try {
      const data = localStorage.getItem(KEY_COMPLETED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler tours concluídos:', e);
      return [];
    }
  },

  saveCompletedTour(tourId: string, userId?: string): void {
    if (!isClient()) return;
    try {
      const completed = this.getCompletedTours();
      if (!completed.includes(tourId)) {
        completed.push(tourId);
        localStorage.setItem(KEY_COMPLETED, JSON.stringify(completed));
        if (userId) {
          saveTourProgress(userId, {
            completedTours: completed,
            dismissedTours: this.getDismissedTours(),
            activeTourId: null,
            currentStepIndex: 0,
            isActive: false,
          }).catch(console.error);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar tour concluído:', e);
    }
  },

  getDismissedTours(): string[] {
    if (!isClient()) return [];
    try {
      const data = localStorage.getItem(KEY_DISMISSED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler tours pulados:', e);
      return [];
    }
  },

  saveDismissedTour(tourId: string, userId?: string): void {
    if (!isClient()) return;
    try {
      const dismissed = this.getDismissedTours();
      if (!dismissed.includes(tourId)) {
        dismissed.push(tourId);
        localStorage.setItem(KEY_DISMISSED, JSON.stringify(dismissed));
        if (userId) {
          saveTourProgress(userId, {
            completedTours: this.getCompletedTours(),
            dismissedTours: dismissed,
            activeTourId: null,
            currentStepIndex: 0,
            isActive: false,
          }).catch(console.error);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar tour pulado:', e);
    }
  },

  async syncWithFirestore(userId: string): Promise<{ completed: string[]; dismissed: string[] }> {
    if (!userId) return { completed: [], dismissed: [] };
    const localCompleted = this.getCompletedTours();
    const localDismissed = this.getDismissedTours();

    try {
      const remoteState = await getTourProgress(userId);
      if (remoteState) {
        // Merge lists
        const mergedCompleted = Array.from(new Set([...localCompleted, ...(remoteState.completedTours || [])]));
        const mergedDismissed = Array.from(new Set([...localDismissed, ...(remoteState.dismissedTours || [])]));

        // Save merged to local
        localStorage.setItem(KEY_COMPLETED, JSON.stringify(mergedCompleted));
        localStorage.setItem(KEY_DISMISSED, JSON.stringify(mergedDismissed));

        // Save merged to remote
        await saveTourProgress(userId, {
          completedTours: mergedCompleted,
          dismissedTours: mergedDismissed,
          activeTourId: remoteState.activeTourId || null,
          currentStepIndex: remoteState.currentStepIndex || 0,
          isActive: remoteState.isActive || false,
        });

        return { completed: mergedCompleted, dismissed: mergedDismissed };
      } else {
        // Save local state to remote
        await saveTourProgress(userId, {
          completedTours: localCompleted,
          dismissedTours: localDismissed,
          activeTourId: null,
          currentStepIndex: 0,
          isActive: false,
        });
      }
    } catch (e) {
      console.error('Erro ao sincronizar com Firestore:', e);
    }
    return { completed: localCompleted, dismissed: localDismissed };
  },

  resetAllTours(userId?: string): void {
    if (!isClient()) return;
    try {
      localStorage.removeItem(KEY_COMPLETED);
      localStorage.removeItem(KEY_DISMISSED);
      if (userId) {
        saveTourProgress(userId, {
          completedTours: [],
          dismissedTours: [],
          activeTourId: null,
          currentStepIndex: 0,
          isActive: false,
        }).catch(console.error);
      }
    } catch (e) {
      console.error('Erro ao resetar tours:', e);
    }
  }
};
