# 📱 How to Build the APK

I have already prepared your project for the build. The web assets are built and synced to the Android project.

Since I cannot access the full Android build environment directly, you need to run the final command to generate the APK file.

## 🛠️ Option 1: Build via Terminal (Fastest)

1. **Open your terminal** in the project folder: `c:\Users\ajana\Downloads\polyglotmeet\polyglotmeet`
2. **Navigate to the android folder**:
   ```powershell
   cd android
   ```
3. **Run the build command**:
   ```powershell
   ./gradlew assembleDebug
   ```
   *(Note: If you get a permission error, try `cmd /c gradlew.bat assembleDebug`)*

4. **Locate your APK**:
   Once finished, your APK will be at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🖥️ Option 2: Build via Android Studio

1. Open **Android Studio**.
2. Select **"Open"** and choose the `android` folder inside `polyglotmeet`.
3. Wait for Gradle sync to finish.
4. Click the green **Play (Run)** button to launch on an emulator/device.
5. Or go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🚀 Troubleshooting

- **If build fails**: Make sure you have the Android SDK installed and `JAVA_HOME` set.
- **"SDK location not found"**: 
  - The build requires a `local.properties` file in the `android` folder.
  - I have attempted to create this for you pointing to the default location: `C:/Users/ajana/AppData/Local/Android/Sdk`
  - If the build still fails, verify your Android SDK location and update `android/local.properties`.
- **Permissions**: Ensure your phone has "Install from Unknown Sources" enabled if installing the debug APK.
