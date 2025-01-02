import { StateCreator } from 'zustand';
import type { StoreState } from '../types';

interface InventoryItem {
  id: string;
  mix_id: string;
  bag_size: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface InventorySlice {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  handleInventoryChange: (payload: any) => void;
}

export const createInventorySlice: StateCreator<
  StoreState,
  [],
  [],
  InventorySlice
> = (set) => ({
  inventory: [],
  setInventory: (inventory) => set({ inventory }),
  handleInventoryChange: (payload) => {
    set((state) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return { inventory: [newRecord, ...state.inventory] };
        case 'UPDATE':
          return {
            inventory: state.inventory.map((item) =>
              item.id === oldRecord.id ? newRecord : item
            ),
          };
        case 'DELETE':
          return {
            inventory: state.inventory.filter((item) => item.id !== oldRecord.id),
          };
        default:
          return state;
      }
    });
  }
});