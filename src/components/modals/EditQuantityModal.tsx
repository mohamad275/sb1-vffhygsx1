import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Modal } from './Modal';
import { NumberInput } from '../ui/NumberInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentQuantity: number;
  onSave: (quantity: number) => Promise<void>;
}

export const EditQuantityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  currentQuantity,
  onSave
}) => {
  const [quantity, setQuantity] = useState(currentQuantity.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(Number(quantity));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        {title}
      </Dialog.Title>
      <form onSubmit={handleSubmit} className="space-y-4">
        <NumberInput
          label="الكمية"
          value={quantity}
          onChange={(value) => setQuantity(value.toString())}
          min={0}
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
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};