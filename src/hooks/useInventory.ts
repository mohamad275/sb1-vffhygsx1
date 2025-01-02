import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';

export const useInventory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setInventory = useStore(state => state.setInventory);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setInventory(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب المخزون');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setInventory]);

  return {
    loading,
    error,
    fetchInventory
  };
};