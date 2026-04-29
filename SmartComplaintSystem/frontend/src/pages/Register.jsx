import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import API_BASE from '../api';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'citizen' });
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (formData.password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (Number(captchaInput) !== (captcha.num1 + captcha.num2)) { setError('Incorrect CAPTCHA answer.'); generateCaptcha(); return; }

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, formData);
      setError('');
      setSuccess(t('auth.registerSuccess'));
      setTimeout(() => { login(res.data); navigate('/dashboard'); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join to report and track civic issues.</p>
        </div>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm text-center font-medium">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.fullName')} <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')} <span className="text-red-500">*</span></label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="input-field" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('auth.phone')} <span className="text-xs text-gray-400">(for OTP password reset)</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              placeholder="+91 98765 43210"
              pattern="[0-9+\-\s]{7,15}"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')} <span className="text-red-500">*</span></label>
            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required className="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')} <span className="text-red-500">*</span></label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.role')} <span className="text-red-500">*</span></label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="input-field">
              <option value="citizen">{t('auth.citizen')}</option>
              <option value="worker">{t('auth.worker')}</option>
              <option value="officer">{t('auth.officer')}</option>
              <option value="admin">{t('auth.admin')}</option>
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('auth.captchaLabel')} <strong>{captcha.num1} + {captcha.num2}</strong>? <span className="text-red-500">*</span>
            </label>
            <input type="number" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required className="input-field" placeholder={t('auth.captchaPlaceholder')} />
          </div>
          <button type="submit" className="btn-primary w-full py-3">{t('auth.register')}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          {t('auth.haveAccount')} <Link to="/login" className="text-blue-600 hover:underline">{t('auth.signInHere')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
