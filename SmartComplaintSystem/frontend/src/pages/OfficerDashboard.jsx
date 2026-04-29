import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../api';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { CheckCircle, AlertTriangle, Clock, XCircle, Search, Filter, MapPin, MessageSquare, Calendar } from 'lucide-react';
import CalendarView from '../components/CalendarView';

const OfficerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [chatMessage, setChatMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list');

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

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/workers`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchWorkers();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/api/complaints/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchComplaints();
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint({ ...selectedComplaint, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const assignWorker = async (id, workerId) => {
    try {
      await axios.put(`${API_BASE}/api/complaints/${id}/assign`, { workerId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchComplaints();
      if (selectedComplaint && selectedComplaint._id === id) {
        const worker = workers.find(w => w._id === workerId);
        setSelectedComplaint({ ...selectedComplaint, workerId: worker });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to assign worker');
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

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    try {
      await axios.post(`${API_BASE}/api/notifications/broadcast`, { message: broadcastMessage }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Broadcast sent to all workers successfully!');
      setBroadcastMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to send broadcast');
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

  // Stats calculation
  const totalAssigned = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'Registered' || c.status === 'In Progress').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'Escalated').length;

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Officer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your assigned complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border border-blue-100 dark:border-blue-900">
          <p className="text-gray-500 mb-1">Total Assigned</p>
          <p className="text-3xl font-bold">{totalAssigned}</p>
        </div>
        <div className="card border border-yellow-100 dark:border-yellow-900">
          <p className="text-gray-500 mb-1">Action Required</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingComplaints}</p>
        </div>
        <div className="card border border-red-100 dark:border-red-900">
          <p className="text-gray-500 mb-1">Escalated</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{escalatedComplaints}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search assigned complaints..." 
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

      <div className="card mb-6 border border-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="font-bold mb-2 text-blue-800 dark:text-blue-300">Broadcast to Workers</h2>
        <form onSubmit={sendBroadcast} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type an announcement to send to all workers..." 
            className="input-field flex-1"
            value={broadcastMessage}
            onChange={e => setBroadcastMessage(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Send Broadcast</button>
        </form>
      </div>

      <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button onClick={() => setActiveTab('list')} className={`font-bold pb-2 ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>List View</button>
        <button onClick={() => setActiveTab('map')} className={`font-bold pb-2 ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Map View</button>
        <button onClick={() => setActiveTab('calendar')} className={`font-bold pb-2 ${activeTab === 'calendar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Calendar View</button>
      </div>

      {activeTab === 'list' ? (
        <div className="card overflow-hidden">
          <h2 className="text-xl font-bold mb-4">Assigned Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Complaint Info</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Citizen</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">SLA Deadline</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Assigned To</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Update Status</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No complaints assigned.</td></tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-gray-500">{c.issueType}</div>
                      {getPriorityBadge(c.priority)}
                      {c.location && c.location.lat && (
                        <a 
                          href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`} 
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                        >
                          <MapPin className="w-3 h-3" /> Map
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">{c.userId?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm text-red-500 font-medium">
                      {format(new Date(c.slaDeadline), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(c.status)}
                        <span className="text-sm font-medium">{c.status}</span>
                        {c.isEscalated && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded border border-red-200">Escalated</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {c.workerId ? (
                        <span className="text-sm font-medium">{c.workerId.name}</span>
                      ) : (
                        <select 
                          className="input-field py-1 px-2 text-sm max-w-[140px]" 
                          onChange={(e) => {
                            if(e.target.value) assignWorker(c._id, e.target.value);
                          }}
                        >
                          <option value="">Unassigned</option>
                          {workers.map(w => (
                            <option key={w._id} value={w._id}>{w.name} ({w.activeTaskCount || 0} active)</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.status !== 'Resolved' && c.status !== 'Cancelled' ? (
                        <select 
                          className="input-field py-1 px-2 text-sm max-w-[140px]" 
                          value={c.status}
                          onChange={(e) => updateStatus(c._id, e.target.value)}
                        >
                          <option value="Registered">Registered</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No actions available</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelectedComplaint(c)} className="text-blue-600 hover:underline text-sm font-medium">View Full Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : activeTab === 'map' ? (
        <div className="card h-[600px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Complaint Geographic Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.filter(c => c.location && c.location.lat).map(c => (
              <div key={c._id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{c.title}</h3>
                  {getPriorityBadge(c.priority)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{c.issueType}</p>
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {c.workerId ? `Assigned to: ${c.workerId.name}` : 'Unassigned'}
                  </span>
                  <a 
                    href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`} 
                    target="_blank" rel="noreferrer"
                    className="btn-secondary text-sm py-1 px-3"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            ))}
            {filteredComplaints.filter(c => c.location && c.location.lat).length === 0 && (
              <p className="text-gray-500">No complaints with location data found.</p>
            )}
          </div>
        </div>
      ) : (
        <CalendarView />
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">{selectedComplaint.title}</h2>
            <p className="text-sm text-gray-500 mb-6">Reported by {selectedComplaint.userId?.name || 'Citizen'}</p>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">{selectedComplaint.description}</p>
            </div>

            {selectedComplaint.imageUrls && selectedComplaint.imageUrls.length > 0 ? (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Evidence Gallery</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {selectedComplaint.imageUrls.map((url, idx) => (
                    <img key={idx} src={`${API_BASE}${url}`} alt={`Evidence ${idx+1}`} className="h-32 object-cover rounded-lg border flex-shrink-0" />
                  ))}
                </div>
              </div>
            ) : selectedComplaint.imageUrl ? (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Evidence Image</h3>
                <img src={`${API_BASE}${selectedComplaint.imageUrl}`} alt="Evidence" className="w-full max-h-64 object-cover rounded-lg border" />
              </div>
            ) : null}

            {/* Live Chat Section */}
            {selectedComplaint.status !== 'Cancelled' && (
              <div className="mb-6 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border border-blue-200 dark:border-gray-700">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <MessageSquare className="w-5 h-5" /> Live Chat with Citizen
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
                    <p className="text-sm text-gray-500 text-center mt-4">No messages yet. Reply to the citizen.</p>
                  )}
                </div>
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <input type="text" required value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type a message..." className="input-field py-2 flex-1" />
                  <button type="submit" className="btn-primary py-2 px-4 rounded-lg">Send</button>
                </form>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setSelectedComplaint(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
