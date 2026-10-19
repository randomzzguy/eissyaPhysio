import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_KEY;

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isDemoMode || !isSupabaseConfigured
  ? null
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
