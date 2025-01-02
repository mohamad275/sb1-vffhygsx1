import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';

export const useDailyConsumption = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consumption, setConsumption] = useState<any[]>([]);

  const fetchDailyConsumption = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('daily_consumption')
        .select(`
          id,
          quantity,
          ingredients:ingredient_id(id, name),
          mixes:mix_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setConsumption(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching daily consumption:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب بيانات الاستهلاك');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    consumption,
    loading,
    error,
    fetchDailyConsumption
  };
};