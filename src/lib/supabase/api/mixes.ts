import { supabase } from '../client';
import type { Database } from '../types';
import type { MixIngredient } from '../../../hooks/useMixIngredients';

export const updateMixWithIngredients = async (
  mixId: string,
  name: string,
  ingredients: MixIngredient[]
) => {
  try {
    // Start transaction
    const { error: txError } = await supabase.rpc('start_transaction');
    if (txError) throw txError;

    try {
      // Update mix name
      const { error: updateError } = await supabase
        .from('mixes')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', mixId);

      if (updateError) throw updateError;

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('mix_ingredients')
        .delete()
        .eq('mix_id', mixId);

      if (deleteError) throw deleteError;

      // Insert new ingredients
      if (ingredients.length > 0) {
        const { error: insertError } = await supabase
          .from('mix_ingredients')
          .insert(
            ingredients.map(ing => ({
              mix_id: mixId,
              ingredient_id: ing.ingredientId,
              quantity: ing.quantity
            }))
          );

        if (insertError) throw insertError;
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_current_transaction');
      if (commitError) throw commitError;

      return { success: true };
    } catch (error) {
      // Rollback on error
      await supabase.rpc('rollback_current_transaction');
      throw error;
    }
  } catch (error) {
    console.error('Error updating mix:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الخلطة'
    };
  }
};