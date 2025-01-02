import { useState } from 'react';
import { supabase } from '../lib/supabase/client';

export interface DailySale {
  id: string;
  mix_id: string;
  bag_size: number;
  quantity: number;
  created_at: string;
}

export const useDailySales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailySales = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error: fetchError } = await supabase
      .from('daily_sales')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    return data;
  };

  const addDailySale = async (mixId: string, bagSize: number, quantity: number) => {
    try {
      const { error: insertError } = await supabase
        .from('daily_sales')
        .insert({
          mix_id: mixId,
          bag_size: bagSize,
          quantity: quantity
        });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error('Error adding daily sale:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchDailySales,
    addDailySale
  };
};