import { supabase } from '../lib/supabase/client';
import { DatabaseError } from '../utils/errors';

export const fetchTableData = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new DatabaseError(error.message, tableName);
    return data || [];
  } catch (error) {
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch data', tableName);
  }
};

export const initializeDatabase = async () => {
  try {
    const tables = ['ingredients', 'mixes', 'productions', 'sales', 'daily_purchases', 'notes'];
    const results = await Promise.all(tables.map(table => fetchTableData(table)));
    
    return {
      ingredients: results[0],
      mixes: results[1],
      productions: results[2],
      sales: results[3],
      purchases: results[4],
      notes: results[5]
    };
  } catch (error) {
    throw new DatabaseError('Failed to initialize database', 'all');
  }
};