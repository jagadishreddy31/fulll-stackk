import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../api';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, Users, FolderOpen, AlertOctagon, Download, MapPin, Shield, CheckCircle, Clock, Calendar, Star, TrendingUp } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ 
    total: 0, resolved: 0, escalated: 0, inProgress: 0, 
    registeredToday: 0, resolvedToday: 0, solvingRatio: 0,
    categories: [], priorities: [], mappedComplaints: []
  });
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [slaConfig, setSlaConfig] = useState({ highPriorityHours: 24, mediumPriorityHours: 72, lowPriorityHours: 120 });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [officerMetrics, setOfficerMetrics] = useState([]); // overview, users, map

  const fetchData = async () => {
    try {
      const statsRes = await axios.get(`${API_BASE}/api/complaints/stats`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(statsRes.data);

      const deptRes = await axios.get(`${API_BASE}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDepartments(deptRes.data);

      const usersRes = await axios.get(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsersList(usersRes.data);

      const slaRes = await axios.get(`${API_BASE}/api/complaints/slaconfig`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (slaRes.data) {
        setSlaConfig(slaRes.data);
      }

      const metricsRes = await axios.get(`${API_BASE}/api/auth/officer-metrics`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setOfficerMetrics(metricsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/departments`, { departmentName: newDeptName }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewDeptName('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to make this user a ${newRole}?`)) return;
    try {
      await axios.put(`${API_BASE}/api/auth/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  const triggerSlaCheck = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/complaints/check-sla`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSLA = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/complaints/slaconfig`, slaConfig, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('SLA Configuration updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update SLA configuration');
    }
  };

  const exportToCSV = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/complaints/export`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    }
  };

  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" /> System Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Master overview and control panel.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 border-gray-300">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={triggerSlaCheck} className="btn-secondary text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800">
            Run SLA Script
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('overview')} className={`pb-2 font-bold transition-colors ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>System Overview</button>
        <button onClick={() => setActiveTab('officers')} className={`pb-2 font-bold transition-colors ${activeTab === 'officers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Officer Performance</button>
        <button onClick={() => setActiveTab('calendar')} className={`pb-2 font-bold transition-colors ${activeTab === 'calendar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>SLA Calendar</button>
        <button onClick={() => setActiveTab('departments')} className={`pb-2 font-bold transition-colors ${activeTab === 'departments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Departments</button>
        <button onClick={() => setActiveTab('users')} className={`pb-2 font-bold transition-colors ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>User Management</button>
        <button onClick={() => setActiveTab('sla')} className={`pb-2 font-bold transition-colors ${activeTab === 'sla' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>System Settings</button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card flex items-center p-6 gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400"><FolderOpen className="w-8 h-8"/></div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Total Complaints</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
            <div className="card flex items-center p-6 gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-400"><CheckCircle className="w-8 h-8"/></div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Resolved</p>
                <p className="text-3xl font-bold">{stats.resolved}</p>
              </div>
            </div>
            <div className="card flex items-center p-6 gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-600 dark:text-yellow-400"><Clock className="w-8 h-8"/></div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">In Progress</p>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
            <div className="card flex items-center p-6 gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-400"><AlertOctagon className="w-8 h-8"/></div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Escalated</p>
                <p className="text-3xl font-bold">{stats.escalated}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Complaints by Category</h2>
              <div className="space-y-4">
                {stats.categories.map(cat => (
                  <div key={cat._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{cat._id}</span>
                      <span className="text-gray-500">{cat.count} ({getPercentage(cat.count, stats.total)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${getPercentage(cat.count, stats.total)}%` }}></div>
                    </div>
                  </div>
                ))}
                {stats.categories.length === 0 && <p className="text-gray-500 text-sm">No data available.</p>}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-6">Complaints by Priority</h2>
              <div className="space-y-4">
                {stats.priorities.map(p => {
                  const colors = {
                    'High': 'bg-red-500',
                    'Medium': 'bg-yellow-500',
                    'Low': 'bg-green-500'
                  };
                  return (
                    <div key={p._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{p._id || 'Unknown'} Priority</span>
                        <span className="text-gray-500">{p.count} ({getPercentage(p.count, stats.total)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`${colors[p._id] || 'bg-gray-500'} h-2.5 rounded-full`} style={{ width: `${getPercentage(p.count, stats.total)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {stats.priorities.length === 0 && <p className="text-gray-500 text-sm">No data available.</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'officers' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" /> Officer Performance Metrics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3 px-4 font-semibold">Officer Name</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold text-center">Resolved</th>
                  <th className="py-3 px-4 font-semibold text-center">Escalated</th>
                  <th className="py-3 px-4 font-semibold text-center">Avg Res Time</th>
                  <th className="py-3 px-4 font-semibold text-center">Citizen Rating</th>
                  <th className="py-3 px-4 font-semibold text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {officerMetrics.map(m => (
                  <tr key={m._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50">
                    <td className="py-4 px-4 font-medium">{m.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{m.department?.departmentName || 'General'}</td>
                    <td className="py-4 px-4 text-center text-green-600 font-bold">{m.resolvedCount}</td>
                    <td className="py-4 px-4 text-center text-red-600 font-bold">{m.escalatedCount}</td>
                    <td className="py-4 px-4 text-center text-sm">{m.avgResolutionDays} days</td>
                    <td className="py-4 px-4 text-center">
                      {m.avgRating ? (
                        <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold">
                          <Star className="w-3 h-3 fill-yellow-600" /> {m.avgRating}
                        </div>
                      ) : '--'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-block w-12 h-12 rounded-full border-4 border-blue-100 dark:border-blue-900 flex items-center justify-center text-xs font-bold text-blue-600">
                        {m.performanceScore}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <CalendarView />
      )}

      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-600" /> Department Management
            </h2>
            <form onSubmit={handleCreateDept} className="flex gap-2 mb-6">
              <input 
                type="text" 
                className="input-field" 
                placeholder="New Department Name" 
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">Create Dept</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                  <p className="font-bold">{dept.departmentName}</p>
                  <p className="text-xs text-gray-500 mt-1">{dept.issueTypes?.length || 0} Issue Categories</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" /> Geographic Incidents Data
            </h2>
            <p className="text-sm text-gray-500 mb-6">Live coordinates of all active and past complaints.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Incident</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Category</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Latitude</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Longitude</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Map Link</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.mappedComplaints && stats.mappedComplaints.length > 0 ? (
                    stats.mappedComplaints.map(c => (
                      <tr key={c._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-medium">{c.title}</td>
                        <td className="py-3 px-4 text-sm">{c.issueType}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-500">{c.location?.lat.toFixed(5)}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-500">{c.location?.lng.toFixed(5)}</td>
                        <td className="py-3 px-4">
                          <a 
                            href={`https://www.google.com/maps?q=${c.location?.lat},${c.location?.lng}`} 
                            target="_blank" rel="noreferrer"
                            className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                          >
                            Google Maps
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No geo-tagged complaints found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> User Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Current Role</th>
                  <th className="py-3 px-4 font-semibold text-center">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="py-4 px-4 font-medium">{u.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'officer' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'worker' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <select 
                          className="text-sm border rounded p-1"
                          value={u.role}
                          onChange={(e) => updateUserRole(u._id, e.target.value)}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="worker">Worker</option>
                          <option value="officer">Officer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="card max-w-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Service Level Agreement (SLA) Settings
          </h2>
          <form onSubmit={handleUpdateSLA} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">High Priority Resoluton (Hours)</label>
              <input type="number" className="input-field" value={slaConfig.highPriorityHours} onChange={e => setSlaConfig({...slaConfig, highPriorityHours: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medium Priority Resoluton (Hours)</label>
              <input type="number" className="input-field" value={slaConfig.mediumPriorityHours} onChange={e => setSlaConfig({...slaConfig, mediumPriorityHours: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Priority Resoluton (Hours)</label>
              <input type="number" className="input-field" value={slaConfig.lowPriorityHours} onChange={e => setSlaConfig({...slaConfig, lowPriorityHours: Number(e.target.value)})} />
            </div>
            <button type="submit" className="btn-primary mt-4">Save SLA Settings</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
