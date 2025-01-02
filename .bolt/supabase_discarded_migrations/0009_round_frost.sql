/*
  # Fix RLS policies for daily purchases

  1. Changes
    - Drop existing RLS policies for daily_purchases
    - Create new policies for all operations (select, insert, update, delete)
    - Enable RLS on daily_purchases table
*/

-- Enable RLS
ALTER TABLE daily_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON daily_purchases;
DROP POLICY IF EXISTS "Enable insert for all users" ON daily_purchases;
DROP POLICY IF EXISTS "Enable update for all users" ON daily_purchases;
DROP POLICY IF EXISTS "Enable delete for all users" ON daily_purchases;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON daily_purchases FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON daily_purchases FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON daily_purchases FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON daily_purchases FOR DELETE
USING (true);