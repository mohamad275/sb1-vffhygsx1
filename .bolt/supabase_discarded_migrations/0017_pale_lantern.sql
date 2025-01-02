-- Create function to get daily report data
CREATE OR REPLACE FUNCTION get_daily_report_data()
RETURNS jsonb AS $$
DECLARE
  report_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'ingredients', (SELECT jsonb_agg(row_to_json(i)) FROM ingredients i),
    'mixes', (SELECT jsonb_agg(row_to_json(m)) FROM mixes m),
    'daily_productions', (
      SELECT jsonb_agg(row_to_json(p))
      FROM daily_productions p
      WHERE date_trunc('day', p.created_at) = date_trunc('day', now())
    ),
    'daily_sales', (
      SELECT jsonb_agg(row_to_json(s))
      FROM daily_sales s
      WHERE date_trunc('day', s.created_at) = date_trunc('day', now())
    ),
    'daily_purchases', (
      SELECT jsonb_agg(row_to_json(pu))
      FROM daily_purchases pu
      WHERE date_trunc('day', pu.created_at) = date_trunc('day', now())
    ),
    'daily_notes', (
      SELECT jsonb_agg(row_to_json(n))
      FROM daily_notes n
      WHERE date_trunc('day', n.created_at) = date_trunc('day', now())
    )
  ) INTO report_data;
  
  RETURN report_data;
END;
$$ LANGUAGE plpgsql;

-- Create schedule for daily report
SELECT cron.schedule(
  'send-daily-report',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    current_setting('app.settings.edge_function_url') || '/send-daily-report',
    '{}',
    jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);