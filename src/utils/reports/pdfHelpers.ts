import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TableData, PDFOptions } from './types';
import { PDF_CONFIG } from './constants';

export const initializePDF = (options: Required<PDFOptions>): jsPDF => {
  try {
    const doc = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.format,
    });

    // Set RTL mode
    doc.setR2L(true);
    return doc;
  } catch (error) {
    console.error('Error initializing PDF:', error);
    throw new Error('فشل في تهيئة ملف PDF');
  }
};

export const drawHeader = (doc: jsPDF, margin: number): number => {
  try {
    const pageWidth = doc.internal.pageSize.width;
    
    // Add title
    doc.setFontSize(PDF_CONFIG.TITLE_FONT_SIZE);
    doc.text('التقرير اليومي', pageWidth - margin, margin * 2, { align: 'right' });
    
    // Add date
    doc.setFontSize(PDF_CONFIG.HEADER_FONT_SIZE);
    const date = format(new Date(), 'PPP', { locale: ar });
    doc.text(date, pageWidth - margin, margin * 3, { align: 'right' });

    return margin * 4;
  } catch (error) {
    console.error('Error drawing header:', error);
    throw new Error('فشل في إنشاء رأس التقرير');
  }
};

export const getTableConfig = (
  table: TableData,
  isRightSide: boolean,
  options: {
    startY: number;
    margin: number;
    pageWidth: number;
    tableWidth: number;
    fontSize: number;
  }
) => {
  const { startY, margin, pageWidth, tableWidth, fontSize } = options;

  return {
    head: [table.headers],
    body: table.rows || [],
    startY: startY + 10,
    margin: isRightSide
      ? { right: margin, left: pageWidth / 2 }
      : { right: pageWidth / 2 + margin, left: margin },
    tableWidth,
    theme: 'grid',
    styles: {
      fontSize,
      halign: 'right',
      direction: 'rtl',
      font: 'helvetica',
      overflow: 'linebreak',
      cellPadding: 3,
    },
    headStyles: {
      textColor: '#FFFFFF',
      fontSize: fontSize + 1,
      fillColor: table.color || [0, 0, 0],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell: function(data: any) {
      // Right align all cells
      data.cell.styles.halign = 'right';
    },
  };
};