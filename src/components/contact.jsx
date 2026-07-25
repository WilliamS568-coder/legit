import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const whatsappNumber = '2348120204790';

    // Construct formatted message for WhatsApp
    const textMessage = 
      `*New Message from LEGIT TUTORS - official Website*\n\n` +
      `*Full Name:* ${formData.name}\n` +
      `*Email Address:* ${formData.email}\n` +
      `*Message:* ${formData.message}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(textMessage);
    
    // Open WhatsApp link
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    setSubmitting(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Top Navbar Header */}
      <header className="bg-neutral-900 border-b border-yellow-500/25 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-wider cursor-pointer" onClick={() => navigate('/')}>
          LEGIT <span className="text-yellow-500">TUTORS</span>
        </h1>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer"
        >
          Portal Login
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 my-auto">
        
        {/* Header Intro */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Get in <span className="text-yellow-500">Touch</span></h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Have questions about admissions, screenings, or platform access? Send us a message and it will route straight to our WhatsApp line.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-6 py-2 rounded-lg transition-all font-semibold cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Contact Details Info Box */}
          <div className="bg-neutral-900 border border-yellow-500/20 p-6 rounded-2xl shadow-xl space-y-6 md:col-span-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-yellow-500 border-b border-neutral-800 pb-2">Contact Info</h3>
              
              <div>
                <p className="text-xs text-gray-400 font-medium">Email Support</p>
                <p className="text-sm text-gray-200 mt-1"> legittutors8@gmail.com</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Helpline / WhatsApp</p>
                <p className="text-sm text-gray-200 mt-1">+234 812 020 4790</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Office Hours</p>
                <p className="text-sm text-gray-200 mt-1">Mon - Saturday: 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t border-neutral-800">
              Official student consultation and support portal.
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-neutral-900 border border-yellow-500/20 p-6 sm:p-8 rounded-2xl shadow-xl md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Solomon Williams" 
                  className="w-full bg-neutral-950 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@gmail.com" 
                  className="w-full bg-neutral-950 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Message Body</label>
                <textarea 
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message or inquiry here..." 
                  className="w-full bg-neutral-950 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none break-all"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Redirecting to WhatsApp...' : 'Send Message via WhatsApp'}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}