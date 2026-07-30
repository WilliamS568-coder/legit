@echo off
echo ========================================
echo Rebuilding Android App for Notifications
echo ========================================
echo.

echo Step 1: Building web assets...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build complete
echo.

echo Step 2: Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Sync failed!
    pause
    exit /b 1
)
echo ✅ Sync complete
echo.

echo Step 3: Opening Android Studio...
call npx cap open android
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. In Android Studio, click the "Run" button
echo 2. Grant notification permission when prompted
echo 3. Check Logcat for: "✅ Native push registration token:"
echo 4. Use that token to send test notifications
echo.
pause