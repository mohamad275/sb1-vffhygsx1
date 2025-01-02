import { useState } from 'react';
import { db, supabase } from '../lib/supabase/client';

import { useStore } from '../store';
import type { Ingredient } from '../types';





export const useIngredients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setIngredients = useStore(state => state.setIngredients);

  const fetchIngredients = async () => {
    const { data, error: fetchError } = await supabase
      .from('ingredients')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    return data;
  };

  const addIngredient = async (name: string, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // When adding a new ingredient, both total and available quantities are equal
      const { error: insertError } = await supabase
        .from('ingredients')
        .insert({
          name,
          total_quantity: quantity,
          available_quantity: quantity // Set initial available quantity equal to total
        });

      if (insertError) throw insertError;

      const ingredients = await fetchIngredients();
      setIngredients(ingredients || []);
      return true;
    } catch (err) {
      console.error('Error adding ingredient:', err);
      setError('حدث خطأ أثناء إضافة الصنف');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateIngredient = async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await db
        .from('ingredients')
        .update({ name })
        .eq('id', id);

      if (updateError) throw updateError;

      const { data: ingredients } = await db
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      setIngredients(ingredients || []);
      return true;
    } catch (err) {
      console.error('Error updating ingredient:', err);
      setError('حدث خطأ أثناء تحديث الصنف');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateIngredientQuantity = async (id: string, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      // When updating quantity, increase both total and available
      const { data: ingredient } = await supabase
        .from('ingredients')
        .select('total_quantity, available_quantity')
        .eq('id', id)
        .single();

      if (!ingredient) throw new Error('Ingredient not found');
    
    
      const { error: updateError } = await db
        .from('ingredients')
        .update({
          total_quantity: quantity,
          available_quantity: quantity
        })
        .eq('id', id);

      if (updateError) throw updateError;

      const { data: ingredients } = await db
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      setIngredients(ingredients || []);
      return true;
    } catch (err) {
      console.error('Error updating ingredient quantity:', err);
      setError('حدث خطأ أثناء تحديث كمية الصنف');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteIngredient = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const ingredients = await fetchIngredients();
      setIngredients(ingredients || []);
      return true;
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      setError('حدث خطأ أثناء حذف الصنف');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addIngredient,
    error,
    updateIngredient,
    updateIngredientQuantity,
    deleteIngredient
  };
};