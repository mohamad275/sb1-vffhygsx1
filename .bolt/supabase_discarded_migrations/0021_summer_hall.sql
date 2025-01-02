-- Drop existing functions
DROP FUNCTION IF EXISTS send_test_email_report(text);
DROP FUNCTION IF EXISTS send_test_email_report(text, jsonb);

-- Create improved test email function
CREATE OR REPLACE FUNCTION send_test_email_report(
  p_email text
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

  -- Get report data
  SELECT get_daily_report_data() INTO v_report_data;

  -- Send test email using Edge Function
  PERFORM extensions.http_post(
    url := current_setting('app.settings.edge_function_url') || '/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'to', p_email,
      'subject', 'تقرير تجريبي',
      'data', v_report_data,
      'test', true
    )::text
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
GRANT EXECUTE ON FUNCTION send_test_email_report(text) TO authenticated;