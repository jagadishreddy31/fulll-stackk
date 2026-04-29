import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import API_BASE from '../api';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <KeyRound className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">{t('forgot.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('forgot.subtitle')}</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        {sent ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-semibold">✅ OTP Sent!</p>
              <p className="text-sm mt-1">{message}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Check your inbox for <strong>{email}</strong> and enter the OTP on the next page.
            </p>
            <Link
              to={`/verify-otp?email=${encodeURIComponent(email)}`}
              className="btn-primary w-full py-3 text-center block"
            >
              Enter OTP →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                <Mail className="w-4 h-4 inline mr-1" />{t('forgot.emailLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? t('forgot.sending') : t('forgot.sendOtp')}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('forgot.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
