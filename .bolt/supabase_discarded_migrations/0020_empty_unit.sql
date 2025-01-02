-- Create required extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS send_test_email_report(text);
DROP FUNCTION IF EXISTS send_test_email_report(text, jsonb);

-- Create improved email testing function
CREATE OR REPLACE FUNCTION send_test_email_report(
  p_email text,
  p_report_data jsonb DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_report_data jsonb;
BEGIN
  -- Validate email
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'عنوان البريد الإلكتروني مطلوب'
    );
  END IF;

  -- Get report data if not provided
  IF p_report_data IS NULL THEN
    SELECT get_daily_report_data() INTO v_report_data;
  ELSE
    v_report_data := p_report_data;
  END IF;

  -- Send test email using Edge Function
  PERFORM extensions.http_post(
    url := current_setting('app.settings.edge_function_url') || '/send-email',
    body := jsonb_build_object(
      'to', p_email,
      'subject', 'تقرير تجريبي',
      'data', v_report_data,
      'test', true
    )::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إرسال التقرير التجريبي بنجاح'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'فشل إرسال التقرير التجريبي: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_test_email_report(text, jsonb) TO authenticated;

-- Improve email recipients table
ALTER TABLE email_recipients
ADD CONSTRAINT email_recipients_email_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create function to safely add email recipient
CREATE OR REPLACE FUNCTION add_email_recipient(
  p_email text
)
RETURNS jsonb AS $$
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM email_recipients WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'هذا البريد الإلكتروني مسجل بالفعل'
    );
  END IF;

  -- Insert new recipient
  INSERT INTO email_recipients (email)
  VALUES (p_email);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تمت إضافة البريد الإلكتروني بنجاح'
  );

EXCEPTION
  WHEN check_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'عنوان البريد الإلكتروني غير صالح'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء إضافة البريد الإلكتروني'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_email_recipient(text) TO authenticated;