import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'paid', 'transactions', 'attendance', 'content', 'gallery'
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  // Content & Gallery Post States
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    
    // Fetch students/profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      alert('Error fetching students: ' + profilesError.message);
    } else {
      setStudents(profilesData || []);
    }

    // Fetch individual payment transaction records
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        profiles:student_id (full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching transactions:', paymentsError.message);
    } else {
      setTransactions(paymentsData || []);
    }

    // Fetch attendance records with student profile info
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles:student_id (full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError.message);
    } else {
      setAttendanceRecords(attendanceData || []);
    }

    setLoading(false);
  };

  const handlePostContent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase
      .from('posts')
      .insert([{ title: postTitle, body: postBody }]);

    if (error) {
      alert('Error posting content: ' + error.message);
    } else {
      alert('Content posted successfully!');
      setPostTitle('');
      setPostBody('');
    }
    setSubmitting(false);
  };

  const handlePostGallery = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('gallery')
      .insert([{ image_url: galleryImageUrl, caption: galleryCaption }]);

    if (error) {
      alert('Error uploading to gallery: ' + error.message);
    } else {
      alert('Picture added to gallery successfully!');
      setGalleryCaption('');
      setGalleryImageUrl('');
    }
    setSubmitting(false);
  };

  const paidStudents = students.filter(s => s.fee_status === 'Paid');
  const pendingStudents = students.filter(s => s.fee_status !== 'Paid');
  
  // Calculate total revenue collected from raw amounts
  const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.raw_amount || 0), 0);

  // Filter attendance records by today or chosen date
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(rec => rec.date === todayDateStr);
  const filteredAttendance = attendanceRecords.filter(rec => rec.date === selectedDate);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Top Navbar Header */}
      <header className="bg-neutral-900 border-b border-yellow-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-wider cursor-pointer" onClick={() => navigate('/')}>
            LEGIT <span className="text-yellow-500">ADMIN PORTAL</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/contact')}
            className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer"
          >
            Contact Support
          </button>
          <button 
            onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
            className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Total Registered</p>
            <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          </div>
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">₦{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Paid Profiles</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{paidStudents.length}</p>
          </div>
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{pendingStudents.length}</p>
          </div>
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Present Today</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{todayAttendance.length}</p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4">
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'students' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            All Students ({students.length})
          </button>
          <button 
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'paid' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Paid Students ({paidStudents.length})
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'transactions' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Payment Transactions ({transactions.length})
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'attendance' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Attendance Logs ({todayAttendance.length} Today)
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'content' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Post Content
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'gallery' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Manage Gallery
          </button>
        </div>

        {/* TAB 1 & 2: Students Tables */}
        {(activeTab === 'students' || activeTab === 'paid') && (
          <div className="bg-neutral-900 border border-yellow-500/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-yellow-500">
                {activeTab === 'students' ? 'All Registered Students' : 'Verified Paid Students'}
              </h2>
              <button onClick={fetchAdminData} className="text-xs bg-neutral-950 border border-yellow-500/30 px-3 py-1.5 rounded text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all cursor-pointer">
                Refresh List
              </button>
            </div>

            {loading ? (
              <p className="p-6 text-center text-gray-400">Loading student records...</p>
            ) : (activeTab === 'students' ? students : paidStudents).length === 0 ? (
              <p className="p-6 text-center text-gray-400">No student records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-xs text-gray-400 uppercase bg-neutral-950">
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Fee Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-sm">
                    {(activeTab === 'students' ? students : paidStudents).map((student) => (
                      <tr key={student.id} className="hover:bg-neutral-950/50">
                        <td className="p-4 font-semibold text-white">{student.full_name || 'N/A'}</td>
                        <td className="p-4 text-gray-300">{student.email || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${student.fee_status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'}`}>
                            {student.fee_status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Transactions & Installment Tracker */}
        {activeTab === 'transactions' && (
          <div className="bg-neutral-900 border border-yellow-500/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-yellow-500">Student Payment & Installment Transactions</h2>
              <button onClick={fetchAdminData} className="text-xs bg-neutral-950 border border-yellow-500/30 px-3 py-1.5 rounded text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all cursor-pointer">
                Refresh Transactions
              </button>
            </div>

            {loading ? (
              <p className="p-6 text-center text-gray-400">Loading payment logs...</p>
            ) : transactions.length === 0 ? (
              <p className="p-6 text-center text-gray-400">No payment transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-gray-400 uppercase bg-neutral-950">
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Fee Title</th>
                      <th className="p-4">Amount Paid</th>
                      <th className="p-4">Status / Balance</th>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-gray-300">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-950/50">
                        <td className="p-4 font-semibold text-white">{tx.profiles?.full_name || 'Unknown Student'}</td>
                        <td className="p-4 text-gray-200">{tx.fee_title}</td>
                        <td className="p-4 text-yellow-400 font-bold">{tx.amount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${tx.status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-gray-400 text-xs">{tx.reference}</td>
                        <td className="p-4 text-gray-400 text-xs">{new Date(tx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Attendance Management */}
        {activeTab === 'attendance' && (
          <div className="bg-neutral-900 border border-yellow-500/20 rounded-2xl shadow-xl overflow-hidden space-y-4">
            <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="font-bold text-lg text-yellow-500">Class Attendance Logs</h2>
                <p className="text-xs text-gray-400">Filter attendance logs by specific session dates.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-neutral-950 border border-yellow-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
                <button onClick={fetchAdminData} className="text-xs bg-neutral-950 border border-yellow-500/30 px-3 py-1.5 rounded text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all cursor-pointer whitespace-nowrap">
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <p className="p-6 text-center text-gray-400">Loading attendance records...</p>
            ) : filteredAttendance.length === 0 ? (
              <p className="p-6 text-center text-gray-400">No attendance marked for {selectedDate}.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-gray-400 uppercase bg-neutral-950">
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-gray-300">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-neutral-950/50">
                        <td className="p-4 font-semibold text-white">{rec.profiles?.full_name || 'Unknown Student'}</td>
                        <td className="p-4 text-gray-300">{rec.profiles?.email || 'N/A'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                            {rec.status || 'Present'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300 font-mono text-xs">{rec.date}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Post Content */}
        {activeTab === 'content' && (
          <div className="max-w-xl bg-neutral-900 border border-yellow-500/20 p-6 rounded-2xl shadow-xl">
            <h2 className="font-bold text-lg text-yellow-500 mb-4">Post Announcement or Content</h2>
            <form onSubmit={handlePostContent} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Title</label>
                <input 
                  type="text" 
                  value={postTitle} 
                  onChange={(e) => setPostTitle(e.target.value)} 
                  required
                  placeholder="e.g., Post-UTME Registration Deadline Update"
                  className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Content Body</label>
                <textarea 
                  rows="4" 
                  value={postBody} 
                  onChange={(e) => setPostBody(e.target.value)} 
                  required
                  placeholder="Write full details here..."
                  className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-sm transition-all cursor-pointer"
              >
                {submitting ? 'Posting...' : 'Publish Content'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: Manage Gallery */}
        {activeTab === 'gallery' && (
          <div className="max-w-xl bg-neutral-900 border border-yellow-500/20 p-6 rounded-2xl shadow-xl">
            <h2 className="font-bold text-lg text-yellow-500 mb-4">Upload Picture to Gallery Section</h2>
            <form onSubmit={handlePostGallery} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Image URL</label>
                <input 
                  type="url" 
                  value={galleryImageUrl} 
                  onChange={(e) => setGalleryImageUrl(e.target.value)} 
                  required
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Caption / Description</label>
                <input 
                  type="text" 
                  value={galleryCaption} 
                  onChange={(e) => setGalleryCaption(e.target.value)} 
                  required
                  placeholder="e.g., CBT Practice Session 2026"
                  className="w-full bg-neutral-950 border border-yellow-500/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-sm transition-all cursor-pointer"
              >
                {submitting ? 'Uploading...' : 'Add to Gallery'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}