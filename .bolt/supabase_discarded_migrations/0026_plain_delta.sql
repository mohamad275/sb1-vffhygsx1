-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- Update the cron job with the correct function call
SELECT cron.unschedule('send-daily-report');

SELECT cron.schedule(
  'send-daily-report',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := get_setting('edge_function_url') || '/send-daily-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_setting('service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'daily_report',
      'data', get_daily_report_data()
    )
  );
  $$
);

-- Create or replace function to test email sending
CREATE OR REPLACE FUNCTION test_daily_report_email()
RETURNS jsonb AS $$
BEGIN
  PERFORM net.http_post(
    url := get_setting('edge_function_url') || '/send-daily-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_setting('service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'daily_report',
      'test', true,
      'data', get_daily_report_data()
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
      'message', 'فشل إرسال التقرير: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_daily_report_email TO authenticated;