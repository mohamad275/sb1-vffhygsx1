import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mix, Ingredient } from '../../types';
import { useMixes } from '../../hooks/useMixes';
import { useMixIngredients } from '../../hooks/useMixIngredients';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  mixes: Mix[];
  initialMixId?: string;
}

export const EditMixesModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  ingredients, 
  mixes,
  initialMixId 
}) => {
  // Local state management
  const [formState, setFormState] = useState({
    selectedMix: initialMixId || '',
    name: '',
    isDeleting: false
  });

  const { loading, error: mixError, updateMix, deleteMix } = useMixes();
  
  const {
    mixIngredients,
    error: ingredientError,
    addIngredient,
    removeIngredient,
    updateIngredient,
    getAvailableIngredients,
    validateIngredients,
    resetIngredients,
    setMixIngredients
  } = useMixIngredients(ingredients);

  // Handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleMixSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const mixId = e.target.value;
    setFormState(prev => ({ ...prev, selectedMix: mixId }));
    
    if (mixId) {
      const mix = mixes.find(m => m.id === mixId);
      if (mix) {
        setFormState(prev => ({ ...prev, name: mix.name }));
        const ingredients = mix.mix_ingredients?.map(ing => ({
          ingredientId: ing.ingredient_id,
          quantity: ing.quantity || 0
        })) || [];
        setMixIngredients(ingredients);
      }
    }
  }, [mixes, setMixIngredients]);

  const handleIngredientChange = useCallback((index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    updateIngredient(index, field, value);
  }, [updateIngredient]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormState({
        selectedMix: '',
        name: '',
        isDeleting: false
      });
      resetIngredients();
    }
  }, [isOpen, resetIngredients]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.selectedMix || !formState.name) {
      alert('الرجاء اختيار خلطة وإدخال اسمها');
      return;
    }

    const { valid, error: validationError } = validateIngredients();
    if (!valid) {
      alert(validationError);
      return;
    }

    const success = await updateMix(formState.selectedMix, formState.name, mixIngredients);
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!formState.selectedMix || formState.isDeleting) return;

    try {
      setFormState(prev => ({ ...prev, isDeleting: true }));
      const success = await deleteMix(formState.selectedMix);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting mix:', error);
    } finally {
      setFormState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Memoize ingredients list
  const availableIngredientsList = React.useMemo(() => {
    return ingredients.map(ing => ({
      id: ing.id,
      name: ing.name
    }));
  }, [ingredients]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل الخلطات">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(mixError || ingredientError) && (
          <div className="text-red-600 text-sm">{mixError || ingredientError}</div>
        )}

        <select
          value={formState.selectedMix}
          onChange={handleMixSelect}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        >
          <option value="">اختر الخلطة</option>
          {mixes.map((mix) => (
            <option key={mix.id} value={mix.id}>
              {mix.name}
            </option>
          ))}
        </select>

        {formState.selectedMix && (
          <>
            <Input
              type="text"
              label="اسم الخلطة"
              value={formState.name}
              onChange={handleNameChange}
              required
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">المكونات</h4>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center text-sm text-green-600 hover:text-green-700"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة مكون
                </button>
              </div>

              {mixIngredients.map((ingredient, index) => (
                <div key={index} className="flex space-x-2 space-x-reverse">
                  <select
                    value={ingredient.ingredientId}
                    onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  >
                    <option value="">اختر المكون</option>
                    {availableIngredientsList.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={ingredient.quantity || ''}
                    onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))}
                    placeholder="الكمية (كغ)"
                    min="0.1"
                    step="0.1"
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 space-x-reverse">
          {formState.selectedMix && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading || formState.isDeleting}
            >
              {formState.isDeleting ? 'جاري الحذف...' : 'حذف الخلطة'}
            </Button>
          )}
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={loading || formState.isDeleting}
          >
            إلغاء
          </Button>
          <Button 
            type="submit" 
            disabled={!formState.selectedMix || !formState.name || mixIngredients.length === 0 || loading || formState.isDeleting}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};