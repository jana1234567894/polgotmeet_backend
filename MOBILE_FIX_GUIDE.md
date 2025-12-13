# 🔧 Mobile App Fixed - Network Configuration

## ✅ What I Fixed

The "failed to fetch" error was happening because the mobile app was trying to connect to `localhost:3000`, which doesn't work on mobile devices.

### Changes Made:

**Before:**
```
VITE_SERVER_URL=http://localhost:3000
```

**After:**
```
VITE_SERVER_URL=http://10.244.213.82:3000
```

**Your Computer's IP:** `10.244.213.82`

---

## 📱 Next Steps to Get Mobile Working

### Step 1: Rebuild the APK

Since we updated the server URL, you need to rebuild the APK:

1. **In Android Studio:**
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete

2. **Or via command line:**
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```

### Step 2: Install New APK on Phone

1. **Uninstall the old app** from your phone (if installed)
2. **Copy the new APK** to your phone
   - Location: `android\app\build\outputs\apk\debug\app-debug.apk`
3. **Install the new APK**
4. **Open PolyGlotMeet**

### Step 3: Make Sure Phone is on Same WiFi

**IMPORTANT:** Your phone must be on the **same WiFi network** as your computer!

- Computer WiFi: Check your WiFi name
- Phone WiFi: Must match computer's WiFi

---

## 🔍 Verify Connection

### Test 1: Check if Phone Can Reach Server

On your phone's browser, try opening:
```
http://10.244.213.82:3000
```

- ✅ If you see a response → Server is reachable
- ❌ If timeout/error → Network issue (see troubleshooting)

### Test 2: Try Login Again

1. Open PolyGlotMeet app
2. Try to register or login
3. Should work now! ✅

---

## 🐛 Troubleshooting

### Issue: Still getting "failed to fetch"

**Check 1: Same WiFi Network**
- Computer and phone must be on same WiFi
- Check WiFi name on both devices

**Check 2: Firewall**
Your Windows Firewall might be blocking connections. Allow Node.js:

1. Open **Windows Defender Firewall**
2. Click **Allow an app through firewall**
3. Find **Node.js** and check both Private and Public
4. Click OK

**Or temporarily disable firewall to test:**
```powershell
# Run as Administrator
netsh advfirewall set allprofiles state off
```

**Re-enable after testing:**
```powershell
# Run as Administrator
netsh advfirewall set allprofiles state on
```

**Check 3: Server is Running**
Make sure the signaling server is still running:
- Check terminal with `npm run dev` in server folder
- Should show: "✅ Server running on port 3000"

**Check 4: Port 3000 is Open**
Test if port 3000 is accessible:

```powershell
# On your computer
netstat -an | findstr :3000
```

Should show: `0.0.0.0:3000` or `[::]:3000`

---

## 🌐 Alternative: Use ngrok (For Testing Over Internet)

If same WiFi doesn't work, use ngrok to expose your server:

### Step 1: Install ngrok
1. Download from: https://ngrok.com/download
2. Extract and place in a folder
3. Sign up for free account

### Step 2: Start ngrok
```powershell
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 3: Update .env
```
VITE_SERVER_URL=https://abc123.ngrok.io
```

### Step 4: Rebuild
```powershell
npm run build
npx cap sync android
```

Then rebuild APK in Android Studio.

**Advantage:** Works from anywhere, not just same WiFi!

---

## 📊 Current Configuration

**Supabase URL:** `https://mccallekxuuadwtxqqyu.supabase.co` ✅
- Works from anywhere (internet)

**Server URL:** `http://10.244.213.82:3000` ⚠️
- Only works on same WiFi network
- Computer IP: 10.244.213.82
- Port: 3000

**Gemini API:** Configured ✅
- Works from anywhere (internet)

---

## ✅ Checklist Before Testing

- [ ] Server is running (`npm run dev` in server folder)
- [ ] Phone and computer on same WiFi
- [ ] Firewall allows Node.js
- [ ] New APK built with updated server URL
- [ ] Old app uninstalled from phone
- [ ] New APK installed on phone

---

## 🎯 Quick Test

After installing new APK:

1. **Open app on phone**
2. **Try to register/login**
3. **Should work now!** ✅

If it works:
- ✅ Create a meeting on phone
- ✅ Join from computer
- ✅ Video call!

---

## 🔄 If Your IP Changes

Your computer's IP might change if you:
- Restart your router
- Reconnect to WiFi
- Switch networks

**If that happens:**

1. **Find new IP:**
   ```powershell
   ipconfig | findstr /i "IPv4"
   ```

2. **Update .env:**
   ```
   VITE_SERVER_URL=http://NEW_IP:3000
   ```

3. **Rebuild:**
   ```powershell
   npm run build
   npx cap sync android
   ```

4. **Rebuild APK** in Android Studio

---

## 🚀 For Production (Deploy Server)

To avoid IP changes and WiFi restrictions, deploy your server:

### Option 1: Railway (Free)
1. Go to https://railway.app
2. Deploy from GitHub
3. Get URL: `https://your-app.railway.app`

### Option 2: Render (Free)
1. Go to https://render.com
2. Deploy from GitHub
3. Get URL: `https://your-app.onrender.com`

### Option 3: Heroku
1. Go to https://heroku.com
2. Deploy from GitHub
3. Get URL: `https://your-app.herokuapp.com`

**Then update .env:**
```
VITE_SERVER_URL=https://your-deployed-server.com
```

**Rebuild and you're done!** Works from anywhere! 🌍

---

## 📱 Summary

**Problem:** Mobile app couldn't connect to `localhost:3000`

**Solution:** Changed to `http://10.244.213.82:3000`

**Next:** Rebuild APK and install on phone

**Requirements:** Phone and computer on same WiFi

**Alternative:** Use ngrok or deploy server for internet access

---

## 🎉 You're Almost There!

Just rebuild the APK with the new configuration and it should work! 🚀

Let me know if you still have issues after rebuilding!
