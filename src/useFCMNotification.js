import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';

export async function registerPushNotifications() {
  try {
    console.log('📱 Starting native push notification registration...');
    console.log('Platform:', require('@capacitor/core').Capacitor.getPlatform());
    
    // Check if running on native platform
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping native push registration');
      return;
    }

    // 1. Check and request permissions
    console.log('Checking notification permissions...');
    let permStatus = await PushNotifications.checkPermissions();
    console.log('Current permission status:', permStatus);

    if (permStatus.receive !== 'granted') {
      console.log('Requesting notification permissions...');
      permStatus = await PushNotifications.requestPermissions();
      console.log('Requested permission result:', permStatus);
    }

    if (permStatus.receive !== 'granted') {
      console.log('❌ User denied native push notification permission.');
      alert('Please enable notifications in your device settings to receive study reminders.');
      return;
    }

    console.log('✅ Native notification permission granted');

    // 2. Create notification channel for Android 13+
    if (Capacitor.getPlatform() === 'android') {
      try {
        console.log('Creating notification channel...');
        await PushNotifications.createChannel({
          id: 'study-reminders',
          name: 'Study Reminders',
          description: 'Notifications for morning and night study sessions',
          importance: 5, // High importance
          visibility: 1, // Public
          sound: 'default',
          vibration: true,
          light: true
        });
        console.log('✅ Notification channel created');
      } catch (error) {
        console.error('Error creating notification channel:', error);
      }
    }

    // 3. Register for push notifications
    console.log('Registering for push notifications...');
    await PushNotifications.register();
    console.log('✅ Push notifications registered');

    // 3. Listen for registration success
    const registrationListener = PushNotifications.addListener('registration', async (token) => {
      console.log('✅ Native push registration token:', token.value);
      
      // Save token to Supabase if user is logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('fcm_tokens')
            .upsert({
              user_id: user.id,
              fcm_token: token.value,
              platform: 'android',
              updated_at: new Date()
            }, { onConflict: 'user_id' });

          if (error) {
            console.error('Error saving token to Supabase:', error);
          } else {
            console.log('✅ Token saved to Supabase');
          }
        } else {
          console.log('⚠️ User not logged in, token not saved to Supabase');
        }
      } catch (error) {
        console.error('Error saving token:', error);
      }
    });

    // 4. Listen for registration errors
    const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Error on native push registration:', JSON.stringify(error));
    });

    // 5. Listen for incoming notifications
    const notificationListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 Notification received:', notification);
      
      // Show alert for received notification
      const title = notification.title || 'Study Reminder';
      const body = notification.body || 'Time for your study session!';
      
      alert(`${title}: ${body}`);
    });

    // 6. Listen for notification tap
    const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('🔔 Notification tapped:', notification);
    });

    console.log('✅ Native push notifications setup complete');
    console.log('📋 Listeners registered:', {
      registration: !!registrationListener,
      registrationError: !!registrationErrorListener,
      notification: !!notificationListener,
      action: !!actionListener
    });
    
    alert('Study reminders enabled successfully! You will receive notifications for your study sessions.\n\nTo test: Send a notification from Firebase Console to your device token.');
    
  } catch (error) {
    console.error('❌ Error setting up push notifications:', error);
    alert('Failed to set up notifications. Please try again.\n\nError: ' + error.message);
  }
}

// Export function to test notifications
export async function testNotification() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      alert('This function only works on Android/iOS app');
      return;
    }

    // Request permission if not granted
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive !== 'granted') {
        alert('Please grant notification permission first');
        return;
      }
    }

    // Register and wait for token
    await PushNotifications.register();
    
    // Give it a moment to get the token
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Check the console for your device token. Use this token to send a test notification from Firebase Console.');
  } catch (error) {
    console.error('Error testing notification:', error);
    alert('Error: ' + error.message);
  }
}

export async function checkNotificationPermission() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    
    if (!Capacitor.isNativePlatform()) {
      return { status: 'not_applicable' };
    }

    const permStatus = await PushNotifications.checkPermissions();
    return permStatus;
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return { status: 'error' };
  }
}

export async function requestNotificationPermission() {
  try {
    const permStatus = await PushNotifications.requestPermissions();
    return permStatus;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { receive: 'error' };
  }
}