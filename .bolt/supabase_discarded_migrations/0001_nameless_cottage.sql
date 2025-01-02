/*
  # Initial Database Schema

  1. New Tables
    - `ingredients`: المواد الخام
      - `id` (uuid, primary key)
      - `name` (text): اسم المادة
      - `total_quantity` (decimal): الكمية الإجمالية
      - `available_quantity` (decimal): الكمية المتوفرة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `mixes`: الخلطات
      - `id` (uuid, primary key)
      - `name` (text): اسم الخلطة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `mix_ingredients`: مكونات الخلطات
      - `id` (uuid, primary key)
      - `mix_id` (uuid, foreign key)
      - `ingredient_id` (uuid, foreign key)
      - `quantity` (decimal): الكمية المستخدمة
      - `created_at` (timestamptz)

    - `daily_productions`: الإنتاج اليومي
      - `id` (uuid, primary key)
      - `mix_id` (uuid, foreign key)
      - `bag_size` (decimal): وزن الكيس
      - `quantity` (integer): عدد الأكياس
      - `created_at` (timestamptz)

    - `daily_sales`: المبيعات اليومية
      - `id` (uuid, primary key)
      - `mix_id` (uuid, foreign key)
      - `bag_size` (decimal): وزن الكيس
      - `quantity` (integer): عدد الأكياس
      - `created_at` (timestamptz)

    - `daily_purchases`: المشتريات اليومية
      - `id` (uuid, primary key)
      - `ingredient_id` (uuid, foreign key)
      - `quantity` (decimal): الكمية
      - `notes` (text): ملاحظات
      - `created_at` (timestamptz)

    - `daily_notes`: الملاحظات اليومية
      - `id` (uuid, primary key)
      - `content` (text): المحتوى
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Functions
    - `fn_reset_daily_data()`: دالة لإعادة تعيين البيانات اليومية
    - `fn_update_ingredient_quantities()`: دالة لتحديث كميات المواد الخام
*/

-- Create ingredients table
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_quantity decimal NOT NULL DEFAULT 0,
  available_quantity decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create mixes table
CREATE TABLE mixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create mix_ingredients table
CREATE TABLE mix_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mix_id, ingredient_id)
);

-- Create daily_productions table
CREATE TABLE daily_productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create daily_sales table
CREATE TABLE daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create daily_purchases table
CREATE TABLE daily_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity decimal NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create daily_notes table
CREATE TABLE daily_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON ingredients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON mixes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON mix_ingredients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_productions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_sales FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_purchases FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_notes FOR SELECT TO authenticated USING (true);

-- Create function to update ingredient quantities
CREATE OR REPLACE FUNCTION fn_update_ingredient_quantities()
RETURNS trigger AS $$
BEGIN
  -- Update ingredient quantities based on purchase
  IF TG_TABLE_NAME = 'daily_purchases' THEN
    UPDATE ingredients
    SET 
      total_quantity = total_quantity + NEW.quantity,
      available_quantity = available_quantity + NEW.quantity,
      updated_at = now()
    WHERE id = NEW.ingredient_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating ingredient quantities
CREATE TRIGGER trg_update_ingredient_quantities
AFTER INSERT ON daily_purchases
FOR EACH ROW
EXECUTE FUNCTION fn_update_ingredient_quantities();

-- Create function to reset daily data
CREATE OR REPLACE FUNCTION fn_reset_daily_data()
RETURNS void AS $$
BEGIN
  -- Archive data older than today
  INSERT INTO daily_productions_archive
  SELECT * FROM daily_productions
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  INSERT INTO daily_sales_archive
  SELECT * FROM daily_sales
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  INSERT INTO daily_purchases_archive
  SELECT * FROM daily_purchases
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  INSERT INTO daily_notes_archive
  SELECT * FROM daily_notes
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  -- Delete old data
  DELETE FROM daily_productions
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  DELETE FROM daily_sales
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  DELETE FROM daily_purchases
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
  
  DELETE FROM daily_notes
  WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;