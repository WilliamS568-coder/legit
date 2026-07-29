import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PushNotifications } from '@capacitor/push-notifications';
import { App as CapApp } from '@capacitor/app';
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

    checkAndSendWelcomeNotification();

    // Safely handle push notifications with a try/catch to prevent app crashes
    try {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      }).catch(err => {
        console.log('Push permission error: ', err);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
      });
    } catch (e) {
      console.log('Notifications not supported in this environment', e);
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