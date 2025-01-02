-- Drop existing sync triggers to avoid conflicts
DROP TRIGGER IF EXISTS sync_inventory_after_changes ON productions;
DROP TRIGGER IF EXISTS sync_inventory_after_sales ON sales;

-- Improved sync function with better error handling
CREATE OR REPLACE FUNCTION sync_inventory() RETURNS trigger AS $$
BEGIN
  -- Recalculate inventory with error handling
  BEGIN
    WITH inventory_calc AS (
      SELECT 
        p.mix_id,
        p.bag_size,
        COALESCE(SUM(p.quantity), 0) - COALESCE((
          SELECT SUM(s.quantity)
          FROM sales s
          WHERE s.mix_id = p.mix_id AND s.bag_size = p.bag_size
        ), 0) as remaining
      FROM productions p
      GROUP BY p.mix_id, p.bag_size
      HAVING COALESCE(SUM(p.quantity), 0) > 0
    )
    INSERT INTO remaining_inventory (mix_id, bag_size, quantity)
    SELECT 
      mix_id,
      bag_size,
      GREATEST(remaining, 0) -- Ensure quantity never goes negative
    FROM inventory_calc
    ON CONFLICT (mix_id, bag_size) 
    DO UPDATE SET
      quantity = GREATEST(EXCLUDED.quantity, 0),
      updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in sync_inventory: %', SQLERRM;
  END;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers with AFTER STATEMENT timing
CREATE TRIGGER sync_inventory_after_changes
  AFTER INSERT OR UPDATE OR DELETE ON productions
  FOR EACH STATEMENT
  EXECUTE FUNCTION sync_inventory();

CREATE TRIGGER sync_inventory_after_sales
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH STATEMENT
  EXECUTE FUNCTION sync_inventory();

-- Add function to manually sync inventory
CREATE OR REPLACE FUNCTION manual_sync_inventory() RETURNS jsonb AS $$
BEGIN
  PERFORM sync_inventory();
  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم مزامنة المخزون بنجاح'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;