import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PushNotifications } from '@capacitor/push-notifications';
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
  useEffect(() => {
    // Triggers welcome notification on first launch
    checkAndSendWelcomeNotification();

    // Request permissions and register for Capacitor Push Notifications
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    // Listen for incoming notifications when app is active
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', notification);
    });

    // Listen for when a user clicks/taps on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
    });
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
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