-- Drop existing function if it exists
DROP FUNCTION IF EXISTS send_test_email_report(text);
DROP FUNCTION IF EXISTS send_test_email_report(text, jsonb);

-- Create function to send test email report
CREATE OR REPLACE FUNCTION send_test_email_report(
  p_email text,
  p_report_data jsonb DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_report_data jsonb;
BEGIN
  -- Get report data if not provided
  IF p_report_data IS NULL THEN
    SELECT get_daily_report_data() INTO v_report_data;
  ELSE
    v_report_data := p_report_data;
  END IF;

  -- Send email using Edge Function
  PERFORM net.http_post(
    current_setting('app.settings.edge_function_url') || '/send-email',
    jsonb_build_object(
      'to', p_email,
      'subject', 'تقرير تجريبي',
      'data', v_report_data,
      'test', true
    )::text,
    'application/json',
    jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );

  RETURN true;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to send test email: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_test_email_report(text, jsonb) TO authenticated;