import { Mix, Production, Sale } from '../../../types';
import { WEIGHT_UNIT, BAG_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';
import { calculateRemainingBags } from '../../calculations';

export const generateInventoryTables = (
  productions: Production[] = [],
  sales: Sale[] = [],
  mixes: Mix[] = []
) => {
  const remainingBags = calculateRemainingBags(productions, sales, mixes);
z
  return {
    title: 'المخزون المتبقي',
    table: {
      headerRows: 1,
      body: [
        ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
        ...remainingBags.map(item => {
          const mix = mixes.find(m => m.id === item.mixId);
          const totalWeight = item.bagSize * item.quantity;
          return [
            mix?.name || '-',
            `${formatNumber(item.bagSize)} ${WEIGHT_UNIT}`,
            `${item.quantity} ${BAG_UNIT}`,
            `${formatNumber(totalWeight)} ${WEIGHT_UNIT}`
          ];
        }),
      ],
    },
    layout: 'lightHorizontalLines',
  };
};