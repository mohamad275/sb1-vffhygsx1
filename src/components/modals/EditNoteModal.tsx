import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useStore } from '../../store';
import { Modal } from './Modal';
import { Note } from '../../types/notes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

export const EditNoteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  note,
}) => {
  const [content, setContent] = useState(note.content);
  const { updateNote } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNote(note.id, content);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        تعديل ملاحظة
      </Dialog.Title>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
          >
            حفظ
          </button>
        </div>
      </form>
    </Modal>
  );
};