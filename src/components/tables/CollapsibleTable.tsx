import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/Card';

interface Props {
  title: string;
  total: string;
  headers: string[];
  children: React.ReactNode;
}

export const CollapsibleTable: React.FC<Props> = ({ 
  title = '', // Provide default values
  total = '',
  headers = [],
  children 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-5 flex items-center justify-between hover:bg-gray-50"
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-900 ml-2">{total}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};