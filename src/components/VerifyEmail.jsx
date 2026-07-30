import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function VerifyEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    const establishSession = async () => {
      try {
        // Get tokens from URL hash (Supabase includes them after email verification)
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Establish session - email is already verified by Supabase
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Session error:', error);
              return;
            }

            // Success! User is now authenticated with confirmed email
            if (data.user) {
              // Redirect to login after 2 seconds
              setTimeout(() => {
                navigate('/login');
              }, 2000);
            }
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    };

    establishSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-neutral-900 border border-green-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white mb-1">
            LEGIT <span className="text-yellow-500">TUTORS</span>
          </h1>
          <h2 className="text-base sm:text-lg text-green-400 font-semibold mt-2">
            Email Verified Successfully!
          </h2>
        </div>

        <div className="bg-green-500/10 border border-green-500/40 text-green-400 p-4 rounded-lg text-xs sm:text-sm mb-6">
          <p className="font-semibold mb-2">Your email has been successfully verified.</p>
          <p>You can now log in to access your student portal.</p>
        </div>

        <div className="space-y-3">
          <Link 
            to="/login"
            className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm sm:text-base p-3 rounded-lg transition-all shadow-md text-center cursor-pointer"
          >
            Proceed to Login
          </Link>
          
          <p className="text-center text-xs text-gray-400">
            Redirecting to login in 2 seconds...
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-yellow-500 transition-colors">
            ← Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}