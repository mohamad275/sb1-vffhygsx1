import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';
import { Note } from '../types';

export const useNotes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notes, setNotes } = useStore();

  const fetchNotes = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setNotes(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الملاحظات');
      return [];
    }
  };

  const addNote = async (content: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({ content })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setNotes([data, ...notes]);
      return true;
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الملاحظة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, content: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('notes')
        .update({ content })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setNotes(notes.map(note => note.id === id ? data : note));
      return true;
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الملاحظة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setNotes(notes.filter(note => note.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الملاحظة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    fetchNotes
  };
};