import { Production, Mix, Ingredient } from '../../types';
import { isSameDay } from 'date-fns';

export interface DailyConsumptionItem {
  ingredientId: string;
  ingredientName: string;
  mixId: string;
  mixName: string;
  quantity: number;
}

export const calculateDailyConsumption = (
  productions: Production[],
  mixes: Mix[],
  ingredients: Ingredient[]
): DailyConsumptionItem[] => {
  try {
    if (!productions?.length || !mixes?.length || !ingredients?.length) {
      return [];
    }

    const today = new Date();
    const todayProductions = productions.filter(p => 
      isSameDay(new Date(p.created_at), today)
    );

    const consumption: DailyConsumptionItem[] = [];

    todayProductions.forEach(production => {
      const mix = mixes.find(m => m.id === production.mix_id);
      if (!mix?.mix_ingredients?.length) return;

      // Calculate total mix weight
      const totalMixWeight = mix.mix_ingredients.reduce(
        (sum, ing) => sum + (ing.quantity || 0), 
        0
      );

      // Calculate consumption for each ingredient
      mix.mix_ingredients.forEach(mixIngredient => {
        if (!mixIngredient.quantity || !mixIngredient.ingredient_id) return;

        const ingredient = ingredients.find(i => i.id === mixIngredient.ingredient_id);
        if (!ingredient) return;

        // Calculate ingredient consumption based on production
        const consumptionQuantity = (mixIngredient.quantity / totalMixWeight) * 
          ((production.bag_size || 0) * (production.quantity || 0));
        
        // Find existing consumption entry or create new one
        const existingItem = consumption.find(
          item => item.ingredientId === mixIngredient.ingredient_id
        );

        if (existingItem) {
          existingItem.quantity += consumptionQuantity;
        } else {
          consumption.push({
            ingredientId: mixIngredient.ingredient_id,
            ingredientName: ingredient.name,
            mixId: mix.id,
            mixName: mix.name,
            quantity: consumptionQuantity
          });
        }
      });
    });

    return consumption.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
  } catch (error) {
    console.error('Error calculating daily consumption:', error);
    return [];
  }
};