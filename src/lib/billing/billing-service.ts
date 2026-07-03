import { isMonetizationEnabled } from './feature-flags-admin';
import {
  getCurrentPlan,
  getEffectivePrice,
  canConnectBank,
  getUserPlanInfo,
  getUserCapabilities,
} from './billing-engine';
import type {
  Plan,
  Subscription,
  ConnectBankResult,
  UserPlanInfo,
  PlanCapabilities,
} from '@/lib/billing/billing-types';
import { UNLIMITED_CAPABILITIES } from '@/lib/billing/billing-types';

export async function getCurrentPlanSafe(userId: string): Promise<{ plan: Plan; subscription: Subscription | null }> {
  const enabled = await isMonetizationEnabled(userId);
  if (!enabled) {
    const { PLANS } = await import('@/services/firestore/plans');
    return { plan: PLANS['individual'], subscription: null };
  }
  return getCurrentPlan(userId);
}

export async function getEffectivePriceSafe(planId: string, userId?: string): Promise<{
  price: number;
  officialPrice: number;
  isCampaign: boolean;
  campaignName: string | null;
}> {
  if (userId) {
    const enabled = await isMonetizationEnabled(userId);
    if (!enabled) {
      const { PLANS } = await import('@/services/firestore/plans');
      const plan = PLANS[planId];
      return {
        price: plan?.officialPrice ?? 0,
        officialPrice: plan?.officialPrice ?? 0,
        isCampaign: false,
        campaignName: null,
      };
    }
  }
  return getEffectivePrice(planId);
}

export async function canConnectBankSafe(userId: string): Promise<ConnectBankResult> {
  const enabled = await isMonetizationEnabled(userId);
  if (!enabled) {
    return {
      allowed: true, planId: 'unlimited', planName: 'Ilimitado',
      current: 0, max: null, remaining: null, unlimited: true,
      isTrial: false, trialDaysRemaining: null, trialExpired: false,
      upgradeUrl: '/planos', upgradeMessage: '',
    };
  }
  return canConnectBank(userId);
}

export async function getUserPlanInfoSafe(userId: string): Promise<UserPlanInfo | null> {
  const enabled = await isMonetizationEnabled(userId);
  if (!enabled) return null;
  return getUserPlanInfo(userId);
}

export async function getUserCapabilitiesSafe(userId: string): Promise<PlanCapabilities> {
  const enabled = await isMonetizationEnabled(userId);
  if (!enabled) return UNLIMITED_CAPABILITIES;
  return getUserCapabilities(userId);
}
