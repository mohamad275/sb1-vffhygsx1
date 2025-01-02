import { fetchTableData } from './base';
import type { Production } from '../../../types';

export async function fetchProductions() {
  return fetchTableData<Production>('daily_productions', {
    orderBy: 'created_at'
  });
}