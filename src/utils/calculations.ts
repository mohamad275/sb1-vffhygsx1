import { Production, Sale, Mix, Ingredient } from '../types';

interface RemainingBagsItem {
  mixId: string;
  bagSize: number;
  quantity: number;
}

interface DailyConsumptionItem {
  ingredientId: string;
  ingredientName: string;
  mixId: string;
  mixName: string;
  quantity: number;
  production: Production;
}

export const calculateRemainingBags = (
  productions: Production[],
  sales: Sale[],
  mixes: Mix[]
): RemainingBagsItem[] => {
  // ... existing code ...
};

export const calculateDailyConsumption = (
  productions: Production[],
  mixes: Mix[],
  ingredients: Ingredient[]
): DailyConsumptionItem[] => {
  const today = new Date().toDateString();
  const todayProductions = productions.filter(
    p => new Date(p.date).toDateString() === today
  );

  const consumption: DailyConsumptionItem[] = [];

  todayProductions.forEach(production => {
    const mix = mixes.find(m => m.id === production.mixId);
    if (!mix) return;

    const totalMixWeight = mix.ingredients.reduce((acc, ing) => acc + ing.quantity, 0);
    const numberOfMixes = (production.bagSize * production.quantity) / totalMixWeight;

    mix.ingredients.forEach(mixIngredient => {
      const ingredient = ingredients.find(i => i.id === mixIngredient.ingredientId);
      if (!ingredient) return;

      const quantity = mixIngredient.quantity * numberOfMixes;
      
      const existingItem = consumption.find(
        item => item.ingredientId === mixIngredient.ingredientId && item.mixId === mix.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        consumption.push({
          ingredientId: mixIngredient.ingredientId,
          ingredientName: ingredient.name,
          mixId: mix.id,
          mixName: mix.name,
          quantity,
          production
        });
      }
    });
  });

  return consumption.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
};