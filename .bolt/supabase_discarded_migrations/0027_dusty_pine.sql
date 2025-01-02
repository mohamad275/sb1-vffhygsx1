-- Create or replace the test email function with proper HTTP request handling
CREATE OR REPLACE FUNCTION send_test_email_report(p_email text)
RETURNS jsonb AS $$
DECLARE
  v_report_data jsonb;
  v_response jsonb;
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
  SELECT content::jsonb INTO v_response
  FROM extensions.http((
    'POST',
    current_setting('app.settings.edge_function_url') || '/send-daily-report',
    ARRAY[
      ('Content-Type', 'application/json')::extensions.http_header
    ],
    jsonb_build_object(
      'to', p_email,
      'data', v_report_data,
      'test', true
    )::text,
    10
  ));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إرسال التقرير التجريبي بنجاح'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء إرسال التقرير: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_test_email_report(text) TO authenticated;