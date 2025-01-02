-- Create email configuration table
CREATE TABLE IF NOT EXISTS app_settings.email_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to send email with proper error handling
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

  -- Send email using Edge Function
  SELECT content::jsonb INTO v_response
  FROM extensions.http((
    'POST',
    current_setting('app.settings.edge_function_url') || '/send-daily-report',
    ARRAY[
      ('Content-Type', 'application/json')::extensions.http_header,
      ('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))::extensions.http_header
    ],
    'application/json',
    jsonb_build_object(
      'to', p_email,
      'subject', 'تقرير تجريبي',
      'data', v_report_data,
      'test', true
    )::text,
    60 -- Increase timeout to 60 seconds
  ));

  IF v_response IS NULL OR v_response->>'success' = 'false' THEN
    RAISE EXCEPTION 'Failed to send email: %', COALESCE(v_response->>'message', 'Unknown error');
  END IF;

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

-- Update the daily report sending function
CREATE OR REPLACE FUNCTION send_daily_report()
RETURNS void AS $$
DECLARE
  v_report_data jsonb;
  v_response jsonb;
  r RECORD;
BEGIN
  -- Get report data
  SELECT get_daily_report_data() INTO v_report_data;

  -- Get active recipients
  FOR r IN 
    SELECT email 
    FROM email_recipients 
    WHERE active = true
  LOOP
    -- Send email to each recipient
    SELECT content::jsonb INTO v_response
    FROM extensions.http((
      'POST',
      current_setting('app.settings.edge_function_url') || '/send-daily-report',
      ARRAY[
        ('Content-Type', 'application/json')::extensions.http_header,
        ('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))::extensions.http_header
      ],
      'application/json',
      jsonb_build_object(
        'to', r.email,
        'subject', 'التقرير اليومي - ' || to_char(now(), 'YYYY-MM-DD'),
        'data', v_report_data
      )::text,
      60
    ));

    IF v_response IS NULL OR v_response->>'success' = 'false' THEN
      RAISE WARNING 'Failed to send email to %: %', 
        r.email, 
        COALESCE(v_response->>'message', 'Unknown error');
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the cron job
SELECT cron.unschedule('send-daily-report');
SELECT cron.schedule(
  'send-daily-report',
  '0 0 * * *',
  $$SELECT send_daily_report();$$
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_test_email_report(text) TO authenticated;
GRANT EXECUTE ON FUNCTION send_daily_report() TO postgres;