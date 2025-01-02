import { supabase } from '../../client';
import { MixResult } from './types';

export const deleteMix = async (mixId: string): Promise<MixResult> => {
  try {
    const { data, error } = await supabase.rpc('delete_mix_safe', {
      p_mix_id: mixId
    });

    if (error) throw error;
    if (!data.success) {
      return {
        success: false,
        message: data.message || 'لا يمكن حذف الخلطة لوجود إنتاج أو مبيعات مرتبطة بها'
      };
    }

    return {
      success: true,
      message: 'تم حذف الخلطة بنجاح'
    };
  } catch (error) {
    console.error('Error deleting mix:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الخلطة'
    };
  }
};