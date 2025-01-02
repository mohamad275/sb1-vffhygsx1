/*
  # Feed Management System Schema

  1. New Tables
    - `ingredients` (المواد الخام)
      - `id` (uuid, primary key)
      - `name` (text) - اسم المادة
      - `total_quantity` (decimal) - الكمية الإجمالية
      - `available_quantity` (decimal) - الكمية المتوفرة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `mixes` (الخلطات)
      - `id` (uuid, primary key)
      - `name` (text) - اسم الخلطة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `mix_ingredients` (مكونات الخلطات)
      - `id` (uuid, primary key)
      - `mix_id` (uuid, foreign key)
      - `ingredient_id` (uuid, foreign key)
      - `quantity` (decimal) - الكمية المستخدمة
      - `created_at` (timestamptz)

    - `productions` (الإنتاج)
      - `id` (uuid, primary key)
      - `mix_id` (uuid, foreign key)
      - `bag_size` (decimal) - وزن الكيس
      - `quantity` (integer) - عدد الأكياس
      - `created_at` (timestamptz)

    - `daily_productions` (إنتاج اليوم)
      - Same structure as productions
      - Gets cleared daily at midnight

    - `sales` (المبيعات)
      - `id` (uuid, primary key)
      - `mix_id` (uuid, foreign key)
      - `bag_size` (decimal)
      - `quantity` (integer)
      - `created_at` (timestamptz)

    - `daily_sales` (مبيعات اليوم)
      - Same structure as sales
      - Gets cleared daily at midnight

    - `daily_purchases` (مشتريات اليوم)
      - `id` (uuid, primary key)
      - `ingredient_id` (uuid, foreign key)
      - `quantity` (decimal)
      - `created_at` (timestamptz)
      - Gets cleared daily at midnight

    - `notes` (الملاحظات)
      - `id` (uuid, primary key)
      - `content` (text)
      - `created_at` (timestamptz)
      - Gets cleared daily at midnight

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Functions
    - Daily reset functions for daily tables
    - Trigger functions for updating available quantities
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    total_quantity decimal NOT NULL DEFAULT 0,
    available_quantity decimal NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create mixes table
CREATE TABLE IF NOT EXISTS mixes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create mix_ingredients table
CREATE TABLE IF NOT EXISTS mix_ingredients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id) ON DELETE CASCADE,
    ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity decimal NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(mix_id, ingredient_id)
);

-- Create productions table
CREATE TABLE IF NOT EXISTS productions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id) ON DELETE CASCADE,
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create daily_productions table
CREATE TABLE IF NOT EXISTS daily_productions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id) ON DELETE CASCADE,
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id) ON DELETE CASCADE,
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create daily_sales table
CREATE TABLE IF NOT EXISTS daily_sales (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_id uuid REFERENCES mixes(id) ON DELETE CASCADE,
    bag_size decimal NOT NULL,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create daily_purchases table
CREATE TABLE IF NOT EXISTS daily_purchases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity decimal NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON ingredients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON mixes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON mix_ingredients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON productions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON daily_productions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON sales
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON daily_sales
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON daily_purchases
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON notes
    FOR SELECT TO authenticated USING (true);

-- Create function to update available quantity when adding production
CREATE OR REPLACE FUNCTION update_available_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total mix weight
  WITH mix_total AS (
    SELECT SUM(quantity) as total_weight
    FROM mix_ingredients
    WHERE mix_id = NEW.mix_id
  )
  UPDATE ingredients i
  SET available_quantity = i.available_quantity - (
    (mi.quantity * NEW.bag_size * NEW.quantity) / mt.total_weight
  )
  FROM mix_ingredients mi, mix_total mt
  WHERE mi.ingredient_id = i.id
  AND mi.mix_id = NEW.mix_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for productions
CREATE TRIGGER update_available_quantity_on_production
  AFTER INSERT ON productions
  FOR EACH ROW
  EXECUTE FUNCTION update_available_quantity();

-- Create trigger for daily_productions
CREATE TRIGGER update_available_quantity_on_daily_production
  AFTER INSERT ON daily_productions
  FOR EACH ROW
  EXECUTE FUNCTION update_available_quantity();

-- Create function to update available quantity when adding purchase
CREATE OR REPLACE FUNCTION update_available_quantity_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredients
  SET 
    total_quantity = total_quantity + NEW.quantity,
    available_quantity = available_quantity + NEW.quantity
  WHERE id = NEW.ingredient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily_purchases
CREATE TRIGGER update_available_quantity_on_daily_purchase
  AFTER INSERT ON daily_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_available_quantity_on_purchase();

-- Create function to clear daily tables at midnight
CREATE OR REPLACE FUNCTION clear_daily_tables()
RETURNS void AS $$
BEGIN
  DELETE FROM daily_productions WHERE created_at < CURRENT_DATE;
  DELETE FROM daily_sales WHERE created_at < CURRENT_DATE;
  DELETE FROM daily_purchases WHERE created_at < CURRENT_DATE;
  DELETE FROM notes WHERE created_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;