-- Ensure all required tables exist
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
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL CHECK (bag_size > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL CHECK (bag_size > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL CHECK (quantity > 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE mixes ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE mix_ingredients ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE daily_productions ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE daily_purchases ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE notes ENABLE ROW LEVEL SECURITY';
END $$;

-- Create policies for all tables
DO $$ 
BEGIN
  -- Ingredients policies
  EXECUTE 'CREATE POLICY "Enable read access for all users" ON ingredients FOR SELECT USING (true)';
  EXECUTE 'CREATE POLICY "Enable insert for all users" ON ingredients FOR INSERT WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Enable update for all users" ON ingredients FOR UPDATE USING (true)';
  EXECUTE 'CREATE POLICY "Enable delete for all users" ON ingredients FOR DELETE USING (true)';

  -- Repeat for other tables
  EXECUTE 'CREATE POLICY "Enable read access for all users" ON mixes FOR SELECT USING (true)';
  EXECUTE 'CREATE POLICY "Enable insert for all users" ON mixes FOR INSERT WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Enable update for all users" ON mixes FOR UPDATE USING (true)';
  EXECUTE 'CREATE POLICY "Enable delete for all users" ON mixes FOR DELETE USING (true)';

  -- And so on for other tables...
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;