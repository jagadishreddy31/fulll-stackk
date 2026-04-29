import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../api';
import { format } from 'date-fns';
import { MapPin, Image as ImageIcon, Users, ThumbsUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CommunityFeed = () => {
  const [complaints, setComplaints] = useState([]);

  const { user } = React.useContext(AuthContext);

  const fetchFeed = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/complaints/public`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const upvoteComplaint = async (id) => {
    if (!user) {
      alert('Please login to upvote.');
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/complaints/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchFeed();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upvote');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Users className="w-10 h-10 text-blue-600" />
          Community Feed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">See how your city is being improved in real-time.</p>
      </div>

      <div className="grid gap-6">
        {complaints.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No public reports yet.</p>
        ) : (
          complaints.map(c => (
            <div key={c._id} className="card flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
              {c.imageUrls && c.imageUrls.length > 0 ? (
                <img src={`${API_BASE}${c.imageUrls[0]}`} alt="Issue" className="w-full md:w-48 h-48 object-cover rounded-xl" />
              ) : (
                <div className="w-full md:w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{c.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    c.status === 'Resolved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                    c.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {c.issueType} Area</span>
                  <span>•</span>
                  <span>Reported {format(new Date(c.createdAt), 'MMM dd, yyyy')}</span>
                  {c.priority && (
                    <>
                      <span>•</span>
                      <span className={`font-semibold ${
                        c.priority === 'High' ? 'text-red-500' : c.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                      }`}>{c.priority} Priority</span>
                    </>
                  )}
                </div>
                
                {c.location && c.location.lat && (
                  <div className="mt-4 flex items-center justify-between">
                    <a 
                      href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`} 
                      target="_blank" rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" /> View public location
                    </a>
                    <button 
                      onClick={() => upvoteComplaint(c._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        user && c.upvotes && c.upvotes.includes(user.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {c.upvotes?.length || 0} Upvotes
                    </button>
                  </div>
                )}
                {(!c.location || !c.location.lat) && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => upvoteComplaint(c._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        user && c.upvotes && c.upvotes.includes(user.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {c.upvotes?.length || 0} Upvotes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
