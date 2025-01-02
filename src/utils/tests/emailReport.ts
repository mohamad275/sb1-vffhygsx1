import { supabase } from '../../lib/supabase/client';
import { sendTestEmail } from '../reports/emailService';
export const testEmailReport = async (email: string) => {
  try {
    // First verify the email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: 'عنوان البريد الإلكتروني غير صالح'
      };
    }

    // Call the test email RPC function
    const { data, error } = await supabase.rpc('send_test_email_report', {
      p_email: email
    });

    if (error) {
      console.error('Error testing email report:', error);
      return {
        success: false,
        message: error.message || 'حدث خطأ أثناء إرسال التقرير التجريبي'
      };
    }

    return {
      success: true,
      message: 'تم إرسال التقرير التجريبي بنجاح'
    };

  } catch (error) {
    console.error('Error testing email report:', error);
    return {
      success: false,
      message: 'حدث خطأ غير متوقع أثناء إرسال التقرير التجريبي'
    };
  }
}