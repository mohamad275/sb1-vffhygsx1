/*
  # Daily Notes and Productions Implementation
  
  1. Changes
    - Drop existing tables safely
    - Create daily tracking tables
    - Add RLS policies
    - Add archiving functionality
    - Fix cron scheduling
*/

-- Drop existing tables if they exist
DO $$ 
BEGIN
    DROP TABLE IF EXISTS daily_notes_archive CASCADE;
    DROP TABLE IF EXISTS daily_productions_archive CASCADE;
    DROP TABLE IF EXISTS daily_notes CASCADE;
    DROP TABLE IF EXISTS daily_productions CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create daily notes table
CREATE TABLE IF NOT EXISTS daily_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create daily productions table
CREATE TABLE IF NOT EXISTS daily_productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES mixes(id) ON DELETE CASCADE,
  bag_size decimal NOT NULL CHECK (bag_size > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create archive tables
CREATE TABLE IF NOT EXISTS daily_notes_archive (
  id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_productions_archive (
  id uuid NOT NULL,
  mix_id uuid NOT NULL,
  bag_size decimal NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS daily_notes_created_at_idx ON daily_notes(created_at);
CREATE INDEX IF NOT EXISTS daily_productions_created_at_idx ON daily_productions(created_at);
CREATE INDEX IF NOT EXISTS daily_notes_archive_created_at_idx ON daily_notes_archive(created_at);
CREATE INDEX IF NOT EXISTS daily_productions_archive_created_at_idx ON daily_productions_archive(created_at);

-- Enable RLS
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_productions_archive ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    -- Daily Notes policies
    EXECUTE 'CREATE POLICY "Enable read access for all users" ON daily_notes FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Enable insert for all users" ON daily_notes FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Enable delete for all users" ON daily_notes FOR DELETE USING (true)';

    -- Daily Productions policies
    EXECUTE 'CREATE POLICY "Enable read access for all users" ON daily_productions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Enable insert for all users" ON daily_productions FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Enable delete for all users" ON daily_productions FOR DELETE USING (true)';

    -- Archive policies
    EXECUTE 'CREATE POLICY "Enable read access for all users" ON daily_notes_archive FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Enable read access for all users" ON daily_productions_archive FOR SELECT USING (true)';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create function to archive and reset daily data
CREATE OR REPLACE FUNCTION reset_daily_data()
RETURNS void AS $$
BEGIN
    -- Archive and reset notes
    INSERT INTO daily_notes_archive (id, content, created_at)
    SELECT id, content, created_at
    FROM daily_notes
    WHERE date_trunc('day', created_at) < date_trunc('day', now());
    
    DELETE FROM daily_notes
    WHERE date_trunc('day', created_at) < date_trunc('day', now());

    -- Archive and reset productions
    INSERT INTO daily_productions_archive (id, mix_id, bag_size, quantity, created_at)
    SELECT id, mix_id, bag_size, quantity, created_at
    FROM daily_productions
    WHERE date_trunc('day', created_at) < date_trunc('day', now());
    
    DELETE FROM daily_productions
    WHERE date_trunc('day', created_at) < date_trunc('day', now());
END;
$$ LANGUAGE plpgsql;

-- Create or replace cron job
DO $$
BEGIN
    -- Try to unschedule existing job if it exists
    PERFORM cron.unschedule('daily-data-reset');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Schedule new cron job
SELECT cron.schedule(
    'daily-data-reset',           -- job name
    '0 0 * * *',                 -- run at midnight
    'SELECT reset_daily_data()'   -- SQL command
);