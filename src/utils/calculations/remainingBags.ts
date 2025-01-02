import { Production, Sale, Mix } from '../../types';
import { isSameDay } from 'date-fns';

export interface RemainingBagsItem {
  mixId: string;
  bagSize: number;
  quantity: number;
}

export const calculateRemainingBags = (
  productions: Production[] = [],
  sales: Sale[] = [],
  mixes: Mix[] = []
): RemainingBagsItem[] => {
  try {
    // Create a map to track inventory by mix and bag size
    const inventory = new Map<string, RemainingBagsItem>();

    // Group productions by mix and bag size
    productions.forEach(prod => {
      if (!prod.mix_id || !prod.bag_size || !prod.quantity) return;
      
      const key = `${prod.mix_id}-${prod.bag_size}`;
      const existing = inventory.get(key);
      
      if (existing) {
        existing.quantity += prod.quantity;
      } else {
        inventory.set(key, {
          mixId: prod.mix_id,
          bagSize: prod.bag_size,
          quantity: prod.quantity
        });
      }
    });

    // Subtract sales by mix and bag size
    sales.forEach(sale => {
      if (!sale.mix_id || !sale.bag_size || !sale.quantity) return;
      
      const key = `${sale.mix_id}-${sale.bag_size}`;
      const existing = inventory.get(key);
      
      if (existing) {
        existing.quantity = Math.max(0, existing.quantity - sale.quantity);
      }
    });

    // Convert to array and sort by mix name
    return Array.from(inventory.values())
      .filter(item => item.quantity > 0)
      .sort((a, b) => {
        const mixA = mixes.find(m => m.id === a.mixId)?.name || '';
        const mixB = mixes.find(m => m.id === b.mixId)?.name || '';
        return mixA.localeCompare(mixB);
      });
  } catch (error) {
    console.error('Error calculating remaining bags:', error);
    return [];
  }
};