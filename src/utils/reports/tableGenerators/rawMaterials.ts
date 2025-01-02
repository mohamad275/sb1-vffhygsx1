import { Ingredient } from '../../../types';
import { TableData } from '../types';
import { COLORS } from '../constants';
import { WEIGHT_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';

export const generateRawMaterialsTables = (ingredients: Ingredient[] = []): TableData[] => {
  // إنشاء جدول المواد الأولية
  const rawMaterialsTable = {
    title: 'المواد الأولية',
    headers: ['اسم الصنف', 'الكمية الإجمالية', 'الاستهلاك المتوقع', 'المشتريات اليوم'],
    rows: ingredients.map(ing => [
      ing.name,
      `${formatNumber(ing.totalQuantity)} ${WEIGHT_UNIT}`,
      `${formatNumber(ing.totalQuantity - ing.availableQuantity)} ${WEIGHT_UNIT}`,
      '0' // سيتم تحديثها من المشتريات اليومية
    ]),
    total: `${formatNumber(ingredients.reduce((sum, ing) => sum + ing.totalQuantity, 0))} ${WEIGHT_UNIT}`,
    color: COLORS.PRIMARY
  };

  return [rawMaterialsTable];
};