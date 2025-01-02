import { supabase } from './client';

// Export the auth client for direct usage
export const auth = supabase.auth;

// Export a type-safe auth client
export const supabaseAuth = {
  auth,
  from: supabase.from.bind(supabase)
};