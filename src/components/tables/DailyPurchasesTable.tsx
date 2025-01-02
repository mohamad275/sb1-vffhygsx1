import React, { useState, useMemo } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { EditPurchaseModal } from '../modals/EditPurchaseModal';
import { Purchase, Ingredient } from '../../types';
import { usePurchases } from '../../hooks/usePurchases';
import { WEIGHT_UNIT } from '../../constants/units';
import { formatNumber } from '../../utils/numbers';
import { isSameDay } from 'date-fns';

interface Props {
  title: string;
  purchases?: Purchase[];
  ingredients: Ingredient[];
}

export const DailyPurchasesTable: React.FC<Props> = ({
  title,
  purchases = [], // Provide default empty array
  ingredients,
}) => {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, deletePurchase } = usePurchases();

  const todayPurchases = useMemo(() => 
    purchases.filter(p => isSameDay(new Date(p.created_at), new Date())),
    [purchases]
  );

  const totalQuantity = useMemo(() => 
    todayPurchases.reduce((acc, p) => acc + (p.quantity || 0), 0),
    [todayPurchases]
  );

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsEditModalOpen(true);
  };

  const handleDelete = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPurchase) return;
    
    const success = await deletePurchase(selectedPurchase.id);
    if (success) {
      setSelectedPurchase(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <CollapsibleTable
        title={title}
        total={`${formatNumber(totalQuantity)} ${WEIGHT_UNIT}`}
        headers={['اسم الصنف', 'الكمية', 'الإجراءات']}
      >
        {todayPurchases.map((purchase) => {
          const ingredient = ingredients.find(i => i.id === purchase.ingredient_id);
          return (
            <tr key={purchase.id}>
              <TableCell>{ingredient?.name || 'غير معروف'}</TableCell>
              <TableCell>{`${formatNumber(purchase.quantity)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>
                <TableActions
                  onEdit={() => handleEdit(purchase)}
                  onDelete={() => handleDelete(purchase)}
                  disabled={loading}
                />
              </TableCell>
            </tr>
          );
        })}
      </CollapsibleTable>

      {selectedPurchase && (
        <>
          <EditPurchaseModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPurchase(null);
            }}
            purchase={selectedPurchase}
            ingredients={ingredients}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedPurchase(null);
            }}
            onConfirm={handleConfirmDelete}
            title="حذف مشتريات"
            message="هل أنت متأكد من حذف هذه المشتريات؟"
          />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};