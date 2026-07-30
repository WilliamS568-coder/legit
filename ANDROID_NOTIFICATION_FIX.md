# Android Notification Fix - Step by Step

## Current Issue:
- App asks for notification permission ✓
- Permission is granted ✓
- But Firebase can't get device token ✗
- Error: "Topic sync or token retrieval failed"

## Solution: Complete Fresh Install

### Step 1: Uninstall the App from Your Device
1. On your OPPO phone, go to **Settings**
2. Go to **Apps** or **Application Manager**
3. Find **"Legit Tutors"** or **"com.legittutors.app"**
4. Click **Uninstall**
5. Confirm uninstall

**OR** from Android Studio:
1. In Android Studio, click the **Device Manager** icon (phone icon on left sidebar)
2. Right-click on your device (OPPO CPH2641)
3. Select **"Uninstall App"**
4. Select **"com.legittutors.app"**
5. Click **Uninstall**

### Step 2: Verify google-services.json is Correct
The file at `android/app/google-services.json` should have:
- Project ID: `legit-tutors`
- Package name: `com.legittutors.app`
- API key: `AIzaSyDjmRL6faKf8rirMnVuATtqcpG2I5CJqQg`

If you're unsure, download it again from Firebase Console:
1. Go to https://console.firebase.google.com
2. Select project: **legit-tutors**
3. Click **Project Settings** (gear icon)
4. Scroll to **Your Apps** section
5. Select your Android app
6. Download `google-services.json`
7. Replace the file at `android/app/google-services.json`

### Step 3: Clean and Rebuild
Run the fix script again:
```bash
fix-android-notifications.bat
```

Or manually:
```bash
# Stop Gradle
cd android
gradlew --stop
cd ..

# Clean
cd android
gradlew clean
cd ..

# Rebuild web
npm run build

# Sync
npx cap sync android

# Open Android Studio
npx cap open android
```

### Step 4: In Android Studio - Invalidate Caches
1. Click **File** → **Invalidate Caches...**
2. Select **"Invalidate and Restart"**
3. Wait for Android Studio to fully restart (this is important!)

### Step 5: Fresh Install
1. After Android Studio restarts, click the **Run** button (green triangle)
2. The app will install fresh on your device
3. **IMPORTANT**: When the permission dialog appears, click **Allow**

### Step 6: Check Logcat
1. In Android Studio, open **Logcat** (bottom panel)
2. Filter by: `package:mine package:main`
3. Look for these SUCCESS messages:
   ```
   ✅ Native notification permission granted
   ✅ Notification channel created
   ✅ Push notifications registered
   ✅ Native push registration token: [long token string]
   ```

### Step 7: Test Notification
1. Open the app on your device
2. Go to **Student Dashboard**
3. Scroll to **Notification Diagnostics**
4. Click **"Run Diagnostics"**
5. You should see the device token
6. Copy the token
7. Go to Firebase Console → Cloud Messaging
8. Send test notification to that token

## If Still Not Working:

### Check 1: Verify Firebase Console Setup
1. Go to https://console.firebase.google.com
2. Select **legit-tutors** project
3. Go to **Project Settings** → **Cloud Messaging**
4. Make sure you see:
   - **Server key** (for legacy)
   - **Web push certificate** (for web)
   - **Cloud Messaging API** is enabled

### Check 2: Enable Firebase Services
In Firebase Console:
1. Go to **Build** → **Cloud Messaging**
2. If not enabled, click **Get Started**
3. Go to **Project Settings** → **Integrations**
4. Make sure **Google Analytics** is enabled (required for FCM)

### Check 3: Check Android App in Firebase
1. In Firebase Console, go to **Project Settings**
2. Under **Your Apps**, you should see your Android app
3. It should show:
   - Package name: `com.legittutors.app`
   - App ID: `1:656395612665:android:cf2b03ded44f2c90dc0d28`
   - Status: **Active**

### Check 4: Verify SHA-1 Fingerprint
1. In Firebase Console, go to **Project Settings**
2. Under **Your Apps** → Select your Android app
3. Scroll to **SHA certificate fingerprints**
4. You should see at least one SHA-1 fingerprint
5. If empty, add it from Android Studio:
   - In Android Studio: **Gradle** → **app** → **Tasks** → **android** → **signingReport**
   - Copy the SHA-1 from the output
   - Paste it in Firebase Console

## Common Issues:

### Issue: "Failed to get FIS auth token"
**Solution**: Uninstall app completely and reinstall fresh

### Issue: "Topic sync or token retrieval failed"
**Solution**: 
- Check internet connection
- Verify google-services.json is correct
- Invalidate caches and rebuild

### Issue: Permission granted but no token
**Solution**:
- Check SHA-1 fingerprint is added in Firebase Console
- Verify Firebase project is linked to app
- Rebuild with clean cache

### Issue: Token received but no notification
**Solution**:
- Send notification from Firebase Console to test
- Make sure app has notification permission in Android settings
- Check notification channel is created (importance 5)

## Quick Checklist:

- [ ] App uninstalled from device
- [ ] google-services.json is correct
- [ ] Ran fix-android-notifications.bat
- [ ] Invalidated caches in Android Studio
- [ ] Fresh install of app
- [ ] Granted notification permission
- [ ] Checked Logcat for token
- [ ] Token visible in Logcat
- [ ] Sent test notification from Firebase Console
- [ ] Notification received on device

## Still Not Working?

If you've tried all the above and it's still not working:

1. **Check the exact error in Logcat** - What does it say?
2. **Verify Firebase project** - Is it the correct project?
3. **Check network** - Is the device connected to internet?
4. **Try different device** - Test on another Android device
5. **Check Firebase status** - Is Firebase service up? (https://status.firebase.google.com)

The most common fix is: **Uninstall app → Clean build → Fresh install → Grant permission**