import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Campaign, PublicCampaign } from '@/lib/billing/campaign-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeRef = adminDb.collection('settings').doc('active_campaign');
    const activeSnap = await activeRef.get();

    if (activeSnap.exists) {
      const activeData = activeSnap.data();
      const campaignId = activeData?.campaignId;
      const enabled = activeData?.enabled === true;

      if (campaignId && enabled) {
        const campaignRef = adminDb.collection('campaigns').doc(campaignId);
        const campaignSnap = await campaignRef.get();

        if (campaignSnap.exists) {
          const campaign = campaignSnap.data() as Campaign;

          if (campaign.enabled) {
            const seatsUsed = campaign.seatsUsed ?? 0;
            const seatsLimit = campaign.seatsLimit;
            const seatsRemaining = seatsLimit !== null
              ? Math.max(0, seatsLimit - seatsUsed)
              : null;

            const result: PublicCampaign = {
              enabled: true,
              name: campaign.name,
              seatsLimit,
              seatsUsed,
              seatsRemaining,
              endsAt: campaign.endsAt,
              plans: campaign.plans ?? {},
            };

            return NextResponse.json(result);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching campaign from admin Firestore:', error);
  }

  const fallback: PublicCampaign = {
    enabled: false,
    name: '',
    seatsLimit: null,
    seatsUsed: 0,
    seatsRemaining: null,
    endsAt: null,
    plans: {},
  };

  return NextResponse.json(fallback);
}
