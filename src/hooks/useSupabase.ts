import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useStore } from '../store';

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const store = useStore();

  const initializeData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        { data: ingredients },
        { data: mixes },
        { data: productions },
        { data: sales },
        { data: purchases },
        { data: notes }
      ] = await Promise.all([
        supabase
          .from('ingredients')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('mixes')
          .select(`
            *,
            mix_ingredients (
              id,
              ingredient_id,
              quantity,
              ingredients (
                id,
                name
              )
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('productions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('daily_purchases')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      // Update store with fetched data
      store.setIngredients(ingredients || []);
      store.setMixes(mixes || []);
      store.setProductions(productions || []);
      store.setSales(sales || []);
      store.setPurchases(purchases || []);
      store.setNotes(notes || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSubscriptions = () => {
    const channels = [
      supabase
        .channel('ingredients-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, 
          payload => store.handleIngredientChange(payload)
        )
        .subscribe(),

      supabase
        .channel('mixes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mixes' },
          payload => store.handleMixChange(payload)
        )
        .subscribe(),

      supabase
        .channel('productions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'productions' },
          payload => store.handleProductionChange(payload)
        )
        .subscribe(),

      supabase
        .channel('sales-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' },
          payload => store.handleSaleChange(payload)
        )
        .subscribe(),

      supabase
        .channel('purchases-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_purchases' },
          payload => store.handlePurchaseChange(payload)
        )
        .subscribe(),

      supabase
        .channel('notes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' },
          payload => store.handleNoteChange(payload)
        )
        .subscribe()
    ];

    // Cleanup function for unsubscribing
    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  };

  useEffect(() => {
    initializeData();
    const cleanup = setupSubscriptions();

    return cleanup;
  }, [store]);

  return { loading, initializeData, setupSubscriptions };
};
