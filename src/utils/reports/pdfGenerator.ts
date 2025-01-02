import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DailyReportData } from './types';
import { generateRawMaterialsTable } from './tables/rawMaterials';
import { PDF_CONFIG } from './constants';

export const generateDailyReport = async (data: DailyReportData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // إعداد رأس الصفحة
  const pageWidth = doc.internal.pageSize.width;
  const margin = PDF_CONFIG.DEFAULT_MARGIN;
  let yPosition = margin;

  // إضافة العنوان
  doc.setFontSize(PDF_CONFIG.TITLE_FONT_SIZE);
  doc.text(data.title, pageWidth - margin, yPosition);
  yPosition += 10;

  // إضافة التاريخ
  doc.setFontSize(PDF_CONFIG.HEADER_FONT_SIZE);
  doc.text(data.date, pageWidth - margin, yPosition);
  yPosition += 20;

  // إنشاء جدول المواد الأولية
  const rawMaterialsTable = generateRawMaterialsTable(data.rawMaterials);
  
  doc.autoTable({
    head: [rawMaterialsTable.headers],
    body: rawMaterialsTable.rows,
    startY: yPosition,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 5,
      halign: 'right',
      direction: 'rtl',
    },
    headStyles: {
      fillColor: rawMaterialsTable.color,
      textColor: '#FFFFFF',
      fontSize: 12,
    },
    margin: { right: margin },
  });

  // حفظ الملف
  const fileName = `تقرير-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};