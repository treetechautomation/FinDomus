'use client';

import React from 'react';
import { useTour } from '@/core/onboarding/tour-engine';
import { TourOverlay } from './TourOverlay';
import { CoachMark } from './CoachMark';

export function TourRenderer() {
  const { isActive, targetRect, skipTour } = useTour();

  if (!isActive) return null;

  return (
    <>
      <TourOverlay targetRect={targetRect} onSkip={skipTour} />
      <CoachMark />
    </>
  );
}
