import { Handler } from '@netlify/functions';
import { corsHeaders } from '../utils/cors';
import { validateApiKey } from '../utils/auth';
import { exportToPDF } from '../../../src/utils/reports/pdfExporter';
import { getDataFromDatabase } from '../../../src/utils/database';
import { format } from 'date-fns';

export const handler: Handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders
    };
  }

  try {
    // Verify API key
    const apiKey = event.headers['x-api-key'];
    if (!validateApiKey(apiKey)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Get data and generate PDF
    const data = await getDataFromDatabase();
    const pdfBuffer = await exportToPDF(data);
    const fileName = `report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};