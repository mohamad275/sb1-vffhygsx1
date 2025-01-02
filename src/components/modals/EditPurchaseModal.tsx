import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Purchase, Ingredient } from '../../types';
import { usePurchases } from '../../hooks/usePurchases';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase;
  ingredients: Ingredient[];
}

export const EditPurchaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  purchase,
  ingredients
}) => {
  const [ingredientId, setIngredientId] = useState(purchase.ingredient_id || '');
  const [quantity, setQuantity] = useState(purchase.quantity?.toString() || '');
  const { loading, error, updatePurchase } = usePurchases();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updatePurchase(
      purchase.id,
      ingredientId,
      Number(quantity)
    );

    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل مشتريات">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <Select
          label="الصنف"
          value={ingredientId}
          onChange={(e) => setIngredientId(e.target.value)}
          options={ingredients.map(ing => ({
            value: ing.id,
            label: ing.name
          }))}
          required
        />

        <Input
          type="number"
          label="الكمية (كيلو)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0.1"
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