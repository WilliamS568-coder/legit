import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFee, setSelectedFee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const navigate = useNavigate();

  const feesList = [
    {
      title: "Registration Fee for Lesson",
      amount: "₦2,000",
      description: "One-time registration fee required to enroll in the lesson center and set up your student portal profile."
    },
    {
      title: "Lesson Fee",
      amount: "₦10,000",
      description: "Monthly or termly tuition fee covering all physical/online lectures, CBT practice sessions, and study materials."
    },
    {
      title: "JAMB Registration (Without Mock)",
      amount: "₦12,000",
      description: "Covers official UTME profile creation, e-PIN vending, and registration processing without the optional mock exam."
    },
    {
      title: "JAMB Registration (With Mock)",
      amount: "₦15,000",
      description: "Covers official UTME registration plus inclusion for the high-success JAMB Mock examination center booking."
    },
    {
      title: "WAEC Registration (Without Logistics)",
      amount: "₦70,000",
      description: "Standard WAEC examination registration fee excluding extra logistical or specialized practical dispatch costs."
    },
    {
      title: "NECO Registration (Without Logistics)",
      amount: "₦65,000",
      description: "Standard NECO examination registration fee excluding logistics and center-specific handling fees."
    }
  ];

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchStudentData = async () => {
    setLoading(true);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      navigate('/login');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) setProfile(profileData);

    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', user.id);

    if (paymentsData) {
      setPaidFees(paymentsData.map(p => p.fee_title));
    }

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);

    const { data: galleryData } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (galleryData) setGallery(galleryData);

    setLoading(false);
  };

  const handleApplyClick = (fee) => {
    setSelectedFee(fee);
    setIsModalOpen(true);
  };

  const handlePaystackPayment = async () => {
    if (!selectedFee || !profile) return;
    setPaying(true);

    const reference = 'LT-' + Math.floor(Math.random() * 1000000000);

    setTimeout(async () => {
      const { error } = await supabase.from('payments').insert([
        {
          student_id: profile.id,
          fee_title: selectedFee.title,
          amount: selectedFee.amount,
          reference: reference,
          status: 'Paid'
        }
      ]);

      if (error) {
        alert('Error saving payment record: ' + error.message);
      } else {
        setPaidFees([...paidFees, selectedFee.title]);
        alert(`Payment successful! Verified by Paystack. Reference: ${reference}`);
      }

      setPaying(false);
      setIsModalOpen(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p className="text-yellow-500 font-semibold animate-pulse text-center">Loading your student portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      
      {/* Top Navbar Header */}
      <header className="bg-neutral-900 border-b border-yellow-500/20 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-wider cursor-pointer text-center sm:text-left" onClick={() => navigate('/')}>
          LEGIT <span className="text-yellow-500">STUDENT PORTAL</span>
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button 
            onClick={() => navigate('/contact')}
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-3 py-2 rounded-lg transition-all font-semibold cursor-pointer"
          >
            Support
          </button>
          <button 
            onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-3 py-2 rounded-lg transition-all font-semibold cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        
        {/* Welcome Card */}
        <div className="bg-neutral-900 border border-yellow-500/30 p-5 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Welcome back, <span className="text-yellow-500 break-all">{profile?.full_name || 'Student'}</span>!
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">Manage your fees, view announcements, and track your clearance.</p>
          </div>
        </div>

        {/* Fee Structure Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-yellow-500 border-b border-neutral-800 pb-2">Fees & Examination Schedules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {feesList.map((item, index) => {
              const isPaid = paidFees.includes(item.title);
              return (
                <div 
                  key={index} 
                  className="bg-neutral-900 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-white">{item.title}</h4>
                    <p className="text-xl sm:text-2xl font-extrabold text-yellow-500">{item.amount}</p>
                    <p className="text-xs text-gray-400 line-clamp-3">{item.description}</p>
                  </div>

                  <div className="mt-6">
                    {isPaid ? (
                      <div className="w-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-2.5 rounded-xl text-xs sm:text-sm text-center">
                        Paid ✓
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleApplyClick(item)}
                        className="w-full bg-neutral-950 border border-yellow-500/40 hover:bg-yellow-500 hover:text-black text-yellow-500 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-yellow-500 border-b border-neutral-800 pb-2">Latest Announcements</h3>
          {posts.length === 0 ? (
            <div className="bg-neutral-900 border border-yellow-500/20 p-6 rounded-xl text-center text-xs sm:text-sm text-gray-400">
              No announcements posted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {posts.map((post) => (
                <div key={post.id} className="bg-neutral-900 border border-yellow-500/20 p-4 sm:p-5 rounded-xl shadow-lg flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white mb-2">{post.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line mb-4 break-all">{post.body}</p> 
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Responsive Popup Modal */}
      {isModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-neutral-900 border border-yellow-500/30 rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-5 shadow-2xl relative my-auto">
            
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs uppercase font-semibold text-yellow-500 tracking-wider">Fee Breakdown & Details</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white break-words">{selectedFee.title}</h3>
              <p className="text-2xl sm:text-3xl font-black text-yellow-500">{selectedFee.amount}</p>
            </div>

            <div className="bg-neutral-950 p-3 sm:p-4 rounded-xl border border-yellow-500/10 space-y-1">
              <p className="text-xs font-semibold text-gray-300">What this covers:</p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">{selectedFee.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={paying}
                className="w-full sm:flex-1 bg-neutral-950 border border-neutral-700 hover:bg-neutral-800 text-gray-300 font-semibold py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button 
                onClick={handlePaystackPayment}
                disabled={paying}
                className="w-full sm:flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {paying ? 'Verifying Payment...' : 'Pay with Paystack'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}