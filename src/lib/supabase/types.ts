export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ingredients: {
        Row: {
          id: string
          name: string
          total_quantity: number
          available_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          total_quantity?: number
          available_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          total_quantity?: number
          available_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      mixes: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          mix_ingredients?: {
            id: string
            ingredient_id: string
            quantity: number
            ingredients?: {
              id: string
              name: string
            }
          }[]
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      productions: {
        Row: {
          id: string;
          production_date: string;
          total_produced: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          production_date: string;
          total_produced?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          production_date?: string;
          total_produced?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_date: string;
          total_amount: number;
          customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sale_date: string;
          total_amount: number;
          customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sale_date?: string;
          total_amount?: number;
          customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          purchase_date: string;
          total_amount: number;
          supplier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_date: string;
          total_amount: number;
          supplier_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          purchase_date?: string;
          total_amount?: number;
          supplier_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          note_date: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          note_date: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          note_date?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    
  
      
      // Rest of the types remain the same...
    }
  }
}