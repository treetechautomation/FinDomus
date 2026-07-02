'use client';

import { AcademyLauncher } from './academy-launcher';
import { AcademyOverlay } from './academy-overlay';
import { AcademyPanel } from './academy-panel';
import { AcademyAchievementToast } from './academy-achievement-toast';
import { AcademyConfetti } from './academy-confetti';

export function AcademyRenderer() {
  return (
    <>
      <AcademyLauncher />
      <AcademyOverlay />
      <AcademyPanel />
      <AcademyAchievementToast />
      <AcademyConfetti trigger={0} />
    </>
  );
}
