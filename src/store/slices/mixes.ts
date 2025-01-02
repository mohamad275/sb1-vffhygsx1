import { StateCreator } from 'zustand';
import { Mix } from '../../types';
import { StoreState } from '../types';

export interface MixesSlice {
  mixes: Mix[];
  addMix: (name: string, ingredients: { ingredientId: string; quantity: number }[]) => void;
  updateMix: (id: string, name: string, ingredients: { ingredientId: string; quantity: number }[]) => void;
  deleteMix: (id: string) => void;
}

export const createMixesSlice: StateCreator<
  StoreState,
  [],
  [],
  MixesSlice
> = (set) => ({
  mixes: [],
  
  addMix: (name, ingredients) =>
    set((state) => ({
      mixes: [
        ...state.mixes,
        {
          id: crypto.randomUUID(),
          name,
          ingredients,
        },
      ],
    })),

  updateMix: (id, name, ingredients) =>
    set((state) => ({
      mixes: state.mixes.map((mix) =>
        mix.id === id ? { ...mix, name, ingredients } : mix
      ),
    })),

  deleteMix: (id) =>
    set((state) => ({
      mixes: state.mixes.filter((mix) => mix.id !== id),
    })),
});