import { supabase, isSupabaseConfigured } from './supabaseClient';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type AppointmentTier =
  | { id: 'basic'; label: string; priceAmount: number; durationMinutes: number }
  | { id: 'standard'; label: string; priceAmount: number; durationMinutes: number }
  | { id: 'premium'; label: string; priceAmount: number; durationMinutes: number };

export const APPOINTMENT_TIERS: AppointmentTier[] = [
  { id: 'basic', label: '₹499 / 30 min', priceAmount: 499, durationMinutes: 30 },
  { id: 'standard', label: '₹999 / 1 hour', priceAmount: 999, durationMinutes: 60 },
  { id: 'premium', label: '₹1999 / Premium (2 hours)', priceAmount: 1999, durationMinutes: 120 },
];

export type BookingRow = {
  id: string;
  user_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  price_amount: number | null;
  currency: string;
  created_at: string;
};

const toIso = (d: Date) => d.toISOString();

export async function fetchBookingsForProfessional(
  professionalId: string,
  from: Date,
  to: Date,
): Promise<BookingRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('professional_id', professionalId)
    .gte('start_time', toIso(from))
    .lt('start_time', toIso(to))
    .in('status', ['pending', 'confirmed'])
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

export async function createBooking(params: {
  professionalId: string;
  startTime: Date;
  endTime: Date;
  priceAmount: number;
  currency?: string;
  clientNameSnapshot: string;
  professionalNameSnapshot: string;
}): Promise<BookingRow | null> {
  if (!isSupabaseConfigured) return null;

  const {
    professionalId,
    startTime,
    endTime,
    priceAmount,
    currency = 'INR',
    clientNameSnapshot,
    professionalNameSnapshot,
  } = params;

  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const insert = {
    user_id: userId,
    professional_id: professionalId,
    start_time: toIso(startTime),
    end_time: toIso(endTime),
    status: 'confirmed' as BookingStatus,
    price_amount: priceAmount,
    currency,
    client_name: clientNameSnapshot,
    professional_name: professionalNameSnapshot,
  };

  const { data, error } = await supabase.from('bookings').insert(insert).select('*').single();
  if (error) throw error;
  return (data ?? null) as BookingRow | null;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' as BookingStatus })
    .eq('id', bookingId);

  if (error) throw error;
}

