# 🎥 Browser Camera/Microphone Permission Fix

## ❌ Problem:

Laptop browser la meeting join pannumbodhu:
```
Failed to join meeting. Please check your camera and microphone permissions.
```

Mobile la work aagudhu, aana browser la permissions block aagiruchu.

---

## ✅ Solution - Browser Permissions Allow Pannu:

### Chrome/Edge:

#### Method 1: URL Bar La (Quick Fix)

1. Browser address bar la **camera icon** 🎥 paaru (left side)
2. Click pannu
3. **Camera** → **Allow**
4. **Microphone** → **Allow**
5. Page reload pannu (F5)

#### Method 2: Site Settings

1. Address bar la **lock icon** 🔒 click pannu
2. **Site settings** click pannu
3. **Camera** → **Allow**
4. **Microphone** → **Allow**
5. Page reload pannu

#### Method 3: Chrome Settings

1. Chrome settings ku po: `chrome://settings/content`
2. **Camera** click pannu
   - Check: "Sites can ask to use your camera"
   - **Allowed** list la `http://10.244.213.82:5173` add pannu
3. **Microphone** click pannu
   - Check: "Sites can ask to use your microphone"
   - **Allowed** list la `http://10.244.213.82:5173` add pannu
4. Page reload pannu

---

### Firefox:

1. Address bar la **camera icon** click pannu
2. **Permissions** → **Camera** → **Allow**
3. **Permissions** → **Microphone** → **Allow**
4. Page reload pannu

---

## 🔧 If Permissions Blocked:

### Reset Site Permissions:

#### Chrome:
1. Go to: `chrome://settings/content/siteDetails?site=http://10.244.213.82:5173`
2. **Camera** → **Allow**
3. **Microphone** → **Allow**
4. **Clear data** (if needed)
5. Reload page

#### Edge:
1. Go to: `edge://settings/content/siteDetails?site=http://10.244.213.82:5173`
2. Same as Chrome

---

## 🎯 Quick Test:

### Test Camera/Mic Access:

1. Browser la po: http://10.244.213.82:5173
2. Login pannu
3. Meeting create pannu
4. **Start Meeting** click pannu
5. **Popup varum:**
   - "Allow http://10.244.213.82:5173 to use your camera and microphone?"
   - **Allow** click pannu
6. ✅ Camera/mic work aagum!

---

## 🐛 Common Issues:

### Issue 1: Popup Vaala

**Reason:** Already blocked irukkalam

**Fix:**
1. Address bar la camera icon paaru
2. "Blocked" nu irundhaa click pannu
3. "Allow" ku change pannu
4. Reload pannu

### Issue 2: Camera Already in Use

**Reason:** Another app/tab use pannuthu

**Fix:**
1. Other apps close pannu (Zoom, Teams, etc.)
2. Other browser tabs close pannu
3. Try again

### Issue 3: No Camera/Mic Detected

**Reason:** Hardware issue

**Fix:**
1. Device Manager la check pannu
2. Camera/mic properly connected ah paaru
3. Drivers update pannu

---

## 📱 Why Mobile Works but Browser Doesn't?

**Mobile App:**
- Android permissions use pannuthu
- App install pannumbodhu permissions kekum
- System level permissions

**Browser:**
- Browser permissions use pannuthu
- Each site ku separate permissions
- User manually allow pannanum

---

## ✅ Step-by-Step Fix:

1. **Browser open pannu:** http://10.244.213.82:5173
2. **Login pannu**
3. **Meeting create pannu**
4. **Start Meeting click pannu**
5. **Permission popup varum** → **Allow** pannu
6. **Illa na:**
   - Address bar la camera icon click pannu
   - Allow pannu
   - Page reload pannu
7. ✅ **Work aagum!**

---

## 🎥 Browser Permissions Checklist:

- [ ] Camera permission allowed?
- [ ] Microphone permission allowed?
- [ ] Other apps camera use pannala?
- [ ] Browser updated ah?
- [ ] HTTPS illa HTTP? (HTTP ku kooda work aagum local la)

---

## 🚀 Quick Commands:

### Chrome Camera Settings:
```
chrome://settings/content/camera
```

### Chrome Microphone Settings:
```
chrome://settings/content/microphone
```

### Site Specific Settings:
```
chrome://settings/content/siteDetails?site=http://10.244.213.82:5173
```

---

## 💡 Pro Tip:

**Always Allow for This Site:**
- Permission popup la "Remember this decision" check pannu
- Aprom automatic ah allow aagum
- Every time kekadhu

---

## 🎉 Summary:

**Problem:** Browser la camera/mic permissions illa  
**Reason:** Browser block pannirukku  
**Fix:** Address bar la camera icon → Allow pannu  
**Result:** Meeting join aagum, video/audio work aagum!

---

**Browser address bar la camera icon paaru, allow pannu, reload pannu. Aprom work aagum da!** 🎥🎤

Meeting start pannu! 😊
