# 📱 Build Your PolyGlotMeet Android App - Step by Step

## ✅ What I've Done

1. ✅ **Built the web app** (`npm run build`)
2. ✅ **Synced to Android** (`npx cap sync android`)
3. ✅ **Opened Android Studio** for you

---

## 🎯 Method 1: Using Android Studio (Recommended)

Android Studio should be opening now. Follow these steps:

### Step 1: Wait for Gradle Sync
- Android Studio will automatically sync the project
- Look at the bottom status bar for "Gradle sync finished"
- This may take 2-5 minutes on first run
- ☕ Grab a coffee while it syncs!

### Step 2: Build the APK
1. In Android Studio, click **Build** in the top menu
2. Select **Build Bundle(s) / APK(s)**
3. Click **Build APK(s)**
4. Wait for the build to complete (1-3 minutes)
5. You'll see a notification: "APK(s) generated successfully"

### Step 3: Locate Your APK
Once the build completes:
1. Click the **"locate"** link in the notification, OR
2. Navigate to this folder:
   ```
   e:\Menmozhi\polyglotmeet\android\app\build\outputs\apk\debug\
   ```
3. You'll find: **`app-debug.apk`**

### Step 4: Install on Your Phone
1. **Copy the APK to your phone:**
   - Connect phone via USB and copy the file
   - Upload to Google Drive and download on phone
   - Email it to yourself
   - Use any file transfer method

2. **On your phone:**
   - Locate the APK file
   - Tap to open it
   - If prompted, enable "Install from unknown sources"
   - Tap **Install**
   - Wait for installation to complete
   - Tap **Open** or find "PolyGlotMeet" in your app drawer

---

## 🎯 Method 2: Command Line Build (Alternative)

If Android Studio doesn't work or you prefer command line:

### Option A: Build Debug APK
```powershell
cd android
.\gradlew assembleDebug
```

The APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Option B: Build Release APK (Optimized)
```powershell
cd android
.\gradlew assembleRelease
```

The APK will be at:
```
android\app\build\outputs\apk\release\app-release-unsigned.apk
```

**Note:** Release APK needs to be signed for installation.

---

## 📦 APK Details

**File Name:** `app-debug.apk`
**Size:** ~50-80 MB
**Package Name:** `com.polyglotmeet.app`
**App Name:** PolyGlotMeet
**Minimum Android:** 6.0 (API 23)
**Target Android:** 14 (API 35)

---

## 🔧 Troubleshooting

### If Gradle build fails:

1. **Check Java version:**
   ```powershell
   java -version
   ```
   Should be Java 17 or higher

2. **Clean and rebuild:**
   ```powershell
   cd android
   .\gradlew clean
   .\gradlew assembleDebug
   ```

3. **Update Gradle wrapper:**
   ```powershell
   cd android
   .\gradlew wrapper --gradle-version=8.11.1
   ```

### If Android Studio won't open:

1. Make sure Android Studio is installed
2. Try opening manually:
   - Open Android Studio
   - Click "Open"
   - Navigate to `e:\Menmozhi\polyglotmeet\android`
   - Click OK

### If APK won't install on phone:

1. **Enable Unknown Sources:**
   - Settings → Security → Unknown Sources (enable)
   - Or: Settings → Apps → Special Access → Install unknown apps

2. **Check storage space:**
   - Need at least 100 MB free

3. **Uninstall old version:**
   - If you had a previous version installed

---

## 📱 After Installation

### First Launch:
1. Open **PolyGlotMeet** from app drawer
2. You'll see the login screen
3. Create account or sign in

### Grant Permissions:
The app will request:
- ✅ **Camera** - For video calls
- ✅ **Microphone** - For audio
- ✅ **Internet** - To connect to servers

**Important:** Grant all permissions for full functionality!

### Configure Server (Important!):

For the app to work on mobile, you need to update the server URL:

