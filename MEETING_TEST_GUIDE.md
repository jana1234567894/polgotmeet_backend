# 🎥 Meeting Creation & Testing Guide

## ✅ Current Status

All systems are ready for testing:
- ✅ Web app running at: http://localhost:5173
- ✅ Signaling server running at: http://localhost:3000
- ✅ Supabase database configured
- ✅ Authentication working
- ✅ Meeting creation enabled

---

## 📋 How to Test Meeting Creation (Like Google Meet)

### Step 1: Create a Meeting

1. **Log in to the app**
   - Go to: http://localhost:5173/login
   - Use your registered credentials

2. **Create a new meeting**
   - Click on the **"Create Meeting"** card on the dashboard
   - A modal will appear with:
     - **Meeting ID** (e.g., `ABC123XYZ`)
     - **Password** (e.g., `DEF456`)
   - Copy these credentials

3. **Start the meeting**
   - Click **"Start Meeting"** button
   - Allow camera and microphone permissions when prompted
   - You'll enter the meeting room

---

### Step 2: Join from Another Device/Browser

To test like a real meeting with multiple participants:

#### Option A: Use Another Browser
1. Open a different browser (e.g., if you used Chrome, open Firefox/Edge)
2. Go to: http://localhost:5173
3. Log in with a different account (or create a new one)
4. Click **"Join Meeting"** on the dashboard
5. Enter the Meeting ID and Password you copied earlier
6. Click **"Join Meeting"**

#### Option B: Use Incognito/Private Window
1. Open an incognito/private window in the same browser
2. Go to: http://localhost:5173
3. Create a new account or log in
4. Join the meeting using the Meeting ID and Password

#### Option C: Use Your Phone (After Building APK)
1. Build and install the APK on your phone (see BUILD_APK_GUIDE.md)
2. Open the app and log in
3. Join the meeting using the Meeting ID and Password

---

## 🎯 Features to Test

### 1. Video Conferencing
- ✅ Local video feed appears
- ✅ Remote participant video appears when they join
- ✅ Multiple participants can join (grid layout adjusts automatically)

### 2. Audio Controls
- ✅ Mute/Unmute microphone
- ✅ Turn camera on/off
- ✅ Audio from remote participants

### 3. Real-time Translation
- ✅ Live speech-to-text transcription
- ✅ Select translation language (16+ languages supported)
- ✅ See transcripts from all participants
- ✅ Translated text appears below original text

### 4. Meeting Controls
- ✅ Leave meeting
- ✅ Toggle transcripts sidebar
- ✅ Settings panel
- ✅ Participant count display

---

## 🌐 Supported Languages for Translation

The app supports real-time translation to:
- English, Spanish, French, German, Italian, Portuguese
- Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati
- Chinese, Japanese, Korean, Arabic, Russian

---

## 🔧 Testing Checklist

### Basic Functionality
- [ ] Create a meeting successfully
- [ ] Meeting ID and Password are generated
- [ ] Copy Meeting ID and Password to clipboard
- [ ] Start meeting and see your own video
- [ ] Microphone and camera permissions granted

### Multi-User Testing
- [ ] Second user can join with Meeting ID and Password
- [ ] Both users can see each other's video
- [ ] Both users can hear each other's audio
- [ ] Mute/unmute works for both users
- [ ] Video on/off works for both users

### Translation Features
- [ ] Speech is transcribed in real-time
- [ ] Transcripts appear in the sidebar
- [ ] Change translation language
- [ ] Translated text appears correctly
- [ ] Transcripts scroll automatically

### Meeting Management
- [ ] Leave meeting works
- [ ] Other participants see when someone leaves
- [ ] Meeting can be rejoined with same credentials
- [ ] Invalid Meeting ID/Password is rejected

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to join meeting"
**Solution:** 
- Make sure the signaling server is running (`npm run dev` in server folder)
- Check that VITE_SERVER_URL in .env is `http://localhost:3000`

### Issue: "Camera/Microphone not working"
**Solution:**
- Grant permissions when browser asks
- Check browser settings (chrome://settings/content/camera)
- Make sure no other app is using camera/microphone

### Issue: "Can't see other participant's video"
**Solution:**
- Both users must be on the same network or use TURN servers for NAT traversal
- Check browser console for WebRTC errors
- Make sure both users have camera/microphone permissions

### Issue: "Translation not working"
**Solution:**
- Check that VITE_GEMINI_API_KEY is set in .env
- Make sure you have internet connection
- Check browser console for API errors

### Issue: "Transcripts not appearing"
**Solution:**
- Speech recognition only works in Chrome/Edge (uses Web Speech API)
- Make sure microphone is not muted
- Speak clearly and wait for final transcript

---

## 📱 Testing on Mobile

After building the APK:

1. **Install the app** on your Android phone
2. **Connect to the same WiFi** as your computer (for local testing)
3. **Update server URL** if needed:
   - If testing locally, use your computer's local IP
   - Example: `http://192.168.1.100:3000`
4. **Create or join a meeting**
5. **Test all features** (video, audio, translation)

---

## 🚀 Production Deployment Notes

For production use, you'll need:

1. **Deploy Signaling Server**
   - Use services like Heroku, Railway, or DigitalOcean
   - Update VITE_SERVER_URL to your deployed server URL

2. **TURN Servers** (for NAT traversal)
   - Use services like Twilio, Xirsys, or self-hosted coturn
   - Add TURN server configuration to WebRTC service

3. **HTTPS** (required for camera/microphone)
   - Deploy web app to Vercel, Netlify, or similar
   - Ensure SSL certificate is valid

4. **Supabase** (already configured)
   - Your Supabase project is production-ready
   - Consider upgrading plan for more users

---

## 🎉 Success Criteria

Your meeting system works correctly if:
- ✅ You can create a meeting and get credentials
- ✅ Another user can join using those credentials
- ✅ Both users can see and hear each other
- ✅ Transcripts appear in real-time
- ✅ Translation works for selected language
- ✅ Controls (mute, video off, leave) work properly

---

## 📞 Example Test Scenario

**Scenario:** Host creates a meeting, participant joins

1. **Host (Browser 1):**
   - Log in → Create Meeting → Copy credentials → Start Meeting
   - See own video feed
   - Wait for participant

2. **Participant (Browser 2 / Phone):**
   - Log in → Join Meeting → Enter ID and Password → Join
   - See own video and host's video

3. **Both Users:**
   - Speak and see transcripts appear
   - Change translation language
   - Test mute/unmute
   - Test video on/off
   - Leave meeting

---

## 🔗 Quick Links

- **Web App:** http://localhost:5173
- **Dashboard:** http://localhost:5173/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/mccallekxuuadwtxqqyu
- **Server Status:** Check terminal running `npm run dev` in server folder

---

## 💡 Tips for Best Experience

1. **Use headphones** to avoid echo/feedback
2. **Good lighting** for better video quality
3. **Stable internet** for smooth video/audio
4. **Chrome or Edge** for best compatibility
5. **Allow permissions** immediately when prompted

---

Happy testing! 🎉 Your PolyGlotMeet is ready to use just like Google Meet!
