import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { MixIngredient } from '../types';
import { useStore } from '../store';

export const useMixOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setMixes = useStore(state => state.setMixes);

  const addMix = async (name: string, ingredients: MixIngredient[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('add_mix', {
        p_name: name,
        p_ingredients: ingredients.map(ing => ({
          ingredient_id: ing.ingredientId,
          quantity: ing.quantity
        }))
      });

      if (rpcError) throw rpcError;

      // Fetch updated mixes
      const { data: mixes } = await supabase
        .from('mixes')
        .select('*, mix_ingredients(*)')
        .order('created_at', { ascending: false });

      setMixes(mixes || []);
      return true;
    } catch (err) {
      console.error('Error adding mix:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الخلطة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addMix
  };
};