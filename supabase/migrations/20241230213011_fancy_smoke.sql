-- Create daily consumption table
CREATE TABLE IF NOT EXISTS daily_consumption (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id uuid REFERENCES ingredients(id),
    mix_id uuid REFERENCES mixes(id),
    quantity decimal NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create archived consumption table
CREATE TABLE IF NOT EXISTS archived_consumption (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id uuid REFERENCES ingredients(id),
    mix_id uuid REFERENCES mixes(id),
    quantity decimal NOT NULL,
    created_at timestamptz NOT NULL,
    archived_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_consumption ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable read access for authenticated users" ON daily_consumption
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON archived_consumption
    FOR SELECT TO authenticated USING (true);

-- Update archive function to include consumption
CREATE OR REPLACE FUNCTION archive_daily_data() RETURNS void AS $$
BEGIN
    -- Archive existing data...
    
    -- Archive consumption
    INSERT INTO archived_consumption (ingredient_id, mix_id, quantity, created_at)
    SELECT ingredient_id, mix_id, quantity, created_at
    FROM daily_consumption
    WHERE created_at < CURRENT_DATE;
    
    -- Clear daily consumption
    DELETE FROM daily_consumption WHERE created_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and record consumption
CREATE OR REPLACE FUNCTION record_daily_consumption() RETURNS trigger AS $$
DECLARE
    v_mix_weight decimal;
    v_ingredient record;
BEGIN
    -- Calculate total mix weight
    SELECT COALESCE(SUM(quantity), 0) INTO v_mix_weight
    FROM mix_ingredients
    WHERE mix_id = NEW.mix_id;

    -- Record consumption for each ingredient
    FOR v_ingredient IN 
        SELECT ingredient_id, quantity 
        FROM mix_ingredients 
        WHERE mix_id = NEW.mix_id
    LOOP
        INSERT INTO daily_consumption (
            ingredient_id,
            mix_id,
            quantity
        ) VALUES (
            v_ingredient.ingredient_id,
            NEW.mix_id,
            (v_ingredient.quantity / v_mix_weight) * (NEW.bag_size * NEW.quantity)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily productions
CREATE TRIGGER record_daily_consumption_trigger
    AFTER INSERT ON daily_productions
    FOR EACH ROW
    EXECUTE FUNCTION record_daily_consumption();