-- Drop existing function to avoid conflicts
DROP FUNCTION IF EXISTS delete_ingredient_safe(uuid);

-- Create improved ingredient deletion function
CREATE OR REPLACE FUNCTION delete_ingredient_safe(
  p_ingredient_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_has_mixes boolean;
  v_has_productions boolean;
BEGIN
  -- Check if ingredient is used in any mixes
  SELECT EXISTS (
    SELECT 1 FROM mix_ingredients 
    WHERE ingredient_id = p_ingredient_id
  ) INTO v_has_mixes;

  -- Check if ingredient has any productions
  SELECT EXISTS (
    SELECT 1 FROM daily_consumption 
    WHERE ingredient_id = p_ingredient_id
  ) INTO v_has_productions;

  -- If ingredient is used, prevent deletion
  IF v_has_mixes THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لا يمكن حذف هذا الصنف لأنه مستخدم في خلطات'
    );
  END IF;

  IF v_has_productions THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لا يمكن حذف هذا الصنف لأنه مستخدم في الإنتاج'
    );
  END IF;

  -- Delete the ingredient if not used
  DELETE FROM ingredients WHERE id = p_ingredient_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف الصنف بنجاح'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;