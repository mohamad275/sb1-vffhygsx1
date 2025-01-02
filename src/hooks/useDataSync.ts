import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase/client';

export const useDataSync = () => {
  const store = useStore();
  const lastSyncRef = useRef<Record<string, number>>({});

  // مزامنة جدول محدد فقط
  const syncTable = useCallback(async (tableName: string) => {
    const now = Date.now();
    if (now - (lastSyncRef.current[tableName] || 0) < 1000) {
      return; // تجنب المزامنة المتكررة للجدول نفسه
    }
    lastSyncRef.current[tableName] = now;

    try {
      // تحديد الحقول المطلوبة فقط لتحسين الأداء
      let query = supabase.from(tableName).select('*');

      if (tableName === 'mixes') {
        query = supabase.from('mixes').select(`
          *,
          mix_ingredients (
            id,
            ingredient_id,
            quantity,
            ingredients (id, name)
          )
        `);
      }

      const { data } = await query.order('created_at', { ascending: false });
      
      // تحديث البيانات في الذاكرة
      switch (tableName) {
        case 'ingredients': store.setIngredients(data || []); break;
        case 'mixes': store.setMixes(data || []); break;
        case 'productions': store.setProductions(data || []); break;
        case 'sales': store.setSales(data || []); break;
        case 'daily_purchases': store.setPurchases(data || []); break;
        case 'notes': store.setNotes(data || []); break;
      }
    } catch (error) {
      console.error(`Error syncing ${tableName}:`, error);
    }
  }, [store]);

  // المزامنة الكاملة لجميع الجداول عند بدء التشغيل
  const syncAllData = useCallback(async () => {
    const tables = ['ingredients', 'mixes', 'productions', 'sales', 'daily_purchases', 'notes'];
    for (const table of tables) {
      await syncTable(table);
    }
  }, [syncTable]);

  useEffect(() => {
    // المزامنة الأولية عند بدء التشغيل
    syncAllData();

    // إعداد اشتراكات الوقت الفعلي
    const channels = [
      supabase.channel('db-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ingredients' },
          () => syncTable('ingredients'))
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'mixes' },
          () => syncTable('mixes'))
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'productions' },
          () => syncTable('productions'))
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'sales' },
          () => syncTable('sales'))
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'daily_purchases' },
          () => syncTable('daily_purchases'))
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'notes' },
          () => syncTable('notes'))
        .subscribe()
    ];

    return () => {
      // إلغاء الاشتراكات عند إزالة المكون
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [syncAllData, syncTable]);

  return { syncAllData, syncTable };
};
