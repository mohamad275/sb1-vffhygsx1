import { supabase } from '../client';
import { AUTH_STORAGE_KEY, SESSION_EXPIRY, AUTH_ERRORS } from './constants';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const sessionManager = {
  store(session: StoredSession) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        ...session,
        expiresAt: Date.now() + SESSION_EXPIRY
      }));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  },

  get(): StoredSession | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // Check expiry
      if (session.expiresAt < Date.now()) {
        this.clear();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  async refresh(): Promise<boolean> {
    const stored = this.get();
    if (!stored?.refreshToken) return false;

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession({
        refresh_token: stored.refreshToken
      });

      if (error) throw error;
      if (!session) return false;

      this.store({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: Date.now() + SESSION_EXPIRY
      });

      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      this.clear();
      return false;
    }
  },

  // التحقق من الجلسة عند تحميل الصفحة
  async checkSession(): Promise<void> {
    const storedSession = this.get();
    if (!storedSession) {
      // في حال لم تكن الجلسة موجودة أو منتهية، أعد توجيه المستخدم لتسجيل الدخول
      window.location.href = '/login';  // يمكنك تغيير هذا حسب المسار الذي تستخدمه
    } else {
      // إذا كانت الجلسة صالحة، لا داعي للانتظار
      // استكمال العملية بشكل طبيعي
      await this.refresh();
    }
  }
};
