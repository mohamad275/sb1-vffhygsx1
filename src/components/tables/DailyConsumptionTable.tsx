import React, { useState } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { EditConsumptionModal } from '../modals/EditConsumptionModal';
import { Mix, Production, Ingredient } from '../../types';
import { WEIGHT_UNIT } from '../../constants/units';
import { formatNumber } from '../../utils/numbers';
import { calculateDailyConsumption } from '../../utils/calculations/dailyConsumption';
import { useDailyConsumption } from '../../hooks/useDailyConsumption';

interface Props {
  title: string;
  productions: Production[];
  mixes: Mix[];
  ingredients: Ingredient[];
}

export const DailyConsumptionTable: React.FC<Props> = ({
  title,
  productions,
  mixes,
  ingredients
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, updateConsumption, deleteConsumption } = useDailyConsumption();

  const dailyConsumption = calculateDailyConsumption(productions, mixes, ingredients);
  const totalConsumption = dailyConsumption.reduce((acc, item) => acc + item.quantity, 0);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <CollapsibleTable
        title={title}
        total={`${formatNumber(totalConsumption)} ${WEIGHT_UNIT}`}
        headers={['اسم المادة', 'الكمية المستهلكة', 'الخلطة',]}
      >
        {dailyConsumption.map((item, index) => (
          <tr key={`${item.ingredientId}-${item.mixId}-${index}`}>
            <TableCell>{item.ingredientName}</TableCell>
            <TableCell>{`${formatNumber(item.quantity)} ${WEIGHT_UNIT}`}</TableCell>
            <TableCell>{item.mixName}</TableCell>
            <TableCell>
              
            </TableCell>
          </tr>
        ))}
      </CollapsibleTable>

      {selectedItem && (
        <>
          <EditConsumptionModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            consumption={selectedItem}
            mixes={mixes}
            ingredients={ingredients}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedItem(null);
            }}
            onConfirm={async () => {
              const success = await deleteConsumption(selectedItem.id);
              if (success) {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
              }
            }}
            title="حذف استهلاك"
            message="هل أنت متأكد من حذف هذا الاستهلاك؟"
          />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};