import { supabase } from '../client';
import type { Database } from '../types';

type Ingredient = Database['public']['Tables']['ingredients']['Row'];
type InsertIngredient = Database['public']['Tables']['ingredients']['Insert'];
type UpdateIngredient = Database['public']['Tables']['ingredients']['Update'];

export const getIngredients = async () => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
};

export const addIngredient = async (ingredient: InsertIngredient) => {
  const { data, error } = await supabase
    .from('ingredients')
    .insert(ingredient)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateIngredient = async (id: string, updates: UpdateIngredient) => {
  const { data, error } = await supabase
    .from('ingredients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteIngredient = async (id: string) => {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};