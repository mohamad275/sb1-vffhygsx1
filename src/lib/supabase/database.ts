import { DatabaseError } from '../../utils/errors';
import { fetchIngredients } from './tables/ingredients';
import { fetchMixes } from './tables/mixes';
import { fetchProductions } from './tables/productions';
import { fetchSales } from './tables/sales';
import { fetchTableData } from './tables/base';

export async function initializeDatabase() {
  const results = {
    ingredients: [],
    mixes: [],
    productions: [],
    sales: [],
    purchases: [],
    notes: []
  };

  try {
    // Fetch data sequentially to handle dependencies
    results.ingredients = await fetchIngredients();
    results.mixes = await fetchMixes();
    
    // Fetch remaining data in parallel
    const [productions, sales, purchases, notes] = await Promise.all([
      fetchProductions().catch(() => []),
      fetchSales().catch(() => []),
      fetchTableData('daily_purchases', { orderBy: 'created_at' }).catch(() => []),
      fetchTableData('notes', { orderBy: 'created_at' }).catch(() => [])
    ]);

    results.productions = productions;
    results.sales = sales;
    results.purchases = purchases;
    results.notes = notes;

    return results;
  } catch (error) {
    console.error('Database initialization error:', error);
    // Return partial results instead of throwing
    return results;
  }
}

export const db = {
  initialize: initializeDatabase,
  fetch: fetchTableData
};