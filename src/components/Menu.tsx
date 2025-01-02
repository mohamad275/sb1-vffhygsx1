import React, { useState } from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { Package, Beaker, TrendingUp, ShoppingCart, Settings, FileText, DollarSign } from 'lucide-react';
import { AddIngredientModal } from './modals/AddIngredientModal';
import { AddMixModal } from './modals/AddMixModal';
import { AddProductionModal } from './modals/AddProductionModal';
import { AddSaleModal } from './modals/AddSaleModal';
import { AddPurchaseModal } from './modals/AddPurchaseModal';
import { AddNoteModal } from './modals/AddNoteModal';
import { EditIngredientsModal } from './modals/EditIngredientsModal';
import { EditMixesModal } from './modals/EditMixesModal';
import { EmailSettingsModal } from './modals/EmailSettingsModal';
import { useStore } from '../store';

const menuItems = [
  { id: 'ingredient', label: 'إضافة صنف', icon: Package },
  { id: 'mix', label: 'إضافة خلطة', icon: Beaker },
  { id: 'production', label: 'إضافة إنتاج', icon: TrendingUp },
  { id: 'sale', label: 'إضافة مبيعات', icon: ShoppingCart },
  { id: 'purchase', label: 'إضافة مشتريات', icon: DollarSign },
  { id: 'note', label: 'إضافة ملاحظة', icon: FileText },
  
  { id: 'editMixes', label: 'تعديل الخلطات', icon: Settings },
  
];

export const Menu: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { ingredients, mixes } = useStore();

  return (
    <>
      <HeadlessMenu as="div" className="relative">
        <HeadlessMenu.Button className="flex items-center text-gray-600 hover:text-gray-900">
          <Settings className="h-6 w-6" />
        </HeadlessMenu.Button>

        <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            {menuItems.map((item) => (
              <HeadlessMenu.Item key={item.id}>
                {({ active }) => (
                  <button
                    onClick={() => setActiveModal(item.id)}
                    className={`${
                      active ? 'bg-green-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <item.icon className="h-5 w-5 ml-2" />
                    {item.label}
                  </button>
                )}
              </HeadlessMenu.Item>
            ))}
          </div>
        </HeadlessMenu.Items>
      </HeadlessMenu>

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
      <AddPurchaseModal
        isOpen={activeModal === 'purchase'}
        onClose={() => setActiveModal(null)}
        ingredients={ingredients}
      />
      <AddNoteModal
        isOpen={activeModal === 'note'}
        onClose={() => setActiveModal(null)}
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
      <EmailSettingsModal
        isOpen={activeModal === 'emailSettings'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};