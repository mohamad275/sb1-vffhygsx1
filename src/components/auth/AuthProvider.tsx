import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { sessionManager } from '../../lib/supabase/auth/session';
import { initializeAuth } from '../../lib/supabase/auth/initialize';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { user, error } = await initializeAuth();
      
      if (!mounted) return;

      setState({
        user,
        loading: false,
        error
      });
    };

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        sessionManager.store({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: Date.now() + (session.expires_in || 0) * 1000
        });
      } else if (event === 'SIGNED_OUT') {
        sessionManager.clear();
      }

      if (mounted) {
        setState(prev => ({
          ...prev,
          user: session?.user || null
        }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};