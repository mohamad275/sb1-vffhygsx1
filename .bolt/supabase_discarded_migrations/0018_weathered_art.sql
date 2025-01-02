-- Create function to send test email report
CREATE OR REPLACE FUNCTION send_test_email_report(
  p_email text,
  p_report_data jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Get report data if not provided
  IF p_report_data IS NULL THEN
    SELECT get_daily_report_data() INTO p_report_data;
  END IF;

  -- Send email using Edge Function
  PERFORM net.http_post(
    current_setting('app.settings.edge_function_url') || '/send-email',
    jsonb_build_object(
      'to', p_email,
      'subject', 'تقرير تجريبي',
      'data', p_report_data,
      'test', true
    ),
    jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_test_email_report TO authenticated;