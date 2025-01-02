export const PDF_CONFIG = {
  DOCUMENT: {
    pageOrientation: 'landscape' as const,
    defaultStyle: {
      font: 'Amiri',
      alignment: 'right' as const,
      direction: 'rtl' as const
    },
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      date: {
        fontSize: 14,
        margin: [0, 0, 0, 20]
      }
    }
  }
};