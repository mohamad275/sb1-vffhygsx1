-- Create custom settings schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app_settings;

-- Create settings table
CREATE TABLE IF NOT EXISTS app_settings.config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to get setting
CREATE OR REPLACE FUNCTION get_setting(p_key text)
RETURNS text AS $$
BEGIN
  RETURN (SELECT value FROM app_settings.config WHERE key = p_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update setting
CREATE OR REPLACE FUNCTION set_setting(p_key text, p_value text)
RETURNS void AS $$
BEGIN
  INSERT INTO app_settings.config (key, value, updated_at)
  VALUES (p_key, p_value, now())
  ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default edge function URL
SELECT set_setting('edge_function_url', 'https://ujlwluizyjecvniusqbg.supabase.co/functions/v1');

-- Update the cron job
SELECT cron.unschedule('send-daily-report');

SELECT cron.schedule(
  'send-daily-report',
  '0 0 * * *',
  $$
  SELECT extensions.http_post(
    url := get_setting('edge_function_url') || '/send-daily-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_setting('service_role_key')
    )::text,
    body := '{}'::text
  );
  $$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA app_settings TO postgres, authenticated, anon;
GRANT SELECT ON app_settings.config TO postgres, authenticated, anon;
GRANT EXECUTE ON FUNCTION get_setting TO postgres, authenticated, anon;
GRANT EXECUTE ON FUNCTION set_setting TO postgres, authenticated, anon;