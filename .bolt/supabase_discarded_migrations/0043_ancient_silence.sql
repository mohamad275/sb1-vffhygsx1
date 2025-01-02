-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL CHECK (bag_size > 0),
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON inventory FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON inventory FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON inventory FOR UPDATE
USING (true);

-- Create function to update inventory when adding production
CREATE OR REPLACE FUNCTION update_inventory_on_production()
RETURNS trigger AS $$
BEGIN
  -- Update or insert into inventory
  INSERT INTO inventory (mix_id, bag_size, quantity)
  VALUES (NEW.mix_id, NEW.bag_size, NEW.quantity)
  ON CONFLICT (mix_id, bag_size) DO UPDATE
  SET quantity = inventory.quantity + NEW.quantity,
      updated_at = now();
      
  -- Also insert into productions table for total history
  INSERT INTO productions (mix_id, bag_size, quantity)
  VALUES (NEW.mix_id, NEW.bag_size, NEW.quantity);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for production
CREATE TRIGGER trg_update_inventory_on_production
  AFTER INSERT ON daily_productions
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_production();

-- Create function to update inventory when adding sale
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS trigger AS $$
BEGIN
  -- Check if enough inventory
  IF NOT EXISTS (
    SELECT 1 FROM inventory
    WHERE mix_id = NEW.mix_id 
    AND bag_size = NEW.bag_size
    AND quantity >= NEW.quantity
  ) THEN
    RAISE EXCEPTION 'لا توجد كمية كافية في المخزون';
  END IF;

  -- Update inventory
  UPDATE inventory
  SET quantity = quantity - NEW.quantity,
      updated_at = now()
  WHERE mix_id = NEW.mix_id 
  AND bag_size = NEW.bag_size;
  
  -- Also insert into sales table for total history
  INSERT INTO sales (mix_id, bag_size, quantity)
  VALUES (NEW.mix_id, NEW.bag_size, NEW.quantity);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sales
CREATE TRIGGER trg_update_inventory_on_sale
  AFTER INSERT ON daily_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_sale();

-- Add unique constraint on inventory
ALTER TABLE inventory ADD UNIQUE (mix_id, bag_size);