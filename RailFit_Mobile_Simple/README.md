# RailFit Mobile Simple - React Native App

A minimal React Native app for RailFit Asset Management with login and QR code scanning functionality.

## Features

- **Login Screen**: Email and password authentication with JWT token storage
- **Home Screen**: User dashboard with logout functionality 
- **QR Scanner**: Camera-based QR code scanning with real-time feedback
- **Secure Storage**: JWT tokens stored securely using AsyncStorage
- **Android Support**: Full Android APK build support

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 16 or higher)
2. **Java Development Kit (JDK)** (version 11 or higher)
3. **Android Studio** with Android SDK
4. **React Native CLI**: `npm install -g react-native-cli`

### Android Development Environment Setup

1. Install Android Studio from https://developer.android.com/studio
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
   - Performance (Intel ® HAXM) (if using Intel processor)

3. Set up environment variables:
   ```bash
   # Add to your ~/.bashrc or ~/.zshrc (on Windows: System Environment Variables)
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. Accept Android licenses:
   ```bash
   sdkmanager --licenses
   ```

## Installation

1. **Clone/Navigate to the project directory:**
   ```bash
   cd RailFit_Mobile_Simple
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Check for security vulnerabilities:**
   ```bash
   npm audit
   ```

4. **Fix security issues (if any):**
   ```bash
   npm audit fix
   # Or for more aggressive fixes:
   npm audit fix --force
   ```

5. **Link native dependencies (for older React Native versions):**
   ```bash
   npx react-native link
   ```

6. **For Android, install additional dependencies:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

## Configuration

### API Endpoint Configuration

1. Open `App.js` and update the API base URL on line 15:
   ```javascript
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000'; // Replace with your actual IP
   ```

   **To find your IP address:**
   - **Windows**: Run `ipconfig` in Command Prompt, look for "IPv4 Address"
   - **macOS/Linux**: Run `ifconfig` or `hostname -I`
   - **Example**: `http://192.168.1.100:5000`

### Android Permissions

The app automatically requests the following permissions:
- Camera (for QR scanning)
- Internet (for API calls)
- Storage (for data persistence)

## Running the App

### 1. Start Metro Bundler
```bash
npx react-native start
```

### 2. Run on Android Device/Emulator

**For Physical Device:**
1. Enable Developer Options and USB Debugging on your Android device
2. Connect via USB
3. Run:
   ```bash
   npx react-native run-android
   ```

**For Android Emulator:**
1. Start an Android emulator from Android Studio
2. Run:
   ```bash
   npx react-native run-android
   ```

## Building APK

### Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)
```bash
cd android
./gradlew assembleRelease
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Usage

### Login Credentials
- **Email**: `admin@railfit.com`
- **Password**: `railway123`

### App Flow
1. **Login**: Enter credentials and tap "Login"
2. **Home Screen**: View user info and access QR scanner
3. **QR Scanner**: Tap "Scan QR Code" to open camera
4. **Scan Result**: QR data is displayed after successful scan

## Dependencies

### Core Dependencies
- `react-native`: Core React Native framework
- `@react-navigation/native`: Navigation library
- `@react-navigation/stack`: Stack navigator
- `axios`: HTTP client for API calls
- `@react-native-async-storage/async-storage`: Secure local storage

### Camera & QR Dependencies
- `react-native-camera`: Camera functionality
- `react-native-qrcode-scanner`: QR code scanning
- `react-native-permissions`: Runtime permissions

### UI Dependencies
- `react-native-gesture-handler`: Touch gesture handling
- `react-native-safe-area-context`: Safe area management
- `react-native-screens`: Native screen optimization
- `react-native-vector-icons`: Icon library

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build failures:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **"Could not find com.facebook.react:react-native-gradle-plugin" error:**
   - This has been fixed by removing the problematic plugin
   - Updated to use traditional React Native configuration
   - Make sure you run `npm install` first
   - Clean and rebuild: `cd android && ./gradlew clean && cd ..`

4. **Gradle sync issues in Android Studio:**
   - Close Android Studio
   - Delete `android/.gradle` folder if it exists
   - Run `cd android && ./gradlew clean`
   - Reopen project in Android Studio
   - Click "Sync Project with Gradle Files"

5. **"Included build does not exist" error:**
   - Fixed by removing includeBuild reference
   - Uses stable Gradle 7.6 instead of milestone version
   - All Android build tools updated to compatible versions

3. **Camera permissions denied:**
   - Go to Settings > Apps > RailFit Mobile > Permissions
   - Enable Camera permission manually

4. **Network connection issues:**
   - Ensure your device/emulator is on the same network as your computer
   - Check if the backend server is running on the specified IP and port
   - Verify firewall settings allow connections on port 5000

5. **QR scanner not working:**
   - Ensure camera permission is granted
   - Try restarting the app
   - Check device camera functionality in other apps

### Debug Mode
Enable debug mode to see detailed logs:
```bash
npx react-native log-android
```

## File Structure
```
RailFit_Mobile_Simple/
├── App.js                  # Main application file
├── index.js               # Entry point
├── package.json           # Dependencies
├── app.json              # App configuration
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler configuration
└── android/              # Android-specific files
    ├── build.gradle      # Project build configuration
    ├── settings.gradle   # Project settings
    └── app/
        ├── build.gradle  # App build configuration
        └── src/main/
            └── AndroidManifest.xml  # App permissions & configuration
```

## API Integration

The app communicates with the RailFit backend API:

- **Login Endpoint**: `POST /api/auth/login`
  - Request: `{ email, password }`
  - Response: `{ access_token, user: { user_id, name, email, role } }`

Ensure the backend server is running before testing the app.

## License

This project is part of the RailFit Asset Management System.