import { supabase } from '../../client';
import type { MixResult } from '../types';

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