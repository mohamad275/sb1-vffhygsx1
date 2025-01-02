import { ReportData } from './types';
import { WEIGHT_UNIT, BAG_UNIT } from '../../constants/units';
import { formatNumber } from '../numbers';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const generateTableHTML = (
  title: string,
  headers: string[],
  rows: (string | number)[][],
  total?: string
) => `
  <div class="table-container">
    <div class="table-header">
      <h3>${title}</h3>
      ${total ? `<span class="total">${total}</span>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`;

export const generateReportHTML = (data: ReportData): string => {
  const today = new Date();
  const todayString = today.toDateString();
  
  const todayProductions = data.productions.filter(p => 
    new Date(p.date).toDateString() === todayString
  );
  const todaySales = data.sales.filter(s => 
    new Date(s.date).toDateString() === todayString
  );

  const rawMaterialsTable = generateTableHTML(
    'المواد الخام المتوفرة',
    ['اسم الصنف', 'الكمية المتوفرة'],
    data.ingredients.map(ing => [
      ing.name,
      `${formatNumber(ing.availableQuantity)} ${WEIGHT_UNIT}`
    ]),
    `${formatNumber(data.ingredients.reduce((sum, ing) => sum + ing.availableQuantity, 0))} ${WEIGHT_UNIT}`
  );

  const productionTable = generateTableHTML(
    'إنتاج اليوم',
    ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
    todayProductions.map(prod => {
      const mix = data.mixes.find(m => m.id === prod.mixId);
      return [
        mix?.name || '-',
        `${formatNumber(prod.bagSize)} ${WEIGHT_UNIT}`,
        prod.quantity,
        `${formatNumber(prod.bagSize * prod.quantity)} ${WEIGHT_UNIT}`
      ];
    }),
    `${formatNumber(todayProductions.reduce((sum, p) => sum + p.quantity, 0))} ${BAG_UNIT}`
  );

  const salesTable = generateTableHTML(
    'مبيعات اليوم',
    ['اسم الخلطة', 'وزن الكيس', 'عدد الأكياس', 'الوزن الكلي'],
    todaySales.map(sale => {
      const mix = data.mixes.find(m => m.id === sale.mixId);
      return [
        mix?.name || '-',
        `${formatNumber(sale.bagSize)} ${WEIGHT_UNIT}`,
        sale.quantity,
        `${formatNumber(sale.bagSize * sale.quantity)} ${WEIGHT_UNIT}`
      ];
    }),
    `${formatNumber(todaySales.reduce((sum, s) => sum + s.quantity, 0))} ${BAG_UNIT}`
  );

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          direction: rtl;
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .report-date {
          color: #666;
          margin-bottom: 20px;
        }
        .table-container {
          margin-bottom: 30px;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .table-header h3 {
          margin: 0;
          color: #2c3e50;
        }
        .total {
          color: #2980b9;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: right;
        }
        th {
          background-color: #f5f6fa;
          color: #2c3e50;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1>التقرير اليومي</h1>
        <div class="report-date">
          ${format(today, 'PPP', { locale: ar })}
        </div>
      </div>
      ${rawMaterialsTable}
      ${productionTable}
      ${salesTable}
    </body>
    </html>
  `;
};