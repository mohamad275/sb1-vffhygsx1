import { ReportData } from './types';

export const validateReportData = (data: Partial<ReportData>): ReportData => {
  if (!data) {
    throw new Error('لا توجد بيانات لإنشاء التقرير');
  }

  // Ensure all required arrays exist
  const validatedData: ReportData = {
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    mixes: Array.isArray(data.mixes) ? data.mixes : [],
    productions: Array.isArray(data.productions) ? data.productions : [],
    sales: Array.isArray(data.sales) ? data.sales : [],
    purchases: Array.isArray(data.purchases) ? data.purchases : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
  };

  // Validate data integrity
  if (!validatedData.ingredients.length) {
    console.warn('No ingredients data available');
  }
  if (!validatedData.mixes.length) {
    console.warn('No mixes data available');
  }

  return validatedData;
};