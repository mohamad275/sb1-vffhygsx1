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
  SELECT 
    COALESCE(
      (content::jsonb),
      jsonb_build_object('success', false, 'message', status_text)
    ) INTO v_response
  FROM extensions.http((
    'POST',
    'https://ujlwluizyjecvniusqbg.supabase.co/functions/v1/send-daily-report',
    ARRAY[
      ('Content-Type', 'application/json')::extensions.http_header
    ],
    'application/json',
    jsonb_build_object(
      'to', p_email,
      'data', v_report_data,
      'test', true
    )::text,
    10000
  ));

  IF (v_response->>'success')::boolean THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'تم إرسال التقرير التجريبي بنجاح'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'فشل إرسال التقرير التجريبي: ' || (v_response->>'message')
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ غير متوقع: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_test_email_report(text) TO authenticated;

-- Create function to safely add email recipient
CREATE OR REPLACE FUNCTION add_email_recipient(
  p_email text
)
RETURNS jsonb AS $$
BEGIN
  -- Validate email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'عنوان البريد الإلكتروني غير صالح'
    );
  END IF;

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
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء إضافة البريد الإلكتروني: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_email_recipient(text) TO authenticated;