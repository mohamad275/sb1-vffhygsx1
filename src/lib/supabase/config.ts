export const SUPABASE_CONFIG = {
  auth: {
    persistSession: true,
    storageKey: 'modern-feed-auth',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
};