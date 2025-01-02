import { StateCreator } from 'zustand';
import { Sale } from '../../types';
import { StoreState } from '../types';
import { calculateRemainingBags } from '../../utils/calculations/remainingBags';

export interface SalesSlice {
  sales: Sale[];
  addSale: (mixId: string, bagSize: number, quantity: number) => void;
  updateSale: (id: string, mixId: string, bagSize: number, quantity: number) => void;
  deleteSale: (id: string) => void;
}

export const createSalesSlice: StateCreator<
  StoreState,
  [],
  [],
  SalesSlice
> = (set, get) => ({
  sales: [],
  
  addSale: (mixId, bagSize, quantity) =>
    set((state) => {
      // Check if we have enough inventory
      const remaining = calculateRemainingBags(state.productions, state.sales, state.mixes);
      const availableItem = remaining.find(
        item => item.mixId === mixId && item.bagSize === bagSize
      );

      if (!availableItem || availableItem.quantity < quantity) {
        alert('لا توجد كمية كافية في المخزون');
        return state;
      }

      const today = new Date().toDateString();
      const existingSale = state.sales.find(
        (s) =>
          s.mixId === mixId &&
          s.bagSize === bagSize &&
          new Date(s.date).toDateString() === today
      );

      const updatedSales = existingSale
        ? state.sales.map((s) =>
            s.id === existingSale.id
              ? { ...s, quantity: s.quantity + quantity }
              : s
          )
        : [
            ...state.sales,
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              mixId,
              bagSize,
              quantity,
            },
          ];

      return {
        ...state,
        sales: updatedSales,
      };
    }),

  updateSale: (id, mixId, bagSize, quantity) =>
    set((state) => {
      const oldSale = state.sales.find(s => s.id === id);
      if (!oldSale) return state;

      // Calculate available inventory plus the quantity from the old sale
      const salesWithoutCurrent = state.sales.filter(s => s.id !== id);
      const remaining = calculateRemainingBags(state.productions, salesWithoutCurrent, state.mixes);
      const availableItem = remaining.find(
        item => item.mixId === mixId && item.bagSize === bagSize
      );

      if (!availableItem || availableItem.quantity < quantity) {
        alert('لا توجد كمية كافية في المخزون');
        return state;
      }

      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale.id === id
            ? {
                ...sale,
                mixId,
                bagSize,
                quantity,
              }
            : sale
        ),
      };
    }),

  deleteSale: (id) =>
    set((state) => ({
      sales: state.sales.filter((sale) => sale.id !== id),
    })),
});