# PulseChat Mobile (React Native CLI - Android)

This is the companion React Native CLI mobile application for PulseChat, designed for Android.

## Features:
- Real-time messaging with Socket.io (`joinRoom`, `chatMessage`, `typing`, `onlineUsers`)
- Room creation and room-switching
- Chat history loaded automatically from MongoDB
- WhatsApp group chat layout with distinct message bubbles for sent vs. received messages
- Typing indicators ("User is typing...")
- Live active online users count

---

## Setup & Running on Android

### Prerequisites:
1. Node.js (v18+)
2. Android Studio with Android SDK (API 33+) & Android Virtual Device (AVD) or physical device with USB Debugging enabled.
3. React Native CLI (`npm install -g react-native-cli`)

### Quick Start:

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start Metro Bundler**:
   ```bash
   npm start
   ```

3. **Run on Android Emulator**:
   In another terminal:
   ```bash
   npm run android
   ```

### Connecting to the Backend:
- **Android Emulator**: Uses `http://10.0.2.2:5000` by default to access `localhost:5000` on your host development PC.
- **Physical Device**: Enter your PC's local Wi-Fi IP in the login screen server input (e.g., `http://192.168.1.10:5000`).

### Building Release APK:
To assemble a release APK for submission:
```bash
cd android
./gradlew assembleRelease
```
The generated APK will be at `android/app/build/outputs/apk/release/app-release.apk`.
