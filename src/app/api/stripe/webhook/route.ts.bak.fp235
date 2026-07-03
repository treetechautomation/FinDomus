import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe/server';

export const runtime = 'nodejs';

async function handleSubscriptionCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const planId = metadata.planId;
  const householdId = metadata.householdId;
  const subscriptionId = session.subscription as string;

  if (!planId || !householdId) {
    console.warn('[Stripe Webhook] Missing planId or householdId in metadata:', metadata);
    return;
  }

  const nowStr = new Date().toISOString();

  // 1. Atualizar o plano do household
  await adminDb.collection('households').doc(householdId).update({
    planId,
    updatedAt: nowStr,
  });

  // 2. Obter período final da assinatura se disponível
  let currentPeriodEnd: string | null = null;
  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
      currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
    } catch (e) {
      console.error('[Stripe Webhook] Failed to retrieve subscription details:', e);
    }
  }

  // 3. Salvar assinatura
  const subData = {
    householdId,
    planId,
    status: 'active',
    currentPeriodEnd,
    updatedAt: nowStr,
  };

  const subSnap = await adminDb.collection('subscriptions')
    .where('householdId', '==', householdId)
    .limit(1)
    .get();

  if (!subSnap.empty) {
    await subSnap.docs[0].ref.update(subData);
  } else {
    await adminDb.collection('subscriptions').add({
      ...subData,
      createdAt: nowStr,
    });
  }

  console.log(`[Stripe Webhook] Subscription completed and saved for household ${householdId} with plan ${planId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata || {};
  const planId = metadata.planId;
  const householdId = metadata.householdId;

  if (!planId || !householdId) return;

  const nowStr = new Date().toISOString();
  const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' :
                 subscription.status === 'past_due' ? 'past_due' : 'canceled';

  // 1. Atualizar household status se cancelado
  if (status === 'canceled') {
    await adminDb.collection('households').doc(householdId).update({
      planId: 'individual', // fallback default
      updatedAt: nowStr,
    });
  }

  // 2. Atualizar assinatura
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

  const subData = {
    householdId,
    planId,
    status,
    currentPeriodEnd,
    updatedAt: nowStr,
  };

  const subSnap = await adminDb.collection('subscriptions')
    .where('householdId', '==', householdId)
    .limit(1)
    .get();

  if (!subSnap.empty) {
    await subSnap.docs[0].ref.update(subData);
  } else {
    await adminDb.collection('subscriptions').add({
      ...subData,
      createdAt: nowStr,
    });
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { success: false, error: 'STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { success: false, error: 'MISSING_STRIPE_SIGNATURE' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('[Stripe Webhook] Signature validation error:', error.message);
    return NextResponse.json(
      { success: false, error: 'INVALID_SIGNATURE' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === 'findomus_subscription') {
          await handleSubscriptionCompleted(session);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.type === 'findomus_subscription') {
          await handleSubscriptionUpdated(sub);
        }
        break;
      }

      default:
        console.log('[Stripe Webhook] Ignored event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'WEBHOOK_HANDLER_ERROR' },
      { status: 500 }
    );
  }
}
