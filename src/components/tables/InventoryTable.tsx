import React from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { Mix, Production, Sale } from '../../types';
import { calculateRemainingBags } from '../../utils/calculations';
import { WEIGHT_UNIT, BAG_UNIT } from '../../constants/units';

interface Props {
  title: string;
  productions: Production[];
  sales: Sale[];
  mixes: Mix[];
}

export const InventoryTable: React.FC<Props> = ({
  title,
  productions = [],
  sales = [],
  mixes = []
}) => {
  const remainingBags = calculateRemainingBags(productions, sales, mixes) || [];
  const totalBags = remainingBags.reduce((acc, item) => acc + (item?.quantity || 0), 0);

  return (
    <CollapsibleTable
      title={title}
      total={`${totalBags} ${BAG_UNIT}`}
      headers={['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي']}
    >
      {remainingBags.map((item) => {
        const mix = mixes.find(m => m.id === item.mixId);
        const quantity = item.quantity || 0;
        const bagSize = item.bagSize || 0;
        
        return (
          <tr key={`${item.mixId}-${bagSize}`}>
            <TableCell>{mix?.name || 'غير معروف'}</TableCell>
            <TableCell>{`${bagSize} ${WEIGHT_UNIT}`}</TableCell>
            <TableCell>{quantity}</TableCell>
            <TableCell>{`${bagSize * quantity} ${WEIGHT_UNIT}`}</TableCell>
          </tr>
        );
      })}
    </CollapsibleTable>
  );
};