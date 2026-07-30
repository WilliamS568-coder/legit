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
import VerifyEmail from './components/VerifyEmail';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';

// Welcome Notification Helper
import { checkAndSendWelcomeNotification } from './welcomeNotification';
import { sendWelcomeNotification, scheduleDailyReminders } from './services/notificationScheduler';
import { registerPushNotifications } from './useFCMNotification';

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
          
          // Register for FCM push notifications
          await registerPushNotifications();

          // Send welcome notification and schedule daily reminders
          console.log('🎉 Setting up local notifications...');
          
          // Send welcome notification
          try {
            await sendWelcomeNotification();
          } catch (error) {
            console.error('Welcome notification error:', error);
          }
          
          // Schedule daily reminders
          try {
            await scheduleDailyReminders();
          } catch (error) {
            console.error('Schedule reminders error:', error);
          }
          
          console.log('✅ Local notifications setup complete');
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

  // Show offline page when not connected
  if (!isOnline) {
    return (
      <div className="offline-container">
        <div className="offline-content">
          <div className="logo">
            <h1>LEGIT <span>TUTORS</span></h1>
          </div>
          
          <div className="icon">⚠️</div>
          
          <h2>Not Connected</h2>
          
          <p>
            You are currently offline. Please check your internet connection to access the app.
          </p>

          <div className="button-group">
            <button 
              className="connect-btn"
              onClick={() => window.location.reload()}
            >
              🔄 Connect
            </button>
            <button 
              className="exit-btn"
              onClick={() => CapApp.exitApp()}
            >
              ❌ Exit
            </button>
          </div>
        </div>

        <style>{`
          .offline-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            padding: 20px;
          }

          .offline-content {
            background: #1f1f1f;
            border: 2px solid #fbbf24;
            border-radius: 20px;
            padding: 40px 30px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }

          .logo {
            margin-bottom: 20px;
          }

          .logo h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }

          .logo h1 span {
            color: #fbbf24;
          }

          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }

          .offline-content h2 {
            color: #fbbf24;
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 700;
          }

          .offline-content p {
            color: #a3a3a3;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.6;
          }

          .button-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .connect-btn {
            padding: 16px 24px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #fbbf24;
            color: #1a1a1a;
          }

          .connect-btn:hover {
            background: #f59e0b;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
          }

          .connect-btn:active {
            transform: translateY(0);
          }

          .exit-btn {
            padding: 16px 24px;
            font-size: 16px;
            font-weight: 600;
            border: 2px solid #404040;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: transparent;
            color: #a3a3a3;
          }

          .exit-btn:hover {
            background: #2d2d2d;
            color: #ffffff;
            border-color: #525252;
          }

          @media (max-width: 480px) {
            .offline-content {
              padding: 30px 20px;
            }

            .offline-content h2 {
              font-size: 24px;
            }

            .offline-content p {
              font-size: 14px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white relative">
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
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </div>
  );
}