import { supabase } from './supabaseClient';

export type BadgeLevel = 'none' | 'basic' | 'pro' | 'elite';

export type ProfessionalVerificationRow = {
  professional_profile_id: string;
  email_verified: boolean;
  phone_verified: boolean;
  documents_verified: boolean;
  admin_verified: boolean;
  badge_level: BadgeLevel;
  updated_at: string;
};

export async function fetchProfessionalVerification(
  professionalProfileId: string,
): Promise<ProfessionalVerificationRow | null> {
  const { data, error } = await supabase
    .from('professional_verifications')
    .select('*')
    .eq('professional_profile_id', professionalProfileId)
    .maybeSingle();

  if (error) throw error;
  return (data as ProfessionalVerificationRow) ?? null;
}

