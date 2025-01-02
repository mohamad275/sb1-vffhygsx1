/*
  # Daily Consumption Tracking

  1. New Tables
    - daily_consumption: Tracks ingredient usage per mix
    - daily_consumption_archive: Archives historical consumption data

  2. Functions
    - fn_calculate_consumption: Calculates ingredient usage when production is added
    - fn_reset_daily_consumption: Resets daily consumption data at midnight

  3. Security
    - RLS enabled on all tables
    - Policies for read/write access
*/

-- Create daily consumption table
CREATE TABLE IF NOT EXISTS daily_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  quantity decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create archive table for consumption data
CREATE TABLE IF NOT EXISTS daily_consumption_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL,
  mix_id uuid NOT NULL,
  quantity decimal NOT NULL,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_consumption_archive ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON daily_consumption FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON daily_consumption FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
  ON daily_consumption_archive FOR SELECT
  USING (true);

-- Function to calculate and record ingredient consumption
CREATE OR REPLACE FUNCTION fn_calculate_consumption()
RETURNS trigger AS $$
DECLARE
  r RECORD;
  total_weight decimal;
  consumption_quantity decimal;
BEGIN
  -- Calculate total mix weight
  SELECT SUM(quantity) INTO total_weight
  FROM mix_ingredients
  WHERE mix_id = NEW.mix_id;

  -- Process each ingredient in the mix
  FOR r IN 
    SELECT ingredient_id, quantity 
    FROM mix_ingredients 
    WHERE mix_id = NEW.mix_id
  LOOP
    -- Calculate consumption for this ingredient
    consumption_quantity := (r.quantity / total_weight) * (NEW.bag_size * NEW.quantity);
    
    -- Record consumption
    INSERT INTO daily_consumption (
      ingredient_id,
      mix_id,
      quantity
    ) VALUES (
      r.ingredient_id,
      NEW.mix_id,
      consumption_quantity
    );

    -- Update ingredient available quantity
    UPDATE ingredients
    SET 
      available_quantity = available_quantity - consumption_quantity,
      updated_at = now()
    WHERE id = r.ingredient_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for production inserts
DROP TRIGGER IF EXISTS trg_calculate_consumption ON productions;
CREATE TRIGGER trg_calculate_consumption
  AFTER INSERT ON productions
  FOR EACH ROW
  EXECUTE FUNCTION fn_calculate_consumption();

-- Function to reset daily consumption
CREATE OR REPLACE FUNCTION fn_reset_daily_consumption()
RETURNS void AS $$
BEGIN
  -- Archive consumption data
  INSERT INTO daily_consumption_archive
  SELECT *, now() as archived_at
  FROM daily_consumption
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete old data
  DELETE FROM daily_consumption
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

-- Update daily reset function to include consumption
CREATE OR REPLACE FUNCTION fn_daily_reset_cron()
RETURNS void AS $$
BEGIN
  PERFORM fn_reset_daily_data();
  PERFORM fn_reset_daily_consumption();
END;
$$ LANGUAGE plpgsql;