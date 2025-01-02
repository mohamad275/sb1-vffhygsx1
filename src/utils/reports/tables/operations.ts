import { Mix, Production, Sale } from '../../../types';
import { WEIGHT_UNIT, BAG_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';

export const generateOperationsTables = (
  productions: Production[],
  sales: Sale[],
  mixes: Mix[],
  date: string
) => {
  const todayProductions = productions.filter(
    p => new Date(p.date).toDateString() === date
  );
  const todaySales = sales.filter(
    s => new Date(s.date).toDateString() === date
  );

  return {
    columns: [
      {
        width: '*',
        table: {
          headerRows: 1,
          body: [
            ['الوزن الكلي', 'عدد الأكياس', 'وزن الكيس', 'اسم الخلطة'],
            ...todayProductions.map(prod => {
              const mix = mixes.find(m => m.id === prod.mixId);
              return [
                `${formatNumber(prod.bagSize * prod.quantity)} ${WEIGHT_UNIT}`,
                `${prod.quantity} ${BAG_UNIT}`,
                `${prod.bagSize} ${WEIGHT_UNIT}`,
                mix?.name || '',
              ];
            }),
          ],
        },
        layout: 'lightHorizontalLines',
      },
      {
        width: '*',
        table: {
          headerRows: 1,
          body: [
            ['الوزن الكلي', 'عدد الأكياس', 'وزن الكيس', 'اسم الخلطة'],
            ...todaySales.map(sale => {
              const mix = mixes.find(m => m.id === sale.mixId);
              return [
                `${formatNumber(sale.bagSize * sale.quantity)} ${WEIGHT_UNIT}`,
                `${sale.quantity} ${BAG_UNIT}`,
                `${sale.bagSize} ${WEIGHT_UNIT}`,
                mix?.name || '',
              ];
            }),
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ],
  };
};