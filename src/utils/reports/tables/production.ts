import { Mix, Production, Sale } from '../../../types';
import { WEIGHT_UNIT, BAG_UNIT } from '../../../constants/units';
import { formatNumber } from '../../numbers';

interface BagSizeProduction {
  mixId: string;
  bagSize: number;
  totalProduced: number;
  available: number;
  todayProduction: number;
  todaySales: number;
  totalSales: number;
}

export const generateProductionTable = (
  mixes: Mix[],
  productions: Production[],
  sales: Sale[]
): {
  headers: string[];
  rows: string[][];
  color: [number, number, number];
} => {
  const today = new Date().toDateString();
  
  // Group productions and sales by mix and bag size
  const productionMap = new Map<string, BagSizeProduction[]>();
  
  // Process all mixes
  mixes.forEach(mix => {
    const mixProductions = productions.filter(p => p.mixId === mix.id);
    const mixSales = sales.filter(s => s.mixId === mix.id);
    
    // Get unique bag sizes for this mix
    const bagSizes = [...new Set([
      ...mixProductions.map(p => p.bagSize),
      ...mixSales.map(s => s.bagSize)
    ])];
    
    bagSizes.forEach(bagSize => {
      const key = mix.id;
      if (!productionMap.has(key)) {
        productionMap.set(key, []);
      }
      
      const totalProduced = mixProductions
        .filter(p => p.bagSize === bagSize)
        .reduce((sum, p) => sum + p.quantity, 0);
        
      const totalSales = mixSales
        .filter(s => s.bagSize === bagSize)
        .reduce((sum, s) => sum + s.quantity, 0);
        
      const todayProduction = mixProductions
        .filter(p => p.bagSize === bagSize && new Date(p.date).toDateString() === today)
        .reduce((sum, p) => sum + p.quantity, 0);
        
      const todaySales = mixSales
        .filter(s => s.bagSize === bagSize && new Date(s.date).toDateString() === today)
        .reduce((sum, s) => sum + s.quantity, 0);
        
      productionMap.get(key)!.push({
        mixId: mix.id,
        bagSize,
        totalProduced,
        available: totalProduced - totalSales,
        todayProduction,
        todaySales,
        totalSales
      });
    });
  });
  
  // Convert to table rows
  const rows: string[][] = [];
  productionMap.forEach((productions, mixId) => {
    const mix = mixes.find(m => m.id === mixId);
    if (!mix) return;
    
    productions.forEach(prod => {
      rows.push([
        `${mix.name} (${prod.bagSize} ${WEIGHT_UNIT})`,
        formatNumber(prod.totalSales) + ` ${BAG_UNIT}`,
        formatNumber(prod.todaySales) + ` ${BAG_UNIT}`,
        formatNumber(prod.todayProduction) + ` ${BAG_UNIT}`,
        formatNumber(prod.available) + ` ${BAG_UNIT}`,
        formatNumber(prod.totalProduced) + ` ${BAG_UNIT}`
      ]);
    });
  });

  return {
    headers: [
      
      
      
      
      
      'إجمالي المبيع',
      'مبيع اليوم',
      'إنتاج اليوم',
      'المتوفر',
      'الإجمالي',
      'اسم الخلطة'
    ],
    rows,
    color: [63, 81, 181] // لون أزرق
  };
};