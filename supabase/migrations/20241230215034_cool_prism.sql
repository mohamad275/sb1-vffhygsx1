-- Create daily_notes table
CREATE TABLE IF NOT EXISTS daily_notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable all access for authenticated users" ON daily_notes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add function to move notes to archive
CREATE OR REPLACE FUNCTION archive_daily_notes() RETURNS void AS $$
BEGIN
    -- Move notes to archive
    INSERT INTO archived_notes (id, content, created_at)
    SELECT id, content, created_at
    FROM daily_notes
    WHERE created_at < CURRENT_DATE;

    -- Delete old notes
    DELETE FROM daily_notes WHERE created_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;