-- Create function to safely update production
CREATE OR REPLACE FUNCTION update_production_safe(
  p_id uuid,
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  v_old_production RECORD;
  v_ingredient RECORD;
  v_total_weight decimal;
  v_consumption decimal;
BEGIN
  -- Get old production details with FOR UPDATE
  SELECT * INTO v_old_production
  FROM productions
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على الإنتاج'
    );
  END IF;

  -- First restore old ingredients
  PERFORM restore_ingredients_for_production(
    v_old_production.mix_id,
    v_old_production.bag_size,
    v_old_production.quantity
  );

  -- Calculate new mix total weight
  SELECT SUM(quantity) INTO v_total_weight
  FROM mix_ingredients
  WHERE mix_id = p_mix_id;

  IF v_total_weight IS NULL OR v_total_weight = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الخلطة لا تحتوي على مكونات'
    );
  END IF;

  -- Check and update new ingredient quantities
  FOR v_ingredient IN 
    SELECT 
      mi.ingredient_id,
      mi.quantity,
      i.available_quantity,
      i.name
    FROM mix_ingredients mi
    JOIN ingredients i ON i.id = mi.ingredient_id
    WHERE mi.mix_id = p_mix_id
    FOR UPDATE OF i
  LOOP
    -- Calculate new consumption
    v_consumption := (v_ingredient.quantity / v_total_weight) * (p_bag_size * p_quantity);

    -- Check if enough quantity available
    IF v_ingredient.available_quantity < v_consumption THEN
      -- Restore original state
      PERFORM restore_ingredients_for_production(
        v_old_production.mix_id,
        v_old_production.bag_size,
        v_old_production.quantity
      );
      
      RETURN jsonb_build_object(
        'success', false,
        'message', 'لا توجد كمية كافية من ' || v_ingredient.name
      );
    END IF;

    -- Update ingredient quantity
    UPDATE ingredients
    SET 
      available_quantity = available_quantity - v_consumption,
      updated_at = now()
    WHERE id = v_ingredient.ingredient_id;
  END LOOP;

  -- Update production record
  UPDATE productions
  SET 
    mix_id = p_mix_id,
    bag_size = p_bag_size,
    quantity = p_quantity
  WHERE id = p_id;

  -- Update daily production if exists
  UPDATE daily_productions
  SET
    mix_id = p_mix_id,
    bag_size = p_bag_size,
    quantity = p_quantity
  WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم تحديث الإنتاج بنجاح'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Restore original state on error
    PERFORM restore_ingredients_for_production(
      v_old_production.mix_id,
      v_old_production.bag_size,
      v_old_production.quantity
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء تحديث الإنتاج: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_production_safe TO authenticated;