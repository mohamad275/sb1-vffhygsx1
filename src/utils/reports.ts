import { Ingredient, Mix, Production, Sale, TableData } from '../types';
import { calculateRemainingBags } from './calculations';
import { WEIGHT_UNIT, BAG_UNIT } from '../constants/units';
import { COLORS } from './pdf/styles';

interface GeneratePDFDataParams {
  ingredients: Ingredient[];
  mixes: Mix[];
  productions: Production[];
  sales: Sale[];
}

export const generatePDFData = ({
  ingredients,
  mixes,
  productions,
  sales,
}: GeneratePDFDataParams): TableData[] => {
  const today = new Date().toDateString();
  
  return [
    {
      title: 'المواد الخام الإجمالية',
      headers: ['اسم الصنف', 'الكمية الإجمالية'],
      rows: ingredients.map(ing => [ing.name, `${ing.totalQuantity} ${WEIGHT_UNIT}`]),
      color: COLORS.PRIMARY
    },
    {
      title: 'المواد الخام المتوفرة',
      headers: ['اسم الصنف', 'الكمية المتوفرة'],
      rows: ingredients.map(ing => [ing.name, `${ing.availableQuantity} ${WEIGHT_UNIT}`]),
      color: COLORS.SECONDARY
    },
    {
      title: 'المخزون المتبقي',
      headers: ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
      rows: calculateRemainingBags(productions, sales, mixes).map(item => {
        const mix = mixes.find(m => m.id === item.mixId);
        return [
          mix?.name || '',
          `${item.bagSize} ${WEIGHT_UNIT}`,
          item.quantity.toString(),
          `${item.bagSize * item.quantity} ${WEIGHT_UNIT}`
        ];
      }),
      color: COLORS.ACCENT
    },
    {
      title: 'إنتاج اليوم',
      headers: ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
      rows: productions
        .filter(p => new Date(p.date).toDateString() === today)
        .map(prod => {
          const mix = mixes.find(m => m.id === prod.mixId);
          return [
            mix?.name || '',
            `${prod.bagSize} ${WEIGHT_UNIT}`,
            prod.quantity.toString(),
            `${prod.bagSize * prod.quantity} ${WEIGHT_UNIT}`
          ];
        }),
      color: COLORS.WARNING
    }
  ];
};