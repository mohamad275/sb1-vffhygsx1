import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Mix, Ingredient, MixIngredient } from '../../../types';

interface Props {
  name: string;
  onNameChange: (name: string) => void;
  mixIngredients: MixIngredient[];
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredient: (index: number, field: keyof MixIngredient, value: string | number) => void;
  availableIngredients: Ingredient[];
  loading: boolean;
}

export const MixForm: React.FC<Props> = ({
  name,
  onNameChange,
  mixIngredients,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  availableIngredients,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          اسم الخلطة
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700">المكونات</h4>
          <button
            type="button"
            onClick={onAddIngredient}
            className="flex items-center text-sm text-green-600 hover:text-green-700"
            disabled={loading}
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة مكون
          </button>
        </div>

        {mixIngredients.map((ingredient, index) => (
          <div key={index} className="flex space-x-2 space-x-reverse">
            <select
              value={ingredient.ingredientId}
              onChange={(e) => onUpdateIngredient(index, 'ingredientId', e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              disabled={loading}
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
              onChange={(e) => onUpdateIngredient(index, 'quantity', Number(e.target.value))}
              placeholder="الكمية (كغ)"
              min="0.1"
              step="0.1"
              className="w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => onRemoveIngredient(index)}
              className="p-2 text-red-600 hover:text-red-700"
              disabled={loading}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};