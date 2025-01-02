import { supabase } from '../../client';
import { DatabaseError } from '../../../utils/errors';

export async function updateProduction(
  id: string,
  mixId: string,
  bagSize: number,
  quantity: number
) {
  try {
    const { data, error } = await supabase.rpc('update_production_safe', {
      p_id: id,
      p_mix_id: mixId,
      p_bag_size: bagSize,
      p_quantity: quantity
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الإنتاج'
    };
  }
}