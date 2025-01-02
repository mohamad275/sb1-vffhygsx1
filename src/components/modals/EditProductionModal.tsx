import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Production, Mix } from '../../types';
import { useProductions } from '../../hooks/useProductions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  production: Production;
  mixes: Mix[];
}

export const EditProductionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  production,
  mixes
}) => {
  const [mixId, setMixId] = useState(production.mix_id || '');
  const [bagSize, setBagSize] = useState(production.bag_size?.toString() || '');
  const [quantity, setQuantity] = useState(production.quantity?.toString() || '');
  const { loading, error, updateProduction } = useProductions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProduction(
      production.id,
      mixId,
      Number(bagSize),
      Number(quantity)
    );

    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل إنتاج">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <Select
          label="الخلطة"
          value={mixId}
          onChange={(e) => setMixId(e.target.value)}
          options={mixes.map(mix => ({
            value: mix.id,
            label: mix.name
          }))}
          required
        />

        <Input
          type="number"
          label="وزن الكيس (كيلو)"
          value={bagSize}
          onChange={(e) => setBagSize(e.target.value)}
          min="1"
          step="0.1"
          required
        />

        <Input
          type="number"
          label="عدد الأكياس"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
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