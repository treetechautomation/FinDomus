export type TourStepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // Seletor CSS (ex: '#tour-step-dashboard' ou vazia/body para centro)
  placement: TourStepPlacement;
  order: number;
  route?: string;
}

export interface Tour {
  id: string;
  steps: TourStep[];
}

export interface TourState {
  activeTourId: string | null;
  currentStepIndex: number;
  isActive: boolean;
  completedTours: string[];
  dismissedTours: string[];
}
