import { createClient } from '@supabase/supabase-js';
import 'ts-node/register'; 
import { exportToPDF } from '../src/utils/reports/pdfExporter.ts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateDailyReport() {
  try {
    // Fetch all required data
    const [
      { data: ingredients },
      { data: mixes },
      { data: productions },
      { data: sales },
      { data: purchases },
      { data: notes }
    ] = await Promise.all([
      supabase.from('ingredients').select('*'),
      supabase.from('mixes').select('*'),
      supabase.from('productions').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('daily_purchases').select('*'),
      supabase.from('notes').select('*')
    ]);

    // Generate PDF
    await exportToPDF({
      ingredients: ingredients || [],
      mixes: mixes || [],
      productions: productions || [],
      sales: sales || [],
      purchases: purchases || [],
      notes: notes || []
    });

    console.log('Report generated successfully');
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

generateDailyReport();
