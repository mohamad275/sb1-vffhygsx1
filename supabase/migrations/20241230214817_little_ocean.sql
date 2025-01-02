-- Add trigger for archiving notes
CREATE OR REPLACE FUNCTION archive_notes() RETURNS trigger AS $$
BEGIN
  -- Archive the note before deletion
  INSERT INTO archived_notes (
    id,
    content,
    created_at
  ) VALUES (
    OLD.id,
    OLD.content,
    OLD.created_at
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to archive notes before deletion
CREATE TRIGGER archive_note_before_delete
  BEFORE DELETE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION archive_notes();

-- Add index for faster date filtering
CREATE INDEX IF NOT EXISTS idx_notes_created_at 
  ON notes (created_at);

-- Add index for archived notes
CREATE INDEX IF NOT EXISTS idx_archived_notes_created_at 
  ON archived_notes (created_at);