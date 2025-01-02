-- Create improved delete functions
CREATE OR REPLACE FUNCTION delete_production_safe(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_production RECORD;
BEGIN
  -- Get production details with FOR UPDATE to lock the row
  SELECT * INTO v_production
  FROM productions p
  WHERE p.id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على الإنتاج'
    );
  END IF;

  -- Delete from daily_productions first (if exists)
  DELETE FROM daily_productions WHERE id = p_id;
  
  -- Delete from productions
  DELETE FROM productions WHERE id = p_id;

  -- Restore ingredients
  PERFORM restore_ingredients_for_production(
    v_production.mix_id,
    v_production.bag_size,
    v_production.quantity
  );

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

-- Create function for safe sale deletion
CREATE OR REPLACE FUNCTION delete_sale_safe(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_sale RECORD;
BEGIN
  -- Get sale details with FOR UPDATE
  SELECT * INTO v_sale
  FROM sales s
  WHERE s.id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لم يتم العثور على المبيعات'
    );
  END IF;

  -- Delete from daily_sales first (if exists)
  DELETE FROM daily_sales WHERE id = p_id;
  
  -- Delete from sales
  DELETE FROM sales WHERE id = p_id;

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_production_safe TO authenticated;
GRANT EXECUTE ON FUNCTION delete_sale_safe TO authenticated;