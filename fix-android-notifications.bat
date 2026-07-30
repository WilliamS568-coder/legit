@echo off
echo ========================================
echo Fixing Android Notification Issues
echo ========================================
echo.

echo Step 1: Stopping any running Gradle daemons...
cd android
call gradlew --stop
cd ..
echo ✅ Gradle daemons stopped
echo.

echo Step 2: Cleaning Android build...
cd android
call gradlew clean
cd ..
echo ✅ Build cleaned
echo.

echo Step 3: Removing old build artifacts...
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\build" rmdir /s /q "android\build"
if exist ".gradle" rmdir /s /q ".gradle"
echo ✅ Old builds removed
echo.

echo Step 4: Rebuilding web assets...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Web assets built
echo.

echo Step 5: Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Sync failed!
    pause
    exit /b 1
)
echo ✅ Synced with Android
echo.

echo Step 6: Opening Android Studio...
call npx cap open android
echo.
echo ========================================
echo IMPORTANT: In Android Studio
echo ========================================
echo 1. Click "File" → "Invalidate Caches..."
echo 2. Select "Invalidate and Restart"
echo 3. After restart, click "Run" to install the app
echo 4. Grant notification permission when prompted
echo 5. Check Logcat for: "✅ Native push registration token:"
echo.
echo If you still see "Failed to get FIS auth token":
echo - Go to Firebase Console
echo - Go to Project Settings
echo - Download google-services.json again
echo - Replace android/app/google-services.json
echo - Rebuild the app
echo.
pause