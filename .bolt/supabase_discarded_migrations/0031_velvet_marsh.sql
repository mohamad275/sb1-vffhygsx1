-- Create function to calculate and record ingredient consumption
CREATE OR REPLACE FUNCTION calculate_production_consumption()
RETURNS trigger AS $$
DECLARE
  r RECORD;
  total_weight decimal;
  consumption_quantity decimal;
BEGIN
  -- Calculate total mix weight
  SELECT SUM(quantity) INTO total_weight
  FROM mix_ingredients
  WHERE mix_id = NEW.mix_id;

  -- Process each ingredient in the mix
  FOR r IN 
    SELECT ingredient_id, quantity 
    FROM mix_ingredients 
    WHERE mix_id = NEW.mix_id
  LOOP
    -- Calculate consumption for this ingredient
    consumption_quantity := (r.quantity / total_weight) * (NEW.bag_size * NEW.quantity);
    
    -- Record consumption
    INSERT INTO daily_consumption (
      ingredient_id,
      mix_id,
      quantity
    ) VALUES (
      r.ingredient_id,
      NEW.mix_id,
      consumption_quantity
    );

    -- Update ingredient available quantity
    UPDATE ingredients
    SET 
      available_quantity = available_quantity - consumption_quantity,
      updated_at = now()
    WHERE id = r.ingredient_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger
DROP TRIGGER IF EXISTS trg_calculate_consumption ON productions;
CREATE TRIGGER trg_calculate_consumption
  AFTER INSERT ON productions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_production_consumption();