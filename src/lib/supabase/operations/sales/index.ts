import { supabase } from '../../client';
import type { SaleResult } from './types';

export const addSale = async (
  mixId: string,
  bagSize: number,
  quantity: number
): Promise<SaleResult> => {
  try {
    const { data, error } = await supabase.rpc('add_sale', {
      p_mix_id: mixId,
      p_bag_size: bagSize,
      p_quantity: quantity
    });

    if (error) throw error;
    return {
      success: true,
      message: 'تم إضافة المبيعات بنجاح'
    };
  } catch (error) {
    console.error('Error adding sale:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة المبيعات'
    };
  }
};

export const deleteSale = async (id: string): Promise<SaleResult> => {
  try {
    const { data, error } = await supabase.rpc('delete_sale_safe', { p_id: id });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting sale:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المبيعات'
    };
  }
};