-- Function to restore ingredient quantities when deleting production
CREATE OR REPLACE FUNCTION restore_production_ingredients(
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
  SELECT SUM(quantity) INTO v_total_weight
  FROM mix_ingredients
  WHERE mix_id = p_mix_id;

  -- Process each ingredient
  FOR v_ingredient IN 
    SELECT 
      mi.ingredient_id,
      mi.quantity
    FROM mix_ingredients mi
    WHERE mi.mix_id = p_mix_id
  LOOP
    -- Calculate consumption to restore
    v_consumption := (v_ingredient.quantity / v_total_weight) * (p_bag_size * p_quantity);
    
    -- Restore ingredient quantity
    UPDATE ingredients
    SET 
      available_quantity = available_quantity + v_consumption,
      updated_at = now()
    WHERE id = v_ingredient.ingredient_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION restore_production_ingredients TO authenticated;