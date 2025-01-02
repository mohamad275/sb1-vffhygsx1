import { supabase } from '../client';
import type { Database } from '../types';

type Note = Database['public']['Tables']['notes']['Row'];
type InsertNote = Database['public']['Tables']['notes']['Insert'];

export const getNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const addNote = async (note: InsertNote) => {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteNote = async (id: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};