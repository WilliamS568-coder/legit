import { messaging, getToken } from './firebase';
import { supabase } from './supabaseClient';

export async function checkAndSendWelcomeNotification() {
  try {
    // Check if the user has already received a welcome notification
    const hasWelcomed = localStorage.getItem('has_received_welcome');
    if (hasWelcomed) return;

    if (!messaging) return;

    // Request permission if not already granted
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      
      // Trigger a local browser welcome notification immediately on first launch
      new Notification('Welcome to Legit tutors! 🎉', {
        body: 'Thanks for getting started. Set up your morning and night study reminders to stay ahead!',
        icon: '/favicon.ico'
      });

      // Mark as welcomed in localStorage so it never triggers again for this browser
      localStorage.setItem('has_received_welcome', 'true');
    }
  } catch (error) {
    console.error('Error triggering welcome notification:', error);
  }
}