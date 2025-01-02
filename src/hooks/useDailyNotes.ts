import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Note } from '../types';
import { isSameDay } from 'date-fns';

export const useDailyNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('daily_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const todayNotes = (data || []).filter(note => 
        isSameDay(new Date(note.created_at), new Date())
      );
      
      setNotes(todayNotes);
      return todayNotes;
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الملاحظات');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = async (content: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: insertError } = await supabase
        .from('daily_notes')
        .insert({ content })
        .select()
        .single();

      if (insertError) throw insertError;
      
      setNotes(prev => [data, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الملاحظة');
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
        .from('daily_notes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setNotes(prev => prev.filter(note => note.id !== id));
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
    deleteNote,
    fetchNotes
  };
};