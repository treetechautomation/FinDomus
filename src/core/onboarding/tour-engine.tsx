'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Tour, TourStep } from './types';
import { tourRegistry } from './tour-registry';
import { tourStorage } from './tour-storage';

interface TourContextType {
  activeTour: Tour | null;
  currentStepIndex: number;
  currentStep: TourStep | null;
  isActive: boolean;
  targetRect: DOMRect | null;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  completedTours: string[];
  dismissedTours: string[];
  resetTours: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [dismissedTours, setDismissedTours] = useState<string[]>([]);

  useEffect(() => {
    setCompletedTours(tourStorage.getCompletedTours());
    setDismissedTours(tourStorage.getDismissedTours());
  }, []);

  const currentStep = activeTour ? activeTour.steps[currentStepIndex] : null;

  const updateTargetRect = useCallback(() => {
    if (!currentStep || !currentStep.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      
      // Delay de medição para acomodar a rolagem suave do navegador
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }, 150);
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep) {
      updateTargetRect();
      // Executa um segundo ajuste rápido caso o layout termine de se acomodar
      const timer = setTimeout(updateTargetRect, 400);

      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect, true);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect, true);
      };
    } else {
      setTargetRect(null);
    }
  }, [currentStep, updateTargetRect]);

  const startTour = useCallback((tourId: string) => {
    const tour = tourRegistry[tourId];
    if (tour && tour.steps.length > 0) {
      setActiveTour(tour);
      setCurrentStepIndex(0);
    }
  }, []);

  const completeTour = useCallback(() => {
    if (activeTour) {
      tourStorage.saveCompletedTour(activeTour.id);
      setCompletedTours(tourStorage.getCompletedTours());
      setActiveTour(null);
      setCurrentStepIndex(0);
      setTargetRect(null);
    }
  }, [activeTour]);

  const skipTour = useCallback(() => {
    if (activeTour) {
      tourStorage.saveDismissedTour(activeTour.id);
      setDismissedTours(tourStorage.getDismissedTours());
      setActiveTour(null);
      setCurrentStepIndex(0);
      setTargetRect(null);
    }
  }, [activeTour]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeTour();
    }
  }, [activeTour, currentStepIndex, completeTour]);

  const prevStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [activeTour, currentStepIndex]);

  const resetTours = useCallback(() => {
    tourStorage.resetAllTours();
    setCompletedTours([]);
    setDismissedTours([]);
  }, []);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStepIndex,
        currentStep,
        isActive: !!activeTour,
        targetRect,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        completedTours,
        dismissedTours,
        resetTours,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour deve ser usado dentro de um TourProvider');
  }
  return context;
}
