import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { format } from 'https://esm.sh/date-fns@2'
import { ar } from 'https://esm.sh/date-fns/locale'
import { exportToPDF } from '../utils/reports/pdfExporter.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async () => {
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
    const pdfBuffer = await exportToPDF({
      ingredients: ingredients || [],
      mixes: mixes || [],
      productions: productions || [],
      sales: sales || [],
      purchases: purchases || [],
      notes: notes || []
    });

    // Get active email recipients
    const { data: recipients } = await supabase
      .from('email_recipients')
      .select('email')
      .eq('active', true);

    if (!recipients?.length) {
      throw new Error('No active email recipients found');
    }

    // Send email to each recipient
    const today = format(new Date(), 'PPP', { locale: ar });
    const fileName = `تقرير-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    for (const recipient of recipients) {
      await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: `التقرير اليومي - ${today}`,
          html: `
            <div dir="rtl">
              <h2>التقرير اليومي</h2>
              <p>مرفق التقرير اليومي لتاريخ ${today}</p>
            </div>
          `,
          attachments: [{
            filename: fileName,
            content: pdfBuffer.toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf'
          }]
        }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in automated report:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});