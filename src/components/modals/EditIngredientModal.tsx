// src/components/modals/EditIngredientModal.tsx
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useIngredients } from '../../hooks/useIngredients';
import { Ingredient } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient;
}

export const EditIngredientModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ingredient
}) => {
  const [name, setName] = useState(ingredient.name);
  const [quantity, setQuantity] = useState(ingredient.total_quantity.toString());
  const { loading, error, updateIngredient, updateIngredientQuantity } = useIngredients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = true;
    if (name !== ingredient.name) {
      success = await updateIngredient(ingredient.id, name);
    }
    
    if (success && quantity !== ingredient.total_quantity.toString()) {
      success = await updateIngredientQuantity(ingredient.id, Number(quantity));
    }

    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل صنف">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <Input
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
            disabled={loading}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
