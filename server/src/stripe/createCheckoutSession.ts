import type { Request } from 'express';
import Stripe from 'stripe';
import { createConfirmedBookingAfterPayment } from './webhookBooking';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

const payloadSchema = z.object({
  // Booking data needed to create booking after webhook verification
  professional_id: z.string().min(1),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  price_amount: z.number().int().positive(),
  currency: z.string().default('INR'),
  // Snapshot columns (recommended)
  client_name: z.string().min(1),
  professional_name: z.string().min(1),
});

export async function createCheckoutSession(req: Request) {
  const parsed = payloadSchema.parse(req.body);

  // Persist the booking payload reference.
  // For now we use Stripe metadata; in production you’d store a pending booking in DB.
  // Associate booking with the authenticated user (if caller provides it).
  // Frontend should send `client_user_id` when creating checkout session.
  const metadata = {
    professional_id: parsed.professional_id,
    start_time: parsed.start_time,
    end_time: parsed.end_time,
    price_amount: String(parsed.price_amount),
    currency: parsed.currency,
    client_name: parsed.client_name,
    professional_name: parsed.professional_name,
    client_user_id: (parsed as any).client_user_id,
  };

  const amountMinor = parsed.price_amount * 100; // INR in paise

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: parsed.currency.toLowerCase(),
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: parsed.currency.toLowerCase(),
          product_data: {
            name: `ConnectPro appointment`,
          },
          unit_amount: amountMinor,
        },
        quantity: 1,
      },
    ],
    metadata,
    success_url: process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:5174/dashboard',
    cancel_url: process.env.STRIPE_CANCEL_URL ?? 'http://localhost:5174/dashboard',
    // Optionally add automatic tax etc.
  });

  // IMPORTANT: Booking is NOT created here (Option B).
  // Booking creation happens in webhook after signature verification.
  return session;
}

