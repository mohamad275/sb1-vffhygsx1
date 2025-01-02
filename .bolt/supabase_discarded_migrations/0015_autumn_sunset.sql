/*
  # Add Email Recipients Table
  
  1. New Tables
    - `email_recipients`
      - `id` (uuid, primary key) 
      - `email` (text, unique)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE email_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON email_recipients FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON email_recipients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON email_recipients FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON email_recipients FOR DELETE
USING (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_email_recipients_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp
CREATE TRIGGER update_email_recipients_timestamp
  BEFORE UPDATE ON email_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_email_recipients_updated_at();