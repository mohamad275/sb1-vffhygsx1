import React from 'react';
import { Package, Beaker, TrendingUp, ShoppingCart, Settings } from 'lucide-react';
import { useStore } from '../store';
import { AddIngredientModal } from './modals/AddIngredientModal';
import { AddMixModal } from './modals/AddMixModal';
import { AddProductionModal } from './modals/AddProductionModal';
import { AddSaleModal } from './modals/AddSaleModal';
import { EditIngredientsModal } from './modals/EditIngredientsModal';
import { EditMixesModal } from './modals/EditMixesModal';

const menuItems = [
  { id: 'ingredient', label: 'إضافة صنف', icon: Package },
  { id: 'mix', label: 'إضافة خلطة', icon: Beaker },
  { id: 'production', label: 'إضافة إنتاج', icon: TrendingUp },
  { id: 'sale', label: 'إضافة مبيعات', icon: ShoppingCart },
  { id: 'editIngredients', label: 'تعديل الأصناف', icon: Settings },
  { id: 'editMixes', label: 'تعديل الخلطات', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const { ingredients, mixes } = useStore();

  return (
    <>
      <div className="w-64 bg-white shadow-lg fixed h-full pt-16">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="w-full flex items-center space-x-2 space-x-reverse p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <AddIngredientModal
        isOpen={activeModal === 'ingredient'}
        onClose={() => setActiveModal(null)}
      />
      <AddMixModal
        isOpen={activeModal === 'mix'}
        onClose={() => setActiveModal(null)}
        ingredients={ingredients}
      />
      <AddProductionModal
        isOpen={activeModal === 'production'}
        onClose={() => setActiveModal(null)}
        mixes={mixes}
      />
      <AddSaleModal
        isOpen={activeModal === 'sale'}
        onClose={() => setActiveModal(null)}
        mixes={mixes}
      />
      <EditIngredientsModal
        isOpen={activeModal === 'editIngredients'}
        onClose={() => setActiveModal(null)}
        ingredients={ingredients}
      />
      <EditMixesModal
        isOpen={activeModal === 'editMixes'}
        onClose={() => setActiveModal(null)}
        ingredients={ingredients}
        mixes={mixes}
      />
    </>
  );
};