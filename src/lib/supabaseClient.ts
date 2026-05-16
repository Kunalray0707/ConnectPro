import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// IMPORTANT: Supabase client creation throws if URL/anon key are empty.
// This prevents the whole React app from mounting, causing a blank screen.
const shouldCreateClient = isSupabaseConfigured;

export const supabase = shouldCreateClient
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : ({} as ReturnType<typeof createClient>);
