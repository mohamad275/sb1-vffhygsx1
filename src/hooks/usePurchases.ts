import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';

import type { Database } from '../lib/supabase/types';
type purchases = Database['public']['Tables']['purchases']['Row'];
export const usePurchases = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPurchases = useStore(state => state.setPurchases);

  const fetchPurchases = async () => {
    const { data, error: fetchError } = await supabase
      .from('daily_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    return data;
  };

  const addPurchase = async (ingredientId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase
        .from('daily_purchases')
        .insert({
          ingredient_id: ingredientId,
          quantity
        });

      if (insertError) throw insertError;

      const purchases = await fetchPurchases();
      setPurchases(purchases || []);
      return true;
    } catch (err) {
      console.error('Error adding purchase:', err);
      setError('حدث خطأ أثناء إضافة المشتريات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchase = async (id: string, ingredientId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('daily_purchases')
        .update({
          ingredient_id: ingredientId,
          quantity
        })
        .eq('id', id);

      if (updateError) throw updateError;

      const purchases = await fetchPurchases();
      setPurchases(purchases || []);
      return true;
    } catch (err) {
      console.error('Error updating purchase:', err);
      setError('حدث خطأ أثناء تحديث المشتريات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePurchase = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('daily_purchases')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const purchases = await fetchPurchases();
      setPurchases(purchases || []);
      return true;
    } catch (err) {
      console.error('Error deleting purchase:', err);
      setError('حدث خطأ أثناء حذف المشتريات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addPurchase,
    updatePurchase,
    deletePurchase
  };
};