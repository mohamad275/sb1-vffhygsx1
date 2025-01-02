import { Mix, Production, Sale } from '../../../types';
import { TableData } from '../types';
import { COLORS } from '../constants';
import { WEIGHT_UNIT, BAG_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';
import { calculateRemainingBags } from '../../calculations';

export const generateInventoryTables = (
  productions: Production[] = [],
  sales: Sale[] = [],
  mixes: Mix[] = []
): TableData[] => {
  const remainingBags = calculateRemainingBags(productions, sales, mixes);
  
  // Handle empty data
  if (!remainingBags.length) {
    return [{
      title: 'المخزون المتبقي',
      headers: ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
      rows: [],
      total: '0 كيس',
      color: COLORS.BROWN
    }];
  }

  const totalBags = remainingBags.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = remainingBags.reduce((sum, item) => sum + (item.bagSize * item.quantity), 0);

  return [{
    title: 'المخزون المتبقي',
    headers: ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
    rows: remainingBags.map(item => {
      const mix = mixes.find(m => m.id === item.mixId);
      return [
        mix?.name || '-',
        `${formatNumber(item.bagSize)} ${WEIGHT_UNIT}`,
        formatNumber(item.quantity),
        `${formatNumber(item.bagSize * item.quantity)} ${WEIGHT_UNIT}`
      ];
    }),
    total: `${formatNumber(totalBags)} ${BAG_UNIT} - ${formatNumber(totalWeight)} ${WEIGHT_UNIT}`,
    color: COLORS.BROWN
  }];
};