import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import logo from '../assets/legit.jpg';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('#');
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      if (scrollPosition < 500) {
        setActiveTab('#');
        return;
      }

      navLinks.forEach((link) => {
        if (link.href.startsWith('#') && link.href.length > 1) {
          const section = document.querySelector(link.href);
          if (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveTab(link.href);
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-yellow-500/20 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-yellow-500 overflow-hidden bg-neutral-900 flex items-center justify-center">
            <img src={logo} alt="Legit Tutors Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold tracking-wider text-lg text-white">
            LEGIT <span className="text-yellow-500">TUTORS</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => {
            const isAnchor = link.href.startsWith('#');
            
            return isAnchor && isHome ? (
              <a 
                key={index} 
                href={link.href} 
                className={`text-sm font-medium transition-colors pb-1 border-b-2 ${
                  activeTab === link.href 
                    ? 'text-yellow-500 border-yellow-500' 
                    : 'text-gray-300 border-transparent hover:text-yellow-500'
                }`}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={index} 
                to={isAnchor ? `/${link.href}` : link.href}
                className="text-sm font-medium transition-colors pb-1 border-b-2 text-gray-300 border-transparent hover:text-yellow-500"
              >
                {link.name}
              </Link>
            );
          })}

          <Link 
            to="/login" 
            className="bg-neutral-900 border border-yellow-500/50 hover:bg-neutral-800 text-yellow-500 font-bold text-sm px-4 py-2 rounded-lg transition-all"
          >
            Portal Login
          </Link>

          <Link 
            to="/register" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm px-5 py-2 rounded-lg transition-all shadow-md"
          >
            Register Now
          </Link>

          {!Capacitor.isNativePlatform() && (
            <a 
              href="https://docs.google.com/uc?export=download&id=1YZeXMV6k4gQTcAX4L3vyuldCyHVaIKB0"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25L15 12 3 5.25v2.25h18V16.5H3zM15 12l6-6m0 0v6m0-6H9" />
              </svg>
              Download App
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-yellow-500 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-yellow-500/20 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link, index) => {
            const isAnchor = link.href.startsWith('#');
            return isAnchor && isHome ? (
              <a 
                key={index} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-yellow-500 font-medium py-2 border-b border-neutral-900"
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={index} 
                to={isAnchor ? `/${link.href}` : link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-yellow-500 font-medium py-2 border-b border-neutral-900"
              >
                {link.name}
              </Link>
            );
          })}
          
          <Link 
            to="/login" 
            onClick={() => setIsOpen(false)}
            className="block text-center bg-neutral-900 border border-yellow-500/50 text-yellow-500 font-bold py-2 rounded-lg mt-4"
          >
            Portal Login
          </Link>

           <Link 
            to="/register" 
            onClick={() => setIsOpen(false)}
            className="block text-center bg-yellow-500 text-black font-bold py-2 rounded-lg mt-2"
          >
            Register Now
          </Link>

         
        </div>
      )}
    </nav>
  );
}