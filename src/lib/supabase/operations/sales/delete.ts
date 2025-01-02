import { supabase } from '../../client';

export async function deleteSale(id: string) {
  try {
    const { data, error } = await supabase
      .rpc('delete_sale_safe', { p_id: id });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error deleting sale:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المبيعات'
    };
  }
}