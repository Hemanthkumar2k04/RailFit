# RailFit Mobile

A React Native mobile application for railway asset management and inspection using AI-powered defect detection.

## Features

### 🚀 Core Functionality
- **Asset Inspection**: Camera integration for capturing railway asset photos
- **AI-Powered Analysis**: Real-time defect detection using machine learning
- **File Management**: Upload and manage inspection reports and documents
- **GPS Location**: Precise location tracking for asset tagging
- **QR Code Scanning**: Quick asset identification and data retrieval

### 📱 Platform Support
- **Android**: Full native support with comprehensive permissions
- **iOS**: Native iOS implementation with proper permission handling

### 🔐 Permissions
The app requests the following permissions for optimal functionality:

#### Android Permissions
- `CAMERA` - Capture photos for asset inspection
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` - GPS coordinates for asset tracking
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` - File access for uploads
- `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` - Media access for Android 13+

#### iOS Permissions
- `NSCameraUsageDescription` - Camera access for asset photography
- `NSLocationWhenInUseUsageDescription` - Location services for GPS tracking
- `NSPhotoLibraryUsageDescription` - Photo library access for image selection

## Installation

### Prerequisites
- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd RailFit_Mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **iOS setup (if developing for iOS):**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android setup:**
   - Ensure Android Studio is installed
   - Set up Android SDK and emulator
   - Accept Android licenses: `npx react-native doctor`

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Development Server
```bash
npm start
```

## Project Structure

```
RailFit_Mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── PermissionManager.tsx
│   ├── screens/            # App screens
│   │   ├── CameraScreen.tsx
│   │   ├── FileUploadScreen.tsx
│   │   └── LocationScreen.tsx
│   └── services/           # API and utility services
├── android/                # Android-specific files
│   └── app/src/main/
│       └── AndroidManifest.xml
├── ios/                    # iOS-specific files
│   └── Info.plist
├── App.tsx                 # Main app component
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Key Dependencies

### Core React Native
- `react-native` - React Native framework
- `react` - React library
- `@react-navigation/native` - Navigation system

### Permissions & Device Access
- `react-native-permissions` - Unified permissions API
- `react-native-image-picker` - Camera and gallery access
- `react-native-geolocation-service` - GPS location services
- `react-native-document-picker` - File selection and upload

### UI & Navigation
- `react-native-screens` - Native screen components
- `react-native-safe-area-context` - Safe area handling
- `react-native-gesture-handler` - Touch gesture handling
- `react-native-vector-icons` - Icon library

## API Integration

The mobile app is designed to work with the RailFit backend API:

### Backend Endpoints
- **Base URL**: `http://localhost:5000` (development)
- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Assets**: `/api/assets/*` - Asset management
- **Inspections**: `/api/inspections/*` - Inspection data
- **Mobile**: `/api/mobile/*` - Mobile-specific endpoints

### Data Flow
1. **Login**: Authenticate user and store JWT token
2. **Capture**: Take photos or select files for inspection
3. **Location**: Get GPS coordinates for asset tagging
4. **Upload**: Send inspection data to backend API
5. **Analysis**: Receive AI-powered defect detection results

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

### Testing
```bash
npm test
```

### Building for Production

#### Android APK
```bash
npm run build:android
```

#### iOS Archive
Use Xcode to create archives for App Store distribution.

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure all permissions are granted in device settings
   - Check AndroidManifest.xml and Info.plist configurations

2. **Camera Not Working**
   - Verify camera permission is granted
   - Check device has working camera hardware

3. **Location Services Failed**
   - Enable location services in device settings
   - Check GPS/network connectivity

4. **Build Errors**
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Clean builds: `npm run clean`

### Device-Specific Notes

#### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Supports runtime permissions (Android 6.0+)

#### iOS
- Minimum iOS version: 12.0
- Supports latest iOS features and permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript typing
4. Test on both Android and iOS
5. Submit a pull request

## License

This project is part of the RailFit Asset Management System.

---

For backend integration, refer to the main RailFit documentation in the parent directory.