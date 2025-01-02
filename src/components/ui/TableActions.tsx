import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export const TableActions: React.FC<Props> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <button
        onClick={onEdit}
        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
        title="تعديل"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
        title="حذف"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};