'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTour } from '@/core/onboarding/tour-engine';
import { TourProgress } from './TourProgress';
import { TourControls } from './TourControls';

export function CoachMark() {
  const { 
    activeTour, 
    currentStepIndex, 
    currentStep, 
    isActive, 
    targetRect,
    nextStep,
    prevStep,
    skipTour,
    completeTour
  } = useTour();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll optionally while active to keep focus
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('overflow-hidden-tour-active');
    } else {
      document.body.classList.remove('overflow-hidden-tour-active');
    }
    return () => {
      document.body.classList.remove('overflow-hidden-tour-active');
    };
  }, [isActive]);

  if (!isActive || !currentStep) return null;

  const totalSteps = activeTour ? activeTour.steps.length : 0;
  
  // On mobile, fallback left/right to bottom or center
  let placement = currentStep.placement;
  if (isMobile && (placement === 'left' || placement === 'right')) {
    placement = 'bottom';
  }

  const getCardStyles = (): React.CSSProperties => {
    const padding = 16;
    const maxWidth = isMobile ? 320 : 345;

    if (!targetRect || placement === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }

    let top = 0;
    let left = 0;
    let transform = '';

    // Calculate viewport dimensions
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

    switch (placement) {
      case 'top':
        top = targetRect.top - padding;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - padding;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + padding;
        transform = 'translate(0, -50%)';
        break;
      default:
        top = viewportHeight / 2;
        left = viewportWidth / 2;
        transform = 'translate(-50%, -50%)';
    }

    // Viewport edge detection and boundary corrections (Safe Zones)
    let finalTop = top;
    let finalLeft = left;

    if (placement === 'top' || placement === 'bottom') {
      // Prevent horizontal overflow
      const halfWidth = maxWidth / 2;
      if (left - halfWidth < padding) {
        finalLeft = halfWidth + padding;
      } else if (left + halfWidth > viewportWidth - padding) {
        finalLeft = viewportWidth - halfWidth - padding;
      }

      // Prevent vertical overflow
      if (placement === 'top' && top - 150 < 0) {
        // Not enough space above, flip to bottom
        finalTop = targetRect.bottom + padding;
        transform = 'translate(-50%, 0)';
      } else if (placement === 'bottom' && top + 150 > viewportHeight) {
        // Not enough space below, flip to top
        finalTop = targetRect.top - padding;
        transform = 'translate(-50%, -100%)';
      }
    }

    if (placement === 'left' || placement === 'right') {
      // Prevent vertical overflow
      const halfHeight = 100; // estimated half height
      if (top - halfHeight < padding) {
        finalTop = halfHeight + padding;
      } else if (top + halfHeight > viewportHeight - padding) {
        finalTop = viewportHeight - halfHeight - padding;
      }

      // Prevent horizontal overflow
      if (placement === 'left' && left - maxWidth < 0) {
        // Not enough space left, flip to right
        finalLeft = targetRect.right + padding;
        transform = 'translate(0, -50%)';
      } else if (placement === 'right' && left + maxWidth > viewportWidth) {
        // Not enough space right, flip to left
        finalLeft = targetRect.left - padding;
        transform = 'translate(-100%, -50%)';
      }
    }

    return {
      position: 'fixed',
      top: finalTop,
      left: finalLeft,
      transform,
      width: 'calc(100% - 32px)',
      maxWidth: `${maxWidth}px`,
      zIndex: 1000,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <Card 
      style={getCardStyles()}
      className="border border-primary/20 bg-zinc-950/95 backdrop-blur-md shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] animate-in fade-in zoom-in-95 duration-200"
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-snug">
          <Sparkles className="h-4 w-4 text-primary shrink-0 animate-pulse" />
          {currentStep.title}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={skipTour}
          className="h-6 w-6 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-4 px-4 text-zinc-300 space-y-4">
        <p className="text-xs leading-relaxed text-zinc-400">
          {currentStep.description}
        </p>

        <TourProgress 
          current={currentStepIndex + 1} 
          total={totalSteps} 
        />

        <TourControls
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onComplete={completeTour}
        />
      </CardContent>
    </Card>
  );
}
