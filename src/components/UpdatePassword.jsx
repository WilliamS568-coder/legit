import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for password recovery token in URL hash
    const checkRecoveryToken = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'recovery') {
          // Establish session with the recovery token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session error:', error);
            setErrorMsg('Invalid or expired recovery link. Please request a new one.');
          }
        }
      }
    };

    checkRecoveryToken();
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
          <h2 className="text-sm sm:text-base text-gray-400 font-medium">Set New Password</h2>
        </div>

        {message && (
          <div className="mb-4 bg-green-500/10 border border-green-500/40 text-green-400 p-3 rounded-lg text-xs sm:text-sm">
            {message}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-xs sm:text-sm">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleUpdatePassword}>
          <div className="mb-6">
            <label className="block text-xs sm:text-sm text-gray-400 mb-2">New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm sm:text-base p-3 rounded-lg transition-all shadow-md cursor-pointer"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}