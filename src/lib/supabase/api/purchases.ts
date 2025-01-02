import { supabase } from '../client';
import type { Database } from '../types';

type Purchase = Database['public']['Tables']['purchases']['Row'];
type InsertPurchase = Database['public']['Tables']['purchases']['Insert'];

export const getPurchases = async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const addPurchase = async (purchase: InsertPurchase) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deletePurchase = async (id: string) => {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};