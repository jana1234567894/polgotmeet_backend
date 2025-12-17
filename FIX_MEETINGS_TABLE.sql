ALTER TABLE meetings ADD COLUMN IF NOT EXISTS meeting_id TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS password TEXT;
UPDATE meetings SET meeting_id = meeting_code WHERE meeting_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_id ON meetings(meeting_id);
