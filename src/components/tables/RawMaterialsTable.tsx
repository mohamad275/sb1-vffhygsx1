import React, { useState, useMemo } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { EditIngredientModal } from '../modals/EditIngredientModal';
import { Ingredient } from '../../types';
import { useIngredients } from '../../hooks/useIngredients';
import { WEIGHT_UNIT } from '../../constants/units';
import { formatNumber } from '../../utils/numbers';

interface Props {
  title: string;
  ingredients: Ingredient[];
  showTotal?: boolean;
  showAvailable?: boolean;
}

export const RawMaterialsTable: React.FC<Props> = ({
  title,
  ingredients,
  showTotal,
  showAvailable
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, deleteIngredient } = useIngredients();

  const totalQuantity = useMemo(() => {
    if (!ingredients?.length) return 0;
    return ingredients.reduce((acc, ing) => 
      acc + (showTotal ? ing.total_quantity : ing.available_quantity), 
      0
    );
  }, [ingredients, showTotal]);

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditModalOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIngredient) return;
    
    const success = await deleteIngredient(selectedIngredient.id);
    if (success) {
      setSelectedIngredient(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <CollapsibleTable
        title={title}
        total={`${formatNumber(totalQuantity)} ${WEIGHT_UNIT}`}
        headers={['اسم الصنف', 'الوزن', 'الإجراءات']}
      >
        {ingredients.map((ing) => (
          <tr key={ing.id}>
            <TableCell>{ing.name}</TableCell>
            <TableCell>
              {formatNumber(showTotal ? ing.total_quantity : ing.available_quantity)} {WEIGHT_UNIT}
            </TableCell>
            <TableCell>
              <TableActions
                onEdit={() => handleEdit(ing)}
                onDelete={() => handleDelete(ing)}
                disabled={loading}
              />
            </TableCell>
          </tr>
        ))}
      </CollapsibleTable>

      {selectedIngredient && (
        <>
          <EditIngredientModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedIngredient(null);
            }}
            ingredient={selectedIngredient}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedIngredient(null);
            }}
            onConfirm={handleConfirmDelete}
            title="حذف صنف"
            message={`هل أنت متأكد من حذف ${selectedIngredient.name}؟`}
            isDeleting={loading}
          />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};