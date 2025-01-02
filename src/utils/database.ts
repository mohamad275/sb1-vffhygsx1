import { supabase } from '../lib/supabase/client';
import { ReportData } from '../types';

export const getDataFromDatabase = async (): Promise<ReportData> => {
  try {
    // Fetch all data in parallel
    const [
      { data: ingredients },
      { data: mixes },
      { data: productions },
      { data: sales },
      { data: purchases },
      { data: notes }
    ] = await Promise.all([
      supabase.from('ingredients').select('*'),
      supabase.from('mixes').select('*'),
      supabase.from('productions').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('daily_purchases').select('*'),
      supabase.from('notes').select('*')
    ]);

    return {
      ingredients: ingredients || [],
      mixes: mixes || [],
      productions: productions || [],
      sales: sales || [],
      purchases: purchases || [],
      notes: notes || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data from database');
  }
};