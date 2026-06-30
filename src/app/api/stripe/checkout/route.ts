import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { PLANS } from '@/services/firestore/plans';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'STRIPE_SECRET_KEY_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { planId, email, userId, householdId } = body;

    if (!planId || !email || !userId || !householdId) {
      return NextResponse.json(
        { success: false, error: 'PLAN_ID_EMAIL_USER_ID_AND_HOUSEHOLD_ID_REQUIRED' },
        { status: 400 }
      );
    }

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'PLAN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const priceInCents = Math.round(plan.price * 100);

    // Se o preço for 0 (plano gratuito), não cria sessão de checkout no Stripe
    if (priceInCents === 0) {
      return NextResponse.json({
        success: true,
        checkoutUrl: `${appUrl}/dashboard`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: `FinDomus - Plano ${plan.name}`,
              description: `Assinatura mensal do plano ${plan.name}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'findomus_subscription',
        planId,
        userId,
        householdId,
        email,
      },
      subscription_data: {
        metadata: {
          type: 'findomus_subscription',
          planId,
          userId,
          householdId,
        },
      },
      success_url: `${appUrl}/planos?checkout=success`,
      cancel_url: `${appUrl}/planos?checkout=cancel`,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('[POST /api/stripe/checkout]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
