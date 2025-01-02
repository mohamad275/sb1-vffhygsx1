import { supabase } from '../../client';
import { DatabaseError } from '../../../../utils/errors';
import type { MixIngredient } from '../../../../types';

export async function validateProductionIngredients(
  mixId: string,
  bagSize: number,
  quantity: number
): Promise<MixIngredient[]> {
  const { data: mixIngredients, error: mixError } = await supabase
    .from('mix_ingredients')
    .select(`
      ingredient_id,
      quantity,
      ingredients (
        id,
        name,
        available_quantity
      )
    `)
    .eq('mix_id', mixId);

  if (mixError) {
    throw new DatabaseError('فشل في الحصول على مكونات الخلطة', 'mix_ingredients');
  }

  if (!mixIngredients?.length) {
    throw new DatabaseError('الخلطة لا تحتوي على مكونات', 'mix_ingredients');
  }

  // Validate each ingredient quantity
  for (const ingredient of mixIngredients) {
    const required = (ingredient.quantity * bagSize * quantity) / 100;
    const available = ingredient.ingredients?.available_quantity || 0;
    
    if (available < required) {
      throw new DatabaseError(
        `لا توجد كمية كافية من ${ingredient.ingredients?.name}`,
        'ingredients'
      );
    }
  }

  return mixIngredients;
}