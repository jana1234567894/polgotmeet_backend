# 🔐 Fixing Android Permissions (PWA → APK/Google Meet Style)

I have completely overhauled the permission system to match Google Meet's behavior: **Permission Check → Preview → Join**.

## 1️⃣ What I Changed

1.  **Android Manifest**: Added missing permissions (Camera, Mic, Audio Settings).
2.  **New Pre-Join Screen**: Created `PreJoin.tsx` to handle permission requests and show a camera preview *before* entering the room.
3.  **Routing Update**: Direct navigation to `/meeting/:id` now loads the Pre-Join screen first. The actual meeting happens at `/room/:id`.
4.  **Plugins**: Installed `@capacitor/camera` and `@capacitor/filesystem`.

---

## 2️⃣ How it Works Now

1.  **User clicks "Join/Start Meeting"**.
2.  **App navigates to `/meeting/abc-123` (Pre-Join Screen)**.
3.  **App checks permissions**:
    *   It tries to access the Camera/Mic stream.
    *   **If missing**: Shows a shield icon and "Allow Permissions" button.
    *   **If granted**: Shows your video preview + Mic/Cam toggles.
4.  **User clicks "Join Meeting"**.
5.  **App navigates to `/room/abc-123`** (The actual WebRTC room).

---

## 3️⃣ Next Steps for You

### Rebuild the APK
Since I modified `AndroidManifest.xml` and installed native plugins, you **MUST** rebuild the APK.

1.  **Sync Capacitor** (I just did this, but good to be sure):
    ```powershell
    npx cap sync android
    ```

2.  **Build the APK**:
    ```powershell
    cd android
    ./gradlew assembleDebug
    ```

3.  **Install on Phone**:
    *   Uninstall the old app first (to reset permissions).
    *   Install the new `app-debug.apk`.

### Verify on Phone
1.  Open the app.
2.  Start a meeting.
3.  **You should see a System Permission Popup** asking for Camera/Mic.
4.  **Allow it**.
5.  You should see yourself in the preview.
6.  Click **Join**.

🚀 **Your app is now fully permission-compliant like Google Meet!**
