import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Sale, Mix } from '../../types';
import { useSales } from '../../hooks/useSales';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  mixes: Mix[];
}

export const EditSaleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sale,
  mixes
}) => {
  const [mixId, setMixId] = useState(sale.mix_id || '');
  const [bagSize, setBagSize] = useState(sale.bag_size?.toString() || '');
  const [quantity, setQuantity] = useState(sale.quantity?.toString() || '');
  const { loading, error, updateSale } = useSales();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateSale(
      sale.id,
      mixId,
      Number(bagSize),
      Number(quantity)
    );

    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل مبيعات">
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