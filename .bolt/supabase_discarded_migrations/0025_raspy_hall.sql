-- Update the cron job with correct http function signature
SELECT cron.unschedule('send-daily-report');

SELECT cron.schedule(
  'send-daily-report',
  '0 0 * * *',
  $$
  SELECT extensions.http(
    'POST',
    get_setting('edge_function_url') || '/send-daily-report',
    ARRAY[
      ('Content-Type', 'application/json')::extensions.http_header,
      ('Authorization', 'Bearer ' || get_setting('service_role_key'))::extensions.http_header
    ],
    'application/json',
    '{}'::text,
    10000
  );
  $$
);