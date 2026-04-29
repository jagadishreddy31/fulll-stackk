import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Clock } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
        Smart Complaint Escalation System
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
        Empowering citizens to report civic issues seamlessly. Track status in real-time, ensure accountability with SLA monitoring, and experience transparent governance.
      </p>
      
      <div className="flex gap-4 mb-20 flex-wrap justify-center">
        <Link to="/register" className="btn-primary text-lg px-8 py-3">Report an Issue</Link>
        <Link to="/login/citizen" className="btn-secondary text-lg px-6 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">Citizen Login</Link>
        <Link to="/login/worker" className="btn-secondary text-lg px-6 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">Worker Login</Link>
        <Link to="/login/officer" className="btn-secondary text-lg px-6 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">Officer Login</Link>
        <Link to="/login/admin" className="btn-secondary text-lg px-6 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">Admin Login</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="card text-left flex flex-col items-start hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
          <p className="text-gray-600 dark:text-gray-400">Monitor the progress of your complaint from submission to resolution.</p>
        </div>
        <div className="card text-left flex flex-col items-start hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">SLA Monitoring</h3>
          <p className="text-gray-600 dark:text-gray-400">Time-bound resolution. Automatic escalation if deadlines are breached.</p>
        </div>
        <div className="card text-left flex flex-col items-start hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Transparent Governance</h3>
          <p className="text-gray-600 dark:text-gray-400">Public dashboards ensure accountability across all municipal departments.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
