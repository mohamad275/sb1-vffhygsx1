import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Modal } from './Modal';
import { Mix } from '../../types';
import { NumberInput } from '../ui/NumberInput';
import { useSales } from '../../hooks/useSales';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mixes: Mix[];
}

export const AddSaleModal: React.FC<Props> = ({ isOpen, onClose, mixes }) => {
  const [mixId, setMixId] = useState('');
  const [bagSizeType, setBagSizeType] = useState('30');
  const [customBagSize, setCustomBagSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const { loading, error, addSale } = useSales();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBagSize = bagSizeType === 'custom' ? Number(customBagSize) : Number(bagSizeType);
    const success = await addSale(mixId, finalBagSize, Number(quantity));
    
    if (success) {
      setMixId('');
      setBagSizeType('30');
      setCustomBagSize('');
      setQuantity('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        إضافة مبيعات جديدة
      </Dialog.Title>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <div>
          <label htmlFor="mix" className="block text-sm font-medium text-gray-700">
            الخلطة
          </label>
          <select
            id="mix"
            value={mixId}
            onChange={(e) => setMixId(e.target.value)}
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
        </div>

        <div>
          <label htmlFor="bagSize" className="block text-sm font-medium text-gray-700">
            وزن الكيس (كغ)
          </label>
          <select
            id="bagSize"
            value={bagSizeType}
            onChange={(e) => setBagSizeType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          >
            <option value="30">٣٠ كغ</option>
            <option value="50">٥٠ كغ</option>
            <option value="custom">وزن مخصص</option>
          </select>
        </div>

        {bagSizeType === 'custom' && (
          <NumberInput
            label="الوزن المخصص (كغ)"
            value={customBagSize}
            onChange={(value) => setCustomBagSize(value.toString())}
            min={1}
            step={0.1}
            required
          />
        )}

        <NumberInput
          label="عدد الأكياس"
          value={quantity}
          onChange={(value) => setQuantity(value.toString())}
          min={1}
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