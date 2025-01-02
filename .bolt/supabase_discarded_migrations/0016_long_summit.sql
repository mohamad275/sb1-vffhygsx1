-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON mixes;
DROP POLICY IF EXISTS "Enable insert for all users" ON mixes;
DROP POLICY IF EXISTS "Enable update for all users" ON mixes;
DROP POLICY IF EXISTS "Enable delete for all users" ON mixes;

DROP POLICY IF EXISTS "Enable read access for all users" ON mix_ingredients;
DROP POLICY IF EXISTS "Enable insert for all users" ON mix_ingredients;
DROP POLICY IF EXISTS "Enable update for all users" ON mix_ingredients;
DROP POLICY IF EXISTS "Enable delete for all users" ON mix_ingredients;

-- Create new policies for mixes
CREATE POLICY "Enable full access for all users"
ON mixes
USING (true)
WITH CHECK (true);

-- Create new policies for mix_ingredients
CREATE POLICY "Enable full access for all users"
ON mix_ingredients
USING (true)
WITH CHECK (true);

-- Create function to handle mix updates
CREATE OR REPLACE FUNCTION update_mix(
  p_mix_id uuid,
  p_name text,
  p_ingredients jsonb
)
RETURNS void AS $$
BEGIN
  -- Update mix name
  UPDATE mixes 
  SET 
    name = p_name,
    updated_at = now()
  WHERE id = p_mix_id;

  -- Delete existing ingredients
  DELETE FROM mix_ingredients 
  WHERE mix_id = p_mix_id;

  -- Insert new ingredients
  INSERT INTO mix_ingredients (mix_id, ingredient_id, quantity)
  SELECT 
    p_mix_id,
    (value->>'ingredient_id')::uuid,
    (value->>'quantity')::decimal
  FROM jsonb_array_elements(p_ingredients);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON mixes TO authenticated;
GRANT ALL ON mix_ingredients TO authenticated;
GRANT EXECUTE ON FUNCTION update_mix TO authenticated;