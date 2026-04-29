import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../api';
import { AuthContext } from '../context/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { Clock, CheckCircle, AlertTriangle, XCircle, Eye, MapPin, MessageSquare } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [resolvedImage, setResolvedImage] = useState(null);

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
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'Resolved' && !resolvedImage) {
        alert('Please upload an image as proof of resolution.');
        return;
      }
      
      let data = { status: newStatus };
      let headers = { Authorization: `Bearer ${user.token}` };
      
      if (newStatus === 'Resolved' && resolvedImage) {
        data = new FormData();
        data.append('status', newStatus);
        data.append('resolvedImage', resolvedImage);
        headers['Content-Type'] = 'multipart/form-data';
      }

      await axios.put(`${API_BASE}/api/complaints/${id}/status`, data, { headers });
      fetchComplaints();
      setResolvedImage(null);
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const flagEmergency = async (id) => {
    if (!window.confirm('Are you sure you want to flag this as an EMERGENCY?')) return;
    try {
      await axios.put(`${API_BASE}/api/complaints/${id}/emergency`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchComplaints();
      alert('Emergency flagged successfully!');
      setSelectedComplaint(null);
    } catch (err) {
      console.error(err);
      alert('Failed to flag emergency');
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

  const totalAssigned = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
          <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Total Assigned</p>
          <p className="text-3xl font-bold">{totalAssigned}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-1">In Progress</p>
          <p className="text-3xl font-bold">{inProgress}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 font-semibold mb-1">Resolved</p>
          <p className="text-3xl font-bold">{resolved}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h2 className="text-xl font-bold mb-4">Assigned Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Assigned On</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No tasks assigned yet.</td></tr>
              ) : (
                complaints.map(c => (
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
                    <td className="py-3 px-4 text-sm text-gray-500">{format(new Date(c.updatedAt), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelectedComplaint(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedComplaint.title}</h2>
                <div className="mt-2">{getPriorityBadge(selectedComplaint.priority)}</div>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-gray-500 hover:text-gray-700"><XCircle className="w-6 h-6"/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Current Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedComplaint.status)}
                  <span className="font-semibold">{selectedComplaint.status}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Update Status</p>
                  <div className="flex flex-col gap-2">
                    {selectedComplaint.status === 'In Progress' && (
                      <div className="space-y-2">
                        <input type="file" accept="image/*" onChange={(e) => setResolvedImage(e.target.files[0])} className="text-sm block w-full" />
                        <button onClick={() => updateStatus(selectedComplaint._id, 'Resolved')} className="btn-primary py-1 px-3 text-sm bg-green-600 hover:bg-green-700 w-full">
                          Upload Proof & Mark as Resolved
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedComplaint.description}</p>
            </div>

            {selectedComplaint.location && selectedComplaint.location.lat && (
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Location</h3>
                  <a 
                    href={`https://www.google.com/maps?q=${selectedComplaint.location.lat},${selectedComplaint.location.lng}`} 
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg h-12"
                  >
                    <MapPin className="w-5 h-5" /> View on Map
                  </a>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Routing</h3>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedComplaint.location.lat},${selectedComplaint.location.lng}`} 
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-medium h-12 transition-colors"
                  >
                    <MapPin className="w-5 h-5" /> Get Directions
                  </a>
                </div>
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

            {/* Live Chat Section */}
            <div className="mb-6 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border border-blue-200 dark:border-gray-700">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <MessageSquare className="w-5 h-5" /> Communication Log
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
                  <p className="text-sm text-gray-500 text-center mt-4">No messages yet. Update the officer on your progress.</p>
                )}
              </div>
              <form onSubmit={sendChatMessage} className="flex gap-2">
                <input type="text" required value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type an update..." className="input-field py-2 flex-1" />
                <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Send</button>
              </form>
            </div>

            <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => flagEmergency(selectedComplaint._id)} className="btn-primary bg-red-600 hover:bg-red-700 border-none flex items-center gap-2 py-2">
                <AlertTriangle className="w-5 h-5" /> Flag Emergency
              </button>
              <button onClick={() => setSelectedComplaint(null)} className="btn-secondary py-2">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
