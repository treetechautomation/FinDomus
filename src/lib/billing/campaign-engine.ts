import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Campaign, CampaignPlanPricing } from '@/lib/billing/campaign-types';

export async function getActiveCampaign(): Promise<Campaign | null> {
  const activeRef = adminDb.collection('settings').doc('active_campaign');
  const activeSnap = await activeRef.get();

  if (!activeSnap.exists) return null;

  const activeData = activeSnap.data();
  if (!activeData?.enabled || !activeData?.campaignId) return null;

  const campaignRef = adminDb.collection('campaigns').doc(activeData.campaignId);
  const campaignSnap = await campaignRef.get();

  if (!campaignSnap.exists) return null;

  const campaign = { id: campaignSnap.id, ...campaignSnap.data() } as Campaign;

  if (!campaign.enabled) return null;

  if (campaign.seatsLimit !== null && (campaign.seatsUsed ?? 0) >= campaign.seatsLimit) {
    return null;
  }

  if (campaign.endsAt && Date.now() > new Date(campaign.endsAt).getTime()) {
    return null;
  }

  return campaign;
}

export async function getCampaignPricing(planId: string): Promise<{
  officialPrice: number;
  campaignPrice: number;
  isActive: boolean;
  campaignName: string | null;
  campaignId: string | null;
  seatsRemaining: number | null;
}> {
  const campaign = await getActiveCampaign();

  if (!campaign || !campaign.plans?.[planId]) {
    return {
      officialPrice: 0,
      campaignPrice: 0,
      isActive: false,
      campaignName: null,
      campaignId: null,
      seatsRemaining: null,
    };
  }

  const planPricing = campaign.plans[planId];
  const seatsRemaining = campaign.seatsLimit !== null
    ? Math.max(0, campaign.seatsLimit - (campaign.seatsUsed ?? 0))
    : null;

  return {
    officialPrice: planPricing.officialPrice,
    campaignPrice: planPricing.campaignPrice,
    isActive: true,
    campaignName: campaign.name,
    campaignId: campaign.id,
    seatsRemaining,
  };
}

export async function consumeCampaignSeat(campaignId: string): Promise<void> {
  const ref = adminDb.collection('campaigns').doc(campaignId);
  await ref.update({
    seatsUsed: FieldValue.increment(1),
    'stats.conversions': FieldValue.increment(1),
    updatedAt: new Date().toISOString(),
  } as any);
}

export async function releaseCampaignSeat(campaignId: string): Promise<void> {
  const ref = adminDb.collection('campaigns').doc(campaignId);
  await ref.update({
    seatsUsed: FieldValue.increment(-1),
    updatedAt: new Date().toISOString(),
  } as any);
}

export async function getRemainingSeats(): Promise<number | null> {
  const campaign = await getActiveCampaign();
  if (!campaign || campaign.seatsLimit === null) return null;
  return Math.max(0, campaign.seatsLimit - (campaign.seatsUsed ?? 0));
}

export async function initDefaultCampaign(): Promise<void> {
  const campaignRef = adminDb.collection('campaigns').doc('launch_2026');
  const snap = await campaignRef.get();
  if (snap.exists) return;

  const campaign: Campaign = {
    id: 'launch_2026',
    name: 'Lançamento FinDomus 2026',
    type: 'launch',
    enabled: true,
    seatsLimit: 50,
    seatsUsed: 0,
    plans: {
      individual: { officialPrice: 39.90, campaignPrice: 29.90 },
      family: { officialPrice: 69.90, campaignPrice: 49.90 },
      family_premium: { officialPrice: 99.00, campaignPrice: 59.90 },
    },
    startsAt: null,
    endsAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { totalRevenue: 0, conversions: 0, views: 0 },
  };

  await campaignRef.set(campaign as any);

  await adminDb.collection('settings').doc('active_campaign').set({
    campaignId: 'launch_2026',
    enabled: true,
  } as any);
}
