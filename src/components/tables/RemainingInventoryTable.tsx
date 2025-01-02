import React, { useState, useEffect } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { EditQuantityModal } from '../modals/EditQuantityModal';
import { Mix, Production, Sale } from '../../types';
import { WEIGHT_UNIT, BAG_UNIT } from '../../constants/units';
import { formatNumber } from '../../utils/numbers';
import { useRemainingInventory } from '../../hooks/useRemainingInventory';
import { useStore } from '../../store';

interface Props {
  title: string;
  productions: Production[];
  sales: Sale[];
  mixes: Mix[];
}

export const RemainingInventoryTable: React.FC<Props> = ({
  title,
  mixes
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, updateInventoryQuantity, deleteInventoryItem, fetchInventory } = useRemainingInventory();
  const inventory = useStore(state => state.inventory);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateQuantity = async (quantity: number) => {
    if (!selectedItem) return;
    
    const success = await updateInventoryQuantity(selectedItem.id, quantity);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    
    const success = await deleteInventoryItem(selectedItem.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const totalBags = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = inventory.reduce((sum, item) => sum + (item.quantity * item.bag_size), 0);

  return (
    <>
      <CollapsibleTable
        title={title}
        total={`${formatNumber(totalBags)} ${BAG_UNIT} - ${formatNumber(totalWeight)} ${WEIGHT_UNIT}`}
        headers={['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس المتبقية', 'الوزن الكلي', 'الإجراءات']}
      >
        {inventory.map((item) => {
          const mix = mixes.find(m => m.id === item.mix_id);
          const totalWeight = item.bag_size * item.quantity;
          
          return (
            <tr key={item.id}>
              <TableCell>{mix?.name || 'غير معروف'}</TableCell>
              <TableCell>{`${formatNumber(item.bag_size)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>{`${formatNumber(item.quantity)} ${BAG_UNIT}`}</TableCell>
              <TableCell>{`${formatNumber(totalWeight)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>
                <TableActions
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                  disabled={loading}
                />
              </TableCell>
            </tr>
          );
        })}
      </CollapsibleTable>

      {selectedItem && (
        <>
          <EditQuantityModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            title="تعديل المخزون المتبقي"
            currentQuantity={selectedItem.quantity}
            onSave={handleUpdateQuantity}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedItem(null);
            }}
            onConfirm={handleConfirmDelete}
            title="حذف من المخزون"
            message="هل أنت متأكد من حذف هذا المخزون؟"
          />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};