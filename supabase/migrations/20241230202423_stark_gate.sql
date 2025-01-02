/*
  # Add Complete RLS Policies

  1. Changes
    - Add INSERT policies for all tables
    - Add UPDATE policies for all tables
    - Add DELETE policies for all tables

  2. Security
    - All authenticated users can perform CRUD operations
    - Maintains data integrity while allowing operations
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ingredients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON mixes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON mix_ingredients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON productions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON daily_productions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON daily_sales;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON daily_purchases;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON notes;

-- Ingredients policies
CREATE POLICY "Enable all access for authenticated users" ON ingredients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Mixes policies
CREATE POLICY "Enable all access for authenticated users" ON mixes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Mix ingredients policies
CREATE POLICY "Enable all access for authenticated users" ON mix_ingredients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Productions policies
CREATE POLICY "Enable all access for authenticated users" ON productions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily productions policies
CREATE POLICY "Enable all access for authenticated users" ON daily_productions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sales policies
CREATE POLICY "Enable all access for authenticated users" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily sales policies
CREATE POLICY "Enable all access for authenticated users" ON daily_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily purchases policies
CREATE POLICY "Enable all access for authenticated users" ON daily_purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notes policies
CREATE POLICY "Enable all access for authenticated users" ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);