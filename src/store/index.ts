import { create } from 'zustand';
import type { StoreState } from './types';

export const useStore = create<StoreState>((set) => ({
  ingredients: [],
  mixes: [],
  productions: [],
  dailyProductions: [],
  sales: [],
  dailySales: [],
  inventory: [],
  
  purchases: [],
  notes: [],

  // Set state actions
  setIngredients: (ingredients) => set({ ingredients }),
  setMixes: (mixes) => set({ mixes }),
  setProductions: (productions) => set({ productions }),
  setDailyProductions: (productions) => set({ dailyProductions: productions }),
  setSales: (sales) => set({ sales }),
  setDailySales: (sales) => set({ dailySales: sales }),
  setInventory: (inventory) => set({ inventory }),
 
  setPurchases: (purchases) => set({ purchases }),
  setNotes: (notes) => set({ notes }),

  // Real-time handlers
  handleIngredientChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { ingredients: [newRecord, ...state.ingredients] };
        case 'UPDATE':
          return {
            ingredients: state.ingredients.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            ingredients: state.ingredients.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  },
  handleMixChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { mixes: [newRecord, ...state.mixes] };
        case 'UPDATE':
          return {
            mixes: state.mixes.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            mixes: state.mixes.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  },

  handleProductionChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { productions: [newRecord, ...state.productions] };
        case 'UPDATE':
          return {
            productions: state.productions.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            productions: state.productions.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  },

  handleSaleChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { sales: [newRecord, ...state.sales] };
        case 'UPDATE':
          return {
            sales: state.sales.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            sales: state.sales.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  },

  handlePurchaseChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { purchases: [newRecord, ...state.purchases] };
        case 'UPDATE':
          return {
            purchases: state.purchases.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            purchases: state.purchases.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  },

  handleNoteChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { notes: [newRecord, ...state.notes] };
        case 'UPDATE':
          return {
            notes: state.notes.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            notes: state.notes.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  },
}));