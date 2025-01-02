import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useStore } from '../../store';
import { Production, Mix } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  production: Production;
  mixes: Mix[];
}

export const EditConsumptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  production,
  mixes
}) => {
  const [mixId, setMixId] = useState(production.mixId);
  const [bagSize, setBagSize] = useState(production.bagSize.toString());
  const [quantity, setQuantity] = useState(production.quantity.toString());
  const { updateProduction } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduction(
      production.id,
      mixId,
      Number(bagSize),
      Number(quantity)
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل الاستهلاك">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            حفظ
          </Button>
        </div>
      </form>
    </Modal>
  );
};