import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Ingredient } from '../../types';
import { useMixOperations } from '../../hooks/useMixOperations';
import { useMixIngredients } from '../../hooks/useMixIngredients';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
}

export const AddMixModal: React.FC<Props> = ({ isOpen, onClose, ingredients }) => {
  const [name, setName] = useState('');
  const { loading, error: mixError, addMix } = useMixOperations();
  const {
    mixIngredients,
    error: ingredientError,
    addIngredient,
    removeIngredient,
    updateIngredient,
    getAvailableIngredients,
    validateIngredients,
    resetIngredients
  } = useMixIngredients(ingredients);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      alert('الرجاء إدخال اسم الخلطة');
      return;
    }

    const { valid, error: validationError } = validateIngredients();
    if (!valid) {
      alert(validationError);
      return;
    }

    const success = await addMix(name, mixIngredients);
    if (success) {
      setName('');
      resetIngredients();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        إضافة خلطة جديدة
      </Dialog.Title>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(mixError || ingredientError) && (
          <div className="text-red-600 text-sm">{mixError || ingredientError}</div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            اسم الخلطة
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        
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
          
          {mixIngredients.map((ingredient, index) => {
            const availableIngredients = getAvailableIngredients(index);
            return (
              <div key={index} className="flex space-x-2 space-x-reverse">
                <select
                  value={ingredient.ingredientId}
                  onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">اختر المكون</option>
                  {availableIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={ingredient.quantity || ''}
                  onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
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
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            disabled={loading || mixIngredients.length === 0}
          >
            {loading ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
};