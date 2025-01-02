import { StateCreator } from 'zustand';
import { Ingredient } from '../../types';
import { StoreState } from '../types';

export interface IngredientsSlice {
  ingredients: Ingredient[];
  addIngredient: (name: string, quantity: number) => void;
  updateIngredient: (id: string, name: string) => void;
  updateIngredientQuantity: (id: string, quantity: number) => void;
  deleteIngredient: (id: string) => void;
}

export const createIngredientsSlice: StateCreator<
  StoreState,
  [],
  [],
  IngredientsSlice
> = (set) => ({
  ingredients: [],
  
  addIngredient: (name, quantity) =>
    set((state) => ({
      ingredients: [
        ...state.ingredients,
        {
          id: crypto.randomUUID(),
          name,
          totalQuantity: quantity,
          availableQuantity: quantity,
        },
      ],
    })),

  updateIngredient: (id, name) =>
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === id ? { ...ing, name } : ing
      ),
    })),

  updateIngredientQuantity: (id, quantity) =>
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === id
          ? {
              ...ing,
              totalQuantity: ing.totalQuantity + quantity,
              availableQuantity: ing.availableQuantity + quantity,
            }
          : ing
      ),
    })),

  deleteIngredient: (id) =>
    set((state) => ({
      ingredients: state.ingredients.filter((ing) => ing.id !== id),
    })),
});