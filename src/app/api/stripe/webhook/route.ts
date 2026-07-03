import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleInvoicePaid,
  handlePaymentFailed,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
} from '@/lib/billing/billing-engine';

export const runtime = 'nodejs';

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
          await handleCheckoutCompleted(session);
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

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const subId = invoice.subscription as string;
        if (invoice.metadata?.type === 'findomus_subscription' && subId) {
          await handleInvoicePaid({ subscription: subId });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subId = invoice.subscription as string;
        if (subId) {
          await handlePaymentFailed({ subscription: subId });
        }
        break;
      }

      case 'customer.subscription.paused': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionPaused(sub);
        break;
      }

      case 'customer.subscription.resumed': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionResumed(sub);
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
