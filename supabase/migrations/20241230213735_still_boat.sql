-- Drop existing function if exists
DROP FUNCTION IF EXISTS add_production(uuid, decimal, integer);

-- Create production function with transaction handling
CREATE OR REPLACE FUNCTION add_production(
  p_mix_id uuid,
  p_bag_size decimal,
  p_quantity integer
) RETURNS jsonb AS $$
DECLARE
  v_production_id uuid;
  v_daily_production_id uuid;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert into productions
    INSERT INTO productions (mix_id, bag_size, quantity)
    VALUES (p_mix_id, p_bag_size, p_quantity)
    RETURNING id INTO v_production_id;

    -- Insert into daily_productions
    INSERT INTO daily_productions (mix_id, bag_size, quantity)
    VALUES (p_mix_id, p_bag_size, p_quantity)
    RETURNING id INTO v_daily_production_id;

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'production_id', v_production_id,
      'daily_production_id', v_daily_production_id
    );
  EXCEPTION WHEN OTHERS THEN
    -- Rollback will happen automatically
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;