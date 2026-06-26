'use client';

import React from 'react';
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

  if (!isActive || !currentStep) return null;

  const totalSteps = activeTour ? activeTour.steps.length : 0;
  const placement = currentStep.placement;

  const getCardStyles = (): React.CSSProperties => {
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

    switch (placement) {
      case 'top':
        top = targetRect.top - 16;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + 16;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - 16;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + 16;
        transform = 'translate(0, -50%)';
        break;
      default:
        top = '50%' as any;
        left = '50%' as any;
        transform = 'translate(-50%, -50%)';
    }

    return {
      position: 'fixed',
      top,
      left,
      transform,
      width: 'calc(100% - 32px)',
      maxWidth: '340px',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <Card 
      style={getCardStyles()}
      className="border border-cyan-500/20 bg-zinc-950/95 backdrop-blur-md shadow-[0_20px_50px_rgba(6,182,212,0.15)] animate-in fade-in zoom-in-95 duration-200"
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-snug">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
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
