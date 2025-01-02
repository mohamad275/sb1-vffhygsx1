/*
  # Add Transaction Management Functions
  
  1. New Functions
    - add_mix: Handles mix creation with ingredients in a single transaction
    - update_mix: Updates mix and ingredients in a single transaction
    - delete_mix: Safely deletes mix and related data
  
  2. Changes
    - Remove direct transaction management
    - Add atomic operations for mix CRUD
*/

-- Function to add a new mix with ingredients
CREATE OR REPLACE FUNCTION add_mix(
  p_name TEXT,
  p_ingredients JSONB
) RETURNS uuid AS $$
DECLARE
  v_mix_id uuid;
BEGIN
  -- Insert mix
  INSERT INTO mixes (name)
  VALUES (p_name)
  RETURNING id INTO v_mix_id;
  
  -- Insert mix ingredients
  INSERT INTO mix_ingredients (mix_id, ingredient_id, quantity)
  SELECT 
    v_mix_id,
    (ingredient->>'ingredient_id')::uuid,
    (ingredient->>'quantity')::decimal
  FROM jsonb_array_elements(p_ingredients) AS ingredient;
  
  RETURN v_mix_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update existing mix
CREATE OR REPLACE FUNCTION update_mix(
  p_mix_id uuid,
  p_name TEXT,
  p_ingredients JSONB
) RETURNS boolean AS $$
BEGIN
  -- Update mix name
  UPDATE mixes 
  SET name = p_name,
      updated_at = now()
  WHERE id = p_mix_id;
  
  -- Delete existing ingredients
  DELETE FROM mix_ingredients 
  WHERE mix_id = p_mix_id;
  
  -- Insert new ingredients
  INSERT INTO mix_ingredients (mix_id, ingredient_id, quantity)
  SELECT 
    p_mix_id,
    (ingredient->>'ingredient_id')::uuid,
    (ingredient->>'quantity')::decimal
  FROM jsonb_array_elements(p_ingredients) AS ingredient;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely delete mix
CREATE OR REPLACE FUNCTION delete_mix(
  p_mix_id uuid
) RETURNS boolean AS $$
BEGIN
  DELETE FROM mixes WHERE id = p_mix_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;