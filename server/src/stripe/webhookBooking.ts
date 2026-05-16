import type Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase admin write: recommended to use service role key on server.
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

// IMPORTANT: Supabase createClient throws if URL/key are empty.
// Never create it at import-time when env is missing; it crashes the whole server.
const shouldCreateClient = isSupabaseConfigured;

const supabase = shouldCreateClient
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : ({} as ReturnType<typeof createClient>);

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
  if (!isSupabaseConfigured) {
    throw new Error('Supabase env vars missing on server; cannot confirm bookings after payment.');
  }

  const md = metadataSchema.parse((session.metadata ?? {}) as any);

  const amount = Number(md.price_amount);
  if (!Number.isFinite(amount)) throw new Error('Invalid price_amount in metadata');

  const startIso = md.start_time;
  const endIso = md.end_time;

  // Check if booking already exists (idempotency)
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
    user_id: (md as any).client_user_id ?? null,
    professional_id: md.professional_id,
    start_time: startIso,
    end_time: endIso,
    status: 'confirmed' as const,
    price_amount: amount,
    currency: md.currency,
    client_name: md.client_name,
    professional_name: md.professional_name,
  };

  const { error } = await supabase.from('bookings').insert(insert as any);
  if (error) throw error;
}
