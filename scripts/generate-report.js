import { createClient } from '@supabase/supabase-js';
import { register } from 'ts-node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Register ts-node
register({
  esm: true,
  experimentalSpecifierResolution: 'node'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Now import the TypeScript file
import { exportToPDF } from '../src/utils/reports/pdfExporter.js';  // Note: change .ts to .js
import { format } from 'date-fns';

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
