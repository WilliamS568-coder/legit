import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    // 2. Fetch user profile role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle(); // maybeSingle avoids throwing errors if row is missing

    if (profileError || !profileData) {
      setErrorMsg('User authenticated, but profile record was not found.');
      setLoading(false);
      return;
    }

    // 3. Route based on role
    if (profileData.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/student-dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-neutral-900 border border-yellow-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white mb-1 cursor-pointer" onClick={() => navigate('/')}>
            LEGIT <span className="text-yellow-500">TUTORS</span>
          </h1>
          <h2 className="text-sm sm:text-base text-gray-400 font-medium">Portal Login</h2>
        </div>

        {/* Inline Notification Banner */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-xs sm:text-sm">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="flex justify-end mb-6">
            <button type="button" className="text-xs sm:text-sm text-yellow-500 hover:text-yellow-400 hover:underline transition-all">
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm sm:text-base p-3 rounded-lg transition-all shadow-md cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-yellow-500 font-semibold hover:underline">
            Register here
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