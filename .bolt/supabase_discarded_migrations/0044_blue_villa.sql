-- Create function to safely update daily consumption
CREATE OR REPLACE FUNCTION update_daily_consumption(
  p_id uuid,
  p_mix_id uuid,
  p_ingredient_id uuid,
  p_quantity decimal
)
RETURNS jsonb AS $$
DECLARE
  v_old_consumption RECORD;
BEGIN
  -- Get old consumption details
  SELECT * INTO v_old_consumption
  FROM daily_consumption
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على الاستهلاك'
    );
  END IF;

  -- Restore old quantity
  UPDATE ingredients
  SET available_quantity = available_quantity + v_old_consumption.quantity
  WHERE id = v_old_consumption.ingredient_id;

  -- Apply new quantity
  UPDATE ingredients
  SET available_quantity = available_quantity - p_quantity
  WHERE id = p_ingredient_id;

  -- Update consumption record
  UPDATE daily_consumption
  SET
    mix_id = p_mix_id,
    ingredient_id = p_ingredient_id,
    quantity = p_quantity
  WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم تحديث الاستهلاك بنجاح'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء تحديث الاستهلاك: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely delete daily consumption
CREATE OR REPLACE FUNCTION delete_daily_consumption(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_consumption RECORD;
BEGIN
  -- Get consumption details
  SELECT * INTO v_consumption
  FROM daily_consumption
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على الاستهلاك'
    );
  END IF;

  -- Restore ingredient quantity
  UPDATE ingredients
  SET available_quantity = available_quantity + v_consumption.quantity
  WHERE id = v_consumption.ingredient_id;

  -- Delete consumption record
  DELETE FROM daily_consumption WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف الاستهلاك بنجاح'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف الاستهلاك: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_daily_consumption TO authenticated;
GRANT EXECUTE ON FUNCTION delete_daily_consumption TO authenticated;