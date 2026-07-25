import { Routes, Route } from 'react-router-dom';
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