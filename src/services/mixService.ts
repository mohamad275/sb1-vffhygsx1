import { supabase } from '../lib/supabase';
import type { MixIngredient } from '../types';

export const addMixToDatabase = async (name: string, ingredients: MixIngredient[]) => {
  try {
    // Insert mix first
    const { data: mix, error: mixError } = await supabase
      .from('mixes')
      .insert({ name })
      .select()
      .single();

    if (mixError) throw mixError;

    // Insert mix ingredients
    const { error: ingredientsError } = await supabase
      .from('mix_ingredients')
      .insert(
        ingredients.map(ing => ({
          mix_id: mix.id,
          ingredient_id: ing.ingredientId,
          quantity: ing.quantity
        }))
      );

    if (ingredientsError) {
      // If ingredients insertion fails, delete the mix
      await supabase.from('mixes').delete().eq('id', mix.id);
      throw ingredientsError;
    }

    return { success: true, data: mix };
  } catch (error) {
    console.error('Error adding mix:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الخلطة'
    };
  }
};

export const fetchMixes = async () => {
  const { data, error } = await supabase
    .from('mixes')
    .select(`
      *,
      mix_ingredients (
        id,
        ingredient_id,
        quantity,
        ingredients (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};