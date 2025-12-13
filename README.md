# PolyGlotMeet - Video Conferencing with Real-time Translation

A modern video conferencing application with real-time multi-language translation powered by Google Gemini AI.

## ✨ Features

- 🔐 **Email Authentication** - Secure login with Supabase magic links
- 📹 **HD Video Conferencing** - WebRTC-based peer-to-peer video calls
- 🌍 **Real-time Translation** - Translate conversations to 16+ languages using Gemini AI
- 📝 **Live Transcription** - Automatic speech-to-text in English
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations
- 🔒 **Secure Meetings** - Password-protected meeting rooms
- 👥 **Multi-party Support** - Connect with multiple participants

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (already configured)
- Google Gemini API key

### 1. Setup Environment Variables

Copy `.env.example` to `.env.local` and add your Gemini API key:

```bash
# Already configured:
VITE_SUPABASE_URL=https://tmdppjcxmbcbdbdyerci.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add your Gemini API key:
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Server URL (default):
VITE_SERVER_URL=http://localhost:3000
```

### 2. Setup Supabase Database

Run this SQL in your Supabase SQL editor:

```sql
-- Create meetings table
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  host_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view active meetings"
  ON meetings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Host can update their meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = host_id);
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 4. Run the Application

**Terminal 1 - Start the signaling server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start the frontend:**
```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

## 📖 How to Use

### 1. **Login**
- Open the app and enter your email
- Check your email for the magic link
- Click the link to sign in

### 2. **Create a Meeting**
- Click "Create Meeting" on the dashboard
- Share the Meeting ID and Password with participants
- Click "Start Meeting" to join

### 3. **Join a Meeting**
- Click "Join Meeting" on the dashboard
- Enter the Meeting ID and Password
- Click "Join" to connect

### 4. **During the Meeting**
- **Toggle Audio/Video**: Use the microphone and camera buttons
- **View Transcripts**: Click the message icon to show/hide live transcripts
- **Change Language**: Select your preferred translation language from the dropdown
- **Leave Meeting**: Click the red phone icon to exit

## 🌍 Supported Languages

- English, Spanish, French, German, Italian
- Portuguese, Russian, Japanese, Korean, Chinese
- Arabic, Hindi, Bengali, Tamil, Telugu, Marathi

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Database**: Supabase (PostgreSQL)
- **Video**: WebRTC
- **Translation**: Google Gemini AI
- **Transcription**: Web Speech API
- **Styling**: Custom CSS with Tailwind-like utilities

## 📁 Project Structure

```
polyglotmeet/
├── src/
│   ├── pages/
│   │   ├── Login.tsx          # Authentication page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   └── Meeting.tsx        # Video conference room
│   ├── services/
│   │   ├── supabase.ts        # Database & auth
│   │   ├── webrtc.ts          # Video conferencing
│   │   └── gemini.ts          # AI translation
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Styles
├── server/
│   └── src/
│       └── index.ts           # Signaling server
├── .env.local                 # Environment variables
└── package.json
```

## 🔧 Troubleshooting

### Camera/Microphone Not Working
- Ensure you've granted browser permissions
- Check if another app is using your camera
- Try using HTTPS (required for some browsers)

### Translation Not Working
- Verify your Gemini API key is correct in `.env.local`
- Check browser console for errors
- Ensure you have internet connectivity

### Can't Connect to Meeting
- Verify the server is running on port 3000
- Check that Meeting ID and Password are correct
- Ensure both participants are on the same network or use TURN servers for production

## 📝 Notes

- This is a development build. For production, you'll need:
  - HTTPS certificates
  - TURN servers for NAT traversal
  - Production-grade Supabase configuration
  - Rate limiting and security measures

## 🎯 Next Steps

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. Run the app and start your first meeting!

---

**Enjoy your multilingual video conferences! 🎉**
