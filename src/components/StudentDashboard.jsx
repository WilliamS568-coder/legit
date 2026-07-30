import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PaystackPop from '@paystack/inline-js';
import CBTSimulator from './CBTSimulator';
import NotificationDiagnostics from './NotificationDiagnostics';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFee, setSelectedFee] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [notification, setNotification] = useState(null);

  // Program Selection states
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [selectedProgramInput, setSelectedProgramInput] = useState('');
  const [selectedSessionInput, setSelectedSessionInput] = useState('Morning');

  // Attendance states
  const [checkingIn, setCheckingIn] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  // CBT Simulator states
  const [isCBTOpen, setIsCBTOpen] = useState(false);

  const navigate = useNavigate();

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const feesList = [
    {
      id: 'reg_fee',
      title: "Registration Fee for Lesson",
      amount: "₦2,000",
      rawAmount: 2000,
      allowCustom: false,
      description: "One-time registration fee required to enroll in the lesson center and set up your student portal profile."
    },
    {
      id: 'lesson_fee',
      title: "Monthly Lesson Fee",
      amount: "₦10,000",
      rawAmount: 10000,
      allowCustom: true,
      description: "Monthly tuition fee covering all lectures and materials. You can pay in full or enter a custom part-payment amount."
    },
    {
      id: 'jamb_wo_mock',
      title: "JAMB Registration (Without Mock)",
      amount: "₦12,000",
      rawAmount: 12000,
      allowCustom: false,
      description: "Covers official UTME profile creation, e-PIN vending, and registration processing without the optional mock exam."
    },
    {
      id: 'jamb_w_mock',
      title: "JAMB Registration (With Mock)",
      amount: "₦15,000",
      rawAmount: 15000,
      allowCustom: false,
      description: "Covers official UTME registration plus inclusion for the high-success JAMB Mock examination center booking."
    },
    {
      id: 'waec',
      title: "WAEC Registration (Without Logistics)",
      amount: "₦70,000",
      rawAmount: 70000,
      allowCustom: true,
      description: "Standard WAEC examination registration fee. You can pay in installments using custom amounts."
    },
    {
      id: 'neco',
      title: "NECO Registration (Without Logistics)",
      amount: "₦65,000",
      rawAmount: 65000,
      allowCustom: true,
      description: "Standard NECO examination registration fee. You can pay in installments using custom amounts."
    }
  ];

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (isModalOpen || isProgramModalOpen || isCBTOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isProgramModalOpen, isCBTOpen]);

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

    if (profileData) {
      setProfile(profileData);
      if (!profileData.selected_program) {
        setIsProgramModalOpen(true);
      }
    }

    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (paymentsData) {
      setPaymentsHistory(paymentsData);
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

    const today = new Date().toISOString().split('T')[0];
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (attendanceData) {
      setAlreadyCheckedIn(true);
      setAttendanceMsg('Attendance already recorded for today.');
    }

    setLoading(false);
  };

  const handleSaveProgram = async () => {
    if (!selectedProgramInput) {
      showNotification('error', 'Please select a program.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fullProgramString = `${selectedProgramInput} (${selectedSessionInput} Session)`;

    const { error } = await supabase
      .from('profiles')
      .update({ selected_program: fullProgramString })
      .eq('id', user.id);

    if (error) {
      showNotification('error', 'Failed to save program: ' + error.message);
    } else {
      showNotification('success', 'Program selected successfully!');
      setProfile(prev => ({ ...prev, selected_program: fullProgramString }));
      setIsProgramModalOpen(false);
    }
  };

  const handleMarkAttendance = async () => {
    setCheckingIn(true);
    setAttendanceMsg('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAttendanceMsg('Error: Not authenticated');
      setCheckingIn(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('attendance')
      .insert([{ student_id: user.id, date: today, status: 'Present' }]);

    if (error) {
      if (error.code === '23505') {
        setAlreadyCheckedIn(true);
        setAttendanceMsg('You have already marked attendance for today!');
      } else {
        setAttendanceMsg('Error: ' + error.message);
      }
    } else {
      setAlreadyCheckedIn(true);
      setAttendanceMsg('Attendance marked successfully for today!');
      showNotification('success', 'Attendance marked successfully!');
    }
    setCheckingIn(false);
  };

  const handleApplyClick = (fee) => {
    setSelectedFee(fee);
    setCustomAmount(fee.rawAmount.toString());
    setIsModalOpen(true);
  };

  const handlePaystackPayment = () => {
    if (!selectedFee || !profile) return;

    const amountToPay = selectedFee.allowCustom ? Number(customAmount) : selectedFee.rawAmount;

    if (!amountToPay || amountToPay <= 0) {
      showNotification('error', 'Please enter a valid amount.');
      return;
    }

    if (amountToPay > selectedFee.rawAmount) {
      showNotification('error', `Amount cannot exceed the total fee of ₦${selectedFee.rawAmount.toLocaleString()}`);
      return;
    }

    setPaying(true);

    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: profile.email,
      amount: amountToPay * 100,
      currency: 'NGN',
      ref: 'LT-' + Math.floor(Math.random() * 1000000000),
      onSuccess: async (transaction) => {
        const balance = selectedFee.rawAmount - amountToPay;
        const statusLabel = balance <= 0 ? 'Paid' : `Part-Payment (Bal: ₦${balance.toLocaleString()})`;

        const { error } = await supabase.from('payments').insert([
          {
            student_id: profile.id,
            fee_title: selectedFee.title,
            amount: `₦${amountToPay.toLocaleString()}`,
            raw_amount: amountToPay,
            balance_remaining: balance,
            reference: transaction.reference,
            status: statusLabel
          }
        ]);

        if (error) {
          showNotification('error', 'Payment successful, but failed to record in database: ' + error.message);
        } else {
          showNotification('success', `Payment verified successfully! Reference: ${transaction.reference}`);
          fetchStudentData();
        }
        setPaying(false);
        setIsModalOpen(false);
      },
      onCancel: () => {
        showNotification('info', 'Payment cancelled.');
        setPaying(false);
      }
    });
  };

  const getFeeStats = (feeTitle, totalRaw) => {
    const feeRecords = paymentsHistory.filter(p => p.fee_title === feeTitle);
    const totalPaid = feeRecords.reduce((sum, item) => sum + Number(item.raw_amount || 0), 0);
    const isFullyPaid = totalPaid >= totalRaw;
    return { totalPaid, isFullyPaid, feeRecords };
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
              Welcome back, <span className="text-yellow-500 whitespace-nowrap">{profile?.full_name || 'Student'}</span>!
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">Manage monthly lesson dues, view announcements, and track installment payments.</p>
          </div>
          <div className="bg-neutral-950 border border-yellow-500/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
            <span className="text-gray-400">Applied Program: </span>
            <span className="text-yellow-400 font-bold">{profile?.selected_program || 'Not Selected'}</span>
          </div>
        </div>

        {/* CBT Practice Card */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-yellow-500/40 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">JAMB CBT Practice</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Practice with live past questions from various subjects. Test your knowledge and track your performance.
            </p>
          </div>
          <button
            onClick={() => setIsCBTOpen(true)}
            className="w-full sm:w-auto font-bold px-6 py-3 rounded-xl text-xs sm:text-sm bg-yellow-500 hover:bg-yellow-400 text-black transition-all shadow-lg cursor-pointer"
          >
            Start CBT Practice
          </button>
        </div>

        {/* Daily Attendance Card */}
        <div className="bg-neutral-900 border border-yellow-500/30 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">Daily Class Attendance</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {alreadyCheckedIn 
                ? "You have successfully recorded your attendance for today." 
                : "Mark your attendance for today's session to log your presence."}
            </p>
            {attendanceMsg && (
              <p className={`text-xs font-semibold ${alreadyCheckedIn ? 'text-green-400' : 'text-yellow-400'}`}>
                {attendanceMsg}
              </p>
            )}
          </div>
          <button
            onClick={handleMarkAttendance}
            disabled={checkingIn || alreadyCheckedIn}
            className={`w-full sm:w-auto font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
              alreadyCheckedIn 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer shadow-lg'
            }`}
          >
            {checkingIn ? 'Processing...' : alreadyCheckedIn ? 'Marked Present ✓' : "Mark Attendance"}
          </button>
        </div>

        {/* Fee Structure Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-yellow-500 border-b border-neutral-800 pb-2">Fees & Examination Schedules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {feesList.map((item, index) => {
              const { totalPaid, isFullyPaid } = getFeeStats(item.title, item.rawAmount);
              
              return (
                <div 
                  key={index} 
                  className="bg-neutral-900 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-white">{item.title}</h4>
                    <p className="text-xl sm:text-2xl font-extrabold text-yellow-500">{item.amount}</p>
                    <p className="text-xs text-gray-400 line-clamp-3">{item.description}</p>
                    
                    {totalPaid > 0 && !isFullyPaid && (
                      <p className="text-xs text-yellow-400 font-medium">
                        Paid so far: ₦{totalPaid.toLocaleString()} (Bal: ₦{(item.rawAmount - totalPaid).toLocaleString()})
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    {isFullyPaid ? (
                      <div className="w-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-2.5 rounded-xl text-xs sm:text-sm text-center">
                        Paid in Full ✓
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleApplyClick(item)}
                        className="w-full bg-neutral-950 border border-yellow-500/40 hover:bg-yellow-500 hover:text-black text-yellow-500 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                      >
                        {totalPaid > 0 ? 'Pay Installment Balance' : 'Pay Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment History Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-yellow-500 border-b border-neutral-800 pb-2">Your Payment History & Monthly Breakdown</h3>
          {paymentsHistory.length === 0 ? (
            <div className="bg-neutral-900 border border-yellow-500/20 p-6 rounded-xl text-center text-xs sm:text-sm text-gray-400">
              No payment records found yet.
            </div>
          ) : (
            <div className="bg-neutral-900 border border-yellow-500/20 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-neutral-950 text-yellow-500 uppercase text-[10px] sm:text-xs border-b border-yellow-500/20">
                    <tr>
                      <th className="p-3 sm:p-4">Fee Title</th>
                      <th className="p-3 sm:p-4">Amount Paid</th>
                      <th className="p-3 sm:p-4">Status / Balance</th>
                      <th className="p-3 sm:p-4">Reference</th>
                      <th className="p-3 sm:p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-gray-300">
                    {paymentsHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-neutral-950/50 transition-colors">
                        <td className="p-3 sm:p-4 font-semibold text-white">{record.fee_title}</td>
                        <td className="p-3 sm:p-4 text-yellow-400 font-bold">{record.amount}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${record.status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs">{record.reference}</td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs">{new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

        {/* Notification Diagnostics Tool */}
        <NotificationDiagnostics />

      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 rounded-xl shadow-2xl border ${
          notification.type === 'success' 
            ? 'bg-green-500/10 border-green-500/40 text-green-400' 
            : notification.type === 'error'
            ? 'bg-red-500/10 border-red-500/40 text-red-400'
            : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CBT Simulator Modal */}
      {isCBTOpen && (
        <CBTSimulator onClose={() => setIsCBTOpen(false)} />
      )}

      {/* First-Time Program Selection Modal (Scrollable for mobile responsiveness) */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-neutral-900 border border-yellow-500/40 rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="space-y-1.5 text-center">
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">What are you applying for?</h3>
              <p className="text-xs sm:text-sm text-gray-400">Please choose your primary tutorial package and session to complete your profile setup.</p>
      
            </div>

            <div className="space-y-2.5">
              {['JAMB Lesson', 'NECO Tutorial', 'WAEC Tutorial', 'JAMB & WAEC Combo'].map((prog) => (
                <label 
                  key={prog} 
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedProgramInput === prog 
                      ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-bold' 
                      : 'bg-neutral-950 border-neutral-800 text-gray-300 hover:border-yellow-500/50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="userProgram" 
                    value={prog}
                    checked={selectedProgramInput === prog}
                    onChange={(e) => setSelectedProgramInput(e.target.value)}
                    className="accent-yellow-500"
                  />
                  <span className="text-xs sm:text-sm">{prog}</span>
                </label>
              ))}
            </div>
            {/* Session Selection (Morning / Night) */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-yellow-500">Choose Session:</label>
              <div className="grid grid-cols-2 gap-2.5">
                {['Morning', 'Evening'].map((session) => (
                  <button
                    key={session}
                    type="button"
                    onClick={() => setSelectedSessionInput(session)}
                    className={`py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedSessionInput === session
                        ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg'
                        : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:border-yellow-500/50'
                    }`}
                  >
                    {session} Session
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSaveProgram}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg cursor-pointer"
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      )}

      {/* Responsive Popup Modal with Custom Amount Option */}
      {isModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-neutral-900 border border-yellow-500/30 rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-5 shadow-2xl relative my-auto">
            
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs uppercase font-semibold text-yellow-500 tracking-wider">Fee Breakdown & Details</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white break-words">{selectedFee.title}</h3>
              <p className="text-2xl sm:text-3xl font-black text-yellow-500">{selectedFee.amount}</p>
            </div>

            <div className="bg-neutral-950 p-3 sm:p-4 rounded-xl border border-yellow-500/10 space-y-3">
              <p className="text-xs font-semibold text-gray-300">What this covers:</p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">{selectedFee.description}</p>
              
              {selectedFee.allowCustom && (
                <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                  <label className="text-xs font-semibold text-yellow-500">Enter amount you want to pay (₦):</label>
                  <input 
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    max={selectedFee.rawAmount}
                    min="100"
                    className="w-full bg-neutral-900 border border-yellow-500/40 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
                    placeholder="e.g. 4000"
                  />
                  <p className="text-[10px] text-gray-400">You can pay in parts. The remaining balance will be tracked automatically.</p>
                </div>
              )}
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
                {paying ? 'Connecting to Paystack...' : `Pay ₦${Number(selectedFee.allowCustom ? customAmount || 0 : selectedFee.rawAmount).toLocaleString()}`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}