import React, { useState, useMemo } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { EditSaleModal } from '../modals/EditSaleModal';
import { Sale, Mix } from '../../types';
import { useSales } from '../../hooks/useSales';
import { WEIGHT_UNIT, BAG_UNIT } from '../../constants/units';
import { formatNumber } from '../../utils/numbers';

interface Props {
  title: string;
  sales: Sale[];
  mixes: Mix[];
  totalLabel: string;
}

export const SalesTable: React.FC<Props> = ({
  title,
  sales,
  mixes,
  totalLabel
}) => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, deleteSale } = useSales();

  // Group sales by mix and bag size
  const groupedSales = useMemo(() => {
    const groups = new Map<string, Sale>();
    
    sales.forEach(sale => {
      if (!sale.mix_id || !sale.bag_size) return;
      
      const key = `${sale.mix_id}-${sale.bag_size}`;
      const existing = groups.get(key);
      
      if (existing) {
        existing.quantity = (existing.quantity || 0) + (sale.quantity || 0);
      } else {
        groups.set(key, { ...sale });
      }
    });
    
    return Array.from(groups.values());
  }, [sales]);

  const totalBags = useMemo(() => 
    groupedSales.reduce((acc, sale) => acc + (sale.quantity || 0), 0),
    [groupedSales]
  );

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleDelete = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSale) return;
    
    const success = await deleteSale(selectedSale.id);
    if (success) {
      setSelectedSale(null);
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
        {groupedSales.map((sale) => {
          const mix = mixes.find(m => m.id === sale.mix_id);
          const totalWeight = (sale.bag_size || 0) * (sale.quantity || 0);
          
          return (
            <tr key={`${sale.mix_id}-${sale.bag_size}`}>
              <TableCell>{mix?.name || 'غير معروف'}</TableCell>
              <TableCell>{`${formatNumber(sale.bag_size)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>{formatNumber(sale.quantity)}</TableCell>
              <TableCell>{`${formatNumber(totalWeight)} ${WEIGHT_UNIT}`}</TableCell>
              <TableCell>
                <TableActions
                  onEdit={() => handleEdit(sale)}
                  onDelete={() => handleDelete(sale)}
                  disabled={loading}
                />
              </TableCell>
            </tr>
          );
        })}
      </CollapsibleTable>

      {selectedSale && (
        <>
          <EditSaleModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSale(null);
            }}
            sale={selectedSale}
            mixes={mixes}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedSale(null);
            }}
            onConfirm={handleConfirmDelete}
            title="حذف مبيعات"
            message="هل أنت متأكد من حذف هذه المبيعات؟"
          />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};