import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Ingredient } from '../../types';
import { useIngredients } from '../../hooks/useIngredients';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
}

export const EditIngredientsModal: React.FC<Props> = ({ isOpen, onClose, ingredients }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const { loading, error, updateIngredient, updateIngredientQuantity } = useIngredients();

  React.useEffect(() => {
    if (selectedIngredient) {
      const ingredient = ingredients.find((i) => i.id === selectedIngredient);
      if (ingredient) {
        setName(ingredient.name);
        setQuantity(ingredient.total_quantity.toString());
      }
    } else {
      setName('');
      setQuantity('');
    }
  }, [selectedIngredient, ingredients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    let success = true;
    if (name) {
      success = await updateIngredient(selectedIngredient, name);
    }
    if (success && quantity) {
      success = await updateIngredientQuantity(selectedIngredient, Number(quantity));
    }

    if (success) {
      setSelectedIngredient('');
      setName('');
      setQuantity('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل الأصناف">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <select
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
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

        {selectedIngredient && (
          <>
            <Input
              type="text"
              label="اسم الصنف"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="number"
              label="الكمية الكلية"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="0.1"
              required
            />
          </>
        )}

        <div className="flex justify-end space-x-3 space-x-reverse">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button 
            type="submit"
            disabled={!selectedIngredient || loading}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};