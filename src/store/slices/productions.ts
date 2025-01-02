import { StateCreator } from 'zustand';
import { Production } from '../../types';
import { StoreState } from '../types';
import { calculateIngredientUsage } from '../utils/calculations';

export interface ProductionsSlice {
  productions: Production[];
  addProduction: (mixId: string, bagSize: number, quantity: number) => void;
  updateProduction: (id: string, mixId: string, bagSize: number, quantity: number) => void;
  deleteProduction: (id: string) => void;
}

export const createProductionsSlice: StateCreator<
  StoreState,
  [],
  [],
  ProductionsSlice
> = (set, get) => ({
  productions: [],
  
  addProduction: (mixId, bagSize, quantity) =>
    set((state) => {
      const mix = state.mixes.find((m) => m.id === mixId);
      if (!mix) return state;

      // Calculate ingredient usage
      const { updatedIngredients } = calculateIngredientUsage({
        mix,
        bagSize,
        quantity,
        ingredients: state.ingredients
      });

      // Check if there's a production for today
      const today = new Date().toDateString();
      const existingProduction = state.productions.find(
        (p) =>
          p.mixId === mixId &&
          p.bagSize === bagSize &&
          new Date(p.date).toDateString() === today
      );

      const updatedProductions = existingProduction
        ? state.productions.map((p) =>
            p.id === existingProduction.id
              ? { ...p, quantity: p.quantity + quantity }
              : p
          )
        : [
            ...state.productions,
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
        ingredients: updatedIngredients,
        productions: updatedProductions,
      };
    }),

  updateProduction: (id, mixId, bagSize, quantity) =>
    set((state) => ({
      productions: state.productions.map((prod) =>
        prod.id === id
          ? {
              ...prod,
              mixId,
              bagSize,
              quantity,
            }
          : prod
      ),
    })),

  deleteProduction: (id) =>
    set((state) => ({
      productions: state.productions.filter((prod) => prod.id !== id),
    })),
});