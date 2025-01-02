-- Create improved email sending function
CREATE OR REPLACE FUNCTION send_test_email_report(p_email text)
RETURNS jsonb AS $$
DECLARE
  v_report_data jsonb;
  v_response jsonb;
BEGIN
  -- Validate email
  IF p_email IS NULL OR p_email = '' OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'عنوان البريد الإلكتروني غير صالح'
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
    120 -- Increase timeout to 120 seconds
  ));

  IF v_response IS NULL THEN
    RAISE EXCEPTION 'Failed to send email: No response from server';
  END IF;

  RETURN v_response;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'فشل إرسال التقرير: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_test_email_report(text) TO authenticated;