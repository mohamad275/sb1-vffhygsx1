import { supabase } from '../../client';
import { ProductionResult } from './types';

export const addProduction = async (
  mixId: string,
  bagSize: number,
  quantity: number
): Promise<ProductionResult> => {
  try {
    // Call the RPC function to add production
    const { data, error } = await supabase.rpc('add_production', {
      p_mix_id: mixId,
      p_bag_size: bagSize,
      p_quantity: quantity
    });

    if (error) throw error;
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to add production');
    }

    return {
      success: true,
      message: 'تمت إضافة الإنتاج بنجاح'
    };
  } catch (error) {
    console.error('Error adding production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الإنتاج'
    };
  }
};