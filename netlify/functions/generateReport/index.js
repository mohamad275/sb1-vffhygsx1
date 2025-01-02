const { createClient } = require('@supabase/supabase-js');
const { exportToPDF } = require('../../../src/utils/reports/pdfExporter');
const { format } = require('date-fns');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const getDataFromDatabase = async () => {
  try {
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

    return {
      ingredients: ingredients || [],
      mixes: mixes || [],
      productions: productions || [],
      sales: sales || [],
      purchases: purchases || [],
      notes: notes || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data from database');
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const data = await getDataFromDatabase();
    const pdfBuffer = await exportToPDF(data);
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};