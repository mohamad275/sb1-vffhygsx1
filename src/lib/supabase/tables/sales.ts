import { fetchTableData } from './base';
import type { Sale } from '../../../types';

export async function fetchSales() {
  return fetchTableData<Sale>('daily_sales', {
    orderBy: 'created_at'
  });
}