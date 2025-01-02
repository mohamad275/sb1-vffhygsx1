export const PDF_STYLES = {
  DOCUMENT: {
    orientation: 'landscape' as const,
    unit: 'mm' as const,
    format: 'a4' as const,
    putOnlyUsedFonts: true,
  },
  
  TEXT: {
    TITLE: {
      fontSize: 24,
      color: [0, 0, 0],
    },
    DATE: {
      fontSize: 14,
      color: [0, 0, 0],
    },
  },
  
  TABLE: {
    styles: {
      font: 'Amiri',
      fontSize: 10,
      cellPadding: 2,
      halign: 'right',
      textColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  },
  
  LAYOUT: {
    margin: 10,
    spacing: 15,
  },
};