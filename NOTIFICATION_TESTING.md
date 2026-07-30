# Android Push Notification Testing Guide

## Prerequisites

1. **Firebase Project Setup**:
   - Firebase project: `legit-tutots`
   - Android app package: `com.legittutors.app`
   - `google-services.json` is already in `android/app/`

2. **Build the App**:
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

## Testing Steps

### Step 1: Install and Run the App

1. Connect your Android device (or use emulator)
2. In Android Studio, click "Run" to install the app
3. Open the app on your device

### Step 2: Grant Notification Permission

1. When the app loads, it will automatically request notification permission
2. Click "Allow" when the permission dialog appears
3. You should see an alert: "Study reminders enabled successfully!"

### Step 3: Get Your Device Token

1. Open the app and navigate to the page with "Study Reminders" component
2. Click the "Test Notification" button
3. Check the browser console (or Android Studio Logcat) for the device token
4. The token will look like: `dXdx8X7sR5q...` (long string)

**Alternative - Check Logcat**:
```bash
# In Android Studio, open Logcat and filter by "Legit Tutors"
# Look for: "✅ Native push registration token:"
```

### Step 4: Send Test Notification from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `legit-tutots`
3. Go to **Cloud Messaging** in the left menu
4. Click **"Send your first message"** (or "New notification")
5. Fill in the notification details:
   - **Title**: "Test Notification"
   - **Text**: "This is a test notification from Legit Tutors!"
6. Click **"Send test message"**
7. Paste your device token from Step 3
8. Click **"Test"**

### Step 5: Verify Notification Received

1. The notification should appear on your Android device
2. You should see an alert popup in the app (if app is open)
3. Check Logcat for: `📬 Notification received:`

## Troubleshooting

### Issue: Permission Granted but No Token

**Solution**:
- Make sure `google-services.json` is correctly placed in `android/app/`
- Rebuild the app: `npx cap sync android`
- Check that Firebase is properly initialized

### Issue: Token Received but No Notification

**Solution**:
1. Verify the token is correct in Firebase Console
2. Make sure you're sending to the correct app (Android, not Web)
3. Check that the notification channel is created (look for "✅ Notification channel created" in logs)
4. Ensure the app has notification permission in Android settings

### Issue: Notification Received but Not Displayed

**Solution**:
- Check notification channel importance (should be 5 for high importance)
- Verify the app is not in battery optimization mode
- Check Android notification settings for the app

## Console Logs to Look For

Success indicators:
```
✅ Native notification permission granted
✅ Notification channel created
✅ Push notifications registered
✅ Native push registration token: [token]
✅ Token saved to Supabase
✅ Native push notifications setup complete
```

Error indicators:
```
❌ User denied native push notification permission
❌ Error on native push registration
❌ Error saving token to Supabase
```

## Important Notes

1. **Token Persistence**: The device token is saved to Supabase database in the `fcm_tokens` table
2. **Notification Channel**: Created automatically with ID `study-reminders`
3. **Foreground Notifications**: When app is open, notifications show as alerts
4. **Background Notifications**: When app is closed, notifications appear in the system tray

## Sending Notifications from Backend

To send notifications programmatically:

```javascript
// Using Firebase Admin SDK (Node.js)
const admin = require('firebase-admin');

const message = {
  notification: {
    title: 'Study Reminder',
    body: 'Time for your morning study session!'
  },
  token: 'DEVICE_TOKEN_HERE'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
```

## Testing Checklist

- [ ] App requests notification permission on first launch
- [ ] Permission is granted successfully
- [ ] Device token is generated and logged
- [ ] Token is saved to Supabase database
- [ ] Test notification sent from Firebase Console
- [ ] Notification appears on device
- [ ] Notification shows alert when app is open
- [ ] Notification appears in system tray when app is closed
- [ ] Tapping notification opens the app