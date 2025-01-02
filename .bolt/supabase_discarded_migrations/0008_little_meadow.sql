/*
  # Daily Purchases Reset System

  1. New Tables
    - `purchases_archive` table to store historical purchase data
      - All fields from purchases table plus archived_at timestamp
  
  2. Functions
    - Add function to archive and reset purchases daily
    
  3. Triggers
    - Add trigger to automatically archive purchases at midnight
*/

-- Create archive table for purchases
CREATE TABLE IF NOT EXISTS purchases_archive (
  id uuid,
  ingredient_id uuid,
  quantity decimal,
  notes text,
  created_at timestamptz,
  archived_at timestamptz DEFAULT now()
);

-- Function to archive and reset purchases
CREATE OR REPLACE FUNCTION fn_reset_daily_purchases()
RETURNS void AS $$
BEGIN
  -- Archive yesterday's purchases
  INSERT INTO purchases_archive (id, ingredient_id, quantity, notes, created_at)
  SELECT id, ingredient_id, quantity, notes, created_at
  FROM purchases
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete archived purchases
  DELETE FROM purchases
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

-- Schedule the daily reset
SELECT cron.schedule(
  'reset-daily-purchases',
  '0 0 * * *', -- Run at midnight every day
  $$SELECT fn_reset_daily_purchases();$$
);