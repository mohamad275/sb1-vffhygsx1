-- Function to safely delete ingredients
CREATE OR REPLACE FUNCTION delete_ingredient_safe(
  p_ingredient_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_has_mixes boolean;
BEGIN
  -- Check if ingredient is used in any mixes
  SELECT EXISTS (
    SELECT 1 FROM mix_ingredients 
    WHERE ingredient_id = p_ingredient_id
  ) INTO v_has_mixes;

  -- If ingredient is used in mixes, prevent deletion
  IF v_has_mixes THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'لا يمكن حذف هذا الصنف لأنه مستخدم في خلطات'
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