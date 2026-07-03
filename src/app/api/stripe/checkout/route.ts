import { NextRequest, NextResponse } from 'next/server';
import { getPlanById } from '@/services/firestore/plans';
import { createCheckoutSession, getEffectivePrice, canUpgrade } from '@/lib/billing/billing-engine';
import { verifyIdToken } from '@/lib/verify-id-token';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'STRIPE_SECRET_KEY_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    let authenticatedUserId = '';
    try {
      const authHeader = req.headers.get('authorization');
      const decodedToken = await verifyIdToken(authHeader);
      authenticatedUserId = decodedToken.uid;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, email, userId, householdId } = body;

    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN_USER_ID_MISMATCH' },
        { status: 403 }
      );
    }

    if (!planId || !email || !userId || !householdId) {
      return NextResponse.json(
        { success: false, error: 'PLAN_ID_EMAIL_USER_ID_AND_HOUSEHOLD_ID_REQUIRED' },
        { status: 400 }
      );
    }

    const canUpgradeResult = await canUpgrade(userId, planId);
    if (!canUpgradeResult.allowed) {
      return NextResponse.json(
        { success: false, error: canUpgradeResult.reason || 'UPGRADE_NOT_ALLOWED' },
        { status: 403 }
      );
    }

    const plan = await getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'PLAN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const pricing = await getEffectivePrice(planId);
    const priceInCents = Math.round(pricing.price * 100);

    if (priceInCents === 0) {
      return NextResponse.json({
        success: true,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard`,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    const result = await createCheckoutSession({ planId, email, userId, householdId, appUrl });

    if (!result) {
      return NextResponse.json({
        success: true,
        checkoutUrl: `${appUrl}/dashboard`,
      });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });
  } catch (error: any) {
    console.error('[POST /api/stripe/checkout]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
