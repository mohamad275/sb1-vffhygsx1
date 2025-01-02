import { supabase } from '../client';
import { DatabaseError } from '../../../utils/errors';

export async function fetchTableData<T>(
  table: string,
  options: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  } = {}
) {
  try {
    // Add retry logic
    const maxRetries = 3;
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
      try {
        let query = supabase.from(table).select(options.select || '*');

        if (options.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        if (options.orderBy) {
          query = query.order(options.orderBy, { ascending: options.ascending ?? false });
        }

        const { data, error } = await query;

        if (error) {
          throw new DatabaseError(`Error fetching ${table}: ${error.message}`, table);
        }

        return data as T[];
      } catch (error) {
        lastError = error;
        attempt++;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    return [] as T[]; // Return empty array instead of throwing
  }
}