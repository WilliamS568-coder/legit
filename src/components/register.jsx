import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

// List of common disposable/fake email domains to block
const disposableDomains = ['tempmail.com', '10minutemail.com', 'trashmail.com', 'fakeemail.com', 'guerrillamail.com'];

const validateRealEmail = (email) => {
  // 1. Regex Syntax Check
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address format." };
  }

  const domain = email.split('@')[1].toLowerCase();

  // 2. Check for disposable fake emails
  if (disposableDomains.includes(domain)) {
    return { isValid: false, message: "Temporary or disposable email addresses are not allowed." };
  }

  // 3. Catch common typos in popular providers
  if (domain === 'gnail.com' || domain === 'gamil.com') {
    return { isValid: false, message: "Did you mean gmail.com?" };
  }
  if (domain === 'yaho.com') {
    return { isValid: false, message: "Did you mean yahoo.com?" };
  }

  return { isValid: true };
};

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Run Real Email Validation Check
    const emailCheck = validateRealEmail(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.message);
      return;
    }

    setLoading(true);

    // Check if the email is already registered before proceeding.
    // Supabase automatically rejects duplicate signups, but we catch both
    // possible responses so the user gets a clear message:
    //   1. An explicit error (e.g. "User already registered")
    //   2. signUp returning a user with an EMPTY `identities` array,
    //      which means no new account was actually created.
    let data, error;
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
      data = result.data;
      error = result.error;
    } catch (err) {
      error = err;
    }

    if (error) {
      // Explicit "already existing" errors from Supabase
      if (
        error.code === 'user_already_exists' ||
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already been registered') ||
        error.message?.toLowerCase().includes('already exists')
      ) {
        setErrorMsg('An account with this email already exists. Please login instead.');
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
      return;
    }

    // If Supabase returned a user object but NO new identity was created,
    // the email is already registered under an unconfirmed/existing account.
    const identities = data?.user?.identities;
    if (data?.user && Array.isArray(identities) && identities.length === 0) {
      setErrorMsg('An account with this email already exists. Please login instead.');
      setLoading(false);
      return;
    }

    setSuccessMsg('Registration successful! Comfirm your email...');
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
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