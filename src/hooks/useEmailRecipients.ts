import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { verifyEmailRecipients, addDefaultRecipient } from '../utils/reports/emailService';

export const useEmailRecipients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRecipients, setHasRecipients] = useState(false);

  useEffect(() => {
    const checkRecipients = async () => {
      const hasActiveRecipients = await verifyEmailRecipients();
      setHasRecipients(hasActiveRecipients);
    };

    checkRecipients();
  }, []);

  const addRecipient = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc(
        'add_email_recipient',
        { p_email: email }
      );

      if (rpcError) throw rpcError;

      if (!data.success) {
        setError(data.message);
        return false;
      }

      setHasRecipients(true);
      return true;
    } catch (err) {
      console.error('Error adding email recipient:', err);
      setError('حدث خطأ أثناء إضافة البريد الإلكتروني');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeRecipient = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('email_recipients')
        .delete()
        .eq('email', email);

      if (deleteError) throw deleteError;

      // Check if we still have recipients
      const stillHasRecipients = await verifyEmailRecipients();
      setHasRecipients(stillHasRecipients);
      
      return true;
    } catch (err) {
      console.error('Error removing email recipient:', err);
      setError('حدث خطأ أثناء حذف البريد الإلكتروني');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    hasRecipients,
    addRecipient,
    removeRecipient
  };
};