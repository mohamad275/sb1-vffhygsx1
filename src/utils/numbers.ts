export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return value.toFixed(1).replace(/\.0$/, ''); // Remove trailing .0
};

export const formatInteger = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return Math.round(value).toString();
};

export const normalizeNumber = (value: string): string => {
  return value.replace(/[^\d.]/g, '');
};