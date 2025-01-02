import { supabase } from '../../lib/supabase/client';
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from './emailConfig';

// Initialize EmailJS with your public key
emailjs.init(EMAIL_CONFIG.USER_ID);

export const sendTestEmail = async (email: string) => {
  try {
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: 'عنوان البريد الإلكتروني غير صالح'
      };
    }

    const templateParams = {
      to_email: email,
      subject: 'تقرير تجريبي',
      message: 'هذا اختبار للتأكد من عمل نظام البريد الإلكتروني',
      date: new Date().toLocaleDateString('ar')
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.USER_ID
    );

    console.log('Email sent successfully:', response);
    return {
      success: true,
      message: 'تم إرسال رسالة الاختبار بنجاح'
    };

  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      message: 'فشل إرسال التقرير التجريبي: ' + (error.message || 'خطأ غير معروف')
    };
  }
};

export const verifyEmailRecipients = async () => {
  try {
    const { data: recipients, error } = await supabase
      .from('email_recipients')
      .select('email')
      .eq('active', true);

    if (error) throw error;
    return !!(recipients && recipients.length > 0);
  } catch (error) {
    console.error('Error checking email recipients:', error);
    return false;
  }
};