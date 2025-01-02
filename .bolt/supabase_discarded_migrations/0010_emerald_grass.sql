/*
  # Daily Operations Tables and Reset Functionality

  1. New Tables
    - daily_sales: Daily sales records
    - daily_consumption: Daily raw material consumption
    - daily_production: Daily production

  2. Archive Tables
    - daily_sales_archive
    - daily_consumption_archive
    - daily_production_archive

  3. Functions
    - Reset functions for each daily table
    - Main reset function that runs at midnight
*/

-- Create daily tables
CREATE TABLE IF NOT EXISTS daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_production (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create archive tables
CREATE TABLE IF NOT EXISTS daily_sales_archive (
  id uuid,
  mix_id uuid,
  bag_size decimal,
  quantity integer,
  created_at timestamptz,
  archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_consumption_archive (
  id uuid,
  ingredient_id uuid,
  mix_id uuid,
  quantity decimal,
  created_at timestamptz,
  archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_production_archive (
  id uuid,
  mix_id uuid,
  bag_size decimal,
  quantity integer,
  created_at timestamptz,
  archived_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Daily Sales
  DROP POLICY IF EXISTS "Enable read access for all users" ON daily_sales;
  DROP POLICY IF EXISTS "Enable insert for all users" ON daily_sales;
  
  -- Daily Consumption
  DROP POLICY IF EXISTS "Enable read access for all users" ON daily_consumption;
  DROP POLICY IF EXISTS "Enable insert for all users" ON daily_consumption;
  
  -- Daily Production
  DROP POLICY IF EXISTS "Enable read access for all users" ON daily_production;
  DROP POLICY IF EXISTS "Enable insert for all users" ON daily_production;
END $$;

-- Create new policies
DO $$ 
BEGIN
  -- Daily Sales policies
  CREATE POLICY "Enable read access for all users" ON daily_sales
    FOR SELECT USING (true);
  
  CREATE POLICY "Enable insert for all users" ON daily_sales
    FOR INSERT WITH CHECK (true);

  -- Daily Consumption policies
  CREATE POLICY "Enable read access for all users" ON daily_consumption
    FOR SELECT USING (true);
  
  CREATE POLICY "Enable insert for all users" ON daily_consumption
    FOR INSERT WITH CHECK (true);

  -- Daily Production policies
  CREATE POLICY "Enable read access for all users" ON daily_production
    FOR SELECT USING (true);
  
  CREATE POLICY "Enable insert for all users" ON daily_production
    FOR INSERT WITH CHECK (true);
END $$;

-- Create reset functions
CREATE OR REPLACE FUNCTION reset_daily_sales()
RETURNS void AS $$
BEGIN
  -- Archive yesterday's data
  INSERT INTO daily_sales_archive 
  SELECT id, mix_id, bag_size, quantity, created_at
  FROM daily_sales
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete archived data
  DELETE FROM daily_sales
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_daily_consumption()
RETURNS void AS $$
BEGIN
  -- Archive yesterday's data
  INSERT INTO daily_consumption_archive 
  SELECT id, ingredient_id, mix_id, quantity, created_at
  FROM daily_consumption
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete archived data
  DELETE FROM daily_consumption
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_daily_production()
RETURNS void AS $$
BEGIN
  -- Archive yesterday's data
  INSERT INTO daily_production_archive 
  SELECT id, mix_id, bag_size, quantity, created_at
  FROM daily_production
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete archived data
  DELETE FROM daily_production
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

-- Create main reset function
CREATE OR REPLACE FUNCTION reset_all_daily_data()
RETURNS void AS $$
BEGIN
  PERFORM reset_daily_sales();
  PERFORM reset_daily_consumption();
  PERFORM reset_daily_production();
END;
$$ LANGUAGE plpgsql;

-- Schedule daily reset at midnight
SELECT cron.schedule(
  'reset-daily-data',
  '0 0 * * *',
  $$SELECT reset_all_daily_data();$$
);