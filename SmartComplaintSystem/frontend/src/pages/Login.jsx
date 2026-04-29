import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import API_BASE from '../api';
import { useTranslation } from 'react-i18next';

const Login = ({ expectedRole }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { generateCaptcha(); }, []);

  const generateCaptcha = () => {
    setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1 });
    setCaptchaInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(captchaInput) !== (captcha.num1 + captcha.num2)) {
      setError('Incorrect CAPTCHA answer. Please try again.');
      generateCaptcha();
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      if (res.data.role !== expectedRole) {
        setError(`${t('auth.accessDenied')} ${expectedRole}s ${t('auth.only')}.`);
        return;
      }
      setError('');
      setSuccess(t('auth.loginSuccess'));
      setTimeout(() => { login(res.data); navigate('/dashboard'); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">{expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)} {t('auth.signIn')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Please enter your details to sign in.</p>
        </div>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm text-center font-medium">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')} <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')} <span className="text-red-500">*</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('auth.captchaLabel')} <strong>{captcha.num1} + {captcha.num2}</strong>? <span className="text-red-500">*</span>
            </label>
            <input type="number" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required className="input-field" placeholder={t('auth.captchaPlaceholder')} />
          </div>
          <button type="submit" className="btn-primary w-full py-3">{t('auth.signIn')}</button>
        </form>
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.noAccount')} <Link to="/register" className="text-blue-600 hover:underline">{t('auth.registerHere')}</Link>
          </p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">{t('auth.forgotPassword')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
