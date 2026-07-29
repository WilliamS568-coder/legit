import { PushNotifications } from '@capacitor/push-notifications';
import { messaging, getToken } from './firebase';
import { supabase } from './supabaseClient';

export async function registerPushNotifications() {
  try {
    console.log('📱 Starting native push notification registration...');
    
    // Check if running on native platform
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping native push registration');
      return;
    }

    // 1. Check and request permissions
    let permStatus = await PushNotifications.checkPermissions();
    console.log('Current permission status:', permStatus);

    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
      console.log('Requested permission result:', permStatus);
    }

    if (permStatus.receive !== 'granted') {
      console.log('❌ User denied native push notification permission.');
      alert('Please enable notifications in your device settings to receive study reminders.');
      return;
    }

    console.log('✅ Native notification permission granted');

    // 2. Register for push notifications
    await PushNotifications.register();
    console.log('✅ Push notifications registered');

    // 3. Listen for registration success
    PushNotifications.addListener('registration', async (token) => {
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
        }
      } catch (error) {
        console.error('Error saving token:', error);
      }
    });

    // 4. Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Error on native push registration:', JSON.stringify(error));
    });

    // 5. Listen for incoming notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 Notification received:', notification);
      
      // Show alert for received notification
      const title = notification.title || 'Study Reminder';
      const body = notification.body || 'Time for your study session!';
      
      // You can customize this to show a custom UI instead of alert
      alert(`${title}: ${body}`);
    });

    // 6. Listen for notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('🔔 Notification tapped:', notification);
      // Handle notification tap - navigate to specific page if needed
    });

    console.log('✅ Native push notifications setup complete');
    alert('Study reminders enabled successfully! You will receive notifications for your study sessions.');
    
  } catch (error) {
    console.error('❌ Error setting up push notifications:', error);
    alert('Failed to set up notifications. Please try again.');
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