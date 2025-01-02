import { StateCreator } from 'zustand';
import { Note } from '../../types/notes';
import { StoreState } from '../types';

export interface NotesSlice {
  notes: Note[];
  addNote: (content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
}

export const createNotesSlice: StateCreator<
  StoreState,
  [],
  [],
  NotesSlice
> = (set) => ({
  notes: [],
  
  addNote: (content) =>
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          content,
        },
      ],
    })),

  updateNote: (id, content) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, content }
          : note
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),
});