import { supabase } from '../../client';
import { ProductionResult } from './types';

export const deleteProduction = async (id: string): Promise<ProductionResult> => {
  try {
    const { data, error } = await supabase.rpc('delete_production_safe', {
      p_id: id
    });

    if (error) throw error;
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to delete production');
    }

    return {
      success: true,
      message: 'تم حذف الإنتاج بنجاح'
    };
  } catch (error) {
    console.error('Error deleting production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الإنتاج'
    };
  }
};