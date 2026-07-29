import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 pr-12 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <Link to="/forgot-password" className="text-xs sm:text-sm text-yellow-500 hover:text-yellow-400 hover:underline transition-all">
              Forgot password?
            </Link>
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