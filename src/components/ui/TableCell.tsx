import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
};