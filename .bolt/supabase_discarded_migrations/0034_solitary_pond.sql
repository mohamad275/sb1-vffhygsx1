-- Drop existing function if exists
DROP FUNCTION IF EXISTS add_production(uuid, decimal, integer);

-- Create improved production function with better error handling
CREATE OR REPLACE FUNCTION add_production(
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  v_ingredient RECORD;
  v_total_weight decimal;
  v_consumption decimal;
BEGIN
  -- Validate inputs
  IF p_mix_id IS NULL OR p_bag_size <= 0 OR p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'قيم غير صالحة'
    );
  END IF;

  -- Calculate total mix weight
  SELECT SUM(quantity) INTO v_total_weight
  FROM mix_ingredients
  WHERE mix_id = p_mix_id;

  IF v_total_weight IS NULL OR v_total_weight = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الخلطة لا تحتوي على مكونات'
    );
  END IF;

  -- Start explicit transaction block
  BEGIN
    -- Lock the ingredients for update
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
      -- Calculate consumption for this ingredient
      v_consumption := (v_ingredient.quantity / v_total_weight) * (p_bag_size * p_quantity);

      -- Verify available quantity
      IF v_ingredient.available_quantity < v_consumption THEN
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

      -- Record consumption
      INSERT INTO daily_consumption (
        ingredient_id,
        mix_id,
        quantity
      ) VALUES (
        v_ingredient.ingredient_id,
        p_mix_id,
        v_consumption
      );
    END LOOP;

    -- Add production record
    INSERT INTO daily_productions (
      mix_id,
      bag_size,
      quantity
    ) VALUES (
      p_mix_id,
      p_bag_size,
      p_quantity
    );

    -- If we get here, everything succeeded
    RETURN jsonb_build_object(
      'success', true,
      'message', 'تم إضافة الإنتاج بنجاح'
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Return error message
      RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_production TO authenticated;