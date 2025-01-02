import { useState, useCallback } from 'react';
import { MixIngredient } from '../types';
import { Ingredient } from '../store/types';

export interface MixIngredient {
  ingredientId: string;
  quantity: number;
}

export const useMixIngredients = (ingredients: Ingredient[]) => {
  const [mixIngredients, setMixIngredients] = useState<MixIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = useCallback(() => {
    setMixIngredients(prev => [...prev, { ingredientId: '', quantity: 0 }]);
    setError(null);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setMixIngredients(prev => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof MixIngredient, value: string | number) => {
    setMixIngredients(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
    setError(null);
  }, []);

  const getAvailableIngredients = useCallback((currentIndex: number) => {
    const usedIngredientIds = new Set(
      mixIngredients
        .filter((_, index) => index !== currentIndex)
        .map(ing => ing.ingredientId)
    );
    return ingredients.filter(ing => !usedIngredientIds.has(ing.id));
  }, [ingredients, mixIngredients]);

  const validateIngredients = useCallback(() => {
    if (mixIngredients.length === 0) {
      return { valid: false, error: 'الرجاء إضافة مكون واحد على الأقل' };
    }

    const invalidIngredient = mixIngredients.find(ing => !ing.ingredientId || ing.quantity <= 0);
    if (invalidIngredient) {
      return { valid: false, error: 'الرجاء التأكد من إدخال جميع المكونات والكميات بشكل صحيح' };
    }

    return { valid: true, error: null };
  }, [mixIngredients]);

  const resetIngredients = useCallback(() => {
    setMixIngredients([]);
    setError(null);
  }, []);

  return {
    mixIngredients,
    error,
    addIngredient,
    removeIngredient,
    updateIngredient,
    getAvailableIngredients,
    validateIngredients,
    resetIngredients,
    setMixIngredients
  };
};