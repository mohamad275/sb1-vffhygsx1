import { supabase } from '../../client';

export async function deleteProduction(id: string) {
  try {
    const { data, error } = await supabase
      .rpc('delete_production_safe', { p_id: id });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error deleting production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الإنتاج'
    };
  }
}