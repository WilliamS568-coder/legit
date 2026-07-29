import { messaging, getToken } from './firebase';
import { supabase } from './supabaseClient'; // Adjust path to your Supabase client

export async function registerPushNotifications() {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging is not supported in this environment.');
      return;
    }

    // 1. Request browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Permission for notifications was denied.');
      return;
    }

    // 2. Get FCM Device Token using your Public VAPID Key from Firebase Console
    const currentToken = await getToken(messaging, {
      vapidKey: 'BFmWC7G2itysze-j2QKw799fltqQkiFmRhnE2k-Met2b-tNjT-B8hTY55Cv8EoAMPOgpGrjD6nL8syK0gf280lE'
    });

    if (currentToken) {
      // 3. Get the currently logged-in user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('You must be logged into Supabase to save your notification token.');
        return;
      }

      // 4. Save the token into your Supabase database table (fcm_tokens)
      const { error } = await supabase
        .from('fcm_tokens')
        .upsert({
          user_id: user.id,
          fcm_token: currentToken,
          updated_at: new Date()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      console.log('FCM Token saved to Supabase successfully!');
      alert('Morning and night study reminders enabled successfully!');
    }
  } catch (error) {
    console.error('Error setting up push notifications:', error);
  }
}