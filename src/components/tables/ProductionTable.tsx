import React, { useState, useMemo } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { EditProductionModal } from '../modals/EditProductionModal';
import { Mix, Production } from '../../types';
import { WEIGHT_UNIT, BAG_UNIT } from '../../constants/units';
import { formatNumber } from '../../utils/numbers';
import { useProductions } from '../../hooks/useProductions';
import { isSameDay } from 'date-fns';

interface Props {
  title: string;
  productions: Production[];
  mixes: Mix[];
  totalLabel: string;
}

export const ProductionTable: React.FC<Props> = ({
  title,
  productions,
  mixes,
  totalLabel
}) => {
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, deleteProduction } = useProductions();

  // Group productions by mix and bag size
  const groupedProductions = useMemo(() => {
    const groups = new Map<string, Production>();
    
    productions.forEach(prod => {
      if (!prod.mix_id || !prod.bag_size) return;
      
      const key = `${prod.mix_id}-${prod.bag_size}`;
      const existing = groups.get(key);
      
      if (existing) {
        existing.quantity = (existing.quantity || 0) + (prod.quantity || 0);
      } else {
        groups.set(key, { ...prod });
      }
    });
    
    return Array.from(groups.values());
  }, [productions]);

  const totalBags = useMemo(() => 
    groupedProductions.reduce((acc, prod) => acc + (prod.quantity || 0), 0),
    [groupedProductions]
  );

  const handleEdit = (production: Production) => {
    setSelectedProduction(production);
    setIsEditModalOpen(true);
  };

  const handleDelete = (production: Production) => {
    setSelectedProduction(production);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduction) return;
    
    const success = await deleteProduction(selectedProduction.id);
    if (success) {
      setSelectedProduction(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <CollapsibleTable
        title={title}
        total={`${formatNumber(totalBags)} ${BAG_UNIT}`}
        headers={['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي', 'الإجراءات']}
      >
        {groupedProductions.map((prod) => {
          const mix = mixes.find(m => m.id === prod.mix_id);
          const totalWeight = (prod.bag_size || 0) * (prod.quantity || 0);
          
          return (
            <tr key={`${prod.mix_id}-${prod.bag_size}`}>
              <TableCell>{mix?.name || 'غير معروف'}</TableCell>
              <TableCell>{`${formatNumber(prod.bag_size)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>{formatNumber(prod.quantity)}</TableCell>
              <TableCell>{`${formatNumber(totalWeight)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>
                <TableActions
                  onEdit={() => handleEdit(prod)}
                  onDelete={() => handleDelete(prod)}
                  disabled={loading}
                />
              </TableCell>
            </tr>
          );
        })}
      </CollapsibleTable>

      {selectedProduction && (
        <>
          <EditProductionModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProduction(null);
            }}
            production={selectedProduction}
            mixes={mixes}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduction(null);
            }}
            onConfirm={handleConfirmDelete}
            title="حذف إنتاج"
            message="هل أنت متأكد من حذف هذا الإنتاج؟"
          />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};