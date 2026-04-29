import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../api';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { PlusCircle, Clock, CheckCircle, AlertTriangle, XCircle, Search, Filter, Eye, MapPin, Star, Award, MessageSquare, FileText, Share2 } from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [civicPoints, setCivicPoints] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null); // { complaints: [], type: '' }
  
  // Registration Form State
  const [formData, setFormData] = useState({ title: '', description: '', issueType: 'Road', priority: 'Medium', lat: '', lng: '' });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [autoDetected, setAutoDetected] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState('');

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCivicPoints(res.data.civicPoints);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/complaints`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchUserData();
  }, []);

  // AI Auto-Categorization based on Description
  useEffect(() => {
    if (!formData.description) {
      setAutoDetected(false);
      return;
    }
    const text = formData.description.toLowerCase();
    let newType = null;
    
    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('drain')) newType = 'Water';
    else if (text.includes('road') || text.includes('pothole') || text.includes('street') || text.includes('traffic')) newType = 'Road';
    else if (text.includes('trash') || text.includes('garbage') || text.includes('waste') || text.includes('bin')) newType = 'Garbage';
    else if (text.includes('clean') || text.includes('sanitation') || text.includes('dirty') || text.includes('smell')) newType = 'Sanitation';
    
    if (newType && newType !== formData.issueType) {
      setFormData(prev => ({ ...prev, issueType: newType }));
      setAutoDetected(true);
    } else if (!newType) {
      setAutoDetected(false);
    }
  }, [formData.description]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('📡 Acquiring GPS signal...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        setLocationStatus(`📍 Location captured! (±${Math.round(accuracy)}m accuracy)`);
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) msg = '❌ Location permission denied. Please allow location access.';
        else if (err.code === err.TIMEOUT) msg = '⏱ Location timed out. Please try again or enter coordinates manually.';
        setLocationStatus(msg);
      },
      {
        enableHighAccuracy: true,  // request GPS instead of network/IP
        timeout: 15000,            // wait up to 15 seconds
        maximumAge: 0              // never use a cached position
      }
    );
  };

  const handleSubmit = async (e, forceSubmit = false) => {
    e.preventDefault();

    // Duplicate detection (skip if user chose to force submit)
    if (!forceSubmit) {
      try {
        const params = new URLSearchParams({ issueType: formData.issueType });
        if (formData.lat) params.append('lat', formData.lat);
        if (formData.lng) params.append('lng', formData.lng);
        const dupRes = await axios.get(`${API_BASE}/api/complaints/check-duplicate?${params}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (dupRes.data.duplicate) {
          setDuplicateWarning(dupRes.data);
          return; // Stop submission — show warning modal
        }
      } catch (err) {
        console.error('Duplicate check failed', err);
      }
    }
    setDuplicateWarning(null);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('issueType', formData.issueType);
    data.append('priority', formData.priority);
    if (formData.lat) data.append('lat', formData.lat);
    if (formData.lng) data.append('lng', formData.lng);
    
    if (files.length > 0) {
      files.forEach(f => data.append('images', f));
    }

    try {
      await axios.post(`${API_BASE}/api/complaints`, data, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowModal(false);
      setFormData({ title: '', description: '', issueType: 'Road', priority: 'Medium', lat: '', lng: '' });
      setFiles([]);
      setError('');
      setLocationStatus('');
      fetchComplaints();
      setSuccessMessage('Your complaint registered successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this complaint?")) return;
    try {
      await axios.put(`${API_BASE}/api/complaints/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchComplaints();
    } catch (err) {
      console.error('Error cancelling complaint:', err);
      alert(err.response?.data?.message || 'Failed to cancel complaint');
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/community`);
    alert('Public link copied to clipboard!');
  };

  const submitFeedback = async (id) => {
    try {
      const res = await axios.put(`${API_BASE}/api/complaints/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFeedbackSubmitted(true);
      fetchComplaints();
      setSelectedComplaint(res.data.complaint);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/api/complaints/${selectedComplaint._id}/messages`, { text: chatMessage }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSelectedComplaint(res.data);
      setChatMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Escalated': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold inline-block mt-1">High Priority</span>;
      case 'Medium': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold inline-block mt-1">Medium Priority</span>;
      case 'Low': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold inline-block mt-1">Low Priority</span>;
      default: return null;
    }
  };

  const getEstimatedTime = (deadline, status) => {
    if (status === 'Resolved') return <span className="text-green-500 font-medium">Resolved</span>;
    if (status === 'Cancelled') return <span className="text-gray-400 font-medium">Cancelled</span>;
    
    const daysLeft = differenceInDays(new Date(deadline), new Date());
    if (daysLeft < 0) return <span className="text-red-500 font-bold">Overdue</span>;
    if (daysLeft === 0) return <span className="text-orange-500 font-bold">Due Today</span>;
    return <span className="text-blue-600 font-medium">{daysLeft} Days Left</span>;
  };

  const getCivicLevel = (points) => {
    if (points >= 100) return { title: 'Civic Hero 👑', color: 'text-purple-600 bg-purple-100' };
    if (points >= 50) return { title: 'Civic Contributor ⭐', color: 'text-blue-600 bg-blue-100' };
    return { title: 'Civic Starter 🌱', color: 'text-green-600 bg-green-100' };
  };

  const civicLevel = getCivicLevel(civicPoints);

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'Registered' || c.status === 'In Progress').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm ${civicLevel.color}`}>
            <Award className="w-6 h-6" />
            <div>
              <div className="text-sm">{civicLevel.title}</div>
              <div className="text-xs opacity-80">{civicPoints} Points</div>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 h-11">
            <PlusCircle className="w-5 h-5" />
            New Complaint
          </button>
             {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
          <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1">{t('citizen.totalSubmitted')}</p>
          <p className="text-3xl font-bold">{complaints.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-1">{t('citizen.pending')}</p>
          <p className="text-3xl font-bold">{complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Cancelled').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 font-semibold mb-1">{t('citizen.resolved')}</p>
          <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'Resolved').length}</p>
        </div>
      </div>  </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search complaints by title..." 
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select 
            className="input-field pl-10"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h2 className="text-xl font-bold mb-4 print:hidden">Your Complaints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Est. Time</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Submitted</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No complaints found.</td></tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.title}</div>
                      <div>{getPriorityBadge(c.priority)}</div>
                    </td>
                    <td className="py-3 px-4">{c.issueType}</td>
                    <td className="py-3 px-4 flex items-center gap-2 mt-2">
                      {getStatusIcon(c.status)}
                      <span className="text-sm font-medium">{c.status}</span>
                    </td>
                    <td className="py-3 px-4 text-sm">{getEstimatedTime(c.slaDeadline, c.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4 print:hidden">
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setSelectedComplaint(c);
                          setFeedbackSubmitted(false);
                          setFeedbackRating(5);
                          setFeedbackComment('');
                        }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-5 h-5" />
                        </button>
                        {c.status === 'Registered' && (
                          <button onClick={() => handleCancel(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Complaint">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Register a Complaint</h2>
            {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g., Pothole on Main St" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required className="input-field h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide details..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center justify-between">
                    <span>Category <span className="text-red-500">*</span></span>
                    {autoDetected && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">✨ Auto</span>}
                  </label>
                  <select className={`input-field ${autoDetected ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' : ''}`} value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value})}>
                    <option value="Road">Road</option>
                    <option value="Water">Water</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority <span className="text-red-500">*</span></label>
                  <select className="input-field" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={getLocation} className="btn-secondary flex-1 py-2 flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" /> Use Current Location
                  </button>
                </div>
                {locationStatus && (
                  <p className={`text-xs mt-2 ${locationStatus.startsWith('❌') || locationStatus.startsWith('⏱') ? 'text-red-500' : 'text-gray-500'}`}>
                    {locationStatus}
                  </p>
                )}
                {/* Manual fallback fields */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Latitude (optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 17.3850"
                      className="input-field py-1.5 text-sm"
                      value={formData.lat}
                      onChange={e => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Longitude (optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 78.4867"
                      className="input-field py-1.5 text-sm"
                      value={formData.lng}
                      onChange={e => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Evidence (Up to 3 Images)</label>
                <input type="file" multiple accept="image/*" onChange={e => {
                  if (e.target.files.length > 3) alert('Maximum 3 images allowed');
                  else setFiles(Array.from(e.target.files));
                }} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="card w-full max-w-md shadow-2xl border-2 border-orange-400">
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold">{t('complaint.duplicate.warning')}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('complaint.duplicate.message')}
            </p>
            <div className="space-y-4">
              <button 
                onClick={(e) => handleSubmit(e, true)} 
                className="btn-primary w-full py-3 bg-orange-600 hover:bg-orange-700"
              >
                {t('complaint.duplicate.submitAnyway')}
              </button>
              <button 
                onClick={() => setDuplicateWarning(null)} 
                className="btn-secondary w-full py-3"
              >
                {t('complaint.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:absolute print:inset-0">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedComplaint.title}</h2>
                <div className="mt-2">{getPriorityBadge(selectedComplaint.priority)}</div>
              </div>
              <div className="flex gap-2 print:hidden">
                <button onClick={() => copyToClipboard(selectedComplaint._id)} className="btn-secondary flex items-center gap-2 px-3 py-1 text-sm border-gray-300">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 px-3 py-1 text-sm border-gray-300">
                  <FileText className="w-4 h-4" /> Print PDF
                </button>
                <button onClick={() => setSelectedComplaint(null)} className="text-gray-500 hover:text-gray-700"><XCircle className="w-6 h-6"/></button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedComplaint.status)}
                  <span className="font-semibold">{selectedComplaint.status}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Est. Max Time</p>
                <p className="font-semibold mt-1">{getEstimatedTime(selectedComplaint.slaDeadline, selectedComplaint.status)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500">SLA Deadline</p>
                <p className="font-semibold mt-1">{format(new Date(selectedComplaint.slaDeadline), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedComplaint.description}</p>
            </div>

            {selectedComplaint.location && selectedComplaint.location.lat && (
              <div className="mb-6 print:hidden">
                <h3 className="font-bold mb-2">Location</h3>
                <a 
                  href={`https://www.google.com/maps?q=${selectedComplaint.location.lat},${selectedComplaint.location.lng}`} 
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg"
                >
                  <MapPin className="w-5 h-5" /> View on Google Maps
                </a>
              </div>
            )}

            {selectedComplaint.imageUrls && selectedComplaint.imageUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Evidence Gallery</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {selectedComplaint.imageUrls.map((url, idx) => (
                    <img key={idx} src={`${API_BASE}${url}`} alt={`Evidence ${idx+1}`} className="h-32 object-cover rounded-lg border flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 print:hidden">
              <h3 className="font-bold mb-4">Progress Timeline</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10"></div>
                {['Registered', 'In Progress', 'Resolved'].map((step, index) => {
                  const isCompleted = 
                    (selectedComplaint.status === 'Resolved') || 
                    (selectedComplaint.status === 'In Progress' && index <= 1) ||
                    (selectedComplaint.status === 'Registered' && index === 0);
                  const isCancelled = selectedComplaint.status === 'Cancelled';
                  
                  return (
                    <div key={step} className="flex flex-col items-center bg-white dark:bg-gray-900 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isCancelled ? 'border-gray-400 bg-gray-100 text-gray-400' :
                        isCompleted ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-300'
                      }`}>
                        {isCompleted && !isCancelled ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isCompleted && !isCancelled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Chat Section */}
            {selectedComplaint.status !== 'Cancelled' && (
              <div className="mb-6 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border border-blue-200 dark:border-gray-700 print:hidden">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <MessageSquare className="w-5 h-5" /> Live Chat with Officer
                </h3>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 h-48 overflow-y-auto mb-3 border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                  {selectedComplaint.messages && selectedComplaint.messages.length > 0 ? (
                    selectedComplaint.messages.map(msg => (
                      <div key={msg._id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-gray-500 mb-0.5">{msg.senderName}</span>
                        <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[80%] ${msg.senderId === user.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center mt-4">No messages yet. Send a message to the officer.</p>
                  )}
                </div>
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <input type="text" required value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type a message..." className="input-field py-2 flex-1" />
                  <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Send</button>
                </form>
              </div>
            )}

            {/* Feedback Section */}
            {selectedComplaint.status === 'Resolved' && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800 print:hidden">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" /> Feedback & Rating
                </h3>
                
                {selectedComplaint.feedback && selectedComplaint.feedback.rating ? (
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= selectedComplaint.feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{selectedComplaint.feedback.comment}"</p>
                  </div>
                ) : feedbackSubmitted ? (
                  <p className="text-green-600 font-medium">Thank you for your feedback!</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">How was this issue handled?</p>
                    <div className="flex gap-2 mb-4">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setFeedbackRating(star)} className="focus:outline-none">
                          <Star className={`w-8 h-8 ${star <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Leave a comment (optional)..." 
                      className="input-field h-20 mb-3 text-sm"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    ></textarea>
                    <button onClick={() => submitFeedback(selectedComplaint._id)} className="btn-primary w-full py-2">Submit Feedback</button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 print:hidden">
              {selectedComplaint.status === 'Registered' && (
                <button 
                  onClick={() => { handleCancel(selectedComplaint._id); setSelectedComplaint({ ...selectedComplaint, status: 'Cancelled' }); }} 
                  className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Complaint
                </button>
              )}
              <button onClick={() => setSelectedComplaint(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-[bounce_1s_ease-in-out]">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-2 hover:text-green-200">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
