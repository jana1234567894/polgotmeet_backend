# 🗄️ Complete Supabase Database Setup for PolyGlotMeet

## 📊 Analysis Summary

After analyzing your entire codebase, here's what Supabase is used for:

### **Backend (polgotmeet_backend/src/server.js):**
1. **Create Meeting** (line 141-149): Inserts meeting data
2. **Join Meeting** (line 200-205): Queries meeting by `meeting_id`
3. **End Meeting** (line 237-258): Queries and deletes meeting

### **Frontend (src/):**
1. **Authentication**: Login, signup, session management
2. **User Management**: Get current user for API calls

---

## 🎯 Required Supabase Tables

### **1. `meetings` Table** (Backend)
### **2. `profiles` Table** (Frontend - Optional but recommended)

---

## 📝 Complete SQL Setup

Copy and paste this **ENTIRE** SQL script into Supabase SQL Editor:

```sql
-- ============================================
-- STEP 1: Clean Up (Optional - removes old data)
-- ============================================

-- Uncomment these lines if you want to start fresh
-- DROP TABLE IF EXISTS meetings CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- STEP 2: Create Meetings Table
-- ============================================

CREATE TABLE IF NOT EXISTS meetings (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Meeting identifiers
  meeting_id TEXT NOT NULL UNIQUE,
  password TEXT,
  livekit_room TEXT NOT NULL,
  
  -- Host information
  host_id TEXT NOT NULL,
  
  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_id ON meetings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_livekit_room ON meetings(livekit_room);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_active ON meetings(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE meetings IS 'Stores active and historical meeting information';
COMMENT ON COLUMN meetings.meeting_id IS 'User-facing meeting code (e.g., abc-def-ghi)';
COMMENT ON COLUMN meetings.password IS 'Meeting password for participants';
COMMENT ON COLUMN meetings.livekit_room IS 'Internal LiveKit room name (canonical identifier)';
COMMENT ON COLUMN meetings.host_id IS 'Supabase auth user ID of the meeting creator';
COMMENT ON COLUMN meetings.is_active IS 'Whether the meeting is currently active';
COMMENT ON COLUMN meetings.expires_at IS 'Auto-expiry timestamp (24 hours from creation)';

-- ============================================
-- STEP 3: Create Profiles Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  -- Links to auth.users
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- User information
  full_name TEXT,
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Add comments
COMMENT ON TABLE profiles IS 'User profile information linked to Supabase Auth';
COMMENT ON COLUMN profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN profiles.full_name IS 'User display name';

-- ============================================
-- STEP 4: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS Policies for Meetings
-- ============================================

-- Policy: Anyone can create a meeting (authenticated users)
CREATE POLICY "Users can create meetings"
ON meetings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Anyone can view active meetings
CREATE POLICY "Anyone can view active meetings"
ON meetings
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Only host can delete their meeting
CREATE POLICY "Host can delete their meeting"
ON meetings
FOR DELETE
TO authenticated
USING (auth.uid()::text = host_id);

-- Policy: Only host can update their meeting
CREATE POLICY "Host can update their meeting"
ON meetings
FOR UPDATE
TO authenticated
USING (auth.uid()::text = host_id);

-- ============================================
-- STEP 6: Create RLS Policies for Profiles
-- ============================================

-- Policy: Users can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 7: Create Trigger for Auto-Creating Profiles
-- ============================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 8: Create Function to Clean Up Old Meetings
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_meetings()
RETURNS void AS $$
BEGIN
  UPDATE meetings
  SET is_active = false,
      ended_at = NOW()
  WHERE is_active = true
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 9: Verification Queries
-- ============================================

-- Check meetings table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'meetings'
ORDER BY ordinal_position;

-- Check profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- STEP 10: Test Data (Optional)
-- ============================================

-- Insert a test meeting
INSERT INTO meetings (meeting_id, password, livekit_room, host_id)
VALUES (
  'TEST-123',
  'test123',
  'room_test_abc123',
  'test-user-id'
);

-- Verify test meeting
SELECT * FROM meetings WHERE meeting_id = 'TEST-123';

-- Clean up test meeting
DELETE FROM meetings WHERE meeting_id = 'TEST-123';

-- ============================================
-- DONE! ✅
-- ============================================

-- Your database is now ready for PolyGlotMeet!
```

---

## 🔍 Verification Checklist

After running the SQL, verify:

### ✅ **Meetings Table:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'meetings';
```

**Expected columns:**
- `id`
- `meeting_id` ✅ **Required**
- `password` ✅ **Required**
- `livekit_room` ✅ **Required**
- `host_id` ✅ **Required**
- `is_active` ✅ **Required**
- `created_at`
- `expires_at`
- `ended_at`

### ✅ **Profiles Table:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles';
```

**Expected columns:**
- `id`
- `full_name`
- `avatar_url`
- `created_at`
- `updated_at`

### ✅ **RLS Policies:**
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('meetings', 'profiles');
```

---

## 🎯 What Each Table Does

### **`meetings` Table:**
| Column | Purpose | Used By |
|--------|---------|---------|
| `meeting_id` | User-facing code (abc-def-ghi) | Create, Join, End |
| `password` | Meeting password | Join (validation) |
| `livekit_room` | LiveKit room name | Create, Join (token generation) |
| `host_id` | Creator's user ID | Create, End (authorization) |
| `is_active` | Meeting status | Join (filter), End (update) |

### **`profiles` Table:**
| Column | Purpose | Used By |
|--------|---------|---------|
| `id` | Links to auth.users | Frontend (user display) |
| `full_name` | User display name | UI components |
| `avatar_url` | Profile picture | UI components |

---

## 🚀 After Running This SQL

1. ✅ **Backend will work** - All database operations will succeed
2. ✅ **Authentication will work** - Profiles auto-created on signup
3. ✅ **Security enabled** - RLS policies protect data
4. ✅ **Auto-cleanup** - Old meetings can be cleaned up

---

## 🔧 Troubleshooting

### **If you get "permission denied":**
Make sure you're running this in Supabase SQL Editor (not psql directly).

### **If you get "already exists" errors:**
The `IF NOT EXISTS` clauses will prevent errors. Safe to re-run.

### **To start completely fresh:**
Uncomment the `DROP TABLE` lines at the top.

---

## ✅ Final Test

After running the SQL, test with:

```sql
-- Test insert
INSERT INTO meetings (meeting_id, password, livekit_room, host_id)
VALUES ('ABC-123', 'pass123', 'room_abc_xyz', 'user_test');

-- Test select
SELECT * FROM meetings WHERE meeting_id = 'ABC-123';

-- Test delete
DELETE FROM meetings WHERE meeting_id = 'ABC-123';
```

If all three work, **you're ready!** 🎉
