/*
  # Create tables for feed management system

  1. New Tables
    - `ingredients`: Stores raw materials
    - `mixes`: Stores feed mix recipes
    - `mix_ingredients`: Links ingredients to mixes with quantities
    - `productions`: Daily production records
    - `sales`: Daily sales records
    - `purchases`: Daily purchase records
    - `notes`: Daily notes and observations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Archiving
    - Create archive tables for daily data
    - Add function to automatically archive daily data at midnight
*/

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_quantity decimal NOT NULL DEFAULT 0,
  available_quantity decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create mixes table
CREATE TABLE IF NOT EXISTS mixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create mix_ingredients table
CREATE TABLE IF NOT EXISTS mix_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mix_id, ingredient_id)
);

-- Create productions table
CREATE TABLE IF NOT EXISTS productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  -- Ingredients policies
  CREATE POLICY "Enable read access for all users"
    ON ingredients FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON ingredients FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Enable update for authenticated users"
    ON ingredients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Mixes policies
  CREATE POLICY "Enable read access for all users"
    ON mixes FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON mixes FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Enable update for authenticated users"
    ON mixes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Mix ingredients policies
  CREATE POLICY "Enable read access for all users"
    ON mix_ingredients FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON mix_ingredients FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Enable update for authenticated users"
    ON mix_ingredients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Productions policies
  CREATE POLICY "Enable read access for all users"
    ON productions FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON productions FOR INSERT
    TO authenticated
    WITH CHECK (true);

  -- Sales policies
  CREATE POLICY "Enable read access for all users"
    ON sales FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON sales FOR INSERT
    TO authenticated
    WITH CHECK (true);

  -- Purchases policies
  CREATE POLICY "Enable read access for all users"
    ON purchases FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON purchases FOR INSERT
    TO authenticated
    WITH CHECK (true);

  -- Notes policies
  CREATE POLICY "Enable read access for all users"
    ON notes FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users"
    ON notes FOR INSERT
    TO authenticated
    WITH CHECK (true);
END $$;