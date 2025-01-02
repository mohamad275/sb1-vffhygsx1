import React, {  useEffect, useState, useMemo  } from 'react';
import { Download } from 'lucide-react';
import { useStore } from '../store';
import { 
  RawMaterialsTable,
  ProductionTable,
  SalesTable,
  DailyConsumptionTable,
  RemainingInventoryTable,
  DailyPurchasesTable,
  NotesTable
} from './tables';
import { exportToPDF } from '../utils/reports/pdfExporter';
import { isSameDay } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { ingredients, mixes, productions, sales, purchases, notes } = useStore();
  const [isExporting, setIsExporting] = React.useState(false);

  // Filter today's productions
  const todayProductions = useMemo(() => {
    const today = new Date();
    return productions.filter(p => 
      isSameDay(new Date(p.created_at), today)
    );
  }, [productions]);

  // Filter total productions
  const totalProductions = useMemo(() => {
    return productions;
  }, [productions]);

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      await exportToPDF({
        ingredients,
        mixes,
        productions,
        sales,
        purchases,
        notes
      });
      alert('تم إنشاء التقرير بنجاح');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const nextExportTime = new Date();
    nextExportTime.setHours(9, 14, 0, 0); // تعيين الساعة 7:05 صباحًا

    // إذا كان الوقت الحالي بعد الساعة 7:05 صباحًا، ضبط التوقيت ليوم غدٍ
    if (now > nextExportTime) {
      nextExportTime.setDate(nextExportTime.getDate() + 1);
    }

    const timeToNextExport = nextExportTime - now;

    const exportInterval = setTimeout(() => {
      handleExportAll();
      // إعادة تعيين المهمة لليوم التالي
      setInterval(() => {
        handleExportAll();
      }, 24 * 60 * 60 * 1000); // كل 24 ساعة
    }, timeToNextExport);

    // تنظيف المؤقت عند تفريغ المكون
    return () => clearTimeout(exportInterval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportAll}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 ml-2" />
          {isExporting ? 'جاري التصدير...' : 'تصدير التقرير اليومي'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RawMaterialsTable 
          title="المواد الخام الإجمالية" 
          ingredients={ingredients} 
          showTotal 
        />
        <RawMaterialsTable 
          title="المواد الخام المتوفرة" 
          ingredients={ingredients} 
          showAvailable 
        />
        <DailyPurchasesTable
          title="مشتريات اليوم"
          purchases={purchases}
          ingredients={ingredients}
        />
        <DailyConsumptionTable
          title="استهلاك المواد الخام اليومي"
          productions={productions}
          mixes={mixes}
          ingredients={ingredients}
        />
        <ProductionTable
          title="الإنتاج الكلي"
          productions={totalProductions}
          mixes={mixes}
          totalLabel="مجموع الأكياس"
        />
        <ProductionTable
          title="إنتاج اليوم"
          productions={todayProductions}
          mixes={mixes}
          totalLabel="مجموع أكياس اليوم"
        />
        <SalesTable
          title="مبيعات اليوم"
          sales={sales.filter(s => 
            isSameDay(new Date(s.created_at), new Date())
          )}
          mixes={mixes}
          totalLabel="مجموع مبيعات اليوم"
        />
        <SalesTable
          title="إجمالي المبيعات"
          sales={sales}
          mixes={mixes}
          totalLabel="مجموع المبيعات الكلي"
        />
        <RemainingInventoryTable
          title="المخزون المتبقي"
          productions={productions}
          sales={sales}
          mixes={mixes}
        />
        <NotesTable
          title="ملاحظات اليوم"
          notes={notes}
        />
      </div>
    </div>
  );
};