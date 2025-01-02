/*
  # Create Archive Tables

  1. New Tables
    - `daily_productions_archive`: أرشيف الإنتاج اليومي
    - `daily_sales_archive`: أرشيف المبيعات اليومية
    - `daily_purchases_archive`: أرشيف المشتريات اليومية
    - `daily_notes_archive`: أرشيف الملاحظات اليومية

  2. Security
    - Enable RLS on all archive tables
    - Add policies for authenticated users
*/

-- Create archive tables
CREATE TABLE daily_productions_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE daily_sales_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE daily_purchases_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL,
  quantity decimal NOT NULL,
  notes text,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE daily_notes_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE daily_productions_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_purchases_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes_archive ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON daily_productions_archive FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_sales_archive FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_purchases_archive FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON daily_notes_archive FOR SELECT TO authenticated USING (true);