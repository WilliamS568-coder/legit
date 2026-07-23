import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    
    // Get current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      navigate('/login');
      return;
    }

    // Fetch student profile details
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
    } else {
      setProfile(profileData);
    }

    // Fetch announcements / posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);

    // Fetch gallery images
    const { data: galleryData } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (galleryData) setGallery(galleryData);

    setLoading(false);
  };

  // Handler for Paystack payment integration
  const handlePaystackPayment = () => {
    // You can integrate Paystack popup or redirect here using your Paystack public key
    alert('Redirecting to Paystack secure checkout...');
    
    // Example: Integration code structure using react-paystack or standard popup
    // const handler = PaystackPop.setup({
    //   key: 'your_paystack_public_key',
    //   email: profile?.email,
    //   amount: 500000, // Amount in kobo (e.g., 5000 NGN)
    //   callback: function(response) {
    //     alert('Payment complete! Reference: ' + response.reference);
    //     // Call backend webhook or update status
    //   },
    // });
    // handler.openIframe();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-yellow-500 font-semibold animate-pulse">Loading your student portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Top Navbar Header */}
        <header className="bg-neutral-900 border-b border-yellow-500/20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-wider cursor-pointer" onClick={() => navigate('/')}>
              LEGIT <span className="text-yellow-500">STUDENT PORTAL</span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate('/contact')}
              className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer whitespace-nowrap"
            >
              Contact Support
            </button>
            <button 
              onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
              className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Welcome & Fee Status Card */}
        <div className="bg-neutral-900 border border-yellow-500/30 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome back, <span className="text-yellow-500">{profile?.full_name || 'Student'}</span>!
            </h2>
            <p className="text-sm text-gray-400">Access your lectures, announcements, and track your payment clearance.</p>
          </div>

          <div className="bg-neutral-950 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div>
              <p className="text-xs text-gray-400">Fee Status</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${profile?.fee_status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'}`}>
                {profile?.fee_status || 'Pending'}
              </span>
            </div>

            {profile?.fee_status !== 'Paid' && (
              <button 
                onClick={handlePaystackPayment}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-xs transition-all shadow cursor-pointer"
              >
                Pay via Paystack
              </button>
            )}
          </div>
        </div>

        {/* Announcements / Latest Content Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-yellow-500 border-b border-neutral-800 pb-2">Latest Announcements</h3>
          
          {posts.length === 0 ? (
            <div className="bg-neutral-900 border border-yellow-500/20 p-6 rounded-xl text-center text-gray-400">
              No announcements posted yet. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {posts.map((post) => (
  <div key={post.id} className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg flex flex-col justify-between">
    <div>
      <h4 className="font-bold text-base text-white mb-2">{post.title}</h4>
      {/* Added break-words and overflow-hidden here */}
  <p className="text-sm text-gray-300 whitespace-pre-line mb-4 break-all">{post.body}</p> </div>
    <span className="text-xs text-gray-500">
      {new Date(post.created_at).toLocaleDateString()}
    </span>
  </div>
))}
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-yellow-500 border-b border-neutral-800 pb-2">Gallery Showcase</h3>
          
          {gallery.length === 0 ? (
            <div className="bg-neutral-900 border border-yellow-500/20 p-6 rounded-xl text-center text-gray-400">
              No gallery images uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="bg-neutral-900 border border-yellow-500/20 rounded-xl overflow-hidden shadow-lg flex flex-col">
                  <div className="h-48 overflow-hidden bg-neutral-950">
                    <img 
                      src={item.image_url} 
                      alt={item.caption} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-200">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}