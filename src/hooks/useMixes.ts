import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';

export const useMixes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setMixes = useStore(state => state.setMixes);

  const deleteMix = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('delete_mix_safe', {
        p_mix_id: id
      });

      if (rpcError) throw rpcError;
      if (!data?.success) {
        throw new Error(data?.message || 'لا يمكن حذف الخلطة لوجود إنتاج أو مبيعات مرتبطة بها');
      }

      const { data: mixes } = await supabase
        .from('mixes')
        .select('*, mix_ingredients(*)')
        .order('created_at', { ascending: false });

      setMixes(mixes || []);
      return true;
    } catch (err) {
      console.error('Error deleting mix:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الخلطة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the existing code ...

  return {
    loading,
    error,
    deleteMix,
    // ... other existing methods ...
  };
};