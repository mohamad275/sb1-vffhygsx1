import { useState, useEffect, useCallback } from 'react';
import { checkConnection } from '../lib/supabase/client';

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(true); // Start with true to prevent flash
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const verifyConnection = useCallback(async () => {
    try {
      const connected = await checkConnection();
      setIsConnected(connected);
      setError(connected ? null : 'فشل الاتصال بقاعدة البيانات');
      return connected;
    } catch (err) {
      setIsConnected(false);
      setError('حدث خطأ أثناء الاتصال بقاعدة البيانات');
      return false;
    }
  }, []);

  const retryConnection = useCallback(async () => {
    setRetrying(true);
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      const connected = await verifyConnection();
      if (connected) {
        setRetrying(false);
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
      retries--;
    }

    setRetrying(false);
    return false;
  }, [verifyConnection]);

  useEffect(() => {
    verifyConnection();
    const interval = setInterval(verifyConnection, 30000);
    return () => clearInterval(interval);
  }, [verifyConnection]);

  return {
    isConnected,
    error,
    retrying,
    retry: retryConnection
  };
};