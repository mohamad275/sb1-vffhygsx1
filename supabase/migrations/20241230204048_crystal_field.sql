/*
  # Fix Production and Mix Deletion Issues
  
  1. Changes
    - Remove CASCADE from foreign keys
    - Add function for adding production records
    - Update mix deletion handling
    
  2. Security
    - Functions run with SECURITY DEFINER
*/

-- Remove CASCADE from foreign keys
ALTER TABLE productions 
  DROP CONSTRAINT IF EXISTS productions_mix_id_fkey,
  ADD CONSTRAINT productions_mix_id_fkey 
    FOREIGN KEY (mix_id) REFERENCES mixes(id) ON DELETE RESTRICT;

ALTER TABLE daily_productions 
  DROP CONSTRAINT IF EXISTS daily_productions_mix_id_fkey,
  ADD CONSTRAINT daily_productions_mix_id_fkey 
    FOREIGN KEY (mix_id) REFERENCES mixes(id) ON DELETE RESTRICT;

ALTER TABLE sales 
  DROP CONSTRAINT IF EXISTS sales_mix_id_fkey,
  ADD CONSTRAINT sales_mix_id_fkey 
    FOREIGN KEY (mix_id) REFERENCES mixes(id) ON DELETE RESTRICT;

ALTER TABLE daily_sales 
  DROP CONSTRAINT IF EXISTS daily_sales_mix_id_fkey,
  ADD CONSTRAINT daily_sales_mix_id_fkey 
    FOREIGN KEY (mix_id) REFERENCES mixes(id) ON DELETE RESTRICT;

-- Drop existing functions
DROP FUNCTION IF EXISTS add_production(uuid, decimal, integer);
DROP FUNCTION IF EXISTS delete_mix(uuid);

-- Create production function
CREATE FUNCTION add_production(
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
) RETURNS JSONB AS $$
DECLARE
  v_production_id uuid;
  v_daily_production_id uuid;
BEGIN
  -- Insert into productions
  INSERT INTO productions (mix_id, bag_size, quantity)
  VALUES (p_mix_id, p_bag_size, p_quantity)
  RETURNING id INTO v_production_id;

  -- Insert into daily_productions
  INSERT INTO daily_productions (mix_id, bag_size, quantity)
  VALUES (p_mix_id, p_bag_size, p_quantity)
  RETURNING id INTO v_daily_production_id;

  RETURN jsonb_build_object(
    'success', true,
    'production_id', v_production_id,
    'daily_production_id', v_daily_production_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create mix deletion function
CREATE FUNCTION delete_mix_safe(
  p_mix_id uuid
) RETURNS JSONB AS $$
DECLARE
  v_has_productions boolean;
  v_has_sales boolean;
BEGIN
  -- Check for existing productions
  SELECT EXISTS (
    SELECT 1 FROM productions WHERE mix_id = p_mix_id
    UNION
    SELECT 1 FROM daily_productions WHERE mix_id = p_mix_id
  ) INTO v_has_productions;

  -- Check for existing sales
  SELECT EXISTS (
    SELECT 1 FROM sales WHERE mix_id = p_mix_id
    UNION
    SELECT 1 FROM daily_sales WHERE mix_id = p_mix_id
  ) INTO v_has_sales;

  -- If no related records exist, delete the mix
  IF NOT v_has_productions AND NOT v_has_sales THEN
    DELETE FROM mix_ingredients WHERE mix_id = p_mix_id;
    DELETE FROM mixes WHERE id = p_mix_id;
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Mix deleted successfully'
    );
  END IF;

  -- Return error if related records exist
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Cannot delete mix with existing productions or sales'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;