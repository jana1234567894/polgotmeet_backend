# ✅ Supabase Schema Verification & Fix

## 🔍 Current Status

You mentioned steps 1-4 are done. Let me verify your Supabase table is correct.

## 📋 Quick Verification

### Go to Supabase → SQL Editor and run:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'meetings'
ORDER BY ordinal_position;
```

### ✅ Expected Columns:

You should see these **exact** columns:

| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| meeting_id | text | NO |
| password | text | YES |
| livekit_room | text | NO |
| host_id | text | YES |
| is_active | boolean | YES |
| created_at | timestamp with time zone | YES |
| expires_at | timestamp with time zone | YES |

---

## 🚨 If `livekit_room` is Missing

Run this SQL to add it:

```sql
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS livekit_room TEXT NOT NULL DEFAULT '';

-- Make it required (remove default after adding)
ALTER TABLE meetings 
ALTER COLUMN livekit_room DROP DEFAULT;
```

---

## 🔧 Alternative: Recreate Table from Scratch

If you want a clean slate:

```sql
-- Drop old table
DROP TABLE IF EXISTS meetings CASCADE;

-- Create new table with correct schema
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE,
  password TEXT,
  livekit_room TEXT NOT NULL,
  host_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Add indexes for performance
CREATE INDEX idx_meeting_id ON meetings(meeting_id);
CREATE INDEX idx_livekit_room ON meetings(livekit_room);
CREATE INDEX idx_active_meetings ON meetings(is_active) WHERE is_active = true;
```

---

## 🎯 After Fixing Schema

1. **Redeploy Backend** (Railway auto-deploys from Git)
2. **Test Create Meeting** - Should work now
3. **Check Railway Logs** - Should show success messages

---

## 📊 Test Query

After fixing, test with:

```sql
-- Insert test meeting
INSERT INTO meetings (meeting_id, password, livekit_room, host_id)
VALUES ('TEST-123', 'pass123', 'room_test_abc', 'user_test');

-- Verify it worked
SELECT * FROM meetings WHERE meeting_id = 'TEST-123';

-- Clean up test
DELETE FROM meetings WHERE meeting_id = 'TEST-123';
```

If this works, your schema is correct! ✅
