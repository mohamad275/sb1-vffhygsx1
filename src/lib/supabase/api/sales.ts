import { supabase } from '../client';
import type { Database } from '../types';

type Sale = Database['public']['Tables']['sales']['Row'];
type InsertSale = Database['public']['Tables']['sales']['Insert'];

export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const addSale = async (sale: InsertSale) => {
  const { data, error } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteSale = async (id: string) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};