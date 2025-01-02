import { supabase } from '../../client';
import type { MixResult } from './types';
import type { MixIngredient } from '../../../../types';

export const deleteMix = async (id: string): Promise<MixResult> => {
  try {
    const { error } = await supabase
      .from('mixes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'تم حذف الخلطة بنجاح'
    };
  } catch (error) {
    console.error('Error deleting mix:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الخلطة'
    };
  }
};

export const updateMix = async (
  id: string,
  name: string,
  ingredients: MixIngredient[]
): Promise<MixResult> => {
  try {
    const { data, error } = await supabase.rpc('update_mix', {
      p_mix_id: id,
      p_name: name,
      p_ingredients: ingredients.map(ing => ({
        ingredient_id: ing.ingredientId,
        quantity: ing.quantity
      }))
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating mix:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الخلطة'
    };
  }
};