import { supabase } from '../client';
import type { Database } from '../types';

type Production = Database['public']['Tables']['productions']['Row'];
type InsertProduction = Database['public']['Tables']['productions']['Insert'];

export const getProductions = async () => {
  const { data, error } = await supabase
    .from('productions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const addProduction = async (production: InsertProduction) => {
  const { data, error } = await supabase
    .from('productions')
    .insert(production)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteProduction = async (id: string) => {
  const { error } = await supabase
    .from('productions')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};