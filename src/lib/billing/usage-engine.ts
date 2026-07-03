import { adminDb } from '@/lib/firebase-admin';
import type { UsageStats } from '@/lib/billing/billing-types';

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const [banksSnap, aiSnap] = await Promise.all([
    adminDb
      .collection('bank_connections')
      .where('userId', '==', userId)
      .where('status', 'in', ['ACTIVE', 'SYNCING', 'PENDING'])
      .get(),
    adminDb
      .collection('ai_usage')
      .where('userId', '==', userId)
      .where('month', '==', getMonthKey())
      .limit(1)
      .get(),
  ]);

  const memberCount = await getMemberCount(userId);

  return {
    connectedBanks: banksSnap.size,
    memberCount,
    aiRequestsThisMonth: aiSnap.empty ? 0 : (aiSnap.docs[0].data()?.calls || 0),
    importsThisMonth: 0,
  };
}

export async function getBankUsagePercentage(userId: string): Promise<number> {
  const stats = await getUsageStats(userId);
  const { getUserCapabilities } = await import('./capabilities-engine');
  const caps = await getUserCapabilities(userId);

  if (caps.maxBankConnections === null || caps.maxBankConnections === 0) return 0;
  return Math.round((stats.connectedBanks / caps.maxBankConnections) * 100);
}

export async function getAIUsagePercentage(userId: string): Promise<number> {
  const stats = await getUsageStats(userId);
  const { getUserCapabilities } = await import('./capabilities-engine');
  const caps = await getUserCapabilities(userId);

  if (caps.monthlyCredits === null || caps.monthlyCredits === 0) return 0;
  return Math.round((stats.aiRequestsThisMonth / caps.monthlyCredits) * 100);
}

async function getMemberCount(userId: string): Promise<number> {
  const userSnap = await adminDb.collection('users').doc(userId).get();
  if (!userSnap.exists) return 1;

  const householdId = userSnap.data()?.activeHouseholdId;
  if (!householdId) return 1;

  const membersSnap = await adminDb
    .collection('household_members')
    .where('householdId', '==', householdId)
    .get();

  return membersSnap.size || 1;
}

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
