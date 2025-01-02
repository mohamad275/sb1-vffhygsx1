-- Drop existing function if exists
DROP FUNCTION IF EXISTS restore_production_ingredients;

-- Create improved restore function
CREATE OR REPLACE FUNCTION restore_ingredients_for_production(
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
)
RETURNS void AS $$
DECLARE
  v_ingredient RECORD;
  v_total_weight decimal;
  v_consumption decimal;
BEGIN
  -- Calculate total mix weight
  SELECT COALESCE(SUM(quantity), 0) INTO v_total_weight
  FROM mix_ingredients
  WHERE mix_id = p_mix_id;

  IF v_total_weight = 0 THEN
    RAISE EXCEPTION 'Invalid mix: total weight is zero';
  END IF;

  -- Process each ingredient
  FOR v_ingredient IN 
    SELECT 
      mi.ingredient_id,
      mi.quantity,
      i.name
    FROM mix_ingredients mi
    JOIN ingredients i ON i.id = mi.ingredient_id
    WHERE mi.mix_id = p_mix_id
    FOR UPDATE OF i
  LOOP
    -- Calculate consumption to restore
    v_consumption := (v_ingredient.quantity / v_total_weight) * (p_bag_size * p_quantity);
    
    -- Restore ingredient quantity
    UPDATE ingredients
    SET 
      available_quantity = available_quantity + v_consumption,
      updated_at = now()
    WHERE id = v_ingredient.ingredient_id;

    -- Verify update
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ingredient not found: %', v_ingredient.name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION restore_ingredients_for_production TO authenticated;

-- Create function to safely delete production
CREATE OR REPLACE FUNCTION delete_production(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_production RECORD;
BEGIN
  -- Get production details
  SELECT * INTO v_production
  FROM productions
  WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Production not found'
    );
  END IF;

  -- Restore ingredients
  PERFORM restore_ingredients_for_production(
    v_production.mix_id,
    v_production.bag_size,
    v_production.quantity
  );

  -- Delete production
  DELETE FROM productions WHERE id = p_id;
  DELETE FROM daily_productions WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Production deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_production TO authenticated;