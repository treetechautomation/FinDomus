import { getUserCapabilities } from './capabilities-engine';
import { isTrialEnabled } from './feature-flags-admin';

export async function canAccessAcademyModule(
  userId: string,
  _moduleId: string
): Promise<{
  allowed: boolean;
  reason?: 'PREMIUM_MODULE' | 'TRIAL_ONLY';
  requiredPlan?: string;
}> {
  const trialEnabled = await isTrialEnabled(userId);
  const caps = await getUserCapabilities(userId);

  if (caps.canAccessAcademyPremium) {
    return { allowed: true };
  }

  if (trialEnabled) {
    return {
      allowed: false,
      reason: 'PREMIUM_MODULE',
      requiredPlan: 'Família',
    };
  }

  return {
    allowed: false,
    reason: 'PREMIUM_MODULE',
    requiredPlan: 'Família',
  };
}
