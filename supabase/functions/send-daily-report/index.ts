import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { format } from 'https://esm.sh/date-fns@2'
import { ar } from 'https://esm.sh/date-fns/locale'
import { generatePDF } from '../utils/pdf.ts'

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_vay0mfe',
  TEMPLATE_ID: 'template_w9xbb1v',
  USER_ID: 'UYroOn-Bh4rvA-kwT',
  PRIVATE_KEY: Deno.env.get('EMAILJS_PRIVATE_KEY')
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, data, test = false } = await req.json()

    if (!to || !data) {
      throw new Error('Missing required parameters')
    }

    if (!EMAILJS_CONFIG.PRIVATE_KEY) {
      throw new Error('EmailJS private key not configured')
    }

    const pdfBuffer = await generatePDF(data)
    const today = format(new Date(), 'PPP', { locale: ar })
    const fileName = `تقرير-${format(new Date(), 'yyyy-MM-dd')}.pdf`

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAILJS_CONFIG.PRIVATE_KEY}`
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id: EMAILJS_CONFIG.USER_ID,
        template_params: {
          to_email: to,
          subject: test ? 'تقرير تجريبي' : `التقرير اليومي - ${today}`,
          message: test ? 'هذا تقرير تجريبي' : `مرفق التقرير اليومي لتاريخ ${today}`,
          pdf_content: pdfBuffer.toString('base64'),
          pdf_name: fileName
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`EmailJS API error: ${error}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: test ? 'تم إرسال التقرير التجريبي بنجاح' : 'تم إرسال التقرير بنجاح'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: `فشل إرسال البريد الإلكتروني: ${error.message}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})