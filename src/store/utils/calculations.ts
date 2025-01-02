import { Mix, Ingredient } from '../../types';

interface IngredientUsageParams {
  mix: Mix;
  bagSize: number;
  quantity: number;
  ingredients: Ingredient[];
}

interface IngredientUsageResult {
  updatedIngredients: Ingredient[];
  success: boolean;
  error?: string;
}

export const calculateIngredientUsage = ({
  mix,
  bagSize,
  quantity,
  ingredients
}: IngredientUsageParams): IngredientUsageResult => {
  try {
    const totalMixWeight = mix.ingredients.reduce((acc, ing) => acc + ing.quantity, 0);
    const numberOfMixes = (bagSize * quantity) / totalMixWeight;

    const updatedIngredients = ingredients.map((ing) => {
      const mixIngredient = mix.ingredients.find((i) => i.ingredientId === ing.id);
      if (!mixIngredient) return ing;

      const usedQuantity = mixIngredient.quantity * numberOfMixes;
      const newAvailableQuantity = ing.availableQuantity - usedQuantity;

      // Validate if we have enough ingredients
      if (newAvailableQuantity < 0) {
        throw new Error(`لا يوجد كمية كافية من ${ing.name}`);
      }

      return {
        ...ing,
        availableQuantity: newAvailableQuantity,
      };
    });

    return {
      updatedIngredients,
      success: true
    };

  } catch (error) {
    console.error('Error calculating ingredient usage:', error);
    return {
      updatedIngredients: ingredients,
      success: false,
      error: error instanceof Error ? error.message : 'خطأ في حساب استهلاك المواد'
    };
  }
};