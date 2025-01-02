import { supabase } from '../../client';
import { MixResult } from './types';
import { MixIngredient } from '../../../../types';

export const updateMix = async (
  mixId: string,
  name: string,
  ingredients: MixIngredient[]
): Promise<MixResult> => {
  try {
    const { data, error } = await supabase.rpc('update_mix', {
      p_mix_id: mixId,
      p_name: name,
      p_ingredients: ingredients.map(ing => ({
        ingredient_id: ing.ingredientId,
        quantity: ing.quantity
      }))
    });

    if (error) throw error;

    return {
      success: true,
      message: 'تم تحديث الخلطة بنجاح'
    };
  } catch (error) {
    console.error('Error updating mix:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الخلطة'
    };
  }
};