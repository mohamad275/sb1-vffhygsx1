import React from 'react';
import { normalizeNumber } from '../../utils/numbers';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  value: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  className = '',
  min,
  max,
  step = 1,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedValue = normalizeNumber(e.target.value);
    
    // Allow empty input
    if (normalizedValue === '') {
      onChange(0);
      return;
    }
    
    const numValue = parseFloat(normalizedValue);
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) return;
      if (max !== undefined && numValue > max) return;
      onChange(numValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${className}`}
        dir="ltr"
        {...props}
      />
    </div>
  );
};