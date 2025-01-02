// src/types/index.ts

export interface Ingredient {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  created_at: string;
  updated_at: string;
  unit?: string;
  price?: number;
}

export interface MixIngredient {
  id: string;
  ingredient_id: string;
  mix_id: string;
  quantity: number;
  ingredients?: {
    id: string;
    name: string;
  };
}

export interface Mix {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  mix_ingredients?: MixIngredient[];
}

export interface Production {
  id: string;
  mix_id: string;
  quantity: number;
  created_at: string;
  mix?: Mix;
}

export interface Sale {
  id: string;
  mix_id: string;
  quantity: number;
  created_at: string;
  mix?: Mix;
}

export interface Purchase {
  id: string;
  ingredient_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
}

export interface ReportData {
  ingredients: Ingredient[];
  mixes: Mix[];
  productions: Production[];
  sales: Sale[];
  purchases: Purchase[];
  notes: Note[];
}

export interface TableData {
  head: string[][];
  body: (string | number)[][];
  styles?: {
    head?: Record<string, any>;
    body?: Record<string, any>;
  };
}

export interface PDFOptions {
  pageSize?: string;
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
