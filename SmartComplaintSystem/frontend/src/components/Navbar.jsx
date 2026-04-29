import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../api';
import { AuthContext } from '../context/AuthContext';
import { Moon, Sun, Menu, X, ShieldAlert, Bell, Languages } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'te', label: 'తె', name: 'Telugu' },
    { code: 'hi', label: 'हि', name: 'Hindi' },
  ];
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const switchLanguage = (code) => { i18n.changeLanguage(code); setShowLangMenu(false); };

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (user && user.role === 'citizen') {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put(`${API_BASE}/api/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate('/');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-xl gap-2">
              <ShieldAlert className="w-8 h-8" />
              <span>CivicConnect</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link to="/community" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">{t('nav.community')}</Link>
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold"
                title="Change Language"
              >
                <Languages className="w-4 h-4" />
                <span>{currentLang.label}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${
                        i18n.language === lang.code ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="font-bold w-5">{lang.label}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {user && user.role === 'citizen' && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadCount > 0) markAsRead();
                  }} 
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-100 dark:border-gray-700"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 font-bold">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} className={`px-4 py-3 text-sm border-b border-gray-50 dark:border-gray-700 ${!n.isRead ? 'bg-blue-50 dark:bg-gray-700' : ''}`}>
                            <p className="text-gray-800 dark:text-gray-200">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">{t('nav.dashboard')}</Link>
                <button onClick={handleLogout} className="btn-secondary">{t('nav.logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary">{t('nav.register')}</Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-200">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={toggleTheme} className="w-full text-left block px-3 py-2 text-gray-700 dark:text-gray-200">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-gray-700 dark:text-gray-200">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 dark:text-red-400 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 text-gray-700 dark:text-gray-200">Login</Link>
              <Link to="/register" className="block px-3 py-2 text-blue-600 dark:text-blue-400 font-medium">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
