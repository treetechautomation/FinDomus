import { getPlanById, PLANS } from '@/services/firestore/plans';
import { adminDb } from '@/lib/firebase-admin';
import type { PlanCapabilities, Plan, Subscription } from '@/lib/billing/billing-types';
import { UNLIMITED_CAPABILITIES } from '@/lib/billing/billing-types';
import { getTrialStatus } from './trial-engine';
import { isTrialEnabled, isPluggyEnabled } from './feature-flags-admin';

export async function getPlanCapabilities(planId: string): Promise<PlanCapabilities> {
  const plan = await getPlanById(planId) ?? PLANS[planId];
  if (!plan) return UNLIMITED_CAPABILITIES;

  const pluggyOn = await isPluggyEnabled();

  return {
    canUsePluggy: pluggyOn && plan.allowPluggy,
    canUseAI: plan.aiTier !== 'none',
    canExportPDF: plan.allowReports,
    canInviteFamily: plan.allowFamily,
    canManageCompanies: plan.allowCompanies,
    canAccessReports: plan.allowReports,
    canAccessInvestments: plan.allowInvestments,
    canAccessAcademy: true,
    canAccessAcademyPremium: plan.allowAcademyPremium,
    canAccessFreedomIndex: plan.aiTier === 'full' || plan.aiTier === 'advanced',
    canAccessPremiumReports: plan.aiTier === 'advanced',
    canAccessWhatsAppPremium: plan.supportLevel === 'priority',
    maxBankConnections: plan.maxBankConnections,
    maxMembers: plan.maxMembers,
    maxManualImports: plan.maxManualImports,
    monthlyCredits: plan.monthlyCredits,
    aiTier: plan.aiTier,
    supportLevel: plan.supportLevel,
  };
}

export async function getUserCapabilities(userId: string): Promise<PlanCapabilities> {
  const trialEnabled = await isTrialEnabled(userId);
  if (!trialEnabled) {
    return getPlanCapabilities('family_premium');
  }

  const householdSnap = await adminDb
    .collection('users')
    .doc(userId)
    .get();

  const householdId = householdSnap.exists
    ? householdSnap.data()?.activeHouseholdId
    : null;

  if (!householdId) return getPlanCapabilities('individual');

  const subSnap = await adminDb
    .collection('subscriptions')
    .where('householdId', '==', householdId)
    .limit(1)
    .get();

  const subscription = subSnap.empty ? null : subSnap.docs[0].data() as Subscription;

  if (subscription?.status === 'trialing') {
    const trialStatus = await getTrialStatus(householdId);
    if (trialStatus.isActive) {
      return getPlanCapabilities('family_premium');
    }
  }

  const householdDoc = await adminDb
    .collection('households')
    .doc(householdId)
    .get();

  const planId = householdDoc.exists
    ? householdDoc.data()?.planId || 'individual'
    : 'individual';

  return getPlanCapabilities(planId);
}
