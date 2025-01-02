import { supabase } from '../client';

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('ingredients').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};