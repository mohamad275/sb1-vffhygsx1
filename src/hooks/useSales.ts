import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';
import { calculateRemainingBags } from '../utils/calculations/remainingBags';
import { useDailySales } from './useDailySales';

export const useSales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSales = useStore(state => state.setSales);
  const { productions, sales, mixes } = useStore();
  const { addDailySale } = useDailySales();

  const fetchSales = async () => {
    const { data, error: fetchError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    return data;
  };

  const addSale = async (mixId: string, bagSize: number, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!mixId || !bagSize || !quantity) {
        setError('جميع الحقول مطلوبة');
        return false;
      }

      // Check inventory
      const remainingBags = calculateRemainingBags(productions, sales, mixes);
      const availableItem = remainingBags.find(
        item => item.mixId === mixId && item.bagSize === bagSize
      );

      if (!availableItem || availableItem.quantity < quantity) {
        setError('لا توجد كمية كافية في المخزون');
        return false;
      }

      // Add to main sales and daily sales in parallel
      const [{ error: saleError }, { error: dailySaleError }] = await Promise.all([
        supabase
          .from('sales')
          .insert({
            mix_id: mixId,
            bag_size: bagSize,
            quantity: quantity
          }),
        supabase
          .from('daily_sales')
          .insert({
            mix_id: mixId,
            bag_size: bagSize,
            quantity: quantity
          })
      ]);

      if (saleError) throw saleError;
      if (dailySaleError) throw dailySaleError;

      // Refresh sales data
      const updatedSales = await fetchSales();
      setSales(updatedSales || []);
      return true;
    } catch (err) {
      console.error('Error adding sale:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة المبيعات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSale = async (id: string, mixId: string, bagSize: number, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!id || !mixId || !bagSize || !quantity) {
        setError('جميع الحقول مطلوبة');
        return false;
      }

      // Get current sale
      const { data: currentSale } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single();

      if (!currentSale) {
        setError('لم يتم العثور على المبيعات');
        return false;
      }

      // Check inventory (excluding current sale)
      const salesWithoutCurrent = sales.filter(s => s.id !== id);
      const remainingBags = calculateRemainingBags(productions, salesWithoutCurrent, mixes);
      const availableItem = remainingBags.find(
        item => item.mixId === mixId && item.bagSize === bagSize
      );

      if (!availableItem || availableItem.quantity < quantity) {
        setError('لا توجد كمية كافية في المخزون');
        return false;
      }

      // Update sale
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          mix_id: mixId,
          bag_size: bagSize,
          quantity: quantity
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Refresh sales data
      const updatedSales = await fetchSales();
      setSales(updatedSales || []);
      return true;
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث المبيعات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh sales data
      const updatedSales = await fetchSales();
      setSales(updatedSales || []);
      return true;
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف المبيعات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addSale,
    updateSale,
    deleteSale
  };
};