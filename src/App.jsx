import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

// Register service worker for Firebase Cloud Messaging
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import SuccessStories from './components/SuccessStories';
import Testimonials from './components/Testimonials';
import Gallery from './components/Gallery';
import ContactFooter from './components/ContactFooter';
import Contact from './components/contact';
import ScholarsPage from './pages/ScholarsPage';
import GalleryPage from './pages/GalleryPage';

// Portal & Dashboard Pages
import Login from './components/Login';
import Register from './components/register';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';

// Welcome Notification Helper
import { checkAndSendWelcomeNotification } from './welcomeNotification';

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <SuccessStories />
      <Testimonials />
      <Gallery />
      <ContactFooter />
    </div>
  );
}

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request Notification Permission & Get Token (Handles Web and Native Capacitor)
    const setupNotifications = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          console.log('📱 Setting up native push notifications...');
          
          // Request permission first
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

          // Register for push notifications
          await PushNotifications.register();
          console.log('✅ Push notifications registered');

          // Listen for registration success
          PushNotifications.addListener('registration', (token) => {
            console.log('✅ Native push registration token:', token.value);
          });

          // Listen for registration errors
          PushNotifications.addListener('registrationError', (error) => {
            console.error('❌ Error on native push registration:', JSON.stringify(error));
          });

          // Listen for incoming notifications
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('📬 Notification received:', notification);
            alert(`${notification.title || 'Notification'}: ${notification.body || ''}`);
          });

          // Listen for notification tap
          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('🔔 Notification tapped:', notification);
          });

          console.log('✅ Native push notifications setup complete');
        } else {
          // Web Browser Firebase Messaging Setup
          console.log('🌐 Setting up web push notifications...');
          
          if (messaging) {
            // Request permission
            const permission = await Notification.requestPermission();
            console.log('Notification permission status:', permission);

            if (permission === 'granted') {
              const token = await getToken(messaging, {
                vapidKey: "BFmWC7G2itysze-j2QKw799fltqQkiFmRhnE2k-Met2b-tNjT-B8hTY55Cv8EoAMPOgpGrjD6nL8syK0gf280lE"
              });
              
              if (token) {
                console.log('✅ FCM Device Token:', token);
              } else {
                console.log('⚠️ No FCM token received');
              }

              // Send welcome notification after permission is granted
              console.log('🎉 Sending welcome notification...');
              try {
                await checkAndSendWelcomeNotification();
                console.log('✅ Welcome notification function completed');
              } catch (error) {
                console.error('❌ Welcome notification function failed:', error);
              }
            } else {
              console.log('❌ Notification permission denied.');
              alert('Please enable notifications in your browser settings to receive study reminders.');
            }
          }
        }
      } catch (error) {
        console.error('❌ Notification setup error:', error);
      }
    };

    // Setup notifications on app start
    setupNotifications().then(() => {
      console.log('✅ Notification setup completed');
    }).catch((error) => {
      console.error('❌ Notification setup failed:', error);
    });

    // Listen for incoming foreground messages on web
    if (!Capacitor.isNativePlatform() && messaging) {
      onMessage(messaging, (payload) => {
        console.log('📨 Message received in foreground:', payload);
        const title = payload.notification?.title || 'Notification';
        const body = payload.notification?.body || '';
        alert(`${title}: ${body}`);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white relative">
      {/* Offline Modal / Banner with Exit & Retry */}
      {!isOnline && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold mb-2">No Internet Connection</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Please enable your internet connection or check your network settings to continue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => CapApp.exitApp()}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2.5 rounded-xl transition"
              >
                Exit
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-xl transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Public Main Website Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/scholars" element={<ScholarsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<Contact />} />

        {/* Portal Authentication & Dashboards */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </div>
  );
}