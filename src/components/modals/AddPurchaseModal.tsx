import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Modal } from './Modal';
import { Ingredient } from '../../types';
import { NumberInput } from '../ui/NumberInput';
import { usePurchases } from '../../hooks/usePurchases';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
}

export const AddPurchaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ingredients,
}) => {
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const { loading, error, addPurchase } = usePurchases();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await addPurchase(ingredientId, Number(quantity));
    if (success) {
      setIngredientId('');
      setQuantity('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        إضافة مشتريات جديدة
      </Dialog.Title>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <div>
          <label htmlFor="ingredient" className="block text-sm font-medium text-gray-700">
            الصنف
          </label>
          <select
            id="ingredient"
            value={ingredientId}
            onChange={(e) => setIngredientId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          >
            <option value="">اختر الصنف</option>
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </div>

        <NumberInput
          label="الكمية (كغ)"
          value={quantity}
          onChange={(value) => setQuantity(value.toString())}
          min={0.1}
          step={0.1}
          required
        />

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
            disabled={loading}
          >
            {loading ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
};