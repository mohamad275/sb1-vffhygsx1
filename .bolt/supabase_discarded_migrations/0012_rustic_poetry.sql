/*
  # Fix Notes Implementation
  
  1. Changes
    - Drop old notes table
    - Create new notes table with proper structure
    - Add RLS policies
    - Add indexes for better performance
*/

-- Drop old table if exists
DROP TABLE IF EXISTS notes CASCADE;

-- Create new notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX notes_created_at_idx ON notes(created_at);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON notes FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON notes FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON notes FOR DELETE
USING (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp
CREATE TRIGGER update_notes_timestamp
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();