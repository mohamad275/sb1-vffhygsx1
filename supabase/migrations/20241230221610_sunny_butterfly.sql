-- Create remaining inventory table
CREATE TABLE IF NOT EXISTS remaining_inventory (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id),
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE remaining_inventory ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable all access for authenticated users" ON remaining_inventory
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create function to update remaining inventory
CREATE OR REPLACE FUNCTION update_remaining_inventory() RETURNS trigger AS $$
BEGIN
    -- Update or insert into remaining_inventory
    INSERT INTO remaining_inventory (mix_id, bag_size, quantity)
    VALUES (NEW.mix_id, NEW.bag_size, NEW.quantity)
    ON CONFLICT (mix_id, bag_size) 
    DO UPDATE SET
        quantity = remaining_inventory.quantity + NEW.quantity,
        updated_at = now()
    WHERE remaining_inventory.mix_id = NEW.mix_id 
    AND remaining_inventory.bag_size = NEW.bag_size;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_inventory_on_production
    AFTER INSERT ON productions
    FOR EACH ROW
    EXECUTE FUNCTION update_remaining_inventory();

-- Add unique constraint
ALTER TABLE remaining_inventory 
    ADD CONSTRAINT unique_mix_bag_size UNIQUE (mix_id, bag_size);