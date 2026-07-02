'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Tour, TourStep } from './types';
import { tourRegistry } from './tour-registry';
import { tourStorage } from './tour-storage';
import { getTourProgress, saveTourProgress } from '@/services/firestore/tour-progress';

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
  syncProgress: () => Promise<void>;
  isReady: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [dismissedTours, setDismissedTours] = useState<string[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Synchronize storage and state once the user is authenticated
  const syncProgress = useCallback(async () => {
    if (!user?.uid) return;
    const { completed, dismissed } = await tourStorage.syncWithFirestore(user.uid);
    setCompletedTours(completed);
    setDismissedTours(dismissed);

    // Check if there is an active tour to resume from Firestore
    try {
      const remoteState = await getTourProgress(user.uid);
      if (remoteState && remoteState.isActive && remoteState.activeTourId) {
        const tour = tourRegistry[remoteState.activeTourId];
        if (tour) {
          setActiveTour(tour);
          setCurrentStepIndex(remoteState.currentStepIndex || 0);
        }
      }
    } catch (e) {
      console.error('Erro ao resumir progresso do tour:', e);
    }
  }, [user?.uid]);

  useEffect(() => {
    async function init() {
      if (user?.uid) {
        await syncProgress();
      } else {
        setCompletedTours(tourStorage.getCompletedTours());
        setDismissedTours(tourStorage.getDismissedTours());
      }
      setIsReady(true);
    }
    init();
  }, [user?.uid, syncProgress]);

  const currentStep = activeTour ? activeTour.steps[currentStepIndex] : null;

  // Persist current active tour state to Firestore (if user exists)
  useEffect(() => {
    if (!user?.uid) return;
    saveTourProgress(user.uid, {
      activeTourId: activeTour ? activeTour.id : null,
      currentStepIndex,
      isActive: !!activeTour,
      completedTours,
      dismissedTours,
    }).catch(console.error);
  }, [activeTour, currentStepIndex, completedTours, dismissedTours, user?.uid]);

  const updateTargetRect = useCallback(() => {
    if (!currentStep || !currentStep.target) {
      setTargetRect(null);
      return;
    }

    if (currentStep.route && pathname !== currentStep.route) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [currentStep, pathname]);

  // Recalculate target position on resize/scroll
  useEffect(() => {
    if (currentStep) {
      updateTargetRect();
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect, true);

      return () => {
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
      
      // Nav to the first step's route if specified
      const firstStep = tour.steps[0];
      if (firstStep.route && pathname !== firstStep.route) {
        router.push(firstStep.route);
      }
    }
  }, [pathname, router]);

  const completeTour = useCallback(() => {
    if (activeTour) {
      tourStorage.saveCompletedTour(activeTour.id, user?.uid);
      setCompletedTours(tourStorage.getCompletedTours());
      setActiveTour(null);
      setCurrentStepIndex(0);
      setTargetRect(null);
    }
  }, [activeTour, user?.uid]);

  const skipTour = useCallback(() => {
    if (activeTour) {
      tourStorage.saveDismissedTour(activeTour.id, user?.uid);
      setDismissedTours(tourStorage.getDismissedTours());
      setActiveTour(null);
      setCurrentStepIndex(0);
      setTargetRect(null);
    }
  }, [activeTour, user?.uid]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex < activeTour.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStepObj = activeTour.steps[nextIdx];
      
      // Handle cross-page navigation
      if (nextStepObj.route && pathname !== nextStepObj.route) {
        router.push(nextStepObj.route);
      }
      
      setCurrentStepIndex(nextIdx);
    } else {
      completeTour();
    }
  }, [activeTour, currentStepIndex, pathname, router, completeTour]);

  const prevStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStepObj = activeTour.steps[prevIdx];
      
      // Handle cross-page navigation back
      if (prevStepObj.route && pathname !== prevStepObj.route) {
        router.push(prevStepObj.route);
      }
      
      setCurrentStepIndex(prevIdx);
    }
  }, [activeTour, currentStepIndex, pathname, router]);

  // Wait intelligently for target element in active step
  useEffect(() => {
    if (!activeTour || !currentStep) {
      setTargetRect(null);
      return;
    }

    if (currentStep.route && pathname !== currentStep.route) {
      setTargetRect(null);
      return;
    }

    if (!currentStep.target) {
      setTargetRect(null);
      return;
    }

    let isCancelled = false;
    const startTime = Date.now();

    function checkElement() {
      if (isCancelled) return;

      const element = document.querySelector(currentStep!.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        
        // Delay to allow smooth scrolling to finish
        setTimeout(() => {
          if (isCancelled) return;
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
        }, 150);
      } else {
        const elapsed = Date.now() - startTime;
        if (elapsed < 8000) {
          requestAnimationFrame(() => {
            setTimeout(checkElement, 200);
          });
        } else {
          console.warn(`Target não encontrado após 8 segundos: ${currentStep!.target}. Pulando passo.`);
          nextStep();
        }
      }
    }

    checkElement();

    return () => {
      isCancelled = true;
    };
  }, [activeTour, currentStep, pathname, nextStep]);

  const resetTours = useCallback(() => {
    tourStorage.resetAllTours(user?.uid);
    setCompletedTours([]);
    setDismissedTours([]);
    setActiveTour(null);
    setCurrentStepIndex(0);
    setTargetRect(null);
  }, [user?.uid]);

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
        syncProgress,
        isReady,
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
