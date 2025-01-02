-- Create archive tables for daily data
CREATE TABLE IF NOT EXISTS archived_productions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id),
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz NOT NULL,
    archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archived_sales (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id),
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz NOT NULL,
    archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archived_purchases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id uuid REFERENCES ingredients(id),
    quantity decimal NOT NULL,
    created_at timestamptz NOT NULL,
    archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archived_notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content text NOT NULL,
    created_at timestamptz NOT NULL,
    archived_at timestamptz DEFAULT now()
);

-- Function to archive daily data
CREATE OR REPLACE FUNCTION archive_daily_data() RETURNS void AS $$
BEGIN
    -- Archive productions
    INSERT INTO archived_productions (mix_id, bag_size, quantity, created_at)
    SELECT mix_id, bag_size, quantity, created_at
    FROM daily_productions
    WHERE created_at < CURRENT_DATE;

    -- Archive sales
    INSERT INTO archived_sales (mix_id, bag_size, quantity, created_at)
    SELECT mix_id, bag_size, quantity, created_at
    FROM daily_sales
    WHERE created_at < CURRENT_DATE;

    -- Archive purchases
    INSERT INTO archived_purchases (ingredient_id, quantity, created_at)
    SELECT ingredient_id, quantity, created_at
    FROM daily_purchases
    WHERE created_at < CURRENT_DATE;

    -- Archive notes
    INSERT INTO archived_notes (content, created_at)
    SELECT content, created_at
    FROM notes
    WHERE created_at < CURRENT_DATE;

    -- Clear daily tables
    DELETE FROM daily_productions WHERE created_at < CURRENT_DATE;
    DELETE FROM daily_sales WHERE created_at < CURRENT_DATE;
    DELETE FROM daily_purchases WHERE created_at < CURRENT_DATE;
    DELETE FROM notes WHERE created_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on archive tables
ALTER TABLE archived_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_notes ENABLE ROW LEVEL SECURITY;

-- Add policies for archive tables
CREATE POLICY "Enable read access for authenticated users" ON archived_productions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON archived_sales
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON archived_purchases
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON archived_notes
    FOR SELECT TO authenticated USING (true);