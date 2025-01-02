import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Production } from '../types';
import { isSameDay } from 'date-fns';

export const useDailyProductions = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('daily_productions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const todayProductions = (data || []).filter(prod => 
        isSameDay(new Date(prod.created_at), new Date())
      );
      
      setProductions(todayProductions);
      return todayProductions;
    } catch (err) {
      console.error('Error fetching productions:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الإنتاج');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduction = async (
    mixId: string,
    bagSize: number,
    quantity: number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Start transaction
      const { error: txError } = await supabase.rpc('start_transaction');
      if (txError) throw txError;

      try {
        // Add to daily productions
        const { data: dailyProd, error: dailyError } = await supabase
          .from('daily_productions')
          .insert({
            mix_id: mixId,
            bag_size: bagSize,
            quantity: quantity
          })
          .select()
          .single();

        if (dailyError) throw dailyError;

        // Add to main productions
        const { error: mainError } = await supabase
          .from('productions')
          .insert({
            mix_id: mixId,
            bag_size: bagSize,
            quantity: quantity
          });

        if (mainError) throw mainError;

        // Commit transaction
        const { error: commitError } = await supabase.rpc('commit_current_transaction');
        if (commitError) throw commitError;

        setProductions(prev => [dailyProd, ...prev]);
        return true;
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_current_transaction');
        throw error;
      }
    } catch (err) {
      console.error('Error adding production:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الإنتاج');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    productions,
    loading,
    error,
    addProduction,
    fetchProductions
  };
};