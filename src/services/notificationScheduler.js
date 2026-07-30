import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Schedule 3 daily reminders: Morning (8am), Afternoon (2pm), Evening (6pm)
export async function scheduleDailyReminders() {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications only work on native platforms');
      return;
    }

    // Request permission
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
    }

    console.log('✅ Local notification permission granted');

    // Cancel any existing scheduled notifications
    await LocalNotifications.cancelAll();

    // Schedule 3 daily reminders
    const reminders = [
      {
        id: 1,
        title: '🌅 Good Morning!',
        body: 'Time for your morning study session. Stay focused and achieve your goals!',
        hour: 8,
        minute: 0,
        dayOfWeek: [1, 2, 3, 4, 5, 6, 7] // Every day
      },
      {
        id: 2,
        title: '☀️ Afternoon Study Time',
        body: 'Keep the momentum going! Your afternoon study session is now.',
        hour: 14,
        minute: 0,
        dayOfWeek: [1, 2, 3, 4, 5, 6, 7]
      },
      {
        id: 3,
        title: '🌙 Evening Review',
        body: 'Great job today! Review what you learned and prepare for tomorrow.',
        hour: 18,
        minute: 0,
        dayOfWeek: [1, 2, 3, 4, 5, 6, 7]
      }
    ];

    for (const reminder of reminders) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: reminder.id,
              title: reminder.title,
              body: reminder.body,
              schedule: {
                hour: reminder.hour,
                minute: reminder.minute,
                repeats: true,
                dayOfWeek: reminder.dayOfWeek
              },
              sound: 'default',
              vibration: true,
              light: true,
              icon: 'ic_notification',
              smallIcon: 'ic_notification'
            }
          ]
        });
        console.log(`✅ Scheduled reminder ${reminder.id}: ${reminder.title} at ${reminder.hour}:${reminder.minute}`);
      } catch (error) {
        console.error(`❌ Failed to schedule reminder ${reminder.id}:`, error);
      }
    }

    console.log('✅ All daily reminders scheduled successfully');
    return true;
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return false;
  }
}

// Send welcome notification immediately
export async function sendWelcomeNotification() {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications only work on native platforms');
      return;
    }

    // Request permission
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
    }

    // Send immediate welcome notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 999,
          title: '🎉 Welcome to Legit Tutors!',
          body: 'Thanks for joining! You will receive daily study reminders to keep you on track.',
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          sound: 'default',
          vibration: true,
          light: true,
          icon: '/src/assets/legit.jpg'
        }
      ]
    });

    console.log('✅ Welcome notification scheduled');
    return true;
  } catch (error) {
    console.error('Error sending welcome notification:', error);
    return false;
  }
}

// Cancel all notifications
export async function cancelAllNotifications() {
  try {
    await LocalNotifications.cancelAll();
    console.log('✅ All notifications cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  try {
    const result = await LocalNotifications.getPending();
    return result.notifications || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Check if notifications are enabled
export async function areNotificationsEnabled() {
  try {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    const permStatus = await LocalNotifications.checkPermissions();
    return permStatus.display === 'granted';
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
}

// Test notification - sends immediately
export async function testNotificationNow() {
  try {
    if (!Capacitor.isNativePlatform()) {
      alert('Notifications only work on Android/iOS app');
      return false;
    }

    // Request permission if not granted
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        alert('Please grant notification permission');
        return false;
      }
    }

    // Send test notification immediately
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 888,
          title: '🧪 Test Notification',
          body: 'If you see this, notifications are working!',
          schedule: { at: new Date(Date.now() + 500) }, // 0.5 seconds from now
          sound: 'default',
          vibration: true,
          light: true
        }
      ]
    });

    console.log('✅ Test notification scheduled');
    alert('Test notification will appear in 0.5 seconds!');
    return true;
  } catch (error) {
    console.error('Error testing notification:', error);
    alert('Error: ' + error.message);
    return false;
  }
}
