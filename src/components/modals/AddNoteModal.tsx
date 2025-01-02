import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Modal } from './Modal';
import { useDailyNotes } from '../../hooks/useDailyNotes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddNoteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const { addNote, loading, error } = useDailyNotes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addNote(content);
    if (success) {
      setContent('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        إضافة ملاحظة جديدة
      </Dialog.Title>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            الملاحظة
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

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
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
};