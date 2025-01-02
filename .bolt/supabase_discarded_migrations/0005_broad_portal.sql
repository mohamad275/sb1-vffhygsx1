-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON ingredients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ingredients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON ingredients;

-- Create new policies for ingredients
CREATE POLICY "Enable read access for all users"
ON ingredients FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON ingredients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON ingredients FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON ingredients FOR DELETE
USING (true);

-- Repeat for other tables
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('mixes', 'mix_ingredients', 'productions', 'sales', 'purchases', 'notes')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Enable update for authenticated users" ON %I', table_name);
    
    EXECUTE format('
      CREATE POLICY "Enable read access for all users" ON %I
        FOR SELECT USING (true)', table_name);
        
    EXECUTE format('
      CREATE POLICY "Enable insert for all users" ON %I
        FOR INSERT WITH CHECK (true)', table_name);
        
    EXECUTE format('
      CREATE POLICY "Enable update for all users" ON %I
        FOR UPDATE USING (true) WITH CHECK (true)', table_name);
        
    EXECUTE format('
      CREATE POLICY "Enable delete for all users" ON %I
        FOR DELETE USING (true)', table_name);
  END LOOP;
END $$;