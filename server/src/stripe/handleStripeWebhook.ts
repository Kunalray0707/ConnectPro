import type { Request } from 'express';
import Stripe from 'stripe';
import { createConfirmedBookingAfterPayment } from './webhookBooking';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

const webhookBodySchema = z.any();

export async function handleStripeWebhook(req: Request) {
  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    throw new Error('Missing stripe-signature header');
  }

  const raw = req.body as Buffer;
  if (!raw || !(raw instanceof Buffer)) {
    throw new Error('Missing raw request body');
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  if (!secret || secret.includes('your_webhook_secret_here')) {
    // Allow scaffolding but fail webhook verification safely.
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  const event = stripe.webhooks.constructEvent(raw, signature, secret);

  // We only act after checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await createConfirmedBookingAfterPayment(session);
  }

  return { received: true };
}

