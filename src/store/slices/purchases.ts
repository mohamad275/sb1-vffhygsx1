import { StateCreator } from 'zustand';
import { Purchase } from '../../types';
import { StoreState } from '../types';

export interface PurchasesSlice {
  purchases: Purchase[];
  addPurchase: (ingredientId: string, quantity: number, notes?: string) => void;
  updatePurchase: (id: string, ingredientId: string, quantity: number, notes?: string) => void;
  deletePurchase: (id: string) => void;
}

export const createPurchasesSlice: StateCreator<
  StoreState,
  [],
  [],
  PurchasesSlice
> = (set, get) => ({
  purchases: [],
  
  addPurchase: (ingredientId, quantity, notes) =>
    set((state) => {
      // Update ingredient quantity
      const updatedIngredients = state.ingredients.map(ing =>
        ing.id === ingredientId
          ? {
              ...ing,
              totalQuantity: ing.totalQuantity + quantity,
              availableQuantity: ing.availableQuantity + quantity,
            }
          : ing
      );

      return {
        ingredients: updatedIngredients,
        purchases: [
          ...state.purchases,
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            ingredientId,
            quantity,
            notes,
          },
        ],
      };
    }),

  updatePurchase: (id, ingredientId, quantity, notes) =>
    set((state) => {
      const oldPurchase = state.purchases.find(p => p.id === id);
      if (!oldPurchase) return state;

      // Revert old purchase quantity
      let updatedIngredients = state.ingredients.map(ing =>
        ing.id === oldPurchase.ingredientId
          ? {
              ...ing,
              totalQuantity: ing.totalQuantity - oldPurchase.quantity,
              availableQuantity: ing.availableQuantity - oldPurchase.quantity,
            }
          : ing
      );

      // Add new purchase quantity
      updatedIngredients = updatedIngredients.map(ing =>
        ing.id === ingredientId
          ? {
              ...ing,
              totalQuantity: ing.totalQuantity + quantity,
              availableQuantity: ing.availableQuantity + quantity,
            }
          : ing
      );

      return {
        ingredients: updatedIngredients,
        purchases: state.purchases.map((purchase) =>
          purchase.id === id
            ? {
                ...purchase,
                ingredientId,
                quantity,
                notes,
              }
            : purchase
        ),
      };
    }),

  deletePurchase: (id) =>
    set((state) => {
      const purchase = state.purchases.find(p => p.id === id);
      if (!purchase) return state;

      // Revert the purchase quantity from ingredient
      const updatedIngredients = state.ingredients.map(ing =>
        ing.id === purchase.ingredientId
          ? {
              ...ing,
              totalQuantity: ing.totalQuantity - purchase.quantity,
              availableQuantity: ing.availableQuantity - purchase.quantity,
            }
          : ing
      );

      return {
        ingredients: updatedIngredients,
        purchases: state.purchases.filter((p) => p.id !== id),
      };
    }),
});