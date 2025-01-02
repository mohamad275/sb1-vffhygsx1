import { exportToPDF } from './pdfExporter';
import { ReportData } from './types';

export const generateDailyReport = async (data: ReportData): Promise<void> => {
  try {
    if (!data) {
      throw new Error('لا توجد بيانات لإنشاء التقرير');
    }

    await exportToPDF(data);
  } catch (error) {
    console.error('Error generating report:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ أثناء إنشاء التقرير');
  }
};

export type { ReportData };