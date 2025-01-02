import { supabase } from '../client';
import { sessionManager } from './session';
import { AUTH_ERRORS } from './constants';

export const initializeAuth = async () => {
  try {
    // First try to get stored session
    const stored = sessionManager.get();
    
    if (!stored) {
      return { user: null, error: AUTH_ERRORS.NO_SESSION };
    }

    // Try to get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      // Try to refresh if there's an error
      const refreshed = await sessionManager.refresh();
      if (!refreshed) {
        sessionManager.clear();
        return { user: null, error: AUTH_ERRORS.INVALID_SESSION };
      }
      
      // Get session again after refresh
      const { data: { session: newSession } } = await supabase.auth.getSession();
      return { user: newSession?.user || null, error: null };
    }

    return { user: session?.user || null, error: null };
  } catch (error) {
    console.error('Auth initialization failed:', error);
    return { user: null, error: AUTH_ERRORS.NETWORK_ERROR };
  }
};