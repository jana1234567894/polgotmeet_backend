# ⚡ FINAL ARCHITECTURE FIX: LiveKit + Supabase

I have completely upgraded the architecture to use **LiveKit** as the WebRTC authority. This eliminates the "Separate Rooms" bug permanently.

## 1️⃣ Prerequisites (ACTION REQUIRED)

1.  **Sign up for LiveKit Cloud** (Free Tier is generous): [livekit.io](https://livekit.io/)
2.  **Get your API Key, Secret, and URL**.
3.  **Update `.env`** in the project root:
    ```env
    LIVEKIT_API_KEY=your_key
    LIVEKIT_API_SECRET=your_secret
    LIVEKIT_URL=wss://your-project.livekit.cloud
    ```
4.  **Update `server/.env`**:
    ```env
    LIVEKIT_API_KEY=your_key
    LIVEKIT_API_SECRET=your_secret
    LIVEKIT_URL=wss://your-project.livekit.cloud
    SUPABASE_URL=...
    SUPABASE_SERVICE_KEY=... (Get this from Supabase Dashboard > Project Settings > API > service_role)
    ```

5.  **Run SQL in Supabase**:
    Copy the contents of `supabase_schema.sql` and run it in your Supabase SQL Editor.

## 2️⃣ How to Run

1.  **Start the Backend Server**:
    ```powershell
    cd server
    npm install
    node index.js
    ```
    *Keep this running!* This generates the secure tokens.

2.  **Rebuild APK**:
    ```powershell
    # In project root
    npm run build
    npx cap sync android
    cd android
    ./gradlew assembleDebug
    ```

## 3️⃣ Why this works
- **Before**: Clients created random rooms. No one agreed on the room name.
- **Now**: 
    - You click "Create Meeting" -> Server creates a row in DB + assigns a canonical LiveKit room name.
    - You click "Join" -> Server looks up the canonical room name -> issues a Token for THAT room.
    - All users are guaranteed to be in the same session.
