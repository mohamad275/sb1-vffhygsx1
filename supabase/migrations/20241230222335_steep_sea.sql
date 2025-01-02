-- Add function to safely delete inventory item
CREATE OR REPLACE FUNCTION delete_inventory_item_safe(
  p_id uuid
) RETURNS jsonb AS $$
BEGIN
  DELETE FROM remaining_inventory WHERE id = p_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف المخزون بنجاح'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to safely update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity_safe(
  p_id uuid,
  p_quantity integer
) RETURNS jsonb AS $$
BEGIN
  UPDATE remaining_inventory
  SET 
    quantity = p_quantity,
    updated_at = now()
  WHERE id = p_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم تحديث المخزون بنجاح'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to sync inventory with sales and productions
CREATE OR REPLACE FUNCTION sync_inventory() RETURNS trigger AS $$
BEGIN
  -- Recalculate inventory based on productions and sales
  WITH inventory_calc AS (
    SELECT 
      p.mix_id,
      p.bag_size,
      COALESCE(SUM(p.quantity), 0) - COALESCE(SUM(s.quantity), 0) as remaining
    FROM productions p
    LEFT JOIN sales s ON p.mix_id = s.mix_id AND p.bag_size = s.bag_size
    GROUP BY p.mix_id, p.bag_size
  )
  INSERT INTO remaining_inventory (mix_id, bag_size, quantity)
  SELECT 
    mix_id,
    bag_size,
    remaining
  FROM inventory_calc
  ON CONFLICT (mix_id, bag_size) 
  DO UPDATE SET
    quantity = EXCLUDED.quantity,
    updated_at = now();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync inventory
CREATE TRIGGER sync_inventory_after_changes
  AFTER INSERT OR UPDATE OR DELETE ON productions
  FOR EACH STATEMENT
  EXECUTE FUNCTION sync_inventory();

CREATE TRIGGER sync_inventory_after_sales
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH STATEMENT
  EXECUTE FUNCTION sync_inventory();