/*
  # Schema Update
  
  1. Changes
    - Drop existing policies before recreating them
    - Recreate tables if they don't exist
    - Enable RLS on all tables
    - Create new policies for all tables
*/

-- Drop existing policies
DO $$ 
BEGIN
    -- Ingredients
    DROP POLICY IF EXISTS "Enable read access for all users" ON ingredients;
    DROP POLICY IF EXISTS "Enable insert for all users" ON ingredients;
    DROP POLICY IF EXISTS "Enable update for all users" ON ingredients;
    DROP POLICY IF EXISTS "Enable delete for all users" ON ingredients;

    -- Mixes
    DROP POLICY IF EXISTS "Enable read access for all users" ON mixes;
    DROP POLICY IF EXISTS "Enable insert for all users" ON mixes;
    DROP POLICY IF EXISTS "Enable update for all users" ON mixes;
    DROP POLICY IF EXISTS "Enable delete for all users" ON mixes;

    -- Mix Ingredients
    DROP POLICY IF EXISTS "Enable read access for all users" ON mix_ingredients;
    DROP POLICY IF EXISTS "Enable insert for all users" ON mix_ingredients;
    DROP POLICY IF EXISTS "Enable update for all users" ON mix_ingredients;
    DROP POLICY IF EXISTS "Enable delete for all users" ON mix_ingredients;

    -- Productions
    DROP POLICY IF EXISTS "Enable read access for all users" ON productions;
    DROP POLICY IF EXISTS "Enable insert for all users" ON productions;
    DROP POLICY IF EXISTS "Enable update for all users" ON productions;
    DROP POLICY IF EXISTS "Enable delete for all users" ON productions;

    -- Sales
    DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
    DROP POLICY IF EXISTS "Enable insert for all users" ON sales;
    DROP POLICY IF EXISTS "Enable update for all users" ON sales;
    DROP POLICY IF EXISTS "Enable delete for all users" ON sales;

    -- Purchases
    DROP POLICY IF EXISTS "Enable read access for all users" ON purchases;
    DROP POLICY IF EXISTS "Enable insert for all users" ON purchases;
    DROP POLICY IF EXISTS "Enable update for all users" ON purchases;
    DROP POLICY IF EXISTS "Enable delete for all users" ON purchases;

    -- Notes
    DROP POLICY IF EXISTS "Enable read access for all users" ON notes;
    DROP POLICY IF EXISTS "Enable insert for all users" ON notes;
    DROP POLICY IF EXISTS "Enable update for all users" ON notes;
    DROP POLICY IF EXISTS "Enable delete for all users" ON notes;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_quantity decimal NOT NULL DEFAULT 0,
  available_quantity decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mix_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mix_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON ingredients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON ingredients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON mixes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON mixes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON mixes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON mixes FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON mix_ingredients FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON mix_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON mix_ingredients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON mix_ingredients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON productions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON productions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON productions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON productions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON sales FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON sales FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON sales FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON purchases FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON purchases FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON purchases FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON notes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON notes FOR DELETE USING (true);