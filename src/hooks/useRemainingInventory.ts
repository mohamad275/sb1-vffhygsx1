import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';
import type { RemainingInventory } from '../types/inventory';

export const useRemainingInventory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setInventory = useStore(state => state.setInventory);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to sync inventory
      await supabase.rpc('manual_sync_inventory');

      // Then fetch updated inventory
      const { data, error: fetchError } = await supabase
        .from('remaining_inventory')
        .select(`
          *,
          mixes (
            id,
            name
          )
        `)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setInventory(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('حدث خطأ أثناء جلب بيانات المخزون');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setInventory]);

  const updateInventoryQuantity = async (id: string, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase.rpc(
        'update_inventory_quantity_safe',
        { p_id: id, p_quantity: quantity }
      );

      if (updateError) throw updateError;
      if (!data?.success) {
        throw new Error(data?.message || 'فشل تحديث المخزون');
      }

      await fetchInventory();
      return true;
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث المخزون');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteInventoryItem = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: deleteError } = await supabase.rpc(
        'delete_inventory_item_safe',
        { p_id: id }
      );

      if (deleteError) throw deleteError;
      if (!data?.success) {
        throw new Error(data?.message || 'فشل حذف المخزون');
      }

      await fetchInventory();
      return true;
    } catch (err) {
      console.error('Error deleting inventory:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف المخزون');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchInventory,
    updateInventoryQuantity,
    deleteInventoryItem
  };
};