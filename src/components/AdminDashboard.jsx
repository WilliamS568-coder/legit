import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'paid', 'content', 'gallery'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Content & Gallery Post States
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error fetching students: ' + error.message);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  // Function to simulate Paystack verification approval (updates fee status to Paid)
  const handleMarkAsPaid = async (studentId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ fee_status: 'Paid' })
      .eq('id', studentId);

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      alert('Student fee status updated to Paid successfully!');
      fetchStudents();
    }
  };

  const handlePostContent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Assuming you have a 'posts' or 'announcements' table
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

    // Assuming you have a 'gallery' table with columns image_url and caption
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
              className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold whitespace-nowrap"
            >
              Contact Support
            </button>
            <button 
              onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
              className="text-sm bg-neutral-950 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-lg transition-all font-semibold whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Total Registered</p>
            <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          </div>
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Paid Students</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{paidStudents.length}</p>
          </div>
          <div className="bg-neutral-900 border border-yellow-500/20 p-5 rounded-xl shadow-lg">
            <p className="text-sm text-gray-400">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{pendingStudents.length}</p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-neutral-800 pb-4">
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            All Students ({students.length})
          </button>
          <button 
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'paid' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Paid Students ({paidStudents.length})
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
          >
            Post Content
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gallery' ? 'bg-yellow-500 text-black shadow' : 'bg-neutral-900 text-gray-300 hover:text-yellow-500'}`}
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
              <button onClick={fetchStudents} className="text-xs bg-neutral-950 border border-yellow-500/30 px-3 py-1.5 rounded text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all">
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
                      <th className="p-4">Actions / Paystack Status</th>
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
                        <td className="p-4">
                          {student.fee_status !== 'Paid' ? (
                            <button 
                              onClick={() => handleMarkAsPaid(student.id)}
                              className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-black px-3 py-1 rounded text-xs font-bold transition-all"
                            >
                              Verify & Set Paid
                            </button>
                          ) : (
                            <span className="text-xs text-green-400 font-medium">✓ Verified & Cleared</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Post Content */}
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
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-sm transition-all"
              >
                {submitting ? 'Posting...' : 'Publish Content'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: Manage Gallery */}
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
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-sm transition-all"
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