/*
  # Create Daily Reset Cron Job

  1. New Function
    - `fn_daily_reset_cron()`: دالة لتشغيل إعادة تعيين البيانات اليومية

  2. Cron Job
    - يعمل كل يوم في الساعة 12 ليلاً
*/

-- Create cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to run daily reset
CREATE OR REPLACE FUNCTION fn_daily_reset_cron()
RETURNS void AS $$
BEGIN
  -- Call the reset function
  PERFORM fn_reset_daily_data();
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run at midnight
SELECT cron.schedule(
  'daily-reset',
  '0 0 * * *',
  'SELECT fn_daily_reset_cron()'
);