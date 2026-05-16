import { supabase } from './supabaseClient';

export type ProfessionalReviewRow = {
  id: string;
  professional_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    name?: string | null;
  };
};

function assertConfigured(): void {
  // supabase client is exported as {} when not configured.
  // Call sites should guard by checking isSupabaseConfigured.
  if (!supabase) throw new Error('Supabase client not available');
}

export async function fetchProfessionalReviews(professionalId: string): Promise<ProfessionalReviewRow[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('professional_reviews')
    .select(
      `id,professional_id,user_id,rating,comment,created_at,updated_at, user:user_id(name)`
    )
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProfessionalReviewRow[];
}

export async function fetchProfessionalAggregate(
  professionalId: string,
): Promise<{ average_rating: number; total_reviews: number } | null> {
  assertConfigured();

  const { data, error } = await supabase
    .from('profiles')
    .select('average_rating,total_reviews')
    .eq('id', professionalId)
    .maybeSingle();

  if (error) throw error;
  return data ? { average_rating: data.average_rating, total_reviews: data.total_reviews } : null;
}

export async function submitProfessionalReview(params: {
  professionalId: string;
  userId: string;
  rating: number;
  comment: string;
}): Promise<ProfessionalReviewRow | null> {
  assertConfigured();

  const rating = Math.floor(params.rating);
  const comment = params.comment?.trim();

  if (!params.userId) throw new Error('Not authenticated');
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  if (!comment) throw new Error('Comment is required');

  const insert = {
    professional_id: params.professionalId,
    user_id: params.userId,
    rating,
    comment,
  };

  const { data, error } = await supabase.from('professional_reviews').insert(insert).select('*').maybeSingle();
  if (error) throw error;
  return (data ?? null) as ProfessionalReviewRow | null;
}

export function subscribeProfessionalReviews(params: {
  professionalId: string;
  onChange: () => void;
}): { unsubscribe: () => void } {
  assertConfigured();

  const channel = supabase
    .channel(`professional_reviews:${params.professionalId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'professional_reviews',
        filter: `professional_id=eq.${params.professionalId}`,
      },
      () => {
        params.onChange();
      },
    )
    // aggregate changes happen via trigger updating profiles;
    // listen to profiles row too for immediate rating count changes
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${params.professionalId}`,
      },
      () => {
        params.onChange();
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}

