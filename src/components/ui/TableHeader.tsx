import React from 'react';
import { Download } from 'lucide-react';

interface Props {
  title: string;
  onExport: () => void;
}

export const TableHeader: React.FC<Props> = ({ title, onExport }) => {
  return (
    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <button
        onClick={onExport}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <Download className="h-4 w-4 ml-2" />
        تصدير PDF
      </button>
    </div>
  );
};