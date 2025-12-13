-- PolyGlotMeet Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can create meetings" ON meetings;
DROP POLICY IF EXISTS "Users can view active meetings" ON meetings;
DROP POLICY IF EXISTS "Hosts can update their meetings" ON meetings;

-- Create policies
CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can view active meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Hosts can update their meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_id ON meetings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_is_active ON meetings(is_active);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
END $$;