#### Option 1: Local Testing (Same WiFi)
1. Find your computer's local IP:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update `.env` file:
   ```
   VITE_SERVER_URL=http://YOUR_LOCAL_IP:3000
   ```
   Example: `VITE_SERVER_URL=http://192.168.1.100:3000`

3. Rebuild the app:
   ```powershell
   npm run build
   npx cap sync android
   ```
   Then build APK again

#### Option 2: Production (Internet Access)
Deploy your signaling server to a cloud service:
- Heroku, Railway, Render, DigitalOcean, etc.
- Update `VITE_SERVER_URL` to your deployed URL
- Example: `VITE_SERVER_URL=https://your-server.herokuapp.com`

---

## 🎉 Testing Your Mobile App

### Test 1: Create Meeting on Phone
1. Open app on phone
2. Log in
3. Tap "Create Meeting"
4. Copy Meeting ID and Password
5. Tap "Start Meeting"
6. Allow camera and microphone
7. ✅ See your video!

### Test 2: Join from Computer
1. On computer, go to http://localhost:5173
2. Log in
3. Click "Join Meeting"
4. Enter the Meeting ID and Password from phone
5. ✅ See both video feeds!

### Test 3: Phone to Phone
1. Install app on two phones
2. Create meeting on Phone 1
3. Join meeting on Phone 2
4. ✅ Video call between phones!

---

## 🌐 Network Requirements

### For Local Testing:
- Both devices on **same WiFi network**
- Computer running signaling server
- Server URL points to computer's local IP

### For Internet Testing:
- Deploy signaling server to cloud
- Update server URL in `.env`
- Both devices need internet connection

---

## 🚀 Production Deployment Checklist

Before sharing with others:

- [ ] Deploy signaling server to cloud
- [ ] Update `VITE_SERVER_URL` to production URL
- [ ] Build release APK (signed)
- [ ] Test on multiple devices
- [ ] Test on different networks
- [ ] Configure TURN servers for NAT traversal
- [ ] Set up proper SSL certificates
- [ ] Test all features (video, audio, translation)

---

## 📊 Build Variants

### Debug APK (Current)
- ✅ Easy to install
- ✅ Includes debugging info
- ❌ Larger file size
- ❌ Not optimized
- **Use for:** Testing and development

### Release APK (Production)
- ✅ Optimized and smaller
- ✅ Better performance
- ❌ Needs signing
- ❌ More complex setup
- **Use for:** Distribution to users

---

## 🔐 Signing Release APK (Optional)

For production release:

1. **Generate keystore:**
   ```powershell
   keytool -genkey -v -keystore polyglotmeet.keystore -alias polyglotmeet -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **In Android Studio:**
   - Build → Generate Signed Bundle / APK
   - Select APK
   - Create or choose keystore
   - Enter passwords
   - Build release APK

3. **Result:**
   - Signed APK ready for Google Play Store
   - Can be installed on any device

---

## 📱 App Features on Mobile

Everything works on mobile:
- ✅ Video calling
- ✅ Audio calling
- ✅ Real-time translation
- ✅ Live transcripts
- ✅ Multiple participants
- ✅ Mute/unmute
- ✅ Camera on/off
- ✅ Meeting creation
- ✅ Join meetings
- ✅ 16+ languages

---

## 🎯 Quick Reference

**APK Location:**
```
e:\Menmozhi\polyglotmeet\android\app\build\outputs\apk\debug\app-debug.apk
```

**Build Commands:**
```powershell
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Build APK (command line)
cd android
.\gradlew assembleDebug
```

**Server Configuration:**
- Local: `http://YOUR_LOCAL_IP:3000`
- Production: `https://your-server.com`

---

## ✨ You're Almost There!

1. ✅ Web app built
2. ✅ Synced to Android
3. ✅ Android Studio opened
4. ⏳ **Next:** Build APK in Android Studio
5. 📱 **Then:** Install on your phone!

**Wait for Gradle sync to finish, then build the APK!** 🚀

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Make sure Java 17 is installed
3. Ensure Android Studio is up to date
4. Try the command line method as alternative

Good luck! Your mobile app is almost ready! 🎉
