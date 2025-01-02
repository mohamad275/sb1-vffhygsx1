import { Mix, Production, Sale, Purchase, Ingredient } from '../../../types';
import { TableData } from '../types';
import { COLORS } from '../constants';
import { WEIGHT_UNIT, BAG_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';
import { calculateDailyConsumption } from '../../calculations';

export const generateDailyOperationsTables = (
  productions: Production[] = [],
  sales: Sale[] = [],
  purchases: Purchase[] = [],
  mixes: Mix[] = [],
  ingredients: Ingredient[] = []
): TableData[] => {
  const today = new Date().toDateString();
  
  const todayProductions = productions.filter(p => new Date(p.date).toDateString() === today);
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const todayPurchases = purchases.filter(p => new Date(p.date).toDateString() === today);
  
  const dailyConsumption = calculateDailyConsumption(productions, mixes, ingredients);
  
  const totalConsumption = dailyConsumption.reduce((sum, item) => sum + item.quantity, 0);
  const totalPurchases = todayPurchases.reduce((sum, p) => sum + p.quantity, 0);
  const totalProductionBags = todayProductions.reduce((sum, p) => sum + p.quantity, 0);
  const totalSalesBags = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  return [
    {
      title: 'مشتريات اليوم',
      headers: ['اسم الصنف', 'الكمية'],
      rows: todayPurchases.map(purchase => {
        const ingredient = ingredients.find(i => i.id === purchase.ingredientId);
        return [
          ingredient?.name || '-',
          `${formatNumber(purchase.quantity)} ${WEIGHT_UNIT}`
        ];
      }),
      total: `${formatNumber(totalPurchases)} ${WEIGHT_UNIT}`,
      color: COLORS.INFO
    },
    {
      title: 'استهلاك المواد الخام اليومي',
      headers: ['اسم المادة', 'الكمية المستهلكة', 'الخلطة'],
      rows: dailyConsumption.map(item => [
        item.ingredientName || '-',
        `${formatNumber(item.quantity)} ${WEIGHT_UNIT}`,
        item.mixName || '-'
      ]),
      total: `${formatNumber(totalConsumption)} ${WEIGHT_UNIT}`,
      color: COLORS.WARNING
    },
    {
      title: 'إنتاج اليوم',
      headers: ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
      rows: todayProductions.map(prod => {
        const mix = mixes.find(m => m.id === prod.mixId);
        const totalWeight = prod.bagSize * prod.quantity;
        return [
          mix?.name || '-',
          `${formatNumber(prod.bagSize)} ${WEIGHT_UNIT}`,
          formatNumber(prod.quantity),
          `${formatNumber(totalWeight)} ${WEIGHT_UNIT}`
        ];
      }),
      total: `${formatNumber(totalProductionBags)} ${BAG_UNIT}`,
      color: COLORS.SUCCESS
    },
    {
      title: 'مبيعات اليوم',
      headers: ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
      rows: todaySales.map(sale => {
        const mix = mixes.find(m => m.id === sale.mixId);
        const totalWeight = sale.bagSize * sale.quantity;
        return [
          mix?.name || '-',
          `${formatNumber(sale.bagSize)} ${WEIGHT_UNIT}`,
          formatNumber(sale.quantity),
          `${formatNumber(totalWeight)} ${WEIGHT_UNIT}`
        ];
      }),
      total: `${formatNumber(totalSalesBags)} ${BAG_UNIT}`,
      color: COLORS.PURPLE
    }
  ];
};