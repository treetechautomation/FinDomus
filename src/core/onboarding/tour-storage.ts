'use client';

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

  saveCompletedTour(tourId: string): void {
    if (!isClient()) return;
    try {
      const completed = this.getCompletedTours();
      if (!completed.includes(tourId)) {
        completed.push(tourId);
        localStorage.setItem(KEY_COMPLETED, JSON.stringify(completed));
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

  saveDismissedTour(tourId: string): void {
    if (!isClient()) return;
    try {
      const dismissed = this.getDismissedTours();
      if (!dismissed.includes(tourId)) {
        dismissed.push(tourId);
        localStorage.setItem(KEY_DISMISSED, JSON.stringify(dismissed));
      }
    } catch (e) {
      console.error('Erro ao salvar tour pulado:', e);
    }
  },

  resetAllTours(): void {
    if (!isClient()) return;
    try {
      localStorage.removeItem(KEY_COMPLETED);
      localStorage.removeItem(KEY_DISMISSED);
    } catch (e) {
      console.error('Erro ao resetar tours:', e);
    }
  }
};
