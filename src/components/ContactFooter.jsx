import { Link, useLocation } from 'react-router-dom';

export default function ContactFooter() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const renderLink = (href, children, className) => {
    const isAnchor = href.startsWith('#');
    
    if (isAnchor) {
      if (isHome) {
        return (
          <a href={href} className={className}>
            {children}
          </a>
        );
      } else {
        return (
          <Link to={`/${href}`} className={className}>
            {children}
          </Link>
        );
      }
    }
    
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  };
  
  return (
    <footer id="contact" className="bg-neutral-950 text-white border-t border-yellow-500/20 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
        
        {/* Column 1: About Brand */}
        <div>
          <h3 className="text-xl font-extrabold text-white mb-4">
            LEGIT <span className="text-yellow-500">TUTORS</span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Equipping students with the academic excellence, CBT training, and comprehensive preparation required to excel in JAMB, WAEC, NECO, GCE, and Post-UTME.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex gap-3">
            {/* WhatsApp */}
            <a href="https://wa.me/2348120204790" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-10 h-10 bg-neutral-900 border border-yellow-500/30 rounded-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a href="#" target="_blank" rel="noreferrer" aria-label="TikTok" className="w-10 h-10 bg-neutral-900 border border-yellow-500/30 rounded-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href="#" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 bg-neutral-900 border border-yellow-500/30 rounded-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
          </div>

          <Link to="/contact" className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-center py-3 rounded-lg transition-all shadow-md mt-4">
            Send Us a Message
          </Link>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-lg font-bold text-yellow-500 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>{renderLink("/", "Home", "hover:text-yellow-500 transition-colors")}</li>
            <li>{renderLink("#about", "About Us", "hover:text-yellow-500 transition-colors")}</li>
            <li>{renderLink("#services", "Our Services", "hover:text-yellow-500 transition-colors")}</li>
            <li>{renderLink("/gallery", "Photo Gallery", "hover:text-yellow-500 transition-colors")}</li>
            <li>{renderLink("/register", "Student Registration", "hover:text-yellow-500 transition-colors")}</li>
            <li>{renderLink("/contact", "Contact Us", "hover:text-yellow-500 transition-colors")}</li>
          </ul>
        </div>

        {/* Column 3: Contact Info with Clean SVG Icons */}
        <div>
          <h4 className="text-lg font-bold text-yellow-500 mb-4">Get In Touch</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>29, Adedayo Adedeji street, Wazobia B/Stop Abaranje-Ikotun, Lagos State.</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+234 812 020 4790</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span> legittutors8@gmail.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-6xl mx-auto border-t border-neutral-900 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} LEGIT TUTORS. All Rights Reserved. Designed for Academic Excellence.
      </div>
    </footer>
  );
}