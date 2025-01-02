import { RawMaterialsTableRow } from '../types';
import { WEIGHT_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';

export const generateRawMaterialsTable = (data: RawMaterialsTableRow[]) => {
  return {
    title: 'المواد الأولية',
    headers: ['اسم الصنف', 'الكمية الإجمالية', 'الاستهلاك المتوقع', 'المشتريات اليوم'],
    rows: data.map(row => [
      row.name,
      `${formatNumber(row.totalQuantity)} ${WEIGHT_UNIT}`,
      `${formatNumber(row.expectedConsumption)} ${WEIGHT_UNIT}`, 
      `${formatNumber(row.dailyPurchases)} ${WEIGHT_UNIT}`
    ]),
    color: [46, 125, 50] // أخضر
  };
};