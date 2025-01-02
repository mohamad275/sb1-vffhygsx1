import { ReportData } from './types';
import { WEIGHT_UNIT } from '../../constants/units';
import { formatNumber } from '../numbers';

export const generateMaterialsTable = (ingredients: ReportData['ingredients'] = []) => {
  return {
    head: [['اسم الصنف', 'الكمية المتوفرة']],
    body: ingredients.map(ing => [
      ing.name,
      `${formatNumber(ing.availableQuantity)} ${WEIGHT_UNIT}`
    ]),
  };
};

export const generateProductionTable = (
  productions: ReportData['productions'] = [],
  mixes: ReportData['mixes'] = [],
  date: string
) => {
  const todayProductions = productions.filter(
    p => new Date(p.date).toDateString() === date
  );

  return {
    head: [['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي']],
    body: todayProductions.map(prod => {
      const mix = mixes.find(m => m.id === prod.mixId);
      return [
        mix?.name || '-',
        `${formatNumber(prod.bagSize)} ${WEIGHT_UNIT}`,
        formatNumber(prod.quantity),
        `${formatNumber(prod.bagSize * prod.quantity)} ${WEIGHT_UNIT}`
      ];
    }),
  };
};