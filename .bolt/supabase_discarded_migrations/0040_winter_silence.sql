-- Create improved function for safe production deletion
CREATE OR REPLACE FUNCTION delete_production_safe(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_production RECORD;
  v_mix RECORD;
  v_total_weight decimal;
  v_ingredient RECORD;
  v_consumption decimal;
BEGIN
  -- Get production details
  SELECT * INTO v_production
  FROM daily_productions
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على الإنتاج'
    );
  END IF;

  -- Get mix details
  SELECT * INTO v_mix
  FROM mixes
  WHERE id = v_production.mix_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على الخلطة'
    );
  END IF;

  -- Calculate total mix weight
  SELECT COALESCE(SUM(quantity), 0) INTO v_total_weight
  FROM mix_ingredients
  WHERE mix_id = v_production.mix_id;

  -- Restore ingredients
  FOR v_ingredient IN 
    SELECT mi.ingredient_id, mi.quantity, i.name
    FROM mix_ingredients mi
    JOIN ingredients i ON i.id = mi.ingredient_id
    WHERE mi.mix_id = v_production.mix_id
    FOR UPDATE OF i
  LOOP
    -- Calculate consumption to restore
    v_consumption := (v_ingredient.quantity / v_total_weight) * 
                    (v_production.bag_size * v_production.quantity);

    -- Update ingredient quantity
    UPDATE ingredients
    SET 
      available_quantity = available_quantity + v_consumption,
      updated_at = now()
    WHERE id = v_ingredient.ingredient_id;
  END LOOP;

  -- Delete production
  DELETE FROM daily_productions WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف الإنتاج بنجاح'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف الإنتاج: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_production_safe TO authenticated;