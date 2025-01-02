import { fetchTableData } from './base';
import type { Mix } from '../../../types';

export async function fetchMixes() {
  return fetchTableData<Mix>('mixes', {
    select: '*, mix_ingredients(ingredient_id, quantity)',
    orderBy: 'created_at'
  });
}