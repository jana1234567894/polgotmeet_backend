# Railway Deployment Guide for PolyGlotMeet Backend

## 📦 Files to Upload to Railway

Upload **ONLY** these files from the `server/` directory:

```
server/
├── src/
│   ├── server.js
│   ├── routes/
│   │   ├── createMeeting.js
│   │   ├── joinMeeting.js
│   │   └── endMeeting.js
│   └── services/
│       ├── livekit.js
│       └── supabase.js
├── package.json
├── package-lock.json
└── .gitignore
```

**❌ DO NOT upload:**
- `.env` (Set variables in Railway dashboard)
- `node_modules/` (Railway installs automatically)
- Any frontend code

---

## 🚀 Railway Deployment Steps

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo" OR "Empty Project"
4. If using GitHub: Connect your `Menmozhi_Translator_Application` repo
5. If empty: You'll upload files manually

### Step 2: Set Environment Variables
In Railway Dashboard → Variables, add:

```
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
SUPABASE_URL=https://mccallekxuuadwtxqqyu.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**⚠️ Important:**
- Do NOT set `PORT` manually (Railway sets this automatically)
- Use `SUPABASE_SERVICE_KEY` not `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Configure Build Settings
Railway should auto-detect Node.js. Verify:
- **Build Command:** (leave empty, uses `npm install`)
- **Start Command:** `npm start`
- **Root Directory:** `server/` (if deploying from monorepo)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Railway will assign a public URL like: `https://your-app.up.railway.app`

### Step 5: Test Deployment
Open in browser:
```
https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "ok": true,
  "timestamp": "2025-12-14T01:17:56.000Z",
  "service": "PolyGlotMeet Backend"
}
```

---

## 🔧 Frontend Configuration

### Update `.env` in your frontend:

```env
VITE_SERVER_URL=https://your-app.up.railway.app
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

**Critical:** Replace `your-app` with your actual Railway domain.

### Rebuild APK
After updating `.env`:
```powershell
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

---

## ✅ Verification Checklist

- [ ] Railway service shows "RUNNING" (green)
- [ ] `/health` endpoint returns `{"ok": true}`
- [ ] No missing environment variable warnings in logs
- [ ] Frontend `.env` uses HTTPS Railway URL
- [ ] APK rebuilt after `.env` change
- [ ] "Create Meeting" works from Android app
- [ ] Users with same code join same room

---

## 🐛 Common Issues & Fixes

### Issue: "Application failed to respond"
**Fix:** Ensure `app.listen(PORT, '0.0.0.0')` - Railway requires `0.0.0.0`

### Issue: "Missing environment variables"
**Fix:** Double-check Railway Variables match exactly (case-sensitive)

### Issue: "Failed to fetch" from app
**Fix:** 
1. Verify frontend uses `https://` not `http://`
2. Check Railway URL is correct
3. Rebuild APK after changing `.env`

### Issue: CORS errors
**Fix:** Already handled with `origin: '*'` in updated server.js

---

## 📊 Monitoring

View logs in Railway:
- Dashboard → Your Service → Deployments → View Logs
- Look for: `✅ Backend Authority Server running on port XXXX`

---

## 🔒 Security Notes (Production)

For production deployment:
1. Tighten CORS to specific domains
2. Add rate limiting
3. Use HTTPS-only cookies
4. Enable Railway's built-in DDoS protection
