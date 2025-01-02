-- Create function to safely add a sale
CREATE OR REPLACE FUNCTION add_sale(
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  v_mix RECORD;
  v_remaining_bags integer;
BEGIN
  -- Validate inputs
  IF p_mix_id IS NULL OR p_bag_size <= 0 OR p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'قيم غير صالحة'
    );
  END IF;

  -- Get mix details
  SELECT * INTO v_mix
  FROM mixes
  WHERE id = p_mix_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الخلطة غير موجودة'
    );
  END IF;

  -- Calculate remaining bags
  SELECT COALESCE(SUM(p.quantity), 0) - COALESCE(SUM(s.quantity), 0)
  INTO v_remaining_bags
  FROM daily_productions p
  LEFT JOIN daily_sales s ON s.mix_id = p.mix_id AND s.bag_size = p.bag_size
  WHERE p.mix_id = p_mix_id AND p.bag_size = p_bag_size;

  -- Check if enough bags available
  IF v_remaining_bags < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لا توجد كمية كافية في المخزون'
    );
  END IF;

  -- Add sale record
  INSERT INTO daily_sales (
    mix_id,
    bag_size,
    quantity
  ) VALUES (
    p_mix_id,
    p_bag_size,
    p_quantity
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إضافة المبيعات بنجاح'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء إضافة المبيعات: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_sale TO authenticated;