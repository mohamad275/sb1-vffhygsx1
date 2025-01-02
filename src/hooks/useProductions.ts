import { useState } from 'react';
import { useStore } from '../store';
import { addProduction } from '../lib/supabase/operations/production/addProduction';
import { deleteProduction } from '../lib/supabase/operations/production/deleteProduction';
import { supabase } from '../lib/supabase/client';

export const useProductions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProductions } = useStore();

  const handleAddProduction = async (mixId: string, bagSize: number, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await addProduction(mixId, bagSize, quantity);
      if (!result.success) {
        throw new Error(result.error);
      }

      await refreshProductionsData();
      return true;
    } catch (err) {
      console.error('Error adding production:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الإنتاج');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduction = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteProduction(id);
      if (!result.success) {
        throw new Error(result.error);
      }

      await refreshProductionsData();
      return true;
    } catch (err) {
      console.error('Error deleting production:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الإنتاج');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProductionsData = async () => {
    const { data, error: fetchError } = await supabase
      .from('productions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    setProductions(data || []);
  };

  return {
    loading,
    error,
    addProduction: handleAddProduction,
    deleteProduction: handleDeleteProduction
  };
};