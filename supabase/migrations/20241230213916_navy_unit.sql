-- Create function to safely delete production
CREATE OR REPLACE FUNCTION delete_production_safe(
  p_id uuid
) RETURNS jsonb AS $$
BEGIN
  -- Delete from productions
  DELETE FROM productions WHERE id = p_id;
  
  -- Delete from daily_productions if exists
  DELETE FROM daily_productions WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Production deleted successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;