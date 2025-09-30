@echo off
echo Setting up RailFit Mobile Simple...
echo.

echo 1. Installing dependencies...
call npm install

echo.
echo 2. Checking for security vulnerabilities...
call npm audit

echo.
echo 3. Attempting to fix security issues...
call npm audit fix

echo.
echo 4. Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo 5. Setup complete!
echo.
echo Next steps:
echo - Update API_BASE_URL in App.js with your computer's IP address
echo - Connect Android device or start emulator
echo - Run: npx react-native run-android
echo.
pause