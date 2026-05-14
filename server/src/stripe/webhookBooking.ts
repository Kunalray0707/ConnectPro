import type Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase admin write: recommended to use service role key on server.
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Don’t throw at import-time if you’re just scaffolding.
  console.warn('Supabase env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

const metadataSchema = z.object({
  professional_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  price_amount: z.string(),
  currency: z.string().default('INR'),
  client_name: z.string(),
  professional_name: z.string(),
});

export async function createConfirmedBookingAfterPayment(session: Stripe.Checkout.Session) {
  const md = metadataSchema.parse((session.metadata ?? {}) as any);

  const amount = Number(md.price_amount);
  if (!Number.isFinite(amount)) throw new Error('Invalid price_amount in metadata');

  // Idempotency: ensure we don’t create duplicates if webhook retries.
  // Use Stripe session id as a unique key if you have it in DB.
  // For now we check by (professional_id,start_time,end_time,client_name) snapshot.

  const startIso = md.start_time;
  const endIso = md.end_time;

  // Check if booking already exists
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('professional_id', md.professional_id)
    .eq('start_time', startIso)
    .eq('end_time', endIso)
    .eq('client_name', md.client_name)
    .maybeSingle();

  if (existing?.id) {
    return;
  }

  const insert = {
    // We expect the client user id to be passed from the frontend via Stripe metadata.
    // If you don’t have it yet, pass it in `client_user_id` from `createCheckoutSession`.
    user_id: (md as any).client_user_id ?? null,
    professional_id: md.professional_id,
    start_time: startIso,
    end_time: endIso,
    status: 'confirmed' as const,
    price_amount: amount,
    currency: md.currency,
    client_name: md.client_name,
    professional_name: md.professional_name,
    // Optionally store stripe_session_id if schema exists
    // stripe_session_id: session.id,
  };

  const { error } = await supabase.from('bookings').insert(insert as any);
  if (error) throw error;
}

