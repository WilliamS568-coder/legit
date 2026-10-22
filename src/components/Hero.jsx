// If your logo is saved in src/assets/logo.png (adjust filename as needed)
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import logo from '../assets/legit.jpg'; // or your logo path

export default function Hero() {
  return (
    <div className="relative bg-black text-white min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background with black overlay and full-width classroom image */}
      <div className="absolute inset-0 bg-black/80 z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600')` }}
      ></div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto flex flex-col items-center gap-6 pt-10">
        
        {/* Logo Display */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-yellow-500 overflow-hidden shadow-xl bg-neutral-900 flex items-center justify-center mb-2">
          <img src={logo} alt="Legit Tutors Logo" className="w-full h-full object-cover" />
        </div>

        <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold border border-yellow-500/40 px-4 py-1 rounded-full">
          Excellence Through Preparation
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Achieve Your Dream Score with <span className="text-yellow-500">LEGIT TUTORS</span>
        </h1>
        
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl">
          Preparing students for success in JAMB, WAEC, NECO, GCE, and Post-UTME through expert teaching, CBT training, and academic excellence.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-lg transition-all shadow-lg">
            Register Now
          </Link>
          
          {!Capacitor.isNativePlatform() && (
            <a 
             href="../../download/Legit-tutors.apk"

              target="_blank" 
              rel="noopener noreferrer"
              download="Legit-tutors.apk"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25L15 12 3 5.25v2.25h18V16.5H3zM15 12l6-6m0 0v6m0-6H9" />
              </svg>
              Download Our App
            </a>
          )}
        </div>
      </div>
    </div>
  );
}