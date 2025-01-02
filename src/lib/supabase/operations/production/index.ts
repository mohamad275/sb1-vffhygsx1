import { supabase } from '../../client';
import { DatabaseError } from '../../../../utils/errors';
import type { ProductionParams, ProductionResult } from './types';
ز
export const addProduction = async (params: ProductionParams): Promise<ProductionResult> => {
  try {
    const { data, error } = await supabase.rpc('add_production', {
      p_mix_id: params.mixId,
      p_bag_size: params.bagSize,
      p_quantity: params.quantity
    });

    if (error) throw error;

    return {
      success: true,
      message: 'تم إضافة الإنتاج بنجاح'
    };
  } catch (error) {
    console.error('Error adding production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الإنتاج'
    };
  }
};

export const deleteProduction = async (id: string): Promise<ProductionResult> => {
  try {
    const { data, error } = await supabase.rpc('delete_production_safe', { p_id: id });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الإنتاج'
    };
  }
};

export const updateProduction = async (
  id: string,
  mixId: string,
  bagSize: number,
  quantity: number
): Promise<ProductionResult> => {
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
};