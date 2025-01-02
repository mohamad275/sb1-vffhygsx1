import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TableData } from '../types';

export const exportToPDF = async (type: string, title: string, data: TableData[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Set up basic document properties
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const startY = 40;

  // Add title
  doc.setFontSize(20);
  doc.text(title, pageWidth - margin, 20, { align: 'right' });

  // Add date
  doc.setFontSize(12);
  const date = format(new Date(), 'PPP', { locale: ar });
  doc.text(`التاريخ: ${date}`, pageWidth - margin, 30, { align: 'right' });

  // Calculate layout for two columns
  const tableWidth = (pageWidth - (margin * 3)) / 2;
  let currentY = startY;

  // Generate tables in two columns
  for (let i = 0; i < data.length; i += 2) {
    const rightTable = data[i];
    const leftTable = data[i + 1];

    // Add table titles
    doc.setFontSize(14);
    if (rightTable) {
      doc.text(rightTable.title, pageWidth - margin, currentY, { align: 'right' });
    }
    if (leftTable) {
      doc.text(leftTable.title, (pageWidth / 2) - margin, currentY, { align: 'right' });
    }

    // Add tables
    if (rightTable) {
      (doc as any).autoTable({
        head: [rightTable.headers],
        body: rightTable.rows,
        startY: currentY + 10,
        margin: { right: margin, left: pageWidth / 2 },
        tableWidth: tableWidth,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'right',
          direction: 'rtl',
        },
        headStyles: {
          fillColor: rightTable.color || [46, 125, 50],
          textColor: '#FFFFFF',
          fontSize: 11,
        },
      });
    }

    if (leftTable) {
      (doc as any).autoTable({
        head: [leftTable.headers],
        body: leftTable.rows,
        startY: currentY + 10,
        margin: { right: pageWidth / 2 + margin, left: margin },
        tableWidth: tableWidth,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'right',
          direction: 'rtl',
        },
        headStyles: {
          fillColor: leftTable.color || [46, 125, 50],
          textColor: '#FFFFFF',
          fontSize: 11,
        },
      });
    }

    // Calculate next Y position
    const rightHeight = rightTable ? (doc as any).lastAutoTable.finalY : currentY;
    const leftHeight = leftTable ? (doc as any).lastAutoTable.finalY : currentY;
    currentY = Math.max(rightHeight, leftHeight) + 20;

    // Add new page if needed
    if (currentY > doc.internal.pageSize.height - 40 && i + 2 < data.length) {
      doc.addPage();
      currentY = 20;
    }
  }

  // Save the PDF
  doc.save(`تقرير-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};