import { messaging, getToken } from './firebase';
import { supabase } from './supabaseClient';

export async function checkAndSendWelcomeNotification() {
  try {
    console.log('🔔 checkAndSendWelcomeNotification called');
    
    // Check if the user has already received a welcome notification
    const hasWelcomed = localStorage.getItem('has_received_welcome');
    console.log('Has welcomed before:', hasWelcomed);
    
    if (hasWelcomed) {
      console.log('⚠️ Welcome notification already sent. To test again, run: localStorage.removeItem("has_received_welcome") in console');
      return;
    }

    // Only show welcome notification on web (not native)
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notifications not supported in this environment');
      return;
    }

    // Check if permission is already granted (permission should be requested in App.jsx)
    const permission = Notification.permission;
    console.log('Welcome notification - current permission:', permission);
    
    if (permission === 'granted') {
      console.log('Creating welcome notification...');
      
      // Trigger a local browser welcome notification immediately on first launch
      const notification = new Notification('Welcome to Legit tutors! 🎉', {
        body: 'Thanks for getting started. Set up your morning and night study reminders to stay ahead!',
        icon: '/favicon.ico',
        tag: 'welcome-notification',
        renotify: false,
        requireInteraction: false
      });

      // Handle notification events
      notification.onshow = () => {
        console.log('✅ Welcome notification displayed');
      };

      notification.onclick = () => {
        console.log('Welcome notification clicked');
        window.focus();
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('❌ Welcome notification error:', error);
      };

      // Mark as welcomed in localStorage so it never triggers again for this browser
      localStorage.setItem('has_received_welcome', 'true');
      console.log('✅ Welcome notification sent and marked as shown');
    } else {
      console.log('⚠️ Notification permission not granted, skipping welcome notification');
      // Still mark as welcomed to avoid repeated attempts
      localStorage.setItem('has_received_welcome', 'true');
    }
  } catch (error) {
    console.error('❌ Error triggering welcome notification:', error);
  }
}
