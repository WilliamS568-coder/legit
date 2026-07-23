import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setSuccessMsg('Registration successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-neutral-900 border border-yellow-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white mb-1 cursor-pointer" onClick={() => navigate('/')}>
            LEGIT <span className="text-yellow-500">TUTORS</span>
          </h1>
          <h2 className="text-sm sm:text-base text-gray-400 font-medium">Student Registration</h2>
        </div>

        {/* Inline Notification Banners */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-xs sm:text-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-green-500/10 border border-green-500/40 text-green-400 p-3 rounded-lg text-xs sm:text-sm">
            {successMsg}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="student@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">Password (Min. 6 chars)</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm sm:text-base p-3 rounded-lg transition-all shadow-md cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-500 font-semibold hover:underline">
            Login here
          </Link>
        </p>
        
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-yellow-500 transition-colors">
            ← Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}