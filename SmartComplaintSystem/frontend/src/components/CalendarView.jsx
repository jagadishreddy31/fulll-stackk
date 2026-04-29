import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE from '../api';
import { ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const CalendarView = () => {
  const { user } = useContext(AuthContext);
  const [calData, setCalData] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = async (y, m) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/complaints/calendar?year=${y}&month=${m}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCalData(res.data.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(year, month); }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); setSelectedDay(null); };
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const getDayColor = (day) => {
    const complaints = calData[day] || [];
    if (complaints.length === 0) return '';
    const hasEscalated = complaints.some(c => c.status === 'Escalated');
    const dayDate = new Date(year, month - 1, day);
    const isOverdue = dayDate < today;
    if (hasEscalated || isOverdue) return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    const isToday = dayDate.toDateString() === today.toDateString();
    if (isToday) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
  };

  const statusIcon = (status) => {
    if (status === 'Resolved') return <CheckCircle className="w-3 h-3 text-green-500 inline mr-1" />;
    if (status === 'Escalated') return <AlertCircle className="w-3 h-3 text-red-500 inline mr-1" />;
    return <Clock className="w-3 h-3 text-blue-500 inline mr-1" />;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">📅 Complaint Calendar — SLA Deadlines</h2>
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-lg min-w-[140px] text-center">{monthNames[month - 1]} {year}</span>
          <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 border border-red-400 inline-block"></span>Overdue/Escalated</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200 border border-orange-400 inline-block"></span>Due Today</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 border border-blue-400 inline-block"></span>Upcoming</span>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading calendar...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const complaints = calData[day] || [];
            const isToday = new Date(year, month - 1, day).toDateString() === today.toDateString();
            const colorClass = getDayColor(day);
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                className={`min-h-[60px] p-1.5 rounded-lg border cursor-pointer transition-all
                  ${colorClass || 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  ${isToday && !colorClass ? 'ring-2 ring-blue-400' : ''}
                  ${selectedDay === day ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
                {complaints.slice(0, 2).map((c, idx) => (
                  <div key={idx} className="text-[9px] leading-tight text-gray-700 dark:text-gray-300 truncate">
                    {statusIcon(c.status)}{c.title}
                  </div>
                ))}
                {complaints.length > 2 && (
                  <div className="text-[9px] text-blue-600 font-bold">+{complaints.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Day Detail */}
      {selectedDay && calData[selectedDay] && calData[selectedDay].length > 0 && (
        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <h3 className="font-bold mb-3 text-blue-600">
            📋 {monthNames[month - 1]} {selectedDay} — {calData[selectedDay].length} complaint(s) due
          </h3>
          <div className="space-y-2">
            {calData[selectedDay].map((c, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
                <div>
                  <span className="font-medium text-sm">{c.title}</span>
                  <span className="ml-2 text-xs text-gray-500">{c.issueType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    c.priority === 'High' ? 'bg-red-100 text-red-700' :
                    c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>{c.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    c.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    c.status === 'Escalated' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
