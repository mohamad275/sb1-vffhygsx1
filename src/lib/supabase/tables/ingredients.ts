import { fetchTableData } from './base';
import type { Ingredient } from '../../../types';

export async function fetchIngredients() {
  return fetchTableData<Ingredient>('ingredients', {
    orderBy: 'created_at'
  });
}