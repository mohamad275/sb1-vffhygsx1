-- Create function to safely delete a sale
CREATE OR REPLACE FUNCTION delete_sale_safe(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_sale RECORD;
BEGIN
  -- Get sale details
  SELECT * INTO v_sale
  FROM daily_sales
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على المبيعات'
    );
  END IF;

  -- Delete sale
  DELETE FROM daily_sales WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف المبيعات بنجاح'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء حذف المبيعات: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely update a sale
CREATE OR REPLACE FUNCTION update_sale_safe(
  p_id uuid,
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  v_old_sale RECORD;
  v_remaining_bags integer;
BEGIN
  -- Get old sale details
  SELECT * INTO v_old_sale
  FROM daily_sales
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على المبيعات'
    );
  END IF;

  -- Calculate available bags (including current sale quantity)
  SELECT 
    COALESCE(SUM(p.quantity), 0) - 
    (COALESCE(SUM(s.quantity), 0) - COALESCE(v_old_sale.quantity, 0))
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

  -- Update sale
  UPDATE daily_sales
  SET
    mix_id = p_mix_id,
    bag_size = p_bag_size,
    quantity = p_quantity
  WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم تحديث المبيعات بنجاح'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'حدث خطأ أثناء تحديث المبيعات: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create archive table for sales
CREATE TABLE IF NOT EXISTS daily_sales_archive (
  id uuid,
  mix_id uuid,
  bag_size decimal,
  quantity integer,
  created_at timestamptz,
  archived_at timestamptz DEFAULT now()
);

-- Create function to reset daily sales
CREATE OR REPLACE FUNCTION reset_daily_sales()
RETURNS void AS $$
BEGIN
  -- Archive yesterday's sales
  INSERT INTO daily_sales_archive (id, mix_id, bag_size, quantity, created_at)
  SELECT id, mix_id, bag_size, quantity, created_at
  FROM daily_sales
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete archived sales
  DELETE FROM daily_sales
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

-- Update the daily reset function to include sales
CREATE OR REPLACE FUNCTION reset_daily_data()
RETURNS void AS $$
BEGIN
  PERFORM reset_daily_sales();
  -- Keep existing reset operations
  PERFORM reset_daily_productions();
  PERFORM reset_daily_consumption();
  PERFORM reset_daily_purchases();
  PERFORM reset_daily_notes();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_sale_safe TO authenticated;
GRANT EXECUTE ON FUNCTION update_sale_safe TO authenticated;