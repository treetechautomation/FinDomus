export interface Plan {
  id: string;
  name: string;
  officialPrice: number;
  campaignPrice: number;
  billingPeriod: 'monthly' | 'yearly';
  maxBankConnections: number | null;
  maxMembers: number;
  maxManualImports: number | null;
  aiTier: 'none' | 'basic' | 'full' | 'advanced';
  monthlyCredits: number | null;
  allowPluggy: boolean;
  allowInvestments: boolean;
  allowCompanies: boolean;
  allowReports: boolean;
  allowFamily: boolean;
  allowAcademyPremium: boolean;
  supportLevel: 'standard' | 'priority';
  trialDays: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  recommended: boolean;
}

export interface Subscription {
  id: string;
  householdId: string;
  planId: string;
  status: 'trialing' | 'active' | 'expired' | 'canceled' | 'past_due' | 'paused';
  currentPeriodEnd: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialUsed: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  campaignId: string | null;
  pausedAt: string | null;
  resumedAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanCapabilities {
  canUsePluggy: boolean;
  canUseAI: boolean;
  canExportPDF: boolean;
  canInviteFamily: boolean;
  canManageCompanies: boolean;
  canAccessReports: boolean;
  canAccessInvestments: boolean;
  canAccessAcademy: boolean;
  canAccessAcademyPremium: boolean;
  canAccessFreedomIndex: boolean;
  canAccessPremiumReports: boolean;
  canAccessWhatsAppPremium: boolean;
  maxBankConnections: number | null;
  maxMembers: number;
  maxManualImports: number | null;
  monthlyCredits: number | null;
  aiTier: 'none' | 'basic' | 'full' | 'advanced';
  supportLevel: 'standard' | 'priority';
}

export interface ConnectBankResult {
  allowed: boolean;
  reason?: 'TRIAL_EXPIRED' | 'PLAN_LIMIT_REACHED' | 'FEATURE_DISABLED';
  planId: string;
  planName: string;
  current: number;
  max: number | null;
  remaining: number | null;
  unlimited: boolean;
  isTrial: boolean;
  trialDaysRemaining: number | null;
  trialExpired: boolean;
  upgradeUrl: string;
  upgradeMessage: string;
}

export interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  endsAt: string | null;
  startedAt: string | null;
  used: boolean;
}

export interface UsageStats {
  connectedBanks: number;
  memberCount: number;
  aiRequestsThisMonth: number;
  importsThisMonth: number;
}

export interface UserPlanInfo {
  planId: string;
  planName: string;
  recommended: boolean;
  price: number;
  officialPrice: number;
  isCampaignPrice: boolean;
  capabilities: PlanCapabilities;
  trial: TrialStatus;
  usage: UsageStats & {
    maxBanks: number | null;
    remainingBanks: number | null;
    bankUsagePercent: number;
    maxAIRequests: number | null;
    aiUsagePercent: number;
  };
}

export type CTALevel = 'none' | 'info' | 'warning' | 'upgrade' | 'expired';

export interface SmartCTA {
  level: CTALevel;
  title: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
  highlight: boolean;
}

export const UNLIMITED_CAPABILITIES: PlanCapabilities = {
  canUsePluggy: true,
  canUseAI: true,
  canExportPDF: true,
  canInviteFamily: true,
  canManageCompanies: true,
  canAccessReports: true,
  canAccessInvestments: true,
  canAccessAcademy: true,
  canAccessAcademyPremium: true,
  canAccessFreedomIndex: true,
  canAccessPremiumReports: true,
  canAccessWhatsAppPremium: true,
  maxBankConnections: null,
  maxMembers: 99,
  maxManualImports: null,
  monthlyCredits: null,
  aiTier: 'advanced',
  supportLevel: 'priority',
};
