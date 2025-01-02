import type { Database } from '../lib/supabase/types';

type Tables = Database['public']['Tables'];

export type Ingredient = Tables['ingredients']['Row'];
export type Mix = Tables['mixes']['Row'];
export type Production = Tables['productions']['Row'];

export type Production = Tables['dailyProductions']['Row'];
export type  InventoryItem= Tables['inventory']['Row'];
export type Sale = Tables['dailySales']['Row'];
export type Sale = Tables['sales']['Row'];
export type Purchase = Tables['purchases']['Row'];
export type Note = Tables['notes']['Row'];

export interface StoreState {
  ingredients: Ingredient[];
  mixes: Mix[];
  dailyProductions: Production[];
  productions: Production[];
  inventory: InventoryItem[];
  dailySales: Sale[];
  sales: Sale[];
  purchases: Purchase[];
  notes: Note[];
  
  setIngredients: (ingredients: Ingredient[]) => void;
  setMixes: (mixes: Mix[]) => void;
  setDailyProductions: (productions: Production[]) => void;
  setProductions: (productions: Production[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setDailySales: (sales: Sale[]) => void;
  setSales: (sales: Sale[]) => void;
  setPurchases: (purchases: Purchase[]) => void;
  setNotes: (notes: Note[]) => void;

  handleIngredientChange: (payload: any) => void;
  handleMixChange: (payload: any) => void;
  handleDailyProductionChange: (payload: any) => void;
  handleDailySaleChange: (payload: any) => void;
  handleProductionChange: (payload: any) => void;
  handleInventoryChange: (payload: any) => void;
  handleSaleChange: (payload: any) => void;
  handlePurchaseChange: (payload: any) => void;
  handleNoteChange: (payload: any) => void;
}